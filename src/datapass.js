import {
  REACT_APP_AWS_KEY_ID,
  REACT_APP_AWS_SECRET_ACCESS_KEY,
  REACT_APP_S3_BUCKET,
  REACT_APP_REGION,
} from 'react-native-dotenv';
import {RNS3} from 'react-native-aws3';
import ImageResizer from 'react-native-image-resizer';
import AsyncStorage from '@react-native-community/async-storage';
import Platform from 'react-native';
import RNFS from 'react-native-fs';

const memory = {
  title: '', // short title of the memory : string
  story: '', // text desciribing the memory : string
  files: [], // an array of string pairs local filepath, local thumbpath : [ string, String ]
  people: [], // an array of userids : [ int ]
  location: '', // name of the location : string
  groups: [], // array of group IDs : [ int ]
  userid: 0, // id of the current user : int
  memid: 0, // id of the newly created memory : int
};

// -------------------------------------------------------------------------------

// create a new emory cloud  -----------------------------------------------------

export async function createMemoryCloud(cloudName, administratorID) {
  console.log(
    'datapass.createMemoryCloud : ' + cloudName + ' admin : ' + administratorID,
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/createcloud', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: cloudName,
        adminid: administratorID,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.created) {
          console.log(
            'createMemoryCloud: ' +
              data.id +
              'with administrator ' +
              administratorID,
          );
          resolve('success');
        } else {
          console.log('createMemoryCloud: Error creating cloud : ' + cloudName);
          reject('failed : unable to create memory');
        }
      });
  });
}

// get details for the current user -----------------------------------------------------

export async function getActiveUser() {

  return new Promise((resolve,reject) =>{
    
    AsyncStorage.getItem('userLoggedin').then(logged => {
      
      if (logged) {

        AsyncStorage.getItem('userid').then(userid =>{
          userid = parseInt(userid)
          AsyncStorage.getItem('firstname').then(firstName =>{
            AsyncStorage.getItem('lastname').then(lastName =>{
              AsyncStorage.getItem('email').then(email => {
                AsyncStorage.getItem('activeCloudID').then(activeCloudID =>{
                  activeCloudID = parseInt(activeCloudID)
                  let user = {
                    userid, 
                    firstName, 
                    lastName, 
                    email, 
                    activeCloudID 
                  };
                  resolve(user)
                })
              })
            })
          })
        })
      } else {
        reject(null)
      }

    })
  })
  
}

// -----------------------------------------------------------------------

export async function getPointsData( userid,cloudid ){
  
  //console.log(`getPointsData ${userid} ${cloudid}`);
  
  return new Promise((resolve,reject) => {

    fetch(
      'https://memrii-api.herokuapp.com/get_points_data',
      {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          userid: userid,
          cloudid: cloudid
        }),
      },
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          console.log(`getpointsdata error ${res.error}`);
          reject(res.error);
        }
      });

  })
}

// -----------------------------------------------------------------------

export function getUserStatus (userid,cloudid) {
  
  let status = {
    credits : 0,
    level : ''
  }
  
  return new Promise((resolve,reject ) =>{
    
    getPointsData(userid,cloudid)
    .then(pointsData => {
      getStatusLevels(cloudid)
      .then(levels => {
            pointsData.map(record =>{
              status.credits += record.statuscredits
        })  
        
        levels.map(level => {
            if(status.credits >= level.reachvalue){
              status.level = level             
            }
        })
        resolve(status)        
      })
    })
    
  })
  
}

// -----------------------------------------------------------------------

export async function getUserDetails( userid ){
  
  return new Promise((resolve,reject) => {
    fetch(
      'https://memrii-api.herokuapp.com/getUser_userid',
      {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          userid: userid
        }),
      },
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });

  })
}

// -----------------------------------------------------------------------

export async function getStatusLevels( cloudid ){
  return new Promise((resolve,reject) => {
    fetch(
      'https://memrii-api.herokuapp.com/get_statuslevels',
      {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          cloudid: cloudid
        }),
      },
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });

  })
}  

// -----------------------------------------------------------------------

export async function updateUserAvatar( userid , avatarString ){
  return new Promise((resolve,reject) => {
    fetch(
      'https://memrii-api.herokuapp.com/special',
      {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: null
      },
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });

  })
  
}

// -----------------------------------------------------------------------


export async function postNewMemory(
  title,
  story,
  files,
  people,
  location,
  groups,
  userid,
  callback,
) {

  memory.title        = title;
  memory.story        = story;
  memory.files        = files;
  memory.people       = people;
  memory.location     = location;
  memory.groups       = groups;
  memory.userid       = userid;
  memory.searchWords  = [];
  memory.memid        = -1;

  console.log('postNewMemory memory : ',JSON.stringify(memory,null,3));

  uploadNewMemory(callback);

}

// create a new memory ID -----------------------------------------------------

