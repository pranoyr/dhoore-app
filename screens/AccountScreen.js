
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Button, Provider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function AccountScreen({ route, navigation }) {
  
    const handleLogout = async () => {
      try {
        await AsyncStorage.clear();
        navigation.replace('Registration'); // Navigate to registration screen after logout
      } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
        // Handle error as needed
      }
    };
  
    return (
      <View style={styles.accountContainer}>
        <Button mode="contained" onPress={handleLogout} style={styles.logoutButton}>
          Logout
        </Button>
      </View>
    );
  };

const styles = StyleSheet.create({
  accountContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: 20,
  },
});
  
  