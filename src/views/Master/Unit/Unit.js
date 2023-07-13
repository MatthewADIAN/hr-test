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

class Unit extends Component {

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
        isShowAddUnitModal: false,

        isShowDeleteUnitModal: false,

        isShowEditUnitModal: false,
        isEditLoading: false,

        isShowUploadModal: false,
        selectedFile: null,
        selectedUnitFilter: "",

        validationCreateForm: {}
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
            keyword: this.state.selectedUnitFilter
        };

        this.setState({ loadingData: true })
        this.service
            .getUnits(params)
            .then((result) => {
                this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
            });
    }

    search = (keyword) => {
        this.setState({ page: 1, selectedUnitFilter: keyword }, () => {
            this.setData();
        })
    }


    create = () => {
        this.showAddUnitModal(true);
    }

    upload = () => {
        this.showUploadModal(true);
    }

    showUploadModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowUploadModal: value });
    }

    showAddUnitModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddUnitModal: value, validationCreateForm: {} });
    }

    showDeleteUnitModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeleteUnitModal: value });
    }

    showEditUnitModal = (value) => {
        this.setState({ isShowEditUnitModal: value });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreateUnit = () => {
        const payload = {
            Code: this.state.form?.Code,
            Name: this.state.form?.Name,
            EmployeeIdentityReferenceCode: this.state.form?.EmployeeIdentityReferenceCode
        }

        this.setState({ isCreateLoading: true });
        this.service.createUnit(payload)
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
                    this.showAddUnitModal(false);
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

    handleEditUnit = () => {
        const payload = {
            Code: this.state.form?.Code,
            Name: this.state.form?.Name,
            EmployeeIdentityReferenceCode: this.state.form?.EmployeeIdentityReferenceCode
        }

        this.setState({ isEditLoading: true });
        this.service.editUnit(this.state.selectedItem?.Id, payload)
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
                    this.showEditUnitModal(false);
                });
            })
            .catch((error) => {
                this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
            });
    }

    handleEditUnitClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getUnitById(item.Id)
            .then((unit) => {
                this.setState({ form: unit }, () => {
                    this.showEditUnitModal(true);
                })
            })
    }

    handleDeleteUnitClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeleteUnitModal(true);
        })
    }

    deleteUnitClickHandler = () => {
        this.setState({ isDeleteUnitLoading: true })
        this.service.deleteUnit(this.state.selectedItem?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteUnitLoading: false, selectedItem: null }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteUnitModal(false);
                });
            })
            .catch((error) => {
                this.setState({ isDeleteUnitLoading: false, isShowDeleteUnitModal: false });
                if (error) {
                    swal({
                        icon: 'error',
                        title: 'Tidak bisa menghapus unit',
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

    handleUploadUnit = () => {
        this.service.uploadUnit(this.state.selectedFile)
            .then((data) => {
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil diubah!'
                });
                this.resetModalValue();
                this.resetPagingConfiguration();
                this.setData();
                this.showUploadModal(false);
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Gagal Upload!',
                    text: 'Pastikan Format Excel sudah benar!\nHubungi IT support.'
                })
            })
    }

    render() {
        const { tableData } = this.state;

        const items = tableData.map((item, index) => {

            return (
                <tr key={item.Id} data-category={item.Id}>
                    <td>{item.EmployeeIdentityReferenceCode}</td>
                    <td>{item.Code}</td>
                    <td>{item.Name}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-primary" name="edit-unit" onClick={this.handleEditUnitClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-unit" onClick={this.handleDeleteUnitClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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

                                        <Button className="btn btn-success mr-3" name="add_unit" onClick={this.create}>Tambah Unit</Button>
                                        <Button className="btn btn-primary mr-3" name="upload_unit" onClick={this.upload}>Upload Unit</Button>

                                    </Col>

                                    <Col sm={4}>

                                    </Col>


                                    <Col sm={4}>
                                        <Form.Control
                                            className="float-right"
                                            type="text"
                                            name="keyword"
                                            value={this.state.selectedUnitFilter}
                                            onChange={(e) => {
                                                return this.search(e.target.value);
                                            }}
                                            placeholder="Cari unit"
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
                                                        <th>Kode Referensi NIK</th>
                                                        <th>Kode</th>
                                                        <th>Nama Unit</th>
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

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal_add_unit" show={this.state.isShowAddUnitModal} onHide={() => this.showAddUnitModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal_add_unit">Tambah Unit</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Kode Referensi NIK</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="EmployeeIdentityReferenceCode"
                                                value={this.state.form.EmployeeIdentityReferenceCode}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                // isInvalid={this.state.validationCreateForm.EmployeeIdentityReferenceCode || this.state.validationCreateForm.Duplicate}
                                                isInvalid={this.state.validationCreateForm.EmployeeIdentityReferenceCode}
                                            />
                                            {/* <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Code ? this.state.validationCreateForm.Code : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback> */}
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.EmployeeIdentityReferenceCode}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
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
                                            <Button className="btn btn-success" name="create-unit" onClick={this.handleCreateUnit}>Submit</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal-set-jadwal" show={this.state.isShowUploadModal} onHide={() => this.showUploadModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-set-jadwal">Upload Unit</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div>
                                        <input type="file" name="file" onChange={this.onInputFileHandler} />
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.uploadFileLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="upload_file" onClick={this.handleUploadUnit}>Submit</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal aria-labelledby="modal-delete-unit" show={this.state.isShowDeleteUnitModal} onHide={() => this.showDeleteUnitModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-delete-unit">Hapus Unit</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isDeleteUnitLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-danger" name="delete-unit" onClick={this.deleteUnitClickHandler}>Hapus</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-unit" show={this.state.isShowEditUnitModal} onHide={() => this.showEditUnitModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-edit-unit">Edit Unit</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Kode Referensi NIK</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="EmployeeIdentityReferenceCode"
                                                value={this.state.form.EmployeeIdentityReferenceCode}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                // isInvalid={this.state.validationCreateForm.Code || this.state.validationCreateForm.Duplicate}
                                                isInvalid={this.state.validationCreateForm.EmployeeIdentityReferenceCode}
                                            />
                                            {/* <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Code ? this.state.validationCreateForm.Code : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback> */}
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.EmployeeIdentityReferenceCode}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
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
                                            <Button className="btn btn-success" name="edit-unit" onClick={this.handleEditUnit}>Submit</Button>
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

export default Unit;
