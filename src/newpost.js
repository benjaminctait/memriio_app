import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage'
import KeyboardShift from './keyboardShift';
import {postNewMemory,mapUserClouds} from './datapass'

import { 
    StyleSheet,   
    View,
    Image,
    TextInput,
    Keyboard,
 
  } from 'react-native';

  import {
    CameraClickButton,
    BackButton,
    PostButton,
    PersonTag,
    LocationTag,
    
  } from './buttons'

import { 
  Input, 
  ListItem,
  CheckBox,

} from 'react-native-elements';

//--------------------------------------------------------------------------

class NewPost extends Component{
  constructor () {
    super();
    this.setupClouds = this.setupClouds.bind(this);
    
  }
    
  state={
    title:'',
    story:'',
    content:[],
    people:[],
    location:[],
    clouds:[],
  } 

//--------------------------------------------------------------------------

setupClouds = (clouds) => {
  
  if(Array.isArray(clouds)){

    const firstitem = [{id:0,
      name:'Personal',
      administrator:this.state.userid,
      createdon:null}] 
    const newarray = firstitem.concat(clouds)
    this.setState({clouds:newarray})
  }
}

//--------------------------------------------------------------------------

  sendPost = () => {
    
    Keyboard.dismiss()
    const filearray = []
    const cloudarray = []
    const personarray = []

    this.state.content.map((file,i)=>{
          filearray[i] = file[1]; // strip out the image name - just need the file paths 
    })

    this.state.clouds.map((cloud,i)=>{
      if(cloud.id > 0){
        cloudarray.push(cloud.id)  
      }
      
    })

    this.state.people.map((person,i)=>{
      personarray[i] = i;    // temporary - need to fix with real people ids
    })
    
    

    if(postNewMemory(this.state.title,
                    this.state.story,
                    filearray,
                    personarray,
                    this.state.location[0],
                    cloudarray,
                    1))
        { 
          cleanupAsyncstorage()
          this.props.navigation.navigate('Feed')      
          alert('We are uploading your post now. we will let you know when its done')     
        }
    
   
  
  }
  
  getLocation = () => {
    Keyboard.dismiss()
  }

  getGroups = () => {
    Keyboard.dismiss()
  }


  getPeople = () => {
    Keyboard.dismiss()
    
  }
  
   // ---------------------------------------------------------------------------------
   // Removes all content captured for the current post
   // pre : 
   // post :  any key value pair where key contains 'image-','video-', 'audio-' will 
   //         be removed from Storage

  cleanupAsyncstorage = async() =>{
    try{
      
      const keys =  await AsyncStorage.getAllKeys()
      
      keys.map(key,index => {
        if(key.includes('image-') || key.includes('video-') || key.includes('audio-')) {
          AsyncStorage.removeItem(key)
        }
      })
      
    }catch (e) {
      alert(e)
    }

  }

  // ---------------------------------------------------------------------------------
   // Loads the state of the New Post view
   // pre :   AsyncStorage contains at least one content file
   // post :  state contains all captured content.
   //         Note : people, location and groups can load after the component is loaded.

  async componentDidMount(){
    try{
      await AsyncStorage.removeItem('video- 1')
      const keys =  await AsyncStorage.getAllKeys().then(keys => {
        keys.map(key,index => {
          if(key.includes('image-') || key.includes('video-') || key.includes('audio-')) {
            stores.push(AsyncStorage.getItem(key))
          }
        })
        this.setState({
          content:stores,
          people:['Choppy','Dummy','Hommer'],                           // need to change this
          location:['UAP RT Foundry','Beacon, NY','New York State'],    // need to change this
        })
        
      })
      mapUserClouds(user.id,this.setupClouds)
      
    }catch (e) {
      alert(e)
    }
  }



  render(){
    
    return( 

      
      <KeyboardShift >      
      <View style={styles.container} >
          
          <Input 
            inputStyle={styles.titletext} 
            onChangeText = {(text) => {this.setState({title:text})}}
            placeholder='Create a title'
            placeholderTextColor='gray'
            
          >{this.state.title}</Input>
          
          <View style={{ 
                  flex: 0, 
                  flexDirection:'row', 
                  flexWrap: 'wrap',
                  justifyContent:'center' ,
                  marginTop: 10,
                  marginBottom: 10,
                 
                }}
          >
            { this.state.content.map((result,i,item) => (
            <View style={{
                    width: '30%', 
                    height:120,
                    margin:5,

                  }} >
              <Image
                style={{ height: '100%', width: '100%',borderRadius:10}}
                source={{uri:item[i][1]}}                  
                resizeMode='cover'

              /> 
            </View>
            ))}
          </View>
          <View>
            
            <ListItem
              title='Tag people'
              leftIcon={{name:'face'}}
              topDivider
              bottomDivider
              chevron
              onPress={()=> this.getPeople()}
              subtitle={
                <View style={styles.subtitle}>
                  {this.state.people.map((person) =>(
                    <PersonTag title={person}/>
                  ))}
                </View>}
            />
            <ListItem
              title='Flag the location'
              leftIcon={{name:'language'}}
              bottomDivider
              chevron
              onPress={()=> this.getLocation()}
              subtitle={
                <View style={styles.subtitle}>
                  {this.state.location.map((place) =>(
                    <LocationTag title={place}/>
                  ))}
                </View>}

            />
            <ListItem
              title='Share post with'
              leftIcon={{name:'group'}}
              bottomDivider
              chevron
              onPress={()=> this.getGroups()}
              subtitle={
                <View style={styles.subtitle}>
                  {this.state.groups.map((group) =>(
                    <PersonTag title={group}/>
                  ))}
                </View>}
              
            />
            <View style={styles.textAreaContainer} >
              <TextInput
                style={styles.textArea}
                placeholder="What's this post about then ?"
                placeholderTextColor="grey"
                numberOfLines={5}
                multiline={true}
                onChangeText = {(text) => {this.setState({story:text})}}
              />
            </View>
          </View> 
  
        </View>  

        <View style={styles.mainButtons}>
                  
            <BackButton onPress={() => this.props.navigation.goBack(null)} />
            <PostButton onPress={() => this.sendPost() } />

        </View>
      </KeyboardShift>
       
    )
  }
}

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },   
  preview: {
        alignContent:'center',
        
    
  },
  mainButtons: {
    flexDirection:'row',
    justifyContent:'space-between', 
    marginBottom:30,
    marginHorizontal:50,
    marginTop:15,
  },
  titletext:{
    marginTop:15,
    marginBottom:10,
    fontSize:15,
  },
  textAreaContainer: {
    borderColor: 'lightgray',
    borderWidth: 1,
    padding: 5
  },
  textArea: {
    height: 150,
    justifyContent: "flex-start",
    fontSize:15,
  },
  subtitle: {
    flexDirection:'row',
    flexWrap:'wrap',
    marginTop:5,
    marginRight:5,
    fontSize:8,
  }
})