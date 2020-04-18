import React from 'react';
import{ REACT_APP_AWS_KEY_ID,
        REACT_APP_AWS_SECRET_ACCESS_KEY,
        REACT_APP_S3_BUCKET,
        REACT_APP_REGION } from 'react-native-dotenv'
import { RNS3 } from 'react-native-aws3'
import ImageResizer from 'react-native-image-resizer';



const memory = {
    title:'',       // short title of the memory : string
    story:'',       // text desciribing the memory : string
    files:[],       // an array of local file paths : [ string ]
    people:[],      // an array of userids : [ int ]
    location:'',    // name of the location : string
    groups:[],      // array of group IDs : [ int ]
    remoteURLS:[],  // array of remote url S3 paths : [ string ]
    userid:0,       // id of the current user : int
    MemoryID:0,     // id of the newly created memory : int
    errorLog:[],    // array or error messages : [ string ]
   
}

// post new memory -----------------------------------------------------

export function postNewMemory  (
                title,
                story,
                files,
                people,
                location,
                groups,
                userid
                )  
                
{
    memory.title = title 
    memory.story = story
    memory.files = files
    memory.people = people
    memory.location = location
    memory.groups = groups
    memory.userid = userid

    
    return uploadNewMemory()
    
}

// post new memory -----------------------------------------------------

export function getMemories (userID,groupIDs,callback)  
{
    
    console.log('getMemories for user : ' + userID + ' in groups ' + groupIDs )
    fetch('https://memriio-api-0.herokuapp.com/get_memories_userid', {
        method: 'post',headers: {
            'Content-Type':'application/json'},
                body:JSON.stringify({userid: userID,})})
                .then(response => response.json())
                .then(response => {
                    if ( response.status !== 400){
                        callback(response)
                    }else{
                        
                    }
                })

}

// create a new memory ID -----------------------------------------------------

uploadNewMemory = async () => {
    
    console.log('1 upload new memory');
    
    uploadFiletoS3(memory.files[0])
        .then(response => {
            if(response == 'success'){
                
                console.log('2 upload new memory - first file uploaded to s3 : ' + response);
                
                createMemoryID()
                .then(response => {
                    if(response == 'success'){
                        console.log('');
                        console.log('3 upload new memory - memory id created : ' + response);
                        
                        addFileToMemory(memory.remoteURLS[0],true).then(response => console.log('file associated : ' + response));
                        
                        addRemaingFilestoMemory()
                        addPeopletoMemory()     
                        addGroupstoMemory()     
                        
                        return true           
                    }else{
                        return false
                    }
                })
                    
            }else{
                console.log('failed to upload first file : ' + memory.files[0]);
                return false
                
            }
        })
}


// add remaining files to memory ------------------------------------------------

addRemaingFilestoMemory = () => {

    memory.files.map((file,index) => {
        if(index != 0)
        {
            uploadFiletoS3(file)
                .then(response => {
                    if(response == 'success'){
                        addFileToMemory(memory.remoteURLS[index],false)
            }else{

            }
        })
    }})
}   

// add people to memory ------------------------------------------------

addPeopletoMemory = () => {

    memory.people.map((person,index) => {
         addPersontoMemory(person)
                .then(response => {
                    if(response == 'success'){
                        
            }else{

            }
        })
    })
    
}   
// add people to memory ------------------------------------------------

addGroupstoMemory = () => {

    memory.groups.map((groupid,index) => {
         addGrouptoMemory(groupid)
                .then(response => {
                    if(response == 'success'){
                        
            }else{

            }
        })
    })
}   
// upload file direct to S3 -----------------------------------------------------

uploadFiletoS3 = (filepath) => {    
    
    console.log('uploading file to S3 : ' + filepath);
    
    return new Promise((resolve,reject) => {

    let fileParts = filepath.split('.');
    let filetype = fileParts[1];

        processImage(filepath)
        .then(response => {
            if(response != 'failure'){
                let filename = memory.userid + '-' + Date.now()

                const file ={
                    uri: response,
                    name: filename,
                    type: filetype
                }
                
                const options = {
                    keyPrefix: '',
                    bucket: REACT_APP_S3_BUCKET,
                    region: REACT_APP_REGION,
                    accessKey: REACT_APP_AWS_KEY_ID,
                    secretKey: REACT_APP_AWS_SECRET_ACCESS_KEY,
                    successActionStatus: 201
                }

                RNS3.put(file, options)
                .then(response => {                
                    if (response.status == 201){          
                        memory.remoteURLS.push(response.body.postResponse.location)   
                        resolve('success')
                    }else{
                        console.log('rns3 FAILED : response')
                        
                        reject('failure')
                    }
                })
            }
        })
    })   
}

