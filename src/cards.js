import React, {Component} from 'react';
import {SwitchIcon} from './buttons';
import VideoPlayer from './videoplayer';
import Carousel  from 'react-native-snap-carousel';
import * as mem from './datapass';

import sliderStyles  from './styles/index.style';
import {CacheImage,CachedZoomableImage} from './cachedImage'

import { Avatar,Badge, Icon } from 'react-native-elements'
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  Modal,
  TouchableOpacity,
  
} from 'react-native';
import EditPost from './editpost';

let monthNames =["Jan","Feb","Mar","Apr",
"May","Jun","Jul","Aug",
"Sep", "Oct","Nov","Dec"];

class MemoryCard extends Component {
  constructor(props) {
    super(props);
    this.handleOnExpand.bind(this);
    this.handleOnLike.bind(this);
    this.renderFileView.bind(this);
  }

  state = {
    storyVisible      : false,
    files             : [],
    people            : [],
    activeIndex       : 0,
    scrollable        : true,
    modalVisible      : false,
    editModalVisible  : false,
    activeImage       : {},
    author            : {},
    currentStatusLevel: null,
    activeUser        : null,
    taggedClouds      : null,
    
  };
  //------------------------------------------------------------------------------------------------

  componentDidUpdate(prevProps, prevState) {
    let memory = this.props.memory;
    let mf = []
    let hero = null  
    

    if (prevProps.memory.memid !== this.props.memory.memid) {

      mem.getUserDetails(memory.userid).then(user => {
        this.setState({author:user})
        this.getUserStatus(user.userid,this.props.activeCloud).then(level =>{
          this.setState({currentStatusLevel:level})
        })        
      })

      mem.getMemoryFiles(memory.memid, (memfiles) => {
        memfiles.map(mfile=>{   // need to ensure the hero file is displayed first in the carousel 
          if(mfile.ishero){
            hero = mfile
          }else{
            mf.push(mfile)
          } 
        })      
        if (hero ) mf.push(hero)   // push the hero last - displayed first
        
        this.setState({files: mf});
      });
      // getMemoryPeople ( this.props.memory.memid, (people  ) =>{ this.setState({ people:people  })})
    }
  }

  //------------------------------------------------------------------------------------------------

  
  async componentDidMount() {
      let memory = this.props.memory;
      let mf = []
      let hero = null
      
      mem.getUserDetails(memory.userid).then(user => {
        this.setState({author:user})
        this.getUserStatus(user.userid,this.props.activeCloud).then(level =>{
          this.setState({currentStatusLevel:level})
        })        
      })

      mem.getActiveUser   (  ).then(user =>{ this.setState({activeUser:user})})
      mem.getMemoryClouds ( memory.memid).then(clouds =>{ this.setState({taggedClouds:clouds})})
      mem.getMemoryPeople ( this.props.memory.memid, (people  ) =>{ this.setState({ people:people  })})
      mem.getMemoryFiles  ( memory.memid, (memfiles) => {
      
      memfiles.map(mfile=>{   // need to ensure the hero file is displayed first in the carousel 
        if(mfile.ishero){
          hero = mfile
        }else{
          mf.push(mfile)
        } 
      })      
      if (hero) {  // push the hero last - displayed first
        mf.push(hero)                 
      }
      this.setState({files: mf});

    });

    
  }

  //------------------------------------------------------------------------------------------------

