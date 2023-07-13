import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';

import Service from './../Service';
import swal from 'sweetalert';

import './style.css';

const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);

class StatusPph extends Component {

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
        isShowAddStatusPphModal: false,

        isShowDeleteStatusPphModal: false,

        isShowEditStatusPphModal: false,
        isEditLoading: false,

        selectedFile: null,

        validationCreateForm: {},
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
            page: this.state.activePage
        };

        this.setState({ loadingData: true })
        this.service
            .getStatusPph(params)
            .then((result) => {
                this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
            });
    }

    create = () => {
        this.showAddStatusPphModal(true);
    }

    // upload = () => {
    //     this.showUploadModal(true);
    // }

    // showUploadModal = (value) => {
    //     this.resetModalValue();
    //     this.setState({ isShowUploadModal: value });
    // }

    showAddStatusPphModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddStatusPphModal: value, validationCreateForm: {} });
    }

    showDeleteStatusPphModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeleteStatusPphModal: value });
    }

    showEditStatusPphModal = (value) => {
        this.setState({ isShowEditStatusPphModal: value });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreateStatusPph = () => {
        const payload = {
            Id: this.state.form?.Id,
            Status: this.state.form?.Status,
            PTKP : this.state.form?.PTKP
        }

        this.setState({ isCreateLoading: true });
        this.service.createStatusPph(payload)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil disimpan!'
                })
                this.setState({ isCreateLoading: false }, () => {

                    this.resetModalValue();
                    this.resetPagingConfiguration();
                    this.setData();
                    this.showAddStatusPphModal(false);
                });
            })
            .catch((error) => {
                if (error.response) {
                    this.setState({ validationCreateForm: error.response.data.error, isCreateLoading: false });
                    // console.log(this.state);
                }
                // console.log(error)
            });
        // console.log(payload);
    }

    handleEditStatusPph = () => {
        const payload = {
            Id: this.state.form?.Id,
            Status: this.state.form?.Status,
            PTKP : this.state.form?.PTKP
        }

        this.setState({ isEditLoading: true });
        this.service.editStatusPph(payload)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil diubah!'
                })
                this.setState({ isEditLoading: false }, () => {

                    this.resetModalValue();
                    this.resetPagingConfiguration();
                    this.setData();
                    this.showEditStatusPphModal(false);
                });
            })
            .catch((error) => {
                this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
            });
    }

    handleEditStatusPphClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getStatusPphById(item.Id)
            .then((statusPph) => {
                const { form } = this.state;
                this.setState({ form: statusPph }, () => {
                    this.showEditStatusPphModal(true);
                })
            })
    }

    handleDeleteStatusPphClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeleteStatusPphModal(true);
        })
    }

    deleteStatusPphClickHandler = () => {
        this.setState({ isDeleteStatusPphLoading: true })
        this.service.deleteStatusPph(this.state.selectedItem?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteStatusPphLoading: false, selectedItem: null }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteStatusPphModal(false);
                });
            })
    }

    onInputFileHandler = (event) => {
        this.setFile(event.target.files[0]);
    }

    setFile = (file) => {
        this.setState({ selectedFile: file });
    }

    // handleUploadSection = () => {
    //     this.service.uploadSection(this.state.selectedFile)
    //         .then((data) => {
    //             swal({
    //                 icon: 'success',
    //                 title: 'Good...',
    //                 text: 'Data berhasil diubah!'
    //             });
    //             this.resetModalValue();
    //             this.resetPagingConfiguration();
    //             this.setData();
    //             this.showUploadModal(false);
    //         })
    //         .catch((err) => {
    //             swal({
    //                 icon: 'error',
    //                 title: 'Gagal Upload!',
    //                 text: 'Pastikan Format Excel sudah benar!\nHubungi IT support.'
    //             })
    //         })
    // }

    render() {
        const { tableData } = this.state;

        const items = tableData.map((item, index) => {

            return (
                <tr key={item.Id} data-category={item.Id}>
                    <td>{item.Status}</td>
                    <td>{item.PTKP}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-primary" name="edit-status-pph" onClick={this.handleEditStatusPphClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-status-pph" onClick={this.handleDeleteStatusPphClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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
                                        <Button className="btn btn-success mr-5" name="add_section" onClick={this.create}>Tambah Status Pph</Button>
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
                                                        <th>Status</th>
                                                        <th>PTKP</th>
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

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal_add_status_pph" show={this.state.isShowAddStatusPphModal} onHide={() => this.showAddStatusPphModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal_add_section">Tambah Status PPH</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Status</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="Status"
                                                value={this.state.form.Status}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form["Status"] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Status || this.state.validationCreateForm.Duplicate}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Status ? this.state.validationCreateForm.Status : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>PTKP</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="PTKP"
                                                value={this.state.form.PTKP}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form["PTKP"] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.PTKP}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.PTKP }</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="create-status-pph" onClick={this.handleCreateStatusPph}>Submit</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal aria-labelledby="modal-delete-status-pph" show={this.state.isShowDeleteStatusPphModal} onHide={() => this.showDeleteStatusPphModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-delete-status-pph">Hapus Status Pph</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isDeleteStatusPphLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-danger" name="delete-status-pph" onClick={this.deleteStatusPphClickHandler}>Hapus</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-status-pph" show={this.state.isShowEditStatusPphModal} onHide={() => this.showEditStatusPphModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-edit-status-pph">Edit Status PPH</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Id</Form.Label>
                                        </Col>
                                        <Col>
                                        <Form.Label>{this.state.form.Id}</Form.Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Status</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="Status"
                                                value={this.state.form.Status}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form["Status"] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Status || this.state.validationCreateForm.Duplicate}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Status ? this.state.validationCreateForm.Status : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>PTKP</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="PTKP"
                                                value={this.state.form.PTKP}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form["PTKP"] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.PTKP}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.PTKP }</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="edit-status-pph" onClick={this.handleEditStatusPph}>Submit</Button>
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

export default StatusPph;
