import React, { Component } from 'react';
import { 
    StyleSheet,
    View,
    TouchableOpacity,
    TouchableHighlight,
    Text,
    Image,
} from 'react-native';

import Spinner from 'react-native-loading-spinner-overlay'
import {activeUser} from './datapass'
import KeyboardShift from './keyboardShift';
import { 
  Input, 
  ListItem,
  CheckBox,

} from 'react-native-elements';
import {
  
  BackButton,
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

//--------------------------------------------------------------------------

  componentDidMount = async () => {
  
    const user = await activeUser()
    console.log('settings load : user - ' + user.id + ' ' + user.firstName + ' ' + user.lastName + ' ' + user.email);
    

    this.setState({
      email:user.email,
      firstname:user.firstName,
      familyname:user.lastName,
    })

  }

//--------------------------------------------------------------------------
    render(){
    
        return( 
    
          <KeyboardShift >      
          <View style={styles.container} >
                
                <Input 
                  label ='First Name'
                  labelStyle={styles.labelText}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText} 
                  onChangeText = {(text) => {this.setState({firstname:text})}}
                  placeholder={this.state.firstname}
                  placeholderTextColor='black'
            
                />

                <Input 
                  label ='Family Name'
                  labelStyle={styles.labelText}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText} 
                  onChangeText = {(text) => {this.setState({familyname:text})}}
                  placeholder={this.state.familyname}
                  placeholderTextColor='black'
            
                />

                <Input 
                  label ='email'
                  labelStyle={styles.labelText}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText} 
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

                  <View style={styles.settingsTextItem}>
                    <Image
                      style={styles.littleButton}
                      source={require('./images/video.png')}            
                    />
                    <TouchableOpacity style={styles.xText}>
                      <Text 
                        onPress = {() =>{this.props.route.params.logoutcallback()}}
                      >Logout</Text>
                    </TouchableOpacity>
                  </View>
                
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
    inputContainer: {
      borderWidth:1,
      borderRadius:10,
      backgroundColor: '#DCDCDC',
      borderColor:'#DCDCDC',
      width:'95%',
      marginBottom:20,
      alignSelf:'center',
    },

    settingsTextItem:{
      flex: 0,
      flexDirection:'row',
      //borderWidth:1,
      //borderRadius:10,
      //backgroundColor: '#DCDCDC',
      //borderColor:'#DCDCDC',
      width:'95%',
      height:50,
      marginTop:20,
      marginBottom:20,
      alignSelf:'center',

    },

    inputText:{
      marginTop:2,
      marginBottom:2,
      fontSize:12,
    },
    xText:{
      marginTop:2,
      marginBottom:2,
      marginLeft:20,
      fontSize:15,
      alignSelf:'center',
      

    },

    labelText:{
      marginTop:2,
      marginBottom:2,
      fontSize:12,
    },
    
    mainButtons: {
      flexDirection:'row',
      justifyContent:'space-between', 
      marginBottom:30,
      marginHorizontal:50,
      marginTop:15,
    },
    littleButton: {
      marginLeft: 5,
      height: 20,
      width: 20,
      alignSelf:'center',
      backgroundColor: 'transparent',  
    },
    
  })