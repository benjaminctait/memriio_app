import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage'
import KeyboardShift from './keyboardShift';
import * as mem from './datapass'

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
    SubTag,
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
    this.setupCloudsAndPeople = this.setupCloudsAndPeople.bind(this);
    
  }
    
  state={
    title:'',
    story:'',
    content:[],
    allPeople:[],
    taggedPeople:[],
    location:null,
    allClouds:[],
    taggedClouds:[],
    user:null
  } 

//--------------------------------------------------------------------------

setupCloudsAndPeople = (clouds) => {
  
  if(Array.isArray(clouds)){

    const firstitem = [{
      id:0,
      name:'Personal',
      administrator:this.state.userid,
      createdon:null
      
    }]
     
    const newarray = firstitem.concat(clouds)
    mem.getCloudPeople(clouds,null).then(people =>{ this.setState({allPeople:people,allClouds:newarray})})
    
  }
}

//--------------------------------------------------------------------------

refreshFeed = (memid) =>{
  console.log('newPost.refreshFeed : ' +  memid )

  // Now that the post has uploaded - need to push it onto the feed ??

}

//--------------------------------------------------------------------------

  sendPost = () => {
    
    Keyboard.dismiss()
    
    const cloudarray = []
    const personarray = []
    let me = this.state

    cloudarray = me.taggedClouds.filter(cloud => { cloud.id !== 0 }) // all tagged clouds except the personal cloud

    me.taggedPeople.map((person,i)=>{
      personarray[i] = person.userid;    
    })
      
      mem.postNewMemory  (me.title, 
                      me.story, 
                      me.content, 
                      personarray, 
                      me.location[0], 
                      cloudarray, 
                      me.user.userid,
                      this.refreshFeed)

      this.props.navigation.navigate('Feed')   
  
  }

// ---------------------------------------------------------------------------------  


  getLocation = () => {
    Keyboard.dismiss()
    this.props.navigation.navigate('SearchLocation')
  }

// ---------------------------------------------------------------------------------  

  getClouds = () => {
    Keyboard.dismiss()
    
  }

// ---------------------------------------------------------------------------------

  getPeople = () => {

    Keyboard.dismiss()
    this.props.navigation.navigate('SearchPeople',{
      allPeople     : this.state.allPeople, 
      taggedPeople  : this.state.taggedPeople
    });
    
  }
  
// ---------------------------------------------------------------------------------
  componentDidUpdate(){

    if(this.props.route.params){
      if(this.props.route.params.taggedPeople){
        if(this.state.taggedPeople !== this.props.route.params.taggedPeople){  
             
          if(Array.isArray(this.props.route.params.taggedPeople)){          
            this.setState({ taggedPeople:this.props.route.params.taggedPeople })
          }
        }
      }if(this.props.route.params.location){
        if(this.props.route.params.location !== this.state.location ){     
          this.setState({ location:this.props.route.params.location })
        }
      } 
    }
  }

  // ---------------------------------------------------------------------------------
   // Loads the state of the New Post view
   // pre :   AsyncStorage contains at least one content file
   // post :  state contains all captured content.
   //         Note : people, location and groups can load after the component is loaded.

  async componentDidMount(){
    const store=[]
    const user = await mem.activeUser();
    
    try{      
      await AsyncStorage.getAllKeys()
      .then(keys => {
        console.log('newpost-didmount getallkeys : ' + keys);

        keys.map((key,index) => {
          if(key.includes('image-') || key.includes('video-') || key.includes('audio-')) 
          {
              if(!key.includes('thumb')){
                AsyncStorage.getItem(key)
                  .then(item => {
                    this.getMatchingThumb(keys,key)
                    .then(thumb => {
                      console.log('push content : file' + mem.getFilename(item) + ' value ' + mem.getFilename(thumb));  
                      store.push({filepath:item,thumbnail:thumb})
                    })
                  }) 
              }
          }
        })
        console.log('content is array ' + Array.isArray(this.state.content));
        
        this.setState({
          content:store,                    
          user:user
        })
        
      })
      mem.mapUserClouds(user.userid,this.setupCloudsAndPeople)
      
      
    }catch (e) {
      alert(e)
    }
  }


