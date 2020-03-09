import React, { Component } from 'react';

import { 
    StyleSheet,
    View,
    Text,
  } from 'react-native';


class Audio extends Component{
    render(){
        return(
         
            <View style={styles.mainArea}>
                <Text style={styles.textMain} >Audio</Text>
            </View>
        )
    }
}

export default Audio;

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
