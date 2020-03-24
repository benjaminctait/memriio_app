import React, { Component } from 'react';
import { Card,ListItem, Button, Icon } from 'react-native-elements'

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
      return (
        <Image
            style={styles.image}
            source={{ uri: ipath }}
        />
      );
    }
}

class CardWithText extends Component{
    
  render(){
    const ipath  = this.props.imgPath
    return (
      <View style={styles.card}>
        <Text style={styles.nameT}>{this.props.imgName}</Text>
        <Image
          style={styles.image}
          source={{ uri: ipath }}
        />
        <Text>asdasd</Text>
        
      </View>
    );
      
  }
}


const styles = StyleSheet.create({
  
  card: {
    
    width: '95%',
    margin: 10,
    backgroundColor: 'white'
    
  },
  image: {
    height:130,
    resizeMode:'contain',
    shadowRadius:5,
    shadowOffset:{  width: 10,  height: 10,  },
    shadowColor: 'gray',
    shadowOpacity: 1.0, 
    
  },
  
  nameT:{
    color: 'black',
    backgroundColor:'transparent',
    marginBottom: 5
  }
  })
  
export default BasicCard


          

