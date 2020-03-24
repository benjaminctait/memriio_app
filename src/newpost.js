import React, { Component } from 'react';
import BasicCard from './cards'
import AsyncStorage from '@react-native-community/async-storage'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import KeyboardShift from './keyboardShift';

import { 
    StyleSheet,    
    ScrollView,  
    Button,
    View,
    Image,
    TextInput,
    TextInputComponent,
    Keyboard,
 
  } from 'react-native';

  import {CameraClickButton,
    BackButton,
    PostButton,
    
  } from './buttons'

import { 
  Input, 
  ListItem,


} from 'react-native-elements';



class NewPost extends Component{
    
  state={
    content:[]
  }

  sendPost(){
    alert('send post')
  }
  
  getLocation(){
    Keyboard.dismiss()
  }

  getGroups(){
    Keyboard.dismiss()
  }

  getPeople(){
    Keyboard.dismiss()
  }
  

  async componentDidMount(){
    try{
      await AsyncStorage.removeItem('video - 1')
      const keys =  await AsyncStorage.getAllKeys()
      
      await AsyncStorage.multiGet(keys,(err,stores) => { 
      this.setState({content:stores})
      
      })
      
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
            placeholder='New Post Title'
            placeholderTextColor='gray'
            
          /> 
          
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
              title='Who was involved'
              leftIcon={{name:'face'}}
              topDivider
              bottomDivider
              chevron
              onPress={()=> this.getPeople()}

            />
            <ListItem
              title='Where did this happen'
              leftIcon={{name:'language'}}
              bottomDivider
              chevron
              onPress={()=> this.getLocation()}

            />
            <ListItem
              title='Which groups do you want know'
              leftIcon={{name:'group'}}
              bottomDivider
              chevron
              onPress={()=> this.getGroups()}
              
            />
            <View style={styles.textAreaContainer} >
              <TextInput
                style={styles.textArea}
                placeholder="What's this post about then ?"
                placeholderTextColor="grey"
                numberOfLines={5}
                multiline={true}
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
    fontSize:20,
  },
  textAreaContainer: {
    borderColor: 'lightgray',
    borderWidth: 1,
    padding: 5
  },
  textArea: {
    height: 150,
    justifyContent: "flex-start"
  }
})