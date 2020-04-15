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



class Signin extends Component {

    state = {
        email:'',
        password:'' 
    }

    onClickListener = (viewId) => {
        alert("Alert Button pressed "+viewId);
    }


    onSubmitSignIn = () => {
        fetch('https://memriio-api-0.herokuapp.com/signin', {
            method: 'post',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify({
                    email:this.state.email,
                    password: this.state.password
                })
            })
                .then(response => response.json())
                .then(user => {
                                    
                 if(user.id){
                    this.props.logUserIn(user.id)
                    
                 }else{
                    this.setState({email:''})   
                    this.setState({password:''})   
                 }
             })
        }
    

    render() {
        
        return (
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/message/ultraviolet/50/3498db'}}/>
                <TextInput style={styles.inputs}
                    placeholder="Email"
                    keyboardType="email-address"
                    underlineColorAndroid='transparent'
                    onChangeText={(email) => this.setState({email})}/>
                </View>
                
                <View style={styles.inputContainer}>
                <Image style={styles.inputIcon} source={{uri: 'https://png.icons8.com/key-2/ultraviolet/50/3498db'}}/>
                <TextInput style={styles.inputs}
                    placeholder="Password"
                    secureTextEntry={true}
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
    }
    });