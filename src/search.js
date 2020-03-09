import React, { Component } from 'react';

import { 
    StyleSheet,
    View,
    Text,
  } from 'react-native';


class Search extends Component{
    render(){
        return(
         
            <View style={styles.mainArea}>
                <Text style={styles.textMain} >Search</Text>
            </View>
        )
    }
}

export default Search;

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

