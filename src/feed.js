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
}

componentDidMount () {
  const userid = 0
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
                heroimage = {mem.remoteURLS[0]}
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

