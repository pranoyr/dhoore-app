import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import RegistrationScreen from './screens/RegistrationScreen';
import OTPScreen from './screens/OTPScreen';
import Dashboard from './screens/Dashboard';
import ChatScreen from './screens/ChatScreen';
import UserAndVehicleDetailsScreen from './screens/userDetailsScreen';
import PersonChatScreen from './screens/PersonChatScreen';
import { AppProvider } from './screens/AppProvider'; // Adjust the path

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Failed to load token from storage', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <AppProvider> 
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "Dashboard" : "Registration"}>
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} options={{ headerLeft: () => null }} />
        <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
        <Stack.Screen name="UserAndVehicleDetails" component={UserAndVehicleDetailsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="PersonChatScreen" component={PersonChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});