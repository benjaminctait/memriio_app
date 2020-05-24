import React, { Component } from 'react';
import MemoryCard from './cards'
import {getMemories,
        activeUser,
        searchMemories,
        mapUserClouds,
       } from './datapass'
import AsyncStorage from '@react-native-community/async-storage'

import { 
    StyleSheet,
    View,
    ScrollView,
    Text,
   
  } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { SubTag } from './buttons';


class Feed extends Component{

state = {
  memories:[],
  userClouds:[],
  user:null,
  searchwordcount:1,

}

//----------------------------------------------------------------------------------------------

handleSearchChange = (searchwords) =>{

  searchwords = searchwords.toLowerCase()
  let wordarray = searchwords.split(' ')
  if(wordarray.length > this.state.searchwordcount){
    this.state.searchwordcount++
    searchMemories(this.state.user.userid,null,wordarray,this.loadMemories)
  }else if(wordarray.length < this.state.searchwordcount){
    this.state.searchwordcount--
    searchMemories(this.state.user.userid,null,wordarray,this.loadMemories)
  }else if(searchwords === ''){
    this.state.searchwordcount = 0
    getMemories(this.state.user.userid,[0],this.loadMemories)
  }
  
}

//----------------------------------------------------------------------------------------------

loadMemories = (memories) => {

  this.setState({memories:memories})
  
}

//----------------------------------------------------------------------------------------------

loadClouds = (clouds) => {

  
  let personal ={
    id:0,
    name:'Peronsal',
    administrator:this.state.user.userid,
    createdon:this.state.user.createdon,    
  }
  clouds.push(personal)
  clouds.reverse()
  console.log('loadClouds ' + JSON.stringify(clouds));
  
  this.setState({userClouds:clouds})
  
}

//----------------------------------------------------------------------------------------------

componentDidMount = async () => {
  this.state.user =  await activeUser()
  const groups = [0] 
  getMemories(this.state.user.userid,groups,this.loadMemories)
  mapUserClouds(this.state.user.userid,this.loadClouds)

      
} 

//----------------------------------------------------------------------------------------------

render(){

  if(Array.isArray(this.state.memories)){
    feedview =
      <ScrollView style={styles.scrollarea}>
      {this.state.memories.map((mem,index) => (
          <MemoryCard 
            key = {index}
            title = {mem.title} 
            description= {mem.description}
            story = {mem.story}
            heroimage = {mem.fileurl}
            heroExtension = {mem.fileext}
            createdon = {mem.createdon}
            userid = {mem.userid}

          ></MemoryCard>
      ))}     
    </ScrollView>

    }else{
      feedview = 
        <View style={styles.nomemory}>
          <Text style={styles.textMain}>Hi {this.state.user.firstName}</Text>
          <Text style={styles.textMain}>No memories to load</Text>
        </View>
    }

    return(
      <View style = {styles.mainArea}>
        <TextInput
          style={styles.searchfield}
          placeholder="Search..."
          placeholderTextColor="grey"
          onChangeText = {(text) => {this.handleSearchChange(text)}}
        />
        {feedview}
        <View style={styles.cloudarea}>
          {this.state.userClouds.map((cloud) => (
            <SubTag  
              title = {cloud.name} 
              rightIconUp   =   {require('./images/checked_blue.png')}
              rightIconDown =   {require('./images/x-symbol.png')}
              switchRightIconOnTagPress = {true}
              textStyle = {styles.ptagText}
              tagStyle = {styles.ptag}
            />
            ))}   
        </View> 
    </View>
  )
  
}

//----------------------------------------------------------------------------------------------

}

export default Feed;

const styles = StyleSheet.create({
    mainArea:{
      flex:1,
    },
    scrollarea:{
      height:1000,
      paddingVertical:1,
    },

    nomemory:{
      flex:1,
      alignItems:'center',
      justifyContent:'center',
    },
    
    textMain:{
      fontSize: 30,
      color:'black'
    },
    cloudarea :{
      flex:0,
      flexDirection:'row',
      justifyContent:'flex-start',
      
      marginTop:0,
      padding:5,
      paddingTop:8,
      marginLeft:2,
      marginRight:2,
      borderTopWidth:1,
      
      
      
      borderColor:'gray',
      backgroundColor:'white',
    },

    searchfield:{
      marginTop:5,
      marginBottom:2,
      marginLeft:2,
      marginRight:2,
      paddingTop:8,
      paddingBottom:8,
      paddingLeft:8,
      backgroundColor:'white',
      fontSize:18,
      borderWidth:1,
      borderRadius:5,
      borderColor:'gray',
    },
    ptagText:{
      fontSize:15,
    },
    ptag:{
      borderWidth:1,
      borderRadius:5,
      paddingHorizontal:4,
      paddingBottom:4,
      paddingTop:4,
      marginRight:4,
      marginBottom:4,
      borderColor:'#db5c1d',
      backgroundColor:'#f5f5f5',
    }
  });

