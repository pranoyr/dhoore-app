import apiRequest from '../apis/api';

const fetchUserLocation = async (token) => {
  try {
    console.log('Fetching user location with token:', token);
    const response = await apiRequest('/api/vehicles', 'GET', {
      'Authorization': `Bearer ${token}`
    });
    console.log('Response from server:', response);
    return response;
  } catch (error) {
    console.error('Error fetching user location:', error);
    return null;
  }
};

export default fetchUserLocation;
