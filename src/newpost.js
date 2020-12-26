import React, {Component, createRef} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import KeyboardShift from './keyboardShift';
import * as mem from './datapass';
import Video from 'react-native-video';
import Spinner from 'react-native-loading-spinner-overlay';
import ImageViewer from 'react-native-image-zoom-viewer';

import {showMessage, hideMessage} from 'react-native-flash-message';

import {
  StyleSheet,
  View,
  Image,
  Text,
  Keyboard, 
  Modal,  
  Animated, 
} from 'react-native';

import {
  
  BackButton,
  PostButton,
  SubTag,
  LocationTag,
} from './buttons';

import {Input, ListItem, CheckBox} from 'react-native-elements';
import ThumbScroll from './thumbScroll'
import { templateSettings } from 'lodash';


let THUMBNAIL_WIDTH = 150

//--------------------------------------------------------------------------

class NewPost extends Component {
  constructor() {
    super();
    this.setupCloudsAndPeople = this.setupCloudsAndPeople.bind(this);
    this.pushMemory = this.pushMemory.bind(this);

    this.state = {
      showDraggable   : true,
      dropZoneValues  : null,
      pan             : new Animated.ValueXY(),
      thumbScroll     : React.createRef(),

      title: '',
      story: '',
      content: [],
      allPeople: [],
      taggedPeople: [],
      location: null,
      allClouds: [],
      taggedClouds: [],
      user: null,
      spinner: false,
      modalVisible:false,
      activeImage:null,
    };

  };
  
  //--------------------------------------------------------------------------
  

  setupCloudsAndPeople = (clouds) => {
    if (Array.isArray(clouds)) {
      const firstitem = [
        {
          id: 0,
          name: 'Personal',
          administrator: this.state.userid,
          createdon: null,
        },
      ];

      const newarray = firstitem.concat(clouds);
      mem.getCloudPeople(clouds, null).then((people) => {
        this.setState({allPeople: people, allClouds: newarray});
      });
    }
  };

  //--------------------------------------------------------------------------

  sendPost = async () => {
    Keyboard.dismiss();

    let cloudarray = [];
    let personarray = [];
    let me = this.state;

    let locationName =
      me.location.firstname && me.location.lastname
        ? me.location.firstname + ' ' + me.location.lastname
        : ''; // a temporary treatment until we have gps implemented
    me.taggedClouds.map((cloud) => {
      if (cloud.id !== 0) {
        cloudarray.push(parseInt(cloud.id));
      }
    }); // push all but the personal cloud


    me.taggedPeople.map((person, i) => {
      personarray[i] = person.userid;
    });

    showMessage({
      message: 'Memory uploading.. should be done shortly',
      type: 'success',
      duration: 2000,
      autoHide: true,
      floating: true,
    });

    console.log('SEND POST', this.props.screenProps);
    this.props.navigation.navigate('Feed');

    await mem.postNewMemory(
      me.title,
      me.story,
      me.content,
      personarray,
      locationName,
      cloudarray,
      me.user.userid,
      this.doPostLoad,
    );
  };

  //--------------------------------------------------------------------------

  pushMemory = (memid) => {
    console.log('PUSH MEMORY');
    console.log(this.props.navigation.screenProps);
  };

  //--------------------------------------------------------------------------

  doPostLoad = (memid) => {
    
    let uid = this.state.user.userid
    this.pushMemory(memid)
    if( Array.isArray ( this.state.taggedClouds ) && this.state.taggedClouds.length > 0 )
    {
      let cid = this.state.taggedClouds.findIndex( cloud => parseInt(cloud.id) === 1 ) // search for UAP cloud only
      if(cid !== -1 )
        {
          cid = parseInt ( this.state.taggedClouds[cid].id ) // get the id of the UAP cloud
          mem.postPointsEvent ( uid , 50 , memid , 'POINTS : Post new memory' , cid )
          mem.postStatusEvent ( uid ,  5 , memid , 'STATUS : Post new memory' , cid )
          console.log    ( 'refreshFeed Points & status: user : ', uid, ' memid : ', memid , ' cloud : ', cid )
        }

    }
    showMessage({
      message: 'Memory posted ',
      type: 'success',
      duration: 2000,
      backgroundColor: '#5DADE2',
      color: '#FDFEFE',
      autoHide: true,
      floating: true,
    });
  };

