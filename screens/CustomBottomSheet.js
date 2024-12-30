import React, { useRef, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Animated, PanResponder, Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window'); // Screen height

const CustomBottomSheet = ({ onSearch }) => {
  const [searchText, setSearchText] = useState('');

  const snapPoints = {
    top: 0,
    middle: screenHeight / 2,
    bottom: screenHeight - 100,
  };

  const translateY = useRef(new Animated.Value(snapPoints.bottom)).current;
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

  const handleSearchPress = () => {
    onSearch(searchText);
  };

return (
    <Animated.View
        style={[styles.bottomSheet, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
    >
        <View style={styles.handle} />
        <View style={styles.content}>
            <TextInput
                style={styles.searchInput}
                placeholder="Enter destination"
                value={searchText}
                onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearchPress}>
                <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
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
            backgroundColor: '#191919', // Changed to black
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
            backgroundColor: '#a9a9a9', // Changed to dark grey shade
            borderRadius: 12, // Changed to make the search box round
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
});

export default CustomBottomSheet;
