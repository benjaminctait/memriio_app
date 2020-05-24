import React, { Component } from 'react';
import { 
    StyleSheet,
    View,
    TouchableOpacity,    
    Text,
    Image,
} from 'react-native';

import {activeUser,createMemoryCloud,mapUserClouds} from './datapass'
import KeyboardShift from './keyboardShift';
import { 
  Input, 
  ListItem,
} from 'react-native-elements';
import {
  BackButton,
  PersonTag,
  SubTag,
} from './buttons'



class Settings extends Component {

  constructor () {
    super();
    this.setupClouds = this.setupClouds.bind(this);
    
  }

    state = {
        email:'',
        firstname:'',
        familyname:'',
        clouds:[],
        avatar:null,
        userid:0
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

  componentDidMount = async () => {
  
    const user = await activeUser()
    console.log('settings load : user - ' + user.userid + ' ' + user.firstName + ' ' + user.lastName + ' ' + user.email);
    
    this.setState({
      userid:user.userid,
      email:user.email,
      firstname:user.firstName,
      familyname:user.lastName,

    })

    mapUserClouds(user.userid,this.setupClouds)

  }

//--------------------------------------------------------------------------

createNewMemoryCloud = () => {
  alert('Nothing')
  //createMemoryCloud('Home',this.state.userid)
}

//--------------------------------------------------------------------------
    render(){
      
      
      
      if(this.state.userid == 1){
        
        specialButton =  <Text 
                          style={styles.labelText}
                          onPress = {() =>{this.createNewMemoryCloud()}}
                          >Create</Text>
            
      }else{
        specialButton = null 
      }  
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
                  autoCapitalize={false}
                  labelStyle={styles.labelText}
                  containerStyle={styles.inputContainer}
                  inputStyle={styles.inputText} 
                  onChangeText = {(text) => {this.setState({email:text})}}
                  placeholder={this.state.email}
                  placeholderTextColor='black'
            
                />

                
                <ListItem
                  title='My Memory Clouds'
                  leftIcon={{name:'cloud-queue'}}
                  containerStyle={{
                    marginLeft:5
                    
                  }}
                  bottomDivider
                  chevron
                  onPress={()=> this.getGroups()}
                  subtitle={
                    <View style={styles.subtitle}>
                      {this.state.clouds.map((cloud) =>(
                        <SubTag  
                        title = {cloud.name} 
                        rightIconUp   =   {require('./images/checked_blue.png')}
                        rightIconDown =   {require('./images/x-symbol.png')}
                        switchRightIconOnTagPress = {true}
                        textStyle = {styles.ptagText}
                        tagStyle = {styles.ptag}
                      />
                      ))}
                    </View>
                  }
                  />
                  

                  <View style={styles.settingsTextItem}>
                    <Image
                      style={styles.littleButton}
                      source={require('./images/opendoor.png')}            
                    />
                    <TouchableOpacity style={styles.xText}>
                      <Text 
                        style={styles.labelText}
                        onPress = {() =>{this.props.route.params.logoutcallback()}}
                      >Logout</Text>
                    </TouchableOpacity>

                    
                    
                  </View>

                  <TouchableOpacity style={styles.xText}>
                    {specialButton}
                  </TouchableOpacity>

                
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
      width:'95%',
      marginBottom:20,
      alignSelf:'center',
    },

    settingsTextItem:{
      flex: 0,
      flexDirection:'row',
      width:'95%',
      height:50,
      marginTop:20,
      marginBottom:20,
      alignSelf:'center',

    },

    inputText:{
      marginTop:2,
      marginBottom:2,
      fontSize:18,
      color:'blue'
      
      
    },
    xText:{
      marginTop:2,
      marginBottom:2,
      marginLeft:10,
      alignSelf:'center',

    },

    labelText:{
      marginTop:2,
      marginBottom:2,
      fontSize:15,
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
      height: 30,
      width: 30,
      alignSelf:'center',
      backgroundColor: 'transparent',  
    },
    subtitle: {
      flexDirection:'row',
      flexWrap:'wrap',
      marginTop:5,
      marginRight:5,
      fontSize:8,
    },
    
    ptagText:{
      fontSize:15,
    },
    ptag:{
      borderWidth:.5,
      borderRadius:5,
      paddingHorizontal:4,
      paddingBottom:4,
      paddingTop:4,
      marginTop:4,
      marginRight:8,
      marginBottom:4,
      borderColor:'blue',
      backgroundColor:'#f5f5f5',
    }
  })