import React, {Component, createRef} from 'react';
import KeyboardShift from './keyboardShift';
import * as mem from './datapass';
import Spinner from 'react-native-loading-spinner-overlay';
import {ZoomableImage} from './cachedImage'
import Video from 'react-native-video'
import Dialog from 'react-native-dialog'
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

import ThumbList from './thumbList.js'


let THUMBNAIL_WIDTH = 150
const IMAGE = 0
const VIDEO = 1
const AUDIO = 2

//--------------------------------------------------------------------------

class NewPost extends Component {
  constructor() {
    super();
    this.setupCloudsAndPeople = this.setupCloudsAndPeople.bind(this);
    this.pushMemory = this.pushMemory.bind(this);

    this.state = {

      title: '',
      story: '',      
      taggedPeople: [],
      location: null,
      taggedClouds: [],
      user: null,
      content: [],

      allPeople: [],
      allClouds: [],
      spinner: false,
      modalVisible:false,
      deleteDialogVisible:false,
      activeItem:null,
      deleteIndex:'',
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
    let locationName = ''
    if (me.location){
      locationName =
      me.location.firstname && me.location.lastname
        ? me.location.firstname + ' ' + me.location.lastname
        : ''; // a temporary treatment until we have gps implemented
    }
    
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
    this.props.route.params.resetCapture()
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
      updatePeople: this.updatePeople
    });
  };

  // ---------------------------------------------------------------------------------

  updatePeople = ( taggedPeople  ) => {
    console.log('update called');
    this.setState({taggedPeople:taggedPeople})
  }

  componentDidUpdate() {
    if (this.props.route.params) {
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
   
    const { capturedFiles,memory } = this.props.route.params;
    
    console.log('NEWPOST - didmount');
    console.log('');
    
    if(memory){
      this.setState(
        {
          content       : capturedFiles,
          title         : memory.title,
          story         : memory.story,      
          taggedPeople  : memory.taggedPeople,
          location      : memory.location,
          taggedClouds  : memory.taggedClouds,
          user          : memory.user,
        }
      )
      mem.mapUserClouds(memory.user.userid, this.setupCloudsAndPeople);
    }else{
      this.setState({content:capturedFiles})
      mem.activeUser().then(user =>{
        if(user){
          this.setState( { user: user } )
          mem.mapUserClouds(user.userid, this.setupCloudsAndPeople);
        }
      })
    }    
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

  showImageEditModal = (itemID ) => {

    let found = false, idx = 0, tmp = this.state.content
    
    while (!found && idx < tmp.length) {
      if(tmp[idx].id === itemID){
        found = true
        this.setState({modalVisible: true, activeItem: tmp[idx]});
      }
      idx++
    }
  };

  // ---------------------------------------------------------------------------------

  showDeleteDialog = ( itemID ) => {
    this.setState({deleteIndex:itemID, deleteDialogVisible:true}) 
  }

  // ---------------------------------------------------------------------------------

  handleFileDelete = () =>{
    
    let found = false, idx = 0, tmp = this.state.content
    
    while (!found && idx < tmp.length) {
      if(tmp[idx].id === this.state.deleteIndex){
        found = true
        tmp.splice(idx,1)
      }
      idx++
    }
    this.setState({deleteDialogVisible:false,content:tmp})
    this.props.route.params.updateCaptureContent(tmp)
  }

  // ---------------------------------------------------------------------------------

  handleDeleteCancel = () =>{
    console.log('File Delete no');
    this.setState({deleteDialogVisible:false})
  }

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
            value={this.state.title?this.state.title:''}
          />

          <Input // Description
            inputStyle={styles.titletext}
            placeholder="Description.."
            placeholderTextColor="grey"
            onChangeText={(text) => {
              this.setState({story: text});
            }}
            value={this.state.story?this.state.story:''}
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
                      key               = { index}
                      data              = { cloud}
                      greyOutOnTagPress = { !(cloud.name === 'Personal')} // Cant turn off the Personal cloud
                      buttonDown        = { true}
                      onTagPress        = { this.handleCloudTagPress}
                      title             = { cloud.name}
                    />
                  ))}
                </View>
              }
            />
          </View>
              <ThumbList
                data              = { this.state.content}
                handleThumbPress  = { this.showImageEditModal}    
                handleDeletePress = { this.showDeleteDialog }            
              />
          
        </View>

        <View style={styles.mainButtons}>
          <BackButton onPress={ this.goBackToCapture }
                      Title={'Capture'}/>
          <PostButton onPress={ this.sendPost } 
                      Title={'Upload'} />
        </View>
        
        {this.renderImageEditModal()}
        {this.renderDeleteDialog()}
        

      </KeyboardShift>
    );
  }

  // ---------------------------------------------------------------------------------

  goBackToCapture = () => {
    let memobj = {
      title: this.state.title,
      story: this.state.story,      
      taggedPeople: this.state.taggedPeople,
      location: this.state.location,
      taggedClouds: this.state.taggedClouds,
      user: this.state.user,
      //content: this.state.content,
    }

    this.props.route.params.updateMemoryDetails(memobj)
    this.props.navigation.navigate('CaptureComponent')
  }

  // ---------------------------------------------------------------------------------

  renderImageEditModal = () => {
    let content = null
    if(this.state.activeItem){
      switch (this.state.activeItem.type) {
        case IMAGE:
          content = 
                      <ZoomableImage 
                        style     = { {height:'100%',width:'100%',resizeMode:'cover'}}
                        localPath = { this.state.activeItem.thumbnail }
                      />
          break;
        case VIDEO:
          content = <Video
                      source   = { { uri: this.state.activeItem.filepath } }
                      paused   = { true }
                      muted    = { false }                      
                      poster   = { this.state.activeItem.thumbnail }
                      style    = { styles.imageFull }
                      ignoreSilentSwitch = { 'ignore' }
                      
                    />

          break;
        case AUDIO:
          content = <Video
                      source   = { { uri: this.state.activeItem.filepath } }
                      paused   = { true }
                      muted    = { false }
                      controls = { true }
                      poster   = { this.state.activeItem.thumbnail }
                      style    = { styles.imageFull }
                      ignoreSilentSwitch = { 'ignore' }
                    />
        break;
        default:
          break;
      }
    }

    return (
      <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({modalVisible: false});
          }}>
          
          {content}
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
          
        </Modal>
    )
  }

  // ---------------------------------------------------------------------------------

  renderDeleteDialog = () =>{
    
      return (
        <View  style={styles.deleteDialogContainer}>
          <Dialog.Container visible={this.state.deleteDialogVisible} >
            <Dialog.Title>File delete</Dialog.Title>
            <Dialog.Description>
              Do you want to delete this file? You cannot undo this action.
            </Dialog.Description>
            <Dialog.Button label="Cancel" onPress={this.handleDeleteCancel} />
            <Dialog.Button label="Delete" onPress={this.handleFileDelete} />
          </Dialog.Container>
        </View>
      )
  }

  // ---------------------------------------------------------------------------------

}



export default NewPost;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  imageFull: {
    position: 'absolute',
    width: '100%', 
    height: '100%', 
    resizeMode:'cover',
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
  deleteDialogContainer: {
    position:'absolute',
    flex: 1,    
    alignItems: "center",
    justifyContent: "center",
  },
});
