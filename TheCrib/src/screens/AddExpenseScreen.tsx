import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { API, graphqlOperation, Auth, Storage } from 'aws-amplify';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createExpense, createExpenseParticipant, createReceipt } from '../graphql/mutations';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const receiptData = route.params?.receiptData;

  // User state
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(receiptData?.extractedAmount?.toString() || '');
  const [date, setDate] = useState(new Date());
  const [splitType, setSplitType] = useState('EQUAL');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('MONTHLY');
  const [notes, setNotes] = useState('');
  const [participants, setParticipants] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCurrentUser();
    // If we have receipt data from scanning, populate the form
    if (receiptData) {
      if (receiptData.extractedText) {
        const lines = receiptData.extractedText.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          setTitle(lines[0]); // Use first line as title
        }
      }
    }
  }, [receiptData]);

  const getCurrentUser = async () => {
    try {
      const userInfo = await Auth.currentAuthenticatedUser();
      setCurrentUser(userInfo);
      // Initialize self as a participant
      setParticipants([
        {
          id: userInfo.attributes.sub,
          username: userInfo.username,
          amount: 0,
          paid: true
        }
      ]);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the expense');
      return false;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }
    
    if (participants.length === 0) {
      Alert.alert('Error', 'At least one participant is required');
      return false;
    }
    
    return true;
  };

  const calculateShares = () => {
    const amountValue = parseFloat(amount);
    const updatedParticipants = [...participants];
    
    if (splitType === 'EQUAL') {
      const shareAmount = amountValue / participants.length;
      return updatedParticipants.map(p => ({
        ...p,
        amount: shareAmount
      }));
    }
    
    return updatedParticipants;
  };

  const saveExpense = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const amountValue = parseFloat(amount);
      const participantsWithShares = calculateShares();
      
      // Create the expense
      const expenseInput = {
        title,
        amount: amountValue,
        date: date.toISOString(),
        splitType,
        paidBy: currentUser.attributes.sub,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : null,
        notes: notes.trim() || null
      };
      
      const expenseResponse = await API.graphql(
        graphqlOperation(createExpense, { input: expenseInput })
      );
      
      const newExpenseId = expenseResponse.data.createExpense.id;
      
      // Create expense participants
      const participantPromises = participantsWithShares.map(participant => {
        const participantInput = {
          userId: participant.id,
          expenseId: newExpenseId,
          amount: participant.amount,
          paid: participant.paid
        };
        
        return API.graphql(
          graphqlOperation(createExpenseParticipant, { input: participantInput })
        );
      });
      
      await Promise.all(participantPromises);
      
      // Create receipt record if we have scanned data
      if (receiptData && receiptData.imageUri) {
        // Upload the receipt image to S3
        const imageUri = receiptData.imageUri;
        const imageName = `receipts/${newExpenseId}_${Date.now()}.jpg`;
        
        const response = await fetch(imageUri);
        const blob = await response.blob();
        await Storage.put(imageName, blob, {
          contentType: 'image/jpeg'
        });
        
        // Create receipt record
        const receiptInput = {
          expenseId: newExpenseId,
          imageUrl: imageName,
          extractedText: receiptData.extractedText || null,
          extractedAmount: receiptData.extractedAmount || null,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.attributes.sub
        };
        
        await API.graphql(
          graphqlOperation(createReceipt, { input: receiptInput })
        );
      }
      
      Alert.alert(
        'Success',
        'Expense created successfully',
        [{ text: 'OK', onPress: () => navigation.navigate('SplitEase') }]
      );
    } catch (error) {
      console.error('Error creating expense:', error);
      Alert.alert('Error', 'Failed to create expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What's this expense for?"
        />
        
        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
        
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{formatDate(date)}</Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        
        <Text style={styles.label}>Split Type</Text>
        <Picker
          selectedValue={splitType}
          onValueChange={(itemValue) => setSplitType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Equal" value="EQUAL" />
          <Picker.Item label="Custom Amounts" value="CUSTOM" />
          <Picker.Item label="Percentage" value="PERCENTAGE" />
          <Picker.Item label="Shares" value="SHARES" />
        </Picker>
        
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Recurring expense?</Text>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isRecurring ? '#0066cc' : '#f4f3f4'}
          />
        </View>
        
        {isRecurring && (
          <>
            <Text style={styles.label}>Frequency</Text>
            <Picker
              selectedValue={recurringFrequency}
              onValueChange={(itemValue) => setRecurringFrequency(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Daily" value="DAILY" />
              <Picker.Item label="Weekly" value="WEEKLY" />
              <Picker.Item label="Monthly" value="MONTHLY" />
              <Picker.Item label="Yearly" value="YEARLY" />
            </Picker>
          </>
        )}
        
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes here..."
          multiline
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={() => navigation.navigate('ScanReceipt')}
          >
            <Text style={styles.scanButtonText}>Scan Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveExpense}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Expense</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  currencySymbol: {
    fontSize: 16,
    paddingLeft: 12,
    color: '#333',
  },
  amountInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  datePickerButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    padding: 15,
    flex: 0.48,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 15,
    flex: 0.48,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddExpenseScreen;