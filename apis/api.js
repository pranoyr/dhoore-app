import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:3000';

// Function to refresh token
const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('token');
    console.log(refreshToken)
    // if (!refreshToken) {
    //   console.error('No refresh token available');
    //   throw new Error('No refresh token available');
    // }

    console.log('Attempting to refresh token with:', refreshToken); // Log the refresh token being sent
    const response = await axios.post(`${BASE_URL}/api/refresh-token`, { refreshToken });
    console.log('Refresh token response:', response.data); // Log the response from the server
    const newToken = response.data.token;
    await AsyncStorage.setItem('token', newToken);
    return newToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error; // Handle error appropriately
  }
};

// Function to make authenticated API requests
const apiRequest = async (url, method = 'GET', data = null, params = null) => {
  try {
    let token = await AsyncStorage.getItem('token');
    console.log(`Making ${method} request to ${url} with token: ${token}`); // Log the request details
    const response = await axios({
      url: `${BASE_URL}${url}`,
      method,
      headers: { Authorization: `Bearer ${token}` },
      data,
      params, // Add the params here
    });

    console.log('API request successful:', response.data); // Log the successful response
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log('ERROR: Unauthorized, attempting to refresh token');
      // Token expired, attempt to refresh token
      try {
        const newToken = await refreshToken();
        console.log('Retrying API request with new token:', newToken); // Log retry attempt with new token
        const response = await axios({
          url: `${BASE_URL}${url}`,
          method,
          headers: { Authorization: `Bearer ${newToken}` },
          data,
          params, // Add the params here as well
        });
        return response.data;
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        throw refreshError; // Handle refresh token failure
      }
    } else {
      console.error('API request failed:', error);
      throw error; // Handle other errors
    }
  }
};

export default apiRequest;
