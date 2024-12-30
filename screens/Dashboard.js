import React, { createContext, useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-native-paper';
import HomeScreen from './HomeScreen';
import ChatsScreen from './ChatScreen';
import AccountScreen from './AccountScreen';
import CustomBottomSheet from './CustomBottomSheet';

const BottomSheetContext = createContext();

const Dashboard = () => {
  const [searchText, setSearchText] = useState('');

  const [stopHandler, setStopHandler] = useState(null);


  const Tab = createBottomTabNavigator();

  // const handleSearch = (text) => {
  //   console.log('Updating Search Text:', text);
  //   setSearchText(text); // Update context value
  // };

  const handleSearch = (text) => {
    const uniqueSearchText = `${text}-${Date.now()}`; // Append a timestamp
    // console.log('Updating Search Text:', uniqueSearchText);
    setSearchText(uniqueSearchText); // Update context value
  };
  

  return (
    <Provider>
      <BottomSheetContext.Provider value={{ searchText, stopHandler }}>
        <View style={styles.container}>
          <Tab.Navigator>
            <Tab.Screen name="Home">
              {({ route, navigation }) => (
                <HomeScreen
                  route={route}
                  navigation={navigation}
                  registerStopHandler={setStopHandler} // Pass setStopHandler
                />
              )}
            </Tab.Screen>
            <Tab.Screen name="Chats" component={ChatsScreen} />
            <Tab.Screen name="Account" component={AccountScreen} />
          </Tab.Navigator>
          <CustomBottomSheet onSearch={handleSearch} />
        </View>
      </BottomSheetContext.Provider>
    </Provider>
  );
};

export const useBottomSheet = () => useContext(BottomSheetContext);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Dashboard;
