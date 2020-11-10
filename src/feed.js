import React, {Component} from 'react';
import MemoryCard from './cards';
import * as mem from './datapass';

import {StyleSheet, View, ScrollView, Text, RefreshControl} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {SubTag} from './buttons';

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
    cloudInclusions: [{}],
    isLoading: true,
    personalMemoryunsharedOnly: false,
    refreshing: false,
  };

  //----------------------------------------------------------------------------------------------

  refreshFeed = () => {
    this.handleSearchChange(this.state.searchwords);
  };

  //----------------------------------------------------------------------------------------------

  handleSearchChange = (searchwords) => {
    let wordarray = [];
    if (searchwords) {
      wordarray = searchwords.toLowerCase().split(' ');
    }
    let cloudids = this.getIncludedClouds();
    let userid = this.state.user.userid;

    console.log(
      'handleSearchChange ' + cloudids + ': searchwords ' + wordarray,
    );

    if (cloudids.length === 0) {
      this.loadMemories(null);
    } else if (cloudids.length === 1 && cloudids[0].value === 0) {
      // personal only

      if (this.state.personalMemoryunsharedOnly) {
        // personal only - unshared only
        mem.getMemories_PersonalOnly_Unshared(userid, wordarray).then(
          (memories) => {
            this.loadMemories(memories);
          },
          (error) => {
            this.loadMemories(null);
          },
        );
      } else {
        // personal only - bth shared and undshared
        mem.getMemories_PersonalOnly_All(userid, wordarray).then(
          (memories) => {
            this.loadMemories(memories);
          },
          (error) => {
            this.loadMemories(null);
          },
        );
      }
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
    let cloudids = [0];
    let personal = {
      id: 0,
      name: 'Personal',
      administrator: this.state.user.userid,
      createdon: this.state.user.createdon,
    };
    clouds.push(personal);
    clouds.reverse();

    clouds.map((cloud) => {
      this.state.cloudInclusions.push({cloudid: cloud.id, include: true});
      cloudids.push(cloud.id);
    });
    mem.getMemories(this.state.user.userid, cloudids, this.loadMemories);
    this.setState({userClouds: clouds});
  };

  //----------------------------------------------------------------------------------------------

  componentDidMount = async () => {
    this.state.user = await mem.activeUser();
    mem.mapUserClouds(this.state.user.userid, this.loadClouds);
    this.refreshFeed();
  };

  //----------------------------------------------------------------------------------------------
  handleCloudChange = (cloud, shouldInclude) => {
    this.flushFeed();
    this.state.cloudInclusions.forEach((element) => {
      if (element.cloudid === cloud.id) {
        element.include = shouldInclude;
      }
    });

    this.handleSearchChange(this.state.searchwords);
  };

  //----------------------------------------------------------------------------------------------
  flushFeed = () => {
    this.setState({isLoading: true});
  };

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
              title={mem.title}
              description={mem.description}
              story={mem.story}
              createdon={mem.createdon}
              userid={mem.userid}
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
          <Text style={styles.textMain}>Im Empty !</Text>
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
          <Text style={styles.textMain}>No memories !</Text>
        </View>
      );
    }

    return (
      <View style={styles.mainArea}>
        <TextInput
          style={styles.searchfield}
          placeholder="Search..."
          placeholderTextColor="grey"
          onChangeText={(text) => {
            this.handleSearchChange(text);
          }}
        />
        {feedview}
        <View style={styles.cloudarea}>
          {this.state.userClouds.map((cloud, index) => (
            <SubTag
              key={index}
              data={cloud}
              title={cloud.name}
              greyOutOnTagPress={true}
              onTagPress={this.handleCloudChange}
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
