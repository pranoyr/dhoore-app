import React, { useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, TextInput, Alert, Text, Modal, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import apiRequest from '../apis/api';
import { MaterialIcons, FontAwesome5, FontAwesome } from '@expo/vector-icons'; // Import icons
import { useFocusEffect } from '@react-navigation/native';
import { getDistance } from 'geolib'; // Import getDistance from geolib

// Import your custom icons
import carIcon from '../assets/carIcon.png';
import bikeIcon from '../assets/bikeIcon.png';
import destinationIcon from '../assets/flag.png';

export default function HomeScreen({ route, navigation }) {
  const mapRef = useRef(null);
  const [vehicles, setVehicles] = useState([]);
  const [showSearchBars, setShowSearchBars] = useState(true);
  const [startSearchText, setStartSearchText] = useState('');
  const [endSearchText, setEndSearchText] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [showMarkers, setShowMarkers] = useState(false);
  const [showOnlyUserLocation, setShowOnlyUserLocation] = useState(false); // New state
  const [modalVisible, setModalVisible] = useState(false);

  const [helpButtonVisible, setHelpButtonVisible] = useState(false); // New state for help button


  const [modalVisible1, setModalVisible1] = useState(false);

  const [journeyInfoVisible, setJourneyInfoVisible] = useState(false); // New state for journey info modal
  const [nearestVehicle, setNearestVehicle] = useState(null);
  const [journeyStarted, setJourneyStarted] = useState(false); // New state for journey

  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [userDetails, setUserDetails] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchUserLocation = async () => {
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Error', 'Permission to access location was denied');
            return;
          }

          let current_location = await Location.getCurrentPositionAsync({});
          setUserLocation({ latitude: 9.5, longitude: 76.4 });
          await updateLocationInDatabase(current_location.coords);
        } catch (error) {
          console.error('Error fetching user location:', error);
          Alert.alert('Error', 'Failed to fetch user location');
        }
      };

      fetchUserLocation();
    }, [])
  );

  const updateLocationInDatabase = async (coords) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
      await apiRequest('/api/updateloc', 'POST', { lat: coords.latitude, long: coords.longitude }, { Authorization: `Bearer ${token}` });
    } catch (error) {
      console.error('Error updating location in database:', error);
      Alert.alert('Error', 'Failed to update location in database.');
    }
  };



  const fetchUserDetails = async () => {
    try {
      
      const response = await apiRequest('/api/user-details', 'GET');
      setUserDetails(response);
      setUserModalVisible(true);  // Show the modal
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to fetch user details.');
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(`https://api.olamaps.io/places/v1/autocomplete?input=${query}`);
      const data = await response.json();
      if (data.status === 'ok') {
        setSuggestions(data.predictions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      Alert.alert('Error', 'Failed to fetch suggestions.');
    }
  };


  const handleSearch = async () => {
    try {
      const response = await apiRequest('/api/vehicles', 'GET', null, { start: "startSearchText", end: endSearchText });
      setVehicles(response);
      setShowSearchBars(false);
      setShowMarkers(true);
      setShowOnlyUserLocation(false); // Ensure vehicles are shown
      setHelpButtonVisible(true); // Hide the help button

      const destinationCoords = await geocodeDestination(endSearchText);
      if (destinationCoords) {
        setDestinationLocation(destinationCoords);
        handleRecenter(response, destinationCoords);
      } else {
        Alert.alert('Error', 'Failed to geocode destination.');
      }
      setJourneyStarted(true); // Set journeyStarted to true when the journey starts
      setJourneyInfoVisible(true); // Show journey info modal
    } catch (error) {
      console.error('Error fetching vehicles data:', error);
      Alert.alert('Error', 'Failed to fetch vehicles data.');
    }
  };

  const geocodeDestination = async (address) => {
    try {
      const geocodingResponse = await Location.geocodeAsync(address);
      if (geocodingResponse.length > 0) {
        return {
          latitude: geocodingResponse[0].latitude,
          longitude: geocodingResponse[0].longitude,
        };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  const handleRecenter = (vehiclesData, destinationCoords) => {
    if (mapRef.current) {
      const bounds = {
        north: userLocation ? userLocation.latitude : 0,
        south: userLocation ? userLocation.latitude : 0,
        east: userLocation ? userLocation.longitude : 0,
        west: userLocation ? userLocation.longitude : 0,
      };

      vehiclesData.forEach(vehicle => {
        bounds.north = Math.max(bounds.north, vehicle.curr_lat);
        bounds.south = Math.min(bounds.south, vehicle.curr_lat);
        bounds.east = Math.max(bounds.east, vehicle.curr_long);
        bounds.west = Math.min(bounds.west, vehicle.curr_long);
      });

      if (userLocation) {
        bounds.north = Math.max(bounds.north, userLocation.latitude);
        bounds.south = Math.min(bounds.south, userLocation.latitude);
        bounds.east = Math.max(bounds.east, userLocation.longitude);
        bounds.west = Math.min(bounds.west, userLocation.longitude);
      }

      if (destinationCoords) {
        bounds.north = Math.max(bounds.north, destinationCoords.latitude);
        bounds.south = Math.min(bounds.south, destinationCoords.latitude);
        bounds.east = Math.max(bounds.east, destinationCoords.longitude);
        bounds.west = Math.min(bounds.west, destinationCoords.longitude);
      }

      mapRef.current.fitToCoordinates(
        [
          { latitude: bounds.north, longitude: bounds.east },
          { latitude: bounds.south, longitude: bounds.west },
        ],
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
    if (!userLocation) {
      Alert.alert('Error', 'User location is not available.');
      return;
    }

    if (vehicles.length === 0) {
      Alert.alert('Info', 'No vehicles available to find help.');
      return;
    }

    const distances = vehicles.map(vehicle => ({
      ...vehicle,
      distance: getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: vehicle.curr_lat, longitude: vehicle.curr_long }
      ),
    }));

    distances.sort((a, b) => a.distance - b.distance);

    const nearest = distances[0];
    setNearestVehicle(nearest);
    setModalVisible(true);
  };

  const handleCall = (phone) => {
    // Handle phone call
    Alert.alert('Call', `Calling ${phone}`);
  };

  const handleChat = () => {
    // Handle chat
    navigation.navigate('Chat', { selectedVehicle });
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const closeJourneyInfoModal = () => {
    setJourneyInfoVisible(false);
  };

  const handleStop = () => {
    setShowMarkers(false);
    setShowOnlyUserLocation(true);
    setShowSearchBars(true);
    setJourneyStarted(false); // Set journeyStarted to false when journey is stopped
    setVehicles([]); // Clear the vehicles array
    setHelpButtonVisible(false); // Hide the help button
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
            onPress={fetchUserDetails} // Call fetchUserDetails on press
          />
        )}
        {/* {showOnlyUserLocation && !showMarkers && userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
          />
        )} */}
        {showMarkers && destinationLocation && (
          <Marker
            coordinate={{
              latitude: destinationLocation.latitude,
              longitude: destinationLocation.longitude,
            }}
            title="Destination"
          >
            <Image
              source={destinationIcon}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </Marker>
        )}
        {showMarkers && vehicles.map(vehicle => (
          <Marker
          key={vehicle.id}
          coordinate={{
            latitude: vehicle.curr_lat,
            longitude: vehicle.curr_long,
          }}
          title={vehicle.name}
          // description={`${vehicle.licensePlate} (${vehicle.status})`}
          onPress={() => {
            setSelectedVehicle(vehicle);
            setModalVisible1(true);
          }}
        >
          <View style={styles.customMarker}>
            <Image
              source={vehicle.vehicleType === 'Car' ? carIcon : bikeIcon}
              style={styles.vehicleIcon}
              resizeMode="contain"
            />
  
          </View>
        </Marker>
        


          
        ))}
      </MapView>
      {showSearchBars && (
        <View style={styles.searchBarsContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter destination"
            value={endSearchText}
            onChangeText={text => setEndSearchText(text)}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Start Journey</Text>
          </TouchableOpacity>
      
        </View>
      )}
      {/* <TouchableOpacity style={styles.searchIconButton} onPress={toggleSearchBars}>
        <MaterialIcons name="more-vert" size={24} color="white" />
      </TouchableOpacity> */}
      <TouchableOpacity style={styles.recenterButton} onPress={() => handleRecenter(vehicles, destinationLocation)}>
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.findHelpButton} onPress={handleFindHelp}>
        <FontAwesome5 name="hands-helping" size={24} color="white" />
      </TouchableOpacity> */}

    {helpButtonVisible && (

    <TouchableOpacity style={styles.findHelpButton} onPress={handleFindHelp}>
      <View style={styles.helpButtonContent}>
        <FontAwesome5 name="hands-helping" size={24} color="white" />
        <Text style={styles.helpButtonText}>Find Help</Text>
      </View>
    </TouchableOpacity>
    )}


      {/* Modal for Nearest Vehicle */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            {nearestVehicle && (
              <>
                <Text style={styles.modalTitle}>Nearest Vehicle</Text>
                <Text style={styles.modalText}>Vehicle Name: {nearestVehicle.name}</Text>
                <Text style={styles.modalText}>License Plate: {nearestVehicle.licensePlate}</Text>
                <Text style={styles.modalText}>Distance: {(nearestVehicle.distance / 1000).toFixed(2)} km</Text>
                <View style={styles.modalButtonsContainer}>
                  <Pressable style={styles.modalButton} onPress={() => handleCall(nearestVehicle.phone)}>
                    <FontAwesome name="phone" size={24} color="white" />
                    <Text style={styles.modalButtonText}>Call</Text>
                  </Pressable>
                  <Pressable style={styles.modalButton} onPress={handleChat}>
                    <FontAwesome5 name="comment-dots" size={24} color="white" />
                    <Text style={styles.modalButtonText}>Chat</Text>
                  </Pressable>
                </View>
                <Pressable style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>


         <Modal
            animationType="slide"
            transparent={true}
            visible={userModalVisible}
            onRequestClose={() => setUserModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalCard}>
                {userDetails && (
                  <>
                    <Text style={styles.modalTitle}>User Details</Text>
                    <Text style={styles.modalText}>Name: {userDetails.name} ({userDetails.gender})</Text>
                    {/* Add more fields as needed */}
                    <Pressable style={styles.closeButton} onPress={() => setUserModalVisible(false)}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </Modal>



        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible1}
          onRequestClose={() => setModalVisible1(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              {selectedVehicle && (
                <>
                 {}
                  {/* Add any additional information or styling here */}
                  <Text style={styles.modalTitle}>{selectedVehicle.name} ({selectedVehicle.gender})</Text>
                  <Text style={styles.modalText}>License Plate: {selectedVehicle.licensePlate}</Text>
                  <Text style={styles.modalText}>Model: {selectedVehicle.model}</Text>
                  {/* <Text style={styles.modalText}>Make: {selectedVehicle.make}</Text> */}

                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setModalVisible1(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </Pressable>

                  <Pressable
                    style={styles.chatButton}
                    onPress={() => {
                      handleChat();
                      setModalVisible1(false);
                      // console.log('Chat button pressed');
                    }}
                  >
                    <FontAwesome name="comments" size={24} color="black" />
                  </Pressable>
                 

                  



                </>
              )}
            </View>
          </View>
        </Modal>


      {/* Modal for Journey Information */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={journeyInfoVisible}
        onRequestClose={closeJourneyInfoModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Journey Information</Text>
            <Text style={styles.modalText}>Source: {startSearchText}</Text>
            <Text style={styles.modalText}>Destination: {endSearchText}</Text>
            <Text style={styles.modalText}>Start Time: {new Date().toLocaleTimeString()}</Text>
            <Text style={styles.modalText}>Showing all the vehicles in your path.</Text>
            <Pressable style={styles.closeButton} onPress={closeJourneyInfoModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

        {/* Stop Button */}
    {journeyStarted && (
  <TouchableOpacity style={styles.stopButton} onPress={handleStop} disabled={!journeyStarted}>
    <View style={styles.iconTextContainer}>
      <FontAwesome name="stop" size={15} color="white" />
      <Text style={styles.stopButtonText}>Stop</Text>
    </View>
  </TouchableOpacity>
)}

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchIconButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  searchBarsContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 10,
    top: 25,
    left: 16,
    right: 16,
    flexDirection: 'row', // Align children horizontally
    justifyContent: 'space-between', // Space between buttons
    zIndex: 10,
  },
  searchInput: {
    height: 40,
    marginRight: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    flex: 1, // Allow the input to take available space
  },
  searchButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5, // Add some space between buttons
  },
  stopButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
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
    zIndex: 10,
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
    zIndex: 10,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  modalButton: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },


  stopButton: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{ translateX: -25 }],
    backgroundColor: '#FF0000', // Red background for stop
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 15,
    marginLeft: 5, // Space between the icon and text
  },


  chatButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  findHelpButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker background for better visibility
    borderRadius: 30,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    bottom: 12,
    right: 265,
    zIndex: 10,
  },
  helpButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpButtonText: {
    color: 'white',
    marginLeft: 8, // Space between the icon and text
    fontSize: 14,
    
  },
});
