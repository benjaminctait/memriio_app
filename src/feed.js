import React, {Component} from 'react';
import MemoryCard from './cards';
import * as mem from './datapass';
import {StyleSheet, View, ScrollView, Text, RefreshControl} from 'react-native';
import {SubTag} from './buttons';
import AsyncStorage from '@react-native-community/async-storage';
import { SearchBar } from 'react-native-elements'



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
    activeCloud:0,
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
    let cloudids = [this.state.activeCloud]
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

    console.log('loadclouds - activecloud : ',this.state.activeCloud);

    let personal = {
      id: 0,
      name: 'Personal',
      administrator: this.state.user.userid,
      createdon: this.state.user.createdon,
    };
    clouds.push(personal);
    clouds.reverse();
    if(this.state.activeCloud === 0){
      this.handleSearchChange('')
    }else{
      mem.getMemories([this.state.activeCloud], this.loadMemories);
    }
   
    this.setState({userClouds: clouds});

  };

  //----------------------------------------------------------------------------------------------

  componentDidMount = async () => {
    console.log(' FEED : DIDMOUNT ');
    this.state.user = await mem.activeUser();

    mem.mapUserClouds(this.state.user.userid, this.loadClouds);
    
  };

  //----------------------------------------------------------------------------------------------
  handleCloudChange = async (cloud, shouldInclude) => {
    this.flushFeed();

    await mem.cleanupStorage({key:'activecloud'})

    if(shouldInclude){
      AsyncStorage.setItem('activecloud',cloud.id.toString())
      this.setState({activeCloud:cloud.id})
      
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

  //----------------------------------------------------------------------------------------------

  render() {
    let memisArray = Array.isArray(this.state.memories);

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
              key={index}
              memory={mem}
              activeCloud={this.state.activeCloud}
              navigation={this.props.navigation}
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
            containerStyle={styles.searchContainer}
            inputContainerStyle={[styles.searchContainer,this.props.style]}            
            onChangeText={(text) => {
              this.handleSearchChange(text);
            }}
            value={this.state.searchwords}
        />
        
        {feedview}
        <View style={styles.cloudarea}>
          {this.state.userClouds.map((cloud, index) => (
             
            <SubTag
              key               = { index }
              data              = { cloud }
              title             = { cloud.name}
              buttonDown        = { (cloud.id !== this.state.activeCloud) }
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
