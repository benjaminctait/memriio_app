import React, { Component } from 'react';
import { 
    StyleSheet,
    View,
    Text,
    
    TouchableOpacity,
    TouchableHighlight,
    Image,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Spinner from 'react-native-loading-spinner-overlay'
import AsyncStorage from '@react-native-community/async-storage'
import KeyboardShift from './keyboardShift';
import { 
  Input, 
  ListItem,
  CheckBox,

} from 'react-native-elements';
import {
  CameraClickButton,
  BackButton,
  PostButton,
  PersonTag,
  LocationTag,
  
} from './buttons'



class Settings extends Component {

    state = {
        email:'',
        firstname:'',
        familyname:'',
        groups:[],
        avatar:null,
    }

    render(){
    
        return( 
    
          
          <KeyboardShift >      
          <View style={styles.container} >
              
             
                
                
                <Input 
                  label ='First Name'
                  containerStyle={{marginBottom:10}}
                  inputStyle={styles.titletext} 
                  onChangeText = {(text) => {this.setState({firstname:text})}}
                  placeholder={this.state.firstname}
                  placeholderTextColor='black'
            
                />

                <Input 
                  label ='Family Name'
                  containerStyle={{marginBottom:10}}
                  inputStyle={styles.titletext} 
                  onChangeText = {(text) => {this.setState({familyname:text})}}
                  placeholder={this.state.familyname}
                  placeholderTextColor='black'
            
                />

                <Input 
                  label ='email'
                  containerStyle={{marginBottom:10}}
                  inputStyle={styles.titletext} 
                  onChangeText = {(text) => {this.setState({email:text})}}
                  placeholder={this.state.email}
                  placeholderTextColor='black'
            
                />
          
                <ListItem
                  title='My Groups'
                  leftIcon={{name:'group'}}
                  bottomDivider
                  chevron
                  onPress={()=> this.getGroups()}
                  />
                
              </View> 
      
           
    
            <View style={styles.mainButtons}>
                      
                <BackButton onPress={() => this.props.navigation.goBack(null)} />
    
            </View>
          </KeyboardShift>
        )
    }
}

export default Settings

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
      marginTop:2,
      marginBottom:2,
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