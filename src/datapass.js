import React from 'react';

import { RNS3 } from 'react-native-aws3'

const AWS_ACCESS_KEY_ID = 'AKIAJFJXJF3KI5JT4BHA'
const AWS_SECRET_ACCESS_KEY = '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'
const S3_BUCKET = 'memriiostorage'
const REGION = 'us-east-2'


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
    memory.title = 'My first Post'  
    memory.story = 'A story about my first post' 
    memory.files = files
    memory.people = people
    memory.location = location
    memory.groups = groups
    memory.userid = userid

    
    const uploaded = uploadNewMemory()
    return uploaded
    
}

// post new memory -----------------------------------------------------

export function getMemories (userID,groupIDs,callback)  
{
    
    const memories = []

    memories[0] =     
     {
        title : "This is a cow",
        story : 'Once upon a time there was a cow who wasnt a cow but was a cow but wasnt a cow',
        people : [1,2,45,12],
        location : 'UAP Rock Tavern',
        groups : [0,5],
        remoteURLS : [
          '/Users/bentait/Pictures/cow.jpg',
          '/Users/bentait/Pictures/table.jpg'
        ],
        userid : 0,
        MemoryID : 35
      },

      memories[1] = {
        title : "This is a table",
        story : 'The dog jumed over the moon and then back again and then back again and then back again and then back again',
        people : [1,2,45,12],
        location : 'UAP New York',
        groups : [0,5],
        remoteURLS : [
          '/Users/bentait/Pictures/table.jpg',
          '/Users/bentait/Pictures/cow.jpg'
        ],
        userid : 0,
        MemoryID : 36
      }  
    
        console.log('memories : ' + memories[0].title);
        
        callback(memories)

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
                return false
                console.log('failed to upload first file : ' + memory.files[0]);
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
    let filename = memory.userid + '-' + Date.now()
    let filetype = fileParts[1];

        const file ={
            uri: filepath,
            name: filename,
            type: filetype
        }
        const options = {
            keyPrefix: '',
            bucket: S3_BUCKET,
            region: REGION,
            accessKey: AWS_ACCESS_KEY_ID,
            secretKey: AWS_SECRET_ACCESS_KEY,
            successActionStatus: 201
        }
        RNS3.put(file, options)
            .then(response => {                
                if (response.status == 201){          
                    memory.remoteURLS.push(response.body.postResponse.location)   
                    resolve('success')
                }else{
                    reject('failure')
                }
            })
    })   
}
    
// add file to memory -----------------------------------------------------

addFileToMemory = (remoteFileURL,ishero) => {
    console.log('add file to memory : ' + remoteFileURL +' ' + ishero);
    
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
        .then(memory => {
            if(memory.created){
                memory.MemoryID = memory.id
                console.log('creatememid : ' + memory.id);
                resolve('success')
            }  else {
                console.log('creatememid : ' + memory.id);
                reject('failed : unable to create memory')
            }
        })
    })
}



