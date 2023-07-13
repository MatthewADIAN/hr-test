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
import * as CONST from "../../../Constant";
import axios from "axios";

import './style.css';
import { element } from 'prop-types';

const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);

class EmployeeClass extends Component {

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
        isShowAddEmployeeClassModal: false,

        isShowDeleteEmployeeClassModal: false,

        isShowEditEmployeeClassModal: false,
        isEditLoading: false,

        isShowUploadModal: false,
        selectedFile: null,
        selectedEmployeeClassFilter: "",

        units: [],
        positions: [],
        grades: [
            { name: "1", label: "1", value: 1 },
            { name: "2", label: "2", value: 2 },
            { name: "3", label: "3", value: 3 },
            { name: "4", label: "4", value: 4 },
            { name: "5", label: "5", value: 5 },
            { name: "6", label: "6", value: 6 },
            { name: "7", label: "7", value: 7 },
            { name: "8", label: "8", value: 8 },
            { name: "9", label: "9", value: 9 },
            { name: "10", label: "10", value: 10 },
            { name: "11", label: "11", value: 11 },
            { name: "12", label: "12", value: 12 },
            { name: "13", label: "13", value: 13 },
            { name: "14", label: "14", value: 14 },
            { name: "15", label: "15", value: 15 },
            { name: "16", label: "16", value: 16 },
            { name: "17", label: "17", value: 17 },
            { name: "18", label: "18", value: 18 },
        ],
        columns: [
            { label: "Kode Unit", accessor: "CodeUnit" },
            { label: "Nama Unit", accessor: "UnitName" },
            { label: "Kode Jabatan", accessor: "CodePosition" },
            { label: "Nama Jabatan", accessor: "NamePosition" },
            { label: "Grade", accessor: "Grade" },
            { label: "Nama Golongan", accessor: "NameClass" },
        ],
        sortField: "",
        orderType: "asc",

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
        this.setUnit();
        this.setPosition();
    }

    setData = () => {
        const params = {
            page: this.state.activePage,
            keyword: this.state.selectedEmployeeClassFilter,
            order: {
                [`${this.state.sortField}`]: `${this.state.orderType}`
            }
        };

        this.setState({ loadingData: true })
        this.service
            .getEmployeeClass(params)
            .then((result) => {
                console.log(result);
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

    setPosition = () => {
        const params = {
            page: this.state.activePage
        };

        this.setState({ loadingData: true })
        this.service
            .getAllPositions()
            .then((result) => {
                this.setState({ positions: result, loadingData: false })
            });
    }

    search = (keyword) => {
        this.setState({ page: 1, selectedEmployeeClassFilter: keyword }, () => {
            this.setData();
        })
    }

    create = () => {
        this.showAddEmployeeClassModal(true);
    }

    upload = () => {
        this.showUploadModal(true);
    }

    showUploadModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowUploadModal: value });
    }

    showAddEmployeeClassModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddEmployeeClassModal: value, validationCreateForm: {} });
    }

    showDeleteEmployeeClassModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeleteEmployeeClassModal: value });
    }

    showEditEmployeeClassModal = (value) => {
        this.setState({ isShowEditEmployeeClassModal: value });
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

    handleCreateEmployeeClass = () => {
        const payload = {
            IdUnit: this.state.form?.IdUnit,
            CodeUnit: this.state.form?.CodeUnit,
            UnitName: this.state.form?.UnitName,
            IdPosition: this.state.form?.IdPosition,
            CodePosition: this.state.form?.CodePosition,
            NamePosition: this.state.form?.NamePosition,
            Grade: this.state.form?.Grade,
            NameClass: this.state.form?.NameClass,
        }

        this.setState({ isCreateLoading: true });
        this.service.createEmployeeClass(payload)
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
                    this.showAddEmployeeClassModal(false);
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

    handleEditEmployeeClass = () => {
        const payload = {
            IdUnit: this.state.form?.IdUnit,
            CodeUnit: this.state.form?.CodeUnit,
            UnitName: this.state.form?.UnitName,
            IdPosition: this.state.form?.IdPosition,
            CodePosition: this.state.form?.CodePosition,
            NamePosition: this.state.form?.NamePosition,
            Grade: this.state.form?.Grade,
            NameClass: this.state.form?.NameClass,
        }

        this.setState({ isEditLoading: true });
        this.service.editEmployeeClass(this.state.selectedItem?.Id, payload)
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
                    this.showEditEmployeeClassModal(false);
                });
            })
            .catch((error) => {
                this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false, isShowEditEmployeeClassModal: false, sortField: "", orderType: "asc" });
                if (error) {
                    swal({
                        icon: 'error',
                        title: 'Tidak bisa mengedit Golongan',
                        text: error.response.data.error[Object.keys(error.response.data.error)[0]]
                    })
                }
            });
    }

    handleEditEmployeeClassClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getEmployeeClassById(item.Id)
            .then((EmployeeClass) => {
                const { form, units, positions, grades } = this.state;

                let unit = units.find((element) => element.Id == EmployeeClass.IdUnit);

                EmployeeClass["unit"] = unit;
                EmployeeClass["IdUnit"] = unit?.Id;
                EmployeeClass["CodeUnit"] = unit?.Code;
                EmployeeClass["UnitName"] = unit?.Name;

                let position = positions.find((element) => element.Id == EmployeeClass.IdPosition);

                EmployeeClass["position"] = position;
                EmployeeClass["IdPosition"] = position?.Id;
                EmployeeClass["CodePosition"] = position?.Code;
                EmployeeClass["NamePosition"] = position?.Name;

                let grade = grades.find((element) => element.value == EmployeeClass.Grade);

                console.log(unit);
                console.log(position);
                console.log(grade);

                EmployeeClass["grade"] = grade;
                EmployeeClass["Grade"] = grade.value;

                // console.log(unit);
                // console.log(position);
                // console.log(grade);

                console.log(EmployeeClass);

                this.setState({ form: EmployeeClass }, () => {
                    this.showEditEmployeeClassModal(true);
                })
            })
    }

    handleDeleteEmployeeClassClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeleteEmployeeClassModal(true);
        })
    }

    deleteEmployeeClassClickHandler = () => {
        this.setState({ isDeleteEmployeeClassLoading: true })
        this.service.deleteEmployeeClass(this.state.selectedItem?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteEmployeeClassLoading: false, selectedItem: null, sortField: "", orderType: "asc" }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteEmployeeClassModal(false);
                });
            })
            .catch((error) => {
                this.setState({ isDeleteEmployeeClassLoading: false, isShowDeleteEmployeeClassModal: false, sortField: "", orderType: "asc" });
                if (error) {
                    swal({
                        icon: 'error',
                        title: 'Tidak bisa menghapus Golongan',
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

    handleUploadEmployeeClass = async () => {
        var data = new FormData();
        data.append("file", this.state.selectedFile);

        const url = `${CONST.URI_ATTENDANCE}employee-class/upload`;
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

        // this.service.uploadEmployeeClass(this.state.selectedFile)
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
                    <td>{item.CodeUnit}</td>
                    <td>{item.UnitName}</td>
                    <td>{item.CodePosition}</td>
                    <td>{item.NamePosition}</td>
                    <td>{item.Grade}</td>
                    <td>{item.NameClass}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-primary" name="edit-unit" onClick={this.handleEditEmployeeClassClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-unit" onClick={this.handleDeleteEmployeeClassClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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
                                    <Button className="btn btn-success mr-3" name="add_unit" onClick={this.create}>Tambah Golongan</Button>
                                    <Button className="btn btn-primary mr-3" name="upload_unit" onClick={this.upload}>Upload Golongan</Button>
                                </Col>

                                <Col sm={4}>

                                </Col>

                                <Col sm={4}>
                                    <Form.Control
                                        className="float-right"
                                        type="text"
                                        name="keyword"
                                        value={this.state.selectedEmployeeClassFilter}
                                        onChange={(e) => {
                                            return this.search(e.target.value);
                                        }}
                                        placeholder="Cari Golongan"
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

                        <Modal dialogClassName="modal-90w" aria-labelledby="modal_add_unit" show={this.state.isShowAddEmployeeClassModal} onHide={() => this.showAddEmployeeClassModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal_add_unit">Tambah Golongan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Unit</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={(this.state.validationCreateForm.IdUnit || this.state.validationCreateForm.CodeUnit || this.state.validationCreateForm.UnitName) ? 'invalid-select' : ''}
                                            options={this.state.units}
                                            value={this.state.form.unit}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["unit"] = value;
                                                form["IdUnit"] = value.Id;
                                                form["CodeUnit"] = value.Code;
                                                form["UnitName"] = value.Name;
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={(this.state.validationCreateForm.IdUnit || this.state.validationCreateForm.CodeUnit || this.state.validationCreateForm.UnitName) ? true : null}>
                                        </Select>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Jabatan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={(this.state.validationCreateForm.IdPosition || this.state.validationCreateForm.CodePosition || this.state.validationCreateForm.NamePosition) ? 'invalid-select' : ''}
                                            options={this.state.positions}
                                            value={this.state.form.position}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["position"] = value;
                                                form["IdPosition"] = value.Id;
                                                form["CodePosition"] = value.Code;
                                                form["NamePosition"] = value.Name;
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={(this.state.validationCreateForm.IdPosition || this.state.validationCreateForm.CodePosition || this.state.validationCreateForm.NamePosition) ? true : null}>
                                        </Select>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Grade</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm.Grade ? 'invalid-select' : ''}
                                            options={this.state.grades}
                                            value={this.state.form.grade}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["Grade"] = value.value;
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.Grade ? true : null}>
                                        </Select>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Nama Golongan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="Name"
                                            value={this.state.form.NameClass}
                                            onChange={(e) => {
                                                var { form } = this.state;
                                                form[e.target.name] = e.target.value;
                                                form["NameClass"] = e.target.value;
                                                return this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.NameClass || this.state.validationCreateForm.Duplicate}
                                        />
                                        <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.NameClass ? this.state.validationCreateForm.NameClass : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="create-unit" onClick={this.handleCreateEmployeeClass}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName="modal-90w" aria-labelledby="modal-set-jadwal" show={this.state.isShowUploadModal} onHide={() => this.showUploadModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-set-jadwal">Upload Golongan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div>
                                    <input type="file" name="file" onChange={this.onInputFileHandler} />
                                </div>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.uploadFileLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="upload_file" onClick={this.handleUploadEmployeeClass}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal aria-labelledby="modal-delete-unit" show={this.state.isShowDeleteEmployeeClassModal} onHide={() => this.showDeleteEmployeeClassModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-delete-unit">Hapus Golongan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Apakah anda yakin ingin menghapus data ini?
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isDeleteEmployeeClassLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-danger" name="delete-unit" onClick={this.deleteEmployeeClassClickHandler}>Hapus</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-unit" show={this.state.isShowEditEmployeeClassModal} onHide={() => this.showEditEmployeeClassModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-edit-unit">Edit Golongan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Unit</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={(this.state.validationCreateForm.IdUnit || this.state.validationCreateForm.CodeUnit || this.state.validationCreateForm.UnitName) ? 'invalid-select' : ''}
                                            options={this.state.units}
                                            value={this.state.form.unit}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["unit"] = value;
                                                form["IdUnit"] = value.Id;
                                                form["CodeUnit"] = value.Code;
                                                form["UnitName"] = value.Name;
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={(this.state.validationCreateForm.IdUnit || this.state.validationCreateForm.CodeUnit || this.state.validationCreateForm.UnitName) ? true : null}>
                                        </Select>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Jabatan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={(this.state.validationCreateForm.IdPosition || this.state.validationCreateForm.CodePosition || this.state.validationCreateForm.NamePosition) ? 'invalid-select' : ''}
                                            options={this.state.positions}
                                            value={this.state.form.position}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["position"] = value;
                                                form["IdPosition"] = value.Id;
                                                form["CodePosition"] = value.Code;
                                                form["NamePosition"] = value.Name;
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={(this.state.validationCreateForm.IdPosition || this.state.validationCreateForm.CodePosition || this.state.validationCreateForm.NamePosition) ? true : null}>
                                        </Select>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Grade</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm.Grade ? 'invalid-select' : ''}
                                            options={this.state.grades}
                                            value={this.state.form.grade}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["grade"] = value;
                                                form["Grade"] = value.value;
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.Grade ? true : null}>
                                        </Select>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Nama Golongan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            type="text"
                                            name="Name"
                                            value={this.state.form.NameClass}
                                            onChange={(e) => {
                                                var { form } = this.state;
                                                form[e.target.name] = e.target.value;
                                                form["NameClass"] = e.target.value;
                                                return this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.NameClass || this.state.validationCreateForm.Duplicate}
                                        />
                                        <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.NameClass ? this.state.validationCreateForm.NameClass : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="edit-unit" onClick={this.handleEditEmployeeClass}>Submit</Button>
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

export default EmployeeClass;
