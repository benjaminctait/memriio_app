import React, {Component} from 'react';
import {Dimensions, StyleSheet, View, Text} from 'react-native';
import Video from 'react-native-video';
import {getObjectSignedurl} from './datapass';
import {VideoStartButton, VideoStopButton} from './buttons';

class VideoPlay extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    paused: true,
    signedurl: '',
    originalsource: '',
  };

  position = {
    start: null,
    end: null,
  };

  // -------------------------------------------------------------------------------------------

  async componentDidMount() {
    let tmp = this.props.source.split('/');
    this.setState({poster: this.props.poster});
    getObjectSignedurl(tmp[tmp.length - 1]).then((surl) => {
      this.setState({signedurl: surl, originalsource: this.props.source});
    });
  }

  // -------------------------------------------------------------------------------------------

  onPlayPress = (e) => {
    let newvar = !this.state.paused;
    this.setState({paused: newvar});
  };

  // -------------------------------------------------------------------------------------------

  getVideoControls = () => {
    if(!this.props.nativeControls){
      if (this.state.paused) {
        return (
          <VideoStartButton
            style={styles.absoluteCenter}
            onPress={this.onPlayPress}
          />
        );
      } else {
        return (
          <VideoStopButton
            style={styles.bottomLeft}
            imageStyle={{height: 40, width: 40}}
            onPress={this.onPlayPress}
          />
        );
      }
    }else{
      return null
    }
    
  };

  // -------------------------------------------------------------------------------------------

  render() {
    const {width} = Dimensions.get('window');
    
    if (this.state.signedurl !== '') {
      return (
        <View>
          <Video
            repeat
            style            = { this.props.style?this.props.style:{width, height: 300}}
            resizeMode       = { this.props.resizeMode?this.props.resizeMode:'cover'}
            source           = { {uri: this.state.originalsource}}
            controls         = { this.props.nativeControls }
            paused           = { this.state.paused}
            posterResizeMode = { this.props.resizeMode?this.props.resizeMode:'cover'}
            poster           = { this.state.poster}
          />
          {this.getVideoControls()}
        </View>
      );
    } else {
      return <Text>Loading...</Text>;
    }
  }
}

const styles = StyleSheet.create({
  iconrow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginLeft: 4,
    marginRight: 4,
  },

  absoluteCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex:1,
  },

  bottomLeft: {
    position: 'absolute',
    bottom: 25,
    left: 25,
    zIndex:1
  },
});

export default VideoPlay;
