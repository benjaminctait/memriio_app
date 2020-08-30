import React, { Component } from 'react';
import KeyboardShift from './keyboardShift';

import { 
    StyleSheet,
    View,
    TouchableOpacity,
    FlatList,
  
  } from 'react-native';

import { BackButton,PersonListItem,SubTag} from './buttons'


class SearchLocation extends Component{
  constructor(props){
    super(props)    
  }

//--------------------------------------------------------------------------------

handleSelectLocation = (location) => {
  this.props.navigation.navigate('NewPost',{location: location})
}

//--------------------------------------------------------------------------------

getLocations = () => {

  return [
    {
      locid:0,
      firstname:'UAP',
      lastname:'Brisbane'
    },
    {
      locid:1,
      firstname:'UAP',
      lastname:'Shanghai'
    },
    {
      locid:1,
      firstname:'UAP',
      lastname:'New York'
    }
  ]
  
}

//--------------------------------------------------------------------------------

renderItem = ({ item  }) => (
  <PersonListItem 
    key     = { item.locid }    
    onPress = { this.handleSelectLocation }
    person  = { item }
  />
);

//--------------------------------------------------------------------------------

goBack =() =>{
  this.props.navigation.navigate('NewPost')
}
//--------------------------------------------------------------------------------

render(){
  
  return(
    <KeyboardShift >      
      <View style={styles.container}>

        <View style={styles.listArea}>
          <FlatList   
            keyExtractor={item => item.locid}
            data = {this.getLocations()}
            renderItem  = { this.renderItem }
          />
        </View>

        <View style={styles.buttonArea}>                    
          <BackButton onPress={ this.goBack} />
        </View>
      </View>
    </KeyboardShift >      
  )
}

}

export default SearchLocation;

const styles = StyleSheet.create({
    container:{
      flex:1,
    },
    listArea:{
      flex:18,
      backgroundColor:'white'
    },
    taggedArea:{
      flex:3,
      flexDirection:'row',
      alignItems:'flex-start',
      flexWrap:'wrap',
      borderTopColor:'grey',
      borderTopWidth:1,
      backgroundColor:'white'
    },
    searchArea:{
      flex:1,
      backgroundColor:'white',
      
      fontSize:12,
    },

    
    textMain:{
      alignItems:'center',
      justifyContent:'center',
      fontSize: 30,
      backgroundColor: 'green',
      color:'black'
    },
    buttonArea: {
      flex:1,
      flexDirection:'row',
      justifyContent:'space-between', 
      marginBottom:30,
      marginHorizontal:50,
      marginTop:15,
    },
  });
