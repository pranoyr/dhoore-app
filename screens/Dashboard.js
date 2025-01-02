import React, { createContext, useState, useContext } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-native-paper';
import HomeScreen from './HomeScreen';
import ChatsScreen from './ChatScreen';
import AccountScreen from './AccountScreen';
import CustomBottomSheet from './CustomBottomSheet';

const BottomSheetContext = createContext();
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Dashboard = () => {
  const [searchText, setSearchText] = useState('')
  const [stopHandler, setStopHandler] = useState(null);
  
  const Tab = createBottomTabNavigator();

  const handleSearch = (text) => {
    const uniqueSearchText = `${text}-${Date.now()}`; // Append a timestamp
    setSearchText(uniqueSearchText);
  };

  return (
    <Provider>
      <BottomSheetContext.Provider value={{ searchText, stopHandler }}>
        {/* Main container */}
        <View style={styles.container}>
          {/* Navigation container */}
          <Tab.Navigator
            screenOptions={{
              tabBarStyle: {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 60,
                zIndex: 2,
                elevation: 2,
                backgroundColor: 'white',
              },
            }}
          >
            <Tab.Screen 
              name="Home"
              options={{
                tabBarStyle: {
                  position: 'absolute',
                  bottom: 0,
                  height: 60,
                  zIndex: 2,
                  elevation: 2,
                  backgroundColor: 'white',
                }
              }}
            >
              {({ route, navigation }) => (
                <>
                  <HomeScreen
                    route={route}
                    navigation={navigation}
                    registerStopHandler={setStopHandler}
                  />
                  <View style={styles.bottomSheetWrapper}>
                    <CustomBottomSheet onSearch={handleSearch} navigation={navigation} />
                  </View>
                </>
              )}
            </Tab.Screen>
            <Tab.Screen name="Chats" component={ChatsScreen} />
            <Tab.Screen name="Account" component={AccountScreen} />
          </Tab.Navigator>
        </View>
      </BottomSheetContext.Provider>
    </Provider>
  );
};

export const useBottomSheet = () => useContext(BottomSheetContext);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  bottomSheetWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60, // Height of the tab bar
    height: SCREEN_HEIGHT * 0.9, // Adjust this value based on your bottom sheet height
    zIndex: 1,
    elevation: 1,
    pointerEvents: 'box-none',
  },
});

export default Dashboard;