// ---------------------------------------------------------------------------------

handleCloudTagPress = (cloudItem,buttonState) => {
  
  let exists = this.state.taggedClouds.includes(cloud => {cloud.id === cloudItem.id})

  console.log('buttonState ' + buttonState + ' exits ' + exists );
  
  if( buttonState && !exists ) this.state.taggedClouds.push(cloudItem)

  if( !buttonState && exists ){
    let newarry = this.state.taggedClouds.filter( cloud => { cloud.id !== cloudItem.id})
    this.state.taggedClouds = newarry
  }
  console.log(this.state.taggedClouds.map(cloud => {return cloud.id}));
}

// ---------------------------------------------------------------------------------

getMatchingThumb = ( keys,targetKey ) => {

  return new Promise ((resolve,reject)=>{
    let targetKeyNumber = parseInt(targetKey.slice(-1))
    keys.map(key => {
      if(key.includes('thumb')){
        let thumbKeyNumber = parseInt(key.slice(-1))
        
        if(targetKeyNumber === thumbKeyNumber){
          AsyncStorage.getItem(key).then(thumbPath =>{resolve(thumbPath)})
        }
      } 
    })
  })
}


// ---------------------------------------------------------------------------------

renderLocation =() =>{
console.log('locaiton : ' + this.state.location);
  if(this.state.location){
    return (
      <View style={styles.subtitle}>
        <LocationTag 
            key={this.state.location.locid}
            title={this.state.location.firstname + ' ' + this.state.location.lastname}/>                  
      </View>
    )
  }else{
    return null
  } 
 
}
// ---------------------------------------------------------------------------------
  

  render(){
    
    return( 
      
      <KeyboardShift >      
      <View style={styles.container} >
          
          <Input                                          // Title
            inputStyle={styles.titletext} 
            onChangeText = {(text) => {this.setState({title:text})}}
            placeholder='Create a title'
            placeholderTextColor='gray'
            
          >{this.state.title}</Input>                 
          
          <View style={{                                  // Content Thumbs
                  flex: 0, 
                  flexDirection:'row', 
                  flexWrap: 'wrap',
                  justifyContent:'center' ,
                  marginTop: 10,
                  marginBottom: 10,
                 
                }}
          >
            { this.state.content.map((item,index) => (
            <View style={{
                    width: '30%', 
                    height:200,
                    margin:5,

                  }} >
              <Image
                key         = { index}
                style       = { { height: '100%', width: '100%',borderRadius:10,borderWidth:1}}
                source      = { {uri:item.thumbnail}}                  
                resizeMode  = 'cover'
                

              /> 
            </View>
            ))}
          </View>
          
          <View>                                          
            
            <ListItem                                     // Tagged people list
              title='People'
              leftIcon={{name:'face'}}
              topDivider
              bottomDivider
              chevron
              onPress={()=> this.getPeople()}
              subtitle={
                <View style={styles.subtitle}>
                  {this.state.taggedPeople.map((person,index) =>(
                    <SubTag 
                      key               = { index }
                      data              = { person }
                      title             = { person.firstname + ' ' + person.lastname}
                      rightIcon         = { require('./images/x-symbol.png')}
                    />
                  ))}
                </View>}
            />
            <ListItem
              title         = 'Location'
              leftIcon      = { {name:'language'} }
              bottomDivider
              chevron
              onPress       = { ()=> this.getLocation() }
              subtitle      = { this.renderLocation() }

            />
            <ListItem
              title='Cloud'
              leftIcon={{name:'group'}}
              bottomDivider
              chevron
              onPress={()=> this.getClouds()}
              subtitle={
                <View style={styles.subtitle}>
                  {this.state.allClouds.map((cloud,index) =>(
                    
                    <SubTag 
                      key                 = { index}
                      data                = { cloud }
                      greyOutOnTagPress   = { !(cloud.name === 'Personal') } // Cant turn off the Personal cloud
                      buttonDown          = { true }  
                      onTagPress          = { this.handleCloudTagPress}
                      title               = { cloud.name}
                    />
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