import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import * as CONST from "../../../Constant";
import axios from "axios";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';

import Service from './../Service';
import swal from 'sweetalert';

import './style.css';
import Axios from 'axios';

const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);

class Position extends Component {

    typeaheadEmployee = {};

    state = {
        loading: false,

        activePage: 1,
        total: 0,
        loadingData: false,
        tableData: [],
        selectedItem: null,

        form: {},
        isCreateLoading: false,
        isShowAddPositionModal: false,

        isShowDeletePositionModal: false,

        isShowEditPositionModal: false,
        isEditLoading: false,

        isShowUploadModal: false,
        selectedFile: null,
        selectedPositionFilter: "",

        validationCreateForm: {},
        columns: [
            { label: "Kode", accessor: "Code" },
            { label: "Nama Jabatan", accessor: "Name" },
        ],
        sortField: "",
        orderType: "asc",
    }

    resetModalValue = () => {
        this.setState({
            validationCreateForm: {},
            form: {},
            selectedFile: null
        })
    }

    resetPagingConfiguration = () => {
        this.setState({
            activePage: 1
        })
    }

    constructor(props) {
        super(props);
        this.service = new Service();
    }

    componentDidMount() {
        this.setData();
    }

    setData = () => {
        const params = {
            page: this.state.activePage,
            keyword: this.state.selectedPositionFilter,
            order: {
                [`${this.state.sortField}`]: `${this.state.orderType}`
            }
        };

        this.setState({ loadingData: true })
        this.service
            .getPositions(params)
            .then((result) => {
                this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
            });
    }

    search = (keyword) => {
        this.setState({ page: 1, selectedPositionFilter: keyword }, () => {
            this.setData();
        })
    }

    create = () => {
        this.showAddPositionModal(true);
    }

    upload = () => {
        this.showUploadModal(true);
    }

    showUploadModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowUploadModal: value });
    }

    showAddPositionModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddPositionModal: value, validationCreateForm: {} });
    }

    showDeletePositionModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeletePositionModal: value });
    }

    showEditPositionModal = (value) => {
        this.setState({ isShowEditPositionModal: value });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleSortingChange = (accessor) => {
        const sortOrder = accessor === this.state.sortField && this.state.orderType === "asc" ? "desc" : "asc";
        this.setState({
            sortField: accessor,
            orderType: sortOrder
        }, () => {
            this.setData();
        });

    }

    handleCreatePosition = () => {
        const payload = {
            Code: this.state.form?.Code,
            Name: this.state.form?.Name,
        }

        this.setState({ isCreateLoading: true });
        this.service.createPosition(payload)
            .then((result) => {
                console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil disimpan!'
                })
                this.setState({ isCreateLoading: false, sortField: "", orderType: "asc" }, () => {

                    this.resetModalValue();
                    this.resetPagingConfiguration();
                    this.setData();
                    this.showAddPositionModal(false);
                });
            })
            .catch((error) => {
                if (error.response) {
                    this.setState({ validationCreateForm: error.response.data.error, isCreateLoading: false, sortField: "", orderType: "asc" });
                    // console.log(this.state);
                }
                // console.log(error)
            });
        // console.log(payload);
    }

    handleEditPosition = () => {
        const payload = {
            Code: this.state.form?.Code,
            Name: this.state.form?.Name,
        }

        this.setState({ isEditLoading: true });
        this.service.editPosition(this.state.selectedItem?.Id, payload)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil diubah!'
                })
                this.setState({ isEditLoading: false, sortField: "", orderType: "asc" }, () => {

                    this.resetModalValue();
                    this.resetPagingConfiguration();
                    this.setData();
                    this.showEditPositionModal(false);
                });
            })
            .catch((error) => {
                this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false, isShowEditPositionModal: false, sortField: "", orderType: "asc" });
                if (error) {
                    console.log(error.response.data.error);
                    swal({
                        icon: 'error',
                        title: 'Tidak bisa mengedit Jabatan',
                        text: error.response.data.error[Object.keys(error.response.data.error)[0]]
                    })
                }
            });
    }

    handleEditPositionClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getPositionById(item.Id)
            .then((position) => {
                this.setState({ form: position }, () => {
                    this.showEditPositionModal(true);
                })
            })
    }

    handleDeletePositionClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeletePositionModal(true);
        })
    }

    deletePositionClickHandler = () => {
        this.setState({ isDeletePositionLoading: true })
        this.service.deletePosition(this.state.selectedItem?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeletePositionLoading: false, selectedItem: null, sortField: "", orderType: "asc" }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeletePositionModal(false);
                });
            })
            .catch((error) => {
                this.setState({ isDeletePositionLoading: false, isShowDeletePositionModal: false, sortField: "", orderType: "asc" });
                if (error) {
                    swal({
                        icon: 'error',
                        title: 'Tidak bisa menghapus Jabatan',
                        text: error[Object.keys(error)[0]]
                    })
                }
            });
    }

    onInputFileHandler = (event) => {
        this.setFile(event.target.files[0]);
    }

    setFile = (file) => {
        this.setState({ selectedFile: file });
    }

    handleUploadPosition = async () => {
        var data = new FormData();
        data.append("file", this.state.selectedFile);

        const url = `${CONST.URI_ATTENDANCE}positions/upload`;
        const headers = {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ` + localStorage.getItem("token"),
            "x-timezone-offset": moment().utcOffset() / 60,
        };

        axios
            .post(url, data, { headers: headers, responseType: "blob" })
            .then(async (response) => {
                if (response.status === 200) {
                    let filename = response.headers["content-disposition"]
                        .split(";")[1]
                        .replace("filename=", "")
                        .replace(/"/, "")
                        .replace(/"/, "");

                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", filename);
                    document.body.appendChild(link);
                    link.click();

                    swal({
                        icon: "error",
                        title: "Cek data di file excel yang di upload",
                        text: "Harap cek file log Error",
                    });
                } else {
                    var res = JSON.parse(await response.data.text());
                    
                    let message = `Import file selesai, ${res.result} data ditambahkan`;
                    swal({
                        icon: "success",
                        title: "Good...",
                        text: message,
                    });
                }
                this.resetModalValue();
                this.resetPagingConfiguration();
                this.setData();
                this.showUploadModal(false);
            })
            .catch((err) => {
                if (err.response) {
                    if (err.response.status == 400) {
                        swal({
                            icon: 'error',
                            title: 'Gagal Upload!',
                            text: 'Cek data di file excel yang di upload'
                        }).then((value) => {
                            this.resetModalValue();
                            this.resetPagingConfiguration();
                            this.setData();
                            this.showUploadModal(false);
                        });
                    }

                    else {
                        swal({
                            icon: 'error',
                            title: 'Gagal Upload!',
                            text: 'Terjadi kesalahan, silakan coba lagi'
                        }).then((value) => {
                            this.resetModalValue();
                            this.resetPagingConfiguration();
                            this.setData();
                            this.showUploadModal(false);
                        });
                    }
                } else {
                    swal({
                        icon: 'error',
                        title: 'Gagal Upload!',
                        text: 'Terjadi kesalahan, silakan coba lagi'
                    }).then((value) => {
                        this.resetModalValue();
                        this.resetPagingConfiguration();
                        this.setData();
                        this.showUploadModal(false);
                    });
                }
            })
        
        // this.service.uploadPosition(this.state.selectedFile)
        //     .then((data) => {
        //         swal({
        //             icon: 'success',
        //             title: 'Good...',
        //             text: 'Data berhasil diubah!'
        //         });
        //         this.resetModalValue();
        //         this.resetPagingConfiguration();
        //         this.setData();
        //         this.showUploadModal(false);
        //     })
        //     .catch((err) => {
        //         swal({
        //             icon: 'error',
        //             title: 'Gagal Upload!',
        //             text: 'Pastikan Format Excel sudah benar!\nHubungi IT support.'
        //         })
        //     })
    }

    render() {
        const { tableData } = this.state;

        const items = tableData.map((item, index) => {

            return (
                <tr key={item.Id} data-category={item.Id}>
                    <td>{item.Code}</td>
                    <td>{item.Name}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-primary" name="edit-unit" onClick={this.handleEditPositionClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-unit" onClick={this.handleDeletePositionClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
                            </FormGroup>
                        </Form>
                    </td>
                </tr>
            );
        });

        return (
            <div className="animated fadeIn">
                {this.state.loading ? (
                    <span><Spinner size="sm" color="primary" /> Please wait...</span>
                ) : (
                    <Form>
                        <FormGroup>
                            <Row>
                                <Col sm={4}>
                                    <Button className="btn btn-success mr-3" name="add_unit" onClick={this.create}>Tambah Jabatan</Button>
                                    <Button className="btn btn-primary mr-3" name="upload_unit" onClick={this.upload}>Upload Jabatan</Button>
                                </Col>

                                <Col sm={4}>

                                </Col>

                                <Col sm={4}>
                                    <Form.Control
                                        className="float-right"
                                        type="text"
                                        name="keyword"
                                        value={this.state.selectedPositionFilter}
                                        onChange={(e) => {
                                            return this.search(e.target.value);
                                        }}
                                        placeholder="Cari Jabatan"
                                    />
                                </Col>
                            </Row>
                        </FormGroup>

                        <FormGroup>
                            {this.state.loadingData ? (
                                <span><Spinner size="sm" color="primary" /> Loading Data...</span>
                            ) : (
                                <Row>
                                    <Table responsive bordered striped>
                                        <thead>
                                            <tr className={'text-center'}>
                                                {this.state.columns.map(({ label, accessor }) => {

                                                    const ord = this.state.sortField === accessor && this.state.orderType === "asc" ? "up" :
                                                        (
                                                            this.state.sortField === accessor && this.state.orderType === "desc" ? "down" : "default"
                                                        )


                                                    return <th key={accessor} className={ord} onClick={() => this.handleSortingChange(accessor)}>{label}</th>;
                                                })}
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>{items}</tbody>
                                    </Table>
                                    <Pagination
                                        activePage={this.state.activePage}
                                        itemsCountPerPage={10}
                                        totalItemsCount={this.state.total}
                                        pageRangeDisplayed={5}
                                        onChange={this.handlePageChange}
                                        innerClass={"pagination"}
                                        itemClass={"page-item"}
                                        linkClass={"page-link"}
                                    />
                                </Row>
                            )}
                        </FormGroup>

                        <Modal dialogClassName="modal-90w" aria-labelledby="modal_add_unit" show={this.state.isShowAddPositionModal} onHide={() => this.showAddPositionModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal_add_unit">Tambah Jabatan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Kode</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="Code"
                                            value={this.state.form.Code}
                                            onChange={(e) => {
                                                var { form } = this.state;
                                                form[e.target.name] = e.target.value;
                                                return this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.Code || this.state.validationCreateForm.Duplicate}
                                        />
                                        <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Code ? this.state.validationCreateForm.Code : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Nama</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="Name"
                                            value={this.state.form.Name}
                                            onChange={(e) => {
                                                var { form } = this.state;
                                                form[e.target.name] = e.target.value;
                                                return this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.Name || this.state.validationCreateForm.Duplicate}
                                        />
                                        <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Name ? this.state.validationCreateForm.Name : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="create-unit" onClick={this.handleCreatePosition}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName="modal-90w" aria-labelledby="modal-set-jadwal" show={this.state.isShowUploadModal} onHide={() => this.showUploadModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-set-jadwal">Upload Jabatan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div>
                                    <input type="file" name="file" onChange={this.onInputFileHandler} />
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.uploadFileLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="upload_file" onClick={this.handleUploadPosition}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal aria-labelledby="modal-delete-unit" show={this.state.isShowDeletePositionModal} onHide={() => this.showDeletePositionModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-delete-unit">Hapus Jabatan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Apakah anda yakin ingin menghapus data ini?
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isDeletePositionLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-danger" name="delete-unit" onClick={this.deletePositionClickHandler}>Hapus</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-unit" show={this.state.isShowEditPositionModal} onHide={() => this.showEditPositionModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-edit-unit">Edit Jabatan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Kode</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="Code"
                                            value={this.state.form.Code}
                                            onChange={(e) => {
                                                var { form } = this.state;
                                                form[e.target.name] = e.target.value;
                                                return this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.Code || this.state.validationCreateForm.Duplicate}
                                        />
                                        <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Code ? this.state.validationCreateForm.Code : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Nama</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="Name"
                                            value={this.state.form.Name}
                                            onChange={(e) => {
                                                var { form } = this.state;
                                                form[e.target.name] = e.target.value;
                                                return this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.Name || this.state.validationCreateForm.Duplicate}
                                        />
                                        <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Name ? this.state.validationCreateForm.Name : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="edit-unit" onClick={this.handleEditPosition}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>
                    </Form>
                )}

            </div>
        );
    }
}

export default Position;
