import React, { useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder, Text, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-native-paper';
import HomeScreen from './HomeScreen';
import ChatsScreen from './ChatScreen';
import AccountScreen from './AccountScreen';

const Tab = createBottomTabNavigator();
const { height: screenHeight } = Dimensions.get('window'); // Screen height

const Dashboard = () => {
  // Define snap points
  const snapPoints = {
    top: 0, // Fully open
    middle: screenHeight / 2, // Middle position
    bottom: screenHeight - 100, // Slightly visible at the bottom
  };

  const translateY = useRef(new Animated.Value(snapPoints.bottom)).current; // Start at bottom snap point
  const lastTranslateY = useRef(snapPoints.bottom); // Keep track of the last snap position

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (event, gestureState) => {
        // Only allow movement if the user drags sufficiently
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (event, gestureState) => {
        const newTranslateY = lastTranslateY.current + gestureState.dy;

        // Allow movement only within bounds
        if (newTranslateY >= snapPoints.top && newTranslateY <= snapPoints.bottom) {
          translateY.setValue(newTranslateY);
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        const dragThreshold = 50; // Minimum movement to trigger snapping
        const midpoint = snapPoints.middle;

        // Update the last translateY position
        const currentY = translateY._value;

        // Snap to closest position
        if (gestureState.dy > 0 && currentY > midpoint + dragThreshold) {
          closeSheet(); // Snap to bottom
        } else if (gestureState.dy < 0 && currentY < midpoint - dragThreshold) {
          openSheet(); // Snap to top
        } else {
          moveToMiddle(); // Snap to middle
        }
        lastTranslateY.current = translateY._value; // Update the last position
      },
    })
  ).current;

  const openSheet = () => {
    Animated.timing(translateY, {
      toValue: snapPoints.top, // Fully open (top position)
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      lastTranslateY.current = snapPoints.top; // Update last position after animation
    });
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: snapPoints.bottom, // Fully closed (bottom position)
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      lastTranslateY.current = snapPoints.bottom; // Update last position after animation
    });
  };

  const moveToMiddle = () => {
    Animated.timing(translateY, {
      toValue: snapPoints.middle, // Snap to middle position
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      lastTranslateY.current = snapPoints.middle; // Update last position after animation
    });
  };

  return (
    <Provider>
      <View style={styles.container}>
        {/* Bottom Tab Navigator */}
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Chats" component={ChatsScreen} />
          <Tab.Screen name="Account" component={AccountScreen} />
        </Tab.Navigator>

        {/* Draggable Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />
          <View style={styles.content}>
            <Text style={styles.sheetTitle}>Drag Me!</Text>
            <Text style={styles.sheetDescription}>
              Drag the bottom sheet up or down to control its position.
            </Text>
          </View>
        </Animated.View>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: screenHeight, // Allow full-screen dragging
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    padding: 16,
  },
  handle: {
    width: 60,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginVertical: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sheetDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default Dashboard;
