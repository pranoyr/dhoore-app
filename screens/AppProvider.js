import React, { createContext, useContext, useState, useEffect } from 'react';
import {apiRequest, BASE_URL} from '../apis/api'; // Adjust the path to your API utility
import AsyncStorage from '@react-native-async-storage/async-storage';





// Create the context
export const AppContext = createContext();

// Context provider
export const AppProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [url , setUrl] = useState(BASE_URL);

  // Fetch user details from the database
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Token:', token);
        if (token) {
            const response = await apiRequest('/api/user-details', 'GET'); // Adjust the endpoint
        if (response) {
          setUserId(response.user_id); // Assuming `id` is the user ID field
          setUserName(response.name); // Assuming `name` is the user name field
        }
        else
        {
          setUserId(null);
          setUserName('');
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
    url,
    setUrl,
  };

  console.log('AppProvider value:', value);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use the context
export const useAppContext = () => useContext(AppContext);
