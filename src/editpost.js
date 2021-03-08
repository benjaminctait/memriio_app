import React, {Component} from 'react';
import KeyboardShift from './keyboardShift';
import * as mem from './datapass';
import Spinner from 'react-native-loading-spinner-overlay';
import {CachedZoomableImage} from './cachedImage'
import Video from 'react-native-video'
import Dialog from 'react-native-dialog'
import {showMessage} from 'react-native-flash-message';
import SearchPeople from './searchpeople'
import SearchLocation from './searchlocation'
import SearchClouds from './searchclouds'
import Capture from './capture'

import {
  StyleSheet,
  View,
  Image,
  Text,
  Keyboard, 
  Modal,  
  TouchableOpacity,
} from 'react-native';

import {
  
  BlankButton,
  SubTag,
  LocationTag,
} from './buttons';

import {Input, ListItem} from 'react-native-elements';

import ThumbList from './thumbList.js'


let THUMBNAIL_WIDTH = 150
const IMAGE = 0
const VIDEO = 1
const AUDIO = 2

//--------------------------------------------------------------------------

class EditPost extends Component {
  constructor() {
    super();
    this.setupCloudsAndPeople = this.setupCloudsAndPeople.bind(this);
    
    this.state = {

      memid:0,
      title: '',
      description:'',
      story: '',      
      taggedPeople: [],
      location: null,
      taggedClouds: [],
      userid:null,
      content: [],
      cardtype:0,
      editcount:0,
      createdon: null,

      allPeople: [],
      allClouds: [],
      spinner: false,

      modalVisible:false,
      deleteDialogVisible:false,      
      locationModalVisible:false,
      peopleModalVisible:false,
      captureModalVisible:false,
      cloudModalVisable:false,

      activeItem:null,
      deleteIndex:'',
      initialCloudStatus:[],
    };

  };
  
  //--------------------------------------------------------------------------
  

   setupCloudsAndPeople =  (clouds) => {
    
    const firstitem = [
      {
        id: 0,
        name: 'Personal',
        administrator: this.state.user,
        createdon: null,
      },
    ];
    let newarray = firstitem.concat(clouds);
    this.setState({allClouds:newarray})

    mem.log(this.state.taggedClouds,'taggedclouds')
    newarray.map((cloud,index) => {
        mem.findArrayIndex(this.state.taggedClouds,(item)=>{return item.id == cloud.id})
        .then(idx => {
        if(idx != -1){
            newarray[index].selected = true
            this.setState({allClouds:newarray})
          }
        })
    })
    
    mem.getCloudPeople( clouds, (people) => {
      this.setState({allPeople: people});
    })    

  };

  //--------------------------------------------------------------------------

  updatePost = async () => {

    Keyboard.dismiss();    
    let oldMemory = this.props.memory;
    let newMemory = {

      memid         : this.state.memid,
      createdon     : this.state.createdon,
      userid        : this.state.userid,
      title         : this.state.title,
      description   : this.state.description,
      location      : this.state.location,
      story         : this.state.story,      
      cardtype      : this.state.cardtype,
      editcount     : this.state.editcount,
      modifiedon    : this.state.modifiedon,
      author        : this.state.author,
      taggedClouds  : this.state.taggedClouds,
      taggedPeople  : this.state.taggedPeople,      
      memfiles      : await this.formatContentForFeed(this.state.content),
      likes         : this.state.likes,
      searchwords   : this.state.searchwords
      
    }
        
    showMessage({
      message: 'Memory updated',
      type: 'success',
      duration: 600,
      autoHide: true,
      floating: true,
    });

    
    this.props.close()


    mem.updateMemoryTitle       ( newMemory.memid , newMemory.title        )
    mem.updateMemoryDescription ( newMemory.memid , newMemory.description  )
    mem.updateMemoryStory       ( newMemory.memid , newMemory.story        )
    mem.updateMemoryLocation    ( newMemory.memid , newMemory.location     )
    mem.updateMemoryPeople      ( newMemory.memid , newMemory.taggedPeople )
    mem.updateMemoryClouds      ( newMemory.memid , newMemory.taggedClouds )
    

    // check for delete content
    oldMemory.files.map ( oldfile => {
      mem.findArrayIndex ( newMemory.memfiles , (( item ) => { return item.fileid === oldfile.fileid }))
      .then(idx =>{
        if ( idx < 0 ) mem.removeFileFromMemory( newMemory.memid, oldfile )
      })
    })

    // check for added content 
    newMemory.memfiles.map ( newfile => {
      mem.findArrayIndex( oldMemory.files,(( item ) => { return item.fileid === newfile.fileid }))
      .then(idx => {
        if ( idx < 0 ) mem.addFileToMemory( newMemory.memid , newMemory.userid  , newfile )
      })      
    })   

    // check to see if hero file was changed
    
    newMemory.memfiles.map( newfile => {
      
      if(newfile.ishero && typeof newfile.fileid !== 'undefined' ){
        
        oldMemory.files.map(oldfile => { 
          if( oldfile.ishero ){
            if ( newfile.fileurl !== oldfile.fileurl ){
              mem.updateMemoryHero( newMemory.memid, newfile )
            }
          }
        })
      }
    })
    mem.getMemoryDetails(newMemory.memid)
    .then(remoteMemoryDetails =>{
      newMemory.modifiedon = remoteMemoryDetails.modifiedon      
      this.props.updateMemory( newMemory )  // update local memory
    })
    
    
  };

