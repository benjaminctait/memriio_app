import React from 'react' ;
import { View, Image, Dimensions, TouchableHighlightBase} from 'react-native';
import RNFS from 'react-native-fs'
import ImageZoom from 'react-native-image-pan-zoom'

let shorthash = require("shorthash");

class CacheImage extends React.Component {
  state = { 
    source:null, 
   
  }
  //----------------------------------------------------------------

  loadFile = ( path )=> {
        this.setState({ source:{uri:path}}) ;
      }
  
  //----------------------------------------------------------------
  downloadFile = (uri,path) => {
  
    RNFS.downloadFile({fromUrl:uri, toFile: path}).promise
        .then(res =>this.loadFile(path));
  }
  
  //----------------------------------------------------------------

  componentDidMount(){
    const { uri,filename } = this.props ; 
    
    const name = shorthash.unique(filename);
    const extension = (Platform.OS === 'android') ? 'file://' : '' 
    const path =`${extension}${RNFS.CachesDirectoryPath}/${name}.png`;
    RNFS.exists(path).then( exists => {
          if(exists)this.loadFile(path) ;
          else this.downloadFile(uri,path) ;
        })
   }
   
   //----------------------------------------------------------------

   render(){
     return(
       <Image style={this.props.style} source={this.state.source} />
     );
    }

    //----------------------------------------------------------------
}


  class CachedZoomableImage extends React.Component {
    state = { source:null, imageWidth:0, imageHeight:0 }

    loadFile = ( path )=> {
      Image.getSize(path, (width, height) => {
        this.setState({ source:{uri:path}, imageHeight:height, imageWidth:width})
      })
    }

    //----------------------------------------------------------------
    downloadFile = (uri,path) => {

      RNFS.downloadFile({fromUrl:uri, toFile: path}).promise
          .then(res =>this.loadFile(path));
    }

    //----------------------------------------------------------------

    componentDidMount(){
      const { uri,filename } = this.props ; 
      
      const name = shorthash.unique(filename);
      const extension = (Platform.OS === 'android') ? 'file://' : '' 
      const path =`${extension}${RNFS.CachesDirectoryPath}/${name}.png`;
      RNFS.exists(path).then( exists => {
            if(exists)this.loadFile(path) ;
            else this.downloadFile(uri,path) ;
          })
    }
    //----------------------------------------------------------------
    render(){
      
      let windowWidth = Dimensions.get('window').width
      let windowHeight = Dimensions.get('window').height
      let wratio  = this.state.imageWidth / windowWidth
      let hratio  = this.state.imageHeight / windowHeight
      let aspectRatio = 1
      
      if(this.state.source){
        if( wratio > hratio )  aspectRatio = wratio 
       else aspectRatio = hratio
      }
       
      
      return(
      <ImageZoom 
          cropWidth   = { windowWidth  }
          cropHeight  = { windowHeight }
          imageWidth  = { this.state.imageWidth / aspectRatio } 
          imageHeight = { this.state.imageHeight / aspectRatio }
          panToMove   = { true         }
          pinchToZoom = { true         }
          >
        <Image style={this.props.style} source={this.state.source} />
      </ImageZoom>
      )
    
    }

    //----------------------------------------------------------------
  }

  class ZoomableImage extends React.Component {
    state = { imageWidth:0, imageHeight:0 }

    loadFile = ( path )=> {
      Image.getSize(path, (width, height) => {
        this.setState({ source:{uri:path}, imageHeight:height, imageWidth:width})
      })
    }

    //----------------------------------------------------------------

    componentDidMount(){
      const { localPath } = this.props ; 
      RNFS.exists(localPath).then( exists => {
            if(exists)this.loadFile(localPath) 
            })
    }
    //----------------------------------------------------------------
    render(){
      
      let windowWidth = Dimensions.get('window').width
      let windowHeight = Dimensions.get('window').height
      let wratio  = this.state.imageWidth / windowWidth
      let hratio  = this.state.imageHeight / windowHeight
      let aspectRatio = 1
      
      if(this.state.source){
        if( wratio > hratio )  aspectRatio = wratio 
       else aspectRatio = hratio
      }
       
      
      return(
      <ImageZoom 
          cropWidth   = { windowWidth  }
          cropHeight  = { windowHeight }
          imageWidth  = { this.state.imageWidth / aspectRatio } 
          imageHeight = { this.state.imageHeight / aspectRatio }
          panToMove   = { true         }
          pinchToZoom = { true         }
          >
        <Image style={this.props.style} source={this.state.source} />
      </ImageZoom>
      )
    
    }

    //----------------------------------------------------------------
  }

export  {CacheImage,CachedZoomableImage,ZoomableImage} ;
