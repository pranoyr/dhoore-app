import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Animated, PanResponder, Dimensions, FlatList } from 'react-native';

const { height: screenHeight } = Dimensions.get('window'); // Screen height
import { useBottomSheet } from './Dashboard';

import * as Location from 'expo-location';
import apiRequest from '../apis/api';

const CustomBottomSheet = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [vehicles, setVehicles] = useState([]); // State to hold vehicles data

    const { stopHandler } = useBottomSheet(); // Access stopHandler from context

    const snapPoints = {
        top: 0,
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

    const handleSearchPress = async () => {
        try {
            onSearch(searchText);
            setIsSearching(true);

            const destinationCoords = await geocodeDestination(searchText);
            const reverseGeocode = await Location.reverseGeocodeAsync(destinationCoords);
            
            const place = reverseGeocode[0].city
            console.log('Destination location:', place);
        

            // Fetch updated vehicle data
            const response = await apiRequest('/api/vehicles', 'GET', null, {
                start: "startSearchText",
                end: place,
            });
    
            // console.log('response:', response);
            setVehicles(response);
            
            // closeSheet(); // Move the sheet to the bottom
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    const handleStopPress = () => {
        stopHandler(); // Call the stopHandler registered by HomeScreen
        setIsSearching(false);
    };

    const renderVehicleCard = ({ item }) => (
        <View style={styles.vehicleCard}>
            <Text style={styles.vehicleName}>{item.name}</Text>
            <Text style={styles.vehicleDetails}>Type: {item.type}</Text>
            <Text style={styles.vehicleDetails}>Model: {item.model}</Text>
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
                    <>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Enter destination"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
                            <Text style={styles.searchButtonText}>Search</Text>
                        </TouchableOpacity>
                    </>
                )}
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
    searchInput: {
        height: 40,
        backgroundColor: '#a9a9a9',
        borderRadius: 12,
        marginBottom: 10,
        paddingHorizontal: 8,
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
});

export default CustomBottomSheet;
