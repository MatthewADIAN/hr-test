import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';


import Service from './../Service';
import swal from 'sweetalert';

import './style.css';
import { roundToNearestMinutes } from 'date-fns/fp';

const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
class Leave extends Component {

  typeaheadEmployee = {};

  state = {
    loading: false,
    isAutoCompleteLoading: false,

    // types: [
    //     { value: "", label: "" },
    //     { value: "Cuti Hari Biasa ISIDENTIL", label: "Cuti Hari Biasa ISIDENTIL" },
    //     { value: "Cuti Hari Libur Bagian", label: "Cuti Hari Libur Bagian" },
    //     { value: "Cuti Hari Libur Resmi", label: "Cuti Hari Libur Resmi" },
    // ],

    attendance: "",
    schedule: "",
    leaveTotalHours: "",
    selectedUnitToCreate: null,
    selectedEmployeeToCreate: null,
    selectedHourToCreate: "00",
    selectedMinuteToCreate: "00",
    selectedLeaveTypeToCreate: null,
    startDateToCreate: null,
    endDateToCreate: null,
    attendanceToCreate: null,
    isCreateLoading: false,
    isShowAddLeaveModal: false,

    isShowDeleteLeaveModal: false,
    isDeleteLeaveLoading: false,

    selectedUnit: null,
    units: [],

    selectedLeaveType: null,
    leaveTypes: [],

    selectedEmployee: null,
    employees: [],

    // minimum date value js
    startDate: null,
    endDate: null,

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],
    selectedItem: null,

    hours: [],
    minutes: [],

    leave: {},

    isShowViewLeaveModal: false,

    isShowEditLeaveModal: false,
    isEditLoading: false,

    startDateToEdit: null,
    endDateToEdit: null,

    selectedLeaveTypeToEdit: null,

