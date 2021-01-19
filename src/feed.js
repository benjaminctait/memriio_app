import React, {Component} from 'react';
import MemoryCard from './cards';
import * as mem from './datapass';
import {StyleSheet, View, ScrollView, Text, RefreshControl} from 'react-native';
import {SubTag} from './buttons';
import AsyncStorage from '@react-native-community/async-storage';
import { SearchBar } from 'react-native-elements'
import { Button } from 'react-native';
import RNFS from 'react-native-fs'
import {showMessage, hideMessage} from 'react-native-flash-message';





class Feed extends Component {
  constructor(props) {
    super(props);
    this.getIncludedClouds.bind(this);
    this.handleSearchChange.bind(this);
    this.handleCloudChange.bind(this);
    this.flushFeed.bind(this);
  }

  state = {
    memories: [],        
    userClouds: [],
    user: null,
    searchwordcount: 1,
    searchwords: '',  
    isLoading: true,    
    refreshing: false,
    activeCloudID:0,
  };

  //----------------------------------------------------------------------------------------------

  refreshFeed = () => {
    this.handleSearchChange(this.state.searchwords);
    
  };

  //----------------------------------------------------------------------------------------------

  handleSearchChange = (searchwords) => {

  
    let wordarray = [];
    this.setState({searchwords:searchwords})
    if (searchwords) {
      wordarray = searchwords.toLowerCase().split(' ');
    }
    let cloudids = [this.state.activeCloudID]
    let userid = this.state.user.userid;

    console.log(
      'handleSearchChange ' + cloudids + ': searchwords ' + wordarray,
    );

    if (cloudids.length === 0) {
      this.loadMemories(null);
    } else if (cloudids.length === 1 && cloudids[0].value === 0) {
      // personal only
        
        mem.searchMemories_User(userid, wordarray).then(
          (memories) => {
            this.loadMemories(memories);
          },
          (error) => {
            this.loadMemories(null);
          },
        );
      
    } else if (cloudids.includes(0)) {
      // personal cloud + other clouds

      if (wordarray.length > 0) {
        // clouds + searchwords
        mem.getMemories_User_Words_Clouds(userid, wordarray, cloudids).then(
          (memories) => {
            this.loadMemories(memories);
          },
          (error) => {
            this.loadMemories(null);
          },
        );
      } else {
        // clouds but no search words
        mem.getMemories_User_Clouds(userid, cloudids).then(
          (memories) => {
            this.loadMemories(memories);
          },
          (error) => {
            this.loadMemories(null);
          },
        );
      }
    } else {
      if (wordarray.length > 0) {
        // clouds + searchwords
        mem.getMemories_Words_Clouds(cloudids, wordarray).then(
          (memories) => {
            this.loadMemories(memories);
          },
          (error) => {
            this.loadMemories(null);
          },
        );
      } else {
        // clouds but no search words
        mem.getMemories_Clouds(cloudids).then(
          (memories) => {
            this.loadMemories(memories);
          },
          (error) => {
            this.loadMemories(null);
          },
        );
      }
    }
  };

  //----------------------------------------------------------------------------------------------

  loadMemories = (memories) => {

    this.setState({memories: memories, isLoading: false});
    
  };

  //----------------------------------------------------------------------------------------------

  loadClouds = (clouds) => {

    console.log('loadclouds - activeCloudID : ',this.state.activeCloudID);

    let personal = {
      id: 0,
      name: 'Personal',
      administrator: this.state.user.userid,
      createdon: this.state.user.createdon,
    };
    clouds.push(personal);
    clouds.reverse();
    this.setState({userClouds: clouds},()=>{
      
      for (let index = 0; index < clouds.length; index++) {
        if( clouds[index].id == this.state.activeCloudID){
          this.readCloudMemoriesFromFile(clouds[index].id , clouds[index].name); 
          this.setState({ activeCloud : clouds[index] })
        }
      }
    });

    setTimeout(()=>{ this.checkForUpdates( this.state.activeCloudID ) },5000)
    
  };

  
  //----------------------------------------------------------------------------------------------
  
  checkForUpdates = ( cloudid  )=>{

    let Promises = [],temp = []
    console.log(`checking for updates in cloud ${cloudid}`);

    mem.getMemories_Clouds( [cloudid] )
    .then ( mems => { 
       
        mems.map( newmem => {
          if(newmem.memid < 125 ){
            if(this.memoryIsNewOrUpdated( newmem  )){
              console.log(`newmem  ${newmem.memid} is new`);
              Promises.push(
                this.downloadMemory( newmem , cloudid ).then( newmemory =>{
                  temp.push(newmemory)
                })
              )
            }else{
              console.log(`newmem  ${newmem.memid} exists`);
            }
          }else{
            console.log(`newmem ${newmem.memid} above threshold`);
          }
          
      })
      Promise.all(Promises).then( ()=>{
          showMessage({
            message: 'Show New Posts ',
            type: 'success',
            autoHide:false,
            hideOnPress:true,            
            floating: true,
            onPress: ()=>{this.pushNewMemories(temp)}
          });
      })
    })
  }

