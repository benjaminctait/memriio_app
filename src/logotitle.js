import React, { Component } from 'react';
import { 
    StyleSheet,
    Text,
    View,
    Image
  } from 'react-native';

class LogoTitle extends Component{
    render(){
        return(
            <View style={styles.mainArea}>
                <Text style={styles.textMain} > memriio </Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    mainArea:{
      flex:1,
      alignItems:'center',
      justifyContent:'center',
    },    
    textMain:{
      alignItems:'center',
      justifyContent:'center',
      fontSize: 15,
      color:'black'
    }
  });

export default LogoTitle