    isHalfDay: false,
    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    validationCreateForm: {},
    validationEditForm: {},
    validationSearch: {},
    otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),
  }

  resetCreateModalValue = () => {
    this.setState({
      attendance: "",
      schedule: "",
      leave: "",
      // selectedUnitToCreate: null,
      selectedEmployeeToCreate: null,
      selectedLeaveType: "",
      startDate: null,
      endDate: null,
      startDateToCreate: null,
      endDateToCreate: null,
      validationCreateForm: {},
      validationEditForm: {},
      validationSearch: {},

      isHalfDay: false
    })
  }

  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
      selectedUnit: null,

      selectedEmployee: null,
      selectedLeaveTypeToCreate: null,
      validationSearch: {},
      // startDate: null,
      // endDate: null
    })
  }

  constructor(props) {
    super(props);
    // console.log(props);
    this.service = new Service();
    this.handleEmployeeTypeahead = this.handleEmployeeTypeahead.bind(this);
    this.typeaheadEmployeeCreateForm = null;
  }

  setHours = () => {
    var result = [];
    for (var i = 0; i <= 23; i++) {
      var number = i.toString();
      number = number.padStart(2, '0');
      var data = { label: number, value: number }
      result.push(data);
    }
    this.setState({ hours: result });
  }

  setMinutes = () => {
    var result = [];
    for (var i = 0; i <= 59; i++) {
      var number = i.toString();
      number = number.padStart(2, '0');
      var data = { label: number, value: number }
      result.push(data);
    }
    this.setState({ minutes: result });
  }

  componentDidMount() {
    this.setUnits();
    this.setLeaveTypes();
    this.setData();
    this.setHours();
    this.setMinutes();
  }

  setData = () => {
    const params = {
      unitId: /*this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.userUnitId :*/ this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
      employeeId: this.state.selectedEmployee ? this.state.selectedEmployee.Id : 0,
      page: this.state.activePage,
      startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.state.endDate).format('YYYY-MM-DD')
    };

    this.setState({ loadingData: true })
    this.service
      .getLeave(params)
      .then((result) => {
        // console.log(result);
        this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false, startDate: this.state.startDate, endDate: this.state.endDate })
      });
  }

  setUnits = () => {
    this.setState({ loading: true })
    this.service
      .getAllUnits()
      .then((result) => {
        var units = [];
        result.map(s => {
          if (this.state.userAccessRole == PERSONALIA_BAGIAN && this.state.otherUnitId.includes(s.Id)) {
            units.push(s);
          } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
            units.push(s);
          }
        });
        this.setState({ units: units, loading: false })
      });
  }

  setLeaveTypes = () => {
    this.setState({ loading: true })
    this.service
      .getAllLeaveTypes()
      .then((result) => {
        this.setState({ leaveTypes: result, loading: false })
      });
  }

  handleEmployeeSearch = (query) => {
    // this.setState({ isAutoCompleteLoading: true });

    const params = {
      unitId: this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
      keyword: query,
      statusEmployee: "AKTIF"
    }

    this.service
      .searchEmployee(params)
      .then((result) => {

        result = result.map((employee) => {

          employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} - ${employee.Name}`;
          return employee;
        });
        this.setState({ employees: result }, () => {
          // this.setState({ isAutoCompleteLoading: false });
        });
      });
  }

  handleEmployeeSearchModal = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const params = {
      unitId: this.state.selectedUnitToCreate ? this.state.selectedUnitToCreate.Id : 0,
      keyword: query,
      statusEmployee: "AKTIF"
    }

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

  search = () => {
    this.setState({ validationSearch: {} });
    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { EndDate: "Tanggal Akhir Harus lebih Dari Tanggal Awal" } })
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal mulai harus diisi" } })
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { EndDate: "Tanggal akhir harus diisi" } })
    } else {
      this.setData();
    }


  }

  create = () => {
    this.showAddLeaveModal(true);
  }

  createMany = () => {
    this.props.history.push('/attendance/multiple-input-leave');

  }

  showAddLeaveModal = (value) => {
    this.resetCreateModalValue();
    this.setState({ isShowAddLeaveModal: value });
  }

  showDeleteLeaveModal = (value) => {
    this.setState({ isShowDeleteLeaveModal: value });
  }

  showViewLeaveModal = (value) => {
    this.setState({ isShowViewLeaveModal: value });
  }

  showEditLeaveModal = (value) => {
    this.setState({ isShowEditLeaveModal: value, validationEditForm: {} });
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  }

  handleCreateLeave = () => {
    const payload = {
      UnitId: this.state.selectedUnitToCreate?.Id,
      EmployeeId: this.state.selectedEmployeeToCreate?.Id,
      LeaveTypeId: this.state.selectedLeaveTypeToCreate?.Id,
      LeaveTypeName: this.state.selectedLeaveTypeToCreate?.Name,
      StartDate: this.state.startDateToCreate,
      EndDate: this.state.endDateToCreate,
      IsHalfDay: this.state.isHalfDay
    }

    this.setState({ isCreateLoading: true });
    this.service.createLeave(payload)
      .then((result) => {
        // console.log(result);
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil disimpan!'
        })

        this.setState({ isCreateLoading: false }, () => {
          this.handleEmployeeTypeahead()
          this.resetPagingConfiguration();
          this.setData();
          this.showAddLeaveModal(true);
        });
      })
      .catch((error) => {
        if (error) {
          let message = "";
          if (error.Employee)
            message += `- ${error.Employee}\n`;

          if (error.LeaveType)
            message += `- ${error.LeaveType}\n`;

          if (error.Unit)
            message += `- ${error.Unit}\n`;

          if (error.StartDate)
            message += `- ${error.StartDate}\n`;

          if (error.EndDate)
            message += `- ${error.EndDate}\n`;

          if (error.InvalidDateRange)
            message += `- ${error.InvalidDateRange}\n`;

          if (error.DayOff)
            message += `- ${error.DayOff}\n`;

          if (error.NoAvailableSchedule)
            message += `- ${error.NoAvailableSchedule}\n`;

          this.setState({ isCreateLoading: false, validationCreateForm: error });
          swal({
            icon: 'error',
            title: 'Oops...',
            text: message
          });
        }
      });
    // console.log(payload);
  }

  handleEditLeave = () => {
    // console.log(this.state.leave);
    const payload = {
      UnitId: this.state.leave?.UnitId,
      EmployeeId: this.state.leave?.EmployeeId,
      StartDate: this.state.startDateToEdit,
      EndDate: this.state.endDateToEdit,
      TotalHours: this.state.selectedHourToEdit && this.state.selectedHourToEdit.value && this.state.selectedMinuteToEdit && this.state.selectedMinuteToEdit.value ? `${this.state.selectedHourToEdit.value}:${this.state.selectedMinuteToEdit.value}` : "00:00",
      LeaveTypeId: this.state.selectedLeaveTypeToEdit.value,
      LeaveTypeName: this.state.selectedLeaveTypeToEdit.label,
      IsHalfDay: this.state.leave.IsHalfDay ? true : false
    }

    this.setState({ isEditLoading: true });
    this.service.editLeave(this.state.selectedItem?.Id, payload)
      .then((result) => {
        // console.log(result);
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil diubah!'
        })
        this.setState({ isEditLoading: false }, () => {

          this.resetPagingConfiguration();
          this.setData();
          this.showEditLeaveModal(false);
        });
      })
      .catch((error) => {
        if (error) {
          let message = "";
          if (error.Employee)
            message += `- ${error.Employee}\n`;

          if (error.Type)
            message += `- ${error.Type}\n`;

          if (error.Unit)
            message += `- ${error.Unit}\n`;

          if (error.TotalHours)
            message += `- ${error.TotalHours}\n`;

          if (error.InvalidDateRange)
            message += `- ${error.InvalidDateRange}\n`;

          this.setState({ isCreateLoading: false, validationEditForm: error });
          swal({
            icon: 'error',
            title: 'Oops...',
            text: message
          });
        }
      });
  }

  handleViewLeaveClick = (item) => {
    this.service.getLeaveById(item.Id)
      .then((leave) => {
        let startDate = moment(leave.StartDate).format('YYYY-MM-DD');
        let endDate = moment(leave.EndDate).format('YYYY-MM-DD');

        leave.StartDate = startDate;
        leave.EndDate = endDate;

        this.setState({ leave: leave }, () => {
          this.showViewLeaveModal(true);
        })
      })
    // console.log(item);
  }

  handleEditLeaveClick = (item) => {
    this.setState({ selectedItem: item });
    this.service.getLeaveById(item.Id)
      .then((leave) => {
        let startDate = moment(leave.StartDate).format('YYYY-MM-DD');
        let endDate = moment(leave.EndDate).format('YYYY-MM-DD');
        let selectedLeaveTypeToEdit = {
          value: leave.LeaveTypeId,
          label: leave.LeaveTypeName
        };
        this.setState({ leave: leave, startDateToEdit: startDate, endDateToEdit: endDate, selectedLeaveTypeToEdit: selectedLeaveTypeToEdit }, () => {
          this.showEditLeaveModal(true);
        })
      })
  }

  handleDeleteLeaveClick = (item) => {
    this.setState({ selectedItem: item }, () => {
      this.showDeleteLeaveModal(true);
    })
  }

  deleteLeaveClickHandler = () => {
    this.setState({ isDeleteLeaveLoading: true })
    this.service.deleteLeave(this.state.selectedItem?.Id)
      .then((result) => {
        // console.log(result);
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil dihapus!'
        })
        this.setState({ isDeleteLeaveLoading: false, selectedItem: null }, () => {

          this.resetPagingConfiguration();
          this.setData();
          this.showDeleteLeaveModal(false);
        });
      })
  }
  handleEmployeeTypeahead() {

    this.typeaheadEmployeeCreateForm.clear();
  }


  render() {
    const { tableData } = this.state;

    // const  = {
    //     ".Row": {

    //     }
    // }

    const items = tableData.map((item, index) => {
      // const hour = item.TotalHours.split(':')[0];
      // const minute = item.TotalHours.split(':')[1];

      return (
        <tr key={item.Id} data-category={item.Id}>
          <td>{moment(item.StartDate).format('DD/MM/YYYY')}</td>
          <td>{item.EmployeeIdentity}</td>
          <td>{item.EmployeeName}</td>
          <td>{item.UnitName}</td>
          <td>{item.SectionName}</td>
          <td>{item.GroupName}</td>
          <td>{item.LeaveTypeCode}</td>
          <td>{item.LeaveTypeName}</td>
          <td>
            <Form>
              <FormGroup>
                <RowButtonComponent className="btn btn-success" name="view-leave" onClick={this.handleViewLeaveClick} data={item} iconClassName="fa fa-eye" label=""></RowButtonComponent>
                <RowButtonComponent className="btn btn-primary" name="edit-leave" onClick={this.handleEditLeaveClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                <RowButtonComponent className="btn btn-danger" name="delete-leave" onClick={this.handleDeleteLeaveClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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
                  <Col sm={1} className={'text-left'}>
                    <FormLabel>Unit</FormLabel>
                  </Col>
                  <Col sm={4}>
                    <Select
                      placeholder={'pilih unit'}
                      isClearable={true}
                      options={this.state.units}
                      value={this.state.selectedUnit}
                      onChange={(value) => {
                        this.setState({ selectedUnit: value });
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
                        <Input
                          type="date"
                          value={this.state.startDate}
                          onChange={((event) => {
                            this.setState({ startDate: event.target.value });
                          })}
                          isInvalid={this.state.validationSearch.StartDate ? true : null}
                        />
                        <span style={{ color: "red" }}>{this.state.validationSearch.StartDate}</span>
                      </Col>
                      <Col sm={2} className={'text-center'}>s/d</Col>
                      <Col sm={5}>
                        <Input
                          type="date"
                          value={this.state.endDate}
                          onChange={((event) => {
                            this.setState({ endDate: event.target.value });
                          })}

                        />
                        <span style={{ color: "red" }}>{this.state.validationSearch.EndDate}</span>

                      </Col>
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
                      clearButton
                      id="loader-employee"
                      ref={(typeahead) => { this.typeaheadEmployee = typeahead }}
                      isLoading={this.state.isAutoCompleteLoading}
                      onChange={(selected) => {
                        this.setState({ selectedEmployee: selected[0] });
                      }}
                      labelKey="NameAndEmployeeIdentity"
                      minLength={1}
                      onSearch={this.handleEmployeeSearch}
                      options={this.state.employees}
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

                    <Button className="btn btn-primary btn-sm mr-3" name="search" onClick={this.search}>Cari</Button>
                    <Button className="btn btn-success btn-sm mr-3" name="input-leave" onClick={this.create}>Input Cuti</Button>
                    <Button className="btn btn-success btn-sm mr-3" name="multiple-input-leave" onClick={this.createMany}>Input Banyak Cuti</Button>
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
                            <th>Tanggal</th>
                            <th>NIK</th>
                            <th>Nama</th>
                            <th>Unit</th>
                            <th>Seksi</th>
                            <th>Group</th>
                            <th>Kode Izin</th>
                            <th>Jenis Izin</th>
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

              <Modal dialogClassName="modal-100w" aria-labelledby="modal-add-leave" show={this.state.isShowAddLeaveModal} onHide={() => this.showAddLeaveModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-add-leave">Tambah Cuti</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Unit</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Select
                        options={this.state.units}
                        value={this.state.selectedUnitToCreate}
                        onChange={(value) => {
                          let errors = this.state.validationCreateForm;
                          if (errors?.Unit) {
                            errors['Unit'] = ""
                          }
                          this.setState({ selectedUnitToCreate: value, validationCreateForm: errors });
                        }}>
                      </Select>
                      <span className="text-danger" >{this.state.validationCreateForm.Unit}</span>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>NIK</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <AsyncTypeahead
                        id="loader-employee-create-form"
                        ref={(typeahead) => { this.typeaheadEmployeeCreateForm = typeahead }}
                        isLoading={this.state.isAutoCompleteLoading}
                        onChange={(selected) => {
                          let errors = this.state.validationCreateForm;
                          if (errors?.Employee) {
                            errors['Employee'] = ""
                          }
                          this.setState({ selectedEmployeeToCreate: selected[0], validationCreateForm: errors });
                        }}
                        labelKey="NameAndEmployeeIdentity"
                        minLength={1}
                        onSearch={this.handleEmployeeSearchModal}
                        options={this.state.employees}
                        placeholder="Cari karyawan..."
                      />
                      <span className="text-danger" >{this.state.validationCreateForm?.Employee}</span>
                    </Col>

                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Nama</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Label>{this.state.selectedEmployeeToCreate?.Name}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Seksi</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Label>{this.state.selectedEmployeeToCreate?.Section}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Group</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Label>{this.state.selectedEmployeeToCreate?.Group}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Tanggal Cuti</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Row>
                        <Col sm={5}>
                          <Input
                            type="date"
                            value={this.state.startDateToCreate}
                            onChange={((event) => {
                              let errors = this.state.validationCreateForm;
                              if (errors?.StartDate) {
                                errors['StartDate'] = ""
                              }

                              this.setState({ startDateToCreate: event.target.value, validationCreateForm: errors });
                            })} />
                            <span className="text-danger" >{this.state.validationCreateForm?.StartDate}</span>
                          <span className="text-danger" >{this.state.validationCreateForm?.DayOff}</span>
                          <span className="text-danger" >{this.state.validationCreateForm?.NoAvailableSchedule}</span>
                        </Col>
                        {/* <Col className={'col-md-2 text-center'}>-</Col> */}
                        <Col sm={2}>-</Col>
                        <Col sm={5}>
                          <Input
                            type="date"
                            value={this.state.endDateToCreate}
                            onChange={((event) => {
                              let errors = this.state.validationCreateForm;
                              if (errors?.EndDate) {
                                errors['EndDate'] = ""
                              }

                              if (errors?.InvalidDateRange) {
                                errors['InvalidDateRange'] = ""
                              }

                              this.setState({ endDateToCreate: event.target.value, validationCreateForm: errors });
                            })}
                            IsInvalid={roundToNearestMinutes}
                          />
                          <span className="text-danger" >{this.state.validationCreateForm?.EndDate}</span><br />
                          <span className="text-danger" >{this.state.validationCreateForm?.InvalidDateRange}</span>

                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Jenis Cuti</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Select
                        options={this.state.leaveTypes}
                        value={this.state.selectedLeaveTypeToCreate}
                        onChange={(value) => {
                          let errors = this.state.validationCreateForm;
                          if (errors?.LeaveType) {
                            errors['LeaveType'] = ""
                          }
                          this.setState({ selectedLeaveTypeToCreate: value, validationCreateForm: errors });
                        }}>
                      </Select>
                      <span style={{ color: "red" }}>{this.state.validationCreateForm?.LeaveType}</span>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      Setengah Hari?
                    </Col>
                    <Col sm={8}>
                      <Form.Check
                        checked={this.state.isHalfDay}
                        onChange={(value) => {
                          this.setState({ isHalfDay: value.target.checked })
                        }}
                        size='sm'
                      />
                    </Col>
                  </Row>
                </Modal.Body>
                <Modal.Footer>
                  {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                    <div>
                      <Button className="btn btn-success" name="create-leave" onClick={this.handleCreateLeave}>Submit</Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>

              <Modal dialogClassName="modal-90w" aria-labelledby="modal-view-leave" show={this.state.isShowViewLeaveModal} onHide={() => this.showViewLeaveModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-view-leave">Lihat Detail Cuti</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Unit</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>{this.state.leave.UnitName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>NIK</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>{this.state.leave.EmployeeIdentity}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Nama</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>{this.state.leave.EmployeeName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Seksi</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>{this.state.leave.SectionName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Group</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>{this.state.leave.GroupName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Tanggal Cuti</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Row>
                        <Col className={'col-md-5'}>
                          <Form.Label>{moment(this.state.leave.StartDate).format('DD/MM/YYYY')}</Form.Label>
                        </Col>
                        <Col className={'col-md-2 text-center'}>-</Col>
                        <Col className={'col-md-5'}>
                          <Form.Label>{moment(this.state.leave.EndDate).format('DD/MM/YYYY')}</Form.Label>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Jenis Cuti</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>{this.state.leave.LeaveTypeName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      Setengah Hari?
                    </Col>
                    <Col sm={8}>
                      <Form.Check
                        checked={this.state.leave.IsHalfDay}
                        size='sm'
                        disabled
                      />
                    </Col>
                  </Row>
                </Modal.Body>
              </Modal>

              <Modal aria-labelledby="modal-delete-leave" show={this.state.isShowDeleteLeaveModal} onHide={() => this.showDeleteLeaveModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-delete-leave">Hapus Data Cuti</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                <Modal.Footer>
                  {this.state.isDeleteLeaveLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                    <div>
                      <Button className="btn btn-danger" name="delete-leave" onClick={this.deleteLeaveClickHandler}>Hapus</Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>

              <Modal dialogClassName="modal-100w" size={'lg'} aria-labelledby="modal-edit-leave" show={this.state.isShowEditLeaveModal} onHide={() => this.showEditLeaveModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-edit-leave">Edit Cuti</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Unit</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Label>{this.state.leave.UnitName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>NIK</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Label>{this.state.leave.EmployeeIdentity}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Nama</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Label>{this.state.leave.EmployeeName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Seksi</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Label>{this.state.leave.SectionName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Group</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Label>{this.state.leave.GroupName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Tanggal Cuti</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Row >
                        <Col sm={5}>
                          <Input
                            type="date"
                            value={this.state.startDateToEdit}
                            onChange={((event) => {

                              let errors = this.state.validationCreateForm;
                              if (errors?.StartDate) {
                                errors['StartDate'] = ""
                              }

                              this.setState({ startDateToEdit: event.target.value, validationCreateForm: errors });
                            })} />
                          <span style={{ color: "red" }}>{this.state.validationEditForm?.StartDate}</span>
                        </Col>
                        <Col sm={2} className={'text-center'}>-</Col>
                        <Col sm={5}>
                          <Input
                            type="date"
                            value={this.state.endDateToEdit}
                            onChange={((event) => {
                              let errors = this.state.validationEditForm;
                              if (errors?.EndDate) {
                                errors['EndDate'] = ""
                              }
                              if (errors?.InvalidDateRange) {
                                errors['InvalidDateRange'] = ""
                              }

                              this.setState({ endDateToEdit: event.target.value, validationEditForm: errors });
                            })} />
                          <span style={{ color: "red" }}>{this.state.validationEditForm?.EndDate}</span>
                          <span style={{ color: "red" }}>{this.state.validationEditForm?.InvalidDateRange}</span>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Jenis Cuti</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Select
                        options={this.state.leaveTypes}
                        value={this.state.selectedLeaveTypeToEdit}
                        onChange={(value) => {
                          this.setState({ selectedLeaveTypeToEdit: value });
                        }}>
                      </Select>
                      <span style={{ color: "red" }}>{this.state.validationEditForm.LeaveTypeId}</span>

                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      Setengah Hari?
                    </Col>
                    <Col sm={10}>
                      <Form.Check

                        checked={this.state.leave.IsHalfDay}
                        onChange={(value) => {
                          var { leave } = this.state;
                          leave.IsHalfDay = value.target.checked;
                          this.setState({ leave: leave });
                        }}
                        size='sm'
                      />
                    </Col>
                  </Row>
                </Modal.Body>
                <Modal.Footer>
                  {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                    <div>
                      <Button className="btn btn-success" name="edit-leave" onClick={this.handleEditLeave}>Submit</Button>
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

export default Leave;
