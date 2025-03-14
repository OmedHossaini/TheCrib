import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { useNavigation } from '@react-navigation/native';
import { listExpenses } from '../graphql/queries';
import { onCreateExpense } from '../graphql/subscriptions';

const SplitEaseScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  
  useEffect(() => {
    fetchExpenses();
    
    // Subscribe to new expenses
    const subscription = API.graphql(graphqlOperation(onCreateExpense)).subscribe({
      next: ({ value }) => {
        const newExpense = value.data.onCreateExpense;
        setExpenses(currentExpenses => [newExpense, ...currentExpenses]);
      },
      error: error => console.warn('Subscription error:', error),
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const expenseData = await API.graphql(graphqlOperation(listExpenses));
      const expenseList = expenseData.data.listExpenses.items;
      // Sort by date, newest first
      const sortedExpenses = expenseList.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setExpenses(sortedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount) => {
    return '$' + amount.toFixed(2);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const renderExpenseItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.expenseItem}
      onPress={() => navigation.navigate('ExpenseDetails', { expense: item })}
    >
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
      </View>
      
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
        <Text style={styles.expensePaidBy}>
          Paid by: {item.paidByUser?.username || 'You'}
        </Text>
      </View>
      
      {item.isRecurring && (
        <View style={styles.recurringBadge}>
          <Text style={styles.recurringText}>Recurring</Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
      ) : expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the "+" button to add your first expense
          </Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderExpenseItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchExpenses}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  expenseItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
  },
  expensePaidBy: {
    fontSize: 14,
    color: '#666',
  },
  recurringBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  recurringText: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});

export default SplitEaseScreen;