const uploadNewMemory = (callBackOnSuccess) => {
  let Promises = [];
  

  createMemoryID().then((response) => {
    if (response === 'success' && memory.memid !== -1) {
      memory.people.map((person) => {
        Promises.push(addPersontoMemory(person));
      });
      memory.groups.map((cloud) => {
        Promises.push(addCloudtoMemory(cloud));
      });
      Promises.push(setMemorySearchWords(getSearchWords()));

      memory.files.map((memfile, idx) => {
        
        if (isSupportedImageFile(memfile.filepath)) {
          Promises.push(
            uploadImageFile(memfile).then((result) => {
              associateFileToMemory(result, (idx === 0 )); // set the first file memory as the hero shot.
            }),
          );
        } else if (isSupportedVideoFile(memfile.filepath)) {
          Promises.push(
            uploadVideoFile(memfile).then((result) => {
              associateFileToMemory(result, (idx === 0 ));
            }),
          );
        } else if (isSupportedAudioFile(memfile.filepath)) {
          Promises.push(
            uploadAudioFile(memfile).then((result) => {
              associateFileToMemory(result, (idx === 0 ));
            }),
          );
        }
      });

      Promise.all(Promises).then((values) => {
        console.log(
          'uploadNewMemory() - UPLOAD COMPLETE for memory id ' + memory.memid,
        );
        callBackOnSuccess(memory.memid);
      });
    }
  });
};

// ---------------------------------------------------------------------------------



export function addFileToMemory ( memid , userid, file ){

  console.log(
    'addFileToMemory : ' + memid + ' new file :' + JSON.stringify(file,null,3)
  );
  
  memory.memid = memid
  memory.userid = userid
  file.filepath = file.fileurl
  file.thumbnail = file.thumburl

  
  return new Promise ((resolve,reject) => {

    if (isSupportedImageFile(file.fileurl)) {
   
      uploadImageFile(file).then((result) => {        
        associateFileToMemory(result, file.ishero).then(result => {
          if(result === 'success'){
            resolve({success:true})
          }else{
            reject('upload or associate file failed')
          }
        })
      })
      
    } else if (isSupportedVideoFile(file.fileurl)) {
     
      uploadVideoFile(file).then((result) => {
        associateFileToMemory(result, file.ishero).then(result => {
          if(result === 'success'){
            resolve({success:true})
          }else{
            reject('upload or associate file failed')
          }
        })
      })
     
    } else if (isSupportedAudioFile(file.fileurl)) {
      
      Promises.push(
        uploadAudioFile(file).then((result) => {
          associateFileToMemory(result, file.ishero).then(result => {
            if(result === 'success'){
              resolve({success:true})
            }else{
              reject('upload or associate file failed')
            }
          })
        })
      )
    } 
  })
}

// ---------------------------------------------------------------------------------

export function updateMemoryHero (  memid,  memfile ){

  console.log('updateMemoryHero : ' + memid + 'to memfile :' + JSON.stringify(memfile,null,3));

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/set_memory_herofile', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        memid: memid,
        fileurl: memfile.fileurl,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });

}

// ---------------------------------------------------------------------------------

export function updateMemoryTitle (  memid,  title ){

  console.log(
    'updateMemoryTitle : ' + memid + ' words :' + title,
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/set_memory_title', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        memoryid: memid,
        newTitle: title,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });

}

// ---------------------------------------------------------------------------------

export function updateMemoryDescription	( memid,  description 	){

  console.log(
    'updateMemoryDescription : ' + memid + ' words :' + description,
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/set_memory_description', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        memoryid: memid,
        newDescription: description,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });

}

// ---------------------------------------------------------------------------------
export function updateMemoryStory (  memid,  story 		){ // string
  
  console.log(
    'updateMemoryStory : ' + memid + ' words :' + story,
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/set_memory_story', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        memoryid: memid,
        newStory: story,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });

}

// ---------------------------------------------------------------------------------
export function updateMemoryLocation ( memid, location ){ // string
  
  console.log(
    'updateMemoryLocation : ' + memid + ' words :' + location,
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/set_memory_location', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        memoryid: memid,
        newLocation: location,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });

}

// ---------------------------------------------------------------------------------
export function updateMemoryPeople (  memid, people ){ // [ person ] with person.userid

  console.log(
    'updateMemoryPeople : memid ' + memid + ' people :' + JSON.stringify(people,null,2)
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/set_memory_tagged_people', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        memoryid: memid,
        taggedPeople: people,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });
}

// ---------------------------------------------------------------------------------
export function updateMemoryClouds ( memid,clouds ){ // [ clouds ] with cloud.id

  // console.log(
  //   'updateMemoryClouds : ' + memid + ' clouds :' + JSON.stringify(clouds,null,3)
  // );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/set_memory_clouds', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        memoryid: memid,
        clouds: clouds,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });
}

// ---------------------------------------------------------------------------------
export function updateMemoryAuthor ( memid,  userid ){

  console.log(
    'updateMemoryAuthor : ' + memid + ' words :' + userid,
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/set_memory_author', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        memoryid: memid,
        newAuthor: userid,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });
}

// ---------------------------------------------------------------------------------
export function removeFileFromMemory	(  memid,  file 	){ 
  
 console.log(
  'removeFileFromMemory : ' + memid + ' file :' + JSON.stringify(file,null,3)
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/removeFileFromMemory_fileurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        memid: memid,
        fileurl: file.fileurl,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });

}

