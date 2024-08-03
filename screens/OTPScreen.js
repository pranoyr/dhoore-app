// screens/OTPScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OTPScreen({ route, navigation }) {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');

  const handleVerify = async () => {
    try {
      const response = await axios.post('http://localhost:3000/api/verify-otp', { phone: phoneNumber, otp });
      const { token, refreshToken } = response.data;
      
      if (token && refreshToken) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        navigation.navigate('UserAndVehicleDetails');
      } else {
        console.error('Token or refresh token is null or undefined');
        Alert.alert('Error', 'Failed to receive tokens, please try again');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Invalid OTP, please try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>Phone Number: {phoneNumber}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
      />
      <Button title="Verify" onPress={handleVerify} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});
