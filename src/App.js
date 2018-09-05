import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import FileUploadTest from './components/FileUploadTest';
import Navigation from './components/Navigation';

axios.defaults.baseURL = 'https://sbfileupload.herokuapp.com/';
// axios.defaults.baseURL = 'http://127.0.0.1:8080/';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      image: "",
      serverStarted: false
    }
  }

  checkServerStatus() {
    let self = this;
    axios.get("serverStatus")
      .then(function (response) {
        if (response.data === true) {
          self.setState({ serverStarted: true })
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  componentDidMount() {
    this.checkServerStatus();
  }


  onFileUpload = (fileName) => {
    // console.log("fileName ", fileName)
    this.setState({ image: fileName })
  }

  render() {
    return (
      <div>

        <Navigation />

        {!this.state.serverStarted ?
          <div className="fa-2x text-center">
            <FontAwesomeIcon icon="spinner" pulse />
            <span> Waiting for server to Come Online ...</span>
          </div> : ""}

        <h3 className="text-center mt-4">Files are uploaded only temporarily</h3>
        <p className="text-center text-danger mt-2">Select or Upload File</p>
        <div className="container mx-auto mt-3">
          <FileUploadTest selectedFile={(result) => {
            this.onFileUpload(result.file.fileName);
          }} />

          {this.state.image ?
            <div>
              <div className="alert alert-primary mt-2" role="alert">
                <span className="font-weight-bold text-info">
                  File Successfully Selected: {this.state.image}
                </span>
              </div> 
              <div className="text-center"> <img className="image-preview" src={"https://sbfileupload.herokuapp.com/downloadFile/" + this.state.image} /></div>
            </div> : ""}

        </div>
      </div>
    );
  }
}

export default App;
