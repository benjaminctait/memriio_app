import React, { Component } from 'react';

import { 
    StyleSheet,
    View,
    Text,  
    Image,
    TextInput,

  } from 'react-native';


class BasicCard extends Component{
    
    render(){
      const ipath  = this.props.imgPath
      
        return(
            <View style={styles.wrapper}>
            <Text>{this.props.imgName}</Text>
            <TextInput style={{backgroundColor : 'white'}} value = {ipath} />
            
        </View>
        )
    }
}

const styles = StyleSheet.create({
    wrapper: {
      flex:1,
      
      backgroundColor:'green',
      margin:5,
      
    }
  })
  
export default BasicCard

// <Image
            //   style={{height: '100%', width: '100%'}}
            //   source={{uri : ipath}}
            // /> 