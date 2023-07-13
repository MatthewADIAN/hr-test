import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Table, Card, CardBody } from 'reactstrap';
import {
    Form,
    Spinner,
    FormGroup,
    FormLabel,
    Row,
    Col,

    Button,
    Modal,
    ModalBody,
    ModalFooter
} from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';
import * as CONST from '../../../Constant';
import axios from 'axios';
import Service from './../Service';
import swal from 'sweetalert';
import "bootstrap/dist/css/bootstrap.min.css";
import './style.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimeField from 'react-simple-timefield';

var fileDownload = require('js-file-download');
const moment = require('moment');
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";

class AttendanceManual extends Component {
    typeaheadEmployeeCreateForm = {};
    typeaheadEmployeeSearchForm = {};
    state = {
        loading: false,
        isCreateLoading: false,
        isEditLoading: false,
        isAutoCompleteLoading: false,
        deleteAttendanceLoading: false,

        selectedUnit: null,
        selectedSection: null,
        selectedGroup: null,
        selectedUnitToCreate: null,

        selectedStartPeriode: new Date(),
        selectedEndPeriode: new Date(),
        selectedSearchUnit: null,
        selectedSearchSection: null,
        selectedSearchGroup: null,
        selectedSearchEmployee: null,
        dateRange: [],
        dateRangeLength: 0,
        selectedAttendance: {},

        units: [],
        groups: [],
        sections: [],
        employees: [],

        searchUnits: [],
        searchSections: [],
        searchGroups: [],
        searchEmployee: [],

        activePage: 1,
        total: 0,
        loadingData: false,
        tableData: [],

        validationSearch: {},
        form: {},
        //replace Form :
        validationCreateForm: {},

        Period: "",

        userUnitId: localStorage.getItem("unitId"),
        userAccessRole: localStorage.getItem("accessRole"),
        otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),

        //modal state
        isShowAddAttendanceModal: false,
        isShowEditAttendanceModal: false,
        isShowViewAttendanceModal: false,
        isShowDeleteAttendanceModal: false,

        startDate: "",
        endDate: "",

        checkOutToCreate: new Date(),
        checkInToCreate: new Date(),

