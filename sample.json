import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  Keyboard,
  FlatList,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useBottomSheet } from './Dashboard';
import apiRequest from '../apis/api';
import { useAppContext } from './AppProvider';

const { height: screenHeight } = Dimensions.get('window');

const CustomBottomSheet = ({ onSearch, navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const translateY = useRef(new Animated.Value(screenHeight - 180)).current;
  const lastTranslateY = useRef(screenHeight - 180);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        const newTranslateY = lastTranslateY.current + gestureState.dy;
        if (newTranslateY >= 150 && newTranslateY <= screenHeight - 180) {
          translateY.setValue(newTranslateY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentY = translateY._value;
        if (gestureState.dy > 0 && currentY > screenHeight / 2) {
          closeSheet();
          Keyboard.dismiss();
        } else if (gestureState.dy < 0 && currentY < screenHeight / 2) {
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
      toValue: 150,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: screenHeight - 180,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const moveToMiddle = () => {
    Animated.timing(translateY, {
      toValue: screenHeight / 2,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>
          My Flights <FontAwesome name="chevron-down" size={16} color="#fff" />
        </Text>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.icon}>
            <FontAwesome name="share-alt" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon}>
            <FontAwesome name="user-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search to add flights"
          placeholderTextColor="#aaa"
          onFocus={openSheet}
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />
      </View>

      {/* Placeholder Section */}
      {!isSearching && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Let's Fly Somewhere</Text>
          <FontAwesome name="long-arrow-up" size={30} color="#fff" style={styles.arrowIcon} />
        </View>
      )}

      {/* Suggestions List */}
      {isSearching && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.suggestion}>
              <Text style={styles.suggestionText}>{item.description}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
        />
      )}
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
