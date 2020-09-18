import React, { Component } from 'react';
import { 
    StyleSheet,
    TouchableOpacity,
    TouchableNativeFeedback,
    Image,
    Text,
    View,
  } from 'react-native';

class CameraClickButton extends Component{
    render(){
        return(
            <TouchableOpacity onPress={this.props.onPress}>
            <Image
              style={styles.bigButton}
              source={require('./images/capture.png')}
            />
          </TouchableOpacity>
        )
    }
}

class VideoStartButton extends Component{
  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress} style={this.props.style}>
          <Image
            style={[styles.bigButton,this.props.imageStyle]}
            source={require('./images/dottedcircleplay.png')}
          />
          
        </TouchableOpacity>
      )
  }
}

class VideoStopButton extends Component{
  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress} style={this.props.style}>
          <Image
            style={[styles.bigButton,this.props.imageStyle]}
            source={require('./images/dottedcircleStop.png')}
          />
        </TouchableOpacity>
      )
  }
}

class AudioStartButton extends Component{
  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.bigButton}
            source={require('./images/dottedcircle.png')}
          />
        </TouchableOpacity>
      )
  }
}

class AudioStopButton extends Component{
  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.bigButton}
            source={require('./images/dottedcircleStop.png')}
          />
        </TouchableOpacity>
      )
  }
}

class PostButton extends Component{
  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.mediumButton}
            source={require('./images/post.png')}
          />
        </TouchableOpacity>
      )
  }
}

class BackButton extends Component{
  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.mediumButton}
            source={require('./images/back.png')}
          />
        </TouchableOpacity>
      )
  }
}

class SettingsButton extends Component{
  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress} style={styles.settingsbutton}>
          <Image
            style={styles.littleButton}
            source={require('./images/settings.png')}
          />
        </TouchableOpacity>
      )
  }
}

class IconButtonCamera extends Component{ 
  
  render(){
      if(this.props.selected){
          iconLabel = <Text style={styles.iconTextDown}>Camera</Text>
      }else{
          iconLabel = <Text style={styles.iconTextUp}>Camera</Text>
      }

      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.littleButton}
            source={require('./images/camera.png')}            
          />
          {iconLabel}
        </TouchableOpacity>
        
      )}}
  
class IconButtonVideo extends Component{
  
  
  render(){
      if(this.props.selected){
          iconLabel = <Text style={styles.iconTextDown}>Video</Text>
      }else{
          iconLabel = <Text style={styles.iconTextUp}>Video</Text>
      }

      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.littleButton}
            source={require('./images/video.png')}            
          />
          {iconLabel}
        </TouchableOpacity>
        
      )}}

class IconButtonAudio extends Component{
  
  render(){
      if(this.props.selected){
          iconLabel = <Text style={styles.iconTextDown}>Audio</Text>
      }else{
          iconLabel = <Text style={styles.iconTextUp}>Audio</Text>
      }

      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.littleButton}
            source={require('./images/speaker.png')}            
          />
          {iconLabel}
        </TouchableOpacity>
        
      )}}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

class SubTag extends Component{
  
  //onRightIconPress
  //tagStyle
  //textStyle
  //rightIconStyle
  //title
  //rigthIconUp
  //rightIconDown
  //switchRightIconOnTagPress
  //swithLeftIconOnTagPress

  constructor(props){
    super(props)
    this.state.switchRightIconOnTagPress  = props.switchRightIconOnTagPress
    this.state.switchLeftIconOnTagPress   = props.switchLeftIconOnTagPress
    this.state.greyOutOnTagPress          = props.greyOutOnTagPress
    this.state.buttonDown                 = props.buttonDown
 
    
  }

  state ={
    rightUp:true,
    
    leftUp:true,
    buttonDown:false,
    switchRightIconOnTagPress:false,
    switchLeftIconOnTagPress:false,
    greyOutOnTagPress:false,
  }

//-----------------------------------------------------------
onTagPress = () =>{

  if(this.state.switchRightIconOnTagPress){

    let x = !this.state.rightUp
    this.setState({rightUp:x})
  }
  if(this.state.switchLeftIconOnTagPress){
    let x = !this.state.leftUp
    this.setState({leftUp:x})
  }
  if(this.state.greyOutOnTagPress){
    this.setState({buttonDown:!this.state.buttonDown})
  }
  if(this.props.onTagPress)
  { 
    this.props.onTagPress( this.props.data, this.state.buttonDown )
  }
  
}

//-----------------------------------------------------------
onRightIconPress = () =>{
  let x = !this.state.rightUp
  this.setState({rightUp:x})
  this.props.onRightIconPress
}

//-----------------------------------------------------------
onLeftIconPress = () => {
  let x = !this.state.leftUp
  this.setState({leftUp:x})
  this.props.onLeftIconPress
  
}

//-----------------------------------------------------------
getRightIcon = () => {
  if(this.state.rightUp){
    return(
      <Image
        onPress={this.onRightIconPress}
        style={[styles.badge,this.props.rightIconStyle]}
        source={this.props.rightIconUp}            
      />
    )
  }else{
    return (
      <Image
        onPress={this.onRightIconPress}
        style={[styles.badge,this.props.rightIconStyle]}
        source={this.props.rightIconDown}            
      />
    )
  }
}
//-----------------------------------------------------------

