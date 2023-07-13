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

class Location extends Component {

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
        isShowAddLocationModal: false,

        isShowDeleteLocationModal: false,

        isShowEditLocationModal: false,
        isEditLoading: false,

        isShowUploadModal: false,
        selectedFile: null,

        validationCreateForm: {},

        selectedLocationFilter :"",
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
            keyword:this.state.selectedLocationFilter,
        };

        this.setState({ loadingData: true })
        this.service
            .getLocations(params)
            .then((result) => {
                this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
            });
    }

    search = (keyword) => {
      this.setState({selectedLocationFilter:keyword ,page:1},()=>this.setData())

    }

    create = () => {
        this.showAddLocationModal(true);
    }

    upload = () => {
        this.showUploadModal(true);
    }

    showUploadModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowUploadModal: value });
    }

    showAddLocationModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddLocationModal: value, validationCreateForm: {} });
    }

    showDeleteLocationModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeleteLocationModal: value });
    }

    showEditLocationModal = (value) => {
        this.setState({ isShowEditLocationModal: value });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreateLocation = () => {
        const payload = {
            Name: this.state.form?.Name,
            Latitude: this.state.form?.Latitude,
            Longitude: this.state.form?.Longitude
        }

        this.setState({ isCreateLoading: true });
        this.service.createLocation(payload)
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
                    this.showAddLocationModal(false);
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

    handleEditLocation = () => {
        const payload = {
            Name: this.state.form?.Name,
            Latitude: this.state.form?.Latitude,
            Longitude: this.state.form?.Longitude
        }

        this.setState({ isEditLoading: true });
        this.service.editLocation(this.state.selectedItem?.Id, payload)
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
                    this.showEditLocationModal(false);
                });
            })
            .catch((error) => {
                this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
            });
    }

    handleEditLocationClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getLocationById(item.Id)
            .then((location) => {
                this.setState({ form: location }, () => {
                    this.showEditLocationModal(true);
                })
            })
    }

    handleDeleteLocationClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeleteLocationModal(true);
        })
    }

    deleteLocationClickHandler = () => {
        this.setState({ isDeleteLocationLoading: true })
        this.service.deleteLocation(this.state.selectedItem?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteLocationLoading: false, selectedItem: null }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteLocationModal(false);
                });
            }).catch((error) => {
                this.setState({ isDeleteLocationLoading: false, isShowDeleteLocationModal: false });
                if (error) {
                    swal({
                        icon: 'error',
                        title: 'Tidak bisa menghapus lokasi',
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

    handleUploadLocation = () => {
        this.service.uploadLocation(this.state.selectedFile)
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
                    <td>{item.Name}</td>
                    <td>{item.Coordinate}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-primary" name="edit-location" onClick={this.handleEditLocationClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-location" onClick={this.handleDeleteLocationClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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
                                        <Button className="btn btn-success mr-5" name="add_location" onClick={this.create}>Tambah Location</Button>
                                    </Col>
                                  <Col sm={4}></Col>

                                  <Col sm={4}>
                                    <Form.Control
                                      className="float-right"
                                      type="text"
                                      name="keyword"
                                      value={this.state.selectedLocationFilter}
                                      onChange={(e) => {
                                        return this.search(e.target.value);
                                      }}
                                      placeholder="Cari lokasi"
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
                                                        <th>Nama Lokasi</th>
                                                        <th>Koordinat</th>
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

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal_add_location" show={this.state.isShowAddLocationModal} onHide={() => this.showAddLocationModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal_add_location">Tambah Location</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
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
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Latitude</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="Latitude"
                                                value={this.state.form.Latitude}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Latitude}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Latitude}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Longitude</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="Longitude"
                                                value={this.state.form.Longitude}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Longitude}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Longitude}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="create-location" onClick={this.handleCreateLocation}>Submit</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal-set-jadwal" show={this.state.isShowUploadModal} onHide={() => this.showUploadModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-set-jadwal">Upload Location</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div>
                                        <input type="file" name="file" onChange={this.onInputFileHandler} />
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.uploadFileLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="upload_file" onClick={this.handleUploadLocation}>Submit</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal aria-labelledby="modal-delete-location" show={this.state.isShowDeleteLocationModal} onHide={() => this.showDeleteLocationModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-delete-location">Hapus Location</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isDeleteLocationLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-danger" name="delete-location" onClick={this.deleteLocationClickHandler}>Hapus</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-location" show={this.state.isShowEditLocationModal} onHide={() => this.showEditLocationModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-edit-location">Edit Location</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
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
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Latitude</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="Latitude"
                                                value={this.state.form.Latitude}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Latitude}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Latitude}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Longitude</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="Longitude"
                                                value={this.state.form.Longitude}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Longitude}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Longitude}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="edit-location" onClick={this.handleEditLocation}>Submit</Button>
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

export default Location;