// Process image ----------------------------------------------------------

processImage = async (filepath) => {

    try {
        return new Promise((resolve, reject) => {
            ImageResizer.createResizedImage(filepath, 3000, 1080, 'JPEG', 80, 0)
                .then(response => {
                    console.log('Resized Image : ' + response.name + " : Resized to : " + response.size);
                    resolve(response.path);
                })
                .catch(err => {
                    console.log(err);
                    reject('failure');
                });
        });
    }
    catch (err_1) {
        console.log(err_1);
    }
}
// add file to memory -----------------------------------------------------

addFileToMemory = (remoteFileURL,ishero) => {
    
    
    return new Promise((resolve,reject) => {
        fetch('https://memriio-api-0.herokuapp.com/associateFile', {
            method: 'post',headers: {
                'Content-Type':'application/json'},
                    body:JSON.stringify({
                        memid: memory.MemoryID,
                        fileurl: remoteFileURL,
                        ishero: ishero
                        })
                    })
                    .then(response => response.json())
                    .then(response => {
                        if ( response.status !== 400){
                            console.log('associate file : memid :'  + memory.MemoryID + ' file : ' + remoteFileURL + ' hero shot = ' + ishero + ' ' + response);
                            resolve('success')
                        }else{
                            reject('failed to associate file : ' + response)
                        }
                    })
    })
}


// add a person to a memory -----------------------------------------------------

addPersontoMemory = (personID) => {
    
    return new Promise((resolve,reject) => {
        fetch('https://memriio-api-0.herokuapp.com/associatePerson', {
            method: 'post',headers: {
                'Content-Type':'application/json'},
                    body:JSON.stringify({
                        memid: memory.MemoryID,
                        userid: personID
                        })
                    })
                    .then(response => response.json())
                    .then(response => {
                        if ( response.status !== 400){
                            console.log('associate person : ' + personID + '  ' + response);
                            resolve('success')
                        }else{
                            console.log('associate person : ' + personID + '  ' + response);
                            reject('failed to associate person : ' + response)
                        }
                    })
    })
}

// add a person to a memory -----------------------------------------------------

addGrouptoMemory = (groupID) => {

    return new Promise((resolve,reject) => {
        fetch('https://memriio-api-0.herokuapp.com/associateGroup', {
            method: 'post',headers: {
                'Content-Type':'application/json'},
                    body:JSON.stringify({
                        memid: memory.MemoryID,
                        groupid: groupID
                        })
                    })
                    .then(response => response.json())
                    .then(response => {
                        if ( response.status !== 400){
                            console.log('associate group : ' + groupID + '  ' + response);
                            resolve('success')
                        }else{
                            console.log('associate group : ' + groupID + '  ' + response);
                            reject('failed to associate group : ' + response)
                        }
                    })
    })
}

// add a keyword to a memory -----------------------------------------------------


addKeywordtoMemory = (word) => {

    return new Promise((resolve,reject) => {
        fetch('https://memriio-api-0.herokuapp.com/associateKeyword', {
            method: 'post',headers: {
                'Content-Type':'application/json'},
                    body:JSON.stringify({
                        memid: memory.MemoryID,
                        keyword: word
                        })
                    })
                    .then(response => response.json())
                    .then(response => {
                        if ( response.status !== 400){
                            console.log('associate key word : ' + word + '  ' + response);
                            resolve('success')
                        }else{
                            console.log('associate key word : ' + word + '  ' + response);
                            reject('failed to associate keyword : ' + response)
                        }
                    })
    })
}


// create memory log -----------------------------------------------------

createMemoryID = () => {
    
    return new Promise((resolve,reject) => {
        fetch('https://memriio-api-0.herokuapp.com/creatememory', {
            method: 'post',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify({
                userid : memory.userid,
                title : memory.title,
                story : memory.story,
                location : memory.location
                })
        })
        .then(response => response.json())
        .then(memData => {
            if(memData.created){
                memory.MemoryID = memData.id
                console.log('creatememid : ' + memory.MemoryID + 'remoteid ' + memData.id);
                resolve('success')
            }  else {
                console.log('creatememid : ' + memData.id);
                reject('failed : unable to create memory')
            }
        })
    })
}



