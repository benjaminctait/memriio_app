
import React, { Component } from 'react';
import { NavigationContainer ,useNavigation } from '@react-navigation/native';
import { createStackNavigator,CardStyleInterpolators } from '@react-navigation/stack';
import HomeScreen from './src/homescr'
import LogoTitle from './src/logotitle'
import {SettingsButton} from './src/buttons'
import AsyncStorage from '@react-native-community/async-storage'
import Signin from './src/signin'
import Settings from './src/settings.js'

//import FlashMessage from "react-native-flash-message";

const Stack = createStackNavigator();

class App extends Component{
  constructor () {
    super();
    this.handleLogonIn = this.handleLogonIn.bind(this);
  }

  state = { 
    email:'',
    firstname:'',
    familyname:'',
    isLoggedIn:false,
    userid:0
  }
  
//--------------------------------------------------------------------------
  
  handleLogonIn = async (user) => {
    console.log('handleLogonIn -> user ' + user.firstname + ' ' + user.lastname + ' id: ' + user.id); 
    
    await AsyncStorage.setItem( 'userLoggedin'  , JSON.stringify(true) )
    await AsyncStorage.setItem( 'uaserid'  ,JSON.stringify( user.id ))
    await AsyncStorage.setItem( 'firstname'  , user.firstname)
    await AsyncStorage.setItem( 'lastname'  , user.lastname)

    this.setState({
        isLoggedIn:true,
        userid:user.id,
        firstname:user.firstname,
        familyname:user.lastname
    })

  }


//--------------------------------------------------------------------------

async logCurrentUserOut(){

  if(this.state.isLoggedIn){
    AsyncStorage.setItem( 'userLoggedin'  , JSON.stringify(false) )
    AsyncStorage.setItem( 'uaserid'  , JSON.stringify(0)) 
    AsyncStorage.setItem( 'firstname'  , '')
    AsyncStorage.setItem( 'lastname'  , '')
    console.log('Logging user out : ' + this.state.firstname + ' id : ' + this.state.userid);  

    this.setState({
      isLoggedIn:false,
      userid:0,
      firstname:'',
      familyname:''
  })
  }else{
    console.log('No users currently logged in'); 
  }
}

//--------------------------------------------------------------------------

async componentDidMount(){

  const loggedin = await AsyncStorage.getItem('userLoggedin')
  const uid = await AsyncStorage.getItem('uaserid')
  if(loggedin){
    this.setState({isLoggedIn:loggedin,userid:uid})
  }

}

//--------------------------------------------------------------------------
  
  render(){
   
    if(this.state.isLoggedIn)
    {
      return(
        <NavigationContainer>
          <Stack.Navigator>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={({navigation}) => ({
                  headerTitle: props => <LogoTitle {...props} />,
                  headerRight: props => (
                    <SettingsButton {...props} onPress={() => 
                      navigation.navigate('Settings')
                      //this.logCurrentUserOut()
                        
                      }/>
                  ),
                })}
              />
              <Stack.Screen 
                name="Settings"
                component ={Settings}        
                options ={{
                  headerLeft: null,
                  cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                }}
              />

          </Stack.Navigator>
        </NavigationContainer>
      )
    }else{
      return (
        <Signin loguserin={this.handleLogonIn}/>
      )
    }
  }
}

export default App;
