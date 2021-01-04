import React, {Component, memo} from 'react';
import {RNCamera} from 'react-native-camera';
import AsyncStorage from '@react-native-community/async-storage';
import {
  cleanupStorage,
  millisecsToHMSM,
  logStorageContent,
  cameraRollPathToAbsolutePath,
  getFilename,
} from './datapass';

import {createThumbnail} from 'react-native-create-thumbnail';

import {
  CameraClickButton,
  VideoStartButton,
  AudioStartButton,
  VideoStopButton,
  AudioStopButton,
  IconButtonCamera,
  IconButtonAudio,
  IconButtonFile,
  IconButtonVideo,
} from './buttons';
import {AudioRecorder, AudioUtils} from 'react-native-audio';


import {
  StyleSheet,
  View,
  Platform,
  Text,
  Image,
  PermissionsAndroid,
  TouchableOpacity,
  Animated,
} from 'react-native';

import RNSoundLevel from 'react-native-sound-level';
import AnimatedWave from 'react-native-animated-wave';
import CameraRollPicker from 'react-native-camera-roll-picker';



const CAMERA_SRC = 0
const VIDEO_SRC = 1
const AUDIO_SRC = 2
const CAMERAROLL_SRC = 3
const IMAGE = 0
const VIDEO = 1
const AUDIO = 2


class CaptureComponent extends Component {
  state = {
    mode: 'camera',
    isRecordingVideo: false,
    isRecordingAudio: false,
    currentTime: 0.0,
    recording: false,
    paused: false,
    stoppedRecording: true,
    finished: false,
    hasPermission: undefined,
    decibles: 0,
    captureContent:[],
    filesSelected: [],   
    fadeAnimation: new Animated.Value(0),
    shutterFlashVisible:false,
    memory:null
  };

  //--------------------------------------------------------------------------------------

