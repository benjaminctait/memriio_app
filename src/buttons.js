import React, { Component } from 'react';
import { 
    StyleSheet,
    TouchableOpacity,
    TouchableNativeFeedback,
    Image,
    Text,
    View,
  } from 'react-native';

import {Avatar} from 'react-native-elements'

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

class BlankButton extends Component{
  
  
  render(){
    const { title,source,buttonStyle } = this.props
    let subtitle = title ? <Text style={styles.iconTextUp}>{ title }</Text>:null
   
    return(
        <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={[styles.mediumButton,buttonStyle]}
            source={ source }
          />
          {subtitle}
        </TouchableOpacity>
    )
  }

}

class TextCard extends Component{
  
  
  render(){
    const { text ,source,imageStyle,textStyle,containerstyle } = this.props
    
    return(
        <TouchableOpacity 
            onPress={this.props.onPress}
            style = {[{flex:1,flexDirection:'row',alignItems:'center'},containerstyle]}
            >
          <Image
            style={[{ height: 30,
                      width: 30,
                      alignSelf:'center',
                      backgroundColor: 'transparent',
                    },imageStyle]}
            source={ source }
          />
          <Text style={[{marginLeft:5 },textStyle]}>{text}</Text>
        </TouchableOpacity>
    )
  }

}

class PostButton extends Component{
  
  
  render(){
    let subtitle = null
    if (this.props.Title){
      subtitle = <Text style={styles.iconTextUp}>{this.props.Title}</Text>
    }

    return(
        <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.mediumButton}
            source={require('./images/upload.png')}
          />
          {subtitle}
        </TouchableOpacity>
    )
  }

}

class BackButton extends Component{
  render(){
    let subtitle = null
    if (this.props.Title){
      subtitle = <Text style={styles.iconTextUp}>{this.props.Title}</Text>
    }

      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.mediumButton}
            source={require('./images/back.png')}
          />
          {subtitle}
        </TouchableOpacity>
      )
  }
}

class SettingsButton extends Component{
  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress} style={styles.settingsbutton}>
          <Image
            style={styles.mediumButton}
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

componentDidUpdate = (prevProps,prevState) =>{

  if(this.props !== prevProps){
    this.setState({buttonDown:this.props.buttonDown})
  }
}

//-----------------------------------------------------------

  render(){
    if(this.state.greyOutOnTagPress){
      
      if(this.state.buttonDown){
        
        return(
        <TouchableOpacity onPress={this.onTagPress}>
          <View style={[styles.ptagGreyed,this.props.tagDownStyle]}>
            <Text style={styles.ptagTextGreyed}> {this.props.title}</Text>
            {this.getRightIcon()}
          </View>   
        </TouchableOpacity>  
        )    
      }else{
        
        return (
        <TouchableOpacity onPress={this.onTagPress}>
          <View style={[styles.ptag,this.props.tagUpStyle]}>
            <Text style={[styles.ptagText,this.props.textStyle]}> {this.props.title}</Text>
            {this.getRightIcon()}
          </View>   
        </TouchableOpacity>   
        ) 
      }
    }else{
      return(
        <TouchableOpacity onPress={this.onTagPress}>
          <View style={[styles.ptag,this.props.tagUpStyle]}>
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
    let initials = ''
    
    if(person){
      if ( person.firstname) { initials += person.firstname[0] }
      if ( person.lastname ) { initials += person.lastname[0]  }
    }
   
    if(tagged) {
      checked = <View style={{ alignSelf: 'flex-end',position:'absolute', right:5 }}>
                  <Image
                    style={{ width: 30, height: 30,  margin: 5 }}
                    source={require('./images/checked_blue.png')}
                    resizeMethod={'resize'}
                  />
                </View>
      
    }

    return(
        <TouchableOpacity onPress={this.handleOnPress}>
          <View
            style={{
              flex:1,
              flexDirection:'row',
              borderTopColor:'grey',                
              borderTopWidth:1,
              minHeight:50,
              alignItems:'center',
              paddingLeft:5,
              
            }}
            >
            
            <Avatar
              size="small"
              rounded
              title={initials}
              overlayContainerStyle={{backgroundColor:person.color,justifyContent:'flex-start'}}
              onPress={() => console.log('Author avatar pressed ',author.userid, author.firstname,author.lastname)}
              activeOpacity={0.7}
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

class CloudListItem extends Component{

 
  handleOnPress = () =>{
    this.props.onPress(this.props.cloud)
  }

  render(){
    const {cloud,tagged} = this.props
    let checked = null
    let initials = ''
    
    if(cloud){
      if ( cloud.name ) { 
        if( cloud.name.length > 1 ) initials = cloud.name[0]+ cloud.name[1] 
        else initials = cloud.name[0]
      }
      
    }
   
    if(tagged) {
      checked = <View style={{ alignSelf: 'flex-end',position:'absolute', right:5 }}>
                  <Image
                    style={{ width: 30, height: 30,  margin: 5 }}
                    source={require('./images/checked_blue.png')}
                    resizeMethod={'resize'}
                  />
                </View>
      
    }

    return(
        <TouchableOpacity onPress={this.handleOnPress}>
          <View
            style={{
              flex:1,
              flexDirection:'row',
              borderTopColor:'grey',                
              borderTopWidth:1,
              minHeight:50,
              alignItems:'center',
              paddingLeft:5,
              
            }}
            >
            
            <Avatar
              size="small"
              rounded
              title={initials}
              overlayContainerStyle={{backgroundColor:'blue',justifyContent:'flex-start'}}
              onPress={() => console.log('Cloud avatar pressed ',cloud.id,cloud.name)}
              activeOpacity={0.7}
            />
            
            <View style={{ justifyContent: 'center', marginLeft: 5, fontSize:20}}>
              <Text                   
                style={{ fontSize:15 }}              
              >{`${cloud.name} `}
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

  componentDidMount =()=>{
   
    this.setState({up:!this.props.isDown})
  }

  componentDidUpdate = (prevProps) =>{
    if(prevProps.isDown != this.props.isDown){
      this.setState({up:!this.props.isDown})
    }
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
      alignSelf:'center',
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
        CloudListItem,
        BlankButton,
        TextCard,
      }