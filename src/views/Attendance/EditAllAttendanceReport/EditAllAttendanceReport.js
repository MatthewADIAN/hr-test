import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';
import * as CONST from '../../../Constant';
import axios from 'axios';
import Service from './../Service';
import swal from 'sweetalert';
import TimeField from 'react-simple-timefield';


import './style.css';

var fileDownload = require('js-file-download');
const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";
class EditAllAttendanceReport extends Component {

  typeaheadEmployee = {};

  state = {
    loading: false,

    postedData: {},
    returnDate: "",
    selectedUnit: null,
    selectedSection: null,
    selectedGroup: null,
    selectedDate: new Date(),
    size: 10,
    units: [],
    groups: [],
    sections: [],
    shiftSchedule: [],
    // minimum date value js
    date: "",

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],
    submitLoading: false,
    validationSearch: {},
    selectedScheduleNameToEdit: {},
    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),

  }


  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
      selectedUnit: null,
      selectedSection: null,
      selectedGroup: null,
      size: 10,
      date: "",
      returnDate: "",
      tableData: [],
      selectedDate: new Date(),
      postedData: {}
    })
  }

  constructor(props) {
    super(props);
    // console.log(props);
    this.service = new Service();
  }


  componentDidMount() {
    this.setUnits();
    this.setGroups();
    this.setSections();
    this.setShiftSchedules();

    // this.setData();
  }

  setData = () => {
    const params = {
      groupId: this.state.selectedGroup ? this.state.selectedGroup.Id : 0,
      sectionId: this.state.selectedSection ? this.state.selectedSection.Id : 0,
      unitId: this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.selectedUnit ? this.state.selectedUnit.Id : 0 : 0,
      size: this.state.size,
      page: this.state.activePage,
      date: moment(this.state.date).format('YYYY-MM-DD'),
    };

    this.setState({ loadingData: true })
    this.service
      .getEditAllAbsensiReport(params)
      .then((result) => {
        // console.log(result);

        var data = result.data;
        for (var item of data) {
          item.CheckInHour = moment.utc(item.CheckIn).local().format('HH:mm');
          item.CheckOutHour = moment();
          if (moment(item.CheckOut).year() === 1) {
            item.CheckOutHour = item.CheckOutHour.set({ h: 0, m: 0, s: 0 }).format('HH:mm');
          } else {
            item.CheckOutHour = moment.utc(item.CheckOut).local().format('HH:mm');
          }
          item.Changed = false;
        }

        this.setState({ activePage: result.page, total: result.total, tableData: data, returnDate: result.date, loadingData: false })
      }).catch((err) => {
        // console.log(err);
        this.setState({ activePage: 1, total: 0, tableData: [], returnDate: "", loadingData: false })
      });
  }

  setUnits = () => {
    this.setState({ loading: true })
    this.service
      .getAllUnits()
      .then((result) => {
        var units = [];
        result.map(s => {
          if (
            (this.state.userAccessRole == PERSONALIA_BAGIAN ||
              this.state.userAccessRole == PIMPINAN ||
              this.state.userAccessRole == UPAH) &&
            (this.state.otherUnitId.includes(s.Id))
          ) {
            units.push(s);
          }
           else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
            units.push(s);
          }
        });
        this.setState({ units: units, loading: false })
      });
  }
  setShiftSchedules = () => {
    this.setState({ loading: true })
    this.service
      .getAllShiftSchedule()
      .then((result) => {
        this.setState({ shiftSchedule: result, loading: false })
      })
  }

  setGroups = () => {
    this.setState({ loading: true })
    this.service
      .getAllGroups()
      .then((result) => {
        this.setState({ groups: result, loading: false })
      });
  }

  setGroupsBySection = (sectionId) => {
    // this.setState({ loading: true })
    this.service
      .getAllGroupsBySectionId(sectionId)
      .then((result) => {
        this.setState({ groups: result, selectedGroup: null, loading: false })
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

  setSectionsByUnit = (unitId) => {
    // this.setState({ loading: true })
    this.service
      .getAllSectionsByUnitId(unitId)
      .then((result) => {
        this.setState({ sections: result, selectedSection: null, selectedGroup: null, loading: false })
      });
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  }

  search = () => {
    this.setState({ validationSearch: {} });
    if (this.state.date == null || this.state.date == "") {
      this.setState({ validationSearch: { date: "Tanggal Harus DIisi" } })
    }
    else {
      this.setData();
    }
  }

  handleSubmit = () => {

    var payload = {};

    var payloadData = this.state.tableData.filter(s => s.Changed).map(s => {
      return {
        Id: s.Id,
        CheckIn: s.CheckInHour,
        CheckOut: s.CheckOutHour,
        Date: moment(this.state.returnDate).format("DD MMMM YYYY"),
        CheckedInShiftId: s.ShiftScheduleId,
        ScheduleId: s.ScheduleId,
        ShiftScheduleSundayId: s.ShiftScheduleSundayId,
        ShiftScheduleMondayId: s.ShiftScheduleMondayId,
        ShiftScheduleTuesdayId: s.ShiftScheduleTuesdayId,
        ShiftScheduleWednesdayId: s.ShiftScheduleWednesdayId,
        ShiftScheduleThursdayId: s.ShiftScheduleThursdayId,
        ShiftScheduleFridayId: s.ShiftScheduleFridayId,
        ShiftScheduleSaturdayId: s.ShiftScheduleSaturdayId,
        IsShiftScheduleChange: s.IsShiftScheduleChange,
        EmployScheduleId: s.EmployScheduleId,
      };
    });
    payload.Data = payloadData;
    this.setState({ submitLoading: true });

    this.service.postEditAllAttendanceReport(payload)
      .then(() => {
        // console.log(result);
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil disimpan!'
        })
          .then((value) => {
            this.setState({ submitLoading: false }, () => {
              this.resetPagingConfiguration();
              this.props.history.push('/attendance/attendance-report');
            })
          });


      })
      .catch((error) => {
        if (error) {

          this.setState({ submitLoading: false });
          console.log(error);
          swal({
            icon: 'error',
            title: 'Oops...',
            text: error.message
          });
        }

      });
  }

  render() {
    const { tableData } = this.state;
    const items = tableData.map((item, index) => {

      let selectedShiftSchedule = {
        value: item.ShiftScheduleId,
        label: item.ShiftScheduleName
      }

      return (
        <tbody key={index} data-category={index}>
          <tr>
            <td>{item.EmployeeIdentity}</td>
            <td>{item.EmployeeName}</td>
            {/* <td>{moment.utc(item.CheckIn).local().format('HH:mm')}</td> */}
            <td>
              <TimeField
                name="checkIn"
                id="checkIn"
                value={item.CheckInHour}
                onChange={((event) => {
                  const { tableData } = this.state;
                  var selectedData = tableData.find(s => s.Id === item.Id);

                  // console.log(Math.floor(durationin.asHours()) + moment.utc(diffin).format(':mm'));
                  // console.log(moment.duration(schein.diff(checkin)).format('HH:mm'));
                  if (selectedData.CheckInHour !== event.target.value) {
                    selectedData.Changed = true;
                    selectedData.CheckInHour = event.target.value;
                    var checkin = moment(event.target.value, 'HH:mm');
                    var schein = moment(item.ScheduleIn, 'HH:mm:ss');

                    if (schein > checkin) {
                      var diffin = schein.diff(checkin);
                      var durationin = moment.duration(diffin);
                      selectedData.OverTimeInString = Math.floor(durationin.asHours()) + moment.utc(diffin).format(':mm');
                      selectedData.LateTimeString = null;
                    } else if (schein < checkin) {
                      var diffin = checkin.diff(schein);
                      var durationin = moment.duration(diffin);
                      selectedData.OverTimeInString = null;
                      selectedData.LateTimeString = Math.floor(durationin.asHours()) + moment.utc(diffin).format(':mm');
                    } else {
                      selectedData.OverTimeInString = null;
                      selectedData.LateTimeString = null;
                    }

                  }
                  this.setState({ tableData: tableData });
                })}
                style={{
                  border: '1px solid #666',
                  fontSize: 14,
                  width: "100%",
                  padding: '5px 8px',
                  color: '#333',
                  borderRadius: 1
                }}
              />


            </td>
            {/* <td>{moment(item.CheckOut).year() === 1
              ? ("")
              : (moment.utc(item.CheckOut).local().format('HH:mm'))}</td> */}
            <td>

              <TimeField

                name="checkOut"
                id="checkOut"
                value={item.CheckOutHour}
                onChange={((event) => {
                  const { tableData } = this.state;
                  var selectedData = tableData.find(s => s.Id === item.Id);
                  if (selectedData.CheckOutHour !== event.target.value) {
                    selectedData.Changed = true;
                    selectedData.CheckOutHour = event.target.value;

                    var checkout = moment(event.target.value, 'HH:mm');
                    var scheout = moment(item.ScheduleOut, 'HH:mm:ss');

                    if (scheout > checkout) {
                      var diffout = scheout.diff(checkout);
                      var durationout = moment.duration(diffout);
                      selectedData.EarlyReturnString = Math.floor(durationout.asHours()) + moment.utc(diffout).format(':mm');
                      selectedData.OverTimeOutString = null;
                    } else if (scheout < checkout) {
                      var diffout = checkout.diff(scheout);
                      var durationout = moment.duration(diffout);
                      selectedData.EarlyReturnString = null;
                      selectedData.OverTimeOutString = Math.floor(durationout.asHours()) + moment.utc(diffout).format(':mm');
                    } else {
                      selectedData.OverTimeOutString = null;
                      selectedData.EarlyReturnString = null;
                    }

                  }
                  this.setState({ tableData: tableData });
                  //  this.handleDateCreateFormChange(event.target.value);
                })}
                style={{
                  border: '1px solid #666',
                  fontSize: 14,
                  width: "100%",
                  padding: '5px 8px',
                  color: '#333',
                  borderRadius: 1
                }}
              />


            </td>
            <td>

              <Select
                className={this.state.validationSearch.ScheduleName ? 'invalid-select' : ''}
                options={this.state.shiftSchedule}
                value={selectedShiftSchedule}
                onChange={(event) => {
                  const { tableData } = this.state;

                  var selectedData = tableData.find(s => s.Id === item.Id);
                  //  selectedScheduleNameToEdit.value=event.Id;
                  //selectedScheduleNameToEdit.label=event.ScheduleName;

                  if (selectedData.ShiftScheduleId !== event.value) {
                    selectedData.Changed = true;
                    selectedData.IsShiftScheduleChange = true;
                    selectedData.ShiftScheduleId = event.value;
                    selectedData.ShiftScheduleName = event.label;
                    selectedData.ScheduleIn = event.ScheduleIn;
                    selectedData.ScheduleOut = event.ScheduleOut;
                    selectedData.ShiftScheduleSundayId = selectedData.ShiftScheduleSundayId !== null ? event.value : selectedData.ShiftScheduleSundayId;
                    selectedData.ShiftScheduleMondayId = selectedData.ShiftScheduleMondayId !== null ? event.value : selectedData.ShiftScheduleMondayId;
                    selectedData.ShiftScheduleTuesdayId = selectedData.ShiftScheduleTuesdayId !== null ? event.value : selectedData.ShiftScheduleTuesdayId;
                    selectedData.ShiftScheduleWednesdayId = selectedData.ShiftScheduleWednesdayId !== null ? event.value : selectedData.ShiftScheduleWednesdayId;
                    selectedData.ShiftScheduleThursdayId = selectedData.ShiftScheduleThursdayId !== null ? event.value : selectedData.ShiftScheduleThursdayId;
                    selectedData.ShiftScheduleFridayId = selectedData.ShiftScheduleFridayId !== null ? event.value : selectedData.ShiftScheduleFridayId;
                    selectedData.ShiftScheduleSaturdayId = selectedData.ShiftScheduleSaturdayId !== null ? event.value : selectedData.ShiftScheduleSaturdayId;

                    var checkin = moment(selectedData.CheckInHour, 'HH:mm');
                    var schein = moment(selectedData.ScheduleIn, 'HH:mm:ss');

                    if (schein > checkin) {
                      var diffin = schein.diff(checkin);
                      var durationin = moment.duration(diffin);
                      selectedData.OverTimeInString = Math.floor(durationin.asHours()) + moment.utc(diffin).format(':mm');
                      selectedData.LateTimeString = null;
                    } else if (schein < checkin) {
                      var diffin = checkin.diff(schein);
                      var durationin = moment.duration(diffin);
                      selectedData.OverTimeInString = null;
                      selectedData.LateTimeString = Math.floor(durationin.asHours()) + moment.utc(diffin).format(':mm');
                    } else {
                      selectedData.OverTimeInString = null;
                      selectedData.LateTimeString = null;
                    }

                    var checkout = moment(selectedData.CheckOutHour, 'HH:mm');
                    var scheout = moment(selectedData.ScheduleOut, 'HH:mm:ss');

                    if (scheout > checkout) {
                      var diffout = scheout.diff(checkout);
                      var durationout = moment.duration(diffout);
                      selectedData.EarlyReturnString = Math.floor(durationout.asHours()) + moment.utc(diffout).format(':mm');
                      selectedData.OverTimeOutString = null;
                    } else if (scheout < checkout) {
                      var diffout = checkout.diff(scheout);
                      var durationout = moment.duration(diffout);
                      selectedData.EarlyReturnString = null;
                      selectedData.OverTimeOutString = Math.floor(durationout.asHours()) + moment.utc(diffout).format(':mm');
                    } else {
                      selectedData.OverTimeOutString = null;
                      selectedData.EarlyReturnString = null;
                    }
                  }

                  this.setState({ tableData: tableData });
                }}>
              </Select>
            </td>
            <td>{item.ScheduleIn ? moment(item.ScheduleIn, 'HH:mm:ss').format('HH:mm') : null}</td>
            <td>{item.ScheduleOut ? moment(item.ScheduleOut, 'HH:mm:ss').format('HH:mm') : null}</td>
            <td>{item.OverTimeInString}</td>
            <td>{item.OverTimeOutString}</td>
            <td>{item.LateTimeString}</td>
            <td>{item.EarlyReturnString}</td>
            {/* <td>{item.Overtime ? moment(item.Overtime, 'HH:mm:ss').format('HH:mm') : null}</td>
            <td>{item.Latetime ? moment(item.Latetime, 'HH:mm:ss').format('HH:mm') : null}</td>
            <td>{item.EarlyReturn ? moment(item.EarlyReturn, 'HH:mm:ss').format('HH:mm') : null}</td> */}
          </tr>
        </tbody>
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
                    <FormLabel>Tanggal</FormLabel>
                  </Col>
                  <Col sm={4}>
                    <Form.Control
                      type="date"
                      value={this.state.date}
                      onChange={((event) => {
                        this.setState({ date: event.target.value });
                      })}
                      isInvalid={this.state.validationSearch.date} />
                    <Form.Control.Feedback type="invalid">{this.state.validationSearch.date}</Form.Control.Feedback>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Row>
                  <Col sm={1} className={'text-left'}>
                    <FormLabel>Unit/Bagian</FormLabel>
                  </Col>
                  <Col sm={4}>
                    <Select
                      placeholder={'pilih unit'}
                      isClearable={true}
                      options={this.state.units}
                      value={this.state.selectedUnit}
                      onChange={(value) => {
                        if (value?.Id) {
                          this.setSectionsByUnit(value?.Id);
                        }
                        this.setState({ selectedUnit: value });
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
                      options={this.state.sections}
                      value={this.state.selectedSection}
                      onChange={(value) => {

                        if (value?.Id) {
                          this.setGroupsBySection(value?.Id);
                        }
                        this.setState({ selectedSection: value });
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
                      options={this.state.groups}
                      value={this.state.selectedGroup}
                      onChange={(value) => {
                        this.setState({ selectedGroup: value });
                      }} />
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Row>
                  <Col sm={1}>
                  </Col>
                  <Col sm={4}>
                    <Button className="btn btn-secondary mr-5" name="reset" onClick={this.resetPagingConfiguration}>Reset</Button>
                    <Button className="btn btn-primary mr-5" name="search" onClick={this.search}>Cari</Button>
                  </Col>

                </Row>

              </FormGroup>

              <FormGroup>
                {this.state.loadingData ? (
                  <span><Spinner size="sm" color="primary" /> Loading Data...</span>
                ) : this.state.tableData.length <= 0 ? (<Row>
                  <Table id="test" bordered striped >
                    <thead>
                      <tr>
                        <th>NIK</th>
                        <th>Nama</th>
                        <th>Waktu Check In</th>
                        <th>Waktu Check Out</th>
                        <th>Nama Jadwal</th>
                        <th>Jadwal Masuk</th>
                        <th>Jadwal Pulang</th>
                        <th>Jam Lebih In</th>
                        <th>Jam Lebih Out</th>
                        <th>Terlambat</th>
                        <th>Pulang Dini</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={'text-center'}>
                        <td colSpan='11' className={'align-middle text-center'}>Data Kosong</td>
                      </tr>
                    </tbody>
                  </Table>

                </Row>) : (
                      <Row>
                        <Table bordered striped >
                          <thead>
                            <tr>
                              <th>NIK</th>
                              <th>Nama</th>
                              <th>Waktu Check In</th>
                              <th>Waktu Check Out</th>
                              <th>Nama Jadwal</th>
                              <th>Jadwal Masuk</th>
                              <th>Jadwal Pulang</th>
                              <th>Jam Lebih In</th>
                              <th>Jam Lebih Out</th>
                              <th>Terlambat</th>
                              <th>Pulang Dini</th>
                            </tr>
                          </thead>
                          {items}
                        </Table>
                      </Row>
                    )}
              </FormGroup>
              {this.state.tableData.length > 0 ? this.state.submitLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                <Button className="btn btn-success pull-right" name="edit-all" style={{ 'marginBottom': '20px' }}
                  onClick={this.handleSubmit}>Submit</Button>
              ) : null}
            </Form>
          )
        }

      </div>
    );
  }
}

export default EditAllAttendanceReport;
