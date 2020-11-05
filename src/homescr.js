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
import {View, StyleSheet} from 'react-native';

const BottomNav = createBottomTabNavigator();
const RootNav = createStackNavigator();

class Main extends Component {
  refreshFeed = () => {
    console.log('refreshFeed');
  };

  render() {
    return (
      <BottomNav.Navigator>
        <BottomNav.Screen
          name="Feed"
          component={Feed}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: () => (
              <MaterialIcon name="home" color={'black'} size={26} />
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
            tabBarIcon: () => (
              <MaterialIcon name="control-point" color={'black'} size={26} />
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
    console.log('HomeScreen.refreshFeed');
  };

  render() {
    const props = {refreshFeed: () => this.testCallBack()};
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
          screenProps={props}
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
    justifyContent: 'space-between',
    marginTop: 4,
    marginLeft: 4,
    marginRight: 4,
  },
});
