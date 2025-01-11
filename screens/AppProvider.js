import React, { createContext, useContext, useState, useEffect } from 'react';
import {apiRequest, BASE_URL} from '../apis/api'; // Adjust the path to your API utility
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initWebSocket } from '../apis/websocket'; // Adjust the path to your WebSocket utility





// Create the context
export const AppContext = createContext();

// Context provider
export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [UserVehicleType, setUserVehicleType] = useState('');
  const [UserVehicleMoldel, setUserVehicleMoldel] = useState('');
  const [UserVehicleNumber, setUserVehicleNumber] = useState('');
  const [UserVehicleRunningStatus, setUserVehicleRunningStatus] = useState('');

  const [url , setUrl] = useState(BASE_URL);

  // Fetch user details from the database
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token:', token);
        if (token) {
            const response = await apiRequest('/api/user-details', 'GET'); // Adjust the endpoint
            console.log("user details",response);
        if (response) {
          initWebSocket(response.user_id); // Initialize WebSocket once globally
          setUserId(response.user_id); // Assuming `id` is the user ID field
          setUserName(response.name); // Assuming `name` is the user name field
          setUserVehicleType(response.vehicleType);
          setUserVehicleMoldel(response.model);
          setUserVehicleNumber(response.licensePlate);
          setUserVehicleRunningStatus(response.vehicle_status);
        }
        else
        {
          setUserId(null);
          setUserName('');
          setUserVehicleType('');
          setUserVehicleMoldel('');
          setUserVehicleNumber('');
          setUserVehicleRunningStatus('');
        }


      }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  console.log('userId:', userId);

  const value = {
    userId,
    setUserId,
    userName,
    setUserName,
    UserVehicleType,
    setUserVehicleType,
    UserVehicleMoldel,
    setUserVehicleMoldel,
    UserVehicleNumber,
    setUserVehicleNumber,
    UserVehicleRunningStatus,
    setUserVehicleRunningStatus,
    url,
    setUrl,
  };

  console.log('AppProvider value:', value);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use the context
export const useAppContext = () => useContext(AppContext);
