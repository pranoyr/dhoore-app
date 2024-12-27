// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import RegistrationScreen from './screens/RegistrationScreen';
import OTPScreen from './screens/OTPScreen';
import HomeScreen from './screens/HomeScreen';
import FindTravelersScreen from './screens/FindTravelersScreen';
import ChatsScreen from './screens/ChatsScreen';
import HelpScreen from './screens/HelpScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function Dashboard() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Find Travelers" component={FindTravelersScreen} />
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Help" component={HelpScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Registration">
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
