import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Auth } from 'aws-amplify';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TheCrib</Text>
      
      <View style={styles.featureContainer}>
        <TouchableOpacity 
          style={styles.featureButton}
          onPress={() => navigation.navigate('SplitEase')}
        >
          <View style={styles.featureContent}>
            <Text style={styles.featureEmoji}>🤑</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>SplitEase</Text>
              <Text style={styles.featureDescription}>Split bills, track expenses, and manage recurring payments</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Other features will be added in the future */}
        <TouchableOpacity style={[styles.featureButton, styles.disabledFeature]}>
          <View style={styles.featureContent}>
            <Text style={styles.featureEmoji}>🧹</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>CleanSweep</Text>
              <Text style={styles.featureDescription}>Coming soon!</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.featureButton, styles.disabledFeature]}>
          <View style={styles.featureContent}>
            <Text style={styles.featureEmoji}>🥑</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>PantryPal</Text>
              <Text style={styles.featureDescription}>Coming soon!</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureContainer: {
    flex: 1,
  },
  featureButton: {
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
  disabledFeature: {
    opacity: 0.6,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#dc3545',
    fontWeight: '600',
  },
});

export default HomeScreen;