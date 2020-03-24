import React, { Component } from 'react';

import { 
    StyleSheet,
    View,
    Text,
    Image,
  } from 'react-native';


class Feed extends Component{
    render(){
        return(
         
            <View style={styles.mainArea}>
                <Text style={styles.textMain} >Feed</Text>
                <Image
                  style={{ height: '100%', width: '100%'}}
                  source={{uri:'/Users/bentait/Pictures/cow.jpg'}}
                  resizeMode='contain'
            /> 
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

