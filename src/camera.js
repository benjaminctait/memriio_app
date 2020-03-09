import React, { Component } from 'react';
import {RNCamera } from 'react-native-camera'


import { 
    StyleSheet,
    View,
    Text,
    Button,
    TouchableOpacity
 
  } from 'react-native';



class Camera extends Component{


    render(){
        return(
         
            <View style={styles.container}>
                <RNCamera
                  ref = {ref => { this.camera = ref}}
                  style = {styles.preview}
                  type = {RNCamera.Constants.Type.back}
                  flashMode = {RNCamera.Constants.flashMode}

                />
                <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity 
                    onPress={this.takePicture} 
                    style={styles.capture}>
                    <Text style={{ fontSize: 14 }}> SNAP </Text>
                  </TouchableOpacity>
                </View>
                <Button
                  title="Press me"
                  onPress={() => this.props.navigation.navigate('Feed')}
                  />
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

