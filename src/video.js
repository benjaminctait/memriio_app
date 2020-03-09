import React, { Component } from 'react';

import { 
    StyleSheet,
    View,
    Text,
  } from 'react-native';


class Video extends Component{
    render(){
        return(
         
            <View style={styles.mainArea}>
                <Text style={styles.textMain} >Video</Text>
            </View>
        )
    }
}

export default Video;

const styles = StyleSheet.create({
    mainArea:{
      flex:1,
      alignItems:'center',
      justifyContent:'center',
    },
    
    textMain:{
      alignItems:'center',
      justifyContent:'center',
      fontSize: 30,
      color:'black'
    }
  });