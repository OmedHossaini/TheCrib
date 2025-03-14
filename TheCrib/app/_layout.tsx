import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react-native';
import config from '../src/aws-exports';

// Configure Amplify
Amplify.configure(config);

// Import screens
import HomeScreen from '../src/screens/HomeScreen';
import SplitEaseScreen from '../src/screens/SplitEaseScreen';
import AddExpenseScreen from '../src/screens/AddExpenseScreen';
import ExpenseDetailsScreen from '../src/screens/ExpenseDetailsScreen';
import ScanReceiptScreen from '../src/screens/ScanReceiptScreen';

// Create navigation stack
const Stack = createStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'TheCrib' }} />
          <Stack.Screen name="SplitEase" component={SplitEaseScreen} options={{ title: 'SplitEase' }} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Add Expense' }} />
          <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} options={{ title: 'Expense Details' }} />
          <Stack.Screen name="ScanReceipt" component={ScanReceiptScreen} options={{ title: 'Scan Receipt' }} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

// Wrap the app with the Authenticator
export default withAuthenticator(App);