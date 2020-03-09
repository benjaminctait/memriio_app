import React, { Component } from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import Feed from './feed';
import Search from './search'
import Capture from './capture'
import { HeaderTitle } from '@react-navigation/stack';

const BottomNav = createBottomTabNavigator();


class HomeScreen extends Component {
  render(){
    return (
      <BottomNav.Navigator>
        <BottomNav.Screen 
          name="Feed" 
          component= {Feed} 
        />

        <BottomNav.Screen 
          name="Search" 
          component= {Search} 
        />
        
        <BottomNav.Screen 
          name="Capture" 
          component= {Capture} 
          options ={{
            tabBarVisible:false,
            
            
          }}
        />

      </BottomNav.Navigator>
    )
  }
}

export default HomeScreen


          