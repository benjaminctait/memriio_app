import React, { Component } from 'react';
import { Card,ListItem, Button, Icon } from 'react-native-elements'

import { 
    StyleSheet,
    View,
    Text,  
    Image,
    TextInput,

  } from 'react-native';

class MemoryCard extends Component{
  
 
  render(){
    
    return (
      
      <View style={styles.card}>
      <Image
          style={styles.image}
          source={{ uri: this.props.heroimage }}
      />
      <Text style = {styles.titleText} >{this.props.title} </Text>
      <Text style = {styles.bodyText} > {this.props.story}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  
  card: {
    
    width: '100%',
    margin: 0,
    backgroundColor: 'white'
    
  },
  image: {
    height:300,
    resizeMode:'stretch',
  },
  
  titleText:{
    color: 'black',
    fontSize:20,
    fontWeight:'bold',
    
  },
  bodyText:{
    color: 'black',
    fontSize: 15,
  },

})
  
export default MemoryCard;


          

