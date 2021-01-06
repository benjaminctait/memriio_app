import React from 'react';

import DraggableFlatList from 'react-native-draggable-flatlist'
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  StyleSheet,
  Image,
  View,
  Text,
} from 'react-native';

import {TouchableOpacity} from 'react-native-gesture-handler'


let THUMBNAIL_WIDTH = 180



class ThumbList extends React.Component {
  

  state = {
    data: []
  };

  componentDidMount = () =>{
    
    this.setState(this.setStateFunction)
  }
  
  setStateFunction = (state, props) => {
    const newState = {...state, data: props.data};
    return newState;
  }
  
  handleOnDelete =(index) =>{
    console.log('on delete ', index);
    this.props.handleDeletePress(index)
  }

  renderItem = ({ item, index, drag, isActive }) => {
    let st = isActive ? styles.activeThumb : styles.thumb
    let im = isActive ? styles.activeImage : styles.image
    
    const videoIndicator = (item.type===1) ? <Icon name={'videocam'} size={30} style={styles.videoIndicator} /> : null;
                            
    return (
      <View>
        <TouchableOpacity 
        style         = { st }
        activeOpacity = { 0.7 }
        onLongPress   = { drag }
        onPress       = { () => this.props.handleThumbPress(item.id) }
        zIndex        = { 0 }
        >
          
          <Image 
            source  = { {uri: item.thumbnail} } 
            style   = { styles.image }
          />
          
          {videoIndicator}
          
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>this.handleOnDelete(item.id)} >
          <Icon name={'delete-forever'} style={styles.buttoncircle} size={30}  />
        </TouchableOpacity>
      </View>
      
    );
  }

  handleDragEnd = (newdata) => {
    this.setState({data:newdata})
  }

  render() {
    return (
      <View style={{ flex: 1, paddingTop:5 }}>
        <DraggableFlatList
          data          = { this.state.data}
          horizontal
          renderItem    = { this.renderItem}
          keyExtractor  = { (item, index) => `LI-${item.id}`}
          onDragEnd     = {  data  => this.handleDragEnd(data.data)}
        />
      </View>
    );
  }
}

export default ThumbList;

const styles = StyleSheet.create({

  thumb: {
    flexDirection    : 'column',
    alignItems       : 'center',
    backgroundColor  : '#fff',    
    width            : THUMBNAIL_WIDTH,
    height           : THUMBNAIL_WIDTH,
    marginHorizontal : 5,
    
    borderRadius     : 4,

    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 1,
        shadowOffset: {height: 2, width: 2},
        shadowRadius: 2,
      },

      android: {
        elevation: 0,
        marginHorizontal: 30,
      },
    })
  },
  
  activeThumb:{
      position         : 'relative',
      flexDirection    : 'column',
      alignItems       : 'center',
      width            : ( THUMBNAIL_WIDTH + 8 ),
      height           : ( THUMBNAIL_WIDTH + 8 ),
      marginHorizontal : 2,
      borderRadius     : 4,
      // borderColor      : 'blue',
      // borderWidth      : 4,
  
      ...Platform.select({
        ios: {
          shadowColor: 'rgba(0,0,0,0.2)',
          shadowOpacity: 0.8,
          shadowOffset: {height: 5, width: 5},
          shadowRadius: 2,
          
        },
  
        android: {
          elevation: 0,
          marginHorizontal: 30,
        },
      })
  },

  image: {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_WIDTH,   
    borderRadius: 4,
  },

  activeImage: {
    width: THUMBNAIL_WIDTH ,
    height: THUMBNAIL_WIDTH ,   
    borderRadius: 4,
  },

  videoIndicator: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'transparent',
    color: 'white'
  },
  
  buttoncircle:{
    position: 'relative',
    width: 34,
    height: 34,
    borderRadius: 34/2,
    borderColor: '#ff9966',
    zIndex:1,
    borderWidth: 1,
    bottom: 10,
    left: (THUMBNAIL_WIDTH-30),
    backgroundColor:'#ff9966',
    overflow:'hidden',
    
  },  
  deleteIcon: {
    position: 'relative',
    color: 'white'
  },
  
})
