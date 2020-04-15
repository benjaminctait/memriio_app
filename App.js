
import React, { Component } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/homescr'
import LogoTitle from './src/logotitle'
import {SettingsButton} from './src/buttons'
import AsyncStorage from '@react-native-community/async-storage';
//import FlashMessage from "react-native-flash-message";

const Stack = createStackNavigator();


class App extends Component{
  
  render(){
    return(
      <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerTitle: props => <LogoTitle {...props} />,
                headerRight: () => (
                  <SettingsButton onPress={() => {
                    AsyncStorage.clear()
                    alert('Storage cleared!')
                  }}
                  />
                ),
              }}
            />

        </Stack.Navigator>
      </NavigationContainer>
      
    )
  }
};

export default App;
