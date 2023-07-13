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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CurrencyInput from 'react-currency-input-field';
const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);
const Kompetensi_Dasar = "Kompetensi Dasar";
const Kompetensi_Managerial = "Kompetensi Managerial";
const Kompetensi_Teknis = "Kompetensi Teknis";
class StandardPayRise extends Component {

    resetModalValue = () => {
        this.setState({
            validationCreateForm: {},
            form: {
            },
            Items: [],
            grades: [],
            employmentClasses: [],
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
        this.state = {
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
            basicCompetencies: [],
            managerialCompetencies: [],
            technicCompetencies: [],
            competencies: [],
            isAutoCompleteLoading: false,
            types: [
                { name: "Kompetensi Dasar", label: "Kompetensi Dasar", value: "Kompetensi Dasar" },
                { name: "Kompetensi Managerial", label: "Kompetensi Managerial", value: "Kompetensi Managerial" },
                { name: "Kompetensi Teknis", label: "Kompetensi Teknis", value: "Kompetensi Teknis" },
            ],
            roleEmployees: [],
            allGrades: [],
            grades: [],
            allEmployementClasses: [],
            employmentClasses: [],
            mainIncome: "",
        }
    }

    componentDidMount() {
        this.setData();
        this.getAllRoleEmployees();
        this.getAllGrades();
        this.getAllEmploymentClasses();
    }

    setData = () => {
        const params = {
            page: this.state.activePage,
            size: this.state.size,
            keyword: this.state.keyword
        };

        this.setState({ loadingData: true })
        this.service
            .getStandardPayRises(params)
            .then((result) => {
                this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
            });
    }

    getAllRoleEmployees = () => {
        this.setState({ loading: true });

        const url = `${CONST.URI_ATTENDANCE}positions?size=10000`;
        const headers = {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ` + localStorage.getItem("token"),
            "x-timezone-offset": moment().utcOffset() / 60,
        };
        axios
            .get(url, { headers: headers })
            .then((data) => {
                var roleEmployees = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });

                this.setState({ roleEmployees: roleEmployees }, () => {
                    this.setState({ loading: false });
                });
            })
            .catch(() => {
                swal({
                    icon: "error",
                    title: "Oops...",
                    text: "Terjadi kesalahan!",
                });
                this.setState({ loading: false });
            });
    };

    getAllGrades = () => {
        this.setState({ loading: true });

        const url = `${CONST.URI_ATTENDANCE}employee-class?size=10000`;
        const headers = {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ` + localStorage.getItem("token"),
            "x-timezone-offset": moment().utcOffset() / 60,
        };
        axios
            .get(url, { headers: headers })
            .then((data) => {
                var allGrades = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Grade;
                    return datum;
                });

                this.setState({ allGrades: allGrades }, () => {
                    this.setState({ loading: false });
                });
            })
            .catch(() => {
                swal({
                    icon: "error",
                    title: "Oops...",
                    text: "Terjadi kesalahan!",
                });
                this.setState({ loading: false });
            });

    }

