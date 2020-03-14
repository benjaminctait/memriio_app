import React, { Component } from 'react';
import Camera from './camera'
import VideoComponent from './video'
import AudioComponent from './audio'
import File from './file'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';


const CaptureNav = createBottomTabNavigator();


class Capture extends Component {
  render(){
    return (
      <CaptureNav.Navigator >
        
        <CaptureNav.Screen 
          name="Camera" 
          component= {Camera}
          options={{
            tabBarLabel:'Camera',
            tabBarIcon : () => (
              <MaterialIcon name='camera-alt' color={'black'} size={26} />
            )
          }}
        />

        <CaptureNav.Screen 
          name="Video" 
          component= {VideoComponent} 
          options={{
            tabBarLabel:'Video',
            tabBarIcon : () => (
              <MaterialIcon name='videocam' color={'black'} size={26} />
            )
          }}
          
        />

        <CaptureNav.Screen 
          name="Audio" 
          component= {AudioComponent}
          options={{
            tabBarLabel:'Audio',
            tabBarIcon : () => (
              <MaterialIcon name='volume-up' color={'black'} size={26} />
            )
          }}
          
        />
         
         <CaptureNav.Screen 
          name="File" 
          component={File}
          options={{
            tabBarLabel:'File',
            tabBarIcon : () => (
              <MaterialComIcon name='file-plus' color={'black'} size={26} />
            )
          }}
        
        />
        </CaptureNav.Navigator>
    )
  }
}

export default Capture

