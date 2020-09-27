import React, {Component} from 'react';
import {SwitchIcon} from './buttons';
import VideoPlayer from './videoplayer';
import Carousel from 'react-native-snap-carousel';
import * as mem from './datapass';
import ImageViewer from 'react-native-image-zoom-viewer';
import ReactAudioPlayer from 'react-audio-player';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';

class MemoryCard extends Component {
  constructor(props) {
    super(props);
    this.handleOnExpand.bind(this);
    this.handleOnLike.bind(this);
    this.renderFileView.bind(this);
  }

  state = {
    storyVisible: false,
    files: [],
    people: [],
    activeIndex: 0,
    scrollable: true,
    modalVisible: false,
    activeImage: {},
  };
  //------------------------------------------------------------------------------------------------

  componentDidUpdate(prevProps, prevState) {
    let memory = this.props.memory;
    if (prevProps.memory.memid !== this.props.memory.memid) {
      mem.getMemoryFiles(memory.memid, (memfiles) => {
        this.setState({files: memfiles});
      });
      // getMemoryPeople ( this.props.memory.memid, (people  ) =>{ this.setState({ people:people  })})
    }
  }

  //------------------------------------------------------------------------------------------------

  async componentDidMount() {
    let memory = this.props.memory;

    mem.getMemoryFiles(memory.memid, (memfiles) => {
      this.setState({files: memfiles});
    });
    // getMemoryPeople ( this.props.memory.memid, (people  ) =>{ this.setState({ people:people  })})
  }

  //------------------------------------------------------------------------------------------------

  handleOnShare = () => {
    console.log('MemoryCard : handleOnShare ');
  };

  //----------------------------------------------------------------

  handleOnLike = () => {
    console.log('MemoryCard : handleOnLike ');
  };

  //----------------------------------------------------------------

  handleOnComment = () => {
    console.log('MemoryCard : handleOnComment ');
  };

  //----------------------------------------------------------------

  handleOnExpand = () => {
    let newval = !this.state.storyVisible;
    this.setState({storyVisible: newval});
  };

  //----------------------------------------------------------------

  getLower = () => {
    if (this.state.storyVisible) {
      return (
        <View style={styles.storyarea}>
          <Text style={styles.titleText}> {this.props.memory.title} </Text>
          <Text style={styles.italicText}>{this.props.memory.description}</Text>
          <Text style={styles.bodyText}> {this.props.memory.story}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.titleblock}>
          <Text style={styles.titleText}> {this.props.memory.title} </Text>
          <Text style={styles.bodyText}> {this.props.memory.description} </Text>
        </View>
      );
    }
  };
  showModel = (item) => {
    if (mem.isSupportedImageFile(mem.getFilename(item.fileurl))) {
      // StatusBar.setHidden(true);
      this.setState({modalVisible: true, activeImage: item});
    } else if (mem.isSupportedVideoFile(mem.getFilename(item.fileurl))) {
      return <VideoPlayer poster={item.thumburl} source={item.thumburl} />;
    } else if (mem.isSupportedAudioFile(mem.getFilename(item.fileurl))) {
      return <VideoPlayer poster={item.fileurl} source={item.fileurl} />;
    }
  };

  //----------------------------------------------------------------

  getCarousel = () => {
    const {width} = Dimensions.get('window');

    return (
      <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
        <Carousel
          layout={'tinder'}
          ref={(ref) => (this.carousel = ref)}
          data={this.state.files}
          sliderWidth={width}
          itemWidth={width}
          renderItem={this.renderFileView}
          onSnapToItem={(index) => this.setState({activeIndex: index})}
          scrollEnabled={this.state.scrollable}
        />
      </View>
    );
  };

  //----------------------------------------------------------------

  renderFileView = ({item, index}) => {
    console.log(
      'audio url :',
      mem.isSupportedAudioFile(mem.getFilename(item.fileurl))
        ? item.fileurl
        : '',
    );
    if (mem.isSupportedImageFile(mem.getFilename(item.fileurl))) {
      return (
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            this.showModel(item);
          }}>
          <Image style={styles.image} source={{uri: item.thumburl}} />
        </TouchableOpacity>
      );
    } else if (mem.isSupportedVideoFile(mem.getFilename(item.fileurl))) {
      return <VideoPlayer poster={item.thumburl} source={item.thumburl} />;
    } else if (mem.isSupportedAudioFile(mem.getFilename(item.fileurl))) {
      return (
        <VideoPlayer poster={item.fileurl} source={item.fileurl} />
        // <ReactAudioPlayer src={item.fileurl} autoPlay={false} controls={true} />
      );
    }
  };

  //----------------------------------------------------------------
  render() {
    let lower = this.getLower();
    let fileview = this.getCarousel();

    return (
      <View style={styles.card}>
        {fileview}
        <View style={styles.iconrow}>
          <View style={styles.iconrow}>
            <SwitchIcon // Like heart
              onPress={this.handleOnLike}
              upImage={require('./images/heart_blue.png')}
              downImage={require('./images/heart_red.png')}
            />

            <SwitchIcon // Share icon
              onPress={this.handleOnShare}
              upImage={require('./images/share_green.png')}
              downImage={require('./images/share_green.png')}
            />

            <SwitchIcon // Comment icon
              onPress={this.handleOnComment}
              upImage={require('./images/comment_purple.png')}
              downImage={require('./images/comment_purple.png')}
            />
          </View>
          <View style={styles.iconrow} />
          <View style={styles.iconrow}>
            <SwitchIcon // Story expand icon
              onPress={this.handleOnExpand}
              upImage={require('./images/chevron_down_purple.png')}
              downImage={require('./images/chevron_up_purple.png')}
            />
          </View>
        </View>

        {lower}
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({modalVisible: false});
          }}>
          <Text
            style={styles.backButton}
            onPress={() => {
              this.setState({modalVisible: !this.state.modalVisible});
            }}>
            <Image
              source={require('./images/back.png')}
              style={styles.backButtonImage}
            />
          </Text>

          <ImageViewer
            imageUrls={[{url: this.state.activeImage.thumburl}]}
            style={styles.imageFull}
            renderHeader={() => {}}
            renderIndicator={() => {}}
          />
        </Modal>
      </View>
    );
  }
}

//------------------------------------------------------------------------------------

const styles = StyleSheet.create({
  titleblock: {
    marginLeft: 8,
  },

  storyarea: {
    marginLeft: 40,
    marginRight: 40,
    marginBottom: 20,
  },

  iconrow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginLeft: 4,
    marginRight: 4,
  },

  card: {
    width: '100%',
    margin: 0,
    backgroundColor: 'white',
  },
  image: {
    height: 300,
    resizeMode: 'cover',
  },
  imageFull: {width: '100%', height: '100%', zIndex: -1},
  absText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  backButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    height: 100,
  },
  backButtonImage: {
    width: 35,
    height: 35,
  },
  close: {
    margin: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    width: 25,
    height: 25,
    color: 'tomato',
  },

  titleText: {
    color: 'black',
    marginTop: 5,
    marginBottom: 5,
    fontSize: 20,
    fontWeight: 'bold',
  },
  bodyText: {
    color: 'black',
    fontSize: 15,
    marginBottom: 10,
  },

  italicText: {
    color: 'black',
    fontSize: 15,
    marginBottom: 10,
    fontStyle: 'italic',
  },
});

export default MemoryCard;
