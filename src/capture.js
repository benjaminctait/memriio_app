import React, {Component, memo} from 'react';
import {RNCamera} from 'react-native-camera';
import AsyncStorage from '@react-native-community/async-storage';
import {
  cleanupStorage,
  millisecsToHMSM,
  logStorageContent,
  heicToJpg,
} from './datapass';

import {createThumbnail} from 'react-native-create-thumbnail';
import CameraRoll from '@react-native-community/cameraroll';

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

import {
  StyleSheet,
  View,
  Platform,
  Text,
  Image,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';

import RNSoundLevel from 'react-native-sound-level';
import AnimatedWave from 'react-native-animated-wave';
import CameraRollPicker from 'react-native-camera-roll-picker';

import Sound from 'react-native-sound';
let filePath = '';

class CaptureComponent extends Component {
  state = {
    mode: 'camera',
    isRecordingVideo: false,
    isRecordingAudio: false,

    fcount: 0,
    currentTime: 0.0,
    recording: false,
    paused: false,
    stoppedRecording: true,
    finished: false,
    hasPermission: undefined,
    decibles: 0,
    filesSelected: [],
  };

  //--------------------------------------------------------------------------------------

  async componentDidMount() {
    await cleanupStorage();

    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      console.log('audio authorization:', isAuthorised);
      this.setState({hasPermission: isAuthorised});

      if (!isAuthorised) {
        return;
      }

      AudioRecorder.onProgress = (data) => {
        this.setState({currentTime: Math.floor(data.currentTime)});
        let decibles;
        if (Platform.OS === 'android') {
          RNSoundLevel.onNewFrame = (soundData) => {
            // see "Returned data" section below
            //console.log('Sound level info', soundData);
            decibles =
              10 * Math.log10(soundData.value / (soundData.value + 5)) * 0.25;
            //console.log('decibles raw', decibles);

            if (!isNaN(decibles)) {
              this.setState({decibles: 100 + decibles * 10});
            }
          };
        } else {
          //console.log('data :', data);
          decibles =
            10 *
            Math.log10(data.currentPeakMetering / data.currentMetering) *
            -0.25;
          decibles = 100 + decibles * 100;
          this.setState({decibles: decibles});
        }
        //console.log('decibles :', this.state.decibles);
      };

      AudioRecorder.onFinished = (data) => {
        // Android callback comes in the form of a promise instead.

        if (Platform.OS === 'ios') {
          this._finishRecording(
            data.status === 'OK',
            data.audioFileURL,
            data.audioFileSize,
          );
        }
        if (Platform.OS === 'android') {
          RNSoundLevel.stop();
        }
      };
    });
  }

  //--------------------------------------------------------------------------------------

  startRecordingVideo = async () => {
    if (this.camera) {
      try {
        this.setState({isRecordingVideo: true});
        const data = await this.camera.recordAsync({});

        if (data) {
          this.setState({
            isRecordingVideo: false,
            fcount: this.state.fcount + 1,
          });
          let fname = Date.now().toString() + '.mp4';
          console.log('BBC video : ' + data.uri);
          this.littlecallback(data.uri);
        }
      } catch (err) {
        alert('Video error' + err);
      }
    }
  };

  //--------------------------------------------------------------------------------------
  littlecallback = (result) => {
    AsyncStorage.setItem('video-' + this.state.fcount, result);
    createThumbnail({
      url: result,
      timeStamp: 10000,
    }).then((thumbnail) => {
      console.log('setting video thumb,', thumbnail);
      AsyncStorage.setItem(`video-${this.state.fcount}-thumb`, thumbnail.path);
    });
  };

  //--------------------------------------------------------------------------------------
  stopRecordingVideo = async () => {
    console.log('stopRecordingVideo xxx' + this.camera);

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
    // if (!this.state.hasPermission) {
    //   console.warn("Can't record, no permission granted!");
    //   return;
    // }

    if (this.state.stoppedRecording) {
      let uniqueAudioPath =
        AudioUtils.DocumentDirectoryPath +
        '/audioFile_' +
        this.state.fcount +
        '.aac';
      this.prepareRecordingPath(uniqueAudioPath);
    }

    this.setState({recording: true, paused: false});

    try {
      filePath = await AudioRecorder.startRecording();
      if (Platform.OS === 'android') {
        RNSoundLevel.start();
      }
    } catch (error) {
      console.error(error);
    }
  };

  //--------------------------------------------------------------------------------------

  async _finishRecording(didSucceed, filePathNew, fileSize) {
    this.setState({finished: didSucceed});
    console.log(
      `Finished recording : duration ${
        this.state.currentTime
      } seconds at path: ${filePathNew} and size of ${fileSize || 0} bytes`,
    );
    await cleanupStorage({key: 'audio'});
    this.setState({fcount: this.state.fcount + 1});
    AsyncStorage.setItem('audio-' + this.state.fcount, filePathNew);
    AsyncStorage.setItem(
      `audio-${this.state.fcount}-thumb`,
      './images/file.png',
    );
  }
  //--------------------------------------------------------------------------------------

  stopRecordingAudio = async () => {
    this.setState({isRecordingAudio: false});
    this.setState({
      isRecordingAudio: false,
      stoppedRecording: true,
      recording: false,
      paused: false,
    });

    try {
      const filePathNew = await AudioRecorder.stopRecording();
      console.log('recording path', filePath);

      this.setState({finished: true});
      if (Platform.OS === 'android') {
        await this._finishRecording(true, filePathNew);
      }
      return filePathNew;
    } catch (error) {
      console.error(error);
    }
  };

  //--------------------------------------------------------------------------------------

  takePicture = async () => {
    if (this.camera) {
      console.log('capture.takePicture() ' + this.camera);
      try {
        const data = await this.camera.takePictureAsync();

        const fullpath = data.uri.split('//')[1];
        AsyncStorage.setItem(`image-${this.state.fcount + 1}`, fullpath);
        AsyncStorage.setItem(`image-${this.state.fcount + 1}-thumb`, fullpath);
        console.log('takePicture :', data);

        logStorageContent();
      } catch (err) {
        alert(err);
      } finally {
        this.setState({fcount: this.state.fcount + 1});
      }
    }
  };

  //--------------------------------------------------------------------------------------

  goBackToFeed = () => {
    cleanupStorage();
    // clear the sellection on the gallery
    this.props.navigation.navigate('Feed');
  };

  //--------------------------------------------------------------------------------------

  showMode = (modeName) => {
    if (this.state.isRecordingAudio || this.state.isRecordingAudio) {
      return;
    } else {
      this.setState({mode: modeName});
    }
  };

  //--------------------------------------------------------------------------------------

  showPost = () => {
    console.log('new post navigation:');
    this.props.navigation.navigate('NewPost');
  };

  //--------------------------------------------------------------------------------------
  handleGetPhotossPress = async () => {
    this.showMode('file');
    if (Platform.OS === 'android' && !(await this.hasAndroidPermission())) {
      return;
    }
    return true;
  };
  hasAndroidPermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    const getStoragePermission = await PermissionsAndroid.check(permission);
    if (getStoragePermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  };
  //--------------------------------------------------------------------------------------
  getSelectedImages = async (images) => {
    this.setState({filesSelected: images});
    console.log('getting selected images');
    await cleanupStorage({key: 'file-'}); //remove previously stroed files
    images.forEach((img, i) => {
      console.log('image :', img);

      if (img.uri) {
        if (img.type === 'video') {
          const fullpath = img.uri.split('//')[1];
          AsyncStorage.setItem(
            `video-file-${this.state.fcount + i + 1}`,
            fullpath,
          );
          createThumbnail({
            url: img.uri,
            timeStamp: 10000,
          }).then((thumbnail) => {
            AsyncStorage.setItem(
              `video-file-${this.state.fcount + i + 1}-thumb`,
              thumbnail.path,
            );
          });
        } else {
          if (Platform.OS === 'ios') {
            heicToJpg(img.uri).then((jpegPath) => {
              AsyncStorage.setItem(
                `image-file-${this.state.fcount + i + 1}`,
                jpegPath,
              );
              AsyncStorage.setItem(
                `image-file-thumb-${this.state.fcount + i + 1}-thumb`,
                jpegPath,
              );
            });
          } else {
            console.log('setting image file:', img.uri);
            AsyncStorage.setItem(
              `image-file-${this.state.fcount + i + 1}`,
              img.uri,
            );
            AsyncStorage.setItem(
              `image-file-${this.state.fcount + i + 1}-thumb`,
              img.uri,
            );
          }
        }
      }
    });
  };
  //--------------------------------------------------------------------------------------
  render() {
    let bigButton, content;
    switch (this.state.mode) {
      case 'camera':
        bigButton = <CameraClickButton onPress={this.takePicture} />;
        content = (
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
        );
        break;
      case 'video':
        content = (
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
        );
        if (this.state.isRecordingVideo) {
          bigButton = <VideoStopButton onPress={this.stopRecordingVideo} />;
        } else {
          bigButton = <VideoStartButton onPress={this.startRecordingVideo} />;
        }
        break;
      case 'audio':
        if (this.state.isRecordingAudio) {
          bigButton = <AudioStopButton onPress={this.stopRecordingAudio} />;
          content = (
            <View style={styles.audioContainer}>
              <View style={styles.controls}>
                <Image
                  style={styles.littleButton}
                  source={require('./images/mic.png')}
                />
                <AnimatedWave
                  sizeOvan={
                    this.state.decibles > 120 ? 120 : this.state.decibles
                  }
                  colorOvan={'#bebebe'}
                  zoom={2}
                />

                <Text style={styles.progressText}>
                  {millisecsToHMSM(this.state.currentTime * 1000)}
                </Text>
              </View>
            </View>
          );
        } else {
          bigButton = <AudioStartButton onPress={this.startRecordingAudio} />;
          content = (
            <View style={styles.audioContainer}>
              <View style={styles.controls}>
                <Image
                  style={styles.littleButton}
                  source={require('./images/mic.png')}
                />
                <Text style={styles.progressText}>
                  {millisecsToHMSM(this.state.currentTime * 1000)}
                </Text>
              </View>
            </View>
          );
        }
        break;
      case 'file':
        bigButton = (
          <View>
            <Text style={styles.photosCountText}>
              {this.state.filesSelected.length
                ? `${this.state.filesSelected.length} file(s) selected`
                : 'No files selected'}
            </Text>
          </View>
        );
        content = (
          <View style={styles.photosContainer}>
            <CameraRollPicker
              callback={this.getSelectedImages}
              assetType={'All'}
              selected={this.state.filesSelected}
            />
          </View>
        );
        break;
    }

    return (
      <View style={styles.container}>
        {content}
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
            onPress={() => this.handleGetPhotossPress()}
            selected={this.state.mode == 'file'}
          />
        </View>

        <View style={styles.mainButtons}>
          <BackButton onPress={() => this.goBackToFeed()} />
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
    backgroundColor: 'black',
  },
  controls: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  progressText: {
    paddingTop: 10,
    fontSize: 20,
    color: 'grey',
  },
  littleButton: {
    height: 80,
    width: 80,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  photosContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  photosCountText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'grey',
  },
});

export default CaptureComponent;
