import React, { Component } from 'react';

import { 
    StyleSheet,
    View,    
    FlatList,    
  } from 'react-native';

import { BackButton,CloudListItem,SubTag} from './buttons'
import { showMessage, hideMessage} from 'react-native-flash-message';


class SearchClouds extends Component{
  constructor(props){
    super(props)
    this.inputRef = React.createRef()
  }

  state = {
    tagged:[],
  }


componentDidMount =() =>{
  this.setState({tagged:this.props.taggedClouds})
}

//--------------------------------------------------------------------------------

handleCloudClick = (cloud) => {

  console.log(cloud.id === 0);
  if(cloud.id === 0 ){
    showMessage({
      message: `Personal cloud is protected`,
      type: 'success',
      autoHide:true,
      duration:1000,    
      floating: true,
      })   

  }else{
    let route = this.props.route
    
    let tmp = route ? route.params.taggedClouds : this.props.taggedClouds
    let idx =  tmp.findIndex(taggedCloud => {return cloud.id === taggedCloud.id})

    if( idx > -1 )
    { 
      tmp.splice ( idx , 1 ) 
    }else{
      tmp.push   ( cloud )
    }
    

    this.setState({ tagged:tmp})
    if ( route ) route.params.updateClouds(tmp)
    else this.props.updateClouds(tmp)
  }
  
}

//--------------------------------------------------------------------------------

itemIsTagged = ( cloudid ) =>{
  
  if (cloudid === 0)
  return true
  else {
    let test = this.state.tagged.findIndex( cloud => { return (cloud.id === cloudid )})
  return (test !== -1)
  }
  
}

//--------------------------------------------------------------------------------

renderItem = ({ item  }) => (
  
  <CloudListItem 
    key     = { item.id }
    tagged  = { this.itemIsTagged(item.id) }
    onPress = { this.handleCloudClick }
    cloud  = { item }
  />
);

//--------------------------------------------------------------------------------

goBack =() =>{
  if(this.props.route){
    this.props.navigation.navigate('NewPost',{
      taggedClouds: this.state.taggedClouds
    });
  }else{
    this.props.close()
  }
  
}
//--------------------------------------------------------------------------------

render(){
  
  let toppadding = this.props.route ? 0 : toppadding = 50

  let clouds = this.props.route ? this.props.route.params.allClouds : this.props.allClouds
  
  return(
    <View style       = {[styles.container,{paddingTop:toppadding}]}>

      <View style     = {styles.listArea}>
        <FlatList   
          keyExtractor= { item => item.id}
          data        = { clouds }
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

export default SearchClouds;

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
