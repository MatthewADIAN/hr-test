import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import {
    Form,
    Spinner,
    FormGroup,
    FormLabel,
    Row,
    Col,
    Table,
    Button,
    Modal,
    Image,
    ModalBody,
    ModalFooter
} from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './RowButtonComponent';
import * as CONST from '../../../Constant';
import axios from 'axios';
import Service from './../Service';
import swal from 'sweetalert';
import './style.css';
import * as moment from 'moment'
var fileDownload = require('js-file-download');

const days = ["Minggu,", "Senin,", "Selasa,", "Rabu,", "Kamis,", "Jum'at,", "Sabtu,"];
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
class WfhRecap extends Component {
    typeaheadEmployeeCreateForm = {};
    typeaheadEmployeeSearchForm = {};
    state = {
        isApproveLoading: false,
        isAutoCompleteLoading: false,
        loading: false,
        rejectRequestLoading: false,
        resetRequestLoading: false,

        dateRange: [],
        selectedRequest: {},

        employees: [],
        groups: [],
        sections: [],
        units: [],

        //modal state
        isShowApproveRequestModal: false,
        isShowViewRequestModal: false,
        isShowRejectRequestModal: false,
        isShowResetRequestModal: false,

        ReasonToApprove: "",
        ReasonToReject: "",

        searchEmployee: [],
        searchGroups: [],
        searchSections: [],
        searchUnits: [],

        selectedGroup: null,
        selectedSection: null,
        selectedUnit: null,

        selectedSearchEmployee: null,
        selectedSearchGroup: null,
        selectedSearchSection: null,
        selectedSearchUnit: null,

        startDate: "",
        endDate: "",

        userUnitId: localStorage.getItem("unitId"),
        userAccessRole: localStorage.getItem("accessRole"),
        otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),

        activePage: 1,
        loadingData: false,
        tableData: [],
        total: 0,

        validationCreateForm: {},
        validationSearch: {},
        form: {},

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

    resetPagingConfiguration = () => {
        this.setUnitsSearch();
        this.setGroupsSearch(null);
        this.setSectionsSearch(null);
        this.setState({
            activePage: 1,
            selectedUnit: null,
            selectedSection: null,
            selectedGroup: null,
            startDate: "",
            endDate: "",
            selectedSearchGroup: null,
            selectedSearchUnit: null,
            selectedSearchSection: null,
            selectedSearchEmployee: null,
        });
        var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm
        instanceEmployeeSearch.clear();
    }

    searchData = () => {

        const params = {
            unitId: this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0,
            groupId: this.state.selectedSearchGroup ? this.state.selectedSearchGroup.Id : 0,
            sectionId: this.state.selectedSearchSection ? this.state.selectedSearchSection.Id : 0,
            employeeId: this.state.selectedSearchEmployee ? this.state.selectedSearchEmployee.Id : 0,
            page: this.state.activePage,
            adminEmployeeId: Number(localStorage.getItem("employeeId")),
            startDate: moment(this.state.startDate).format("YYYY-MM-DD"),
            endDate: moment(this.state.endDate).format("YYYY-MM-DD")
        };

        this.setState({ loadingData: true })
        this.service
            .getIndexWfh(params)
            .then((result) => {
                this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
            }).catch((err) => {
                this.setState({ activePage: 1, total: 0, tableData: [], loadingData: false })
            });
    }

