import React, { useRef, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiRequest from '../apis/api';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Import your custom icons
import carIcon from '../assets/carIcon.png';
import bikeIcon from '../assets/bikeIcon.png';

export default function HomeScreen() {
  const mapRef = useRef(null);
  const [vehicles, setVehicles] = useState([]);
  const [showSearchBars, setShowSearchBars] = useState(false);
  const [startSearchText, setStartSearchText] = useState('');
  const [endSearchText, setEndSearchText] = useState('');

  const handleSearch = async () => {
    try {
      const response = await apiRequest('/api/vehicles', 'GET', null, { start: startSearchText, end: endSearchText });
      setVehicles(response);
      handleRecenter(response);
      setShowSearchBars(false); // Hide the search bars after search
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
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
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
          latitude: 11.0168,
          longitude: 76.9558,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
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
      <TouchableOpacity style={styles.searchIconButton} onPress={toggleSearchBars}>
        <MaterialIcons name="search" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.recenterButton} onPress={() => handleRecenter(vehicles)}>
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.findHelpButton} onPress={handleFindHelp}>
        <FontAwesome5 name="hands-helping" size={24} color="white" />
      </TouchableOpacity>
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
  searchIconButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
    top: 20,
    right: 16,
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
