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
      points:0,
      status:'',
      statusGapInCredits:0,
      statusGapInPosts:0,
      nextStatusLevel:''
    })
    
    this.getPointsAndStatus()
    mapUserClouds(user.userid,this.setupClouds)

  }

  

//--------------------------------------------------------------------------

getPointsAndStatus = () => {
   
    this.setState(
      { points:1500,
        status:'Carbon',
        statusGapInCredits:150,
        statusGapInPosts:3,
        nextStatusLevel:'Bronze'
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
                  <View style={styles.settingsItem}>
                    <Text style={styles.pointsText}>Points and Status</Text>
                    <View style={styles.pointsBox}>
                      <Text style={styles.pointsText}>{`Points Balance \t\t ${this.state.points}`}</Text>
                      <View style={{flex:0,flexDirection:'row'}}>
                        <Text style={styles.pointsText}>{`Status \t\t\t\t ${this.state.status}\t` }</Text>
                        <Text style={styles.pointsSubText}>{`(${this.state.statusGapInPosts}x posts to reach ${this.state.nextStatusLevel})`}</Text>
                      </View>
                      
                      
                     

                    </View>
                  </View>
                  

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
      marginLeft:8,
      alignSelf:'center',

    },

    settingsItem:{
      
      width:'95%',      
      marginTop:20,
      marginBottom:20,
      marginLeft:10,
      alignSelf:'center',

    },


    pointsBox:{
      marginTop:5,
      marginLeft:5,
      borderWidth:.5,
      borderRadius:5,
      borderColor:'blue',
      backgroundColor:'#f5f5f5',
      paddingBottom:8,     
      width:'98%'
    },

    pointsText:{
      marginTop:8,
      marginBottom:5,
      marginLeft:5,
      color:'black',
      fontSize:15,
    },
    pointsSubText:{
      marginTop:11,
      marginBottom:3,
      marginLeft:5,
      color:'#ed1874',
      fontSize:12,
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