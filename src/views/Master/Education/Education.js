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

class Education extends Component {

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
        isShowAddEducationModal: false,

        isShowDeleteEducationModal: false,

        isShowEditEducationModal: false,
        isEditLoading: false,

        validationCreateForm: {},

        selectedEducationFilter :"",
    }

    resetModalValue = () => {
        this.setState({
            validationCreateForm: {},
            form: {},
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
            keyword:this.state.selectedEducationFilter,
        };

        this.setState({ loadingData: true })
        this.service
            .getEducations(params)
            .then((result) => {
                this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
            });
    }

    search = (keyword) => {
      this.setState({selectedEducationFilter:keyword ,page:1},()=>this.setData())

    }

    create = () => {
        this.showAddEducationModal(true);
    }

  

    showAddEducationModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddEducationModal: value, validationCreateForm: {} });
    }

    showDeleteEducationModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeleteEducationModal: value });
    }

    showEditEducationModal = (value) => {
        this.setState({ isShowEditEducationModal: value });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreateEducation = () => {
        const payload = {
            Name: this.state.form?.Name,
            Code: this.state.form?.Code,
            Remark: this.state.form?.Remark
        }

        this.setState({ isCreateLoading: true });
        this.service.createEducation(payload)
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
                    this.showAddEducationModal(false);
                });
            })
            .catch((error) => {
                if (error.response) {
                    this.setState({ validationCreateForm: error.response.data.error, isCreateLoading: false });
                    
                }
               
            });
        
    }

    handleEditEducation = () => {
        const payload = {
            Id: this.state.form?.Id,
            Name: this.state.form?.Name,
            Code: this.state.form?.Code,
            Remark: this.state.form?.Remark
        }

        this.setState({ isEditLoading: true });
        this.service.editEducation(this.state.selectedItem?.Id, payload)
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
                    this.showEditEducationModal(false);
                });
            })
            .catch((error) => {
                this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
            });
    }

    handleEditEducationClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getEducationById(item.Id)
            .then((education) => {
                this.setState({ form: education }, () => {
                    this.showEditEducationModal(true);
                })
            })
    }

    handleDeleteEducationClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeleteEducationModal(true);
        })
    }

    deleteEducationClickHandler = () => {
        this.setState({ isDeleteEducationLoading: true })
        this.service.deleteEducation(this.state.selectedItem?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteEducationLoading: false, selectedItem: null }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteEducationModal(false);
                });
            })
    }

   

    render() {
        const { tableData } = this.state;

        const items = tableData.map((item, index) => {

            return (
                <tr key={item.Id} data-category={item.Id}>
                    <td>{item.Code}</td>
                    <td>{item.Name}</td>
                    <td>{item.Remark}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-primary" name="edit-education" onClick={this.handleEditEducationClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-education" onClick={this.handleDeleteEducationClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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
                                        <Button className="btn btn-sm btn-success mr-5" name="add_education" onClick={this.create}>Tambah Pendidikan</Button>
                                    </Col>
                                  <Col sm={4}></Col>

                                  <Col sm={4}>
                                    <Form.Control
                                      className="float-right"
                                      type="text"
                                      name="keyword"
                                      value={this.state.selectedEducationFilter}
                                      onChange={(e) => {
                                        return this.search(e.target.value);
                                      }}
                                      placeholder="Cari Pendidikan"
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
                                                        <th>Kode </th>
                                                        <th>Nama</th>
                                                        <th>Deskripsi</th>
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

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal_add_education" show={this.state.isShowAddEducationModal} onHide={() => this.showAddEducationModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal_add_education">Tambah Pendidikan</Modal.Title>
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
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Deskripsi</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="Remark"
                                                value={this.state.form.Remark}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                as="textarea"
                                                isInvalid={this.state.validationCreateForm.Remark}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Remark}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                    
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="create-education" onClick={this.handleCreateEducation}>Submit</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            

                            <Modal aria-labelledby="modal-delete-education" show={this.state.isShowDeleteEducationModal} onHide={() => this.showDeleteEducationModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-delete-education">Hapus Pendidikan</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isDeleteEducationLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-danger" name="delete-education" onClick={this.deleteEducationClickHandler}>Hapus</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-education" show={this.state.isShowEditEducationModal} onHide={() => this.showEditEducationModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-edit-education">Edit Pendidikan</Modal.Title>
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
                                                isInvalid={this.state.validationCreateForm.Code}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Code}</Form.Control.Feedback>
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
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Deskripsi</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="Remark"
                                                value={this.state.form.Remark}
                                                as="textarea"
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Remark}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Remark}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                    
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="edit-education" onClick={this.handleEditEducation}>Submit</Button>
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

export default Education;
