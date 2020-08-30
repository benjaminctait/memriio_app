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
               <Image
                  style={styles.logo}
                  source={require('./images/memrii_logo.png')}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    mainArea:{
      flex:1,
      justifyContent:'center',
    },    
    textMain:{
      alignItems:'center',
      justifyContent:'center',
      fontSize: 15,
      color:'black'
    },
    logo: {
      
      width: 100,
      marginBottom: 5,
      marginLeft:5,
      resizeMode:'contain',
      
      backgroundColor: 'transparent',
    },
  });

export default LogoTitle

