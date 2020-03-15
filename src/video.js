import React, { Component } from 'react';
import {RNCamera } from 'react-native-camera'
import {VideoStartButton,VideoStopButton,BackButton,PostButton} from './buttons'

import { 
    StyleSheet,
    View,
  } from 'react-native';


class Video extends Component{

  state = {
    isRecording:false,
    hasFocus : false
  }

  componentDidMount(){
    this.setState({hasFocus:true})
    this.props.navigation.addListener('blur',this.detachCamera)
  }

  detachCamera() {
    if (this.camera) {
    this.setState({hasFocus:false})
    }
    alert('blur')
    
  }
  
  startRecording = async () => {
    if (this.camera) {
      this.setState({isRecording:true})
      const data = await this.camera.recordAsync({})
      this.props.addVideo(data.uri)
      
    }
  };

  stopRecording = async = () => {
    if (this.camera) {
      this.camera.stopRecording()
      this.setState({isRecording:false})
    }
  }

  
    render(){

      
        if (this.state.isRecording){
          vidButton = <VideoStopButton onPress={this.stopRecording} />   
        } else {
          vidButton = <VideoStartButton onPress={this.startRecording} />  
        }
        if ( !this.state.hasFocus ){
          alert('no focus')
          return <View />
        } else {
          return(
         
            <View style={styles.container}>
              
                <RNCamera
                  ref = {ref => { this.camera = ref}}
                  style = {styles.preview}
                  type = {RNCamera.Constants.Type.back}
                  flashMode = {RNCamera.Constants.flashMode}
                />
                <View style={{
                    
                    flexDirection:'row',
                    justifyContent:'space-between',
                    alignItems:'center',
                    margin:10
                    
                  }}>
                  <BackButton 
                    onPress={() => this.props.navigation.navigate('Feed')}/>
                  
                    {vidButton}               
                  
                  <PostButton />

                </View>
            </View>
        )
        }
        
    }
}

export default Video;

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
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  });