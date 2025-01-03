import React, { useRef, useState } from 'react';
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
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Icon library
import * as Location from 'expo-location';
import { useBottomSheet } from './Dashboard';
import apiRequest from '../apis/api';

const { height: screenHeight } = Dimensions.get('window');
const GOOGLE_API_KEY = 'AIzaSyCQcwTvPsjZqcP6Za10WCvvmINgk2OsV1E'; // Replace with your Google API Key

const CustomBottomSheet = ({ onSearch, navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState([]); // Google Places suggestions
    const [isSearching, setIsSearching] = useState(false);
    const [vehicles, setVehicles] = useState([]); // Vehicle data

    const { stopHandler } = useBottomSheet();

    const snapPoints = {
        top: 150,
        middle: screenHeight / 2,
        bottom: screenHeight - 50,
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

                console.log('place :', place);

                console.log('lat and long:', data.result);

                const locationData = place + "-" + data.result.geometry.location.lat + "-" + data.result.geometry.location.lng;

                // Fetch vehicle data
                const vehicleResponse = await apiRequest('/api/vehicles', 'GET', null, {
                    start: 'startSearchText',
                    end: place,
                });

                setVehicles(vehicleResponse);
                moveToMiddle();

                setIsSearching(true);

                onSearch(locationData);
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

    const handleStopPress = () => {
        stopHandler();
        setIsSearching(false);
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
        <Animated.View
            style={[styles.bottomSheet, { transform: [{ translateY }] }]}
            {...panResponder.panHandlers}
        >
            <View style={styles.handle} />
            <View style={styles.content}>
                {isSearching ? (
                    <>
                        <TouchableOpacity style={styles.searchButton} onPress={handleStopPress}>
                            <Text style={styles.searchButtonText}>Stop</Text>
                        </TouchableOpacity>
                        <FlatList
                            data={vehicles}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderVehicleCard}
                            style={styles.vehicleList}
                        />
                    </>
                ) : (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Enter destination"
                            value={searchText}
                            onChangeText={(text) => {
                                setSearchText(text);
                                fetchSuggestions(text);
                                openSheet();
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#a9a9a9',
        borderRadius: 12,
        marginBottom: 10,
        paddingHorizontal: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: 'transparent',
        borderRadius: 12,
        paddingHorizontal: 8,
    },
    clearButton: {
        marginLeft: 8,
    },
    suggestion: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    suggestionText: {
        fontSize: 16,
        color: '#fff',
    },
    searchButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    vehicleList: {
        marginTop: 10,
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
    suggestionsList: {
        maxHeight: 200,
        backgroundColor: '#333',
        borderRadius: 8,
        overflow: 'hidden',
    },
});

export default CustomBottomSheet;
