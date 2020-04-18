import React, { Component } from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack'
import Feed from './feed';
import Search from './search';
import CaptureComponent from './capture';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import NewPost  from './newpost'


const BottomNav = createBottomTabNavigator();
const RootNav = createStackNavigator();

class Main extends Component {


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
            name="CaptureComponent" 
            component= {CaptureComponent} 
            options={{
              cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
              tabBarVisible:false,
              tabBarLabel: 'Capture', 
              tabBarIcon : () => (
                <MaterialIcon name='control-point' color={'black'} size={26}  />
            )}}
          />
  
        </BottomNav.Navigator>
      )   
  } 
}

//-----------------------------------------------------------------------

class HomeScreen extends Component {

  render(){
    return (
      <RootNav.Navigator>
      <RootNav.Screen 
        name= "Main"
        component = {Main}
        options ={{
          headerShown:false,
        }}
      />
      
      <RootNav.Screen 
        name="NewPost"
        component ={NewPost}        
        options ={{
          headerShown:false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}
      
      />
      </RootNav.Navigator>
    )
  }
}


export default HomeScreen


          