        validationEditForm: {},

    }
    resetPagingConfiguration = () => {
        this.setState({
            activePage: 1,
            selectedUnit: null,
            selectedSection: null,
            selectedGroup: null,
            selectedStartPeriode: new Date(),
            selectedEndPeriode: new Date(),
            validationCreateForm: {},
            validationEditForm: {},
            checkInToCreate: new Date(),
            checkOutToCreate: new Date()
            //   startDate :null,
            //   endDate : null,
        })
    }

    constructor(props) {
        super(props);
        this.service = new Service();
    }

    componentDidMount() {
        this.setData();
        this.setUnits();
        this.setGroups();
        this.setSections();
        this.setUnitsSearch();
        this.setGroupsSearch(null);
        this.setSectionsSearch(null);
        this.setEmployeeSearch();

    }

    searchData = () => {
        this.setState({activePage: 1} ,() => {
            const params = {
                unitId: this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0,
                groupId: this.state.selectedSearchGroup ? this.state.selectedSearchGroup.Id : 0,
                sectionId: this.state.selectedSearchSection ? this.state.selectedSearchSection.Id : 0,
                employeeId: this.state.selectedSearchEmployee ? this.state.selectedSearchEmployee.Id : 0,
                page: this.state.activePage,
    
                startDate: moment(this.state.startDate).format("YYYY-MM-DD"),
                endDate: moment(this.state.endDate).format("YYYY-MM-DD")
            };
    
            this.setState({ loadingData: true })
            this.service
                .getAttendance(params)
                .then((result) => {
                    this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
                }).catch((err) => {
                    this.setState({ activePage: 1, total: 0, tableData: [], loadingData: false })
                });
        })
    }

    setData = () => {
        this.resetPagingConfiguration();
        if(this.state.selectedSearchUnit && this.state.startDate && this.state.endDate){
            const params = {
                unitId: this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0,
                groupId: this.state.selectedSearchGroup ? this.state.selectedSearchGroup.Id : 0,
                sectionId: this.state.selectedSearchSection ? this.state.selectedSearchSection.Id : 0,
                employeeId: this.state.selectedSearchEmployee ? this.state.selectedSearchEmployee.Id : 0,
                page: this.state.activePage,
    
                startDate: moment(this.state.startDate).format("YYYY-MM-DD"),
                endDate: moment(this.state.endDate).format("YYYY-MM-DD")
            };
    
            this.setState({ loadingData: true })
            this.service
                .getAttendance(params)
                .then((result) => {
    
                    this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
                }).catch((err) => {
                    this.setState({ activePage: 1, total: 0, tableData: [], loadingData: false })
                });
        }
    }


    setGroups = () => {
        this.setState({ loading: true })
        this.service
            .getAllGroups()
            .then((result) => {
                this.setState({ groups: result, loading: false })
            });
    }

    setSections = () => {
        this.setState({ loading: true })
        this.service
            .getAllSections()
            .then((result) => {
                this.setState({ sections: result, loading: false })
            });
    }

    setUnits = () => {
        this.setState({ loading: true })
        this.service
            .getAllUnits()
            .then((result) => {
                
                var units = [];
                result.map(s => {
                    if (this.state.userAccessRole == PERSONALIA_BAGIAN && 
                        (this.state.otherUnitId.includes(s.Id))) {
                        units.push(s);
                    } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
                        units.push(s);
                    }
                });
                
                this.setState({ units: units, loading: false })
            });
    }

    setGroupsSearch = (sectionId) => {
        // this.setState({ loading: true })
        if (sectionId == null) {

            this.service
                .getAllGroups()
                .then((result) => {
                    this.setState({ searchGroups: result })
                });
        } else {
            this.service
                .getAllGroupsBySectionId(sectionId)
                .then((result) => {
                    var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm
                    instanceEmployeeSearch.clear();
                    this.setState({ searchGroups: result, selectedSearchGroup: null, selectedSearchEmployee: null })
                });
        }
    }

    setSectionsSearch = (unitId) => {
        // this.setState({ loading: true })
        if (unitId == null) {

            this.service
                .getAllSections()
                .then((result) => {
                    this.setState({ searchSections: result })
                });
        } else {
            this.service
                .getAllSectionsByUnitId(unitId)
                .then((result) => {
                    var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm
                    instanceEmployeeSearch.clear();
                    this.setState({
                        searchSections: result,
                        selectedSearchGroup: null,
                        selectedSearchSection: null,
                        selectedSearchEmployee: null
                    })
                });
        }
    }

    setUnitsSearch = () => {
        // this.setState({ loading: true })
        this.service
            .getAllUnits()
            .then((result) => {
                var units = [];
                result.map(s => {
                    if (this.state.userAccessRole == PERSONALIA_BAGIAN && 
                        (this.state.otherUnitId.includes(s.Id))) {
                        units.push(s);
                    } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
                        units.push(s);
                    }
                });
               
               this.setState({ searchUnits: units })
            });
    }

    setEmployeeSearch = () => {

        let params = {};
        params.unitId = this.state.selectedSearchUnit?.Id;
        params.groupId = this.state.selectedSearchGroup?.Id;
        params.sectionId = this.state.selectedSearchSection?.Id;
        params.employeeId = this.state.selectedSearchEmployee?.Id;


        // console.log(this);
        // this.setState({ loading: true })
        this.service
            .searchEmployeeSearch(params)
            .then((result) => {
                console.log(result);
                this.setState({ searchEmployee: result })
            });

    }

    search = () => {
        this.setState({ validationSearch: {} });
        
        if (moment(this.state.startDate) > moment(this.state.endDate)) {
            this.setState({
                validationSearch: {
                    StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir",
                },
            });
        } else if (this.state.startDate == null || this.state.startDate == "") {
            console.log('this.state.startDate','yoyo');
            this.setState({
                validationSearch: { StartDate: "Tanggal Awal Harus Diisi" },
            });
        } else if (this.state.endDate == null || this.state.endDate == "") {
            this.setState({
                validationSearch: { EndDate: "Tanggal Akhir Harus Diisi" },
            });
        } 
        if (!this.state.selectedSearchUnit) {
            this.setState({
                validationSearch: {
                    selectedSearchUnit: "Unit Harus Dipilih",
                },
            });
        }else {
            this.searchData();
        }
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            if(this.state.selectedSearchUnit && this.state.startDate && this.state.endDate){
                const params = {
                    unitId: this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0,
                    groupId: this.state.selectedSearchGroup ? this.state.selectedSearchGroup.Id : 0,
                    sectionId: this.state.selectedSearchSection ? this.state.selectedSearchSection.Id : 0,
                    employeeId: this.state.selectedSearchEmployee ? this.state.selectedSearchEmployee.Id : 0,
                    page: this.state.activePage,
        
                    startDate: moment(this.state.startDate).format("YYYY-MM-DD"),
                    endDate: moment(this.state.endDate).format("YYYY-MM-DD")
                };
        
                this.setState({ loadingData: true })
                this.service
                    .getAttendance(params)
                    .then((result) => {
        
                        this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
                    }).catch((err) => {
                        this.setState({ activePage: 1, total: 0, tableData: [], loadingData: false })
                    });
            }
        });
    }


    handleEmployeeSearchModal = (query) => {
        this.setState({ isAutoCompleteLoading: true });

        // const params = {
        //   unitId: this.state.selectedUnitToCreate ? this.state.selectedUnitToCreate.Id : 0,
        //   keyword: query
        // }
        const params = {
            keyword: query
        };

        this.service
            .searchEmployee(params)
            .then((result) => {
                result = result.map((employee) => {
                    employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} - ${employee.Name}`;
                    return employee;
                });

                this.setState({ employees: result }, () => {
                    this.setState({ isAutoCompleteLoading: false });
                });
            });
    }

    handleEmployeeFilter = (query) => {
        this.setState({ isAutoCompleteLoading: true });

        const params = {
            unitId: this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0,
            groupId: this.state.selectedSearchGroup ? this.state.selectedSearchGroup.Id : 0,
            sectionId: this.state.selectedSearchSection ? this.state.selectedSearchSection.Id : 0,
            keyword: query
        }

        this.service
            .searchEmployeeSearch(params)
            .then((result) => {
                result = result.map((employee) => {
                    employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} - ${employee.Name}`;
                    //   employee.label = `${employee.EmployeeIdentity} - ${employee.Name}`;
                    //   employee.value = `${employee.Id}`;
                    return employee;
                });
                // this.setEmployeeSearch();
                this.setState({ searchEmployee: result }, () => {
                    this.setState({ isAutoCompleteLoading: false });
                });
            });
    }

    resetCreateModalValue = () => {
        this.setState({
            form: {},

            selectedEmployeeToCreate: null,
            selectedUnitToCreate: null,
            validationCreateForm: {},
            checkInToCreate: new Date(),
            checkOutToCreate: new Date()
        })
    }

    resetPagingConfiguration = () => {
        this.setUnitsSearch();
        this.setGroupsSearch(null);
        this.setSectionsSearch(null);
        this.setState({
            activePage: 1,
            selectedUnit: null,
            selectedSection: null,
            selectedGroup: null,
            selectedStartPeriode: new Date(),
            selectedEndPeriode: new Date(),
            //   startDate :null,
            //   endDate : null,
            selectedSearchGroup: null,
            selectedSearchUnit: null,
            selectedSearchSection: null,
            selectedSearchEmployee: null,
        });
        var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm
        instanceEmployeeSearch.clear();
    }

    create = () => {

        this.showAddManualCheckInModal(true);
    }

    showAddManualCheckInModal = (value) => {
        this.resetCreateModalValue();
        this.setState({ isShowAddAttendanceModal: value, isCreateLoading: false });
    }

    showDeleteAttendanceModal = (value) => {
        this.setState({ isShowDeleteAttendanceModal: value, deleteAttendanceLoading: false });
    }

    handleCreateAttendance = () => {
        let CheckIn = moment(this.state.checkInToCreate).format("DD/MM/YYYY")

        if (CheckIn !== "01/0/0001") {
            this.createAttendance()
        } else {
            this.setState({
                validationCreateForm: { CheckIn: "Tanggal harus lebih dari 01/01/0001" },
                isCreateLoading: false
            })
        }

    }

    createAttendance = () => {

        const payload = {
            EmployeeId: this.state.selectedEmployeeToCreate?.Id,
            CheckOut: this.state.checkOutToCreate,
            CheckIn: this.state.checkInToCreate,

        }

        this.setState({ isCreateLoading: true });
        this.service.postAttedance(payload)
            .then((result) => {

                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil disimpan!'
                })
                this.setState({ isCreateLoading: false }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showAddManualCheckInModal(false);
                });
            })
            .catch((error) => {
                if (error) {
                    let message = "";
                    if (error.EmployeeId)
                        message += `- ${error.EmployeeId}\n`;

                    if (error.CheckIn)
                        message += `- ${error.CheckIn}\n`;

                    if (error.CheckOut)
                        message += `- ${error.CheckOut}\n`;

                    if (error.NotHaveSchedule)
                        message += `- ${error.NotHaveSchedule}\n`;

                    if (error.SameTime)
                        message += `- ${error.SameTime}\n`;

                    if (error.InvalidRangeDate)
                        message += `- ${error.InvalidRangeDate}\n`;


                    this.setState({ validationCreateForm: error });
                    console.log("validationCreateForm", this.state.validationCreateForm)
                    this.setState({ isCreateLoading: false });
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: message
                    });
                }
            });

    }

    handleEditAttendanceClick = (attendance) => {
        this.setState({ selectedAttendance: attendance, validationEditForm: {} }, () => {
            this.getAttendanceById(attendance.Id, "EDIT", attendance)
        });
    }

    handleDeleteAttendanceClick = (attendance) => {
        this.setState({ selectedAttendance: attendance }, () => {
            this.showDeleteAttendanceModal(true);
        });
    }

    handleViewAttendanceClick = (attendance) => {
        this.setState({ selectedAttendance: attendance }, () => {
            this.getAttendanceById(attendance.Id, "VIEW", attendance)
        });
    }

    deleteAttendanceClickHandler = () => {
        this.setState({ deleteAttendanceLoading: true });

        const url = `${CONST.URI_ATTENDANCE}attendances/${this.state.selectedAttendance.Id}`;
        const headers = {
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: `Bearer ` + localStorage.getItem('token'),
            'x-timezone-offset': moment().utcOffset() / 60
        }

        Promise.all([
            axios.delete(url, { headers: headers }),
        ])
            .then((values) => {

                alert("Data Berhasil dihapus");
                this.setState({ deleteAttendanceLoading: false });
                this.setData();
            }).catch((err) => {
                if (err.response.status === 400) {
                    alert("Data Berhasil dihapus");
                    this.setState({ deleteAttendanceLoading: false });

                } else {
                    alert("Terjadi kesalahan!");
                    this.setState({ deleteAttendanceLoading: false });
                }
                console.log(err.response);
                this.setState({ deleteAttendanceLoading: false });
            }).then(() => {
                this.showDeleteAttendanceModal(false);
                this.setData();
            });
    }

    handleEditAttendance = () => {
        let checkin = moment(this.state.selectedAttendance?.CheckIn).format("DD/MM/YYYY")
        if (checkin !== "01/01/0001") {
            this.updateAttendance();
        } else {
            this.setState({ validationCreateForm: { CheckIn: "Tanggal harus lebih dari 01/01/0001" }, isEditLoading: false })
        }

    }


    updateAttendance = () => {

        this.setState({ updateEmployeeLoading: true });

        const url = `${CONST.URI_ATTENDANCE}attendances/${this.state.selectedAttendance?.Id}`;
        const headers = {
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: `Bearer ` + localStorage.getItem('token'),
            'x-timezone-offset': moment().utcOffset() / 60
        }
        axios.put(url, this.state.selectedAttendance, { headers: headers }).then(() => {
            swal("Data berhasil disimpan!");
            this.setState({ isEditLoading: false, selectedAttendance: {}, page: 1, activePage: 1 }, () => {
                this.showEditAttendanceModal(false);
                this.setData();
            });
        }).catch((err) => {
            if (err.response) {
                this.setState({ validationEditForm: err.response.data.error });
                console.log(this.state);
            }
            // alert("Terjadi kesalahan!");
            this.setState({ isEditLoading: false });
            this.setData();
        });
    }

    getAttendanceById = (id, state, data) => {
        this.setState({ loading: true });

        console.log(id);
        console.log(data);
        this.setState({ loading: false, activePage: 1, page: 1, selectedAttendance: data }, () => {
            if (state === "VIEW")
                this.showViewAttendanceModal(true);
            else if (state === "EDIT")
                this.showEditAttendanceModal(true);
        });
    }

    // getAttendanceById = (id, state) => {
    //     this.setState({ loading: true });

    //     const url = `${CONST.URI_ATTENDANCE}attendances/${id}`;
    //     const headers = {
    //         'Content-Type': 'application/json',
    //         accept: 'application/json',
    //         Authorization: `Bearer ` + localStorage.getItem('token'),
    //         'x-timezone-offset': moment().utcOffset() / 60
    //     }
    //     axios.get(url, { headers: headers }).then((data) => {

    //         var selectedAttendance = data.data;

    //         this.setState({
    //             loading: false,
    //             activePage: 1,
    //             page: 1,
    //             selectedAttendance: selectedAttendance,

    //         }, () => {
    //             if (state === "VIEW")
    //                 this.showViewAttendanceModal(true);
    //             else if (state === "EDIT")
    //                 this.showEditAttendanceModal(true);
    //         });

    //     }).catch(err => {
    //         alert("Terjadi kesalahan!");
    //         this.setState({ loading: false });
    //     });
    // }


    showEditAttendanceModal = (value) => {
        if (!value)
            this.setState({ selectedAttendance: {} });

        this.setState({ isShowEditAttendanceModal: value, isEditLoading: false });
    }

    showViewAttendanceModal = (value) => {

        if (!value) {
            this.setState({ selectedAttendance: {} });
        }

        this.setState({ isShowViewAttendanceModal: value });
    }



    handleEmployeeSearchModal = (query) => {
        this.setState({ isAutoCompleteLoading: true });

        // const params = {
        //   unitId: this.state.selectedUnitToCreate ? this.state.selectedUnitToCreate.Id : 0,
        //   keyword: query
        // }
        const params = {
            keyword: query
        };


        this.service
            .searchEmployee(params)
            .then((result) => {

                result = result.map((employee) => {
                    employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} | ${employee.Name} | ${employee.Section} | ${employee.Group}`;
                    return employee;
                });
                this.setState({ employees: result }, () => {
                    this.setState({ isAutoCompleteLoading: false });
                });
            });
    }

    convertMinutesToHours(n) {
        let num = n;
        let hours = (num / 60);
        let rhours = Math.floor(hours);
        let minutes = (hours - rhours) * 60;
        let rminutes = Math.round(minutes);
        var totalHour = rhours.toString().padStart(2, '0') + ":" + rminutes.toString().padStart(2, '0')

        return totalHour

    }

    render() {
        const { tableData } = this.state;

        const items = tableData.map((item, index) => {

            let totalMinutesStart = (item.StartHour * 60) + (item.StartMinute)
            var startHour = this.convertMinutesToHours(totalMinutesStart);

            let totalMinutesEnd = (item.EndHour * 60) + (item.EndMinute)
            var endHour = this.convertMinutesToHours(totalMinutesEnd);

            return (
                <tbody key={index}>
                    <tr>

                        <td>{item.EmployeeIdentity}</td>
                        <td>{item.EmployeeName}</td>
                        <td>{item.Unit}</td>
                        <td>{startHour} - {endHour}</td>
                        <td><span
                            className={item.IsLate ? 'text text-danger' : 'text text-default'}>{moment.utc(item.CheckIn).local().format('DD/MM/YYYY HH:mm')}</span>
                        </td>
                        <td><span className={item.IsEarlier ? 'text text-danger' : 'text text-default'}>
                            {moment(item.CheckOut).year() === 1
                                ? ("")
                                : (moment.utc(item.CheckOut).local().format('DD/MM/YYYY HH:mm'))}
                        </span>
                        </td>
                        {/* <td>{results.IsLate ? Math.ceil(results.LateMinutes) + " Menit" : ""}</td>
          <td>{results.IsEarlier ? Math.ceil(results.EarlierMinutes) + " Menit" : ""}</td> */}
                        <td>{item.LateString}</td>
                        <td>{item.EarlyString}</td>
                        <td>
                            <Form>
                                <FormGroup>
                                    {/* <RowButtonComponent className="btn btn-success" name="view-credit-union-cut"
                                        onClick={this.handleViewAttendanceClick} data={item} iconClassName="fa fa-eye"
                                        label=""></RowButtonComponent> */}
                                    <RowButtonComponent className="btn btn-primary" name="edit-credit-union-cut"
                                        onClick={this.handleEditAttendanceClick} data={item} iconClassName="fa fa-pencil-square"
                                        label=""></RowButtonComponent>
                                    <RowButtonComponent className="btn btn-danger" name="delete-credit-union-cut"
                                        onClick={this.handleDeleteAttendanceClick} data={item} iconClassName="fa fa-trash"
                                        label=""></RowButtonComponent>
                                </FormGroup>
                            </Form>
                        </td>
                    </tr>
                </tbody>
            )
        });

        return (
            <div className="animated fadeIn">
                {this.state.loading ? (
                    <span><Spinner size="sm" color="primary" /> Please wait...</span>
                ) : (
                    <Form>

                        <FormGroup>
                            <Row>
                                <Col sm={1} className={'text-right'}>
                                    <FormLabel>Unit/Bagian</FormLabel>
                                </Col>
                                <Col sm={5}>
                                    <Select
                                        placeholder={'pilih unit'}
                                        isClearable={true}
                                        options={this.state.searchUnits}
                                        value={this.state.selectedSearchUnit}
                                        onChange={(value) => {

                                            if (value != null) {
                                                this.setSectionsSearch(value.Id);
                                            } else {
                                                this.setSectionsSearch(null);
                                            }

                                            this.setState({ selectedSearchUnit: value }, () => {
                                                // this.setEmployeeSearch();
                                            });
                                        }}
                                        isInvalid={this.state.validationSearch.selectedSearchUnit ? true : null } 
                                    />
                                    <span style={{ color: "red" }}>{this.state.validationSearch.selectedSearchUnit}</span>
                                </Col>
                            </Row>
                        </FormGroup>
                        <FormGroup>
                            <Row>
                                <Col sm={1} className={'text-right'}>
                                    <FormLabel>Seksi</FormLabel>
                                </Col>
                                <Col sm={5}>
                                    <Select
                                        placeholder={'pilih seksi'}
                                        isClearable={true}
                                        options={this.state.searchSections}
                                        value={this.state.selectedSearchSection}
                                        onChange={(value) => {
                                            if (value != null) {
                                                this.setGroupsSearch(value.Id);
                                            } else {
                                                this.setGroupsSearch(null);
                                            }

                                            this.setState({ selectedSearchSection: value }, () => {
                                                // this.setEmployeeSearch();
                                            });

                                        }} />
                                </Col>
                            </Row>
                        </FormGroup>
                        <FormGroup>
                            <Row>
                                <Col sm={1} className={'text-right'}>
                                    <FormLabel>Group</FormLabel>
                                </Col>
                                <Col sm={5}>
                                    <Select
                                        placeholder={'pilih group'}
                                        isClearable={true}
                                        options={this.state.searchGroups}
                                        value={this.state.selectedSearchGroup}
                                        onChange={(value) => {
                                            this.setState({ selectedSearchGroup: value }, () => {
                                                // this.setEmployeeSearch();
                                            });
                                        }} />
                                </Col>
                            </Row>
                        </FormGroup>
                        <FormGroup>
                            <Row>
                                <Col sm={1} className={'text-right'}>
                                    <FormLabel>Periode</FormLabel>
                                </Col>
                                <Col sm={5}>
                                    <Row>
                                        <Col sm={5}>
                                            <Form.Control
                                                type="date"
                                                value={this.state.startDate}
                                                onChange={((event) => {

                                                    this.setState({ startDate: event.target.value });
                                                })}
                                                isInvalid={this.state.validationSearch.StartDate } 
                                            />
                                            <Form.Control.Feedback
                                                type="invalid">{this.state.validationSearch.StartDate}
                                            </Form.Control.Feedback>
                                        </Col>
                                        <Col sm={2} className={'text-center'}>s/d</Col>
                                        <Col sm={5}>
                                            <Form.Control
                                                type="date"
                                                value={this.state.endDate}
                                                onChange={((event) => {
                                                    console.log("event", event.target.value)
                                                    this.setState({ endDate: event.target.value });
                                                })}
                                                isInvalid={this.state.validationSearch.EndDate} 
                                            />
                                            <Form.Control.Feedback
                                                type="invalid">{this.state.validationSearch.EndDate}
                                            </Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </FormGroup>

                        <FormGroup>
                            <Row>
                                <Col sm={1} className={'text-right'}>
                                    <FormLabel>Karyawan</FormLabel>
                                </Col>
                                <Col sm={5}>

                                    <AsyncTypeahead
                                        id="loader-employee-search-form"
                                        ref={(typeahead) => {
                                            this.typeaheadEmployeeSearchForm = typeahead
                                        }}
                                        isLoading={this.state.isAutoCompleteLoading}
                                        onChange={(selected) => {

                                            this.setState({ selectedSearchEmployee: selected[0] });
                                        }}
                                        labelKey="NameAndEmployeeIdentity"
                                        minLength={1}
                                        onSearch={this.handleEmployeeFilter}
                                        options={this.state.searchEmployee}
                                        placeholder="Cari karyawan..."
                                    />

                                </Col>
                            </Row>
                        </FormGroup>


                        <FormGroup>
                            <Row>
                                <Col sm={1}>
                                </Col>
                                <Col sm={5}>
                                    <Button className="btn btn-secondary mr-3" name="reset"
                                        onClick={this.resetPagingConfiguration}>Reset</Button>
                                    <Button className="btn btn-primary mr-3" name="search" onClick={this.search}>Cari</Button>
                                    <Button className="btn btn-success mr-3" name="input-manual-attendance" onClick={this.create}>Tambah Data</Button>
                                </Col>
                            </Row>

                        </FormGroup>

                        <FormGroup>
                            {this.state.loadingData ? (
                                <span><Spinner size="sm" color="primary" /> Loading Data...</span>
                            ) : this.state.tableData.length <= 0 ? (<Table id="test" responsive bordered striped>
                                <thead>
                                    <tr className={'text-center'}>
                                        <th>NIK</th>
                                        <th>Nama Karyawan</th>
                                        <th>Unit/Bagian</th>
                                        <th>Jadwal</th>
                                        <th>Waktu Check-In</th>
                                        <th>Waktu Check-Out</th>
                                        <th>Terlambat</th>
                                        <th>Pulang Lebih Awal</th>
                                        <th> </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr key="0">
                                        <td colSpan='12' className='text-center'>Data Kosong</td>
                                    </tr>
                                </tbody>
                            </Table>) : (
                                <Row>
                                    <Table id="test2" responsive bordered striped>
                                        <thead>
                                            <tr className={'text-center'}>
                                                <th>NIK</th>
                                                <th>Nama Karyawan</th>
                                                <th>Unit/Bagian</th>
                                                <th>Jadwal</th>
                                                <th>Waktu Check-In</th>
                                                <th>Waktu Check-Out</th>
                                                <th>Terlambat</th>
                                                <th>Pulang Lebih Awal</th>
                                                <th> </th>
                                            </tr>
                                        </thead>
                                        {items}
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

                        {/* modal Create */}
                        <Modal dialogClassName="custom-dialog" aria-labelledby="modal-attandance-manual" show={this.state.isShowAddAttendanceModal}
                            onHide={() => this.showAddManualCheckInModal(false)} animation={true}>
                            <Modal.Header>
                                <Modal.Title id="modal-add-attandance-manual">Input Absensi Karyawan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>NIK</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <AsyncTypeahead
                                            id="loader-employee-create-form"
                                            ref={(typeahead) => { this.typeaheadEmployeeCreateForm = typeahead }}
                                            isLoading={this.state.isAutoCompleteLoading}
                                            onChange={(selected) => {

                                                this.setState({ selectedEmployeeToCreate: selected[0] });

                                            }}

                                            labelKey="NameAndEmployeeIdentity"
                                            minLength={1}
                                            onSearch={this.handleEmployeeSearchModal}
                                            options={this.state.employees}
                                            placeholder="Cari karyawan..."
                                        />

                                        <span style={{ color: "red" }}>{this.state.validationCreateForm?.EmployeeId}</span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Unit</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>:&nbsp;&nbsp;{this.state.selectedEmployeeToCreate?.Unit}</Form.Label>
                                        <br />

                                    </Col>

                                    <Col sm={4}>
                                        <Form.Label>Seksi</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>:&nbsp;&nbsp;{this.state.selectedEmployeeToCreate?.Section}</Form.Label>
                                        <br />

                                    </Col>

                                    <Col sm={4}>
                                        <Form.Label>Group</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>:&nbsp;&nbsp;{this.state.selectedEmployeeToCreate?.Group}</Form.Label>
                                        <br />

                                    </Col>

                                </Row>

                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Tanggal CheckIn</Form.Label>
                                    </Col>
                                    <Col>

                                        <Form.Control
                                            type="date"
                                            name="dateCheckIn"
                                            id="dateCheckIn"
                                            value={this.state.checkInToCreate ? moment(this.state.checkInToCreate).format('YYYY-MM-DD') : ""}
                                            onChange={(val) => {

                                                var timeCheckIn = moment(this.state.checkInToCreate).format('hh:mm:ss');
                                                var checkinChanged = moment(val.target.value + ' ' + timeCheckIn).format();

                                                return this.setState({ checkInToCreate: checkinChanged });
                                            }}
                                            isInvalid={this.state.validationCreateForm.CheckIn ? true : null}>

                                        </Form.Control>

                                        <span style={{ color: "red" }}>{this.state.validationCreateForm?.InvalidRangeDate}</span>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Jam CheckIn</Form.Label>
                                    </Col>
                                    <Col>

                                        <TimeField
                                            id="timeCheckIn"
                                            name="timeCheckIn"
                                            value={this.state.checkInToCreate ? moment(this.state.checkInToCreate).format('HH:mm:ss') : new Date()}
                                            onChange={(val) => {

                                                var dateCheckIn = moment(this.state.checkInToCreate).format('YYYY-MM-DD');
                                                var checkinChanged = moment(dateCheckIn + ' ' + val.target.value);
                                                return this.setState({ checkInToCreate: checkinChanged });

                                            }}
                                            showSeconds
                                            style={{
                                                border: '1px solid #c2d6d6',
                                                fontSize: 16,
                                                width: "100%",
                                                padding: '5px 8px',
                                                color: '#333',
                                                borderRadius: 1
                                            }}

                                        /><br />
                                        <span style={{ color: "red" }}>{this.state.validationCreateForm?.SameTime}</span>
                                    </Col>
                                </Row>
                                <br />
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Tanggal CheckOut</Form.Label>
                                    </Col>
                                    <Col>

                                        <Form.Control
                                            type="date"
                                            name="dateCheckOut"
                                            id="dateCheckOut"
                                            value={this.state.checkOutToCreate ? moment(this.state.checkOutToCreate).format('YYYY-MM-DD') : new Date()}
                                            onChange={(val) => {

                                                var timeCheckOut = moment(this.state.checkOutToCreate).format('hh:mm:ss');
                                                var checkOutChanged = moment(val.target.value + ' ' + timeCheckOut).format();

                                                return this.setState({ checkOutToCreate: checkOutChanged });
                                            }}
                                            isInvalid={this.state.validationCreateForm.CheckOut ? true : null}>

                                        </Form.Control>

                                        <span style={{ color: "red" }}>{this.state.validationCreateForm?.InvalidRangeDate}</span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Jam CheckOut</Form.Label>
                                    </Col>
                                    <Col>

                                        <TimeField
                                            id="timeCheckOut"
                                            name="timeCheckOut"
                                            value={this.state.checkOutToCreate ? moment(this.state.checkOutToCreate).format('HH:mm:ss') : new Date()}
                                            onChange={(val) => {

                                                var { selectedAttendance } = this.state;
                                                var dateCheckOut = moment(this.state.checkOutToCreate).format('YYYY-MM-DD');
                                                var checkOutChanged = moment(dateCheckOut + ' ' + val.target.value);
                                                //   selectedAttendance["checkOutToCreate"] = checkOutChanged;
                                                return this.setState({ checkOutToCreate: checkOutChanged });
                                            }}
                                            showSeconds
                                            style={{
                                                border: '1px solid #c2d6d6',
                                                fontSize: 16,
                                                width: "100%",
                                                padding: '5px 8px',
                                                color: '#333',
                                                borderRadius: 1
                                            }}

                                        />
                                        <span style={{ color: "red" }}>{this.state.validationCreateForm?.SameTime}</span>



                                    </Col>
                                </Row>



                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="create-attendance" onClick={this.handleCreateAttendance}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        {/* modal View */}
                        <Modal dialogClassName="custom-dialog" aria-labelledby="modal-view-attendance" show={this.state.isShowViewAttendanceModal}
                            onHide={() => this.showViewAttendanceModal(false)} animation={true}>
                            <Modal.Header>
                                <Modal.Title id="modal-view-attendance">Detail Absensi</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Periode</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>
                                            {moment(this.state.selectedAttendance?.Period).format("DD-MM-YYYY")}
                                        </Form.Label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>NIK</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedAttendance?.EmployeeIdentity}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Nama</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedAttendance?.EmployeeName}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Unit/Bagian</Form.Label>
                                    </Col>
                                    <Col sm={8}>

                                        <Form.Label>{this.state.selectedAttendance?.UnitName}</Form.Label>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Seksi</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedAttendance?.SectionName}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Group</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedAttendance?.GroupName}</Form.Label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Tanggal Masuk</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label> {moment(this.state.selectedAttendance?.JoinDate).format("DD-MM-YYYY")}</Form.Label>
                                    </Col>
                                </Row>



                            </Modal.Body>
                            {/* <Modal.Footer>
                            {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                <div>
                                <Button className="btn btn-success" name="view-driver-allowance" onClick={this.setState({isShowViewAttendanceModal:false})}>Close</Button>
                                </div>
                            )}
                            </Modal.Footer> */}
                        </Modal>

                        {/* modal edit */}
                        <Modal dialogClassName="custom-dialog" aria-labelledby="modal-edit-attendance" show={this.state.isShowEditAttendanceModal}
                            onHide={() => this.showEditAttendanceModal(false)} animation={true}>
                            <Modal.Header>
                                <Modal.Title id="modal-edit-attendance">Edit Data Absensi</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form noValidate>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>NIK</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Label>{this.state.selectedAttendance.EmployeeIdentity}</Form.Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Nama Karyawan</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Label>{this.state.selectedAttendance.EmployeeName}</Form.Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Unit</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Label>{this.state.selectedAttendance.Unit}</Form.Label>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Tanggal CheckIn</Form.Label>
                                        </Col>
                                        <Col>

                                            <Form.Control
                                                type="date"
                                                name="dateCheckIn"
                                                id="dateCheckIn"
                                                value={this.state.selectedAttendance.CheckIn ? moment(this.state.selectedAttendance.CheckIn).format('YYYY-MM-DD') : ""}
                                                onChange={(val) => {

                                                    var { selectedAttendance } = this.state;
                                                    var timeCheckIn = moment(this.state.selectedAttendance.CheckIn).format('HH:mm:ss');
                                                    var checkinChanged = moment(val.target.value + ' ' + timeCheckIn).format();
                                                    selectedAttendance["CheckIn"] = checkinChanged;
                                                    return this.setState({ selectedAttendance: selectedAttendance });
                                                }}
                                                isInvalid={this.state.validationEditForm.CheckIn ? true : null}>

                                            </Form.Control>

                                            <span style={{ color: "red" }}>{this.state.validationEditForm?.CheckIn}</span>
                                            <span style={{ color: "red" }}>{this.state.validationEditForm?.InvalidRangeDate}</span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Jam CheckIn</Form.Label>
                                        </Col>
                                        <Col>

                                            <TimeField
                                                id="timeCheckIn"
                                                name="timeCheckIn"
                                                value={this.state.selectedAttendance.CheckIn ? moment(this.state.selectedAttendance.CheckIn).format('HH:mm:ss') : ""}
                                                onChange={(val) => {

                                                    var { selectedAttendance } = this.state;
                                                    var dateCheckIn = moment(this.state.selectedAttendance.CheckIn).format('YYYY-MM-DD');
                                                    var checkinChanged = moment(dateCheckIn + ' ' + val.target.value);
                                                    selectedAttendance["CheckIn"] = checkinChanged;
                                                    return this.setState({ selectedAttendance: selectedAttendance });
                                                }}
                                                showSeconds
                                                style={{
                                                    border: '1px solid #c2d6d6',
                                                    fontSize: 16,
                                                    width: "100%",
                                                    padding: '5px 8px',
                                                    color: '#333',
                                                    borderRadius: 1
                                                }}

                                            />
                                            <span style={{ color: "red" }}>{this.state.validationEditForm?.InvalidRangeDate}</span>
                                            <span style={{ color: "red" }}>{this.state.validationEditForm?.SameTime}</span>


                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Tanggal CheckOut</Form.Label>
                                        </Col>
                                        <Col>
                                            {this.state.selectedAttendance.CheckOut ? moment(this.state.selectedAttendance.CheckOut).year() != 1 ?
                                                <Form.Control
                                                    type="date"
                                                    name="dateCheckOut"
                                                    id="dateCheckOut"
                                                    value={this.state.selectedAttendance.CheckOut ? moment(this.state.selectedAttendance.CheckOut).format('YYYY-MM-DD') : ""}
                                                    onChange={(val) => {

                                                        var { selectedAttendance } = this.state;
                                                        var timeCheckOut = moment(this.state.selectedAttendance.CheckOut).format('HH:mm:ss');
                                                        var checkoutChanged = moment(val.target.value + ' ' + timeCheckOut);
                                                        selectedAttendance["CheckOut"] = checkoutChanged;
                                                        return this.setState({ selectedAttendance: selectedAttendance });
                                                    }}

                                                    isInvalid={this.state.validationEditForm.CheckOut ? true : null}>
                                                </Form.Control>

                                                : null : null}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Jam CheckOut</Form.Label>
                                        </Col>
                                        <Col>
                                            {this.state.selectedAttendance.CheckOut ? moment(this.state.selectedAttendance.CheckOut).year() != 1 ?
                                                <TimeField
                                                    id="timeCheckOut"
                                                    name="timeCheckOut"

                                                    value={this.state.selectedAttendance.CheckOut ? moment(this.state.selectedAttendance.CheckOut).format('HH:mm:ss') : ""}
                                                    onChange={(val) => {

                                                        var { selectedAttendance } = this.state;
                                                        var dateCheckOut = moment(this.state.selectedAttendance.CheckOut).format('YYYY-MM-DD');
                                                        var checkoutChanged = moment(dateCheckOut + ' ' + val.target.value);
                                                        selectedAttendance["CheckOut"] = checkoutChanged;
                                                        return this.setState({ selectedAttendance: selectedAttendance });
                                                    }}
                                                    showSeconds
                                                    style={{
                                                        border: '1px solid #c2d6d6',
                                                        fontSize: 16,
                                                        width: "100%",
                                                        padding: '5px 8px',
                                                        color: '#333',
                                                        borderRadius: 1
                                                    }}
                                                />
                                                : null : null}

                                            <span style={{ color: "red" }}>{this.state.validationEditForm?.SameTime}</span>
                                        </Col>
                                    </Row>
                                </Form>

                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="edit-credit-union-cut"
                                            onClick={this.handleEditAttendance}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        {/* modal delete */}

                        <Modal aria-labelledby="modal-delete-attendance" show={this.state.isShowDeleteAttendanceModal}
                            onHide={() => this.showDeleteAttendanceModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-delete-attendance">Hapus Data Absensi</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Apakah anda yakin ingin menghapus data {this.state.selectedAttendance?.EmployeeName} pada tanggal {moment.utc(this.state.selectedAttendance.CheckIn).format('DD MMMM YYYY')} ?
                                </Modal.Body>
                            <Modal.Footer>
                                {this.state.deleteAttendanceLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-danger" name="delete-delete"
                                            onClick={this.deleteAttendanceClickHandler}>Hapus</Button>
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

export default AttendanceManual;
