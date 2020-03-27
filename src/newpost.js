import React, { Component } from 'react';
import BasicCard from './cards'
import AsyncStorage from '@react-native-community/async-storage'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import KeyboardShift from './keyboardShift';

import { 
    StyleSheet,    
    ScrollView,  
    Text,
    View,
    Image,
    TextInput,
    TextInputComponent,
    Keyboard,
    
 
  } from 'react-native';

  import {CameraClickButton,
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



class NewPost extends Component{
    
  state={
    title:'',
    story:'',
    content:[],
    people:[],
    location:[],
    groups:[],
  }

  sendPost(){
    Keyboard.dismiss()
    alert('send post ' + this.state.story)
  
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
      this.setState({
          content:stores,
          people:['Choppy','Dummy','Hommer'],
          location:['UAP RT Foundry','Beacon, NY','New York State'],
          groups:['Close Family','UAP']
        })
      
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