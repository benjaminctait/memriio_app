import React, { Component } from 'react';
import {RNCamera } from 'react-native-camera'
import AsyncStorage from '@react-native-community/async-storage'
import fs from 'react-native-fs';
 

import {CameraClickButton,
        BackButton,
        PostButton,
        VideoStartButton,
        AudioStartButton,
        VideoStopButton,
        AudioStopButton,
        IconButtonCamera,
        IconButtonVideo,
        IconButtonAudio,
        IconButtonFile,
      } from './buttons'


import { 
    StyleSheet,
    View,    
  } from 'react-native';


class CaptureComponent extends Component{

  state = {
    mode:'camera',
    isRecordingVideo:false,
    isRecordingAudio:false,
    icount:0,
    vcount:0,
    acount:0,
    fcount:0,
  }


  startRecordingVideo = async () => {
    if (this.camera) {
      this.setState({isRecordingVideo:true})
      const data = await this.camera.recordAsync({})

      this.setState({vcount:this.state.vcount+1})
      try{
        await AsyncStorage.setItem( 'video - ' + this.state.vcount , data.uri )
        alert('called')
      } catch (err) {
        alert(err)
      }
    }
  };

  stopRecordingVideo = async  () => {
    if (this.camera) {
      this.camera.stopRecording()
      this.setState({isRecordingVideo:false})
    }
  }

  startRecordingAudio = async () => {
    alert('start audio')
  };

  stopRecordingAudio = async () => {
    alert('stop audio')
  }

  takePicture = async () => {
    if (this.camera) {
      
      
      this.setState({vcount:this.state.vcount+1})
      try{
        const data = await this.camera.takePictureAsync();
        const key = 'image-' + this.state.vcount
        const fullpath = data.uri.split('//')[1];
        
        await AsyncStorage.setItem( key , fullpath )
        alert( key + ' : ' + fullpath)

        

      } catch (err) {
        alert(err)
      }
    }
  }

  showMode = (modeName) =>  {
    this.setState({mode:modeName})
  }

  showPost = () => {
    this.props.navigation.navigate('NewPost')
  }
    
  


    render(){
      switch ( this.state.mode ){
        case 'camera' :

          bigButton = <CameraClickButton onPress={this.takePicture} /> 
          break;
        case 'video' :

          if (this.state.isRecordingVideo){
            bigButton = <VideoStopButton onPress={this.stopRecordingVideo} />   
          } else {
            bigButton = <VideoStartButton onPress={this.startRecordingVideo} />  
          }
          break;
        case 'audio' : 

          if (this.state.isRecordingAudio){
            bigButton = <AudioStopButton onPress={this.stopRecordingAudio} />   
          } else {
            bigButton = <AudioStartButton onPress={this.startRecordingAudio} />  
          }
          break;
        case 'file' :

          bigButton = <VideoStartButton onPress={this.startRecordingVideo} />
          break;

      }
      
       
        return(

            
            <View style={styles.container}>
                <RNCamera
                  ref = {ref => { this.camera = ref}}
                  style = {styles.preview}
                  type = {RNCamera.Constants.Type.back}
                  flashMode = {RNCamera.Constants.flashMode}
                />
                
                  <View style={styles.modeButtons} >
                    <IconButtonCamera onPress={() => this.showMode('camera')} selected={this.state.mode=='camera'} />
                    <IconButtonVideo onPress={() => this.showMode('video')} selected={this.state.mode=='video'} />
                    <IconButtonAudio onPress={() => this.showMode('audio')} selected={this.state.mode=='audio'} />
                    <IconButtonFile onPress={() => this.showMode('file')} selected={this.state.mode=='file'} />
                  </View> 

                  <View style={styles.mainButtons}>
                  
                      <BackButton onPress={() => this.props.navigation.navigate('Feed')} />
                      {bigButton}
                      <PostButton onPress={() => this.showPost() } />

                  </View>
                
            </View>
        )
    }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mainButtons: {
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    backgroundColor:'transparent',
    margin:10,
    borderBottomWidth:10,
  },

  modeButtons: {
    flexDirection:'row',
    justifyContent:'space-between',
    alignSelf:'center',
    alignItems:'center',
    backgroundColor:'transparent',
    margin:5,
    width:'80%'
  },

  });

  export default CaptureComponent; 

  //const filename = fullpath.replace(/^.*[\\\/]/, '')
  // const newpath = this.state.targetFolder + filename

  // alert( key + ' : ' + newpath)
        
  // await fs.moveFile(fullpath,newpath)