// ---------------------------------------------------------------------------------


const getSearchWords = () => {
  let words        = [];
  let titlewords  = memory.title.split(' '); // need to replace with a proper extractor
  let descwords   = memory.story.split(' '); // need to replace with a proper extractor

  titlewords.map((word) => {
    words.push({keyword: word, strength: 0});
  });
  descwords.map((word) => {
    words.push({keyword: word, strength: 0});
  });

  return words;
};

// ---------------------------------------------------------------------------------

export async function getItems(options = {}) {
  console.log('function : getItems ', options);
  const keys = await AsyncStorage.getAllKeys();
  let fileExist = false;
  keys.forEach((key) => {
    if (key.includes('image-file') || key.includes('video-file')) {
      console.log('Removing storage item : ' + key);
      AsyncStorage.removeItem(key);
      fileExist = true;
    }
  });
  return fileExist;
}

// ---------------------------------------------------------------------------------

export async function logStorageContent() {
  

  console.log('AsyncStorage Content');
 
  AsyncStorage.getAllKeys()
  .then((keys) => {
      keys.map((key) => {
        AsyncStorage.getItem(key)
        .then((value) => {
          console.log(`${key} : ${value}`);
        })
      })
  })
  
}

// ---------------------------------------------------------------------------------

export async function findAsyncStorageKeyFor(keyValue) {
  
  
  let index = 0
  AsyncStorage.getAllKeys().then((keys) => {
    while (index < keys.length) {
      console.log(index,keys.length,(index<keys.length),keys[index]);
      AsyncStorage.getItem(keys[index]).then((value) => {
        if(value === keyValue){
          console.log(keys[index]);
          return keys[index]
        }
      })
      index++
    }
  })
  return ''
}

// ---------------------------------------------------------------------------------
// Removes all content captured for the current post
// pre :
// post :  any key value pair where key contains 'image-','video-', 'audio-' will
//         be removed from Storage

export async function cleanupStorage(options = {}) {
  console.log('function : cleanupStorage ', options);
  const keys = await AsyncStorage.getAllKeys();
  if (options && options.key) {
    keys.map((key) => {
      if (key.includes(options.key)) {
        console.log('Removing storage item : ' + key);
        AsyncStorage.removeItem(key);
      }
    });
    // Remove only selected key and return
    return true;
  }
  keys.map((key) => {
    if (
      key.includes('image-') ||
      key.includes('video-') ||
      key.includes('audio-')
    ) {
      console.log('Removing storage item : ' + key);
      AsyncStorage.removeItem(key);
    }
  });
}

//---------------------------------------------------------

export async function getSelectedCloudsAsArray(){

  const keys = await AsyncStorage.getAllKeys();
  return new Promise((resolve,reject)=>{
  let Promises = []  
  let cids = []
  
  keys.map((key) => {
    if (key.includes('activeCloudID')) {
      Promises.push(AsyncStorage.getItem(key).then(value =>{ cids.push(parseInt(value)) }))
    }})
      
  Promise.all(Promises).then((values) => {
      
      resolve(cids)
  });
  })
  
    
}

// rretrieve all clouds that user id if a member of ------------------------

export function getUserClouds(userid, callback) {

  console.log('getUserClouds : ', userid );
  fetch('https://memrii-api.herokuapp.com/get_clouds_userid', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({userID: userid}),
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.success) {
        console.log('getUserClouds success ? : ' + res.success);
        
        callback(res.data);
      } else {
        console.log('server response : ' + res.success + ' with ' + res.error);
      }
    });
}

//---------------------------------------------------------------------------------------------

export function getMaxMemoryID(cloudid) {

  //console.log('getMaxMemoryID : ', cloudid );
  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/get_latest_memid', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        cloudid: cloudid,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });
}

//---------------------------------------------------------------------------------------------

export function getMemoriesAbove ( cloudid, aboveIndex ) {

  //console.log(`getMemoriesAbove for cloud ${cloudid} and above index ${aboveIndex}`);

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/get_memories_above_index', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        memid   : aboveIndex,
        cloudid : cloudid
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });

}

//---------------------------------------------------------------------------------------------

export function getMemoryLikes ( memid, cloudid ) {
  //console.log(`getMemoryLikes for memid ${memid} and cloud ${cloudid}`);
  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/get_memory_likes', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        memid   : memid,
        cloudid : cloudid
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        
        if (res.success) {

          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });

}

// ---------------------------------------------------------------------------------

export function searchMemories(userid, cloudids, searchwords, callback) {
  fetch(
    'https://memrii-api.herokuapp.com/get_memories_userid_keywords_cloudids',
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userid: userid,
        cloudids: cloudids,
        words: searchwords,
      }),
    },
  )
    .then((response) => response.json())
    .then((response) => {
      if (response.status !== 400) {
        callback(response.data);
      } else {
      }
    });
}

//---------------------------------------------------------------------------------

