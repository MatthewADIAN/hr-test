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

class BPJSKetenagakerjaan extends Component {

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
        isShowEditModal: false,
        isEditLoading: false,

        isShowUploadModal: false,
        selectedFile: null,
        bpjsLoader: [],
        validationCreateForm: {},
        selectedBPJSFilter: "",

        isAutoCompleteLoading: false
    }

    resetFilter = () => {
        this.typeaheadBPJS.clear();
    }

    resetModalValue = () => {
        this.setState({
            validationCreateForm: {},
            form: {
                JKKPerusahaan: 0,
                JKKKaryawan: 0,
                JKMPerusahaan: 0,
                JKMKaryawan: 0,
                JHTPerusahaan: 0,
                JHTKaryawan: 0,
                JPPerusahaan: 0,
                JPKaryawan: 0
            },
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
    }

    setData = () => {
        const params = {
            page: this.state.activePage,
            size: this.state.size,
            keyword: this.state.selectedBPJSFilter
        };

        this.setState({ loadingData: true })
        this.service
            .getBPJSTKs(params)
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
            Code: this.state.form?.Code,
            Description: this.state.form?.Description,
            BPJSKetenagakerjaanItems: this.state.Items
        }

        this.setState({ isCreateLoading: true });
        this.service.createBPJSTK(payload)
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
                    this.setState({ validationCreateForm: error.response.data.error, isCreateLoading: false });
                    // console.log(this.state);
                }
                // console.log(error)
            });
        // console.log(payload);
    }

    handleEdit = () => {
        const payload = {
            Id: this.state.form?.Id,
            Code: this.state.form?.Code,
            Description: this.state.form?.Description,
            BPJSKetenagakerjaanItems: this.state.Items
        }

        this.setState({ isEditLoading: true });
        this.service.editBPJSTK(this.state.selectedItem?.Id, payload)
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
        this.setState({ page: 1, selectedBPJSFilter: keyword }, () => {
            this.setData();
        })
    }

    handleEditClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getBPJSTKById(item.Id)
            .then((bpjs) => {
                this.setState({ form: bpjs, Items: bpjs.BPJSKetenagakerjaanItems }, () => {
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
        this.service.deleteBPJSTK(this.state.selectedItem?.Id)
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

    handleBPJSSearch = (query) => {
        this.setState({ isAutoCompleteLoading: true });


        let url = `${CONST.URI_ATTENDANCE}bpjs-tk?keyword=${query}`;

        axios({
            method: 'GET',
            url: url,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ` + localStorage.getItem('token'),
                'x-timezone-offset': moment().utcOffset() / 60
            },
        }).then(result => {
            let items = result.data.Data.map((datum) => {
                if (datum.Description)
                    datum.CodeAndDescription = `${datum.Code} - ${datum.Description}`;
                else
                    datum.CodeAndDescription = `${datum.Code}`;
                return datum;
            });
            this.setState({ bpjsLoader: items });
            this.setState({ isAutoCompleteLoading: false });
        }).catch((e) => {
            this.setState({ isAutoCompleteLoading: false });
        });
    }

    handleUpload = () => {
        this.service.uploadBPJSTK(this.state.selectedFile)
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
                    <td>{item.Code}</td>
                    <td>{item.Description}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-primary" name="edit-bpjstk" onClick={this.handleEditClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-bpjstk" onClick={this.handleDeleteClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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
                        <Form.Control
                            type="text"
                            name="Type"
                            value={item.Type}
                            onChange={(e) => {
                                var items = this.state.Items;
                                var thisItem = items[index];

                                thisItem.Type = e.target.value;
                                this.setState({ Items: items });
                            }}
                        />
                    </td>
                    <td>
                        <Form.Control
                            type="number"
                            name="CompanyPercentage"
                            value={item.CompanyPercentage}
                            onChange={(e) => {
                                var items = this.state.Items;
                                var thisItem = items[index];

                                thisItem.CompanyPercentage = e.target.value;
                                this.setState({ Items: items });
                            }}
                        />
                    </td>
                    <td>
                        <Form.Control
                            type="number"
                            name="EmployeePercentage"
                            value={item.EmployeePercentage}
                            onChange={(e) => {
                                var items = this.state.Items;
                                var thisItem = items[index];

                                thisItem.EmployeePercentage = e.target.value;
                                this.setState({ Items: items });
                            }}
                        />
                    </td>
                    <td>
                        <Button className="btn btn-danger" name="delete-items" onClick={() => this.deleteItems(item)}>-</Button>
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
                                    </Col>
                                    <Col sm={4}></Col>

                                    <Col sm={4}>
                                        <Form.Control
                                            className="float-right"
                                            type="text"
                                            name="Code"
                                            value={this.state.selectedBPJSFilter}
                                            onChange={(e) => {
                                                return this.search(e.target.value);
                                            }}
                                            placeholder="  cari bpjs"
                                        />
                                        {/* <AsyncTypeahead
                                            id="loader-bpjs"
                                            ref={typeahead => this.typeaheadBPJS = typeahead}
                                            isLoading={this.state.isAutoCompleteLoading}
                                            onChange={(selected) => {
                                                this.setState({ selectedBPJSFilter: selected[0] });
                                            }}
                                            labelKey="CodeAndDescription"
                                            minLength={1}
                                            onSearch={this.handleBPJSSearch}
                                            options={this.state.bpjsLoader}
                                            placeholder="Cari bpjs..."
                                        /> */}
                                    </Col>
                                </Row>

                            </FormGroup>
                            <FormGroup>

                                {/* <Row>
                                    <Col sm={4}>
                                        <Button className="btn btn-info mr-2" name="search" onClick={this.search}>Cari</Button>
                                        <Button className="btn btn-light mr-5" name="reset"
                                            onClick={this.resetFilter}>Reset</Button>
                                    </Col>
                                </Row> */}
                            </FormGroup>


                            <FormGroup>
                                {this.state.loadingData ? (
                                    <span><Spinner size="sm" color="primary" /> Loading Data...</span>
                                ) : (
                                        <Row>
                                            <Table responsive bordered striped>
                                                <thead>
                                                    <tr className={'text-center'}>
                                                        <th>Kode</th>
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

                            <Modal dialogClassName="modal-100w" aria-labelledby="modal_add_bpjstk" show={this.state.isShowAddModal} onHide={() => this.showAddModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal_add_bpjstk">Tambah BPJS Ketenagakerjaan</Modal.Title>
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
                                                        <th>Jenis Beban</th>
                                                        <th>Beban Perusahaan</th>
                                                        <th>Beban Karyawan</th>
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
                                    {/* <Row>
                                        <Form.Label style={{ 'fontWeight': 'bold' }} column={true}>JKK "Jaminan Kerja Kecelakaan"</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Perusahaan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JKKPerusahaan"
                                                value={this.state.form.JKKPerusahaan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Karyawan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JKKKaryawan"
                                                value={this.state.form.JKKKaryawan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Label></Form.Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Form.Label style={{ 'fontWeight': 'bold' }} column={true}>JKM "Jaminan Kerja Kematian"</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Perusahaan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JKMPerusahaan"
                                                value={this.state.form.JKMPerusahaan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Karyawan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JKMKaryawan"
                                                value={this.state.form.JKMKaryawan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Label></Form.Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Form.Label style={{ 'fontWeight': 'bold' }} column={true}>JHT "Jaminan Hari Tua"</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Perusahaan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JHTPerusahaan"
                                                value={this.state.form.JHTPerusahaan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Karyawan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JHTKaryawan"
                                                max="100"
                                                value={this.state.form.JHTKaryawan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Label></Form.Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Form.Label style={{ 'fontWeight': 'bold' }} column={true}>JP "Jaminan Pensiun"</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Perusahaan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JPPerusahaan"
                                                value={this.state.form.JPPerusahaan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Karyawan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JPKaryawan"
                                                max="100"
                                                value={this.state.form.JPKaryawan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row> */}
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="create-bpjstk" onClick={this.handleCreate}>Submit</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-100w" aria-labelledby="modal-upload-bpjstk" show={this.state.isShowUploadModal} onHide={() => this.showUploadModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-upload-bpjstk">Upload BPJS Ketenagakerjaan</Modal.Title>
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

                            <Modal aria-labelledby="modal-delete-bpjstk" show={this.state.isShowDeleteModal} onHide={() => this.showDeleteModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-delete-bpjstk">Hapus BPJS Ketenagakerjaan</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isDeleteLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-danger" name="delete-bpjstk" onClick={this.deleteClickHandler}>Hapus</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-100w" aria-labelledby="modal-edit-bpjstk" show={this.state.isShowEditModal} onHide={() => this.showEditModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-edit-bpjstk">Edit BPJS Ketenagakerjaan</Modal.Title>
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
                                                        <th>Jenis Beban</th>
                                                        <th>Beban Perusahaan</th>
                                                        <th>Beban Karyawan</th>
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
                                    {/* <Row>
                                        <Form.Label style={{ 'fontWeight': 'bold' }} column={true}>JKK "Jaminan Kerja Kecelakaan"</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Perusahaan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JKKPerusahaan"
                                                value={this.state.form.JKKPerusahaan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Karyawan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JKKKaryawan"
                                                value={this.state.form.JKKKaryawan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Label></Form.Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Form.Label style={{ 'fontWeight': 'bold' }} column={true}>JKM "Jaminan Kerja Kematian"</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Perusahaan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JKMPerusahaan"
                                                value={this.state.form.JKMPerusahaan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Karyawan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JKMKaryawan"
                                                value={this.state.form.JKMKaryawan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Label></Form.Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Form.Label style={{ 'fontWeight': 'bold' }} column={true}>JHT "Jaminan Hari Tua"</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Perusahaan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JHTPerusahaan"
                                                value={this.state.form.JHTPerusahaan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Karyawan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JHTKaryawan"
                                                max="100"
                                                value={this.state.form.JHTKaryawan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Label></Form.Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Form.Label style={{ 'fontWeight': 'bold' }} column={true}>JP "Jaminan Pensiun"</Form.Label>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Perusahaan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JPPerusahaan"
                                                value={this.state.form.JPPerusahaan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label style={{ 'marginLeft': '10px' }}>Karyawan (%)</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="JPKaryawan"
                                                max="100"
                                                value={this.state.form.JPKaryawan}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                            />
                                        </Col>
                                    </Row> */}
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="edit-bpjstk" onClick={this.handleEdit}>Submit</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                        </Form>
                    )
                }

            </div>
        );
    }
}

export default BPJSKetenagakerjaan;
