import React from 'react' ;
import { View, Image } from 'react-native';
import RNFS from 'react-native-fs'
import ImageViewer from 'react-native-image-zoom-viewer';
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

//----------------------------------------------------------------
//----------------------------------------------------------------

  class CachedZoomableImage extends React.Component {
    state = { source:null, local:false }
    
    loadFile = ( path )=> {
      console.log('loadFile : ',path);
        this.setState({ source:path,local:true }) ;
      }
    
    //----------------------------------------------------------------
    downloadFile = (uri,path) => {
      console.log('downloadFile : ',uri,path);
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
       console.log(this.state.source);
       let source = {url: this.props.uri}
       
      //  if (this.state.local){
          
      //     source = {
      //       url: '',
      //       props: {
      //           source: {uri:this.state.source}
      //       }
      //    }
      //  }

       return(
         <ImageViewer
            imageUrls       = { [source] }
            style           = { this.props.style}
            renderHeader    = { () => {}}
            renderIndicator = { () => {}}
          />
       );
      }

      //----------------------------------------------------------------
  }

  export  {CacheImage,CachedZoomableImage} ;
