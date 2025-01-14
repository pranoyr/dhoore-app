import React, { useRef, useState , useEffect} from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Text,
    Animated,
    PanResponder,
    Dimensions,
    FlatList,
    Keyboard,
    Platform,
    Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Icon library
import * as Location from 'expo-location';
import { useBottomSheet } from './Dashboard';
import apiRequest from '../apis/api';
import { useAppContext } from './AppProvider'; // Adjust the path to your context file



import { sendPlaceInfo, addWebSocketListener, removeWebSocketListener } from '../apis/websocket';

const { height: screenHeight } = Dimensions.get('window');
const GOOGLE_API_KEY = 'AIzaSyCQcwTvPsjZqcP6Za10WCvvmINgk2OsV1E'; // Replace with your Google API Key

const CustomBottomSheet = ({ onSearch, navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState([]); // Google Places suggestions
    const [isSearching, setIsSearching] = useState(false);
    const [vehicles, setVehicles] = useState([]); // Initialize as empty array
    const selectedPlaceRef = useRef(''); // Ref to store selected place persistently

    const vehiclesRef = useRef([]); // Add this ref to track current vehicles

     const { userId, userName, UserVehicleMoldel } = useAppContext(); // Access values from the context

    const { stopHandler } = useBottomSheet();

    const snapPoints = {
        top: 150,
        middle: screenHeight / 2 - 10,
        bottom: screenHeight - 180,
    };

    const translateY = useRef(new Animated.Value(snapPoints.middle)).current;
    const lastTranslateY = useRef(snapPoints.bottom);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
            onPanResponderMove: (_, gestureState) => {
                const newTranslateY = lastTranslateY.current + gestureState.dy;
                if (newTranslateY >= snapPoints.top && newTranslateY <= snapPoints.bottom) {
                    translateY.setValue(newTranslateY);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                const currentY = translateY._value;
                if (gestureState.dy > 0 && currentY > snapPoints.middle) {
                    closeSheet();
                    // close keyboard
                    Keyboard.dismiss();
                } else if (gestureState.dy < 0 && currentY < snapPoints.middle) {
                    openSheet();
                } else {
                    moveToMiddle();
                }
                lastTranslateY.current = translateY._value;
            },
        })
    ).current;

    const openSheet = () => {
        Animated.timing(translateY, {
            toValue: snapPoints.top,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeSheet = () => {
        Animated.timing(translateY, {
            toValue: snapPoints.bottom,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const moveToMiddle = () => {
        Animated.timing(translateY, {
            toValue: snapPoints.middle,
            duration: 300,
            useNativeDriver: true,
        }).start();
        
    };


    useEffect(() => {
        const handlePlaceBroadcast = async (message) => {
            if (await message.type === 'search_broadcast') {
                const placeinfo = await message.data.place;
                const receivedVehicleData = message.data.vehicleInfo;
                const stopFlag = message.data.stopSearch;

                if (selectedPlaceRef.current === placeinfo) {
                    try {
                        // Use the ref to get the current vehicles state
                        const currentVehicles = vehiclesRef.current;
                        
                        let updatedVehicles;
                        if (stopFlag) {
                            updatedVehicles = currentVehicles.filter(
                                vehicle => vehicle.user_id !== receivedVehicleData.user_id
                            );
                        } else {
                            // Check if vehicle already exists
                            const vehicleExists = currentVehicles.some(
                                vehicle => vehicle.user_id === receivedVehicleData.user_id
                            );
                            
                            updatedVehicles = vehicleExists 
                                ? currentVehicles
                                : [...currentVehicles, receivedVehicleData];
                        }

                        // Update both the ref and the state
                        vehiclesRef.current = updatedVehicles;
                        setVehicles(updatedVehicles);
                        setIsSearching(true);
                        
                        console.log('Vehicles updated after broadcast:', updatedVehicles);
                    } catch (error) {
                        console.error('Error updating vehicles after broadcast:', error);
                    }
                }
            }
        };
    
        addWebSocketListener(handlePlaceBroadcast); // Register listener
    
        return () => {
            removeWebSocketListener(handlePlaceBroadcast); // Clean up listener on unmount
        };
    }, []);
    

    const fetchSuggestions = async (input) => {
        if (input.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${GOOGLE_API_KEY}`
            );
            const data = await response.json();
            if (data.predictions) {
                setSuggestions(data.predictions);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleSuggestionPress = async (suggestion) => {
        try {
            setSearchText(suggestion.description);
            setSuggestions([]);

            // Fetch place details
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&key=${GOOGLE_API_KEY}`
            );
            const data = await response.json();
            


            if (data.result) {
                const location = data.result.geometry.location;
                console.log('Selected location:', location);

                const decodedLocation = { latitude: location.lat, longitude: location.lng };
                const reverseGeocode = await Location.reverseGeocodeAsync(decodedLocation);
                const place = reverseGeocode[0]?.city || 'Unknown';


                selectedPlaceRef.current = place; // Update the ref with the new place
                console.log('Updated selected place:', selectedPlaceRef.current);


                const locationData = `${place}-${location.lat}-${location.lng}`;


                await onSearch(locationData);

                // Fetch vehicle data
                const vehicleResponse = await apiRequest('/api/vehicles', 'GET', null, {
                    start: 'startSearchText',
                    end: place,
                });


               
                setVehicles(vehicleResponse);

                vehiclesRef.current = vehicleResponse;
                
                // moveToMiddle();
                closeSheet();

                setIsSearching(true);


                // const user_data = { name: userName, model: UserVehicleMoldel, user_id: userId , place: place, stop: false};
                // sendPlaceInfo(user_data); // Broadcast the selected place

                const user_data = { name: userName, model: UserVehicleMoldel, user_id: userId };
                sendPlaceInfo(user_data, place, false); // Send broadcast
        


                
            }
        } catch (error) {
            console.error('Error handling suggestion press:', error);
        }
    };

    const handleSearchPress = async () => {
        if (searchText.length > 0) {
            await fetchSuggestions(searchText);
            console.log('Search pressed:', searchText);
            Keyboard.dismiss();
        }
    };

    const handleStopPress = async () => {
        await stopHandler();

        //clearn the vehicle data
        setVehicles([]);
        // clear the searchplace
        
       
        setIsSearching(false);


        // data_to_be_sent = { name: userName, model: UserVehicleMoldel, user_id: userId , place: selectedPlaceRef.current, stop: true};
        // sendPlaceInfo(data_to_be_sent);  // Broadcast the selected place

        const user_data = { name: userName, model: UserVehicleMoldel, user_id: userId };
        const place = selectedPlaceRef.current;
        sendPlaceInfo(user_data, place, true); // Send stop broadcast

        
    
        selectedPlaceRef.current = '';

    };

    const handleChatPress = (vehicleId, name) => {
        navigation.navigate('PersonChatScreen', { selectedChat: { id: vehicleId, name } });
        console.log(`Chat button pressed for vehicle ID: ${vehicleId}`);
    };

    const renderSuggestion = ({ item }) => (
        <TouchableOpacity onPress={() => handleSuggestionPress(item)} style={styles.suggestion}>
            <Text style={styles.suggestionText}>{item.description}</Text>
        </TouchableOpacity>
    );

    const renderVehicleCard = ({ item }) => (
        <View style={styles.vehicleCard}>
            <View style={styles.vehicleDetailsContainer}>
                <View>
                    <Text style={styles.vehicleName}>{item.name}</Text>
                    <Text style={styles.vehicleDetails}>Model: {item.model}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => handleChatPress(item.user_id, item.name)}
                    style={styles.chatButton}
                >
                    <FontAwesome name="comment" size={20} color="#007BFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>
          My Trip <FontAwesome name="chevron-down" size={16} color="#fff" />
        </Text>
        <View style={styles.iconContainer}>
          {/* <TouchableOpacity style={styles.icon}>
            <FontAwesome name="share-alt" size={20} color="#fff" />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.icon}>
            <FontAwesome name="user-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>


    {/* Render buttons only when searching */}
    {isSearching && (
        <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.button} onPress={handleStopPress}>
                <FontAwesome name="stop" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => console.log('Live Share')}>
                <FontAwesome name="share-alt" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Live Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => console.log('My Flight')}>
                <FontAwesome name="plane" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>My Flight</Text>
            </TouchableOpacity>
        </View>
    )}

    <View style={styles.content}>
        {isSearching ? (
            <FlatList
                data={vehicles}
                keyExtractor={(item) => item.user_id.toString()}
                renderItem={renderVehicleCard}
                style={styles.vehicleList}
            />
        ) : (

         // search container
            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={18} color="#aaa" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Enter destination"
                    onFocus={() => openSheet()}
                    placeholderTextColor="#aaa"
                    value={searchText}
                    keyboardAppearance="dark"  // Dark keyboard mode
                    onChangeText={(text) => {
                        setSearchText(text);
                        fetchSuggestions(text);
                    }}
                    returnKeyType="search"
                    onSubmitEditing={handleSearchPress}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                            setSearchText('');
                            setSuggestions([]);
                        }}
                    >
                        <FontAwesome name="times" size={20} color="#555" />
                    </TouchableOpacity>
                )}
            </View>
            
        )}

        {/* Placeholder Section */}
            {searchText.length === 0 && !isSearching && (
                <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>Let's go Somewhere</Text>
                </View>
            )}

        <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={renderSuggestion}
            style={styles.suggestionsList}
        />
    </View>
