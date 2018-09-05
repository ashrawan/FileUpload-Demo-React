import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import ImageCompressor from 'image-compressor.js';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Progress } from 'reactstrap';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTrashAlt, faFileAlt } from '@fortawesome/fontawesome-free-solid';

// const imageUrlServer = "http://127.0.0.1:8080/downloadFile/";
const imageUrlServer = "https://sbfileupload.herokuapp.com/downloadFile/";

class FileUploadTest extends Component {

    constructor(props) {
        super(props)
        this.state = {
            files: [],                  // Files from dropzone
            fileSelected: false,        // true as soon as file is selected
            modal: false,               // Toggle Modal       
            uploadProgress: 0,          // Upload Progess of file to the server
            selectedFileResponse: '',   // File Response from the server
            uploadClicked: true,        // if upload clicked than, user upload from their machine
            selectClicked: false,       // loads file from the server
            jsonServerFiles: '',        // json data returned from the server
            reduceFile: '',            // image file after reduction

            serverSelectedFile: '',
            setFileEmpty: false,

            fileShowUrl: imageUrlServer,

            currentPage: 1,
            imagesPerPage: 12,

            user: props.user
        }
    }

    onBtnClicked = () => {
        this.setState({
            uploadClicked: true,
            fileSelected: false,
            setFileEmpty: false,
            selectClicked: false
        })
    }

    onSelectFileClicked = () => {
        this.setState({
            uploadClicked: false,
            selectClicked: true
        })

        let self = this;

        let url = "getAllFiles";


        axios.get(url)
            .then(function (response) {
                // console.log(response);
                self.setState({ jsonServerFiles: response.data })
            })
            .catch(function (error) {
                // console.log(error);
            });
    }

    // File Drop from dropzone
    onDrop = (files) => {
        if (files[0]) {
            this.setState({
                files: files,
                fileSelected: true,
                uploadProgress: 0,
                serverSelectedFile: ''
            })
        }
    }

    modalOpen = () => {
        this.setState({
            modal: !this.state.modal
        });
    }
    onModalClosed = () => {
        this.setState({
            files: [],
            fileSelected: false,
            setFileEmpty: false,
            modal: false,
            uploadProgress: 0,
            selectedFileResponse: {},
            serverSelectedFile: ''
        })
    }

    fileSelected = () => {
        this.setState({fileSelected: false});
        if (!!this.state.serverSelectedFile || this.state.setFileEmpty) {
            this.onFileSelect();
        }
        else if (!!this.state.files[0].type.match('image.*')) {
            // console.log("is this image? ",this.state.files[0].type.match('image.*'));
            const imageCompressor = new ImageCompressor();
            const options = {
                quality: .6,
            }
            let self = this;
            imageCompressor.compress(this.state.files[0], options)
                .then((result) => {
                    // console.log("result ", result);
                    // Handle the compressed image file.
                    self.setState({ reduceFile: result }, self.upload)
                    // self.props.selectedFile({
                    //     file: result
                    // })
                })
                .catch((err) => {
                    // Handle the error
                    console.log("Compression Failed")
                })
        }
        else {
            this.setState({ reduceFile: this.state.files[0] }, this.upload);
        }
    }

    upload = () => {
        // console.log(this.state.reduceFile);
        let form = new FormData();
        form.append("file", this.state.reduceFile, this.state.reduceFile.name);

        let self = this;
        let url = '';


        url = "uploadFile";

        axios({
            "async": true,
            "crossDomain": true,
            "url": url,
            "method": "POST",
            "processData": false,
            "contentType": false,
            "mimeType": "multipart/form-data",
            "data": form,

            onUploadProgress: function (progressEvent) {
                if (progressEvent.lengthComputable) {
                    let progressValue = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    self.setState({ uploadProgress: progressValue });
                }
            }

        }).then((response) => {
            self.setState({ selectedFileResponse: response.data, fileSelected: false }, self.onFileSelect);
        }).catch(function (error) {
            console.log(error);
        });
    }

    onFileSelect = () => {
        if (!!this.state.serverSelectedFile || this.state.setFileEmpty) {
            // console.log("passed Props ", this.state.serverSelectedFile);
            this.props.selectedFile({
                file: this.state.serverSelectedFile
            })
            this.modalOpen();
        }
        else if (this.state.selectedFileResponse) {
            // console.log("passed Props ", this.state.selectedFileResponse);
            this.props.selectedFile({
                file: this.state.selectedFileResponse
            })
        }

        // this.modalOpen();
    }

    onSetFileEmpty = () => {
        this.setState({ serverSelectedFile: '', setFileEmpty: true, fileSelected: true });
    }

    onitemSelected = (file) => {
        this.setState({ serverSelectedFile: file, selectedFileResponse: '', fileSelected: true, setFileEmpty: true });
    }
    onDeleteClicked = () => {
        if (!!this.state.serverSelectedFile) {
            let r = true;
            // let r = confirm("Are You sure You want to Delete this file!");
            if (r === true) {
                let self = this;
                axios.delete("fileDelete/" + this.state.serverSelectedFile.id)
                    .then(function (response) {
                        alert("Delete Successful");
                        self.setState({ serverSelectedFile: '' })
                        self.onSelectFileClicked();
                    })
                    .catch(function (error) {
                        alert("Delete Failed! File Doesnt Seems to exist or Something went wrong.");
                        console.log(error);
                    });
            } else {

            }
        }
        else {
            alert("File Not Selected");
        }
    }
    onPageChange = (e) => {
        const pageClicked = e.target.id;
        // console.log("page Clicked ", pageClicked)
        this.setState({ currentPage: pageClicked });

    }

    getSrc = (url) => {
        return axios({
            url: url,
            method: 'GET',
        }).then((response) => {
            return response.data;
        });
    }