  getUserStatus = (userid,cloudid) => {
  
    let totalcredits = 0,
        currentLevel = ''
    
    return new Promise((resolve,reject ) =>{
      // In future user may wish to see points from a range of clouds - now hard wired to UAP cloud.id = 1
      mem.getPointsData(userid,cloudid).then(pointsData => {
        mem.getStatusLevels(cloudid).then(levels => {
    
          pointsData.map(record =>{
              totalcredits += record.statuscredits
          })  
          
          levels.map(level => {
              if(totalcredits >= level.reachvalue){
                currentLevel = level             
              }
          })
          resolve(currentLevel)        
        })
      })
      
    })
    
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

  //----------------------------------------------------------------

  showModal = (item) => {
   
      this.setState({modalVisible: true, activeImage: item});
    
  };

  //----------------------------------------------------------------

  getCarousel = () => {
    const {width} = Dimensions.get('window');

    return (
      <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
        <Carousel
          layout                = {'default'}
          ref                   = {(ref) => (this.carousel = ref)} 
          data                  = {this.state.files}
          sliderWidth           = {width}
          itemWidth             = {width}
          hasParallaxImages     = {false}
          firstItem             = {1}
          renderItem            = {this.renderFileView}
          onSnapToItem          = {(index) => this.setState({activeIndex: index})}
          scrollEnabled         = {this.state.scrollable}
          containerCustomStyle  = {sliderStyles.slider}
          contentContainerCustomStyle={sliderStyles.sliderContentContainer}
        />
        
      </View>
    );
  };

  //----------------------------------------------------------------

  renderFileView = ({item, index}) => {
    
    if( item ) {
      
      let fname = mem.getFilename(item.fileurl)
      
      if (mem.isSupportedImageFile(fname)) {
        return (
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => { this.showModal(item) }}>
            <CacheImage style={styles.image} uri={ item.thumburl} filename = { fname } />
          </TouchableOpacity>
        );
      } else if (mem.isSupportedVideoFile(fname)) {
        return (
          <View>
            <VideoPlayer
              poster={item.thumburl}
              source={item.displayurl ? item.displayurl : item.fileurl}
              hideFullScreenButton = { true} 
              hideBackButton       = { true }
              tapAnywhereToPause   = { true }
            />
            <TouchableOpacity
              activeOpacity={0.5}
              style   = {styles.expandToFullScreen}
              onPress={() => { this.showModal(item) }}>
              <Image
                source  = {require('./images/expand.png')}
                style   = {{width:'100%',height:'100%'} }
              />
            </TouchableOpacity>
          </View>
        );
      } else if (mem.isSupportedAudioFile(fname)) {
        return (
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              this.props.navigation.navigate('Audio', {
                title: this.props.memory.title,
                filepath: item.fileurl,
              });
            }}>
            
          </TouchableOpacity>
        );
      }
    }else{
      return null
    }
  };

  //----------------------------------------------------------------
  render() {
    let lower = this.getLower();
    let fileview = this.getCarousel();
    let initials = ''
    let authorLabel = null
    let badge = null
    let author = this.state.author
    let d = new Date(this.props.memory.createdon)
  
    if(author){
      if ( author.firstname) { initials += author.firstname[0] }
      if ( author.lastname ) { initials += author.lastname[0]  }
      if ( initials ){
        authorLabel = <Text style={styles.authorText } >{author.firstname + ' ' + author.lastname}</Text>
      }
    }

    if(this.state.currentStatusLevel) {
      badge = 
      <Badge
            badgeStyle  = {[ styles.statusBadge, {backgroundColor:this.state.currentStatusLevel.statuscolor }]}
            value       = {this.state.currentStatusLevel.statusname[0]}
      />
    }

        
    return (
      <View style={styles.card}>
        <View style={styles.author}>
          <Avatar
            size="small"
            rounded
            title={initials}
            overlayContainerStyle={{backgroundColor:this.state.author.avatar}}
            onPress={() => console.log('Author avatar pressed ',author.userid, author.firstname,author.lastname)}
            activeOpacity={0.7}
          />
          {badge}
          {authorLabel}
        </View>
        <View style = {styles.location}>
          <Image
              source={require('./images/globe.png')}
              style={styles.locationImage}
            />
          <Text style={styles.locationText } >{this.props.memory.location}</Text>          
        </View>
        <View style = {styles.dateTag}>
          <Image
              source={require('./images/calendar.png')}
              style={styles.locationImage}
            />          
          <Text style={styles.locationText } >{monthNames[d.getMonth()] + ' ' + d.getFullYear()}</Text>
        </View>
        
        {fileview}
        
        <View style={styles.iconrow}>
          <View style={styles.iconrow}>
            <SwitchIcon // Like heart
              onPress   ={this.handleOnLike}
              upImage   ={require('./images/heart_blue.png')}
              downImage ={require('./images/heart_red.png')}
            />

            <SwitchIcon // Share icon
              onPress   ={this.handleOnShare}
              upImage   ={require('./images/star.png')}
              downImage ={require('./images/star.png')}
            />

            <SwitchIcon // Comment icon
              onPress   ={this.handleOnComment}
              upImage   ={require('./images/comment_purple.png')}
              downImage ={require('./images/comment_purple.png')}
            />

          </View>
          <View style={styles.iconrow} />
            <View style={styles.iconrow}>
              <SwitchIcon // Story expand icon
                onPress   ={this.handleOnExpand}
                upImage   ={require('./images/chevron_down_purple.png')}
                downImage ={require('./images/chevron_up_purple.png')}
              />
              { this.renderEditButton() }
              
            </View>
            
        </View>

        {lower}
        { this.renderModal() }
        { this.renderEditMemoryModal() }
      </View>
    );
  }

  // ---------------------------------------------------------------------------------
  
  renderEditButton =() =>{
    
    if(this.props.memory && this.state.activeUser){
      
      if(this.props.memory.userid == this.state.activeUser.userid ){
        return  <TouchableOpacity onPress={ () => this.setState({editModalVisible:true}) }>
                  <Text style={styles.PostButton} >{'Edit'} </Text>
                </TouchableOpacity>
      }else{
        return null
      }
    }else{
      return null
    }
  }

  
  //------------------------------------------------------------------------------------
  
  renderEditMemoryModal = () => {
     if(this.state.editModalVisible) {
       
      let memory = {
        memid         : this.props.memory.memid,
        title         : this.props.memory.title,
        story         : this.props.memory.story,    
        description   : this.props.memory.description,
        taggedPeople  : this.state.people,
        location      : this.props.memory.location,
        files         : this.state.files,
        taggedClouds  : this.state.taggedClouds,
        userid        : this.props.memory.userid,
      }

      return (
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.editModalVisible}
          
          >
          <EditPost 
            capturedFiles = { null }
            memory        = { memory }
            close         = {() => {this.setState({editModalVisible: false})}}
          />  
        </Modal>
        

        
      )
    }else{
      return null
    }
    
  }

  //------------------------------------------------------------------------------------

  renderModal = () => {
    if(this.state.activeImage.thumburl){
      
     
      let content = null
      if (mem.isSupportedImageFile(this.state.activeImage.fileext)) {
        content =  <View>
                      <CachedZoomableImage 
                        style     = { styles.imageFull}
                        uri       = { this.state.activeImage.thumburl}
                        filename  = { mem.getFilename(this.state.activeImage.thumburl) }
                      />
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
                    </View>
      } else if (mem.isSupportedVideoFile(this.state.activeImage.fileext)) {
        content = <VideoPlayer
                    poster          = {this.state.activeImage.thumburl}
                    source          = {this.state.activeImage.displayurl ? this.state.activeImage.displayurl : this.state.activeImage.fileurl}
                    style           = {{height:"100%"}}
                    resizeMode      = 'cover'                     
                    tapAnywhereToPause   = { true }
                    onBack          = {() => { this.setState({modalVisible: !this.state.modalVisible})}}
                  /> 
        }

      return (
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({modalVisible: false});
          }}>
          { content }
          
        </Modal>
      )
    }else{
      return null
    }
    
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
  author:{
    flex: 1,
    flexDirection: 'row',
    position:'absolute',
    left:8,
    top:30,
    zIndex:2
  },
  PostButton:{
    borderWidth:1,
    borderRadius:8,
    borderColor:'#1E90FF',    
    color:'black',
    padding:2,
    paddingLeft:6,
    marginTop:4,
    backgroundColor:'white',
    overflow:'hidden',
  },

  location:{
    flex: 1,
    flexDirection: 'row',
    position:'absolute',
    top: 312,
    left:0,
    zIndex:2
  },

  dateTag:{
    flex: 1,
    flexDirection: 'row',
    position:'absolute',
    top: 312,
    right:5,
    zIndex:2
  },

  locationText: {
    color: 'black',
    marginTop: 8,
    marginBottom: 5,
    marginLeft:12,
    fontSize: 12,
    borderColor:'darkgray',
    borderWidth:1,
    borderRadius:8,
    padding:1,
    paddingLeft:4,
    paddingRight:4,
    backgroundColor:'whitesmoke',
    overflow:'hidden',
    
  },
 
  statusBadge:{ 
    position: 'absolute', 
    top: -4, 
    left: -10 ,
    
  },

  iconrow: {
    flex:1,
    flexDirection:'row',
    justifyContent: 'space-between',
    marginTop: 5,
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
    resizeMode:'cover'
  },
  imageFull: {
      
      height: '100%', 
      zIndex: -1,
      resizeMode:'cover'
      
  },
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

  locationImage: {
    top:8,
    left:8,
    width: 20,
    height: 20,
    
  },

  expandToFullScreen:{
    position:'absolute',
    top:20,
    right:20,
    width: 30,
    height: 30,
    
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

  authorText: {
    color: 'black',
    marginTop: 8,
    marginBottom: 5,
    marginLeft:8,
    fontSize: 12,
    borderColor:'white',
    borderWidth:1,
    borderRadius:8,
    padding:2,
    backgroundColor:'whitesmoke',
    overflow:'hidden',
    
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