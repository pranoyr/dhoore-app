import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Button, Provider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import HomeScreen from './HomeScreen';
import FindTravelersScreen from './FindTravelersScreen';
import ChatsScreen from './ChatScreen';
import AccountScreen  from './AccountScreen';

const Tab = createBottomTabNavigator();



const Dashboard = () => {
  return (
    <Provider>
      <View style={{ flex: 1 }}>
        {/* Bottom Tab Navigator */}
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          {/* <Tab.Screen name="Find Travelers" component={FindTravelersScreen} /> */}
          <Tab.Screen name="Chats" component={ChatsScreen} />
          {/* <Tab.Screen name="Help" component={HelpScreen} /> */}
          <Tab.Screen name="Account" component={AccountScreen}>
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </Provider>
  );
};


export default Dashboard;
