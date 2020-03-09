
import React, { Component } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/homescr'
import LogoTitle from './src/logotitle'
import SettingsBtn from './src/settingsbtn'
import Capture from './src/camera'

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
                  <SettingsBtn
                    onPress={() => alert('This is a button!')}
                    
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
