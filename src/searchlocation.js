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
  
    this.props.updateLocation(location.firstname + ' ' + location.lastname)
    this.props.close()
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
      locid:2,
      firstname:'UAP',
      lastname:'New York'
    },
    {
      locid:3,
      firstname:'UAP',
      lastname:'Rock Tavern'
    },
    {
      locid:4,
      firstname:'UAP',
      lastname:'Melbourne'
    },
    {
      locid:5,
      firstname:'UAP',
      lastname:'Sydney'
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
  if(this.props.route){
    this.props.navigation.navigate('NewPost',{
      taggedPeople: this.state.taggedPeople
    });
  }else{
    this.props.close()
  }
  
}
//--------------------------------------------------------------------------------

render(){
  
  let toppadding = this.props.route ? 0 : toppadding = 50

  return(
    <KeyboardShift >      
      <View style={[styles.container,{paddingTop:toppadding}]}>

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
