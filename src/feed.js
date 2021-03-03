import React, {Component} from 'react';
import MemoryCard from './cards';
import * as mem from './datapass';
import {StyleSheet, View, ScrollView, Text, RefreshControl,ActivityIndicator,Button} from 'react-native';
import {SubTag} from './buttons';
import AsyncStorage from '@react-native-community/async-storage';
import { SearchBar } from 'react-native-elements'
import RNFS from 'react-native-fs'
import {showMessage, hideMessage} from 'react-native-flash-message';
import { EventRegister } from 'react-native-event-listeners'

import * as Progress from 'react-native-progress';
import { log } from 'react-native-reanimated';


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
    searchResult:[],
    userClouds: [],
    user: null,
    searchwordcount: 1,
    searchwords: '',  
    isLoading: true,   
    isSearching:false, 
    refreshing: false,
    activeCloudID:0,
    loadingMessage:'Loading..',
    progressVisible:false,
    progress:0,
    nextProgressIncrement:0,
    spinnerVisible:false,
    
  };

  //----------------------------------------------------------------------------------------------

  refreshFeed = () => {
    
    this.checkForUpdates(this.state.activeCloudID,true,false)

    showMessage({
      message   : `Checking for updates`,
      type      : 'success',
      autoHide  : true,
      duration  : 1000,    
      floating  : true,
      })      
    
  };

  //----------------------------------------------------------------------------------------------

  handleSearchChange = (searchwords) => {

    this.setState({searchwords:searchwords,searchResult:[]}) 

    if (searchwords ) {
      let wordarray = searchwords.toLowerCase().split(' ')  
      
      this.setState({isSearching : true , loadingMessage:'searching..'},()=>{
        for (let ind = 0; ind < wordarray.length; ind++) {
          const wordtofind = wordarray[ind].toLowerCase();
          if( wordtofind != ' '){
            for (let cnt  = 0; cnt  < this.state.memories.length; cnt ++) {
              const memory = this.state.memories[cnt]
                for (let idx = 0; idx < memory.searchwords.length; idx++) {
                  const memoryword = memory.searchwords[idx].keyword;  
                  if( memoryword.includes( wordtofind) || memoryword === wordtofind  ){
                      let x = this.state.searchResult
                      x.push( memory )
                      this.setState({ isSearching:true,searchResult : x })
                      break;
                  }
                }
            } 
          }
        }
      });
    }else{
      this.setState({searchResult:[],isSearching:false,loadingMessage:'Loading...'})
    }
  };

  //----------------------------------------------------------------------------------------------
  
  memoryInSearchResult = (memory) => {

    for (let index = 0; index < this.state.searchResult.length; index++) {
      const searchMem = this.state.searchResult[index];
      if( searchMem.memid === memory.memid) return true
    }
    return false
  }

  //----------------------------------------------------------------------------------------------

  loadMemories = async (memories) => {

    this.setState({ 
        memories: memories, 
        isLoading: false,
        spinnerVisible:false,
        notCurrentlyUpdating:true,  
      },()=>{
                              return
                            });
    
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
          this.setState({ activeCloud : clouds[index] })
        }
      }
      console.log(`read cloud from file ${this.state.activeCloudID}`);
      this.readCloudMemoriesFromFile( this.state.activeCloudID )
      .then( memoryArray =>{
        if( memoryArray === null ){ // no cloud file exists 
        
          this.firstTimeCloudSetup( this.state.activeCloudID )

        }else{  // cloud file found  

          this.loadMemories( memoryArray )
          setTimeout(() => { 
            this.checkForUpdates( this.state.activeCloudID ,true ,true) 
            
          },5000)

        }
      })
    });
    
  };

  //----------------------------------------------------------------------------------------------

  firstTimeCloudSetup = ( cloudid ) =>{
    this.setState({
        loadingMessage:`Setting up cloud...`,
        progressVisible:true,
        spinnerVisible:false,
        notCurrentlyUpdating:false,
        progress:0.15
      })
   
   let memcount = 0 
   console.log(`first time cloud setup ${cloudid}`);

   
    this.getCloudMemories( cloudid )
    .then ( mems => { 
      this.setState({progress:0.3})
      mems.map( newmem   => {    
              
        this.setState({nextProgressIncrement:(0.7/mems.length)})
        this.downloadMemory( newmem , cloudid )
        .then( newmemory =>{
          this.pushNewMemories( [ newmemory ],cloudid )
          this.writeCloudMemoriesToFile ( this.state.memories, cloudid )
          if(++memcount >= mems.length) this.setState({progressVisible:false,notCurrentlyUpdating:true})
          console.log(`index ${memcount } length ${mems.length}`);
           
        })
      })
      
    })
  }

  //----------------------------------------------------------------------------------------------
  
  getCloudMemories = (cloudid) => {
    console.log(`getClouds : ${cloudid} `);
    return new Promise((resolve, reject) =>{
      if (cloudid === 0 ){
        console.log(`cloud is personal for user ${this.state.user.userid}`);
        mem.getMemories_User ( this.state.user.userid )
        .then( mems =>{
          resolve ( mems)
        })
      }else{
        console.log(`cloud is shared `);
        mem.getMemories_Clouds( [cloudid] )
        .then ( mems => { 
          resolve ( mems )
        })
      }
    })
  }
  
  //----------------------------------------------------------------------------------------------
  
  checkForUpdates = ( cloudid  , awaitUser, silentIfEmpty )=>{

    let Promises = [],temp = [], localMemories = this.state.memories
    let memcount = 0
    console.log(`checking for updates in cloud ${cloudid} awaitUser : ${awaitUser}`);
    

    this.setState({notCurrentlyUpdating:false})
    this.getCloudMemories( cloudid )
    .then ( remoteMemories => { 
      
      this.checkForRemovals(remoteMemories,localMemories)
      .then(mems => {
        
        this.setState({memories:mems},()=>{ this.writeCloudMemoriesToFile(this.state.memories , cloudid) }) // overwrite cloud file to capture removals before looking at additions
        
        remoteMemories.map( newmem => {
         
          if(this.memoryIsNewOrUpdated( newmem,localMemories )){
            
            if(awaitUser){
              
              Promises.push(
                this.downloadMemory( newmem , cloudid )
                .then( newmemory =>{
                  temp.push(newmemory)
                })
              )
            }else{
             
              this.downloadMemory( newmem , cloudid )
                .then( newmemory =>{
                  this.pushNewMemories([newmemory],cloudid)
                  this.writeCloudMemoriesToFile(this.state.memories,cloudid)
                  if(++memcount >= mems.length) {
                    this.setState({notCurrentlyUpdating:true})
                  }
                  
                })
            }
          }else{
            ++memcount
            //console.log(`newmem  ${newmem.memid} exists`);
          }
        })
        if(awaitUser){
          Promise.all(Promises).then( (values)=>{
            if(temp.length > 0)
            {
              showMessage({
                message: `You have ${temp.length} new posts`,
                type: 'success',
                autoHide:false,
                hideOnPress:true,            
                floating: true,
                onPress: ()=>{
                  console.log('user pressed updated');
                  this.pushNewMemories(temp,cloudid)
                  this.writeCloudMemoriesToFile(this.state.memories,cloudid)
                  this.setState({notCurrentlyUpdating:true})
                  }              
                })   
              
            }else{
              if(!silentIfEmpty){
                showMessage({
                  message: `No updates for now !`,
                  type: 'success',
                  autoHide:true,
                  duration:3000,    
                  floating: true,
                  })      
              }
              console.log(`no new memories for cloud : ${ cloudid }`);
              this.setState({notCurrentlyUpdating:true})
            }
          })
        }
        
      })
        
    })
  }

  //----------------------------------------------------------------------------------------------
  
  checkForRemovals = (remoteMems,localMems) => {
  // removes any memory in localMems that does not exist in remoteMemories
    
    
    let newLocalArray = []
    let count = 0
    let found = false
    console.log(`removal check start. Old memory count = ${localMems.length} `);

    return new Promise((resolve, reject) => {
      localMems.map(localmem =>{
        found = false
        for (let index = 0; index < remoteMems.length; index++) {
          if(remoteMems[index].memid === localmem.memid){
            newLocalArray.push(localmem)
            found = true
            break
          }
        }
        if(!found) console.log(`memory removed ${localmem.memid} ${localmem.title}`)
        if(count >= localMems.length-1){
          console.log(`removal check complete. New memory count ${newLocalArray.length}`);          
          resolve(newLocalArray)
        }else{
          count++
        }

      })
    })
  }
  
  //----------------------------------------------------------------------------------------------

  pushNewMemories = ( newMemories,cloudid ) =>{
    
      newMemories.map((newmem,ind) =>{
        
        if( cloudid === this.state.activeCloudID ){

          let x = this.state.memories
          mem.findArrayIndex(x,(memory) =>{ return memory.memid === newmem.memid })
          .then(index =>{
            if(index !== -1){
              console.log(`swap memory : ${newmem.memid} ${newmem.title} to cloud ${cloudid}`)
              x.splice(index,1,newmem)
            }else{
              console.log(`push memory : ${newmem.memid} ${newmem.title} to cloud ${cloudid}`)
              x.push(newmem)
            }
            
            if(ind === newMemories.length - 1){
              if(x.length>1) x.sort(this.memoryCompare)
              this.setState({ memories: x ,isLoading: false, spinnerVisible:false,}) 
            }
          })
        }
      })
  }

  memoryCompare = (a,b) => {
    if( a.memid > b.memid ) return -1
    if( a.memid < b.memid ) return 1
  }
  
  //----------------------------------------------------------------------------------------------

  memoryIsNewOrUpdated = ( memory ,localMemories) =>{

    for (let index = 0; index < localMemories.length; index++) {
      let localMem = localMemories[index];      
      if( localMem.memid == memory.memid ) {
        if( localMem.modifiedon != memory.modifiedon ){
          console.log(`found modified memory ${memory.memid} ${memory.title} modified on: ${memory.modifiedon} local ${localMem.modifiedon}`);
          return true   // memory already exists in local feed but needs to be updated
        }else {
          return false  // memory already exists and does not need updating
        }        
      }      
    }
    console.log(`found new memory ${memory.memid} ${memory.title} created on: ${memory.modifiedon}`);
    return true // search was unable to find the memory -> memory is new
  }

  //----------------------------------------------------------------------------------------------

  wipeCloudFiles = () =>{
    let personal = `cloudfile-0`
    let uap = `cloudfile-1`
    let tait = `cloudfile-5`

    mem.getLocalCacheFolder()
    .then(cacheFolder =>{
      RNFS.unlink(`${cacheFolder}/${personal}.json`)
      RNFS.unlink(`${cacheFolder}/${uap}.json`)
      RNFS.unlink(`${cacheFolder}/${tait}.json`)
    })
    AsyncStorage.removeItem('activeCloudID')
      
     
  }

  //----------------------------------------------------------------------------------------------
  
  pushMemoryToAllLocalFiles = (memory) =>{

  memory.taggedClouds.map(cloud =>{ 
    let cloudfile = `cloudfile-${cloud.id}`
    this.readCloudMemoriesFromFile(cloud.id)
      .then( memories =>{
        memories.push(memory)
        this.writeCloudMemoriesToFile(memories,cloud.id)
      })
      .catch(err =>{
        console.log(`Error reading local file : ${cloudfile}`);
        console.log(err);
      })
    })
  }
  //----------------------------------------------------------------------------------------------

  writeCloudMemoriesToFile = (memories,cloudid) =>{
    
    console.log(`write cloud file ${cloudid}`);
    let cloudfile = `cloudfile-${cloudid}`
    mem.getLocalCacheFolder()
    .then(cacheFolder =>{
      let path = `${cacheFolder}/${cloudfile}.json`
      let json = JSON.stringify(memories);
     
      
      RNFS.writeFile(path, json, 'utf8')
      .then((success) => {
        console.log('writeFile success ! : ',cloudfile);
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
  
  readCloudMemoriesFromFile = (cloudid) =>{
    
    let cloudfile = `cloudfile-${cloudid}`

    return new Promise((resolve, reject) => {
      
      console.log(`readCloudMemoriesFromFile ${cloudfile}`);
      mem.getLocalCacheFolder()
      .then(cacheFolder =>{
        let path = `${cacheFolder}/${cloudfile}.json`
        console.log(`readingFile ${path}`);
        RNFS.exists(path)
        .then(exists =>{
          
          if(exists){
            console.log(`cloud file ${cloudfile} found`);
            RNFS.readFile(path,'utf8')
                  .then((file) => {
                    let memarray = JSON.parse(file)
                    memarray.map((memory,index)=>{console.log(`loading memory ${index} ${memory.memid} ${memory.title} ${memory.modifiedon}`)})
                    resolve(memarray)
                  })
                  .catch((err) => {
                      console.log(err.message);
                      reject(err);
                  }); 
          }else{
            console.log(`cloud file : ${cloudfile} not found `);
            resolve(null);
          }
        })
        
      })
      .catch(err =>{
        console.log(err);
        reject(err)
      })

    })
    
  }

  //----------------------------------------------------------------------------------------------

  prepNewMemoryForLocalStorage = ( newmemory  ) =>{
    
    let xmem = newmemory
    return new Promise((resolve,reject)=>{
      mem.getUserDetails( xmem.userid ).then( author =>{
        xmem.author = author
        mem.getMemoryDetails( xmem.memid ).then ( memdeets =>{
          xmem.createdon = memdeets.createdon
          xmem.modifiedon = memdeets.modifiedon
          mem.getMemoryClouds( newmemory.memid ).then( uclouds =>{
            xmem.taggedClouds = uclouds                  
            mem.getMemoryPeople ( newmemory.memid, (people) =>{
              xmem.taggedPeople = people              
              mem.getMemoryFiles ( newmemory.memid, (files) =>{                  
                xmem.memfiles = files
                mem.getMemorySearchwords ( newmemory.memid ).then ( searchwords =>{
                  xmem.searchwords = searchwords
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

  downloadMemory = ( newmemory , cloudid ) =>{
    
    let xmem = newmemory
    let increment = this.state.nextProgressIncrement / 7
    return new Promise((resolve,reject)=>{
        
      mem.getUserDetails( xmem.userid ).then( author =>{
        xmem.author = author     
        this.setState({progress:(this.state.progress+increment)})
        mem.getUserStatus( author.userid , cloudid).then(status =>{
          xmem.author.status = status            
          this.setState({progress:(this.state.progress+increment)})          
          mem.getMemoryClouds( newmemory.memid ).then( uclouds =>{
            xmem.taggedClouds = uclouds      
            this.setState({progress:(this.state.progress+increment)})        
            mem.getMemoryPeople ( newmemory.memid, (people) =>{
              xmem.taggedPeople = people
              this.setState({progress:(this.state.progress+increment)})
              mem.getMemoryFiles ( newmemory.memid, (files) =>{                  
                xmem.memfiles = files
                this.setState({progress:(this.state.progress+increment)})
                mem.getMemoryLikes ( newmemory.memid, cloudid ).then ( likes =>{
                  xmem.likes   = likes
                  this.setState({progress:(this.state.progress+increment)})
                    mem.getMemorySearchwords ( newmemory.memid ).then ( searchwords =>{
                      xmem.searchwords = searchwords
                      this.setState({progress:(this.state.progress+increment)})
                      resolve ( xmem )
                    })
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
    this.setState({spinnerVisible:true})
    mem.getActiveUser().then(user =>{
      mem.log(user,'Active User : ');
      this.setState({ user:user , activeCloudID:user.activeCloudID },()=>{
        mem.getMemoryDetails(544)
        mem.getUserClouds(this.state.user.userid, this.loadClouds);
      })
    })
    
    this.listener = EventRegister.addEventListener('pushNewMemory', (memory) => {
      console.log(`new memory pushed : ${memory.memid}`)
      
      this.prepNewMemoryForLocalStorage  (memory).then (newMemory =>{
        // this.pushMemoryToAllLocalFiles ( newMemory )
        // mem.findArrayIndex(newMemory.taggedClouds,(cloud) =>{return cloud.id === this.state.activeCloudID })
        // .then(index =>{
        //   if (index > -1 ){
        //     this.pushNewMemories( [ newMemory ],this.state.activeCloudID )
        //   }
        // })
        
        mem.log(newMemory)
      })
      

      
      
    })
    
  };

  //----------------------------------------------------------------------------------------------

  componentWillUnmount = async () => {
    console.log(`feed will unmount `);
    EventRegister.removeEventListener(this.listener)
  }

  //----------------------------------------------------------------------------------------------

  handleCloudChange = async (cloud, shouldInclude) => {
    
    if(this.state.notCurrentlyUpdating){
      this.setState({spinnerVisible:true,progressVisible:false,notCurrentlyUpdating:false})
      this.flushFeed();
      await mem.cleanupStorage({key:'activeCloudID'})

      if(shouldInclude){
        AsyncStorage.setItem('activeCloudID',cloud.id.toString())
        
        this.setState({ activeCloudID: cloud.id },()=>{

          this.readCloudMemoriesFromFile( cloud.id ) 
          .then( memarray => {


            if( memarray === null ){ // cloud file does not exist

              this.firstTimeCloudSetup( this.state.activeCloudID )

            }else{

              this.loadMemories     ( memarray )
              this.checkForUpdates  ( cloud.id , true ,true )

            }
          })
        });
      }
    }
    
  };

  //----------------------------------------------------------------------------------------------
  flushFeed = () => {
    this.setState({memories:[],isLoading: true,loadingMessage:''});
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
    if (this.state.notCurrentlyUpdating){
      this.refreshFeed();
    }
    this.state.refreshing = false;
  };

  //----------------------------------------------------------------

  updateMemory = ( memory ) => {
    console.log(`Feed.updateMemory ${memory.memid} ${memory.title}`)
    
    let memarray = Array.isArray(this.state.memories)?this.state.memories:[]
    mem.findArrayIndex(memarray,(item) =>{return item.memid === memory.memid })
    .then(idx => {
            if( idx !== -1 ){
              memarray.splice(idx,1,memory)
              this.setState({memories:memarray},() =>{                
                this.writeCloudMemoriesToFile(this.state.memories,this.state.activeCloudID)
                //this.updateLikesInAllLocalCloudFiles( )
                })
              }
          })
  }

  //----------------------------------------------------------------------------------------------


  render() {

    let memarray = this.state.isSearching ? this.state.searchResult:this.state.memories
    let memisArray = Array.isArray(memarray);    
    let memcount = memarray ? memarray.length : 0;
    let feedview = {};    
    
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
          {memarray.map((mem, index) => (
            
            
            <MemoryCard
              key            = { index                  }
              memory         = { mem                    }
              activeCloudID  = { this.state.activeCloudID }
              navigation     = { this.props.navigation  }
              updateMemory   = { this.updateMemory      }
              
            />
          ))}
        </ScrollView>
      );
    } else if (memisArray && this.state.isLoading) {
      feedview = (
        <View style={styles.nomemory}>
          <Text style={styles.textMain}>{this.state.loadingMessage}</Text>
          {this.renderSpinner()}
          {this.renderProgressBar()}          
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
          <Text style={styles.textMain}>yLoading...</Text>
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
          title = 'Wipe'
          onPress = {() => this.wipeCloudFiles()}
           />  */}
        {feedview}
        {this.renderCloudButtons()}
       
      </View>
    );
  }
  
  //----------------------------------------------------------------------------------------------

  renderCloudButtons = () =>{
    if(this.state.notCurrentlyUpdating){
      return (
        <View style={styles.cloudarea}>
          {this.state.userClouds.map((cloud, index) => (
            
            <SubTag
              key               = { index }
              data              = { cloud }
              tagDownStyle      = { { height:30,alignItems: 'center',backgroundColor:'#cce0ff',borderColor:'#cce0ff',borderRadius:5} }
              tagUpStyle        = { { height:30,alignItems: 'center',backgroundColor:'#3385ff',borderColor:'#3385ff',borderRadius:5} }
              textStyle         = { { justifyContent: 'center',color:'white'} }
              title             = { cloud.name}
              buttonDown        = { (cloud.id != this.state.activeCloudID) }
              greyOutOnTagPress = { true }
              onTagPress        = { this.handleCloudChange }
            />
          ))}
      </View>
      )
    }else{
      return null
    }

  }

  //----------------------------------------------------------------------------------------------

  renderSpinner = () =>{
    if(this.state.spinnerVisible){
      return (
        <View style={{flex:1,flexDirection:'row', justifyContent:'center'}}>
          <ActivityIndicator size="large" color="#0000ff"/>        
        </View>
      );
    }else{
      return null
    }

  }

  //----------------------------------------------------------------------------------------------

  renderProgressBar = () =>{
    if(this.state.progressVisible){
      return <View style={{flexDirection: 'row',alignItems: 'center'}}>
              <Progress.Bar              
                style={{margin:10}}
                progress={this.state.progress}
                indeterminate={false}
              />
            </View>
    }else{
      return null
    }
      
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
