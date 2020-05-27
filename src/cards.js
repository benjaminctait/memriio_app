import React, { Component } from 'react';
import {SwitchIcon} from './buttons'
import VideoPlayer from './videoplayer'


import { 
    StyleSheet,
    View,
    Text,  
    Image,

  } from 'react-native';


class MemoryCard extends Component{
  constructor(props){
    super(props)
    this.handleOnExpand.bind(this)
    this.handleOnLike.bind(this)
  }


  state ={
    storyVisible:false
  }

//----------------------------------------------------------------

handleOnShare = () =>{
  console.log('MemoryCard : handleOnShare ');
  
}

//----------------------------------------------------------------

handleOnLike = () =>{
  console.log('MemoryCard : handleOnLike ');
  
}

//----------------------------------------------------------------

handleOnComment = () =>{
  console.log('MemoryCard : handleOnComment ');
  
}

//----------------------------------------------------------------

handleOnExpand = () =>{  
  let newval = !this.state.storyVisible
  this.setState({storyVisible:newval})
}

//----------------------------------------------------------------

getLower = () =>{
 
  if(this.state.storyVisible){
    return (
      <View style={styles.storyarea}>
        <Text style = {styles.titleText} >{this.props.title} </Text>
        <Text style = {styles.italicText} >{this.props.description}</Text>
        <Text style = {styles.bodyText} >{this.props.story}</Text>
      </View>
    )
  }else{
    return (
      <View style={styles.titleblock}>
      <Text style = {styles.titleText} >{this.props.title} </Text>
      <Text style = {styles.bodyText} >{this.props.description}</Text>
      
    </View>
     
    )
  }
}

//----------------------------------------------------------------

getFileView =  () => {

  
  if(this.props.heroExtension == 'jpg'){
    return (
      <Image
        style={styles.image}
        source={{ uri: this.props.heroimage }}
      />
      )      
  }else if(this.props.heroExtension == 'mov') {
    return (
      <VideoPlayer 
      source ={this.props.heroimage }
      />
    )
  }
}


//----------------------------------------------------------------

  render(){
    let lower     = this.getLower()
    let fileview  = this.getFileView()
    
    return (
      
      <View style={styles.card}>
      {fileview}
      <View style={styles.iconrow}>
        <View style={styles.iconrow}>

          <SwitchIcon // Like heart
            onPress = {this.handleOnLike}
            upImage = {require('./images/heart_blue.png')}
            downImage = {require('./images/heart_red.png')}
          />

          <SwitchIcon // Share icon
            onPress = {this.handleOnShare}
            upImage = {require('./images/share_green.png')}
            downImage = {require('./images/share_green.png')}
          />

          <SwitchIcon // Comment icon
            onPress = {this.handleOnComment}
            upImage = {require('./images/comment_purple.png')}
            downImage = {require('./images/comment_purple.png')}
          />
        </View>
          <View style={styles.iconrow}></View> 
          <View style={styles.iconrow}>
          <SwitchIcon // Story expand icon
                onPress = {this.handleOnExpand}
                upImage = {require('./images/chevron_down_purple.png')}
                downImage = {require('./images/chevron_up_purple.png')}
              />
          </View>
      </View>
        
        {lower}
    </View>
    )
  }

};

//------------------------------------------------------------------------------------

const styles = StyleSheet.create({
  
  titleblock:{
    marginLeft:8,
  },

  storyarea:{
    marginLeft:40,
    marginRight:40,
    marginBottom:20,
  },

  iconrow :{
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:4,
    marginLeft:4,
    marginRight:4,
  },

  card: {
    
    width: '100%',
    margin: 0,
    backgroundColor: 'white'
    
  },
  image: {
    height:300,
    resizeMode:'cover'
  },
  
  titleText:{
    color: 'black',
    marginTop:5,
    marginBottom:5,
    fontSize:20,
    fontWeight:'bold',
    
  },
  bodyText:{
    color: 'black',
    fontSize: 15,
    marginBottom:10,
  },

  italicText:{
    color: 'black',
    fontSize: 15,
    marginBottom:10,
    fontStyle:'italic'
  }

})
  
export default MemoryCard;


          

