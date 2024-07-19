import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const baseURL = 'http://localhost:3000'; // Replace with your server base URL

const api = axios.create({
  baseURL,
  timeout: 10000, // Timeout after 10 seconds
});

// Function to save tokens to AsyncStorage
export const saveTokens = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    setAuthToken(accessToken);
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
};

// Function to fetch access token from AsyncStorage
export const getAccessToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
};

// Function to fetch refresh token from AsyncStorage
export const getRefreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    return refreshToken;
  } catch (error) {
    console.error('Error fetching refresh token:', error);
    throw error;
  }
};

// Function to remove tokens from AsyncStorage
export const removeTokens = async () => {
  try {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Error removing tokens:', error);
    throw error;
  }
};

// Function to set Authorization header with Bearer token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
