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

class Section extends Component {

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
        isShowAddSectionModal: false,

        isShowDeleteSectionModal: false,

        isShowEditSectionModal: false,
        isEditLoading: false,

        isShowUploadModal: false,
        selectedFile: null,

        validationCreateForm: {},
        selectedSectionFilter:"",

        units: []
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
        this.setUnit();
    }

    setData = () => {
        const params = {
            page: this.state.activePage,
            keyword:this.state.selectedSectionFilter
        };

        this.setState({ loadingData: true })
        this.service
            .getSections(params)
            .then((result) => {
                this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
            });
    }

    setUnit = () => {
        const params = {
            page: this.state.activePage
        };

        this.setState({ loadingData: true })
        this.service
            .getAllUnits()
            .then((result) => {
                this.setState({ units: result, loadingData: false })
            });
    }

    search = (keyword) => {
      this.setState({page:1,selectedSectionFilter:keyword},()=>this.setData());

    }

    create = () => {
        this.showAddSectionModal(true);
    }

    upload = () => {
        this.showUploadModal(true);
    }

    showUploadModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowUploadModal: value });
    }

    showAddSectionModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddSectionModal: value, validationCreateForm: {} });
    }

    showDeleteSectionModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeleteSectionModal: value });
    }

    showEditSectionModal = (value) => {
        this.setState({ isShowEditSectionModal: value });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreateSection = () => {
        const payload = {
            UnitId: this.state.form?.unitId,
            Name: this.state.form?.Name
        }

        this.setState({ isCreateLoading: true });
        this.service.createSection(payload)
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
                    this.showAddSectionModal(false);
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

    handleEditSection = () => {
        const payload = {
            UnitId: this.state.form?.unitId,
            Name: this.state.form?.Name
        }

        this.setState({ isEditLoading: true });
        this.service.editSection(this.state.selectedItem?.Id, payload)
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
                    this.showEditSectionModal(false);
                });
            })
            .catch((error) => {
                this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
            });
    }

    handleEditSectionClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getSectionById(item.Id)
            .then((section) => {
                const { form, units } = this.state;
                let unit = units.find((element) => element.Id == section.UnitId);
                section["unit"] = unit;
                section["unitId"] = unit?.Id;
                this.setState({ form: section }, () => {
                    this.showEditSectionModal(true);
                })
            })
    }

    handleDeleteSectionClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeleteSectionModal(true);
        })
    }

    deleteSectionClickHandler = () => {
        this.setState({ isDeleteSectionLoading: true })
        this.service.deleteSection(this.state.selectedItem?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteSectionLoading: false, selectedItem: null }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteSectionModal(false);
                });
            }).catch((error) => {
                this.setState({ isDeleteSectionLoading: false, isShowDeleteSectionModal: false });
                if (error) {
                    swal({
                        icon: 'error',
                        title: 'Tidak bisa menghapus seksi',
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

    handleUploadSection = () => {
        this.service.uploadSection(this.state.selectedFile)
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
                    <td>{item.UnitName}</td>
                    <td>{item.Name}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-primary" name="edit-section" onClick={this.handleEditSectionClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-section" onClick={this.handleDeleteSectionClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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
                                        <Button className="btn btn-success mr-5" name="add_section" onClick={this.create}>Tambah Seksi</Button>
                                    </Col>
                                  <Col sm={4}>

                                  </Col>


                                  <Col sm={4}>
                                    <Form.Control
                                      className="float-right"
                                      type="text"
                                      name="keyword"
                                      value={this.state.selectedSectionFilter}
                                      onChange={(e) => {
                                        return this.search(e.target.value);
                                      }}
                                      placeholder="Cari Seksi"
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
                                                        <th>Unit</th>
                                                        <th>Seksi</th>
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

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal_add_section" show={this.state.isShowAddSectionModal} onHide={() => this.showAddSectionModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal_add_section">Tambah Seksi</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Unit</Form.Label>
                                        </Col>
                                        <Col>
                                            <Select
                                                className={this.state.validationCreateForm.Unit ? 'invalid-select' : ''}
                                                options={this.state.units}
                                                value={this.state.form.unit}
                                                onChange={(value) => {
                                                    var { form } = this.state;
                                                    form["unit"] = value;
                                                    form["unitId"] = value.Id;
                                                    this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Unit ? true : null}>
                                            </Select>
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
                                            <Button className="btn btn-success" name="create-section" onClick={this.handleCreateSection}>Submit</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal aria-labelledby="modal-delete-section" show={this.state.isShowDeleteSectionModal} onHide={() => this.showDeleteSectionModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-delete-section">Hapus Section</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isDeleteSectionLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-danger" name="delete-section" onClick={this.deleteSectionClickHandler}>Hapus</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-section" show={this.state.isShowEditSectionModal} onHide={() => this.showEditSectionModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-edit-section">Edit Section</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Unit</Form.Label>
                                        </Col>
                                        <Col>
                                            <Select
                                                className={this.state.validationCreateForm.Unit ? 'invalid-select' : ''}
                                                options={this.state.units}
                                                value={this.state.form.unit}
                                                onChange={(value) => {
                                                    var { form } = this.state;
                                                    form["unit"] = value;
                                                    form["unitId"] = value.Id;
                                                    this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Unit ? true : null}>
                                            </Select>
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
                                            <Button className="btn btn-success" name="edit-section" onClick={this.handleEditSection}>Submit</Button>
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

export default Section;
