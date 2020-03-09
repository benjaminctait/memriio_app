import React, { Component } from 'react';

import { 
    StyleSheet,
    View,
    Text,
  } from 'react-native';


class File extends Component{
    render(){
        return(
         
            <View style={styles.mainArea}>
                <Text style={styles.textMain} >File</Text>
            </View>
        )
    }
}

export default File;

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