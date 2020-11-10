import React, {Component} from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import HomeScreen from './src/homescr';
import LogoTitle from './src/logotitle';
import {SettingsButton} from './src/buttons';
import AsyncStorage from '@react-native-community/async-storage';
import Signin from './src/signin';
import Settings from './src/settings.js';
import {YellowBox} from 'react-native';
import {StackNavigator} from 'react-navigation';
import PlayerScreen from 'react-native-sound-playerview';

YellowBox.ignoreWarnings([
  'Animated: `useNativeDriver` was not specified.',
  '[RNCamera initializeAudioCaptureSessionInput]',
]);

//import FlashMessage from "react-native-flash-message";

const Stack = createStackNavigator();

class App extends Component {
  constructor() {
    super();
    this.handleLogonIn = this.handleLogonIn.bind(this);
    this.logCurrentUserOut = this.logCurrentUserOut.bind(this);
  }

  state = {
    email: '',
    firstname: '',
    familyname: '',
    isLoggedIn: false,
    userid: 0,
  };

  //--------------------------------------------------------------------------

  handleLogonIn = async (user) => {
    console.log(
      'handleLogonIn -> user ' +
        user.firstname +
        ' ' +
        user.lastname +
        ' id: ' +
        user.userid +
        ' email: ' +
        user.email,
    );

    await AsyncStorage.setItem('userLoggedin', JSON.stringify(true));
    await AsyncStorage.setItem('userid', JSON.stringify(user.userid));
    await AsyncStorage.setItem('firstname', user.firstname);
    await AsyncStorage.setItem('lastname', user.lastname);
    await AsyncStorage.setItem('email', user.email);

    this.setState({
      isLoggedIn: true,
      userid: user.userid,
      firstname: user.firstname,
      familyname: user.lastname,
    });
  };

  //--------------------------------------------------------------------------

  logCurrentUserOut = async () => {
    if (this.state.isLoggedIn) {
      AsyncStorage.setItem('userLoggedin', JSON.stringify(false));
      AsyncStorage.setItem('userid', JSON.stringify(0));
      AsyncStorage.setItem('firstname', '');
      AsyncStorage.setItem('lastname', '');
      AsyncStorage.setItem('email', '');
      console.log(
        'Logging user out : ' +
          this.state.firstname +
          ' id : ' +
          this.state.userid,
      );

      this.setState({
        isLoggedIn: false,
        userid: 0,
        firstname: '',
        familyname: '',
      });
    } else {
      console.log('No users currently logged in');
    }
  };

  //--------------------------------------------------------------------------

  async componentDidMount() {
    const loggedin = await AsyncStorage.getItem('userLoggedin');
    const uid = await AsyncStorage.getItem('userid');
    if (loggedin) {
      this.setState({isLoggedIn: loggedin, userid: uid});
    }
  }

  //--------------------------------------------------------------------------

  render() {
    if (this.state.isLoggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({navigation}) => ({
                headerLeft: (props) => <LogoTitle {...props} />,
                headerTitle: '',
                headerRight: (props) => (
                  <SettingsButton
                    {...props}
                    onPress={() =>
                      navigation.navigate('Settings', {
                        logoutcallback: this.logCurrentUserOut,
                      })
                    }
                  />
                ),
              })}
            />
            <Stack.Screen
              name="Settings"
              component={Settings}
              options={{
                headerLeft: null,
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}
            />
            <Stack.Screen
              name="Audio"
              options={{
                // headerLeft: null,
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}>
              {(props) => <PlayerScreen {...props} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      );
    } else {
      return <Signin loguserin={this.handleLogonIn} />;
    }
  }
}

export default App;
