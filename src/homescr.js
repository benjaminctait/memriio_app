import React, { Component } from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import Feed from './feed';
import Search from './search'
import Capture from './capture'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const BottomNav = createBottomTabNavigator();


class HomeScreen extends Component {
  render(){
    return (
      <BottomNav.Navigator>
        <BottomNav.Screen 
          name="Feed" 
          component= {Feed} 
          options={{
            tabBarLabel: 'Home', 
            tabBarIcon : () => (
              <MaterialIcon name='home' color={'black'} size={26}  />
          )}}
        />

        <BottomNav.Screen 
          name="Search" 
          component= {Search} 
          options={{
            tabBarLabel: 'Search', 
            tabBarIcon : () => (
              <MaterialIcon name='search' color={'black'} size={26}  />
          )}}
        />
        
        <BottomNav.Screen 
          name="Capture" 
          component= {Capture} 
          options={{
            tabBarVisible:false,
            tabBarLabel: 'New Post', 
            tabBarIcon : () => (
              <MaterialIcon name='control-point' color={'black'} size={26}  />
          )}}
        />

      </BottomNav.Navigator>
    )
  }
}

export default HomeScreen


          