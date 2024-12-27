import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import apiRequest from '../apis/api';

export default function AccountScreen({ route, navigation }) {
  const [userDetails, setUserDetails] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [tempUserDetails, setTempUserDetails] = useState(null);
  const [tempVehicleDetails, setTempVehicleDetails] = useState(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isVehicleModalVisible, setIsVehicleModalVisible] = useState(false);
  const [isGenderPickerVisible, setIsGenderPickerVisible] = useState(false);
  const [isVehicleTypePickerVisible, setIsVehicleTypePickerVisible] = useState(false);

  const fetchDetails = async () => {
    try {
      const userResponse = await apiRequest(`/api/user-details`, 'GET');
      const vehicleResponse = await apiRequest(`/api/vehicle-details`, 'GET');
      setUserDetails(userResponse);
      setVehicleDetails(vehicleResponse);
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace('Registration');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  const handleEditUser = () => {
    setTempUserDetails({ ...userDetails });
    setIsUserModalVisible(true);
  };

  const handleEditVehicle = () => {
    setTempVehicleDetails({ ...vehicleDetails });
    setIsVehicleModalVisible(true);
  };

  const handleSaveUserDetails = async () => {
    try {
      await apiRequest(`/api/update-user-details`, 'POST', tempUserDetails);
      setUserDetails(tempUserDetails);
      setIsUserModalVisible(false);
      Alert.alert('Success', 'User details updated successfully.');
    } catch (error) {
      console.error('Error updating user details:', error);
      Alert.alert('Error', 'Failed to update user details.');
    }
  };

  const handleSaveVehicleDetails = async () => {
    try {
      await apiRequest(`/api/update-vehicle-details`, 'POST', tempVehicleDetails);
      setVehicleDetails(tempVehicleDetails);
      setIsVehicleModalVisible(false);
      Alert.alert('Success', 'Vehicle details updated successfully.');
    } catch (error) {
      console.error('Error updating vehicle details:', error);
      Alert.alert('Error', 'Failed to update vehicle details.');
    }
  };

  const handleCloseUserModal = () => {
    setIsUserModalVisible(false);
    setIsGenderPickerVisible(false);
  };

  const handleCloseVehicleModal = () => {
    setIsVehicleModalVisible(false);
    setIsVehicleTypePickerVisible(false);
  };

  return (
    <View style={styles.accountContainer}>
      <Text style={styles.sectionHeader}>Personal Details</Text>
      {userDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>Name: {userDetails.name}</Text>
          <Text style={styles.detailsText}>Gender: {userDetails.gender === 'M' ? 'Male' : 'Female'}</Text>
          <TouchableOpacity onPress={handleEditUser} style={styles.editButton}>
            <Icon name="edit" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.sectionHeader}>Vehicle Details</Text>
      {vehicleDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>Model: {vehicleDetails.model}</Text>
          <Text style={styles.detailsText}>License Plate: {vehicleDetails.licensePlate}</Text>
          <Text style={styles.detailsText}>Type: {vehicleDetails.vehicleType}</Text>
          <TouchableOpacity onPress={handleEditVehicle} style={styles.editButton}>
            <Icon name="edit" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      )}
      <Button mode="contained" onPress={handleLogout} style={styles.logoutButton}>
        Logout
      </Button>

      {/* User Details Modal */}
      <Modal
        visible={isUserModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseUserModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Edit Personal Details</Text>
            <TextInput
              style={styles.input}
              value={tempUserDetails?.name}
              onChangeText={(text) => setTempUserDetails({ ...tempUserDetails, name: text })}
              placeholder="Name"
            />
            <TouchableOpacity onPress={() => setIsGenderPickerVisible(true)} style={styles.pickerTouchable}>
              <Text style={styles.pickerText}>{tempUserDetails?.gender === 'M' ? 'Male' : 'Female'}</Text>
            </TouchableOpacity>
            {isGenderPickerVisible && (
              <Picker
                selectedValue={tempUserDetails?.gender}
                onValueChange={(itemValue) => {
                  setTempUserDetails({ ...tempUserDetails, gender: itemValue });
                  setIsGenderPickerVisible(false);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Male" value="M" />
                <Picker.Item label="Female" value="F" />
              </Picker>
            )}
            <Button mode="contained" onPress={handleSaveUserDetails}>
              Save
            </Button>
            <Button mode="outlined" onPress={handleCloseUserModal} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      {/* Vehicle Details Modal */}
      <Modal
        visible={isVehicleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseVehicleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Edit Vehicle Details</Text>
            <TextInput
              style={styles.input}
              value={tempVehicleDetails?.model}
              onChangeText={(text) => setTempVehicleDetails({ ...tempVehicleDetails, model: text })}
              placeholder="Model"
            />
            <TextInput
              style={styles.input}
              value={tempVehicleDetails?.licensePlate}
              onChangeText={(text) => setTempVehicleDetails({ ...tempVehicleDetails, licensePlate: text })}
              placeholder="License Plate"
            />
            <TouchableOpacity onPress={() => setIsVehicleTypePickerVisible(true)} style={styles.pickerTouchable}>
              <Text style={styles.pickerText}>{tempVehicleDetails?.vehicleType}</Text>
            </TouchableOpacity>
            {isVehicleTypePickerVisible && (
              <Picker
                selectedValue={tempVehicleDetails?.vehicleType}
                onValueChange={(itemValue) => {
                  setTempVehicleDetails({ ...tempVehicleDetails, vehicleType: itemValue });
                  setIsVehicleTypePickerVisible(false);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Car" value="Car" />
                <Picker.Item label="Bike" value="Bike" />
              </Picker>
            )}
            <Button mode="contained" onPress={handleSaveVehicleDetails}>
              Save
            </Button>
            <Button mode="outlined" onPress={handleCloseVehicleModal} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  accountContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  detailsText: {
    fontSize: 16,
    marginBottom: 5,
  },
  editButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  logoutButton: {
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  cancelButton: {
    marginTop: 10,
  },
  pickerTouchable: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  pickerText: {
    fontSize: 16,
  },
  picker: {
    marginBottom: 15,
  },
});
