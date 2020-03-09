import React, { Component } from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import Camera from './camera'
import Video from './video'
import Audio from './audio'
import File from './file'
import HomeScreen from './homescr';


const CaptureNav = createBottomTabNavigator();


class Capture extends Component {
  render(){
    return (
      <CaptureNav.Navigator >
      
        <CaptureNav.Screen 
          name="Camera" 
          component= {Camera} 
          
        />

        <CaptureNav.Screen 
          name="Video" 
          component= {Video} 
        />

        <CaptureNav.Screen 
          name="Audio" 
          component= {Audio} 
        />
         
         <CaptureNav.Screen 
          name="File" 
          component= {File} 
          
        />

      </CaptureNav.Navigator>
    )
  }
}

export default Capture

