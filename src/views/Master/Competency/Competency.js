import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';
import * as CONST from '../../../Constant';
import Service from './../Service';
import swal from 'sweetalert';
import axios from 'axios';
import './style.css';

const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);

class Competency extends Component {

    state = {
        loading: false,

        activePage: 1,
        total: 0,
        size: 10,
        loadingData: false,
        tableData: [],
        selectedItem: null,
        Items: [],
        form: {
        },
        isCreateLoading: false,
        isShowAddModal: false,

        isShowDeleteModal: false,

        isDeleteLoading: false,
        isShowViewModal: false,
        isShowEditModal: false,
        isEditLoading: false,

        isShowUploadModal: false,
        selectedFile: null,
        bpjsLoader: [],
        validationCreateForm: {},
        keyword: "",
        units: [],
        isAutoCompleteLoading: false,
        types: [
            { name: "Kompetensi Dasar", label: "Kompetensi Dasar", value: "Kompetensi Dasar" },
            { name: "Kompetensi Managerial", label: "Kompetensi Managerial", value: "Kompetensi Managerial" },
            { name: "Kompetensi Teknis", label: "Kompetensi Teknis", value: "Kompetensi Teknis" },
            { name: "Terprogram", label: "Terprogram", value: "Terprogram" },
            { name: "Insidentil", label: "Insidentil", value: "Insidentil" },
        ],
    }

    resetFilter = () => {
        this.typeaheadBPJS.clear();
    }

    resetModalValue = () => {
        this.setState({
            validationCreateForm: {},
            form: {

            },
            Items: [],
            selectedFile: null
        })
    }

    resetPagingConfiguration = () => {
        this.setState({
            activePage: 1,
            size: 10
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

    setData = () => {
        const params = {
            page: this.state.activePage,
            size: this.state.size,
            keyword: this.state.keyword
        };

        this.setState({ loadingData: true })
        this.service
            .getCompetencies(params)
            .then((result) => {
                this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
            });
    }

    // search = () => {
    //     this.setData();
    // }

    create = () => {
        this.showAddModal(true);
    }

    upload = () => {
        this.showUploadModal(true);
    }

    showUploadModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowUploadModal: value });
    }

    showAddModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddModal: value, validationCreateForm: {} });
    }

    showDeleteModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeleteModal: value });
    }

    showViewModal = (value) => {
        this.setState({ isShowViewModal: value, validationCreateForm: {} });
    }

    showEditModal = (value) => {
        this.setState({ isShowEditModal: value, validationCreateForm: {} });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreate = () => {
        const payload = {
            Date: this.state.form?.Date,
            UnitId: this.state.form?.UnitId,
            UnitName: this.state.form?.UnitName,
            Description: this.state.form?.Description,
            Type: this.state.form?.Type,
            CompetencyItems: this.state.Items
        }
   
        this.setState({ isCreateLoading: true });
        this.service.createCompetencies(payload)
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
                    this.showAddModal(false);
                });
            })
            .catch((error) => {
                if (error.response) {
                    let message = "Cek Form Isian, Isian Mandatory tidak boleh kosong\n";

                    const errorMessage = error.response.data.error
                    // console.log(Object.keys(error).forEach(e => console.log(`key=${e}  value=${error[e]}`)));
                    Object.keys(errorMessage).forEach(e => {
                        if (e) {
                            message += `- ${errorMessage[e]}\n`
                        }
                    });

                    swal({
                        icon: 'error',
                        title: 'Data Invalid',
                        text: message
                    });

                    this.setState({ validationCreateForm: error.response.data.error, isCreateLoading: false });
                }
            });
        // console.log(payload);
    }

    handleEdit = () => {
        const payload = {
            Id: this.state.form?.Id,
            Date: moment(this.state.form?.Date).format(),
            UnitId: this.state.form?.UnitId,
            UnitName: this.state.form?.UnitName,
            Description: this.state.form?.Description,
            Type: this.state.form?.Type,
            Name: this.state.form?.Name,
            CompetencyItems: this.state.Items
        }

      
        this.setState({ isEditLoading: true });
        this.service.editCompetencies(this.state.selectedItem?.Id, payload)
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
                    this.showEditModal(false);
                });
            })
            .catch((error) => {
                this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
            });
    }
    search = (keyword) => {
        this.setState({ page: 1, keyword: keyword }, () => {
            this.setData();
        })
    }

    handleViewClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getCompetenciesById(item.Id)
            .then((competency) => {
                
                this.setState({ form: competency, Items: competency.CompetencyItems }, () => {
                    this.showViewModal(true);
                })
            })
    }

    handleEditClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getCompetenciesById(item.Id)
            .then((competency) => {
                var { types, units } = this.state;
                let type = types.find((element) => element.value === competency.Type);

                competency.Unit = {
                    Id: competency.UnitId,
                    Name: competency.UnitName,
                    value: competency.UnitId,
                    label: competency.UnitName
                };

                competency.selectedType = type;

                for (var item of competency.CompetencyItems) {
                    let type = types.find((element) => element.value === item.Type);
                  
                    item.Type = type.value;
                    item.selectedType=type;
                }
                

                this.setState({ form: competency, Items: competency.CompetencyItems  }, () => {
                    this.showEditModal(true);
                })
            })
    }

    handleDeleteClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeleteModal(true);
        })
    }

    deleteClickHandler = () => {
        this.setState({ isDeleteLoading: true })
        this.service.deleteCompetencies(this.state.selectedItem?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteLoading: false, selectedItem: null }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteModal(false);
                });
            }).catch((error) => {
                this.setState({ isDeleteLoading: false, isShowDeleteModal: false });
                if (error) {
                    swal({
                        icon: 'error',
                        title: 'Tidak bisa menghapus data',
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

    handleUpload = () => {
        this.service.uploadCompetencies(this.state.selectedFile)
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

    addItems = () => {
        var { Items } = this.state;
        Items.push({});
        this.setState({ Items: Items });
    }

    deleteItems = (item) => {
        var items = this.state.Items;
        var itemIndex = items.indexOf(item);
        items.splice(itemIndex, 1);

        this.setState({ Items: items });
    }

    render() {
        const { tableData } = this.state;

        const items = tableData.map((item, index) => {

            return (
                <tr key={item.Id} data-category={item.Id}>
                    <td>{item.UnitName}</td>
                    <td>{item.Description}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-success" name="view-compentencies" onClick={this.handleViewClick} data={item} iconClassName="fa fa-eye" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-primary" name="edit-compentencies" onClick={this.handleEditClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-compentencies" onClick={this.handleDeleteClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
                            </FormGroup>
                        </Form>
                    </td>
                </tr>
            );
        });

        var { Items } = this.state;
        var masterItems = Items.map((item, index) => {
            return (
                <tr key={index} data-category={item.Id}>

                    <td>

                        <Select
                            className={this.state.validationCreateForm?.Type ? 'invalid-select' : ''}
                            options={this.state.types}
                            name="Type"
                            value={item.selectedType}
                            onChange={(e) => {
                                var items = this.state.Items;
                                var thisItem = items[index];
                                thisItem.selectedType = e;
                                thisItem.Type = e.value;
                                this.setState({ Items: items });

                            }}
                            isInvalid={!!this.state.validationCreateForm.Type}
                        />
                        <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Type}</Form.Control.Feedback>

                    </td>
                    <td>
                        <Form.Control
                            id="Name"
                            type="text"
                            name="Name"
                            value={item.Name}
                            autoComplete="off"
                            onChange={(e) => {
                                var items = this.state.Items;
                                var thisItem = items[index];

                                thisItem.Name = e.target.value;
                                this.setState({ Items: items });
                            }}
                        />
                    </td>
                    <td className={'text-center'}>
                        <Button className="btn btn-danger" name="delete-items" onClick={() => this.deleteItems(item)}>-</Button>
                    </td>
                </tr>
            );
        });

        var viewMasterItems = Items.map((item, index) => {
            return (
                <tr key={index} data-category={item.Id}>
                     <td>
                        {item.Type}
                    </td>
                    <td>
                        {item.Name}
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
                                    <Button className="btn btn-success mr-5" name="add" onClick={this.create}>Tambah</Button>
                                    <Button className="btn btn-primary mr-5" name="upload" onClick={this.upload}>Upload</Button>
                                </Col>
                                <Col sm={4}>
                                </Col>

                                <Col sm={4}>
                                    <Form.Control
                                        className="float-right"
                                        type="text"
                                        value={this.state.keyword}
                                        onChange={(e) => {
                                            return this.search(e.target.value);
                                        }}
                                    />
                                </Col>
                            </Row>

                        </FormGroup>
                        <FormGroup>

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
                                                <th>Deskripsi</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                items.length > 0 ? items :
                                                    <tr className={'text-center'}>
                                                        <td colSpan='6' className={'align-middle text-center'}>Data Kosong</td>
                                                    </tr>
                                            }
                                        </tbody>
                                    </Table>
                                    <Pagination
                                        activePage={this.state.activePage}
                                        itemsCountPerPage={this.state.size}
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

                        <Modal  dialogClassName='custom-dialog' size={'lg'} aria-labelledby="modal_add_bpjstk" show={this.state.isShowAddModal} onHide={() => this.showAddModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal_add_competencies">Tambah Kompetensi</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Tanggal</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="date"
                                            name="Date"
                                            id="Date"
                                            value={this.state.form.Date ? moment(this.state.form.Date).format('YYYY-MM-DD') : ""}
                                            onChange={(val) => {
                                                var { form } = this.state;
                                                form["Date"] = val.target.value;
                                                return this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.Date ? true : null}>
                                        </Form.Control>
                                        <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Date}</Form.Control.Feedback>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Unit</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm.UnitId ? 'invalid-select' : ''}
                                            options={this.state.units}
                                            value={this.state.form.Unit}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["Unit"] = value;
                                                form["UnitId"] = value.Id;
                                                form["UnitName"] = value.Name;
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.UnitId ? true : null}>
                                        </Select>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Deskripsi</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            as="textarea"
                                            name="Description"
                                            value={this.state.form.Description}
                                            onChange={(e) => {
                                                var { form } = this.state;
                                                form[e.target.name] = e.target.value;
                                                return this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.Description}
                                        />
                                        <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Description}</Form.Control.Feedback>
                                    </Col>
                                </Row>
                                
                                <Row>
                                    <Col>
                                        <Form.Label></Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Table responsive bordered striped>
                                            <thead>

                                                <tr className={'text-center'}>
                                                    <th>Jenis</th>
                                                    <th>Nama</th>
                                                    <th><Button className="btn btn-primary" name="add-items" onClick={this.addItems}>+</Button></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    masterItems.length > 0 ? masterItems :
                                                        <tr className={'text-center'}>
                                                            <td colSpan='6' className={'align-middle text-center'}>Data Kosong</td>
                                                        </tr>
                                                }
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="create-competencies" onClick={this.handleCreate}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName="modal-90w" aria-labelledby="modal-upload-competencies" show={this.state.isShowUploadModal} onHide={() => this.showUploadModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-upload-competencies">Upload Kompetensi</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div>
                                    <input type="file" name="file" onChange={this.onInputFileHandler} />
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.uploadFileLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="upload_file" onClick={this.handleUpload}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal aria-labelledby="modal-delete-competencies" show={this.state.isShowDeleteModal} onHide={() => this.showDeleteModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-delete-competencies">Hapus Kompetensi</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                            <Modal.Footer>
                                {this.state.isDeleteLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-danger" name="delete-competencies" onClick={this.deleteClickHandler}>Hapus</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName='custom-dialog'  aria-labelledby="modal-edit-competencies" show={this.state.isShowEditModal} onHide={() => this.showEditModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-edit-competencies">Edit Kompetensi</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Tanggal</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="date"
                                            name="Date"
                                            id="Date"
                                            value={this.state.form.Date ? moment(this.state.form.Date).format('YYYY-MM-DD') : ""}
                                            onChange={(val) => {
                                                var { form } = this.state;
                                                form["Date"] = val.target.value;
                                                return this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.Date ? true : null}>
                                        </Form.Control>
                                        <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Date}</Form.Control.Feedback>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Unit</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm.UnitId ? 'invalid-select' : ''}
                                            options={this.state.units}
                                            value={this.state.form.Unit}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["Unit"] = value;
                                                form["UnitId"] = value.Id;
                                                form["UnitName"] = value.Name;
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.UnitId ? true : null}>
                                        </Select>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Deskripsi</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            as="textarea"
                                            name="Description"
                                            value={this.state.form.Description}
                                            onChange={(e) => {
                                                var { form } = this.state;
                                                form[e.target.name] = e.target.value;
                                                return this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.Description}
                                        />
                                        <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Description}</Form.Control.Feedback>
                                    </Col>
                                </Row>
                                
                                <Row>
                                    <Col>
                                        <Table responsive bordered striped>
                                            <thead>

                                                <tr className={'text-center'}>
                                                    <th>Jenis</th>
                                                    <th>Nama</th>
                                                    <th><Button className="btn btn-primary" name="add-items" onClick={this.addItems}>+</Button></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    masterItems.length > 0 ? masterItems :
                                                        <tr className={'text-center'}>
                                                            <td colSpan='6' className={'align-middle text-center'}>Data Kosong</td>
                                                        </tr>
                                                }
                                            </tbody>
                                        </Table>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="edit-bpjstk" onClick={this.handleEdit}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName="custom-dialog" aria-labelledby="modal-view-competencies" show={this.state.isShowViewModal} onHide={() => this.showViewModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-view-competencies">Lihat Kompetensi</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Tanggal</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.Date ? moment(this.state.form?.Date).format('DD-MM-YYYY') : ""}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Unit</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.UnitName}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Deskripsi</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.Description}</Form.Label>
                                    </Col>
                                </Row>
                                
                                <Row>
                                        <Col >
                                            <Table bordered striped>
                                                <thead>
                                                    <tr className={'text-center'}>
                                                        <th>Jenis Kompetensi</th>
                                                        <th>Nama Kompetensi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        viewMasterItems.length > 0 ? viewMasterItems :
                                                            <tr className={'text-center'}>
                                                                <td colSpan='7' className={'align-middle text-center'}>Data Kosong</td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </Table>
                                        </Col>
                                    </Row>
                            </Modal.Body>
                            <Modal.Footer>
                            </Modal.Footer>
                        </Modal>

                    </Form>
                )
                }

            </div>
        );
    }
}

export default Competency;