  render(){
    if(this.state.greyOutOnTagPress){
      if(this.state.buttonDown){
        return(
        <TouchableOpacity onPress={this.onTagPress}>
          <View style={styles.ptagGreyed}>
            <Text style={styles.ptagTextGreyed}> {this.props.title}</Text>
            {this.getRightIcon()}
          </View>   
        </TouchableOpacity>  
        )    
      }else{
        return (
        <TouchableOpacity onPress={this.onTagPress}>
          <View style={[styles.ptag,this.props.tagStyle]}>
            <Text style={[styles.ptagText,this.props.textStyle]}> {this.props.title}</Text>
            {this.getRightIcon()}
          </View>   
        </TouchableOpacity>   
        ) 
      }
    }else{
      return(
        <TouchableOpacity onPress={this.onTagPress}>
          <View style={[styles.ptag,this.props.tagStyle]}>
            <Text style={[styles.ptagText,this.props.textStyle]}> {this.props.title}</Text>
            {this.getRightIcon()}
          </View>   
      </TouchableOpacity>     
    )}}
    }
      

//-----------------------------------------------------------------------------

class PersonTag extends Component{

  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress}>
            <View style={styles.ptag}>
              <Text style={styles.ptagText}> {this.props.title}</Text>
            </View>   
        </TouchableOpacity>     
      )}}

//-----------------------------------------------------------------------------

class PersonListItem extends Component{

 
  handleOnPress = () =>{
    this.props.onPress(this.props.person)
  }

  render(){
    const {person,tagged} = this.props
    let checked = null
   
      if(tagged) {
        checked = <View style={{ justifyContent: 'flex-end'}}>
                    <Image
                      style={{ width: 30, height: 30,  margin: 5 }}
                      source={
                        person.avatar  ? {uri: person.avatar} : require('./images/checked_blue.png')
                      }
                      resizeMethod={'resize'}
                    />
                  </View>
        
      }

      return(
          <TouchableOpacity onPress={this.handleOnPress}>
            <View
              style={{
                flexDirection: 'row',
                borderTopColor:'grey',                
                borderTopWidth:1,
              }}
              >
              
              <Image
                style={{ width: 30, height: 30, borderRadius: 20,borderColor:'black', margin: 5}}
                source={
                  person.avatar  ? {uri: person.avatar} : require('./images/lego_head.png')
                }
                resizeMethod={'resize'}
              />
              
              <View style={{ justifyContent: 'center', marginLeft: 5, fontSize:20}}>
                <Text                   
                  style={{ fontSize:15 }}              
                >{`${person.firstname} ${person.lastname}`}
                </Text>
              </View>
              
              {checked}
              
            </View> 
        </TouchableOpacity>     
      )
    }


}
      
            
//-----------------------------------------------------------------------------



class LocationTag extends Component{

 

  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <View style={[styles.ptag,this.props.tagstyle]}>
          <Text style={[styles.ptagText,this.props.textstyle]}> {this.props.title}</Text>
          </View>   
        </TouchableOpacity>     
      )}}

//-----------------------------------------------------------------------------

class IconButtonFile extends Component{
  
  
  render(){
      if(this.props.selected){
          iconLabel = <Text style={styles.iconTextDown}>File</Text>
      }else{
          iconLabel = <Text style={styles.iconTextUp}>File</Text>
      }

      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.littleButton}
            source={require('./images/file.png')}            
          />
          {iconLabel}
        </TouchableOpacity>
        
      )}}

//-----------------------------------------------------------------------

class SwitchIcon extends Component{
  
  state = {
    up:true, 
  }
  
  handleOnPress = () =>{
      let newval = !this.state.up
      this.setState({up:newval})
      this.props.onPress()
  }

  render(){
   
      if(this.state.up){
        imgsrc = this.props.upImage
      }else{
        imgsrc = this.props.downImage
      }

      return(
          <TouchableOpacity onPress={this.handleOnPress}>
          <Image
            style={styles.mediumButton}
            source={imgsrc}          
          />          
        </TouchableOpacity>
        
      )}}


            
const styles = StyleSheet.create({
    
    bigButton: {
        height: 70,
        width: 70,
        backgroundColor: 'transparent',
    },
    littleButton: {
      height: 20,
      width: 20,
      alignSelf:'center',
      backgroundColor: 'transparent',  
    },
    settingsbutton:{
      marginRight:5,
    },

    badge: {
      height: 12,
      width: 12,
      marginLeft:2,
      marginTop:2,
      backgroundColor: 'transparent',  
    },

    iconTextUp: {
      color:'grey',
      justifyContent:'center',
    },

    iconTextDown: {
      color:'red',
      justifyContent:'center',
    },

    mediumButton: {
      height: 30,
      width: 30,
      backgroundColor: 'transparent',
      
    },
    ptag:{
      flex:0,
      flexDirection:'row',
      justifyContent:'space-between',
      borderColor:'green',
      backgroundColor:'#f5f5f5',
      borderWidth:0.5,
      borderRadius:10,
      paddingHorizontal:4,
      paddingBottom:2,
      marginRight:4,
      marginBottom:4,

    },
    ptagGreyed:{
      flex:0,
      flexDirection:'row',
      justifyContent:'space-between',
      borderColor:'grey',
      backgroundColor:'white',
      borderWidth:0.5,
      borderRadius:10,
      paddingHorizontal:4,
      paddingBottom:2,
      marginRight:4,
      marginBottom:4,

    },

    ptagText:{
      fontSize:15,
    },

    ptagTextGreyed:{
      fontSize:14,
      color:'grey'
    },


  });

export {CameraClickButton,
        PostButton,
        BackButton,
        SettingsButton,
        VideoStartButton,
        VideoStopButton,
        AudioStartButton,
        AudioStopButton,
        IconButtonCamera,
        IconButtonVideo,
        IconButtonFile,
        IconButtonAudio,
        PersonTag,
        LocationTag,
        SubTag,
        SwitchIcon,
        PersonListItem,
      }