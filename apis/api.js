import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';



// const ip_addr = "localhost"
const ip_addr = "16.16.68.77"


export const BASE_URL = 'http://'+ip_addr+':3000';


// Function to refresh token
const refreshToken = async () => {
  try {
    const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
      }

    const response = await axios.post(`${BASE_URL}/api/refresh-token`, { refreshToken: storedRefreshToken });

    console.log('New token:', response.data.token);

    
    const newToken = response.data.token;
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    return newToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error; // Handle error appropriately
  }
};

// Function to make authenticated API requests
export const apiRequest = async (url, method = 'GET', data = null, params = null) => {
  try {
    let token = await AsyncStorage.getItem('token');
    const response = await axios({
      url: `${BASE_URL}${url}`,
      method,
      headers: { Authorization: `Bearer ${token}` },
      data,
      params,
    });
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      try {
        const newToken = await refreshToken();
        const response = await axios({
          url: `${BASE_URL}${url}`,
          method,
          headers: { Authorization: `Bearer ${newToken}` },
          data,
          params,
        });
        return response.data;
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        throw refreshError;
      }
    } else {
      console.error('API request failed:', error);
      throw error;
    }
  }
};

 export default apiRequest
