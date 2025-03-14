import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { API, graphqlOperation, Storage, Auth } from 'aws-amplify';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getExpense, listExpenseParticipants, listReceipts } from '../graphql/queries';
import { updateExpenseParticipant, deleteExpense } from '../graphql/mutations';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const ExpenseDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { expense: initialExpense } = route.params;
  
  const [expense, setExpense] = useState(initialExpense);
  const [participants, setParticipants] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [receiptImage, setReceiptImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchExpenseDetails();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const userInfo = await Auth.currentAuthenticatedUser();
      setCurrentUser(userInfo);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      
      // Get updated expense data
      const expenseData = await API.graphql(
        graphqlOperation(getExpense, { id: initialExpense.id })
      );
      setExpense(expenseData.data.getExpense);
      
      // Get participants
      const participantsData = await API.graphql(
        graphqlOperation(listExpenseParticipants, { 
          filter: { expenseId: { eq: initialExpense.id } } 
        })
      );
      setParticipants(participantsData.data.listExpenseParticipants.items);
      
      // Get receipt if one exists
      const receiptsData = await API.graphql(
        graphqlOperation(listReceipts, { 
          filter: { expenseId: { eq: initialExpense.id } } 
        })
      );
      
      const receipts = receiptsData.data.listReceipts.items;
      if (receipts.length > 0) {
        setReceipt(receipts[0]);
        
        // Get receipt image
        if (receipts[0].imageUrl) {
          const imageUrl = await Storage.get(receipts[0].imageUrl);
          setReceiptImage(imageUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching expense details:', error);
      Alert.alert('Error', 'Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (participantId, currentPaidStatus) => {
    try {
      await API.graphql(
        graphqlOperation(updateExpenseParticipant, {
          input: {
            id: participantId,
            paid: !currentPaidStatus,
            dateSettled: !currentPaidStatus ? new Date().toISOString() : null
          }
        })
      );
      
      // Update local state
      setParticipants(participants.map(p => 
        p.id === participantId 
          ? { ...p, paid: !p.paid, dateSettled: !p.paid ? new Date().toISOString() : null } 
          : p
      ));
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Failed to update payment status');
    }
  };

  const handleDeleteExpense = async () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await API.graphql(
                graphqlOperation(deleteExpense, { input: { id: expense.id } })
              );
              
              Alert.alert(
                'Success',
                'Expense deleted successfully',
                [{ text: 'OK', onPress: () => navigation.navigate('SplitEase') }]
              );
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'Failed to delete expense');
            }
          } 
        }
      ]
    );
  };

  const formatCurrency = (amount) => {
    return '$' + amount.toFixed(2);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading expense details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with main expense details */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.expenseTitle}>{expense.title}</Text>
          <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
          <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
          
          {expense.isRecurring && (
            <View style={styles.recurringBadge}>
              <Text style={styles.recurringText}>
                Recurring ({expense.recurringFrequency.toLowerCase()})
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Paid by section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paid By</Text>
        <Text style={styles.paidByText}>
          {expense.paidByUser?.username === currentUser?.username 
            ? 'You' 
            : expense.paidByUser?.username}
        </Text>
      </View>
      
      {/* Split details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Split Details</Text>
        <Text style={styles.splitTypeText}>
          Split type: {expense.splitType.charAt(0) + expense.splitType.slice(1).toLowerCase()}
        </Text>
        
        <View style={styles.participantsContainer}>
          {participants.map((participant) => (
            <View key={participant.id} style={styles.participantItem}>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>
                  {participant.user?.username === currentUser?.username 
                    ? 'You' 
                    : participant.user?.username}
                </Text>
                <Text style={styles.participantAmount}>
                  {formatCurrency(participant.amount)}
                </Text>
              </View>
              
              {expense.paidBy === currentUser?.attributes?.sub && 
               participant.userId !== currentUser?.attributes?.sub && (
                <TouchableOpacity 
                  style={[
                    styles.paidButton, 
                    participant.paid ? styles.paidButtonActive : styles.paidButtonInactive
                  ]}
                  onPress={() => handleMarkAsPaid(participant.id, participant.paid)}
                >
                  <Text style={styles.paidButtonText}>
                    {participant.paid ? 'Paid' : 'Mark Paid'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {participant.userId === currentUser?.attributes?.sub && 
               expense.paidBy !== currentUser?.attributes?.sub && (
                <View style={[
                  styles.paidIndicator, 
                  participant.paid ? styles.paidIndicatorActive : styles.paidIndicatorInactive
                ]}>
                  <Text style={styles.paidIndicatorText}>
                    {participant.paid ? 'Paid' : 'Unpaid'}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        export default ExpenseDetailsScreen;