    setData = () => {
        this.resetPagingConfiguration();

        const params = {
            unitId: this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0,
            groupId: this.state.selectedSearchGroup ? this.state.selectedSearchGroup.Id : 0,
            sectionId: this.state.selectedSearchSection ? this.state.selectedSearchSection.Id : 0,
            employeeId: this.state.selectedSearchEmployee ? this.state.selectedSearchEmployee.Id : 0,
            page: this.state.activePage,
            startDate: moment(this.state.startDate).format("YYYY-MM-DD"),
            endDate: moment(this.state.endDate).format("YYYY-MM-DD"),
            adminEmployeeId: Number(localStorage.getItem("employeeId"))
        };

        this.setState({ loadingData: true })
        this.service
            .getIndexWfh(params)
            .then((result) => {
                this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
            }).catch((err) => {
                this.setState({ activePage: 1, total: 0, tableData: [], loadingData: false })
            });
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
                  if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
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
                .getAllGroupsBySection(sectionId)
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
                .getAllSectionsByUnit(unitId)
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
            this.setState({ validationSearch: { InvalidDateRange: "Tanggal Akhir harus lebih dari Tanggal Awal" } })
        }
        else if (this.state.startDate == null || this.state.startDate == "") {
            this.setState({ validationSearch: { StartDate: "Tanggal Awal harus dIisi" } })
        }
        else if (this.state.endDate == null || this.state.endDate == "") {
            this.setState({ validationSearch: { EndDate: "Tanggal Akhir harus dIisi" } })
        }
        else {
            this.searchData();
        }

    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }


    handleEmployeeSearchModal = (query) => {
        this.setState({ isAutoCompleteLoading: true });

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
            keyword: query,
            adminEmployeeId: Number(localStorage.getItem("employeeId"))
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


    handleDownloadRecapWfh = () => {
        this.setState({ loadingData: true })
      
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));
        let query = `?adminEmployeeId=${adminEmployeeId}`
       
        if (this.state.startDate)
          query += "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD")
      
        if (this.state.endDate)
          query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD")
      
        if (this.state.selectedSearchEmployee)
          query += "&employeeId=" + this.state.selectedSearchEmployee?.Id
      
        if (this.state.selectedSearchUnit)
          query += "&unitId=" + this.state.selectedSearchUnit?.Id
      
        if (this.state.selectedSearchGroup)
          query += "&groupId=" + this.state.selectedSearchGroup?.Id
        if (this.state.selectedSearchSection)
          query += "&sectionId=" + this.state.selectedSearchSection?.Id
      
      
          
      
        console.log(query)
      
        this.service.getRecapWfh(query)
            .then(data=>{
              let disposition = data.headers['content-disposition']
                let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])
            
                fileDownload(data.data, filename);
                this.setState({ loading: false, loadingData: false });
            }).catch(err =>{
              this.setState({ loading: false, loadingData: false });
            })
      }


    showRejectRequestModal = (value) => {
        this.setState({ isShowRejectRequestModal: value, rejectRequestLoading: false });
    }


    showResetRequestModal = (value) => {
        this.setState({ isShowResetRequestModal: value, resetRequestLoading: false });
    }


    handleViewClick = (request) => {
        this.setState({
            loading: false,
            activePage: 1,
            page: 1,
            selectedRequest: request,

        }, () => {
            this.showViewRequestModal(true);
        });

    }


    handleApproveClick = (request) => {

        this.setState({
            loading: false,
            activePage: 1,
            page: 1,
            selectedRequest: request,

        }, () => {
            this.showApproveRequestModal(true);
        });


    }

    handleRejectClick = (request) => {
        this.setState({ selectedRequest: request }, () => {
            this.showRejectRequestModal(true);
        });
    }

    handleResetClick = (request) => {
        this.setState({ selectedRequest: request }, () => {
            this.showResetRequestModal(true);
        });
    }



    handleApprove = () => {

        this.setState({ updateEmployeeLoading: true });
        const params = {
            IdWfh: this.state.selectedRequest?.Id,
            Reason: this.state.ReasonToApprove,
        }

        this.service
            .approveRequest(params)
            .then((result) => {
                swal("Data berhasil diapprove!");
                this.setState({ isApproveLoading: false, selectedRequest: {}, page: 1, activePage: 1 }, () => {
                    this.showApproveRequestModal(false);
                    this.setData();
                });
            }).catch((err) => {
                if (err.response) {
                    this.setState({ validationCreateForm: err.response.data.error });
                    console.log(this.state);
                }
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Terjadi kesalahan!"
                });
                this.showApproveRequestModal(false);
                this.setData();
            });
    };



    handleRejectRequest = () => {
        this.setState({ rejectRequestLoading: true });

        const params = {
            IdWfh: this.state.selectedRequest?.Id,
            Reason: this.state.ReasonToReject,
        }

        this.service
            .rejectRequest(params)
            .then((result) => {
                swal("Data berhasil direject!");
                this.setState({ rejectRequestLoading: false, selectedRequest: {}, page: 1, activePage: 1 }, () => {
                    this.showRejectRequestModal(false);
                    this.setData();
                });
            }).catch((err) => {
                let message = ""
                if (err.Notification) {
                    message += err.Notification
                }
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: message
                });

                console.log(err.response.data.error)
                if (err.response) {
                    this.setState({ validationCreateForm: err.response.data.error });
                    console.log(this.state);
                }

                this.showRejectRequestModal(false);
                this.setData();
            });

    }


    handleResetRequest = () => {

        this.setState({ rejectRequestLoading: true });
        const params = {
            IdWfh: this.state.selectedRequest?.Id,
            Reason: this.state.ReasonToReject,
        }

        this.service
            .resetRequest(params)
            .then((result) => {
                swal("Data berhasil direset!");
                this.setState({ resetRequestLoading: false, selectedRequest: {}, page: 1, activePage: 1 }, () => {
                    this.showResetRequestModal(false);
                    this.setData();
                });
            }).catch((err) => {
                if (err.response) {
                    this.setState({ validationCreateForm: err.response.data.error });
                }
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Terjadi kesalahan!"
                });

                this.showResetRequestModal(false);
                this.setData();
            });

    }



    showApproveRequestModal = (value) => {
        if (!value) {
            this.setState({ selectedRequest: {} });
        }

        this.setState({ isShowApproveRequestModal: value, isApproveLoading: false });
    }

    showViewRequestModal = (value) => {
        if (!value) {
            this.setState({ selectedRequest: {} });
        }

        this.setState({ isShowViewRequestModal: value });
    }

    render() {
        const { tableData } = this.state;
        console.log("tableData", tableData)
        const items = tableData.map((item, index) => {

            return (

                <tbody key={index} data-category={item.Id}>
                    <tr>
                        <td>{++index}</td>
                        <td>{days[moment(item.CreatedUtc).day()]} {moment(item.CreatedUtc).format('DD/MM/YYYY')}</td>
                        <td>{item.EmployeeIdentity}</td>
                        <td>{item.EmployeeName}</td>
                        <td>{item.UnitName}</td>
                        <td>{moment(item.CheckIn).format('DD/MM/YYYY HH:mm')}</td>
                        <td>{moment(item.CheckOut).year() === 1
                            ? ("")
                            : (moment.utc(item.CheckOut).local().format('DD/MM/YYYY HH:mm'))}
                        </td>
                        <td>[{item.Latitude} , {item.Longitude}]</td>
                        <td>{item.EmployeeLeaderIdentity}</td>
                        <td>{item.EmployeeLeaderName}</td>
                        <td>{item.StatusRequestName}</td>
                        <td> {item.CheckInImageUri !== "" || item.CheckInImageUri !== null ? <Image className="photo" src={item.CheckInImageUri} thumbnail /> : null}
                            <br /></td>


                        <td>

                            <FormGroup>
                                <RowButtonComponent className="btn btn-success" name="view-request"
                                    onClick={this.handleViewClick} data={item} iconClassName="fa fa-eye"
                                    label=""></RowButtonComponent>
                                {/* <RowButtonComponent className="btn btn-primary" name="approve-request"
                                    onClick={this.handleApproveClick} data={item} iconClassName="fa fa-check"
                                    label=""></RowButtonComponent>

                                <RowButtonComponent disabled className="btn btn-danger" name="reject-request"
                                    onClick={this.handleRejectClick} data={item} iconClassName="fa fa-stop"
                                    label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-warning" name="reset-request"
                                    onClick={this.handleResetClick} data={item} iconClassName="fa fa-undo"
                                    label=""></RowButtonComponent> */}

                            </FormGroup>

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

                                <Col sm={1} className={'text-left'}>
                                    <FormLabel>Unit/Bagian</FormLabel>

                                </Col>
                                <Col sm={4}>
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
                                        }} />
                                </Col>
                            </Row>
                        </FormGroup>
                        <FormGroup>
                            <Row>
                                <Col sm={1} className={'text-left'}>
                                    <FormLabel>Seksi</FormLabel>
                                </Col>
                                <Col sm={4}>
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
                                <Col sm={1} className={'text-left'}>
                                    <FormLabel>Group</FormLabel>
                                </Col>
                                <Col sm={4}>
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
                                <Col sm={1} className={'text-left'}>
                                    <FormLabel>Periode</FormLabel>
                                </Col>
                                <Col sm={4}>
                                    <Row>
                                        <Col sm={5}>
                                            <Form.Control
                                                type="date"
                                                value={this.state.startDate}
                                                onChange={((event) => {
                                                    let errors = this.state.validationSearch
                                                    if (errors?.StartDate) {
                                                        errors['StartDate'] = ""
                                                    }
                                                    this.setState({ startDate: event.target.value, validationSearch: errors });
                                                })}
                                                isInvalid={this.state.validationSearch.StartDate} />
                                            <Form.Control.Feedback
                                                type="invalid">{this.state.validationSearch.StartDate}</Form.Control.Feedback>
                                        </Col>
                                        <Col sm={2} className={'text-center'}>s/d</Col>
                                        <Col sm={5}>
                                            <Form.Control
                                                type="date"
                                                value={this.state.endDate}
                                                onChange={((event) => {

                                                    let errors = this.state.validationSearch
                                                    if (errors?.EndDate) {
                                                        errors['EndDate'] = ""
                                                    }
                                                    if (errors?.InvalidDateRange) {
                                                        errors['InvalidDateRange'] = ""
                                                    }
                                                    this.setState({ endDate: event.target.value, validationSearch: errors });
                                                })}

                                                isInvalid={this.state.validationSearch.EndDate} />
                                            <Form.Control.Feedback
                                                type="invalid">{this.state.validationSearch.EndDate}</Form.Control.Feedback>
                                        </Col>
                                        <span className="text-danger">{this.state.validationSearch?.InvalidDateRange}</span>
                                    </Row>
                                </Col>
                            </Row>
                        </FormGroup>

                        <FormGroup>
                            <Row>
                                <Col sm={1} className={'text-left'}>
                                    <FormLabel>Karyawan</FormLabel>
                                </Col>
                                <Col sm={4}>

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
                                <Col sm={11}>
                                    <Button className="btn btn-secondary btn-sm mr-2 " name="btn-reset" onClick={this.resetPagingConfiguration}>Reset</Button>
                                    <Button className="btn btn-primary btn-sm mr-2 " name="btn-search" onClick={this.search}>Cari</Button>
                                    <Button className="btn btn-succes btn-sm mr-2 " name="btn-pdf" onClick={this.handleDownloadRecapWfh}>Pdf</Button>
                                </Col>
                            </Row>

                        </FormGroup>
                        <FormGroup>
                            {this.state.loadingData ? (
                                <span><Spinner size="sm" color="primary" /> Loading Data...</span>
                            ) : this.state.tableData.length <= 0 ? (<Table responsive bordered striped>
                                <thead>
                                    <tr className={'text-center'}>
                                        <th>No</th>
                                        <th>Tanggal</th>
                                        <th>NIK</th>
                                        <th>Nama</th>
                                        <th>Jam CheckIn </th>
                                        <th>Jam CheckOut</th>
                                        <th>Lokasi</th>
                                        <th>Nik Pimpinan</th>
                                        <th>Nama Pimpinan</th>
                                        <th>Status</th>
                                        <th>Foto</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr key="0">
                                        <td colSpan='12' className='text-center'>Data Kosong</td>
                                    </tr>
                                </tbody>
                            </Table>) : (
                                <Row>
                                    <Table responsive bordered striped>
                                        <thead>
                                            <tr className={'text-center'}>
                                                <th>No</th>
                                                <th>Tanggal</th>
                                                <th>NIK</th>
                                                <th>Nama</th>
                                                <th>Unit</th>
                                                <th>Jam CheckIn </th>
                                                <th>Jam CheckOut</th>
                                                <th>Lokasi</th>
                                                <th>Nik Pimpinan</th>
                                                <th>Nama Pimpinan</th>
                                                <th>Status</th>
                                                <th>Foto</th>
                                                <th></th>
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



                        {/* modal View */}
                        <Modal dialogClassName="modal-100w" size="lg" aria-labelledby="modal-view-request" show={this.state.isShowViewRequestModal}
                            onHide={() => this.showViewRequestModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-view-request">Detail Request WFH</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className="font-weight-bold">NIK</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedRequest?.EmployeeIdentity}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className="font-weight-bold">Nama</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedRequest?.EmployeeName}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className="font-weight-bold">Unit/Bagian</Form.Label>
                                    </Col>
                                    <Col sm={8}>

                                        <Form.Label>{this.state.selectedRequest?.UnitName}</Form.Label>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className="font-weight-bold">Seksi</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedRequest?.SectionName}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className="font-weight-bold">Group</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedRequest?.GroupName}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel className="font-weight-bold">Tanggal Wfh</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>
                                            {days[moment(this.state.selectedRequest?.CheckIn).day()]}
                                            {moment(this.state.selectedRequest?.CheckIn).format("DD-MM-YYYY")}
                                        </Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel className="font-weight-bold">Jam CheckIn</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label> {moment(this.state.selectedRequest?.CheckIn).format('DD/MM/YYYY HH:mm')}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel className="font-weight-bold">Jam CheckOut</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label> {moment(this.state.selectedRequest?.CheckOut).format('DD/MM/YYYY HH:mm')}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel className="font-weight-bold">Lokasi</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label> [{this.state.selectedRequest?.Latitude} , {this.state.selectedRequest?.Longitude}]</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel className="font-weight-bold">NIK Pimpinan</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label> {this.state.selectedRequest?.EmployeeLeaderIdentity}</Form.Label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel className="font-weight-bold">Nama Pimpinan</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label> {this.state.selectedRequest?.EmployeeLeaderName}</Form.Label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel className="font-weight-bold">Golongan</FormLabel>
                                    </Col>
                                    <Col sm={5}>
                                        <Form.Label>
                                            {this.state.selectedRequest?.EmploymentClass}
                                        </Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel className="font-weight-bold">Foto</FormLabel>
                                    </Col>
                                    <Col sm={5}>
                                        {this.state.selectedRequest?.CheckInImageUri !== "" && this.state.selectedRequest?.CheckInImageUri !== null ? <Image className="photo" src={this.state.selectedRequest?.CheckInImageUri} thumbnail /> : null}
                                        <br />
                                    </Col>
                                </Row>


                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className="font-weight-bold">Alasan WFH</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedRequest?.ReasonWfh}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className="font-weight-bold">Alasan Konfirmasi</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedRequest?.ReasonConfirmation}</Form.Label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className="font-weight-bold">Status Permohonan</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedRequest?.StatusRequestName}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label className="font-weight-bold">Disetujui oleh</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedRequest?.ConfirmationBy}</Form.Label>
                                    </Col>
                                </Row>

                            </Modal.Body>

                        </Modal>

                        {/* modal approval*/}
                        <Modal dialogClassName="modal-100w" aria-labelledby="modal-approve" show={this.state.isShowApproveRequestModal}
                            onHide={() => this.showApproveRequestModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-approve">Approve Request WFH</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                <Row>
                                    <Col sm={2} className={'text-left'}>
                                        <FormLabel>Konfirmasi Persetujuan</FormLabel>
                                    </Col>
                                    <Col sm={10}>
                                        <Form.Control
                                            type="text"
                                            as="textarea"
                                            name="ReasonToApprove"
                                            value={this.state.ReasonToApprove}
                                            onChange={(e) => {

                                                this.setState({ ReasonToApprove: e.target.value });
                                            }}
                                            isInvalid={this.state.validationCreateForm?.Reason ? true : null} />
                                        <span className="text-danger">{this.state.validationCreateForm?.Reason}</span>
                                    </Col>
                                </Row>

                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isApproveLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="edit-credit-union-cut"
                                            onClick={this.handleApprove}>Approve</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        {/* modal Reject */}
                        <Modal aria-labelledby="modal-reject-request" show={this.state.isShowRejectRequestModal}
                            onHide={() => this.showRejectRequestModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-reject-request">Tolak Request WFH</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                <Row>
                                    <Col sm={2} className={'text-left'}>
                                        <FormLabel>Konfirmasi Penolakan</FormLabel>
                                    </Col>
                                    <Col sm={10}>
                                        <Form.Control
                                            type="text"
                                            as="textarea"
                                            name="ReasonConfirmatiom"
                                            value={this.state.ReasonToReject}
                                            onChange={(e) => {

                                                this.setState({ ReasonToReject: e.target.value });
                                            }}
                                            isInvalid={this.state.validationCreateForm?.ReasonConfirmatiom ? true : null} />
                                        <span style={{ color: "red" }}>{this.state.validationCreateForm?.ReasonConfirmatiom}</span>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.rejectRequestLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-danger" name="reject"
                                            onClick={this.handleRejectRequest}>Tolak</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        {/* modal reset */}

                        <Modal aria-labelledby="modal-reset" show={this.state.isShowResetRequestModal}
                            onHide={() => this.showResetRequestModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-reset">Reset Request WFH</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                Apakah anda yakin untuk mereset data ini?
              </Modal.Body>
                            <Modal.Footer>
                                {this.state.resetRequestLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-warning" name="reset-request"
                                            onClick={this.handleResetRequest}>Reset</Button>
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

export default WfhRecap;
