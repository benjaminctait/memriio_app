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
import {TouchableOpacity,TouchableHighlight} from 'react-native-gesture-handler'


let THUMBNAIL_WIDTH = 180
let TEXT_HEIGHT = 20
const window = Dimensions.get('window');


const testdata = {
  0: {
    filepath: 'https://placekitten.com/200/240',
    text: 'Chloe',
    originalIndex:0,
    isAudio:'',
    thumbnail:''
  },
  1: {
    filepath: 'https://placekitten.com/200/201',
    text: 'Jasper',
    originalIndex:0,
    isAudio:'',
    thumbnail:''
  },
  2: {
    filepath: 'https://placekitten.com/200/202',
    text: 'Pepper',
    originalIndex:0,
    isAudio:'',
    thumbnail:''
  },
  3: {
    filepath: 'https://placekitten.com/200/203',
    text: 'Oscar',
    originalIndex:0,
    isAudio:'',
    thumbnail:''
  },
};

export default class HorizontalSortableList extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <SortableList
          horizontal
          style={styles.list}
          contentContainerStyle={styles.contentContainer}
          data={testdata} // Mahummad - change 'testdata' to 'this.props.data'  - why does test data work but this.props.data does not - if you log them they are structurally identical
                          // see line 486 in newpost to see how i build the props.data object - i must be doing something wrong ?
          renderRow={this._renderRow} 
          onPressRow = {this.test}
          />
          git s
      </View>
    );
  }

  test = (e) =>{
    if(!this.props.active){
      console.log('press ',e);
    }
    
  }

  _renderRow = ({data, active}) => {
    return <Row data={data} active={active} />
  }
}

class Row extends React.Component {

  constructor(props) {
    super(props);

    this._active = new Animated.Value(0);

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