  // ---------------------------------------------------------------------------------

  getLocation = () => {
    Keyboard.dismiss();
    this.props.navigation.navigate('SearchLocation');
  };

  // ---------------------------------------------------------------------------------

  getClouds = () => {
    Keyboard.dismiss();
  };

  // ---------------------------------------------------------------------------------

  getPeople = () => {
    Keyboard.dismiss();
    this.props.navigation.navigate('SearchPeople', {
      allPeople: this.state.allPeople,
      taggedPeople: this.state.taggedPeople,
    });
  };

  // ---------------------------------------------------------------------------------
  componentDidUpdate() {
    if (this.props.route.params) {
      if (this.props.route.params.taggedPeople) {
        if (this.state.taggedPeople !== this.props.route.params.taggedPeople) {
          if (Array.isArray(this.props.route.params.taggedPeople)) {
            this.setState({taggedPeople: this.props.route.params.taggedPeople});
          }
        }
      }
      if (this.props.route.params.location) {
        if (this.props.route.params.location !== this.state.location) {
          this.setState({location: this.props.route.params.location});
        }
      }
    }
  }

  // ---------------------------------------------------------------------------------
  // Loads the state of the New Post view
  // pre :   AsyncStorage contains at least one content file
  // post :  state contains all captured content.
  //         Note : people, location and groups can load after the component is loaded.

  async componentDidMount() {
    let store = [];
    
    
    console.log('newpost-didmount');
    console.log();

    mem.activeUser().then(user =>{
      
      if(user){
        this.setState( { user: user } )
        mem.mapUserClouds(user.userid, this.setupCloudsAndPeople);
        
      }
    })

    try {
        AsyncStorage.getAllKeys().then((allkeys) => {
          console.log('at didmount',allkeys)
          this.removeNonFilesAndSort(allkeys).then(keys =>{
            
            keys.map((key, index) => {
              AsyncStorage.getItem(key).then( item => {
                
                  if (!key.includes('thumb')) {
                    this.getMatchingThumb(keys, key).then((thumb) => {
                      
                      if (key.includes('audio-')) {
                        store.push({
                          filepath: item,
                          thumbnail: thumb,
                          isAudio: true,
                          isVideo: false,                        
                          id:index,
                        });
                      } else if (key.includes('video-')) {
                        store.push({
                          filepath: item,
                          thumbnail: thumb,
                          isAudio: false, 
                          isVideo: true,
                          id:index,
                        });
                      } else {
                        
                        store.push({
                          filepath: item,
                          thumbnail: thumb,
                          isAudio: false,
                          isVideo: false,
                          id:index,
                        });
                      }
                      this.setState({content:store})
                    });
                  }                
              })
            });

          })
          
        });
      
    } catch (e) {
      alert(e);
    }
  }

  // ---------------------------------------------------------------------------------

  removeNonFilesAndSort = (allkeys) =>{
    let newkeys=[]
    console.log('allkeys',allkeys)
    return new Promise((resolve,reject) =>{
      // clear out all non file keys
      allkeys.map(key =>{
        if (
          key.includes('image-') ||
          key.includes('video-') ||
          key.includes('audio-')
        ) {
          newkeys.push(key)
        }
      })
      console.log(newkeys);
      resolve(newkeys)
    })
  }

  // ---------------------------------------------------------------------------------

  handleCloudTagPress = (cloudItem, buttonState) => {
    let selectedClouds = this.state.taggedClouds.map((cloud) => {
      return cloud.id;
    });
    let newarray = [];
    let exists = selectedClouds.includes(cloudItem.id);

    if (buttonState && !exists) {
      this.state.taggedClouds.push(cloudItem);
    }

    if (!buttonState && exists) {
      this.state.taggedClouds.map((cloud) => {
        if (cloud.id !== cloudItem.id) {
          newarray.push(cloud);
        }
      });
      this.state.taggedClouds = newarray;
    }

    console.log(
      'handleCloudTagPress : taggedClouds.cloud.id ',
      this.state.taggedClouds.map((cloud) => {
        return cloud.id;
      }),
    );
  };

