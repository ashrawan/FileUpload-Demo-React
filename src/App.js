import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import FileUploadTest from './FileUploadTest';

axios.defaults.baseURL = 'https://sbfileupload.herokuapp.com/';
// axios.defaults.baseURL = 'http://127.0.0.1:8080/';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      image: ""
    }
  }


  onFileUpload = (fileName) => {
    console.log("fileName ", fileName)
    this.setState({ image: fileName })
  }

  render() {
    return (
      <div>
        <h3 className="text-center mt-1">Files are uploaded only temporarily</h3>
        <p className="text-center text-danger mt-2">Select or Upload File</p>
        <div className="container mx-auto mt-3">
          <FileUploadTest selectedFile={(result) => {
            this.onFileUpload(result.file.fileName);
          }} />

          {this.state.image ?
          <div className="alert alert-primary mt-2" role="alert">
          <span className="font-weight-bold text-info">
            File Successfully Selected: {this.state.image}
          </span>
          </div>: ""}
          
        </div>
      </div>
    );
  }
}

export default App;
