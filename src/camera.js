import React, { Component } from 'react';
import {RNCamera } from 'react-native-camera'
import {StartButton,BackButton,PostButton} from './buttons'


import { 
    StyleSheet,
    View,
    Text,
    Button,
    TouchableOpacity
 
  } from 'react-native';



class Camera extends Component{


  takePicture = async () => {
    if (this.camera) {
      const data = await this.camera.takePictureAsync();
      alert(data.uri)
    }
  };

    render(){
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
                    
                    onPress={() => this.props.navigation.navigate('Feed')}
                    
                  />
                  <StartButton
                    onPress={this.takePicture}                     
                  />
                  <PostButton

                  />
                </View>
            </View>
        )
    }
}

export default Camera;

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

  // <Button
  //   title="Press me"
  //   
  // />
