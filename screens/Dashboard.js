import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-native-paper';
import HomeScreen from './HomeScreen';
import ChatsScreen from './ChatScreen';
import AccountScreen from './AccountScreen';
import CustomBottomSheet from './CustomBottomSheet'; // Import the bottom sheet

const Tab = createBottomTabNavigator();

const Dashboard = () => {
  return (
    <Provider>
      <View style={styles.container}>
        {/* Bottom Tab Navigator */}
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Chats" component={ChatsScreen} />
          <Tab.Screen name="Account" component={AccountScreen} />
        </Tab.Navigator>

        {/* Include the custom bottom sheet */}
        <CustomBottomSheet />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Dashboard;