    getAllEmploymentClasses = () => {
        this.setState({ loading: true });

        const url = `${CONST.URI_ATTENDANCE}employee-class?size=10000`;
        const headers = {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ` + localStorage.getItem("token"),
            "x-timezone-offset": moment().utcOffset() / 60,
        };
        axios
            .get(url, { headers: headers })
            .then((data) => {
                var allEmployementClasses = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.NameClass;
                    return datum;
                });

                this.setState({ allEmployementClasses: allEmployementClasses }, () => {
                    this.setState({ loading: false });
                });
            })
            .catch(() => {
                swal({
                    icon: "error",
                    title: "Oops...",
                    text: "Terjadi kesalahan!",
                });
                this.setState({ loading: false });
            });
    }

    getGradeByPositionId = (positionId) => {
        let res = this.state.allGrades.filter(d => d.PositionId === positionId);
        this.setState({ grades: res, employmentClasses: [] })
    }

    getEmploymentClassesByGrade = (grade) => {
        let res = this.state.allEmployementClasses.filter(d => d.Grade === grade && d.PositionId === this.state.form.SelectedNamePosition.value);
        this.setState({ employmentClasses: res })
    }

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
        if (!value)
            this.resetModalValue();
        this.setState({ isShowViewModal: value, validationCreateForm: {} });
    }

    showEditModal = (value) => {
        if (!value)
            this.resetModalValue();
        this.setState({ isShowEditModal: value, validationCreateForm: {} });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreate = () => {
        const payload = {
            Period: this.state.form?.Period,
            EmployeeClassId: this.state.form?.EmployeeClassId,
            NamePosition: this.state.form?.NamePosition,
            EmployeeGrade: this.state.form?.EmployeeGrade,
            EmploymentClass: this.state.form?.EmploymentClass,
            BaseSalary: this.state.form?.BaseSalary,
            MealAllowance: this.state.form?.MealAllowance,
            AchievementBonus: this.state.form?.AchievementBonus,
            LeaderAllowance: this.state.form?.LeaderAllowance,
            StandardRise: this.state.form?.StandardRise
        }

        this.setState({ isCreateLoading: true });
        this.service.createStandardPayRises(payload)
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
                        if (e && typeof errorMessage[e] == "string") {
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
    }

    handleEdit = () => {
        const payload = {
            Id: this.state.form?.Id,
            Period: this.state.form?.Period,
            EmployeeClassId: this.state.form?.EmployeeClassId,
            NamePosition: this.state.form?.NamePosition,
            EmployeeGrade: this.state.form?.EmployeeGrade,
            EmploymentClass: this.state.form?.EmploymentClass,
            BaseSalary: this.state.form?.BaseSalary,
            MealAllowance: this.state.form?.MealAllowance,
            AchievementBonus: this.state.form?.AchievementBonus,
            LeaderAllowance: this.state.form?.LeaderAllowance,
            StandardRise: this.state.form?.StandardRise
        }

        this.setState({ isEditLoading: true });
        this.service.editStandardPayRises(this.state.selectedItem?.Id, payload)
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
                if (error.response) {
                    let message = "Cek Form Isian, Isian Mandatory tidak boleh kosong\n";

                    const errorMessage = error.response.data.error
                    // console.log(Object.keys(error).forEach(e => console.log(`key=${e}  value=${error[e]}`)));
                    Object.keys(errorMessage).forEach(e => {
                        if (e && typeof errorMessage[e] == "string") {
                            message += `- ${errorMessage[e]}\n`
                        }
                    });

                    swal({
                        icon: 'error',
                        title: 'Data Invalid',
                        text: message
                    });

                    this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
                }
            });
    }

    search = (keyword) => {
        this.setState({ page: 1, keyword: keyword }, () => {
            this.setData();
        })
    }

    handleViewClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getStandardPayRisesById(item.Id)
            .then((data) => {
                //var { employmentClasses } = this.state;
                data.Period = new Date(data.Period);
                // let emClass = employmentClasses.find((element) => element.value === data.EmploymentClass);
                // data.SelectedEmploymentClass = emClass;

                this.setState({ form: data }, () => {
                    this.showViewModal(true);
                })
            })
    }

    handleEditClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getStandardPayRisesById(item.Id)
            .then((data) => {
                var { roleEmployees, allGrades, allEmployementClasses } = this.state;
                data.Period = new Date(data.Period);

                let roleEmployeesSelected = roleEmployees.find((element) => element.label === data.NamePosition);
                let grade = allGrades.find((element) => element.label === data.EmployeeGrade);
                let emClass = allEmployementClasses.find((element) => element.label === data.EmploymentClass);
                let gradeLoader = allGrades.filter((element) => element.NamePosition === data.NamePosition);
                let emClassLoader = allEmployementClasses.filter((element) => element.NamePosition === data.NamePosition && element.Grade === data.EmployeeGrade);

                data.SelectedNamePosition = roleEmployeesSelected;
                data.SelectedGrade = grade;
                data.SelectedEmploymentClass = emClass;
                this.setState({ form: data, grades: gradeLoader, employmentClasses: emClassLoader }, () => {
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
        this.service.deleteStandardPayRises(this.state.selectedItem?.Id)
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
            })
    }

    onInputFileHandler = (event) => {
        this.setFile(event.target.files[0]);
    }

    setFile = (file) => {
        this.setState({ selectedFile: file });
    }

    handleUpload = () => {
        // this.service.uploadStandardCompetencies(this.state.selectedFile)
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

    numberFormat = (value) => {
        return new Intl.NumberFormat('id-ID').format(value);
    }

    render() {
        const { tableData } = this.state;

        const items = tableData.map((item, index) => {

            return (
                <tr key={item.Id} data-category={item.Id}>
                    <td>{moment(item.Period).format('MMMM YYYY')}</td>
                    <td>{item.NamePosition}</td>
                    <td>{item.EmployeeGrade}</td>
                    <td>{item.EmploymentClass}</td>
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
                                    {/* <Button className="btn btn-primary mr-5" name="upload" onClick={this.upload}>Upload</Button> */}
                                </Col>
                                <Col sm={4}></Col>

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
                                                <th>Periode</th>
                                                <th>Jabatan</th>
                                                <th>Grade</th>
                                                <th>Golongan</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                items.length > 0 ? items :
                                                    <tr className={'text-center'}>
                                                        <td colSpan='5' className={'align-middle text-center'}>Data Kosong</td>
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

                        <Modal dialogClassName="modal-90w" aria-labelledby="modal_add" show={this.state.isShowAddModal} onHide={() => this.showAddModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal_add">Tambah Standar Kenaikan Gaji</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Periode</Form.Label>
                                    </Col>
                                    <Col>
                                        <div className="customDatePickerWidth">
                                            <DatePicker
                                                className={this.state.validationCreateForm.Period ? 'form-control is-invalid' : 'form-control'}
                                                name="Period"
                                                id="Period"
                                                selected={this.state.form?.Period}
                                                onChange={val => {
                                                    var { form } = this.state;
                                                    form["Period"] = val;

                                                    return this.setState({ form: form });
                                                }}
                                                dateFormat="MMMM yyyy"
                                                showMonthYearPicker
                                                isInvalid={this.state.validationCreateForm.Period ? true : null}
                                            />
                                            <span className="text-danger">
                                                <small>
                                                    {this.state.validationCreateForm.Period}
                                                </small>
                                            </span>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Jabatan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={
                                                this.state.validationCreateForm.NamePosition
                                                    ? "invalid-select"
                                                    : ""
                                            }
                                            options={this.state.roleEmployees}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.SelectedNamePosition}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["NamePosition"] = value?.label;
                                                form["SelectedNamePosition"] = value;
                                                form["SelectedGrade"] = {};
                                                form["SelectedEmploymentClass"] = {};

                                                return this.setState({
                                                    form: form
                                                }, () => { this.getGradeByPositionId(value?.value) });
                                            }}
                                            isInvalid={
                                                this.state.validationCreateForm.NamePosition
                                                    ? true
                                                    : null
                                            }
                                        ></Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.NamePosition}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Grade</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={
                                                this.state.validationCreateForm.EmployeeGrade
                                                    ? "invalid-select"
                                                    : ""
                                            }
                                            options={this.state.grades}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.SelectedGrade}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["EmployeeGrade"] = value?.label;
                                                form["SelectedGrade"] = value;
                                                form["SelectedEmploymentClass"] = {};

                                                return this.setState({
                                                    form: form
                                                }, () => { this.getEmploymentClassesByGrade(value?.label) });
                                            }}
                                            isInvalid={
                                                this.state.validationCreateForm.EmployeeGrade
                                                    ? true
                                                    : null
                                            }
                                        ></Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.EmployeeGrade}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Golongan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm.EmploymentClass ? 'invalid-select' : ''}
                                            options={this.state.employmentClasses}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.SelectedEmploymentClass}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["EmployeeClassId"] = value?.value;
                                                form["EmploymentClass"] = value?.label;
                                                form["SelectedEmploymentClass"] = value;
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.EmploymentClass ? true : null}>
                                        </Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.EmploymentClass}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Upah Pokok</Form.Label>
                                    </Col>
                                    <Col>
                                        <CurrencyInput
                                            className={'form-control'}
                                            id="BaseSalary"
                                            name="BaseSalary"
                                            value={this.state.form?.BaseSalary}
                                            onValueChange={(value, name) => {
                                                var { form } = this.state;
                                                form[name] = value;
                                                var baseSalary = form.BaseSalary ? parseFloat(form.BaseSalary) : 0;
                                                var mealAllowance = form.MealAllowance ? parseFloat(form.MealAllowance) : 0;
                                                var leaderAllowance = form.LeaderAllowance ? parseFloat(form.LeaderAllowance) : 0;
                                                var achievementBonus = form.AchievementBonus ? parseFloat(form.AchievementBonus) : 0;
                                                form["StandardRise"] = baseSalary + mealAllowance + leaderAllowance + achievementBonus;
                                                return this.setState({ form: form });
                                            }}
                                        />
                                        <div className="invalid-feedback">{this.state.validationCreateForm.BaseSalary}</div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Upah Makan</Form.Label>
                                    </Col>
                                    <Col>
                                        <CurrencyInput
                                            className={'form-control'}
                                            id="MealAllowance"
                                            name="MealAllowance"
                                            value={this.state.form?.MealAllowance}
                                            onValueChange={(value, name) => {
                                                var { form } = this.state;
                                                form[name] = value;
                                                var baseSalary = form.BaseSalary ? parseFloat(form.BaseSalary) : 0;
                                                var mealAllowance = form.MealAllowance ? parseFloat(form.MealAllowance) : 0;
                                                var leaderAllowance = form.LeaderAllowance ? parseFloat(form.LeaderAllowance) : 0;
                                                var achievementBonus = form.AchievementBonus ? parseFloat(form.AchievementBonus) : 0;
                                                form["StandardRise"] = baseSalary + mealAllowance + leaderAllowance + achievementBonus;
                                                return this.setState({ form: form });
                                            }}
                                        />
                                        <div className="invalid-feedback">{this.state.validationCreateForm.MealAllowance}</div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Premi Prestasi</Form.Label>
                                    </Col>
                                    <Col>
                                        <CurrencyInput
                                            className={'form-control'}
                                            id="AchievementBonus"
                                            name="AchievementBonus"
                                            value={this.state.form?.AchievementBonus}
                                            onValueChange={(value, name) => {
                                                var { form } = this.state;
                                                form[name] = value;
                                                var baseSalary = form.BaseSalary ? parseFloat(form.BaseSalary) : 0;
                                                var mealAllowance = form.MealAllowance ? parseFloat(form.MealAllowance) : 0;
                                                var leaderAllowance = form.LeaderAllowance ? parseFloat(form.LeaderAllowance) : 0;
                                                var achievementBonus = form.AchievementBonus ? parseFloat(form.AchievementBonus) : 0;
                                                form["StandardRise"] = baseSalary + mealAllowance + leaderAllowance + achievementBonus;
                                                return this.setState({ form: form });
                                            }}
                                        />
                                        <div className="invalid-feedback">{this.state.validationCreateForm.AchievementBonus}</div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Tunjangan Jabatan</Form.Label>
                                    </Col>
                                    <Col>
                                        <CurrencyInput
                                            className={'form-control'}
                                            id="LeaderAllowance"
                                            name="LeaderAllowance"
                                            value={this.state.form?.LeaderAllowance}
                                            onValueChange={(value, name) => {
                                                var { form } = this.state;
                                                form[name] = value;
                                                var baseSalary = form.BaseSalary ? parseFloat(form.BaseSalary) : 0;
                                                var mealAllowance = form.MealAllowance ? parseFloat(form.MealAllowance) : 0;
                                                var leaderAllowance = form.LeaderAllowance ? parseFloat(form.LeaderAllowance) : 0;
                                                var achievementBonus = form.AchievementBonus ? parseFloat(form.AchievementBonus) : 0;
                                                form["StandardRise"] = baseSalary + mealAllowance + leaderAllowance + achievementBonus;
                                                return this.setState({ form: form });
                                            }}
                                        />
                                        <div className="invalid-feedback">{this.state.validationCreateForm.LeaderAllowance}</div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Standar Kenaikan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form.StandardRise ? this.numberFormat(this.state.form?.StandardRise.toFixed(2)) : 0}</Form.Label>
                                        <br></br>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.StandardRise}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="create" onClick={this.handleCreate}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName="modal-100w" aria-labelledby="modal-upload" show={this.state.isShowUploadModal} onHide={() => this.showUploadModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-upload">Upload Standard Kenaikan Gaji</Modal.Title>
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

                        <Modal aria-labelledby="modal-delete" show={this.state.isShowDeleteModal} onHide={() => this.showDeleteModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-delete">Hapus Standar Kenaikan Gaji</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Apakah anda yakin ingin menghapus data ini?
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isDeleteLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-danger" name="delete" onClick={this.deleteClickHandler}>Hapus</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit" show={this.state.isShowEditModal} onHide={() => this.showEditModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-edit">Edit Standard Kenaikan Gaji</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Periode</Form.Label>
                                    </Col>
                                    <Col>
                                        <div className="customDatePickerWidth">
                                            <DatePicker
                                                className={this.state.validationCreateForm.Period ? 'form-control is-invalid' : 'form-control'}
                                                name="Period"
                                                id="Period"
                                                selected={this.state.form?.Period}
                                                onChange={val => {
                                                    var { form } = this.state;
                                                    form["Period"] = val;

                                                    return this.setState({ form: form });
                                                }}
                                                dateFormat="MMMM yyyy"
                                                showMonthYearPicker
                                                isInvalid={this.state.validationCreateForm.Period ? true : null}
                                            />
                                            <span className="text-danger">
                                                <small>
                                                    {this.state.validationCreateForm.Period}
                                                </small>
                                            </span>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Jabatan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={
                                                this.state.validationCreateForm.NamePosition
                                                    ? "invalid-select"
                                                    : ""
                                            }
                                            options={this.state.roleEmployees}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.SelectedNamePosition}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["NamePosition"] = value?.label;
                                                form["SelectedNamePosition"] = value;
                                                form["SelectedGrade"] = {};
                                                form["SelectedEmploymentClass"] = {};

                                                return this.setState({
                                                    form: form
                                                }, () => { this.getGradeByPositionId(value?.value) });
                                            }}
                                            isInvalid={
                                                this.state.validationCreateForm.NamePosition
                                                    ? true
                                                    : null
                                            }
                                        ></Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.NamePosition}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Grade</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={
                                                this.state.validationCreateForm.EmployeeGrade
                                                    ? "invalid-select"
                                                    : ""
                                            }
                                            options={this.state.grades}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.SelectedGrade}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["EmployeeGrade"] = value?.label;
                                                form["SelectedGrade"] = value;
                                                form["SelectedEmploymentClass"] = {};

                                                return this.setState({
                                                    form: form
                                                }, () => { this.getEmploymentClassesByGrade(value?.label) });
                                            }}
                                            isInvalid={
                                                this.state.validationCreateForm.EmployeeGrade
                                                    ? true
                                                    : null
                                            }
                                        ></Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.EmployeeGrade}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Golongan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm.EmploymentClass ? 'invalid-select' : ''}
                                            options={this.state.employmentClasses}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.SelectedEmploymentClass}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["EmployeeClassId"] = value?.value;
                                                form["EmploymentClass"] = value?.label;
                                                form["SelectedEmploymentClass"] = value;
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.EmploymentClass ? true : null}>
                                        </Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.EmploymentClass}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Upah Pokok</Form.Label>
                                    </Col>
                                    <Col>
                                        <CurrencyInput
                                            className={'form-control'}
                                            id="BaseSalary"
                                            name="BaseSalary"
                                            value={this.state.form?.BaseSalary}
                                            onValueChange={(value, name) => {
                                                var { form } = this.state;
                                                form[name] = value;
                                                var baseSalary = form.BaseSalary ? parseFloat(form.BaseSalary) : 0;
                                                var mealAllowance = form.MealAllowance ? parseFloat(form.MealAllowance) : 0;
                                                var leaderAllowance = form.LeaderAllowance ? parseFloat(form.LeaderAllowance) : 0;
                                                var achievementBonus = form.AchievementBonus ? parseFloat(form.AchievementBonus) : 0;
                                                form["StandardRise"] = baseSalary + mealAllowance + leaderAllowance + achievementBonus;
                                                return this.setState({ form: form });
                                            }}
                                        />
                                        <div className="invalid-feedback">{this.state.validationCreateForm.BaseSalary}</div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Upah Makan</Form.Label>
                                    </Col>
                                    <Col>
                                        <CurrencyInput
                                            className={'form-control'}
                                            id="MealAllowance"
                                            name="MealAllowance"
                                            value={this.state.form?.MealAllowance}
                                            onValueChange={(value, name) => {
                                                var { form } = this.state;
                                                form[name] = value;
                                                var baseSalary = form.BaseSalary ? parseFloat(form.BaseSalary) : 0;
                                                var mealAllowance = form.MealAllowance ? parseFloat(form.MealAllowance) : 0;
                                                var leaderAllowance = form.LeaderAllowance ? parseFloat(form.LeaderAllowance) : 0;
                                                var achievementBonus = form.AchievementBonus ? parseFloat(form.AchievementBonus) : 0;
                                                form["StandardRise"] = baseSalary + mealAllowance + leaderAllowance + achievementBonus;
                                                return this.setState({ form: form });
                                            }}
                                        />
                                        <div className="invalid-feedback">{this.state.validationCreateForm.MealAllowance}</div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Premi Prestasi</Form.Label>
                                    </Col>
                                    <Col>
                                        <CurrencyInput
                                            className={'form-control'}
                                            id="AchievementBonus"
                                            name="AchievementBonus"
                                            value={this.state.form?.AchievementBonus}
                                            onValueChange={(value, name) => {
                                                var { form } = this.state;
                                                form[name] = value;
                                                var baseSalary = form.BaseSalary ? parseFloat(form.BaseSalary) : 0;
                                                var mealAllowance = form.MealAllowance ? parseFloat(form.MealAllowance) : 0;
                                                var leaderAllowance = form.LeaderAllowance ? parseFloat(form.LeaderAllowance) : 0;
                                                var achievementBonus = form.AchievementBonus ? parseFloat(form.AchievementBonus) : 0;
                                                form["StandardRise"] = baseSalary + mealAllowance + leaderAllowance + achievementBonus;
                                                return this.setState({ form: form });
                                            }}
                                        />
                                        <div className="invalid-feedback">{this.state.validationCreateForm.AchievementBonus}</div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Tunjangan Jabatan</Form.Label>
                                    </Col>
                                    <Col>
                                        <CurrencyInput
                                            className={'form-control'}
                                            id="LeaderAllowance"
                                            name="LeaderAllowance"
                                            value={this.state.form?.LeaderAllowance}
                                            onValueChange={(value, name) => {
                                                var { form } = this.state;
                                                form[name] = value;
                                                var baseSalary = form.BaseSalary ? parseFloat(form.BaseSalary) : 0;
                                                var mealAllowance = form.MealAllowance ? parseFloat(form.MealAllowance) : 0;
                                                var leaderAllowance = form.LeaderAllowance ? parseFloat(form.LeaderAllowance) : 0;
                                                var achievementBonus = form.AchievementBonus ? parseFloat(form.AchievementBonus) : 0;
                                                form["StandardRise"] = baseSalary + mealAllowance + leaderAllowance + achievementBonus;
                                                return this.setState({ form: form });
                                            }}
                                        />
                                        <div className="invalid-feedback">{this.state.validationCreateForm.LeaderAllowance}</div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Standar Kenaikan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form.StandardRise ? this.numberFormat(this.state.form?.StandardRise.toFixed(2)) : 0}</Form.Label>
                                        <br></br>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.StandardRise}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="edit-standard-competencies" onClick={this.handleEdit}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName="modal-90w" aria-labelledby="modal-view" show={this.state.isShowViewModal} onHide={() => this.showViewModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-view">Lihat Standar Kenaikan Gaji</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Periode</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.Period ? moment(this.state.form?.Period).format("MMMM YYYY") : null}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Jabatan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.NamePosition}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Grade</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.EmployeeGrade}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>

                                    <Col sm={4}>
                                        <Form.Label>Golongan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.EmploymentClass}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Upah Pokok</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form.BaseSalary ? this.numberFormat(parseFloat(this.state.form?.BaseSalary).toFixed(2)) : 0}</Form.Label>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Upah Makan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form.MealAllowance ? this.numberFormat(parseFloat(this.state.form?.MealAllowance).toFixed(2)) : 0}</Form.Label>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Premi Prestasi</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form.AchievementBonus ? this.numberFormat(parseFloat(this.state.form?.AchievementBonus).toFixed(2)) : 0}</Form.Label>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Tunjangan Jabatan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form.LeaderAllowance ? this.numberFormat(parseFloat(this.state.form?.LeaderAllowance).toFixed(2)) : 0}</Form.Label>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Standar Kenaikan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form.StandardRise ? this.numberFormat(parseFloat(this.state.form?.StandardRise).toFixed(2)) : 0}</Form.Label>

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

export default StandardPayRise;
