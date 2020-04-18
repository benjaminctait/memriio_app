import React, { Component } from 'react';
import MemoryCard from './cards'
import {getMemories} from './datapass'
import AsyncStorage from '@react-native-community/async-storage'

import { 
    StyleSheet,
    View,
    ScrollView,
    Text,
    Image,
  } from 'react-native';


class Feed extends Component{

state = {
  memories:[]
}

//----------------------------------------------------------------------------------------------

loadMemories = (memories) => {
  this.setState({memories:memories})

  if(memories.length){
    memories.map((mem,index) =>{
      console.log('MEMORY ID : ' +  mem.id + 'Title : ' + mem.title + 'user id : ' + mem.userid);
    })
  }else{
    console.log('No memories to load')
  }
}

//----------------------------------------------------------------------------------------------

componentDidMount = async () => {
  const userid =  await AsyncStorage.getItem('uaserid')
  const groups = [0] 
  getMemories(userid,groups,this.loadMemories)
      
}

//----------------------------------------------------------------------------------------------

render(){

  console.log('number of memories : ' + this.state.memories.length);
  
  
  if(Array.isArray(this.state.memories)){

    return(
      <ScrollView style={styles.mainArea}>
        {this.state.memories.map((mem,index) => (
          
            <MemoryCard 
              key = {index}
              title = {mem.title} 
              story= {mem.story}
              //article = {mem.article}
              heroimage = {mem.fileurl}
              // createdon
              // userid
            ></MemoryCard>
        ))}
                
      </ScrollView>
  )
  }else{
    return(
      <View style={styles.nomemory}>
        <Text style={styles.textMain}>No memories to load</Text>
      </View>
    )
  } 
}

}

//----------------------------------------------------------------------------------------------

export default Feed;

const styles = StyleSheet.create({
    mainArea:{
      flex:1,
    },

    nomemory:{
      flex:1,
      alignItems:'center',
      justifyContent:'center',
    },
    
    textMain:{
      fontSize: 30,
      color:'black'
    }
  });

