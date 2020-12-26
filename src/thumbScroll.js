import React from 'react';
import Video from 'react-native-video';
import SortableList from 'react-native-sortable-list';

import {
  Animated,
  Easing,
  StyleSheet,
  Image,
  View,
  Dimensions,
  Platform,  
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler'


let THUMBNAIL_WIDTH = 180
let TEXT_HEIGHT = 20
const window = Dimensions.get('window');


export default class HorizontalSortableList extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <SortableList
          horizontal
          style={styles.list}
          contentContainerStyle={styles.contentContainer}
          data={this.props.data} 
          renderRow={this.renderRow} 
          onPressRow = {this.onThumbPress}
          onChangeOrder = {this.handleChangeOrder}
          />
         
      </View>
    );
  }

  // ---------------------------------------------------------------------------------

  onThumbPress = (e) =>{
    if(!this.props.active){
      this.props.onPress(this.props.data[e])
    }
  }

  // ---------------------------------------------------------------------------------

  handleChangeOrder = (next) =>{
    if(!this.props.active){
      this.props.handleFileOrderChange( next )
    }
  }

  // ---------------------------------------------------------------------------------

  renderRow = ({data, active}) => {
    
    return <Row data={data} active={active} />
  }
}

// ---------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------

class Row extends React.Component {

  constructor(props) {
    super(props);

    this._active = new Animated.Value(0);
    this._active.useNativeDriver = true

    this._style = {
      ...Platform.select({
        ios: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          }],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.07],
            }),
          }],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      })
    };
  }

  // ---------------------------------------------------------------------------------

  componentDidUpdate ( prevProps ) {
    if (this.props.active !== prevProps.active) {

      console.log('anim start');
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(this.props.active),
        useNativeDriver:true,
      }).start();
    }
  }
  
  // ---------------------------------------------------------------------------------

  render() {
   const {data, active} = this.props;

    return (
      <TouchableOpacity activeOpacity={0.7}>
          <Animated.View style={[
            styles.row,
            this._style,
          ]}
          useNativeDriver={true}
          >
          
              <View>
                <Image 
                source={{uri: data.filepath}} 
                style={styles.image} 
                />
              </View>
            
          </Animated.View>
        </TouchableOpacity>
      
    );
  }
}

//---------------------------------------------------------------


const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: '#eee',

    ...Platform.select({
      ios: {
        paddingTop: 0,
      },
    }),
  },


  list: {
    height: (THUMBNAIL_WIDTH + ( TEXT_HEIGHT * 2 ) ),
    width: window.width,
  },

  contentContainer: {
    ...Platform.select({
      ios: {
        paddingVertical: 10,
      },

      android: {
        paddingVertical: 0,
      }
    })
  },

  row: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',    
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_WIDTH,
    marginHorizontal: 5,
    borderRadius: 4,

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

  image: {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_WIDTH,   
    borderRadius: 4,
  },

  

  text: {
    fontSize: 18,
    color: '#222222',
  },
});
