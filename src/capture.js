import React, { Component } from 'react';
import Camera from './camera'
import VideoComponent from './video'
import AudioComponent from './audio'
import FileComponent from './file'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialComIcon from 'react-native-vector-icons/MaterialCommunityIcons';


const CaptureNav = createBottomTabNavigator();


class Capture extends Component {

  addImage = (imageurl) =>{
    alert('addImage' + imageurl)
  }

  addVideo = (videourl) =>{
    alert('addVideo',videourl)
  }

  addAudioStream = (streamurl) =>{
    alert('addAudio', streamurl)
  }

  addFile = (fileurl) =>{
    alert('addFile', fileurl)
  }

  

  render(){
    return (
      <CaptureNav.Navigator >
        
        <CaptureNav.Screen 
          name="Camera"           
          options={{
            tabBarLabel:'Camera',
            tabBarIcon : () => (
              <MaterialIcon name='camera-alt' color={'black'} size={26} />
            )
          }}
        >
          {props => <Camera{...props} addImage={this.addImage} />}
        </CaptureNav.Screen>


        <CaptureNav.Screen 
          name="Video" 
          options={{
            tabBarLabel:'Video',
            tabBarIcon : () => (
              <MaterialIcon name='videocam' color={'black'} size={26} />
            )
          }}
          
        >
          {props => <VideoComponent{...props} addVideo={this.addVideo} />}  
        </CaptureNav.Screen>


        <CaptureNav.Screen 
          name="Audio" 
          options={{
            tabBarLabel:'Audio',
            tabBarIcon : () => (
              <MaterialIcon name='volume-up' color={'black'} size={26} />
            )
          }}
        >
          {props => <AudioComponent{...props} addAudioStream = { this.addAudioStream} />}  

        </CaptureNav.Screen>
         
         <CaptureNav.Screen
          name="File"
          options={{
            tabBarLabel:'File',
            tabBarIcon : () => (
              <MaterialComIcon name='file-plus' color={'black'} size={26} />
            )
          }}
        >
          {props => <FileComponent{...props} addFile = { this.addFile } />}  
        </CaptureNav.Screen> 

      </CaptureNav.Navigator>
    )
  }
}

export default Capture

