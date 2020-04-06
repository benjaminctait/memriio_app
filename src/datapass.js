import React from 'react';

import { RNS3 } from 'react-native-aws3'

const AWS_ACCESS_KEY_ID = 'AKIAJFJXJF3KI5JT4BHA'
const AWS_SECRET_ACCESS_KEY = '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'
const S3_BUCKET = 'memriiostorage'
const REGION = 'us-east-2'


const memData = {
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

postNewMemory =  (
                title,
                story,
                files,
                people,
                location,
                groups,
                userid,
                ) => {
        
    memData.title = title
    memData.story = story
    memData.files = files
    memData.people = people
    memData.location = location
    memData.groups = groups
    memData.userid = userid

    
    const uploaded = uploadNewMemory()
    
}
    
// create a new memory ID -----------------------------------------------------

uploadNewMemory = async () => {

    uploadFiletoS3(memData.files[0])
        .then(response => {
            if(response == 'success'){
                createMemoryID()
                .then(response => {
                    if(response == 'success'){
                        addFileToMemory(memData.files[0],true)
                        addRemaingFilestoMemory()
                        addPeopletoMemory()     
                        addGroupstoMemory()                
                    }else{

                    }
                })
                    
            }else{
                console.log('failed to upload first file : ' + memData.files[0]);
            }
        })
        
}

// add remaining files to memory ------------------------------------------------

addRemaingFilestoMemory = () => {

    memData.files.map((file,index) => {
        if(index != 0)
        {
            uploadFiletoS3(file)
                .then(response => {
                    if(response == 'success'){
                        addFileToMemory(memData.remoteURLS[index],false)
            }else{

            }
        })
    }})
}   

// add people to memory ------------------------------------------------

addPeopletoMemory = () => {

    memData.people.map((person,index) => {
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

    memData.groups.map((groupid,index) => {
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
    
    return new Promise((resolve,reject) => {

    let fileParts = filepath.split('.');
    let fileName = memData.userid + '-' + Date.now()
    let fileType = fileParts[1];

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
                    memData.remoteURLS.push(response.body.postResponse.location)   
                    resolve('success')
                }else{
                    reject('failure')
                }
            })
    })   
}
    
// add file to memory -----------------------------------------------------

addFileToMemory = (remoteFileURL,ishero) => {

    return new Promise((resolve,reject) => {
        fetch('https://memriio-api-0.herokuapp.com/associateFile', {
            method: 'post',headers: {
                'Content-Type':'application/json'},
                    body:JSON.stringify({
                        memid: memData.MemoryID,
                        fileurl: remoteFileURL,
                        ishero: ishero
                        })
                    })
                    .then(response => response.json())
                    .then(response => {
                        if ( response.status == 200){
                            resolve('success')
                        }else{
                            reject('failed to add file to memory')
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
                        memid: memData.MemoryID,
                        userid: personID
                        })
                    })
                    .then(response => response.json())
                    .then(response => {
                        if ( response.status == 200){
                            resolve('success')
                        }else{
                            reject('failed to add person to memory')
                        }
                    })
    })
}

// add a person to a memory -----------------------------------------------------

associateKeyword

addGrouptoMemory = (groupID) => {

    return new Promise((resolve,reject) => {
        fetch('https://memriio-api-0.herokuapp.com/associateGroup', {
            method: 'post',headers: {
                'Content-Type':'application/json'},
                    body:JSON.stringify({
                        memid: memData.MemoryID,
                        groupid: groupID
                        })
                    })
                    .then(response => response.json())
                    .then(response => {
                        if ( response.status == 200){
                            resolve('success')
                        }else{
                            reject('failed to add group to memory')
                        }
                    })
    })
}

// add a keyword to a memory -----------------------------------------------------



addGrouptoMemory = (word) => {

    return new Promise((resolve,reject) => {
        fetch('https://memriio-api-0.herokuapp.com/associateKeyword', {
            method: 'post',headers: {
                'Content-Type':'application/json'},
                    body:JSON.stringify({
                        memid: memData.MemoryID,
                        keyword: word
                        })
                    })
                    .then(response => response.json())
                    .then(response => {
                        if ( response.status == 200){
                            resolve('success')
                        }else{
                            reject('failed to add group to memory')
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
                userid : memData.userid,
                title : memData.title,
                story : memData.story,
                location : memData.location,
                groupid: 0,
                })
        })
        .then(response => response.json())
        .then(memory => {
            if(memory.created){
                memData.MemoryID = memory.id
                resolve('success')
            }  else {
                reject('failed : unable to create memory')
            }
        })
    })
}



export default postNewMemory;