export function getMemories_PersonalOnly_Unshared(userid, searchwords) {
  if (searchwords) {
    return new Promise((resolve, reject) => {
      fetch(
        'https://memrii-api.herokuapp.com/get_memories_userid_keywords_noclouds_unshared',
        {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            userid: userid,
            words: searchwords,
          }),
        },
      ).then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      fetch(
        'https://memrii-api.herokuapp.com/get_memories_userid_noclouds_unshared',
        {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            userid: userid,
          }),
        },
      )
        .then((response) => response.json())
        .then((res) => {
          if (res.success) {
            resolve(res.data);
          } else {
            reject(res.error);
          }
        });
    });
  }
}

//-------------------------------------------------------------------------------

export function searchMemories_User(userid, searchwords) {
  console.log(
    'searchMemories_User - userid : ' +
      userid +
      ' searchwords : ' +
      searchwords,
  );

  if (searchwords.length > 0) {
    console.log('searchMemories_User - with searchwords');
    return new Promise((resolve, reject) => {
      fetch(
        'https://memrii-api.herokuapp.com/get_memories_keywords_user_noclouds',
        {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            userid: userid,
            words: searchwords,
          }),
        },
      )
        .then((response) => response.json())
        .then((res) => {
          if (res.success) {
            resolve(res.data);
          } else {
            reject(res.error);
          }
        });
    });
  } else {
    console.log('searchMemories_User - no searchwords');
    return new Promise((resolve, reject) => {
      fetch('https://memrii-api.herokuapp.com/get_memories_userid_noclouds', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          userid: userid,
        }),
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.success) {
            console.log(
              'searchMemories_User returns ' + res.data.length,
            );
            resolve(res.data);
          } else {
            reject(res.error);
          }
        });
    });
  }
}

//-------------------------------------------------------------------------------

export function getMemories_User_Words_Clouds(userid, words, cloudids) {
  return new Promise((resolve, reject) => {
    fetch(
      'https://memrii-api.herokuapp.com/get_memories_userid_keywords_cloudids',
      {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          words: words,
          userid: userid,
          cloudids: cloudids,
        }),
      },
    )
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });
}

//-------------------------------------------------------------------------------

export function getMemories_User_Clouds(userid, cloudids) {
  console.log(
    'getMemories_User_Clouds - userid : ' + userid + ' cloudids : ' + cloudids,
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/get_memories_userid_cloudids', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userid: userid,
        cloudids: cloudids,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });
}

//-------------------------------------------------------------------------------

export function getMemories_Words_Clouds(cloudids, words) {
  console.log(
    'getMemories_Words_Clouds - cloudids : ' + cloudids + ' words :' + words,
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/get_memories_keywords_clouds', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        cloudids: cloudids,
        words: words,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });
}

//-------------------------------------------------------------------------------

export function getMemories_Clouds(cloudids) {
  console.log('getMemories_Clouds - cloudids : ' + cloudids);

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/get_memories_cloudids', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        cloudids: cloudids,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });
}

//-------------------------------------------------------------------------------

export function getMemories_User(userid) {
  console.log('getMemories_Clouds - cloudids : ' + cloudids);

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/get_memories_cloudids', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        cloudids: cloudids,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res.data);
        } else {
          reject(res.error);
        }
      });
  });
}


//-------------------------------------------------------------------------------

export function getMemoryClouds(memid) {

  //console.log('getMemoryClouds memid : ',memid);

  return new Promise((resolve,reject) =>{
    fetch('https://memrii-api.herokuapp.com/get_associatedclouds_memoryid', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({memoryid: memid}),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.success) {
        resolve(response.data);
      } else {
        reject(response);
      }
    });

  })
  
}
//-------------------------------------------------------------------------------

export function getMemoryFiles(memid, callback) {
  //console.log((`getMemoryFiles ${memid}`));
  fetch('https://memrii-api.herokuapp.com/get_memfiles_memoryid', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({memoryid: memid}),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.success) {
        callback(response.data);
      } else {
        callback(null);
      }
    });
}

//--Returns and array of {userid,firstname,lastname} objects from the server-----------------------------------------------

export function getCloudPeople(clouds, callback) {
  console.log(
    'getCloudPeople : clouds ' +
      JSON.stringify(clouds.map((cloud) => parseInt(cloud.id))),
  );

 
    fetch('https://memrii-api.herokuapp.com/get_cloud_people_clouds', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({clouds: clouds}),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          console.log(
            'getCloudPeople response data : ' +
              res.data.length +
              ' poeple records retuirned',
          );
          if (callback) {
            callback(res.data);
          }
 
        } else {
          console.log(
            'getCloudPeople server response : ' +
              res.success +
              ' with ' +
              res.error,
          );
        
        }
      });
 
}

//---------------------------------------------------------------------------------

export function getMemoryPeople(memid, callback) {
  
  //console.log('getMemoryPeople for memory : ' + memid);
  
    fetch('https://memrii-api.herokuapp.com/get_associatedpeople_memoryid', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({memoryid: memid}),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          callback ( response.data )
        } else {
          callback ( null );
        }
      });
  
}

//---------------------------------------------------------------------------------

