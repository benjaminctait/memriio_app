import React, { Component } from 'react';
import MemoryCard from './cards'
import {getMemories} from './datapass'

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

loadMemories = (memories) => {
this.setState({memories:memories})

memories.map((mem,index) =>{
  console.log('MEMORY ID : ', mem.id);
  console.log('Created on : ', mem.createdon);
  console.log('Title      : ', mem.title);
  console.log('Story      : ', mem.story);
  console.log('Hero shot  : ', mem.fileurl);
  console.log('Userid     : ', mem.userid);
  
})
  
  
}

componentDidMount = () => {
  const userid = 1
  const groups = [0,1] 
  getMemories(userid,groups,this.loadMemories)
      
}

    
render(){
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
}
}

export default Feed;

const styles = StyleSheet.create({
    mainArea:{
      flex:1,
      
    },
    
    textMain:{
      alignItems:'center',
      justifyContent:'center',
      fontSize: 30,
      
      color:'black'
    }
  });

