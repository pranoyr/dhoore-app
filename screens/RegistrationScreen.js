import React, { useState } from 'react';
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
import { useAppContext } from './AppProvider';
import { Ionicons } from '@expo/vector-icons';

export default function RegistrationScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const { url } = useAppContext();

  const handleRegister = async () => {
    if (phoneNumber.length === 10) {
      try {
        const response = await axios.post(url + '/api/send-otp', {
          phone: '91'+  phoneNumber,
        });

        if (response.data.message === 'OTP sent') {
            navigation.navigate('OTP', { phoneNumber: '91' + phoneNumber });
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

  const handlePhoneNumberChange = (text) => {
    if (text.length === 10) {
      Keyboard.dismiss();
    }
    setPhoneNumber(text);
  };

  return (
    <View style={styles.container}>
      {/* Top nav (back arrow) — optional */}

      {/* Title */}
      <Text style={styles.title}>Can we get your number?</Text>

      {/* Label row (Phone) */}
      <View style={styles.formRow}>
        <Text style={styles.label}>Phone number</Text>
      </View>

      {/* Input row */}
      <View style={styles.inputRow}>
        {/* Phone input */}
        <TextInput
          style={styles.phoneInput}
          keyboardType="phone-pad"
          placeholder="Enter 10-digit number"
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          maxLength={10}
        />
      </View>

      {/* Privacy note */}
      <Text style={styles.privacyNote}>
        We never share this with anyone and it won’t be on your profile.
      </Text>

      {/* Next button with an arrow icon */}
      <TouchableOpacity style={styles.nextButton} onPress={handleRegister}>
        <Ionicons name="arrow-forward" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    paddingVertical: 10,
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  privacyNote: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
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
