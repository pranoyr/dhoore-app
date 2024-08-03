import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import apiRequest from '../apis/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserAndVehicleDetailsScreen({ route, navigation }) {
  const [userName, setUserName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [userGender, setUserGender] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showVehicleTypePicker, setShowVehicleTypePicker] = useState(false);

  const submitDetails = async () => {
    if (!userName || !userGender || !vehicleModel  || !vehicleNumber || !vehicleType) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const userLatitude = 0;
    const userLongitude = 0;

    try {
      await apiRequest('/api/save-details', 'POST', {
        userName, userLatitude, userLongitude, userGender, vehicleModel, vehicleNumber, vehicleType
      });

      Alert.alert('Success', 'Details saved successfully');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to save details');
    }

    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Details</Text>
      <Text style={styles.label}>User Name:</Text>
      <TextInput
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
        placeholder="Enter your name"
      />

      <Text style={styles.label}>User Gender:</Text>
      <TouchableOpacity onPress={() => setShowGenderPicker(true)} style={styles.pickerContainer}>
        <Text style={styles.pickerText}>
          {userGender ? (userGender === 'M' ? 'Male' : 'Female') : 'Select Gender'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Picker
              selectedValue={userGender}
              onValueChange={(itemValue) => setUserGender(itemValue)}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="M" />
              <Picker.Item label="Female" value="F" />
            </Picker>
            <Button title="Done" onPress={() => setShowGenderPicker(false)} />
          </View>
        </View>
      </Modal>

      <Text style={styles.header}>Vehicle Details</Text>
      <Text style={styles.label}>Vehicle Model:</Text>
      <TextInput
        style={styles.input}
        value={vehicleModel}
        onChangeText={setVehicleModel}
        placeholder="Enter vehicle model"
      />
{/* 
      <Text style={styles.label}>Vehicle Make:</Text>
      <TextInput
        style={styles.input}
        value={vehicleMake}
        onChangeText={setVehicleMake}
        placeholder="Enter vehicle make"
      /> */}

      <Text style={styles.label}>Vehicle Number:</Text>
      <TextInput
        style={styles.input}
        value={vehicleNumber}
        onChangeText={setVehicleNumber}
        placeholder="Enter vehicle number"
      />

      <Text style={styles.label}>Vehicle Type:</Text>
      <TouchableOpacity onPress={() => setShowVehicleTypePicker(true)} style={styles.pickerContainer}>
        <Text style={styles.pickerText}>
          {vehicleType ? vehicleType : 'Select Vehicle Type'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showVehicleTypePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVehicleTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <Picker
              selectedValue={vehicleType}
              onValueChange={(itemValue) => setVehicleType(itemValue)}
            >
              <Picker.Item label="Select Vehicle Type" value="" />
              <Picker.Item label="Car" value="Car" />
              <Picker.Item label="Bike" value="Bike" />
              <Picker.Item label="Truck" value="Truck" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
            <Button title="Done" onPress={() => setShowVehicleTypePicker(false)} />
          </View>
        </View>
      </Modal>

      <Button title="Submit" onPress={submitDetails} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  pickerText: {
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModal: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});
