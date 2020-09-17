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
import {AudioRecorder, AudioUtils} from 'react-native-audio';

import {StyleSheet, View, Platform, Text} from 'react-native';
let filePath = '';

class CaptureComponent extends Component {
  state = {
    mode: 'camera',
    isRecordingVideo: false,
    isRecordingAudio: false,
    icount: 0,
    vcount: 0,
    acount: 0,
    fcount: 0,
    currentTime: 0.0,
    recording: false,
    paused: false,
    stoppedRecording: false,
    finished: false,
    audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
    hasPermission: undefined,
  };

  //--------------------------------------------------------------------------------------

  async componentDidMount() {
    await cleanupStorage();
    await AsyncStorage.getAllKeys().then((keys) => {});
    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      this.setState({hasPermission: isAuthorised});

      if (!isAuthorised) {
        return;
      }

      this.prepareRecordingPath(this.state.audioPath);

      AudioRecorder.onProgress = (data) => {
        this.setState({currentTime: Math.floor(data.currentTime)});
        console.log('data :', data);
        let decibels =
          10 *
          Math.log10(data.currentPeakMetering / data.currentMetering) *
          -0.25;
        console.log('decibles :', decibels);
      };

      AudioRecorder.onFinished = (data) => {
        // Android callback comes in the form of a promise instead.
        console.log('on finished');
        if (Platform.OS === 'ios') {
          this._finishRecording(
            data.status === 'OK',
            data.audioFileURL,
            data.audioFileSize,
          );
        }
      };
    });
  }

  //--------------------------------------------------------------------------------------

  startRecordingVideo = async () => {
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
  littlecallback = (result) => {
    AsyncStorage.setItem('video- ' + this.state.vcount, result);
    createThumbnail({
      url: result,
      timeStamp: 10000,
    }).then((thumbnail) => {
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

  prepareRecordingPath(audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: 'High',
      AudioEncoding: 'aac',
      AudioEncodingBitRate: 32000,
      MeteringEnabled: true,
    });
  }
  //--------------------------------------------------------------------------------------

  startRecordingAudio = async () => {
    this.setState({isRecordingAudio: true});
    // if (this.state.recording) {
    //   console.warn('Already recording!');
    //   return;
    // }

    if (!this.state.hasPermission) {
      console.warn("Can't record, no permission granted!");
      return;
    }

    if (this.state.stoppedRecording) {
      this.prepareRecordingPath(this.state.audioPath);
    }

    this.setState({recording: true, paused: false});

    try {
      filePath = await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
    // alert('start audio');
  };

  //--------------------------------------------------------------------------------------

  _finishRecording(didSucceed, filePathNew, fileSize) {
    this.setState({finished: didSucceed});
    console.log(
      `Finished recording of duration ${
        this.state.currentTime
      } seconds at path: ${filePathNew} and size of ${fileSize || 0} bytes`,
    );
    let audioThumb = require('./images/file.png');
    this.state.acount++;
    AsyncStorage.setItem('audio-' + this.state.acount, filePathNew);
    AsyncStorage.setItem(
      'audio-thumb-' + this.state.acount,
      './images/file.png',
    );
  }
  //--------------------------------------------------------------------------------------

  stopRecordingAudio = async () => {
    this.setState({isRecordingAudio: false});
    // if (!this.state.recording) {
    //   console.warn("Can't stop, not recording!");
    //   return;
    // }

    this.setState({stoppedRecording: true, recording: false, paused: false});

    try {
      filePath = await AudioRecorder.stopRecording();
      console.log('recording path', filePath);

      // if (Platform.OS === 'android') {
      //   await this._finishRecording(true, filePath);
      // }
      // return filePath;
      this.setState({finished: true});
      console.log(
        `Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} `,
      );
      let audioThumb = require('./images/audioThumb.png');
      // this.state.acount++;
      this.setState({acount: this.state.acount + 1});
      AsyncStorage.setItem('audio-' + this.state.acount, filePath);
      AsyncStorage.setItem(
        'audio-thumb-' + this.state.acount,
        './images/file.png',
      );
    } catch (error) {
      console.error(error);
    }
    // alert('stop audio');
  };

  //--------------------------------------------------------------------------------------

  takePicture = async () => {
    if (this.camera) {
      this.setState({vcount: this.state.vcount + 1});
      console.log('capture.takePicture() ' + this.camera);
      try {
        const data = await this.camera.takePictureAsync();
        const fullpath = data.uri.split('//')[1];
        AsyncStorage.setItem('image-' + this.state.vcount, fullpath);
        AsyncStorage.setItem('image-thumb-' + this.state.vcount, fullpath);
      } catch (err) {
        alert(err);
      }
    }
  };

  //--------------------------------------------------------------------------------------

  showMode = (modeName) => {
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
        {!this.state.isRecordingAudio ? (
          <RNCamera
            ref={(ref) => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.flashMode}
            autoFocus={RNCamera.Constants.AutoFocus.on}
            playSoundOnCapture={true}
          />
        ) : (
          <View style={styles.audioContainer}>
            <View style={styles.controls}>
              <Text style={styles.progressText}>{this.state.currentTime}s</Text>
            </View>
          </View>
        )}

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
  audioContainer: {
    flex: 1,
    backgroundColor: '#2b608a',
  },
  controls: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  progressText: {
    paddingTop: 50,
    fontSize: 50,
    color: '#fff',
  },
});

export default CaptureComponent;
