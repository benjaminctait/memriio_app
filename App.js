
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/homescr'
import LogoTitle from './src/logotitle'
import {SettingsButton} from './src/buttons'
import AsyncStorage from '@react-native-community/async-storage'
import Signin from './src/signin'

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
    console.log('logged in userid : ' + user.id);   
    await AsyncStorage.setItem( 'userLoggedin'  , JSON.stringify(true) )
    await AsyncStorage.setItem( 'uaserid'  , JSON.stringify(user.id))
    await AsyncStorage.setItem( 'firstname'  , JSON.stringify(user.firstname))
    await AsyncStorage.setItem( 'lastname'  , JSON.stringify(user.lastname))

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
                options={{
                  headerTitle: props => <LogoTitle {...props} />,
                  headerRight: () => (
                    <SettingsButton onPress={() => {
                        this.logCurrentUserOut()
                        
                      }}/>
                  ),
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
