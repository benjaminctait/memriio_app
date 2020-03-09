import React, { Component } from 'react';

import { 
    StyleSheet,
    View,
    Text,
  } from 'react-native';


class Feed extends Component{
    render(){
        return(
         
            <View style={styles.mainArea}>
                <Text style={styles.textMain} >Feed</Text>
            </View>
        )
    }
}

export default Feed;

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

