import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';
import * as CONST from '../../../Constant';
import axios from 'axios';
import Service from './../Service';
import swal from 'sweetalert';
import id from 'date-fns/locale/id';
import './style.css';

var fileDownload = require('js-file-download');
const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const UPAH = "Upah";
const PIMPINAN = "Pimpinan";
const DOWNLOAD_REPORTLEAVE_REPORT = "report-leave/report/download"
class ReportLeave extends Component {

  typeaheadEmployee = {};

  state = {
    loading: false,

    selectedUnit: null,
    selectedSection: null,
    selectedGroup: null,
    selectedStartPeriode: new Date(),
    selectedEndPeriode: new Date(),
    dateRange: [],
    dateRangeLength: 0,

    units: [],
    groups: [],
    sections: [],

    // minimum date value js
    startDate: "",
    endDate: "",

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],

    validationSearch: {},
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
      selectedStartPeriode: new Date(),
      selectedEndPeriode: new Date(),
      startDate: new Date(),
      endDate: new Date(),
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

    this.setData();
  }

  setData = () => {
    let unitId = this.state.selectedUnit ? this.state.selectedUnit.Id : 0;
    // if(this.state.userAccessRole == PERSONALIA_BAGIAN || this.state.userAccessRole == PIMPINAN || this.state.userAccessRole == UPAH){
    //   unitId=this.state.userUnitId 
    // }else{
    //   unitId = this.state.selectedUnit ? this.state.selectedUnit.Id : 0
    // }
    
    const params = {
      unitId: unitId,
      groupId: this.state.selectedGroup ? this.state.selectedGroup.Id : 0,
      sectionId: this.state.selectedSection ? this.state.selectedSection.Id : 0,
      page: this.state.activePage,
      startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.state.endDate).format('YYYY-MM-DD'),
      adminEmployeeId: Number(localStorage.getItem("employeeId"))
    };

    this.setState({ loadingData: true })
    this.service
      .getLeaveReport(params)
      .then((result) => {
        const res = result?.Result ? result.Result : result;
        this.setState({ activePage: res.page, total: res.total, tableData: res.data, loadingData: false })
      }).catch((err) => {
        // console.log(err);
        this.setState({ activePage: 1, total: 0, tableData: [], loadingData: false })
      });
  }

  setUnits = () => {
    this.setState({ loading: true })
    this.service
      .getAllUnits()
      .then((result) => {
        var units = [];
        result.map(s => {
          if ((this.state.userAccessRole == PERSONALIA_BAGIAN || this.state.userAccessRole == PIMPINAN || this.state.userAccessRole == UPAH) 
          && (this.state.otherUnitId.includes(s.Id))) {
            units.push(s);
          } else if (this.state.userAccessRole == PERSONALIA_PUSAT ) {
            units.push(s);
          }
        });
        this.setState({ units: units, loading: false })
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
    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    }
    else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus DIisi" } })
    }
    else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { endDate: "Tanggal Akhir Harus DIisi" } })
    }
    if (!this.state.selectedUnit) {
      this.setState({ validationSearch: { SelectedUnit: "Unit Harus Dipilih" } })
    }
    else {
      this.setData();
    }
  }

  downloadExcel = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    }
    else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus DIisi" } })
    }
    else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { endDate: "Tanggal Akhir Harus DIisi" } })
    } else {
      this.downloadData();
    }
  }

  downloadData = () => {
    this.setState({ loadingData: true })

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?adminEmployeeId=${adminEmployeeId}&page=1&size=1000`

    if (this.state.startDate)
      query += "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD")

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD")

    if (this.state.selectedUnit) {

      query += "&unitId=" + this.state.selectedUnit.Id
    }
    else {
      if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
        query += "&unitId=" + this.state.userUnitId;
      }
    }
    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id
    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id

    // console.log(query)

    const value = localStorage.getItem('token');
    const Header = { accept: 'application/json', Authorization: `Bearer ` + value, 'x-timezone-offset': moment().utcOffset() / 60 };

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + DOWNLOAD_REPORTLEAVE_REPORT + query,
      responseType: 'blob',
      headers: Header,
    }).then(data => {
      // console.log(data)
      let disposition = data.headers['content-disposition']
      let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])
      
      fileDownload(data.data, filename);
      this.setState({ loading: false, loadingData: false });
    }).catch(err => {
      // console.log(err);
      this.setState({ loading: false, loadingData: false });
    });
  }

  downloadPdf = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    }
    else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus DIisi" } })
    }
    else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { endDate: "Tanggal Akhir Harus DIisi" } })
    } else {
      this.downloadDataPdf();
    }
  }

  downloadDataPdf = () => {
    this.setState({ loadingData: true })

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?adminEmployeeId=${adminEmployeeId}&page=1&size=1000`

    if (this.state.startDate)
      query += "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD")

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD")

    if (this.state.selectedUnit) {

      query += "&unitId=" + this.state.selectedUnit.Id
    }
    else {
      if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
        query += "&unitId=" + this.state.userUnitId;
      }
    }
    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id
    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id

    // console.log(query)

    const value = localStorage.getItem('token');
    const Header = { accept: 'application/json', Authorization: `Bearer ` + value, 'x-timezone-offset': moment().utcOffset() / 60 };

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + "report-leave/report/download-pdf" + query,
      responseType: 'blob',
      headers: Header,
    }).then(data => {
      // console.log(data)
      let disposition = data.headers['content-disposition']
      let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])
      //   data.data.forEach(element => {
      //   var ifdatenullOut = moment(element.CheckOut).year() == 1;
      //   var ifdatenullIn = moment(element.CheckIn).year() == 1;

      //   if(ifdatenullOut)
      //     element.CheckOut = "";

      //   if(ifdatenullIn)
      //     element.CheckIn = "";

      // });
      fileDownload(data.data, filename);
      this.setState({ loading: false, loadingData: false });
    }).catch(err => {
      // console.log(err);
      this.setState({ loading: false, loadingData: false });
    });
  }

  downloadLeavePdf = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    }
    else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus DIisi" } })
    }
    else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { EndDate: "Tanggal Akhir Harus DIisi" } })
    } else {
      if (this.state.selectedUnit == null || this.state.selectedUnit.Id == 0) {
        this.setState({ validationSearch: { SelectedUnit: "Unit Harus Diisi" } });
      } else {

        this.downloadLeaveDataPdf();
      }
    }
  }

  downloadLeaveDataPdf = () => {
    this.setState({ loadingData: true })
    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let startDate = this.state.startDate && this.state.startDate != "Invalid date" ? moment(this.state.startDate).format("YYYY-MM-DD") : null;
    let endDate = this.state.endDate && this.state.endDate != "Invalid date" ? moment(this.state.endDate).format("YYYY-MM-DD") : null;
    let unit = this.state.selectedUnit ? this.state.selectedUnit.Id : 0;
    let query = `?adminEmployeeId=${adminEmployeeId}&startDate=${startDate}&endDate=${endDate}&unitId=${unit}`;

    // console.log(query)

    const value = localStorage.getItem('token');
    const Header = { accept: 'application/json', Authorization: `Bearer ` + value, 'x-timezone-offset': moment().utcOffset() / 60 };

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + "report-leave/leave/download/pdf" + query,
      responseType: 'blob',
      headers: Header,
    }).then(data => {
      // console.log(data)
      let disposition = data.headers['content-disposition']
      let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])
      //   data.data.forEach(element => {
      //   var ifdatenullOut = moment(element.CheckOut).year() == 1;
      //   var ifdatenullIn = moment(element.CheckIn).year() == 1;

      //   if(ifdatenullOut)
      //     element.CheckOut = "";

      //   if(ifdatenullIn)
      //     element.CheckIn = "";

      // });
      fileDownload(data.data, filename);
      this.setState({ loading: false, loadingData: false });
    }).catch(err => {
      // console.log(err);
      this.setState({ loading: false, loadingData: false });
    });
  }

  downloadBlankoPdf = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    }
    else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus DIisi" } })
    }
    else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { EndDate: "Tanggal Akhir Harus DIisi" } })
    } else {
      this.getBlankoPdf();
    }
  }

  getBlankoPdf = () => {
    this.setState({ loadingData: true })
    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let startDate = this.state.startDate && this.state.startDate != "Invalid date" ? moment(this.state.startDate).format("YYYY-MM-DD") : null;
    let endDate = this.state.endDate && this.state.endDate != "Invalid date" ? moment(this.state.endDate).format("YYYY-MM-DD") : null;
    let unit = this.state.selectedUnit ? this.state.selectedUnit.Id : 0;
    let query = `?adminEmployeeId=${adminEmployeeId}&startDate=${startDate}&endDate=${endDate}&unitId=${unit}`;

    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id
    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id

    // console.log(query)

    const value = localStorage.getItem('token');
    const Header = { accept: 'application/json', Authorization: `Bearer ` + value, 'x-timezone-offset': moment().utcOffset() / 60 };

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + "report-leave/leave/download/blanko-pdf" + query,
      responseType: 'blob',
      headers: Header,
    }).then(data => {
      // console.log(data)
      let disposition = data.headers['content-disposition']
      let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])

      fileDownload(data.data, filename);
      this.setState({ loading: false, loadingData: false });
    }).catch(err => {
      // console.log(err);
      this.setState({ loading: false, loadingData: false });
    });
  }

  render() {
    const { tableData } = this.state;
    
    const items = tableData.map((item, index) => {
      // const hour = item.TotalHours.split(':')[0];
      // const minute = item.TotalHours.split(':')[1];
      var tableTanggal = item.Details.map((t, i) => {
        if (t.AttendanceStatus == "Attend") {
          return (
            <td rowSpan='2'>
              <span className={t.IsLate ? 'text-danger' : ''}>{
                moment(t.StartDate).format("HH:mm")}
              </span>
              <br />
              <span className={t.IsEarly ? 'text-danger' : ''}>{moment(t.EndDate).format("HH:mm") == "00:00"?"":moment(t.EndDate).format("HH:mm")}</span></td>
          )
        } else {
          if (t.IsHalfDay) {
            return (
              <td rowSpan='2'>
                <span className={t.IsLate ? 'text-danger' : ''}>{
                  moment(t.StartDate).format("HH:mm")}
                </span>
                <br />
                <span className={t.IsEarly ? 'text-danger' : ''}>{moment(t.EndDate).format("HH:mm")}</span>
                <br />
                <span>1/2C</span>
              </td>
            )
          } else if ((t.IsHalfDay === false) && (t.HasAttendance)) {
            return (
              <td rowSpan='2'>
                <span className={t.IsLate ? 'text-danger' : ''}>{
                  moment(t.StartDate).format("HH:mm")}
                </span>
                <br />
                <span className={t.IsEarly ? 'text-danger' : ''}>{moment(t.EndDate).format("HH:mm")}</span>
                <br />
                <td rowSpan='2'>{t.AttendanceStatus}</td>
              </td>
            )
          } else {
            return (
              <td rowSpan='2'>{t.AttendanceStatus}</td>
            )
          }
        }
      });

      return (
        <tbody key={item.Id} data-category={item.Id}>
          <tr>
            <td rowSpan='2'>{index + 1}</td>
            <td rowSpan='2'>{item.EmployeeIdentity}<br />{item.EmployeeName}</td>
            {tableTanggal}
            <td>{item.DaysWork}</td>
            <td>{item.PayCutHours}</td>
          </tr>
          <tr>
            <td colSpan='2' className='text-right'>{Math.floor(item.PayCutCash)}</td></tr>
        </tbody>
      );
    });

    var countHeaderTanggal = 0;

    const headerTanggal = tableData.map((item, index) => {
      if (index == 0) {
        return item.Details.map((t, i) => {
          countHeaderTanggal++;
          return (
            <th>{moment(t.StartDate).format("DD")}</th>
          )
        });
      }
    });
    // console.log(this.state.startDate);
    // if(this.state.startDate != "" && this.state.endDate!=""){
    //   // console.log(moment(this.state.startDate));
    //   // console.log(moment(this.state.endDate));
    //   countHeaderTanggal =Math.abs(moment(this.state.startDate).diff(moment(this.state.endDate),'days'))+1;
    //   // console.log(countHeaderTanggal);
    // }
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
                  <Col sm={4}>
                    <Select
                      className={this.state.validationSearch?.SelectedUnit ? 'invalid-select' : ''}
                      placeholder={'pilih unit'}
                      isClearable={true}
                      options={this.state.units}
                      value={this.state.selectedUnit}
                      isInvalid={this.state.validationSearch.SelectedUnit ? true : null}
                      onChange={(value) => {
                        if (value?.Id) {
                          this.setSectionsByUnit(value?.Id);
                        }
                        this.setState({ selectedUnit: value });
                      }} />

                    <span style={{ color: "red" }}>{this.state.validationSearch.SelectedUnit}</span>

                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Row>
                  <Col sm={1} className={'text-right'}>
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
                  <Col sm={1} className={'text-right'}>
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
                  <Col sm={1} className={'text-right'}>
                    <FormLabel>Periode</FormLabel>
                  </Col>
                  <Col sm={4}>
                    <Row>
                      <Col sm={5}>
                        {/* <Form.Control
                          type="date"
                          value={this.state.startDate}
                          onChange={((event) => {
                            this.setState({ startDate: event.target.value });
                          })}
                          isInvalid={this.state.validationSearch.StartDate} /> */}
                          <div className="customDatePickerWidth">
                            <DatePicker
                              className={this.state.validationSearch.StartDate ? 'form-control is-invalid' : 'form-control'}
                              name="StartDate"
                              showIcon
                              id="StartDate"
                              selected={this.state.startDate}
                              dateFormat="dd MMMM yyyy"
                              locale={id}
                              onChange={val => {
                                this.setState({ startDate: val });
                              }}
                              isInvalid={this.state.validationSearch.StartDate ? true : null}
                            />
                          </div>
                        <Form.Control.Feedback type="invalid">{this.state.validationSearch.StartDate}</Form.Control.Feedback>
                      </Col>
                      <Col sm={2} className={'text-center'}>s/d</Col>
                      <Col sm={5}>
                        {/* <Form.Control
                          type="date"
                          value={this.state.endDate}
                          onChange={((event) => {
                            this.setState({ endDate: event.target.value });
                          })}
                          isInvalid={this.state.validationSearch.EndDate} /> */}
                          <div className="customDatePickerWidth">
                            <DatePicker
                              className={this.state.validationSearch.EndDate ? 'form-control is-invalid' : 'form-control'}
                              name="EndDate"
                              showIcon
                              id="EndDate"
                              selected={this.state.endDate}
                              dateFormat="dd MMMM yyyy"
                              locale={id}
                              onChange={val => {
                                this.setState({ endDate: val });
                              }}
                              isInvalid={this.state.validationSearch.EndDate ? true : null}
                            />
                          </div>
                        <Form.Control.Feedback type="invalid">{this.state.validationSearch.EndDate}</Form.Control.Feedback>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col sm={1}>
                  </Col>
                  <Col sm={4}>
                    <Button className="btn btn-secondary  btn-sm mr-3" name="reset" onClick={this.resetPagingConfiguration}>Reset</Button>
                    <Button className="btn btn-success  btn-sm mr-3" name="search" onClick={this.search}>Cari</Button>
                    

                  </Col>
                  <Col sm={7}>
                  <Button className="btn btn-primary  btn-sm mr-3  pull-right" name="export" onClick={this.downloadExcel}>Download Excel</Button>
                    <Button className="btn btn-primary  btn-sm mr-3  pull-right" name="exportLeaveReport" onClick={this.downloadPdf}>Download Pdf</Button>
                    <Button className="btn btn-primary  btn-sm mr-3  pull-right" name="exportPdf" onClick={this.downloadLeavePdf}>Cetak Laporan Izin</Button>
                    <Button className="btn btn-primary  btn-sm mr-3  pull-right" name="blankoPdf" onClick={this.downloadBlankoPdf}>Blanko Pdf</Button>
                  </Col>
                </Row>

              </FormGroup>

              <FormGroup>
                {this.state.loadingData ? (
                  <span><Spinner size="sm" color="primary" /> Loading Data...</span>
                ) : this.state.tableData.length <= 0 ? (<Row>
                  <Table id="test" responsive bordered striped >
                    <thead>
                      <tr className={'text-center'}>
                        <th rowSpan='2' className={'align-middle'}>No.</th>
                        <th rowSpan='2' className={'align-middle'}>Identitas Karyawan</th>
                        <th colSpan='7' className={'align-middle'}>Tanggal</th>
                        <th rowSpan='2' className={'align-middle'}>Hari Masuk</th>
                        <th rowSpan='2' className={'align-middle'}>Potongan</th>
                      </tr>
                      <tr className={'text-center'}>
                        <td className={'align-middle'}><strong>01</strong></td>
                        <td className={'align-middle'}><strong>02</strong></td>
                        <td className={'align-middle'}><strong>03</strong></td>
                        <td className={'align-middle'}><strong>04</strong></td>
                        <td className={'align-middle'}><strong>05</strong></td>
                        <td className={'align-middle'}><strong>06</strong></td>
                        <td className={'align-middle'}><strong>07</strong></td>
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
                        <Table responsive bordered striped >
                          <thead>
                            <tr className={'text-center'}>
                              <th rowSpan='2' className={'align-middle'}>No.</th>
                              <th rowSpan='2' className={'align-middle'}>Identitas Karyawan</th>
                              <th colSpan={countHeaderTanggal} className={'align-middle'}>Tanggal</th>
                              <th rowSpan='2' className={'align-middle'}>Hari Masuk</th>
                              <th rowSpan='2' className={'align-middle'}>Potongan</th>
                            </tr>
                            <tr>
                              {headerTanggal}
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
            </Form>
          )}

      </div>
    );
  }
}

export default ReportLeave;
