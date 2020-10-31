import {
  REACT_APP_AWS_KEY_ID,
  REACT_APP_AWS_SECRET_ACCESS_KEY,
  REACT_APP_S3_BUCKET,
  REACT_APP_REGION,
} from 'react-native-dotenv';
import {RNS3} from 'react-native-aws3';
import ImageResizer from 'react-native-image-resizer';
import AsyncStorage from '@react-native-community/async-storage';
import {Platform} from 'react-native';
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

export async function heicToJpg(heicPath) {
  console.log('datapass.heicToJpg : heicPath : ' + heicPath);
  const dest = `${RNFS.TemporaryDirectoryPath}${Math.random()
    .toString(36)
    .substring(7)}.jpg`;

  return new Promise((resolve, reject) => {
    RNFS.copyAssetsFileIOS(heicPath, dest, 0, 0)
      .then((absolutePath) => {
        resolve(absolutePath);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

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

export async function activeUser() {
  const logged = await AsyncStorage.getItem('userLoggedin');
  console.log('activeUser is anyone loggedin: ' + logged);

  if (logged) {
    const userid = await AsyncStorage.getItem('userid');
    const firstName = await AsyncStorage.getItem('firstname');
    const lastName = await AsyncStorage.getItem('lastname');
    const email = await AsyncStorage.getItem('email');
    const user = {userid, firstName, lastName, email};
    console.log(
      'activeUser user: ' +
        user.firstName +
        ' ' +
        user.lastName +
        ' id: ' +
        user.userid +
        ' email: ' +
        user.email,
    );
    return user;
  } else {
    return null;
  }
}

// post new memory -----------------------------------------------------

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
  memory.title = title;
  memory.story = story;
  memory.files = files;
  memory.people = people;
  memory.location = location;
  memory.groups = groups;
  memory.userid = userid;
  memory.searchWords = [];
  memory.memid = -1;

  uploadNewMemory(callback);
  cleanupStorage();
}

// create a new memory ID -----------------------------------------------------

const uploadNewMemory = (callBackOnSuccess) => {
  let Promises = [];
  let isHeroFile = false;

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
        if (idx === 0) {
          isHeroFile = true;
        } else {
          isHeroFile = false;
        } // automatically set the first file memory as the hero shot.

        if (isSupportedImageFile(memfile.filepath)) {
          Promises.push(
            uploadImageFile(memfile).then((result) => {
              addFileToMemory(result, isHeroFile);
            }),
          );
        } else if (isSupportedVideoFile(memfile.filepath)) {
          Promises.push(
            uploadVideoFile(memfile).then((result) => {
              addFileToMemory(result, isHeroFile);
            }),
          );
        } else if (isSupportedAudioFile(memfile.filepath)) {
          Promises.push(
            uploadAudioFile(memfile).then((result) => {
              addFileToMemory(result, isHeroFile);
            }),
          );
        }
      });

      Promise.all(Promises).then((values) => {
        console.log(
          'uploadNewMemory() - upload complete for memory id ' + memory.memid,
        );
        callBackOnSuccess(memory.memid);
      });
    }
  });
};

// ---------------------------------------------------------------------------------

const getSearchWords = () => {
  let words = [];
  let titlewords = memory.title.split(' '); // need to replace with a proper extractor
  let storywords = memory.story.split(' '); // need to replace with a proper extractor

  titlewords.map((word) => {
    words.push({keyword: word, strength: 0});
  });
  storywords.map((word) => {
    words.push({keyword: word, strength: 0});
  });

  return words;
};

// ---------------------------------------------------------------------------------

export async function logStorageContent() {
  const filearray = [];
  console.log('AsyncStorage Content');
  console.log('Loggedin : ' + (await AsyncStorage.getItem('userLoggedin')));
  console.log('userid : ' + (await AsyncStorage.getItem('userid')));
  console.log('firstname : ' + (await AsyncStorage.getItem('firstname')));
  console.log('lastname : ' + (await AsyncStorage.getItem('lastname')));
  console.log('email : ' + (await AsyncStorage.getItem('email')));
  console.log();

  const keys = AsyncStorage.getAllKeys().then((keys) => {
    keys.map((key) => {
      if (
        key.includes('image') ||
        key.includes('audio') ||
        key.includes('video')
      ) {
        AsyncStorage.getItem(key).then((value) => {
          console.log('key : ' + key + ' fileName : ' + getFilename(value));
        });
      }
    });
  });
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

// retrieve all memories for user and cloudIDs where user is in that cloud --------------------

export function mapUserClouds(userid, callback) {
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
        console.log('server response : ' + res.success);
        console.log('server data : ' + res.data);
        callback(res.data);
      } else {
        console.log('server response : ' + res.success + ' with ' + res.error);
      }
    });
}

