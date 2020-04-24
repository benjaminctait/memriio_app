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
          <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.bigButton}
            source={require('./images/dottedcircleplay.png')}
          />
          
        </TouchableOpacity>
      )
  }
}

class VideoStopButton extends Component{
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
          <TouchableOpacity onPress={this.props.onPress}>
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

class PersonTag extends Component{

  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <View style={styles.ptag}>
          <Text style={styles.ptagText}> {this.props.title}</Text>
          </View>   
        </TouchableOpacity>     
      )}}

class LocationTag extends Component{

  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <View style={styles.ptag}>
          <Text style={styles.ptagText}> {this.props.title}</Text>
          </View>   
        </TouchableOpacity>     
      )}}

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
      borderColor:'green',
      backgroundColor:'#f5f5f5',
      borderWidth:0.5,
      borderRadius:10,
      paddingHorizontal:4,
      paddingBottom:2,
      marginRight:4,
      marginBottom:4,

    },

    ptagText:{
      fontSize:10,

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
      }