export function getMemories(cloudIDs, callback) {
  console.log('getMemories for in clouds [' + cloudIDs + ']');
  fetch('https://memrii-api.herokuapp.com/get_memories_cloudids', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({cloudids: cloudIDs}),
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.status !== 400) {
        callback(response.data);
      } else {
      }
    });
}

// ------------------------------------------------------------------------------

const getFileMime = (extension) => {
  let mime = '';
  switch (extension) {
    case 'mov':
      mime = 'video/quicktime';
      break;
    case 'jpg':
      mime = 'image/jpeg';
      break;
    case 'jpeg':
      mime = 'image/jpeg';
      break;
    case 'png':
      mime = 'image/png';
      break;
    case 'mp4':
      mime = 'video/mp4';
      break;
    case 'aac':
      mime = 'audio/aac';
      break;
  }
  return mime;
};

// ------------------------------------------------------------------------------

const stry = (str) => {
  str = JSON.stringify(str);
  if (str.charAt(0) === '"') {
    str = str.substr(1, str.length - 1);
  }
  if (str.charAt(str.length - 1) === '"') {
    str = str.substr(0, str.length - 1);
  }
  return str;
};

// ------------------------------------------------------------------------------

const uploadImageFile = (fileObj) => {
  let thumbS3URL = '';
  let filepath = stry(fileObj.filepath);
  let thumbnail = stry(fileObj.thumbnail);
  let origFileParts = filepath.split('.');
  let origExtension = origFileParts[origFileParts.length - 1];
  let thumbFileParts = thumbnail.split('.');
  let thumbExtension = thumbFileParts[thumbFileParts.length - 1];
  let commonfileName = memory.userid + '-' + memory.memid + '-' + Date.now();
  let origS3URL = thumbS3URL;
  let targetFileName = commonfileName + '-original' + '.' + origExtension;

  return new Promise((resolve, reject) => {
    processMediumResImage(filepath, origExtension).then((response) => {
      if (response != 'failure') {
        _uploadFiletoS3(response, targetFileName).then((result) => {
          if (result != 'failure') {
            origS3URL = result;
            processLowResImage(thumbnail, thumbExtension).then((response) => {
              if (response != 'failure') {
                targetFileName =
                  commonfileName + '-thumb' + '.' + thumbExtension;
                _uploadFiletoS3(response, targetFileName).then((s3result) => {
                  if (s3result != 'failure') {
                    thumbS3URL = s3result;
                    resolve({success:true, originalURL: origS3URL, thumbURL: thumbS3URL});
                  } else {
                    reject({success:false});
                  }
                });
              }
            });
          }
        });
      }
    });
  });
};

//-------------------------------------------------------------------------------

export async function cameraRollPathToAbsolutePath(camRolluri,type=null) {
  // console.log(
  //   'datapass.cameraRollPathToAbsolutePath : camRolluri : ' + camRolluri,
  // );

  let ext = camRolluri.split('&ext=')[1]


  const dest = `${RNFS.TemporaryDirectoryPath}${Math.random()
    .toString(36)
    .substring(7)}.${ext}`;

  return new Promise((resolve, reject) => {

    if(!type) {
      RNFS.copyAssetsFileIOS(camRolluri, dest, 0, 0)
        .then((absolutePath) => {
          resolve(absolutePath);
        })
        .catch((err) => {
          reject(err);
        });
    }
    
    if(type === 'video') {
        RNFS.copyAssetsVideoIOS(camRolluri, dest, 0, 0)
        .then((absolutePath) => {
          resolve(absolutePath);
        })
        .catch((err) => {
          reject(err);
        });
      }
      else if(type === 'image') {
        RNFS.copyAssetsFileIOS(camRolluri, dest, 0, 0)
        .then((absolutePath) => {
          resolve(absolutePath);
        })
        .catch((err) => {
          reject(err);
        });
      }
    
  });
}



// -------------------------------------------------------------------------------

const uploadVideoFile = (fileObj) => {
  console.log('uploadVideoFile ---------------------------------- ');
  console.log('original: ' + getFilename(fileObj.filepath));
  console.log('thumb: ' + getFilename(fileObj.thumbnail));
  let thumbS3URL = '';

  let filepath = stry(fileObj.filepath);
  let thumbnail = stry(fileObj.thumbnail);
  let origFileParts = filepath.split('.');
  let origExtension = origFileParts[origFileParts.length - 1];
  let thumbFileParts = thumbnail.split('.');
  let thumbExtension = thumbFileParts[thumbFileParts.length - 1];
  let commonfileName = memory.userid + '-' + memory.memid + '-' + Date.now();
  let origS3URL = thumbS3URL;
  let vFolder = commonfileName + '-' + 0;

  return new Promise((resolve, reject) => {
    let targetFileName = commonfileName + '-0-stream' + '.' + origExtension;
    _uploadFiletoS3(filepath, targetFileName).then((result) => {
      origS3URL = result;

      console.log(
        'uploadVideo pre transcode : targetFileName : ' + targetFileName,
      );
      // resolve({originalURL: origS3URL, thumbURL: thumbS3URL});
      processLowResImage(thumbnail, thumbExtension).then((response) => {
        if (response != 'failure') {
          let thumbTarget = commonfileName + '-thumb' + '.' + thumbExtension;
          _uploadFiletoS3(response, thumbTarget).then((s3result) => {
            if (s3result != 'failure') {
              thumbS3URL = s3result;
              transcodeVideoToHLS(targetFileName, vFolder).then(
                (videoTranscode) => {
                  if (videoTranscode.success) {
                    console.log(
                      'uploadVideo post transcode  : ' + videoTranscode.data,
                    );
                    // resolve({originalURL: origS3URL, thumbURL: thumbS3URL});
                    resolve({
                      originalURL: origS3URL,
                      thumbURL: {
                        thumburl: thumbS3URL,
                        displayurl: videoTranscode.data,
                      },
                    });
                  } else {
                    reject('failed to transcode video');
                  }
                },
              );
            } else {
              reject(null);
            }
          });
        }
      });
    });
  });
};