  //----------------------------------------------------------------------------------------------

  pushNewMemories = ( newMemories ) =>{
    newMemories.map(memfile =>{
      console.log(`memory downloaded memid : ${memfile.memid} ${memfile.title}`)
      mem.log(memfile)
    }) 
    let x = this.state.memories.concat(newMemories)
    
    this.loadMemories(x)
    this.writeCloudMemoriesToFile(this.state.activeCloudID)
    
  }

  //----------------------------------------------------------------------------------------------

  memoryIsNewOrUpdated = ( memory ) =>{
    let localMemories =  this.state.memories
   
    
    for (let index = 0; index < localMemories.length; index++) {
      let localMem = localMemories[index];
      
      if(localMem.memid == memory.memid ) {
        if(localMem.modifiedon > memory.modifiedon){
          return true   // memory already exists in local feed but needs to be updated
        }else {
          return false  // memory already exists and does not need updating
        }        
      }      
    }
    
    return true // search was unable to find the memory in localMemorys ( neither new nor updated )
  }

  //----------------------------------------------------------------------------------------------

  writeCloudMemoriesToFile = (cloudid) =>{

    let cloudfile = `cloudfile-${cloudid}`
    mem.getLocalCacheFolder()
    .then(cacheFolder =>{
      let path = `${cacheFolder}/${cloudfile}.txt`
      let json = JSON.stringify(this.state.memories);
      console.log(`writeFile Attempt ${path}`);      
      
      RNFS.writeFile(path, json, 'utf8')
      .then((success) => {
        console.log('writeFile success ! : ',path);
      })
      .catch((err) => {
          console.log(err.message);
      });  
    })
    .catch(err =>{
      console.log(err);
    })
    

  }

  //----------------------------------------------------------------------------------------------
  
  readCloudMemoriesFromFile = (cloudid,cloudname) =>{
    
    let cloudfile = `cloudfile-${cloudid}`
    console.log(`readCloudMemoriesFromFile ${cloudfile}`);
    mem.getLocalCacheFolder()
    .then(cacheFolder =>{
      let path = `${cacheFolder}/${cloudfile}.txt`
      console.log(`readingFile ${path}`);
      
      RNFS.readFile(path,'utf8')
      .then((file) => {
        let memarray = JSON.parse(file)
    
        memarray.map(memory=>{console.log(`loading memory ${memory.memid} ${memory.title}`);})
        this.setState({memories:memarray},()=>{
          this.loadMemories(this.state.memories)
        })
      })
      .catch((err) => {
          console.log(err.message);
      });  
    })
    .catch(err =>{
      console.log(err);
    })
  }

  //----------------------------------------------------------------------------------------------

  downloadMemory = ( newmemory , cloudid ) =>{
    
    let xmem = newmemory
    
    return new Promise((resolve,reject)=>{
        
      mem.getUserDetails( xmem.userid ).then( author =>{
        xmem.author = author     
        mem.getUserStatus( author.userid , cloudid).then(status =>{
          xmem.author.status = status            
          mem.getMemoryClouds( newmemory.memid ).then( uclouds =>{
            xmem.taggedClouds = uclouds              
            mem.getMemoryPeople ( newmemory.memid, (people) =>{
              xmem.taggedPeople = people
              mem.getMemoryFiles ( newmemory.memid, (files) =>{                  
                xmem.memfiles = files
                mem.getMemoryLikes ( newmemory.memid, cloudid ).then ( likes =>{
                  xmem.likes = likes
                  // Promise.all(
                  //   xmem.memfiles.map(async (file,index) =>{ 
                      
                  //       return mem.downloadRemoteFileToCache( file.thumburl )
                  //               .then( localpath =>{
                  //                 xmem.memfiles[index].thumburl = localpath
                  //               })   
                  //   })
                  //   ).then(values=>{
                  //     resolve ( xmem )
                  //   })
                  resolve ( xmem )
                  })
                })
              })
            })
          })
        })
      })
  
  }

  //----------------------------------------------------------------------------------------------

  componentDidMount = async () => {
    console.log(' FEED : DIDMOUNT ');
    mem.getActiveUser().then(user =>{
      mem.log(user,'Active User : ');
      this.setState({ user:user , activeCloudID:user.activeCloudID },()=>{
        mem.getUserClouds(this.state.user.userid, this.loadClouds);
      })
    })
    
  };

  //----------------------------------------------------------------------------------------------
  handleCloudChange = async (cloud, shouldInclude) => {
    this.flushFeed();

    await mem.cleanupStorage({key:'activeCloudID'})

    if(shouldInclude){
      AsyncStorage.setItem('activeCloudID',cloud.id.toString())
      
      this.setState({activeCloudID: cloud.id},()=>{
        //this.checkForUpdates(this.state.activeCloudID)
      });
      
    }
    this.handleSearchChange(this.state.searchwords);
  };

  //----------------------------------------------------------------------------------------------
  flushFeed = () => {
    this.setState({isLoading: true});
  };