  // ---------------------------------------------------------------------------------

  showModal = (item) => {

    
    if (mem.isSupportedImageFile(mem.getFilename(item.filepath))) {
      this.setState({modalVisible: true, activeImage: item});
    } 
    
    // else if (mem.isSupportedVideoFile(mem.getFilename(item.fileurl))) {
    //   return <VideoPlayer poster={item.thumburl} source={item.thumburl} />;
    // } else if (mem.isSupportedAudioFile(mem.getFilename(item.fileurl))) {
    //   return <VideoPlayer poster={item.fileurl} source={item.fileurl} />;
    // }

  };

  // ---------------------------------------------------------------------------------

  getMatchingThumb = (keys, targetKey) => {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(targetKey + '-thumb').then((thumbPath) => {
        //console.log('thumb for :', targetKey, thumbPath);
        resolve(thumbPath);
      });
    });
  };

  // ---------------------------------------------------------------------------------

  renderLocation = () => {
    console.log('location : ' + this.state.location);
    if (this.state.location) {
      return (
        <View style={styles.subtitle}>
          <LocationTag
            key={this.state.location.locid}
            title={
              this.state.location.firstname + ' ' + this.state.location.lastname
            }
          />
        </View>
      );
    } else {
      return null;
    }
  };

  // ---------------------------------------------------------------------------------

  render() {
    
    return (
      <KeyboardShift>
        <View 
          style={styles.container}
          >
          <Spinner
            visible={this.state.spinner}
            textContent={'Uploading memory...'}
            textStyle={styles.spinnerTextStyle}
          />

          <Input // Title
            inputStyle={styles.titletext}
            onChangeText={(text) => {
              this.setState({title: text});
            }}
            placeholder="Title.."
            placeholderTextColor="gray"
          />

          <Input // Description
            inputStyle={styles.titletext}
            placeholder="Description.."
            placeholderTextColor="grey"
            onChangeText={(text) => {
              this.setState({story: text});
            }}
          />

          <View>
            <ListItem // Tagged people list
              title="People"
              leftIcon={{name: 'face'}}
              topDivider
              bottomDivider
              chevron
              onPress={() => this.getPeople()}
              subtitle={
                <View style={styles.subtitle}>
                  {this.state.taggedPeople.map((person, index) => (
                    <SubTag
                      key={index}
                      data={person}
                      title={person.firstname + ' ' + person.lastname}
                      rightIcon={require('./images/x-symbol.png')}
                    />
                  ))}
                </View>
              }
            />
            <ListItem // Location
              title="Location"
              leftIcon={{name: 'language'}}
              bottomDivider
              chevron
              onPress={() => this.getLocation()}
              subtitle={this.renderLocation()}
            />
            <ListItem // Clouds
              title="Cloud"
              leftIcon={{name: 'group'}}
              bottomDivider
              chevron
              onPress={() => this.getClouds()}
              subtitle={
                <View style={styles.subtitle}>
                  {this.state.allClouds.map((cloud, index) => (
                    <SubTag
                      key={index}
                      data={cloud}
                      greyOutOnTagPress={!(cloud.name === 'Personal')} // Cant turn off the Personal cloud
                      buttonDown={true}
                      onTagPress={this.handleCloudTagPress}
                      title={cloud.name}
                    />
                  ))}
                </View>
              }
            />
          </View>
        
          {this.renderThumbNails()}
          
        </View>

        <View style={styles.mainButtons}>
          <BackButton onPress={() => this.props.navigation.goBack(null)} 
                      Title={'Capture'}/>
          <PostButton onPress={() => this.sendPost()} 
                      Title={'Upload'} />
        </View>
        
        {this.renderImageEditModal()}
        

      </KeyboardShift>
    );
  }

  // ---------------------------------------------------------------------------------

  renderImageEditModal = () => {
    return (
      <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({modalVisible: false});
          }}>
          <Text
            style={styles.backButton}
            onPress={() => {
              this.setState({modalVisible: !this.state.modalVisible});
            }}>
            <Image
              source={require('./images/back.png')}
              style={styles.backButtonImage}
            />
          </Text>

          <ImageViewer
            imageUrls={[{url: this.state.activeImage ? this.state.activeImage.thumbnail : null }]}
            style={styles.imageFull}
            renderHeader={() => {}}
            renderIndicator={() => {}}
          />
        </Modal>
    )
  }

  // ---------------------------------------------------------------------------------

  renderThumbNails = () =>{ 

    let dat = {
      0: {
        filepath          : '',
        text              : '',
        originalIndex     :0,
        isAudio           :false,
        isVideo           :false,
        thumbnail         :'',
        id                :0,
      },
    };
    
    let obj = {}
    this.state.content.map((item,index) =>{
     
      obj = 
          { 
          filepath      : item.filepath,
          text          : '',
          originalIndex : index,
          isAudio       : item.isAudio,
          isVideo       : item.isVideo,
          thumbnail     : item.thumbnail,
          id            : index,
        }
      dat[index] = obj
      
    })
    
    return < ThumbScroll 
            data={dat}
            onPress={contentItem => this.showModal(contentItem)}
            handleFileOrderChange = {this.changeContentOrder}
         />
  }

  // ---------------------------------------------------------------------------------

  changeContentOrder = async ( newOrder )  => {
            
    // re-order this.state.content to match the thumbnail scroll order
    let temp = []
    newOrder.map(id =>{
      id = parseInt(id)      
      this.state.content.map((item,index) =>{
        if(index === id){
          temp.push(item)
        }
      })
    })
    
    // now clear and re-write the files in async storage so the revised order is persistant
    console.log('before : ');
    mem.logStorageContent()

    console.log('cleam images');
    await mem.cleanupStorage({key: 'image-'})
    console.log('cleam video');
    await mem.cleanupStorage({key: 'video-'})
    console.log('cleam audio');
    await mem.cleanupStorage({key: 'audio-'})

    console.log('write reordered content');
    temp.forEach((item,index) => {
      if(item.isVideo){
        AsyncStorage.setItem(`video-${index}`, item.filepath);
        AsyncStorage.setItem(`video-${index}-thumb`, item.thumbnail);
      }else if(item.isAudio){
        AsyncStorage.setItem(`audio-${index}`, item.filepath);
        AsyncStorage.setItem(`audio-${index}-thumb`, './images/file.png');
      }else{
        AsyncStorage.setItem(`image-${index}`, item.filepath);
        AsyncStorage.setItem(`image-${index}-thumb`, item.thumbnail);
      }
    });

    console.log('after : ');
    mem.logStorageContent()

    this.state.content = temp // not using setstate on purpose.

  }
  // ---------------------------------------------------------------------------------
}


export default NewPost;

const CIRCLE_RADIUS = 30;
const styles = StyleSheet.create({


  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  

  circle: {
    backgroundColor: "skyblue",
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS
  },


  imageFull: {
    position: 'absolute',
    width: '100%', 
    height: '100%', 
    zIndex: -1
  },

  backButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    height: 100,
  },
  backButtonImage: {
    width: 35,
    height: 35,
  },

  preview: {
    alignContent: 'center',
  },
  mainButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    marginHorizontal: 50,
    marginTop: 15,
  },
  titletext: {
    marginTop: 15,
    marginBottom: 10,
    fontSize: 15,
  },
  textAreaContainer: {
    borderColor: 'lightgray',
    borderWidth: 1,
    padding: 5,
  },
  textArea: {
    height: 150,
    justifyContent: 'flex-start',
    fontSize: 15,
  },
  subtitle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    marginRight: 5,
    fontSize: 8,
  },
  thumbnailsContainer: {
    height: 150,
    width: THUMBNAIL_WIDTH,
    margin: 5,
    marginTop: 10,
  },
  thumbnailStyle: {
    height: '100%',
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});