//-------------------------------------------------------------------------------

const uploadAudioFile = (fileObj) => {
  console.log('uploadAudioFile ---------------------------------- ');
  console.log('original: ' + getFilename(fileObj.filepath));
  console.log('thumb: ' + getFilename(fileObj.thumbnail), fileObj.thumbnail);
  let thumbS3URL = '';

  let filepath = stry(fileObj.filepath);
  let thumbnail = stry(fileObj.thumbnail);
  let origFileParts = filepath.split('.');
  let origExtension = origFileParts[origFileParts.length - 1];
  let thumbFileParts = thumbnail.split('.');
  let thumbExtension = thumbFileParts[thumbFileParts.length - 1];
  let commonfileName = memory.userid + '-' + memory.memid + '-' + Date.now();
  let origS3URL = thumbS3URL;

  return new Promise((resolve, reject) => {
    let targetFileName = commonfileName + '-0-audio' + '.' + origExtension;
    _uploadFiletoS3(filepath, targetFileName).then((result) => {
      origS3URL = result;
      resolve({originalURL: origS3URL, thumbURL: 'thumbS3URL'});      
    });
  });
};

//-------------------------------------------------------------------------------

const _uploadFiletoS3 = (sourceFile, targetFile) => {
  console.log('source file:', sourceFile);
  console.log('_uploadFileToS3 : ' + getFilename(sourceFile));
  let fileParts = sourceFile.toLowerCase().split('.');
  console.log('fileParts : ', fileParts);

  let extension = fileParts[fileParts.length - 1];
  console.log('extension : ', extension);

  let MIME = getFileMime(extension);

  const file = {
    uri:
      Platform.OS === 'android' &&
      !sourceFile.includes('file://') &&
      !sourceFile.startsWith('.')
        ? `file://${sourceFile}`
        : sourceFile,
    name: targetFile,
    type: MIME,
  };
  console.log('file to upload:', file);

  const options = {
    keyPrefix: '',
    bucket: REACT_APP_S3_BUCKET,
    region: REACT_APP_REGION,
    accessKey: REACT_APP_AWS_KEY_ID,
    secretKey: REACT_APP_AWS_SECRET_ACCESS_KEY,
    successActionStatus: 201,
  };

  return new Promise((resolve, reject) => {
    console.log('Attempt RNS3.put');
    console.log('sourcefile ' + file.uri);
    console.log('targetfile ' + file.name + ' type ' + file.type);

    RNS3.put(file, options).then((response) => {
      if (response.status == 201) {
        resolve(response.body.postResponse.location);
      } else {
        console.log('RNS3 upload failed : ' + JSON.stringify(response));
        reject(null);
      }
    });
  });
};

// ------------------------------------------------------------------------------
const transcodeVideoToHLS = (awsMP4Filekey, awsFilePrefix) => {
  console.log(
    'transcode : aws file key ' + awsMP4Filekey + ' prefix : ' + awsFilePrefix,
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/transcode_mp4_HLS_Playlist', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mp4filekey: awsMP4Filekey,
        outputPrefix: awsFilePrefix,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          console.log(
            'transcodeVideoToHLS : response ' + JSON.stringify(response),
          );
          resolve({
            success: true,
            data: response.data,
          });
        } else {
          reject({
            success: false,
            data: null,
            err: response.err,
          });
        }
      });
  });
};
// ------------------------------------------------------------------------------

const processLowResImage = async (filepath, filetype) => {
  let ft = filetype.toLowerCase();

  try {
    return new Promise((resolve, reject) => {
      if (ft == 'mov' || ft == 'mp4') {
        console.log('processImage : filetype is ' + ft);
        resolve(filepath);
      } else {
        ImageResizer.createResizedImage(filepath, 1500, 540, 'JPEG', 80, 0)
          .then((response) => {
            console.log(
              'Resized Image : ' +
                response.name +
                ' : Resized to : ' +
                response.size,
            );
            resolve(response.path);
          })
          .catch((err) => {
            console.log(err);
            reject('processImage : Error A ' + err);
          });
      }
    });
  } catch (err_1) {
    console.log('processImage : Error B ' + err_1);
  }
};

// ------------------------------------------------------------------------------