    imageSrc = (file) => {
        let fileName = file.fileName;
        let fileUrl = this.state.fileShowUrl;
        return fileUrl + fileName;
    }

    downloadUserFile = (url, fileName) => {
        axios({
            url: url,
            method: 'GET',
            responseType: 'blob', // important
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        });

    }

    render() {
        let previewStyle = {
            height: '100%',
            width: '100%',
        };

        const { jsonServerFiles, currentPage, imagesPerPage } = this.state;
        const indexOfLastImage = imagesPerPage * currentPage;
        const indexOfFirstImage = indexOfLastImage - imagesPerPage;
        let renderImageList = '';
        let renderPageNumbers = '';

        if (!!jsonServerFiles) {
            const imageList = jsonServerFiles.slice(indexOfFirstImage, indexOfLastImage);
            // console.log("sliced List ", imageList);

            renderImageList = imageList.map((file, i) => {
                let fileType = (file.fileType).split("/")[0];

                return (
                    <div key={i} className="col-3 flex-column modal-file-list d-flex align-items-center"
                        onClick={() => this.onitemSelected(file)}>
                        <div className="img-thumbnail">

                            {fileType === 'image' ?
                                <img className="img-fluid file-img-box" src={this.imageSrc(file)} alt="" />

                                : <FontAwesomeIcon icon={faFileAlt} size="6x" className="m-auto" />}
                            <div className="selection">
                                {this.state.serverSelectedFile.fileName === file.fileName ? <FontAwesomeIcon icon={faCheckCircle} /> : ''}
                            </div>
                        </div>
                        <a href={this.state.fileShowUrl + file.fileName}>{file.fileName}</a>

                    </div>)
            });

            const pageNumbers = [];
            for (let i = 1; i <= Math.ceil(jsonServerFiles.length / imagesPerPage); i++) {
                pageNumbers.push(i);
            }

            renderPageNumbers = pageNumbers.map(number => {
                let liClass = "page-item page-link";
                if (this.state.currentPage === number) {
                    liClass = "page-item page-link page-active";
                }
                return (
                    <li className={liClass} key={number} id={number} onClick={this.onPageChange}>{number}</li>
                );
            });
        }


        return (
            <div>

                <div className="row">
                    <div className="col-md-12">
                        <Button color="info" block onClick={this.modalOpen}>{this.props.buttonLabel}</Button>
                        <Modal isOpen={this.state.modal} size="lg" toggle={this.modalOpen} className={this.props.className} keyboard={false} onClosed={this.onModalClosed}>
                            <ModalHeader toggle={this.modalOpen}>Select File</ModalHeader>
                            <ModalBody>
                                <Button color={this.state.uploadClicked ? "info" : ""} className="mr-3" onClick={this.onBtnClicked}>Upload File</Button>
                                <Button color={this.state.selectClicked ? "info" : ""} onClick={this.onSelectFileClicked}>Select File</Button>

                                <span className="font-weight-light danger pl-3">

                                </span>

                                {this.state.selectClicked ?
                                    <div className="float-right">
                                        <Button onClick={this.onSetFileEmpty}>Select None</Button>
                                        <Button color="warning" className="float-right ml-1" onClick={this.onDeleteClicked}>
                                            <FontAwesomeIcon icon={faTrashAlt} /></Button>
                                    </div> : ''}
                                <span className="float-right pr-3">{this.state.serverSelectedFile.fileName}</span>


                                {this.state.uploadClicked ?
                                    <div> <p className="text-center text-danger">* Only Image is Supported </p>
                                        <Dropzone disablePreview={false} multiple={this.props.multipleFiles}
                                            accept={this.props.accept} onDrop={this.onDrop} className="file-upload mt-3 mb-2 p-2">
                                            <div className="p-2 mb-1 bg-info text-white cursor-pointer"> Drop a file, or click to add. </div>

                                            {this.state.files.length > 0 ?
                                                <div>
                                                    {/* {this.state.files.map((file, i) =>
                                                        <div key={i} >
                                                            <img style={previewStyle} src={file.preview} />
                                                            <p>{file.name}</p>
                                                        </div>
                                                    )} */}

                                                    {!!this.state.files[0].type.match('image.*') ?
                                                        <img style={previewStyle} src={this.state.files[0].preview} /> :
                                                        // <embed src={this.state.files[0].preview} className="embed-view"/>
                                                        <div>
                                                            <FontAwesomeIcon icon={faFileAlt} size="6x" className="m-auto" />
                                                            <p>{this.state.files[0].name}</p>
                                                        </div>
                                                    }

                                                </div> : null}

                                        </Dropzone>


                                        <Progress animated color="success" barClassName="text-center"
                                            value={this.state.uploadProgress}>{this.state.uploadProgress}% </Progress>

                                    </div>

                                    :
                                    <div>
                                        <div className="row text-center mt-3 clear-fix">
                                            {renderImageList}
                                        </div>

                                        <nav aria-label="Page navigation example">
                                            <ul className="pagination justify-content-center pt-3">
                                                {renderPageNumbers}
                                            </ul>
                                        </nav>
                                    </div>
                                }

                            </ModalBody>

                            <ModalFooter>
                                <Button color="primary" block disabled={!this.state.fileSelected && !this.state.setFileEmpty} onClick={this.fileSelected}>Done</Button>
                                <Button color="secondary" onClick={this.modalOpen}>Cancel</Button>
                            </ModalFooter>
                        </Modal>
                    </div>

                </div>

            </div>


        );
    }
}

FileUploadTest.defaultProps = {
    buttonLabel: 'Upload File',
    multipleFiles: false,
    accept: 'image/*',
}

export default FileUploadTest;