  //----------------------------------------------------------------------------------------------

  cloudIsActive = async (cloudid) => {
    let include = false
    this.state.cloudInclusions.map(cloud => { 
      
      if(cloud.cloudid == cloudid ){
        if(cloud.include){
          include = true
        }
      }
    })

    console.log('ACTIVE ? ', cloudid, include )
    return include
  }

  //----------------------------------------------------------------------------------------------

  getIncludedClouds = () => {
    let cloudids = [];
    this.state.cloudInclusions.map((cloud) => {
      if (cloud.include) {
        cloudids.push(cloud.cloudid);
      }
    });
    return cloudids;
  };

  //----------------------------------------------------------------------------------------------

  onRefresh = () => {
    this.state.refreshing = true;
    console.log('refreshfeed ');
    this.refreshFeed();
    this.state.refreshing = false;
  };

  //----------------------------------------------------------------

  updateMemory = ( memory ) => {
    console.log('FEED updateMemory ')
    tmp = []
    
    let memarray = Array.isArray(this.state.memories)?this.state.memories:[]
    mem.findArrayIndex(memarray,(item) =>{return item.memid === memory.memid })
    .then(idx => {
                  if( idx > -1 ){
                    memarray.map((mem,index) =>{
                      if (idx === index )  tmp.push(memory)
                      else tmp.push( memarray[index] )
                    })
                    this.setState({memories:tmp},() =>{
                      
                    })
                  }
    })
    
    
  }

  //----------------------------------------------------------------------------------------------


  render() {
    let memisArray = Array.isArray(this.state.memories);
    console.log('feed render');
    let memcount = 0;
    let feedview = {};
    if (memisArray) {
      memcount = this.state.memories.length;
    }
    
    if (memisArray && !this.state.isLoading && memcount) {
      feedview = (        
        <ScrollView
          style={styles.scrollarea}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }>
          {this.state.memories.map((mem, index) => (
            
            <MemoryCard
              key          = { index                  }
              memory       = { mem                    }
              activeCloudID  = { this.state.activeCloudID }
              navigation   = { this.props.navigation  }
              updateMemory = { this.updateMemory      }
              
            />
          ))}
        </ScrollView>
      );
    } else if (memisArray && this.state.isLoading) {
      feedview = (
        <View style={styles.nomemory}>
          <Text style={styles.textMain}>Loading...</Text>
        </View>
      );
    } else if (memisArray && !this.state.isLoading && memcount == 0) {
      feedview = (
        <View style={styles.nomemory}>
          <Text style={styles.textMain}>No Results</Text>
        </View>
      );
    } else if (this.state.isLoading) {
      feedview = (
        <View style={styles.nomemory}>
          <Text style={styles.textMain}>Loading...</Text>
        </View>
      );
    } else {
      feedview = (
        <View style={styles.nomemory}>
          <Text style={styles.textMain}></Text>
        </View>
      );
    }

    return (
      <View style={styles.mainArea}>
        
        <SearchBar

            placeholder="Search..."
            placeholderTextColor="grey"
            inputStyle  = {{color:'black'}}
            containerStyle={styles.searchContainer}
            inputContainerStyle={[styles.searchContainer,this.props.style]}            
            onChangeText={(text) => {
              this.handleSearchChange(text);
            }}
            value={this.state.searchwords}
        />
        {/* <Button 
          title = 'TEST BUTTON'
          onPress = {() => this.pushNewMemories()}
        /> */}
        {feedview}
        <View style={styles.cloudarea}>
          {this.state.userClouds.map((cloud, index) => (
             
            <SubTag
              key               = { index }
              data              = { cloud }
              title             = { cloud.name}
              buttonDown        = { (cloud.id != this.state.activeCloudID) }
              greyOutOnTagPress = { true }
              onTagPress        = { this.handleCloudChange }
            />
          ))}
        </View>
       
      </View>
    );
  }

 

  //----------------------------------------------------------------------------------------------
}

export default Feed;

const styles = StyleSheet.create({
  mainArea: {
    flex: 1,
  },
  scrollarea: {
    height: 1000,
    paddingVertical: 1,
  },

  searchContainer:{
    backgroundColor:'white'
  },

  nomemory: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textMain: {
    fontSize: 30,
    color: 'black',
  },
  cloudarea: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-start',

    marginTop: 0,
    padding: 5,
    paddingTop: 8,
    marginLeft: 2,
    marginRight: 2,
    borderTopWidth: 1,

    borderColor: 'gray',
    backgroundColor: 'white',
  },

  searchfield: {
    marginTop: 5,
    marginBottom: 2,
    marginLeft: 2,
    marginRight: 2,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    backgroundColor: 'white',
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'gray',
    color: 'black',
  },
  ptagText: {
    fontSize: 15,
  },
  ptag: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingBottom: 4,
    paddingTop: 4,
    marginRight: 4,
    marginBottom: 4,
    borderColor: '#db5c1d',
    backgroundColor: '#f5f5f5',
  },
});