const processMediumResImage = async (filepath, filetype) => {
  let ft = filetype.toLowerCase();

  try {
    return new Promise((resolve, reject) => {
      if (ft == 'mov' || ft == 'mp4') {
        console.log('processImage : filetype is ' + ft);
        resolve(filepath);
      } else {
        ImageResizer.createResizedImage(filepath, 4000, 4000, 'JPEG', 80, 0)
          .then((response) => {
            console.log(
              'Resized Image : ' +
                response.name +
                ' : Resized to : ' +
                response.size,
            );
            resolve(response.path);
          })
          .catch((err) => {
            console.log(err);
            reject('processImage : Error A ' + err);
          });
      }
    });
  } catch (err_1) {
    console.log('processImage : Error B ' + err_1);
  }
};

//--------------------------------------------------------------------------

const associateFileToMemory = (fileUrlObj, ishero) => {
  console.log(`associateFileToMemory filename = ${getFilename(fileUrlObj.originalURL)} : ishero = ${ishero}`);


  let {displayurl = ''} = fileUrlObj.thumbURL;

  const sourceURL = stry(fileUrlObj.originalURL);
  const thumbURL = stry(
    fileUrlObj.thumbURL.thumburl
      ? fileUrlObj.thumbURL.thumburl
      : fileUrlObj.thumbURL,
  );
  displayurl = stry(displayurl);

  const sourceext = getExtension(sourceURL);
  const thumbext = getExtension(thumbURL);

  console.log('associateFileToMemory : sourceURL ',getFilename(sourceURL),ishero);
  console.log('associateFileToMemory : thumbURL ' ,getFilename(thumbURL),ishero);

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/associateFile', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memid: memory.memid,
        fileurl: sourceURL,
        fileext: sourceext,
        thumburl: thumbURL,
        thumbext: thumbext,
        ishero: ishero,
        displayurl,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          console.log(
            'associate file : memid :' +
              response.data.memid +
              ' file : ' +
              sourceURL +
              ' hero shot = ' +
              ishero,
          );
          resolve('success');
          //   this.props.navigation.navigate('Feed');
        } else {
          reject('failed to associate file : ' + response);
          //   this.props.navigation.navigate('Feed');
          //
        }
      });
  });
};

//-------------------------------------------------------------------------------

export async function getObjectSignedurl(fileName) {
  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/getObject_signedurl', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({fileName: fileName}),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.success) {
          resolve(response.signedURL);
        } else {
          reject(response.error);
        }
      });
  });
}

// add a person to a memory -----------------------------------------------------

const addPersontoMemory = (personID) => {
  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/associatePerson', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memid: memory.memid,
        userid: personID,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.status !== 400) {
          console.log('associate person : ' + personID + '  ' + response);
          resolve('success');
        } else {
          console.log('associate person : ' + personID + '  ' + response);
          reject('failed to associate person : ' + response);
        }
      });
  });
};

// add a person to a memory -----------------------------------------------------

const addCloudtoMemory = (groupID) => {
  console.log('addCloudToMemory : ' + groupID);
  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/associateGroup', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memid: memory.memid,
        groupid: groupID,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.status !== 400) {
          console.log('associate group : ' + groupID + '  ' + response);
          resolve('success');
        } else {
          console.log('associate group : ' + groupID + '  ' + response);
          reject('failed to associate group : ' + response);
        }
      });
  });
};

// -------------------------------------------------------------------------------

export function addLikeToMemory ( memid,userid ) {
  console.log(`addLikeToMemory memid : ${memid} userid : ${userid}`)

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/add_memory_like', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({memid: memid, userid: userid}),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res);
        } else {
          reject(res.error);
        }
      });
  });
}

// add a keyword to a memory -----------------------------------------------------

export function setMemorySearchWords(searchwords) {
  console.log(
    'setMemorySearchWords : memoryid ' +
      memory.memid +
      ' searchwords count = ' +
      searchwords.length,
  );

  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/set_searchwords_memid', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({memid: memory.memid, searchwords: searchwords}),
    })
      .then((response) => response.json())
      .then((res) => {
        if (res.success) {
          resolve(res);
        } else {
          reject(res.error);
        }
      });
  });
}

//------------------------------------------------------------

export function postStatusEvent (userid,creditsToAdd,memid, message,cloudid ){

  console.log('postStatusEvent : userid ' + userid 
      + ' credits : ' + creditsToAdd 
      + ' memory : ' + memid 
      + ' message : ' + message
      + ' cloudid : ' + cloudid )

  fetch('https://memrii-api.herokuapp.com/register_status_credits', {
      method: 'post',headers: {
          'Content-Type':'application/json'},
              body:JSON.stringify({userid:userid,statuscredits:creditsToAdd,memid:memid,description:message,cloudid:cloudid})})
              .then(response => response.json())
              .then(res => {
                  if ( res.success ){
                    console.log('postStatusEvent :server response : ' + res.success)
                      return true
                  }else{
                    console.log('postStatusEvent :server response : ' + res.success + ' with ' + res.error)
                      return false
                  }
              })
}

//------------------------------------------------------------