</Animated.View>

    );
};

const styles = StyleSheet.create({
    handle: {
        width: 60,
        height: 5,
        backgroundColor: '#565656',
        borderRadius: 3,
        alignSelf: 'center',
        marginVertical: 10,
    },
    content: {
        padding: 16,
    },
    clearButton: {
        marginLeft: 8,
    },
    // suggestion: {
    //     paddingVertical: 10,
    //     paddingHorizontal: 15,
    //     borderBottomWidth: 1,
    //     borderBottomColor: '#444',
    // },
    // suggestionText: {
    //     fontSize: 16,
    //     color: '#fff',
    // },

    vehicleList: {
        marginTop: 20,
    },
    vehicleCard: {
        backgroundColor: '#282828',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    vehicleName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    vehicleDetails: {
        color: '#ccc',
        fontSize: 14,
    },
    vehicleDetailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    // suggestionsList: {
    //     maxHeight: 200,
    //     backgroundColor: '#333',
    //     borderRadius: 8,
    //     overflow: 'hidden',
    // },
    stopButton: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: '#FF0000',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 15,
    },
  
    buttonText: {
        color: 'white',
        fontSize: 14,
        marginTop: 5,
    },
    buttonIcon: {
        color: 'white',
        fontSize: 20,
    },







    bottomSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: screenHeight,
        backgroundColor: '#191919',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 5,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
      },
      title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
      },
      iconContainer: {
        flexDirection: 'row',
      },
      icon: {
        marginLeft: 10,
      },
      searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: 12,
        margin: 16,
        paddingHorizontal: 10,
      },
      searchIcon: {
        marginRight: 8,
      },
      searchInput: {
        flex: 1,
        height: 40,
        color: '#fff',
      },
      placeholderContainer: {
        alignItems: 'center',
        marginTop: 40,
      },
      placeholderText: {
        color: '#aaa',
        fontSize: 18,
        marginBottom: 10,
      },
      arrowIcon: {
        marginTop: 10,
      },
      suggestion: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
      },
      suggestionText: {
        color: '#fff',
        fontSize: 16,
      },
      suggestionsList: {
        marginTop: 10,
      },
   
      
      
     

      
      
});

export default CustomBottomSheet;