  //--------------------------------------------------------------------------
  
  formatContentForFeed = async ( content ) =>{
    let filearray = []
    content.map( ( old, index ) => {
      let newfile = {
        fileid      : old.fileid,
        memid       : this.state.memid,
        fileurl     : old.filepath,
        fileext     : mem.getExtension(old.filepath),
        thumburl    : old.thumbnail?old.thumbnail:'',
        thumbext    : mem.getExtension(old.thumbnail),
        displayurl  : old.displayurl?old.displayurl:'',
        ishero      : old.ishero?old.ishero:false,
      }
      filearray.push(newfile)
    })
    
    return filearray
  }
  
  //--------------------------------------------------------------------------

  getLocation = () => {
    Keyboard.dismiss();
    this.setState({locationModalVisible:true})
  };

  // ---------------------------------------------------------------------------------

  showCapture = () => {
    this.setState({captureModalVisible:true})

  }

  // ---------------------------------------------------------------------------------

  updateLocation = ( location  ) => {
    console.log('updateLocation : ', location);
    this.setState({ location : location})
  }
  
  // ---------------------------------------------------------------------------------
  
  getClouds = () => {
    Keyboard.dismiss();
    this.setState({cloudModalVisable:true})
  };

  // ---------------------------------------------------------------------------------

  getPeople = () => {
    Keyboard.dismiss();
    this.setState({peopleModalVisible:true})
    
  };

  // ---------------------------------------------------------------------------------
  updateClouds = ( taggedClouds  ) => {
    console.log('update clouds called');
    
    this.setState({taggedClouds: taggedClouds},()=>{
      
      let x =  this.state.allClouds
      x.map(cloud =>{ 
        if(cloud.id != 0 ) cloud.selected = false
        for (let index = 0; index < taggedClouds.length; index++) {
          if (taggedClouds[index].id === cloud.id) 
          {
            cloud.selected = true            
            break
          }
        }
      })
     this.setState( { allClouds:x } )
      
    })
  }

  // ---------------------------------------------------------------------------------

  updatePeople = ( taggedPeople  ) => {
    console.log('update people called');
    this.setState({taggedPeople:taggedPeople})
  }

  // ---------------------------------------------------------------------------------
  // Loads the state of the New Post view
  // pre :   AsyncStorage contains at least one content file
  // post :  state contains all captured content.
  //         Note : people, location and groups can load after the component is loaded.

