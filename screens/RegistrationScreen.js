import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function RegistrationScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleRegister = async () => {
    if (phoneNumber.length === 12) {
      try {
        const response = await axios.post('http://localhost:3000/api/send-otp', {
          phone: phoneNumber
        });
        if (response.data.message === 'OTP sent') {
          navigation.navigate('OTP', { phoneNumber });
        } else {
          Alert.alert('Error', 'Failed to send OTP. Please try again.');
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        Alert.alert('Error', 'Failed to send OTP. Please try again.');
      }
    } else {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Registration</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter 10-digit phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <Button title="Register" onPress={handleRegister} />
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});
