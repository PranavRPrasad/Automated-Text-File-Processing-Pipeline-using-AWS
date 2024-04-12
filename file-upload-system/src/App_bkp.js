import './App.css';
import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {
  state = {
    selectedFile: null,
    fileUploadedSuccessfully: false,
  }

  onFileChange = event => {
    this.setState({selectedFile: event.target.files[0]})
  }

  onFileUpload = () => {
    const formData = new FormData();
    formData.append(
      "demo file",
      this.state.selectedFile,
      this.state.selectedFile.name,
    )

    axios.post("https://i1uol4zetg.execute-api.us-west-1.amazonaws.com/prod/file-upload", formData).then(() => {
      this.setState({selectedFile: null})
      this.setState({fileUploadedSuccessfully: true})
    })
  }

  fileData = () => {
    if (this.state.selectedFile) {
      return (
      <div>
        <h2>File Details:</h2>
        <p>File Name: {this.state.selectedFile.name}</p>
      </div>
      )
    }
    else if (this.state.fileUploadedSuccessfully) {
      return (
        <div>
          <br />
          <h4>Your file has been successfully uploaded</h4>
        </div>
      )
    }
    else {
      <div>
          <br />
          <h4>Choose a file and then press the Submit button</h4>
        </div>
    }
  }

  render() {
    return (
      <div className='container'>
        <label>Text input: <input type='text' /></label>
        <br /><br />
        <div>
          <label>File input: <input type='file' onChange={this.onFileChange} /></label>
          <br /><br />
          <button onClick={this.onFileUpload}>
            Submit
          </button>
        </div>
        {this.fileData()}
      </div>
    )
  }
}

export default App;
