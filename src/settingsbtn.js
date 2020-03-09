import React, { Component } from 'react';
import { 
    StyleSheet,
    TouchableOpacity,
    Image
  } from 'react-native';

class SettingsButton extends Component{
    render(){
        return(
            <TouchableOpacity onPress={this.props.onPress}>
            <Image
              style={styles.button}
              source={require('./images/settings.png')}
            />
          </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        height: 20,
        width: 20,
        alignItems: 'center',
        alignContent: 'center',
        backgroundColor: 'white',
        marginRight:10,
        
    }
  });

export default SettingsButton