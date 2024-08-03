import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location'; // Import location services
import apiRequest from '../apis/api';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Import your custom icons
import carIcon from '../assets/carIcon.png';
import bikeIcon from '../assets/bikeIcon.png';

export default function FindTravelersScreen() {
  const mapRef = useRef(null);
  const [vehicles, setVehicles] = useState([]);
  const [showSearchBars, setShowSearchBars] = useState(false);
  const [startSearchText, setStartSearchText] = useState('');
  const [endSearchText, setEndSearchText] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); // State for location permission error

  // Fetch user location every 2 seconds
  useFocusEffect(
    React.useCallback(() => {
      const fetchUserLocation = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) throw new Error('No token found');
          const location = await apiRequest('/api/userloc', 'GET', null, { Authorization: `Bearer ${token}` });
          setUserLocation(location);
        } catch (error) {
          console.error('Error fetching user location:', error);
          Alert.alert('Error', 'Failed to fetch user location');
        }
      };

      fetchUserLocation();
      const intervalId = setInterval(fetchUserLocation, 2000);

      return () => clearInterval(intervalId);
    }, [])
  );

  // Fetch vehicles data every 5 seconds if search has been initiated
  useFocusEffect(
    React.useCallback(() => {
      if (searchInitiated) {
        const fetchVehicles = async () => {
          try {
            const response = await apiRequest('/api/vehicles', 'GET', null, { start: startSearchText, end: endSearchText });
            setVehicles(response);
          } catch (error) {
            console.error('Error fetching vehicles data:', error);
          }
        };

        fetchVehicles();
        const intervalId = setInterval(fetchVehicles, 5000);

        return () => clearInterval(intervalId);
      }
    }, [searchInitiated, startSearchText, endSearchText])
  );

  // useEffect(() => {
  //   const getLocationAsync = async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       setErrorMsg('Permission to access location was denied');
  //       return;
  //     }

  //     let current_location = await Location.getCurrentPositionAsync({});
  //     setUserLocation(current_location.coords); // Only store the coordinates
  //     await updateLocationInDatabase(current_location.coords); // Call API to update the database
  //   };

  //   // Fetch location every 5 seconds
  //   getLocationAsync();
  //   const intervalId = setInterval(getLocationAsync, 5000);

  //   return () => clearInterval(intervalId);
  // }, []);

  // const updateLocationInDatabase = async (coords) => {
  //   try {
  //     const token = await AsyncStorage.getItem('token');
  //     if (!token) throw new Error('No token found');
  //     await apiRequest('/api/updateloc', 'POST', { lat: coords.latitude, long: coords.longitude }, { Authorization: `Bearer ${token}` });
  //   } catch (error) {
  //     console.error('Error updating location in database:', error);
  //     Alert.alert('Error', 'Failed to update location in database.');
  //   }
  // };

  const handleSearch = async () => {
    try {
      const response = await apiRequest('/api/vehicles', 'GET', null, { start: startSearchText, end: endSearchText });
      setVehicles(response);
      handleRecenter(response);
      setShowSearchBars(false); // Hide the search bars after search
      setSearchInitiated(true); // Set search initiated flag to true
    } catch (error) {
      console.error('Error fetching vehicles data:', error);
      Alert.alert('Error', 'Failed to fetch vehicles data.');
    }
  };

  const handleRecenter = (vehiclesData) => {
    if (mapRef.current && vehiclesData.length > 0) {
      mapRef.current.fitToCoordinates(
        vehiclesData.map(vehicle => ({
          latitude: vehicle.curr_lat,
          longitude: vehicle.curr_long,
        })),
        {
          edgePadding: { top: 200, right: 200, bottom: 200, left: 200 },
          animated: true,
        }
      );
    }
  };

  const toggleSearchBars = () => {
    setShowSearchBars(!showSearchBars);
  };

  const handleFindHelp = () => {
    Alert.alert('Find Help', 'This is where you can find help!');
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation ? userLocation.latitude : 11.0168,
          longitude: userLocation ? userLocation.longitude : 76.9558,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
          />
        )}
        {vehicles.map(vehicle => (
          <Marker
            key={vehicle.id}
            coordinate={{
              latitude: vehicle.curr_lat,
              longitude: vehicle.curr_long,
            }}
            title={`${vehicle.name}`}
            description={`${vehicle.licensePlate} (${vehicle.status})`}
          >
            <Image
              source={vehicle.vehicleType === 'Car' ? carIcon : bikeIcon}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>
      <View style={styles.searchBarContainer}>
        <TouchableOpacity style={styles.searchBar} onPress={toggleSearchBars}>
          <MaterialIcons name="search" size={24} color="black" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for start and destination..."
            placeholderTextColor="black"
            editable={false}
          />
        </TouchableOpacity>
      </View>
      {showSearchBars && (
        <View style={styles.searchBarsContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter start location"
            value={startSearchText}
            onChangeText={text => setStartSearchText(text)}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter end location"
            value={endSearchText}
            onChangeText={text => setEndSearchText(text)}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <MaterialIcons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.recenterButton} onPress={() => handleRecenter(vehicles)}>
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.findHelpButton} onPress={handleFindHelp}>
        <FontAwesome5 name="hands-helping" size={24} color="white" />
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchBarContainer: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchInput: {
    height: 40,
    marginLeft: 10,
    color: 'black',
    flex: 1,
  },
  searchBarsContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 10,
    top: 70,
    left: 16,
    right: 16,
  },
  searchInput: {
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  searchButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recenterButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 16,
    right: 16,
  },
  findHelpButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 80,
    right: 16,
  },
});