  componentDidMount = () => {
   
    const { capturedFiles,memory } = this.props
    let newarray = []
    console.log('EDITPOAST - didmount');
    console.log('Editing memory ',memory);
    
    
    if(memory){
     
      this.setState(
        {
          memid         : memory.memid,
          createdon     : memory.createdon,
          userid        : memory.userid,
          title         : memory.title,
          description   : memory.description,   
          location      : memory.location,
          story         : memory.story,   
           cardtype      : memory.cardtype,
          editcount     : memory.editcount,
           modifiedon    : memory.modifiedon,
           author        : memory.author,
          taggedClouds  : memory.taggedClouds,
          taggedPeople  : memory.taggedPeople,
          
          likes         : memory.likes,
           searchwords   : memory.searchwords,
          activeUser    : null,
        }
      )
      mem.getUserClouds(memory.userid, this.setupCloudsAndPeople);
      
      memory.files.map(file =>{
        let fname = mem.getFilename(file.thumburl)
        let ftype = this.getFileType(file.fileext)
        newarray.push({
          fileid      : file.fileid,
          memid       : file.memid,
          filepath    : file.fileurl ,  // original filepath
          ishero      : file.ishero,
          fileext     : file.fileext,          
          thumbnail   : file.thumburl,
          thumbext    : file.thumbext,
          displayurl  : file.displayurl,          
          id          : file.id,        // CAMERA || CAMERAROLL || AUDIO || VIDEO     
          type        : ftype,          // IMAGE=0 || VIDEO=1 || AUDIO=2
          text        : '',             // needed only to match thumbScroll data structure            
          id          : fname,          // used only as unique identifier 
        })
      })
      this.setState({content:newarray})
      
    }else{
      this.setState({content:capturedFiles})
      mem.getActiveUser().then(user =>{
        if(user){
          this.setState( { activeUser: user } )
          mem.getUserClouds(user.userid, this.setupCloudsAndPeople);
        }
      })
    }    
  }

  // ---------------------------------------------------------------------------------

  getFileType = (extension ) =>{
    if(mem.isSupportedImageFile(extension)) return IMAGE
    else if (mem.isSupportedVideoFile(extension)) return VIDEO
    else if (mem.isSupportedAudioFile(extension)) return AUDIO
    else return 0
  }
 
  // ---------------------------------------------------------------------------------

