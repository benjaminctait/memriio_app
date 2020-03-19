import React, { Component } from 'react';
import BasicCard from './cards'
import AsyncStorage from '@react-native-community/async-storage'

import { 
    StyleSheet,    
    ScrollView,  
    Button,
    View,
  } from 'react-native';


class NewPost extends Component{
    
  state={
    content:[]
  }

   buttonclick = async () => {
    try{
      const item = []
      const keys =  await AsyncStorage.getAllKeys()
      
      await AsyncStorage.multiGet(keys,(err,stores) => { 
        this.setState({content:stores})
      })
      
    }catch (e) {
      alert(e)
    }
   
  }

  

  render(){
    
    return( 
      <View style={styles.container}>
        <ScrollView style={styles.preview}>
          { this.state.content.map((result,i,item) => (
            
            <BasicCard 
              imgName={item [i] [0] } 
              imgPath={item [i] [1] } />
          )) }
        </ScrollView>
        <View>
        <Button 
          title="click"
          onPress={this.buttonclick}
          />
        </View>
      </View>
    
    )
  }
}

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },   
  preview: {
    flex: 1,
    
  },
  
});

// { this.state.content.map((result,i,item) => (
//   <BasicCard 
//     imgName={item [i] [0] } 
//     imgPath={item [i] [1] } />
// )) }