import React, { Component } from 'react';
import { 
    StyleSheet,
    View,
    Text,
    Label,
    Input,
    TouchableOpacity,
    TouchableHighlight,
    Image,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Spinner from 'react-native-loading-spinner-overlay'
import AsyncStorage from '@react-native-community/async-storage'



class Signin extends Component {

    state = {
        email:'',
        firstname:'',
        familyname:'',
        password:'',
        spinner:false,
        registermode:false

    }

//---------------------------------------------------------------------------------

    onClickListener = (viewId) => {
        console.log('signin - onlicklistener : ' + viewId) ;
        if (viewId === 'login'){
            this.onSubmitSignIn()
        }
        else if (viewId === 'register'){
            this.setState({registermode:true})
        }
        else if ( viewId === 'join'){
            this.onSubmitSignUp()
            
        }

        
    }
//---------------------------------------------------------------------------------


    onSubmitSignIn = () => {
        console.log('onSubmitSignIn ' +  this.state.email + ' ' + this.state.password);
        this.setState({spinner:true})
        
        fetch('https://memriio-api-0.herokuapp.com/signin', {
            method: 'post',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify({
                    email: this.state.email,
                    password: this.state.password,
                })
            })
                .then(response => response.json())
                .then(user => {
                 
                 console.log(user);
                 
                                
                 if(user.id){
                    this.setState({spinner:false}) 
                    console.log('onSubmitSignUp -> calling callback with user : ' + user.id );
                    this.props.loguserin(user)
                    
                    
                 }else{
                    this.setState({spinner:false}) 
                    this.setState({email:''})   
                    this.setState({password:''})   
                 }
             })
        }

//--------------------------------------------------------------------------------

onSubmitSignUp = () => {

    console.log('onSubmitSignUp ' + this.state.firstname + ' ' + this.state.lastname + ' ' + this.state.email + ' ' + this.state.password);
    this.setState({spinner:true})
    
    fetch('https://memriio-api-0.herokuapp.com/register', {
        method: 'post',
        headers: {'Content-Type':'application/json'},
        body:JSON.stringify({
           
                firstname: this.state.firstname,
                lastname: this.state.familyname,
                email: this.state.email,
                password: this.state.password,
            })
        })
            .then(response => response.json())
            .then(user => {
             
             console.log('new user created');
             console.log(user);
                            
             if(user.id){
                this.setState({spinner:false}) 
                console.log('calling logUserIn ' + user.id );
                this.props.loguserin(user)
                
                
             }else{
                this.setState({spinner:false}) 
                this.setState({email:''})   
                this.setState({password:''})   
             }
         })
    }

//---------------------------------------------------------------------------------
       
    render() {
        
        if( this.state.registermode === false){
            return (
                <View style={styles.container}>
                    <Spinner
                        visible={this.state.spinner}
                        textContent={'Lets see now...'}
                        textStyle={styles.spinnerTextStyle}
                    />
                    <View style={styles.inputContainer}>
                    <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/message/ultraviolet/50/3498db'}}/>
                    <TextInput style={styles.inputs}
                        placeholder="Email"
                        keyboardType="email-address"
                        autoCapitalize = 'none'
                        underlineColorAndroid='transparent'
                        onChangeText={(email) => this.setState({email})}/>
                    </View>
                    
                    <View style={styles.inputContainer}>
                    <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/key-2/ultraviolet/50/3498db'}}/>
                    <TextInput style={styles.inputs}
                        placeholder="Password"
                        secureTextEntry={true}
                        autoCapitalize = 'none'
                        underlineColorAndroid='transparent'
                        onChangeText={(password) => this.setState({password})}/>
                    </View>

                    <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.onClickListener('login')}>
                        <Text style={styles.loginText}>Login</Text>
                    </TouchableHighlight>

                    <TouchableOpacity style={styles.buttonContainer} onPress={() => this.onClickListener('restore_password')}>
                        <Text>Forgot your password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonContainer} onPress={() => this.onClickListener('register')}>
                        <Text>Register</Text>
                    </TouchableOpacity>
                </View>
            ) 
        }else{
            return (
                <View style={styles.container}>
                        <Spinner
                            visible={this.state.spinner}
                            textContent={'Getting you in...'}
                            textStyle={styles.spinnerTextStyle}
                        />
                        <View style={styles.inputContainer}>                    
                        <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/message/ultraviolet/50/3498db'}}/>
                        <TextInput style={styles.inputs}
                            placeholder="First name"
                            keyboardType="default"
                            underlineColorAndroid='transparent'
                            onChangeText={(firstname) => this.setState({firstname})}/>
                        </View>

                        <View style={styles.inputContainer}>                    
                        <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/message/ultraviolet/50/3498db'}}/>
                        <TextInput style={styles.inputs}
                            placeholder="Family name"
                            keyboardType="default"
                            underlineColorAndroid='transparent'
                            onChangeText={(familyname) => this.setState({familyname})}/>
                        </View>

                        <View style={styles.inputContainer}>                    
                        <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/message/ultraviolet/50/3498db'}}/>
                        <TextInput style={styles.inputs}
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize = 'none'
                            underlineColorAndroid='transparent'
                            onChangeText={(email) => this.setState({email})}/>
                        </View>
                        
                        <View style={styles.inputContainer}>
                        <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/key-2/ultraviolet/50/3498db'}}/>
                        <TextInput style={styles.inputs}
                            placeholder="Password"
                            secureTextEntry={true}
                            autoCapitalize = 'none'
                            underlineColorAndroid='transparent'
                            onChangeText={(password) => this.setState({password})}/>
                        </View>

                        <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]} onPress={() => this.onClickListener('join')}>
                            <Text style={styles.loginText}>Signup</Text>
                        </TouchableHighlight>

                        <TouchableOpacity style={styles.buttonContainer} onPress={() => this.onClickListener('cancel')}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                    </View>
            )
        }
    }
}

export default Signin



const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#DCDCDC',

    },
    inputContainer: {
        borderBottomColor: '#F5FCFF',
        backgroundColor: '#FFFFFF',
        borderRadius:20,
        borderBottomWidth: 1,
        width:300,
        height:45,
        marginBottom:20,
        flexDirection: 'row',
        alignItems:'center'
    },
    inputs:{
        height:45,
        marginLeft:16,
        borderBottomColor: '#FFFFFF',
        
        flex:1,
    },
    inputIcon:{
        width:30,
        height:30,
        marginLeft:15,
        justifyContent: 'center'
    },
    buttonContainer: {
        height:45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom:20,
        width:300,
        borderRadius:20,
        
    },
    loginButton: {
        backgroundColor: "#00b5ec",
    },
    loginText: {
        color: 'white',
    },
    spinnerTextStyle: {
        color: '#FFF'
      },
    });