  handleCloudTagPress = (cloudItem, buttonState) => {
    
    let newarray = this.state.taggedClouds;    

    let selectedClouds = this.state.taggedClouds.map((cloud) => {
      return cloud.id;
    });
    
    let exists = selectedClouds.includes(cloudItem.id);

    if (buttonState && !exists) {
      newarray.push(cloudItem);
    }

    if (!buttonState && exists) {
      newarray = []
      this.state.taggedClouds.map((cloud) => {
        if (cloud.id !== cloudItem.id) {
          newarray.push(cloud);
        }
      });
      this.setState({taggedClouds:newarray})
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
    
  }

  // ---------------------------------------------------------------------------------

  handleDeleteCancel = () =>{
    console.log('File Delete no');
    this.setState({deleteDialogVisible:false})
  }

  // ---------------------------------------------------------------------------------

  renderLocation = () => {
    
    if (this.state.location) {
      return (
        <View style={styles.subtitle}>
          <LocationTag
           key='locid'
           title={ this.state.location }
          />
        </View>
      );
    } else {
      return null;
    }
  };

  // ---------------------------------------------------------------------------------

  render() {
    // console.log('edit post content ');
    
    return (
      <KeyboardShift>
        <View 
          style={styles.container}
          >
          
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
              this.setState({description: text});
            }}
            value={this.state.description?this.state.description:''}
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
              leftIcon  = {{name: 'language'}}
              bottomDivider
              chevron
              onPress   = { () => this.getLocation()}
              subtitle  = { this.renderLocation()}
            />
            <ListItem // Clouds
              title="Cloud"
              leftIcon  = {{name: 'group'}}
              bottomDivider
              chevron
              onPress   = {() => this.getClouds()}
              subtitle  = {
                <View style={styles.subtitle}>
                  {this.state.allClouds.map((cloud, index) => (

                    <SubTag
                      key               = { index }
                      data              = { cloud }
                      greyOutOnTagPress = { !(cloud.name === 'Personal')} // Cant turn off the Personal cloud
                      buttonDown        = { !cloud.selected  }
                      onTagPress        = { this.handleCloudTagPress}
                      title             = { cloud.name }
                    />
                    
                  ))}
                </View>
              }
            />
          </View>
              <ThumbList
                data               = { this.state.content}
                handleThumbPress   = { this.showImageEditModal}    
                handleDeletePress  = { this.showDeleteDialog }      
                handleOrderChange  = { (newdata ) => this.setState({content:newdata})}
              />
          
        </View>

        <View style={styles.mainButtons}>
          
          <BlankButton 
            onPress      = { this.cancelUpdate } 
            title        = { 'Cancel'} 
            source       = { require('./images/cancel.png') }
            buttonStyle  = { {height:40,width:40}}
            />

          <BlankButton 
            onPress     = { this.showCapture } 
            title       = { 'Add File'} 
            source      = { require('./images/plus_green.png') }
            buttonStyle  = { {height:40,width:40}}
            />

          <BlankButton 
            onPress  = { this.updatePost } 
            title    = { 'Update'} 
            source   = { require('./images/upload.png') }
            buttonStyle  = { {height:40,width:40}}
            />
        </View>
        
        { this.renderImageEditModal() }
        { this.renderDeleteDialog()   }
        { this.renderPeopleModal()    }
        { this.renderLocationModal()  }
        { this.renderCaptureModal()   }
        { this.renderCloudModal()     }
        

      </KeyboardShift>
    );
  }
  
  // ---------------------------------------------------------------------------------

  renderCloudModal = () =>{
    
    if(this.state.cloudModalVisable){
      
      return (
        <Modal
            animationType   = "slide"
            transparent     = { false}
            visible         = { this.state.cloudModalVisable}
            >
            <SearchClouds 
                  allClouds     = { this.state.allClouds}
                  taggedClouds  = { this.state.taggedClouds }
                  updateClouds  = { this.updateClouds }
                  close         = { () => {this.setState({cloudModalVisable: false})}}
              />      
          </Modal>
      )
    }else{
      return null
    }
  }

  // ---------------------------------------------------------------------------------

  renderCaptureModal = () =>{
    
    if(this.state.captureModalVisible){
      return (
        <Modal
            animationType   = "slide"
            transparent     = { false}
            visible         = { this.state.captureModalVisible}
            >
            <Capture 
              captureContent = { this.state.content }
              editmode       = { true }
              close          = { () => this.setState({captureModalVisible:false})}
              updateContent  = { ( newContent ) => this.setState({content:newContent}) }
              
            />
          </Modal>
      )
    }else{
      return null
    }
  }
  
  // ---------------------------------------------------------------------------------

  cancelUpdate = () => {
   this.props.close()

  }

  // ---------------------------------------------------------------------------------

  renderPeopleModal = () =>{
    
      if(this.state.peopleModalVisible){
        return (
          <Modal
              animationType   = "slide"
              transparent     = {false}
              visible         = {this.state.peopleModalVisible}
              >
              <SearchPeople 
                  allPeople     = { this.state.allPeople}
                  taggedPeople  = { this.state.taggedPeople }
                  updatePeople  = { this.updatePeople }
                  close         = { () => {this.setState({peopleModalVisible: false})}}
              />              
            </Modal>
        )
      }else{
        return null
      }
      
  }

  // ---------------------------------------------------------------------------------

  renderLocationModal = () =>{
    
    if(this.state.locationModalVisible){
      return (
        <Modal
            animationType   = "slide"
            transparent     = {false}
            visible         = {this.state.locationModalVisible}
            >
            <SearchLocation
                location        = { this.state.location}
                updateLocation  = { this.updateLocation }
                close           = { () => {this.setState({locationModalVisible: false})}}
            />              
          </Modal>
      )
    }else{
      return null
    }
    
  }

  // ---------------------------------------------------------------------------------

  renderImageEditModal = () => {
    let content = null
    
    if(this.state.activeItem){
      console.log('image edit modal ',this.state.activeItem);
      switch (this.state.activeItem.type) {
        case IMAGE:
          content = <CachedZoomableImage 
                      style     = { {height:'100%',width:'100%',resizeMode:'cover'}}
                      uri       = { this.state.activeItem.thumbnail}
                      filename  = { mem.getFilename(this.state.activeItem.thumbnail) }
                    />
          break;
        case VIDEO:
          content = <Video
                      source   = { { uri: this.state.activeItem.displayurl } }
                      paused   = { true }
                      muted    = { false }    
                      controls  = { true}                  
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
          animationType   = "slide"
          transparent     = {false}
          visible         = {this.state.modalVisible}
          onRequestClose  = {() => {
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



export default EditPost;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop:80,
  },

  imageFull: {
    position: 'absolute',
    width: '100%', 
    height: '100%', 
    resizeMode:'cover',
    zIndex: -1
  },
  PostButton:{
    borderWidth:2,
    borderRadius:10,
    borderColor:'#7d7a7a',
    color:'#c7c5c5',
    
    padding:4,

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
