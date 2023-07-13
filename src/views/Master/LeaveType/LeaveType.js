import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';

import Service from './Service';
import swal from 'sweetalert';

import './style.css';

const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);

class LeaveType extends Component {

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
        isShowAddLeaveTypeModal: false,

        isShowDeleteLeaveTypeModal: false,

        isShowEditLeaveTypeModal: false,
        isEditLoading: false,

        isShowUploadModal: false,
        selectedFile: null,
        selectedLeaveTypeFilter:"",

        validationCreateForm: {},

        types: [
            { name: "", label: "", value: "" },
            { name: "Bulanan", label: "Bulanan", value: "Bulanan" },
            { name: "Tahunan", label: "Tahunan", value: "Tahunan" }
        ],
        annualLeaveOptions: [
            { name: "YA", label: "YA", value: true },
            { name: "TIDAK", label: "TIDAK", value: false }
        ]
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
            keyword:this.state.selectedLeaveTypeFilter
        };

        this.setState({ loadingData: true })
        this.service
            .search(params)
            .then((result) => {
                this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
            });
    }

    // setUnit = () => {
    //     const params = {
    //         page: this.state.activePage
    //     };

    //     this.setState({ loadingData: true })
    //     this.service
    //         .getAllUnits()
    //         .then((result) => {
    //             this.setState({ units: result, loadingData: false })
    //         });
    // }

    search = (keyword) => {
      this.setState({selectedLeaveTypeFilter:keyword ,page:1},()=>this.setData())

    }

    create = () => {
        this.showAddLeaveTypeModal(true);
    }

    upload = () => {
        this.showUploadModal(true);
    }

    showUploadModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowUploadModal: value });
    }

    showAddLeaveTypeModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddLeaveTypeModal: value, validationCreateForm: {} });
    }

    showDeleteLeaveTypeModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeleteLeaveTypeModal: value });
    }

    showEditLeaveTypeModal = (value) => {
        this.setState({ isShowEditLeaveTypeModal: value });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreateLeaveType = () => {
        const payload = {
            Code: this.state.form?.Code,
            Name: this.state.form?.Name,
            Type: this.state.form?.Type,
            Quota: this.state.form?.Quota,
            IsDeductedFromAnnualLeave: this.state.form?.IsDeductedFromAnnualLeave
        }

        this.setState({ isCreateLoading: true });
        this.service.create(payload)
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
                    this.showAddLeaveTypeModal(false);
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

    handleEditLeaveType = () => {
        const payload = {
            Code: this.state.form?.Code,
            Name: this.state.form?.Name,
            Type: this.state.form?.Type,
            Quota: this.state.form?.Quota,
            IsDeductedFromAnnualLeave: this.state.form?.IsDeductedFromAnnualLeave
        }

        this.setState({ isEditLoading: true });
        this.service.edit(this.state.selectedItem?.Id, payload)
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
                    this.showEditLeaveTypeModal(false);
                });
            })
            .catch((error) => {
                this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
            });
    }

    handleEditLeaveTypeClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getById(item.Id)
            .then((leaveType) => {
                const { types, annualLeaveOptions } = this.state;
                let type = types.find((element) => element.value == leaveType.Type);
                let isDeductedFromAnnualLeave = types.find((element) => element.value == leaveType.IsDeductedFromAnnualLeave);
                leaveType["type"] = type;
                leaveType["isDeductedFromAnnualLeave"] = isDeductedFromAnnualLeave;
                this.setState({ form: leaveType }, () => {
                    this.showEditLeaveTypeModal(true);
                })
            })
    }

    handleDeleteLeaveTypeClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeleteLeaveTypeModal(true);
        })
    }

    deleteLeaveTypeClickHandler = () => {
        this.setState({ isDeleteLeaveTypeLoading: true })
        this.service.delete(this.state.selectedItem?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteLeaveTypeLoading: false, selectedItem: null }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteLeaveTypeModal(false);
                });
            }).catch((error) => {
                this.setState({ isDeleteLeaveTypeLoading: false, isShowDeleteLeaveTypeModal: false });
                if (error) {
                    swal({
                        icon: 'error',
                        title: 'Tidak bisa menghapus jenis cuti',
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

    handleUploadLeaveType = () => {
        this.service.uploadLeaveType(this.state.selectedFile)
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
                    <td>{item.Code}</td>
                    <td>{item.Name}</td>
                    <td>{item.Type}</td>
                    <td>{item.Quota}</td>
                    <td>{item.IsDeductedFromAnnualLeave ? "YA" : "TIDAK"}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-primary" name="edit-leaveType" onClick={this.handleEditLeaveTypeClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-leaveType" onClick={this.handleDeleteLeaveTypeClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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
                                        <Button className="btn btn-success mr-5" name="add_leaveType" onClick={this.create}>Tambah Jenis Cuti</Button>
                                    </Col>
                                  <Col sm={4}>

                                  </Col>
                                  <Col sm={4}>
                                    <Form.Control
                                      className="float-right"
                                      type="text"
                                      name="keyword"
                                      value={this.state.selectedLeaveTypeFilter}
                                      onChange={(e) => {
                                        return this.search(e.target.value);
                                      }}
                                      placeholder="Cari jenis cuti"
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
                                                        <th>Kode</th>
                                                        <th>Nama Izin</th>
                                                        <th>Periode Izin</th>
                                                        <th>Jumlah Hari</th>
                                                        <th>Potong Cuti Tahunan</th>
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

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal_add_leaveType" show={this.state.isShowAddLeaveTypeModal} onHide={() => this.showAddLeaveTypeModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal_add_leaveType">Tambah Jenis Cuti</Modal.Title>
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
                                            <Form.Label>Periode Cuti/Izin</Form.Label>
                                        </Col>
                                        <Col>
                                            <Select
                                                className={this.state.validationCreateForm.Type ? 'invalid-select' : ''}
                                                options={this.state.types}
                                                value={this.state.form.type}
                                                onChange={(value) => {
                                                    var { form } = this.state;
                                                    form["type"] = value;
                                                    form["Type"] = value.value;
                                                    this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Type ? true : null}>
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Jumlah Cuti</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="Quota"
                                                value={this.state.form.Quota}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Quota}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Quota}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Potong Cuti Tahunan</Form.Label>
                                        </Col>
                                        <Col>
                                            <Select
                                                className={this.state.validationCreateForm.IsDeductedFromAnnualLeave ? 'invalid-select' : ''}
                                                options={this.state.annualLeaveOptions}
                                                value={this.state.isDeductedFromAnnualLeave}
                                                onChange={(value) => {
                                                    var { form } = this.state;
                                                    form["isDeductedFromAnnualLeave"] = value;
                                                    form["IsDeductedFromAnnualLeave"] = value.value;
                                                    this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.IsDeductedFromAnnualLeave}>
                                            </Select>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="create-leaveType" onClick={this.handleCreateLeaveType}>Submit</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal aria-labelledby="modal-delete-leaveType" show={this.state.isShowDeleteLeaveTypeModal} onHide={() => this.showDeleteLeaveTypeModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-delete-leaveType">Hapus LeaveType</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isDeleteLeaveTypeLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-danger" name="delete-leaveType" onClick={this.deleteLeaveTypeClickHandler}>Hapus</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-leaveType" show={this.state.isShowEditLeaveTypeModal} onHide={() => this.showEditLeaveTypeModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-edit-leaveType">Edit Jenis Cuti</Modal.Title>
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
                                            <Form.Label>Periode Cuti/Izin</Form.Label>
                                        </Col>
                                        <Col>
                                            <Select
                                                className={this.state.validationCreateForm.Type ? 'invalid-select' : ''}
                                                options={this.state.types}
                                                value={this.state.form.type}
                                                onChange={(value) => {
                                                    var { form } = this.state;
                                                    form["type"] = value;
                                                    form["Type"] = value.value;
                                                    this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Type ? true : null}>
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Jumlah Cuti</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="number"
                                                name="Quota"
                                                value={this.state.form.Quota}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Quota}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Quota}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Potong Cuti Tahunan</Form.Label>
                                        </Col>
                                        <Col>
                                            <Select
                                                className={this.state.validationCreateForm.IsDeductedFromAnnualLeave ? 'invalid-select' : ''}
                                                options={this.state.annualLeaveOptions}
                                                value={this.state.isDeductedFromAnnualLeave}
                                                onChange={(value) => {
                                                    var { form } = this.state;
                                                    form["isDeductedFromAnnualLeave"] = value;
                                                    form["IsDeductedFromAnnualLeave"] = value.value;
                                                    this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.IsDeductedFromAnnualLeave}>
                                            </Select>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="edit-leaveType" onClick={this.handleEditLeaveType}>Submit</Button>
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

export default LeaveType;
