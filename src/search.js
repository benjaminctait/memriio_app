import React, { Component } from 'react';
import { 
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
  } from 'react-native';

import {    
    VideoStartButton,
  } from './buttons'


import MovtoMp4 from 'react-native-mov-to-mp4'


class Search extends Component{

//--------------------------------------------------------------------------------

  handleTagPress = () => {

    const source = '/Users/bentait/Downloads/testmov.mov'
   
    let fname = Date.now().toString() + '.mp4' 
    console.log('fname : ' + fname);
    
    MovtoMp4.convertMovToMp4(source,fname,function(result){
      console.log(result);
      
    })
   

  }

//--------------------------------------------------------------------------------

    render(){
        return(
         
            <View style={styles.mainArea}>
                <Text style={styles.textMain} >Search</Text>

                <TouchableOpacity onPress={this.handleTagPress}>
                  <Text>Convert</Text>
                </TouchableOpacity>
                 

         
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