  async componentDidMount() {
    
    console.log('capture did mount ');
    
    this.setState({captureContent:[],filesSelected:[],memory:null})
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
          
          this.addFileToContent(data.uri,VIDEO_SRC,VIDEO,null)
        }
      } catch (err) {
        alert('Video error' + err);
      }
    }
  };

  //--------------------------------------------------------------------------------------

  removeCameraRollcontent = async () =>{
    let temp = []
    this.state.captureContent.map(item =>{
      if(item.origin !== CAMERAROLL_SRC){
        temp.push(item)
      }
    })
    this.setState({captureContent:temp})
  }

  //--------------------------------------------------------------------------------------

  addFileToContent = async (fileuri,source,filetype,uniqueId) => {
    
    let temp = this.state.captureContent
    let fname = await getFilename(fileuri)

    switch (filetype) {
      
      case IMAGE:
       
        temp.push({
          filepath  : fileuri,  // original filepath
          thumbnail : fileuri,  // thumbnail path
          origin    : source,   // CAMERA || CAMERAROLL || AUDIO || VIDEO     
          type      : filetype, // IMAGE=0 || VIDEO=1 || AUDIO=2
          text      : '',       // needed only to match thumbScroll data structure            
          id        : uniqueId?uniqueId:fname,    // used only as unique identifier 
        })  
        this.setState({captureContent:temp});

        break;

      case VIDEO:

        createThumbnail({
          url: fileuri,
          timeStamp: 10000,
        }).then(thumbnail => {
          temp.push({
            filepath  : fileuri,        
            thumbnail : thumbnail.path, 
            origin    : source,    
            type      : filetype, 
            text      : '',                   
            id        : uniqueId?uniqueId:fname,          
          })  
          this.setState({captureContent:temp});
        })
      
      break;
      case AUDIO:
      
        temp.push({
          filepath  : fileuri,  
          thumbnail : './images/file.png',  
          origin    : source,   
          type      : filetype,
          text      : '',              
          id        : uniqueId?uniqueId:fname,    
        })  
        this.setState({captureContent:temp});
      
      break;     
      default:
        break;
    }
    
  }

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
    this.addFileToContent( filePathNew , AUDIO_SRC , AUDIO ,null)
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

  showShutterFlash = () => {
    this.setState({shutterFlashVisible:true})
    Animated.timing(this.state.fadeAnimation, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true, 
    }).start(this.hideShutterFlash);
  };

  hideShutterFlash = () => {
    Animated.timing(this.state.fadeAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(this.setState({shutterFlashVisible:false}));
  };

  //--------------------------------------------------------------------------------------


  takePicture = async () => {
    if (this.camera) {
      console.log('capture.takePicture() ' + this.camera);
      try {
        this.showShutterFlash()
        const data = await this.camera.takePictureAsync();        
        this.addFileToContent( data.uri.split('//')[1], CAMERA_SRC , IMAGE ,null )                
        
      } catch (err) {
        alert(err);
      } 
    }
  };

  //--------------------------------------------------------------------------------------

  goBackToFeed = () => {
    console.log('removing files.....');
    
    this.setState({captureContent:[],filesSelected:[],memory:null})
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

  showPost = () => {
    console.log('new post navigation:');
    
    this.props.navigation.navigate('NewPost',{
          capturedFiles:this.state.captureContent,
          memory:this.state.memory,
          updateMemoryDetails:this.updateCurrentMemoryDetails,
          updateCaptureContent:this.updateContent,
          resetCapture:this.resetAll
        });
    
  };
  
  //--------------------------------------------------------------------------------------
  resetAll = () =>{
    console.log('reset capture');
    this.setState({captureContent:[],filesSelected:[],memory:null})

  }
  //--------------------------------------------------------------------------------------
  updateContent = (content) =>{
    let tmp = []
    this.setState({captureContent:content},()=>{
      this.state.filesSelected.map(item =>{
        this.existsInContent(item).then(exists=>{
          if(exists){            
            tmp.push(item)
          }
        })
      })
      this.setState({filesSelected:tmp})
    })
  }

  existsInContent = (file) =>{
    return new Promise((resolve,reject)=>{
      this.state.captureContent.map(item=>{
        if(item.id === file.filename){
          resolve(true)
        }
      })
    })
  }
  
  //--------------------------------------------------------------------------------------
  
  updateCurrentMemoryDetails = ( memory ) =>{
    this.setState({memory:memory})
  }

  //--------------------------------------------------------------------------------------

  getSelectedImages = async (images) => {
   
    await this.removeCameraRollcontent()
      images.forEach((img, i) => {
        console.log(img);
        console.log();
        if (img.uri  ) {
          if (img.type === 'video') {
            if (Platform.OS === 'ios') {
              cameraRollPathToAbsolutePath(img.uri, img.type).then( assetPath => { 
                    this.addFileToContent(assetPath,CAMERAROLL_SRC,VIDEO, img.filename )                    
                })
            } else {
              this.addFileToContent( img.uri.split('//')[1] , CAMERAROLL_SRC , VIDEO,null)
            }
          } else {
            if (Platform.OS === 'ios') {
              
              cameraRollPathToAbsolutePath(img.uri, img.type).then( assetPath => {
                    this.addFileToContent(assetPath,CAMERAROLL_SRC,IMAGE,img.filename)
                })
            } else {
              this.addFileToContent(img.uri,CAMERAROLL_SRC,IMAGE,null)
            }
          }
        }
      })
      this.setState({filesSelected:images})
  };

  //--------------------------------------------------------------------------------------

  render() {
    let bigButton = null 
    let content = null
    let effect = null

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
            autoFocus={'on'}
            playSoundOnCapture={true}
          />
        )
        if(this.state.shutterFlashVisible){
          effect = (
            <Animated.View
              style={[styles.fadingContainer,{opacity: this.state.fadeAnimation}]}
            />
          )
        }
        
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
              {this.state.filesSelected.length > 0
                ? `${this.state.filesSelected.length} file(s) selected`
                : 'No files selected'}
            </Text>
          </View>
        );
        content = (
          <View style={styles.photosContainer}>
            <CameraRollPicker
              callback={this.getSelectedImages}
              groupTypes={'All'}
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
        {effect}
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
          
          <TouchableOpacity onPress={this.goBackToFeed}>
            <Text style={styles.PostButton} >{'Cancel'}</Text>
          </TouchableOpacity>
          {bigButton}
          
          <TouchableOpacity onPress={this.showPost}>
            <Text style={styles.PostButton} >{'  Post'} </Text>
          </TouchableOpacity>
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
  PostButton:{
    borderWidth:2,
    borderRadius:10,
    borderColor:'#7d7a7a',
    color:'#c7c5c5',
    
    padding:4,

  },

  fadingContainer:{ 
    position:'absolute',
    top:0,  
    left:0,
    width:'100%',
    height:'100%',
    backgroundColor:'whitesmoke'

      
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
    height:70,
    fontSize: 18,
    color: 'grey',
  },
});

export default CaptureComponent;