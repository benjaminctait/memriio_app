import React, {Component} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import Feed from './feed';

import CaptureComponent from './capture';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import NewPost from './newpost';
import SearchPeople from './searchpeople';
import SearchLocation from './searchlocation';
import {View, StyleSheet,Image} from 'react-native';

const BottomNav = createBottomTabNavigator();
const RootNav = createStackNavigator();

class Main extends Component {
  render() {
    return (
      
      <BottomNav.Navigator>
        
        <BottomNav.Screen
          name="Feed"
          component={Feed}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused, tintColor }) => (
              <Image
                focused = { focused}
                source  = { require('./images/home.png')}
                style   = { styles.mediumButton }                
              />
            ),
          }}
        />

        <BottomNav.Screen
          name="CaptureComponent"
          component={CaptureComponent}
          options={{
            cardStyleInterpolator:
              CardStyleInterpolators.forModalPresentationIOS,
            tabBarVisible: false,
            tabBarLabel: 'Capture',
            tabBarIcon: ({ focused, tintColor }) => (
              <Image
                focused = { focused}
                source  = { require('./images/plus_green.png')}
                style   = { [styles.mediumButton,{height:40,width:40} ]}                
              />
            ),
          }}
        />
      </BottomNav.Navigator>
    );
  }
}

//-----------------------------------------------------------------------

class HomeScreen extends Component {
  testCallBack = () => {
    console.log('HOME SCREEN::: TEST CALLBACK');
  };

  myprops = {
    refresh: this.testCallBack,
  };
  render() {
    return (

      <RootNav.Navigator>

        <RootNav.Screen
          name="Main"
          component={Main}
          options={{
            headerShown: false,
          }}
        />

        <RootNav.Screen
          name="NewPost"
          component={NewPost}
          screenProps={{pushMemory: this.testCallBack}}
          options={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          }}
        />

        <RootNav.Screen
          name="SearchPeople"
          component={SearchPeople}
          options={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          }}
        />

        <RootNav.Screen
          name="SearchLocation"
          component={SearchLocation}
          options={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          }}
        />
      </RootNav.Navigator>
    );
  }
}

export default HomeScreen;

const styles = StyleSheet.create({
  iconrow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop:5,
    marginTop: 4,
    marginLeft: 2,
    marginRight: 2,
  },

  mediumButton: {
    marginTop:3,
    height: 30,
    width: 30,
    alignSelf:'center',
    backgroundColor: 'transparent',
    
  },

});
