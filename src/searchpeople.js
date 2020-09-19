import React, { Component } from 'react';


import { 
    StyleSheet,
    View,
    TouchableOpacity,
    FlatList,
    TouchableWithoutFeedbackBase,
  } from 'react-native';

import { BackButton,PersonListItem,SubTag} from './buttons'
import { Input ,ListItem} from 'react-native-elements';

class SearchPeople extends Component{
  constructor(props){
    super(props)
    this.inputRef = React.createRef()
  }

  state = {
    searchText:'',
    
  }

//--------------------------------------------------------------------------------

handleTextChange = (value) => {
  
  this.setState({searchText:value})
}

//--------------------------------------------------------------------------------

handlePersonClick = (person) => {

  const {params} = this.props.route
  let idx =  params.taggedPeople.findIndex(taggedPerson => {return person.userid === taggedPerson.userid})

  if( idx > -1 )
  { 
    params.taggedPeople.splice ( idx,1 ) 
  }else{
    params.taggedPeople.push   ( person )
    
  }
  this.inputRef.current.clear()  
  this.setState({ searchText:'' })
    
}

//--------------------------------------------------------------------------------

itemIsTagged = ( userid ) =>{
  
  const {params} = this.props.route

  let test = params.taggedPeople.findIndex(person => {return person.userid === userid})
  return (test !== -1)

}

//--------------------------------------------------------------------------------

filterPeopleList = () => {

  let stxt      = this.state.searchText
  let allPeeps  = this.props.route.params.allPeople
 
  if(this.state.searchText !== '' ){
    return allPeeps.filter((p)=>{ 
      return( p.firstname.includes(stxt) || p.lastname.includes(stxt))})
  }else{
    return allPeeps
  }
  
}

//--------------------------------------------------------------------------------

renderItem = ({ item  }) => (
  
  <PersonListItem 
    key     = { item.userid }
    tagged  = { this.itemIsTagged(item.userid) }
    onPress = { this.handlePersonClick }
    person  = { item }
  />
);

//--------------------------------------------------------------------------------

goBack =() =>{
  console.log('searchPeople : goBack ' + this.state.taggedPeople);
  this.props.navigation.navigate('NewPost',{
    taggedPeople: this.state.taggedPeople
  });
}
//--------------------------------------------------------------------------------

render(){

  return(
    <View style={styles.container}>

      <View  style={styles.searchArea}>
        <Input 
          ref = {this.inputRef}
          style={styles.searchfield} 
          placeholder= 'Search..'
          placeholderTextColor = 'grey'
          onChangeText={value => this.handleTextChange(value)}
        />
      </View>

      <View style={styles.listArea}>
        <FlatList   
          keyExtractor={item => item.userid}
          data = {this.filterPeopleList()}
          renderItem  = { this.renderItem }
        />
      </View>

      <View style={styles.buttonArea}>                    
        <BackButton onPress={ this.goBack} />
      </View>
          
        
    </View>    
  )
}

}

export default SearchPeople;

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
    searchfield: {
      marginTop: 5,
      marginBottom: 2,
      marginLeft: 2,
      marginRight: 2,
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 8,
      backgroundColor: 'white',
      fontSize: 18,
      borderWidth: 1,
      borderRadius: 5,
      borderColor: 'gray',
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
