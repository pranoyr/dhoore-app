import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import { initWebSocket } from '../apis/websocket'; // Adjust the path to your WebSocket utility


import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from './AppProvider'; // adjust path if needed
import { Ionicons } from '@expo/vector-icons'; // if you want an arrow icon, etc.

export default function OTPScreen({ route, navigation }) {
  const { phoneNumber } = route.params;
  const { setUserId, setUserName, url } = useAppContext();

  // We'll store each of the 6 digits in an array of length 6
  const [digits, setDigits] = useState(['', '', '', '', '', '']);

  // We’ll also track a countdown timer (e.g. 30 seconds)
  const [timer, setTimer] = useState(30);

  // Refs to each TextInput so we can focus the next one automatically
  const inputRefs = useRef([]);

  // Start a simple countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Combine all 6 digits into one string to send to the server
  const otp = digits.join('');

  const handleVerify = async () => {
    try {
      const response = await axios.post(url + '/api/verify-otp', {
        phone: phoneNumber,
        otp,
      });

      const { token, refreshToken } = response.data;

      // call api to check if user exists
      const response1 = await axios.post(url + '/api/check-user', {
        phone: phoneNumber,
      });
      const { isNewUser, userId, name } = response1.data;


       initWebSocket(response.user_id); // Initialize WebSocket once globally

      

      if (token && refreshToken) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('refreshToken', refreshToken);

        if (isNewUser) {
          navigation.navigate('UserAndVehicleDetails');
        } else {
          setUserId(userId);
          setUserName(name);
          navigation.navigate('Dashboard');
        }
      } else {
        console.error('Token or refresh token is null/undefined');
        Alert.alert('Error', 'Failed to receive tokens, please try again');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Invalid OTP, please try again');
    }
  };

  // When user types in a digit box
  const handleDigitChange = (text, index) => {
    // Only allow 0-1 characters in each box
    if (text.length > 1) return;

    const newDigits = [...digits];
    newDigits[index] = text;
    setDigits(newDigits);

    // Automatically move focus to the next field if user typed something
    if (text && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
    // If user clears the digit (backspace), optionally move to previous
    // else if (!text && index > 0) {
    //   inputRefs.current[index - 1].focus();
    // }

    // Check if all 6 digits are filled
    if (newDigits.join('').length === 6) {
      Keyboard.dismiss();
    }
  };

  const handleBackToPhone = () => {
    // If you want to let user “change number,” navigate back or to a screen
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Verify your number</Text>
      <Text style={styles.subtitle}>
        Enter the code we’ve sent by text to {phoneNumber}.
      </Text>

      {/* "Change number" link */}
      <TouchableOpacity onPress={handleBackToPhone}>
        <Text style={styles.changeNumberText}>Change number</Text>
      </TouchableOpacity>

      <View style={styles.otpContainer}>
        <Text style={styles.codeLabel}>Code</Text>
        <View style={styles.digitsRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.digitInput}
              keyboardType="numeric"
              maxLength={1}
              onChangeText={(text) => handleDigitChange(text, index)}
              value={digit}
              textAlign="center"
            />
          ))}
        </View>
      </View>

      <Text style={styles.timerText}>
        {timer > 0
          ? `This code should arrive within ${timer}s`
          : 'If you didn’t receive the code, please resend'}
      </Text>

      {/* Next arrow / verify button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleVerify}>
        <Ionicons name="arrow-forward" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    paddingVertical: 10,
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  changeNumberText: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 30,
  },
  otpContainer: {
    marginBottom: 30,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  digitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  digitInput: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    fontSize: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 30,
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#000',
    borderRadius: 50,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
