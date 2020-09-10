import React, {Component} from 'react';
import {RNCamera} from 'react-native-camera';
import AsyncStorage from '@react-native-community/async-storage';
import {cleanupStorage} from './datapass';
import MovtoMp4 from 'react-native-mov-to-mp4';
import {createThumbnail} from 'react-native-create-thumbnail';

import {
  CameraClickButton,
  BackButton,
  PostButton,
  VideoStartButton,
  AudioStartButton,
  VideoStopButton,
  AudioStopButton,
  IconButtonCamera,
  IconButtonVideo,
  IconButtonAudio,
  IconButtonFile,
} from './buttons';

import {StyleSheet, View} from 'react-native';
import {H2} from 'native-base';

class CaptureComponent extends Component {
  state = {
    mode: 'camera',
    isRecordingVideo: false,
    isRecordingAudio: false,
    icount: 0,
    vcount: 0,
    acount: 0,
    fcount: 0,
    elapsed: 0,
    takingPic: false,
  };

  //--------------------------------------------------------------------------------------

  async componentDidMount() {
    console.log('catpure did load called');

    await cleanupStorage();
    await AsyncStorage.getAllKeys().then(keys => {
      console.log('capture-didmount getallkeys : ' + keys);
    });
  }

  //--------------------------------------------------------------------------------------

  startRecordingVideo = async () => {
    console.log('startRecordingVideo vcount' + this.state.vcount);

    if (this.camera) {
      try {
        this.setState({isRecordingVideo: true});
        const promise = await this.camera.recordAsync({});

        if (promise) {
          const data = await promise;
          this.setState({
            isRecordingVideo: false,
            vcount: this.state.vcount + 1,
          });
          let fname = Date.now().toString() + '.mp4';
          MovtoMp4.convertMovToMp4(
            data.uri,
            fname,
            this.littlecallback.bind(this),
          );
        }
      } catch (err) {
        alert('Video error' + err);
      }
    }
  };

  //--------------------------------------------------------------------------------------
  littlecallback = result => {
    console.log('littlecallback' + result);
    AsyncStorage.setItem('video- ' + this.state.vcount, result);
    createThumbnail({
      url: result,
      timeStamp: 10000,
    }).then(thumbnail => {
      console.log('littlecallback thumbnail: ' + thumbnail.path);
      AsyncStorage.setItem('video-thumb- ' + this.state.vcount, thumbnail.path);
    });
  };

  //--------------------------------------------------------------------------------------
  stopRecordingVideo = async () => {
    console.log('stopRecordingVideo vcount' + this.camera);

    if (this.camera) {
      console.log('stopRecordingVideo : this.camera ' + this.camera);
      this.camera.stopRecording();
    }
  };

  //--------------------------------------------------------------------------------------

  startRecordingAudio = async () => {
    alert('start audio');
  };

  //--------------------------------------------------------------------------------------

  stopRecordingAudio = async () => {
    alert('stop audio');
  };

  //--------------------------------------------------------------------------------------

  takePicture = async () => {
    if (this.camera) {
      this.setState({vcount: this.state.vcount + 1});
      this.setState({takingPic: true});
      console.log('capture.takePicture() ' + this.camera);
      try {
        const data = await this.camera.takePictureAsync();
        const fullpath = data.uri.split('//')[1];
        AsyncStorage.setItem('image-' + this.state.vcount, fullpath);
        AsyncStorage.setItem('image-thumb-' + this.state.vcount, fullpath);
        console.log('pic taken successfuly:');
      } catch (err) {
        console.log('error while taking pic:');
        alert(err);
      }
    }
  };

  //--------------------------------------------------------------------------------------

  showMode = modeName => {
    this.setState({mode: modeName});
  };

  //--------------------------------------------------------------------------------------

  showPost = () => {
    this.props.navigation.navigate('NewPost');
  };

  //--------------------------------------------------------------------------------------

  render() {
    let bigButton;
    switch (this.state.mode) {
      case 'camera':
        console.log('opening camera');
        bigButton = <CameraClickButton onPress={this.takePicture} />;
        break;
      case 'video':
        if (this.state.isRecordingVideo) {
          bigButton = <VideoStopButton onPress={this.stopRecordingVideo} />;
        } else {
          bigButton = <VideoStartButton onPress={this.startRecordingVideo} />;
        }
        break;
      case 'audio':
        if (this.state.isRecordingAudio) {
          bigButton = <AudioStopButton onPress={this.stopRecordingAudio} />;
        } else {
          bigButton = <AudioStartButton onPress={this.startRecordingAudio} />;
        }
        break;
      case 'file':
        bigButton = <VideoStartButton onPress={this.startRecordingVideo} />;
        break;
    }

    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.flashMode}
          autoFocus={RNCamera.Constants.AutoFocus.on}
          playSoundOnCapture={true}
        />

        <View style={styles.modeButtons}>
          <IconButtonCamera
            onPress={() => this.showMode('camera')}
            selected={this.state.mode == 'camera'}
          />
          <IconButtonVideo
            onPress={() => this.showMode('video')}
            selected={this.state.mode == 'video'}
          />
          <IconButtonAudio
            onPress={() => this.showMode('audio')}
            selected={this.state.mode == 'audio'}
          />
          <IconButtonFile
            onPress={() => this.showMode('file')}
            selected={this.state.mode == 'file'}
          />
        </View>

        <View style={styles.mainButtons}>
          <BackButton onPress={() => this.props.navigation.navigate('Feed')} />
          {bigButton}
          <PostButton onPress={() => this.showPost()} />
        </View>
        {this.state.takingPic ? (
          <View style={styles.capturingStyle}>
            <H2 transparent>Capturing Picture...</H2>
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mainButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    margin: 10,
    borderBottomWidth: 10,
  },

  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    margin: 5,
    width: '80%',
  },
});

export default CaptureComponent;
