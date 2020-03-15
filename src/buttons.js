import React, { Component } from 'react';
import { 
    StyleSheet,
    TouchableOpacity,
    Image
  } from 'react-native';

class StartButton extends Component{
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
            source={require('./images/dottedcircle.png')}
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

class CameraButton extends Component{
  render(){
      return(
          <TouchableOpacity onPress={this.props.onPress}>
          <Image
            style={styles.littleButton}
            source={require('./images/camera.png')}
          />
        </TouchableOpacity>
      )
  }
}

const styles = StyleSheet.create({
    bigButton: {
        height: 70,
        width: 70,
        backgroundColor: 'transparent',
        
        
    },
    littleButton: {
      height: 20,
      width: 20,
      backgroundColor: 'transparent',
      
  },
    mediumButton: {
      height: 30,
      width: 30,
      backgroundColor: 'transparent',
      
    }
  });

export {StartButton,PostButton,BackButton,SettingsButton,VideoStartButton,VideoStopButton}