//---------------------------------------------------------------------------------------------

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

export function getMemories_PersonalOnly_All(userid, searchwords) {
  console.log(
    'getMemories_PersonalOnly_All - userid : ' +
      userid +
      ' searchwords : ' +
      searchwords,
  );

  if (searchwords.length > 0) {
    console.log('getMemories_PersonalOnly_All - with searchwords');
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
    console.log('getMemories_PersonalOnly_All - no searchwords');
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
              'getMemories_PersonalOnly_All returns ' + res.data.length,
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

export function getMemoryFiles(memid, callback) {
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

  return new Promise((resolve, reject) => {
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
          resolve(res.data);
        } else {
          console.log(
            'getCloudPeople server response : ' +
              res.success +
              ' with ' +
              res.error,
          );
          reject(null);
        }
      });
  });
}

//---------------------------------------------------------------------------------

export function getMemoryPeople(memid, callback) {
  console.log('getMemoryPeople for memory : ' + memid);
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
        callback(response.data);
      } else {
        callback(null);
      }
    });
}

//---------------------------------------------------------------------------------

export function getMemories(userID, cloudIDs, callback) {
  console.log('getMemories for user : ' + userID + ' in groups ' + cloudIDs);
  fetch('https://memrii-api.herokuapp.com/get_memories_userid_cloudids', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({userid: userID, cloudids: cloudIDs}),
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
                    resolve({originalURL: origS3URL, thumbURL: thumbS3URL});
                  } else {
                    reject(null);
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
              transcodeVideoToHLS(targetFileName, vFolder).then((result) => {
                if (result.success) {
                  console.log('uploadVideo post transcode  : ' + result.data);
                  resolve({originalURL: origS3URL, thumbURL: thumbS3URL});
                } else {
                  reject('failed to transcode video');
                }
              });
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

      // console.log(
      //   'uploadAudio pre transcode : targetFileName : ' + targetFileName,
      // );
      // if (result !== 'failure') {
      //   let thumbTarget = commonfileName + '-thumb' + '.' + thumbExtension;
      //   _uploadFiletoS3(require('./images/audioThumb.png'), thumbTarget).then(
      //     (s3result) => {
      //       if (s3result !== 'failure') {
      //         thumbS3URL = s3result;
      //         resolve({originalURL: origS3URL, thumbURL: thumbS3URL});
      //       } else {
      //         reject(null);
      //       }
      //     },
      //   );
      // } else {
      //   reject(null);
      // }
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

const addFileToMemory = (fileUrlObj, ishero) => {
  console.log('addFileToMemory : +++++++++++++ ');

  const sourceURL = stry(fileUrlObj.originalURL);
  const thumbURL = stry(fileUrlObj.thumbURL);

  const sourceext = getExtension(sourceURL);
  const thumbext = getExtension(thumbURL);

  console.log('addFileToMemory : sourceURL ' + sourceURL);
  console.log('addFileToMemory : thumbURL ' + thumbURL);

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
            'creatememid : ' + memory.memid + 'remoteid ' + result.data,
          );
          resolve('success');
        } else {
          console.log('createMemoryID failed : ' + result.error);
          reject('failed : unable to create memory');
        }
      });
  });
};

export function isSupportedImageFile(filename) {
  let ext = getExtension(filename).toLowerCase();
  let filetypes = ['jpeg', 'jpg', 'png', 'heic'];
  let found = filetypes.indexOf(ext);
  return !(found === -1);
}

//---------------------------

export function isSupportedVideoFile(filename) {
  let ext = getExtension(filename).toLowerCase();
  let filetypes = ['mov', 'mp4', 'mpeg'];
  let found = filetypes.indexOf(ext);
  return !(found === -1);
}
//---------------------------

export function isSupportedAudioFile(filename) {
  let ext = getExtension(filename).toLowerCase();
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

export function getFilename(filepath) {
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
