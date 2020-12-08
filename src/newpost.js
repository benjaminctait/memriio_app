import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import KeyboardShift from './keyboardShift';
import * as mem from './datapass';
import Video from 'react-native-video';
import Spinner from 'react-native-loading-spinner-overlay';
import {showMessage,hideMessage} from "react-native-flash-message";




import {
  StyleSheet,
  View,
  Image,
  TextInput,
  Keyboard,
  ScrollView,
} from 'react-native';

import {
  CameraClickButton,
  BackButton,
  PostButton,
  SubTag,
  LocationTag,
} from './buttons';

import {Input, ListItem, CheckBox} from 'react-native-elements';


//--------------------------------------------------------------------------

class NewPost extends Component {
  constructor() {
    super();
    this.setupCloudsAndPeople = this.setupCloudsAndPeople.bind(this);
    this.pushMemory = this.pushMemory.bind(this)
    
  }

  state = {
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
    
    
    let locationName = me.location.firstname + ' ' + me.location.lastname   // a temporary treatment until we have gps implemented
    me.taggedClouds.map(cloud =>{
      if(cloud.id !== 0) cloudarray.push(parseInt(cloud.id)) })             // push all but the personal cloud
  
    
    me.taggedPeople.map((person, i) => {
      personarray[i] = person.userid;
    });
    
    showMessage({
      message: 'Memory uploading.. should be done shortly',
      type:'success',
      duration: 2000,
      autoHide: true,
      floating: true,
    })

    console.log('SEND POST',this.props.screenProps);
    this.props.navigation.navigate('Feed')

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
  }
  
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
      type:'success',
      duration: 2000,
      backgroundColor: '#5DADE2',
      color: '#FDFEFE',
      autoHide: true,
      floating: true,
    })
    
    
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
    const store = [];
    const user = await mem.activeUser();

    try {
      await AsyncStorage.getAllKeys().then((keys) => {
        console.log('newpost-didmount');
        console.log();

        keys.map((key, index) => {
          AsyncStorage.getItem(key).then((item) => console.log('async store for key ' + key + ' value ' ,item))
          if (
            key.includes('image-') ||
            key.includes('video-') ||
            key.includes('audio-')
          ) {
            if (!key.includes('thumb')) {
              AsyncStorage.getItem(key).then((item) => {
                this.getMatchingThumb(keys, key).then((thumb) => {
                  console.log(
                    'push content - key : ' +
                      key +
                      ', file : ' +
                      mem.getFilename(item) +
                      ', thumb : ' +
                      mem.getFilename(thumb),
                  );
                  if (key.includes('audio-')) {
                    store.push({
                      filepath: item,
                      thumbnail: thumb,
                      isAudio: true,
                    });
                  } else if (key.includes('video-')) {
                    store.push({
                      filepath: item,
                      thumbnail: thumb,
                      isVideo: true,
                    });
                  } else {
                    store.push({
                      filepath: item,
                      thumbnail: thumb,
                      isAudio: false,
                    });
                  }
                });
              });
            }
          }
        });
        console.log('content is array ' + Array.isArray(this.state.content));

        this.setState({
          content: store,
          user: user,
        });
      });
      await mem.mapUserClouds(user.userid, this.setupCloudsAndPeople);
    } catch (e) {
      alert(e);
    }
  }

  // ---------------------------------------------------------------------------------

  handleCloudTagPress = (cloudItem, buttonState) => {

    let selectedClouds = this.state.taggedClouds.map((cloud) => { return cloud.id })
    let newarray = []
    let exists = selectedClouds.includes(cloudItem.id)

    if (buttonState && !exists) {
      this.state.taggedClouds.push(cloudItem);
    }

    if (!buttonState && exists) {
    this.state.taggedClouds.map(cloud =>{
      if(cloud.id !== cloudItem.id) newarray.push(cloud)})
    this.state.taggedClouds = newarray  
    }

    console.log('handleCloudTagPress : taggedClouds.cloud.id ' ,
      this.state.taggedClouds.map((cloud) => {
        return cloud.id;
      }),
    );
  };

  // ---------------------------------------------------------------------------------

  getMatchingThumb = (keys, targetKey) => {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(targetKey + '-thumb').then((thumbPath) => {
        console.log('thumb for :', targetKey, thumbPath);
        resolve(thumbPath);
      });
      // let targetKeyNumber = parseInt(targetKey.slice(-1));
      // keys.map((key) => {
      //   if (key.includes('thumb')) {
      //     let thumbKeyNumber = parseInt(key.slice(-1));

      //     if (targetKeyNumber === thumbKeyNumber) {
      //       AsyncStorage.getItem(targetKey+'-thumb').then((thumbPath) => {
      //         resolve(thumbPath);
      //       });
      //     }
      //   }
      // });
    });
  };

  // ---------------------------------------------------------------------------------

  renderLocation = () => {
    console.log('locaiton : ' + this.state.location);
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
    let itemcount = this.state.content.length;
    //console.log('newpost content :', this.state.content);
    return (
      <KeyboardShift>
        <View style={styles.container}>
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
              this.setState({story: text});}}
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
          <ScrollView
            horizontal={true}
            contentContainerStyle={{width: `${100 * itemcount}%`}}
            showsHorizontalScrollIndicator={true}
            scrollEventThrottle={200}
            decelerationRate="fast"
            pagingEnabled>
            {this.state.content.map((item, index) => (
              <View style={styles.thumbnailsContainer}>
                {item.isVideo ? (
                  <Video
                    source={{uri: item.filepath}}
                    paused={true}
                    muted={false}
                    controls={true}
                    poster={item.thumbnail}
                    style={styles.thumbnailStyle}
                  />
                ) : (
                  <Image
                    key={index}
                    style={styles.thumbnailStyle}
                    source={
                      item.isAudio
                        ? require('./images/audioThumb.png')
                        : {uri: item.thumbnail}
                    }
                    resizeMode="cover"
                  />
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.mainButtons}>
          <BackButton onPress={() => this.props.navigation.goBack(null)} />
          <PostButton onPress={() => this.sendPost()} />
        </View>
      
      </KeyboardShift>
      
    );
  }
}

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    height: 200,
    width: 100,
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