export function postPointsEvent (userid,pointsToAdd,memid, message, cloudid ){

  console.log('postPointsEvent : userid ' + userid 
      + ' points : ' + pointsToAdd 
      + ' memory : ' + memid 
      + ' message : ' + message
      + ' cloudid : ' + cloudid )

  fetch('https://memrii-api.herokuapp.com/register_points', {
      method: 'post',headers: {
          'Content-Type':'application/json'},
              body:JSON.stringify({ userid:userid , points:pointsToAdd , memid:memid , description:message , cloudid:cloudid })})
              .then(response => response.json())
              .then(res => {
                  if ( res.success ){
                      console.log('postPointsEvent :server response : ' + res.success)
                      return true
                  }else{
                      console.log('postPointsEvent :server response : ' + res.success + ' with ' + res.error)
                      return false
                  }
              })
}

//-------------------------------------------------------------------------------------------------------------------------

const addKeywordtoMemory = (word) => {
  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/associateKeyword', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        memid: memory.memid,
        keyword: word,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.status !== 400) {
          console.log('associate key word : ' + word + '  ' + response);
          resolve('success');
        } else {
          console.log('associate key word : ' + word + '  ' + response);
          reject('failed to associate keyword : ' + response);
        }
      });
  });
};

// create memory log -----------------------------------------------------

const createMemoryID = () => {
  return new Promise((resolve, reject) => {
    fetch('https://memrii-api.herokuapp.com/creatememory', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        userid: memory.userid,
        title: memory.title,
        story: memory.story,
        location: memory.location,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          memory.memid = parseInt(result.data);
          console.log(
            'creatememid : ' + memory.memid 
          );
          resolve('success');
        } else {
          console.log('createMemoryID failed : ' + result.error);
          reject('failed : unable to create memory');
        }
      });
  });
};

//---------------------------

export function getLocalCacheFolder(){
  
  let prefix        = (Platform.OS === 'android') ? 'file://' : '' 
  let folder        = `${prefix}${RNFS.CachesDirectoryPath}/MemoryFiles`
  let MkdirOptions  = (Platform.OS === 'android') ? { NSURLIsExcludedFromBackupKey: true }:null
  
  return new Promise((resolve, reject) => {
    RNFS.exists(`${folder}`).then(exists => {
      if(exists){
        resolve(folder)
      }else{
        RNFS.mkdir( folder ,MkdirOptions)
          .then(result => {   
            console.log(result);
            resolve(folder)
          })
          .catch((err) => {
            console.warn('err', err)
            reject(err)
          })
      }
    })
  })
}

//---------------------------

export async function downloadRemoteFileToCache ( remoteUri ) {

  let filename = getFilename(remoteUri)   
  //console.log(`downloadRemteFileToCache ${filename}`)
  
  return new Promise((resolve, reject) => {    
    
    getLocalCacheFolder()
    .then(cacheFolder=>{
      let localpath   = `${cacheFolder}/${filename}.png`;

      RNFS.downloadFile( { fromUrl:remoteUri , toFile:localpath }).promise
      .then( (res ) =>{
       
        resolve(localpath)
      })
      .catch(err => {
        console.log(err);
        reject(err)
      })
    })
  })
}

//---------------------------

export async function findArrayIndex (array,test ){
  return new Promise((resolve,reject)=>{
    for (let index = 0; index < array.length; index++) {
      if( test(array[index]) ){
        resolve (index)
        break
      }
    }
    resolve( -1 )
  }) 
}

//---------------------------

export function isSupportedImageFile(filename) {
  
  let ext = getExtension(filename).toLowerCase();
  let filetypes = ['jpeg', 'jpg', 'png', 'heic'];
  let found = filetypes.indexOf(ext);
  return !(found === -1);
}

//---------------------------

export function isSupportedVideoFile(filename) {
  let ext = getExtension(filename.toLowerCase());
  let filetypes = ['mov', 'mp4', 'mpeg'];
  let found = filetypes.indexOf(ext);
  return !(found === -1);
}
//---------------------------

export function isSupportedAudioFile(filename) {
  let ext = getExtension(filename.toLowerCase());
  let filetypes = ['aac'];
  let found = filetypes.indexOf(ext);
  return found !== -1;
}

//---------------------------

export function getExtension(filepath) {
  let fileParts = filepath.toLowerCase().split('.');
  let filetype = fileParts[fileParts.length - 1];
  return filetype;
}

//---------------------------

export  function getFilename(filepath) {
  let parts = filepath.split('/');
  let fname = parts[parts.length - 1];
  return fname;
}

//---------------------------

export function millisecsToHMSM(milliseconds) {
  var msecs = ((milliseconds % 1000) / 10).toFixed(0);
  var minutes = Math.floor(milliseconds / 60000);
  var seconds = ((milliseconds % 60000) / 1000).toFixed(0);
  return (
    (minutes < 10 ? '0' : '') +
    minutes +
    ':' +
    (seconds < 10 ? '0' : '') +
    seconds +
    ':' +
    (msecs < 10 ? '0' : '') +
    msecs
  );
}

//---------------------------

export function log(obj,message)
{
  console.log(message,JSON.stringify(obj,null,3));
}
