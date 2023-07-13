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

import './style.css';

var fileDownload = require('js-file-download');
const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";

const DOWNLOAD_REPORTOVERTIME_REPORT =  "report-overtime/report/download"
class ReportOvertime extends Component {

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
      .getOvertimeReport(params)
      .then((result) => {
        // console.log(result);
        this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
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
          if ((this.state.userAccessRole == PERSONALIA_BAGIAN || this.state.userAccessRole == PIMPINAN || this.state.userAccessRole == UPAH)  &&
          (this.state.otherUnitId.includes(s.Id))) {
            units.push(s);
          } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
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

  setSections = () => {
    this.setState({ loading: true })
    this.service
      .getAllSections()
      .then((result) => {
        this.setState({ sections: result, loading: false })
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
    if (!this.state.selectedUnit) {
      this.setState({ validationSearch: { Unit: "Unit Harus Diisi" } })
    } else if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Diisi" } })
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { endDate: "Tanggal Akhir Harus Diisi" } })
    } else {
      this.setData();
    }
  }
  downloadExcel = () => {
    this.setState({ validationSearch: {} });

    if (!this.state.selectedUnit) {
      this.setState({ validationSearch: { Unit: "Unit Harus Diisi" } })
    } else if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus DIisi" } })
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { endDate: "Tanggal Akhir Harus DIisi" } })
    } else {
      this.downloadData();
    }
  }

  downloadRekapLembur = () => {
    this.setState({ validationSearch: {} });

    if (!this.state.selectedUnit) {
      this.setState({ validationSearch: { Unit: "Unit Harus Diisi" } })
    } else if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus DIisi" } })
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { endDate: "Tanggal Akhir Harus DIisi" } })
    } else {
      this.downloadDataRekap();
    }
  }

  downloadPdfLemburGroup = () => {
    this.setState({ validationSearch: {} });

    if (!this.state.selectedUnit) {
      this.setState({ validationSearch: { Unit: "Unit Harus Diisi" } })
    } else if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus DIisi" } })
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { endDate: "Tanggal Akhir Harus DIisi" } })
    } else {
      this.downloadDataPdfGroup();
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
      if ((this.state.userAccessRole == PERSONALIA_BAGIAN) || (this.state.userAccessRole == PIMPINAN) || (this.state.userAccessRole == UPAH) ) {
        query += "&unitId=" + this.state.userUnitId;
      }
    }
    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id
    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id

    // console.log(query)

    const value = localStorage.getItem('token');
    const Header = {
      accept: 'application/json',
      Authorization: `Bearer ` + value,
      'x-timezone-offset': moment().utcOffset() / 60
    };

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + DOWNLOAD_REPORTOVERTIME_REPORT + query,
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

  downloadDataRekap = () => {
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
        if ((this.state.userAccessRole == PERSONALIA_BAGIAN) || (this.state.userAccessRole == PIMPINAN) || (this.state.userAccessRole == UPAH)) {
          query += "&unitId=" + this.state.userUnitId;
        }
      }
    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id
    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id

    // console.log(query)

    const value = localStorage.getItem('token');
    const Header = {
      accept: 'application/json',
      Authorization: `Bearer ` + value,
      'x-timezone-offset': moment().utcOffset() / 60
    };

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + DOWNLOAD_REPORTOVERTIME_REPORT + "-rekap" + query,
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

  downloadDataPdfGroup = () => {
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
        if ((this.state.userAccessRole == PERSONALIA_BAGIAN) || (this.state.userAccessRole == PIMPINAN) || (this.state.userAccessRole == UPAH)) {
          query += "&unitId=" + this.state.userUnitId;
        }
      }
    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id
    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id

    // console.log(query)

    const value = localStorage.getItem('token');
    const Header = {
      accept: 'application/json',
      Authorization: `Bearer ` + value,
      'x-timezone-offset': moment().utcOffset() / 60
    };
    console.log("url", CONST.URI_ATTENDANCE + DOWNLOAD_REPORTOVERTIME_REPORT + "-pdf-group" + query)
    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + DOWNLOAD_REPORTOVERTIME_REPORT + "-pdf-group" + query,
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

  formatNumber = (number) => {
    let newn = Number(number * 10) / 10;
    return newn;
  }

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item, index) => {

      var tableTanggal = item.Details.map((t, i) => {

        if (moment.duration(t.TotalHours).asMinutes() > 0) {
          if (t.OvertimeType === "Lembur Hari Libur Resmi") {
            return (
              <td rowSpan='2' className='align-middle text-center'>
                <span>
                  <span>{moment(t.StartHour1, "HH:mm:ss").format("HH:mm")} - </span>
                  <br />
                  <span>{moment(t.EndHour1, "HH:mm:ss").format("HH:mm")}</span>
                </span>

                <br />
                <br />
                <span><strong>({Number(this.formatNumber(moment.duration(t.TotalHours).asMinutes() / 60)).toFixed(1)})</strong></span><br />
              </td>
            )
          }
          else {
            return (
              <td rowSpan='2' className='align-middle text-center'>
                <span>
                  <span>{moment(t.StartHour1, "HH:mm:ss").format("HH:mm")} - </span>
                  <br />
                  <span>{moment(t.EndHour1, "HH:mm:ss").format("HH:mm")}</span>
                  <br />
                  <br />
                  <span>{moment(t.StartHour2, "HH:mm:ss").format("HH:mm")} - </span>
                  <br />
                  <span>{moment(t.EndHour2, "HH:mm:ss").format("HH:mm")}</span>
                  <br />
                </span>

                <br />
                <span><strong>({Number(this.formatNumber(moment.duration(t.TotalHours).asMinutes() / 60)).toFixed(1)})</strong></span><br />
              </td>
            )
          }
        } else {
          return (<td className="align-middle text-center"></td>);
        }

      });

      // var fielTotalLiburStaff = tableData.map((item, index) => {
      //   return item.TotalLiburStaff.map((t, i) => {
      //     return (
      //       <td className="align-middle text-center"><strong>{moment.duration(t.TotalHours).asMinutes() / 60}</strong>
      //       </td>
      //     )
      //   });
      // });

      var fielTotalLiburBiasa = tableData.map((item, index) => {
        return item.TotalLiburHarian.map((t, i) => {
          return (
            <td className="align-middle text-center">
              <strong>
                {Number(this.formatNumber(moment.duration(t.TotalHours).asMinutes() / 60)).toFixed(1)}
              </strong>
            </td>
          )
        });
      });

      return (
        <tbody key={item.Id} data-category={item.Id}>
          <tr>
            <td rowSpan='2'>{index + 1}</td>
            <td rowSpan='2'>{item.EmployeeIdentity}<br />{item.EmployeeName}</td>
            {tableTanggal}
            {/* <td rowSpan='2'>{moment(item.TotalHariBiasaPerOneHours,"HH:mm:ss").duration().asMinutes() /60}<br/>{moment(item.TotalHariBiasaMoreOneHours,"HH:mm:ss").duration().asMinutes() /60}</td> */}
            <td rowSpan='2' className="align-middle text-center">
              <strong>{Number(this.formatNumber(moment.duration(item.TotalHariBiasaPerOneHours).asMinutes() / 60)).toFixed(1)}<br />
              {Number(this.formatNumber(moment.duration(item.TotalHariBiasaMoreOneHours).asMinutes() / 60)).toFixed(1)}
              </strong></td>
            {/*{fielTotalLiburStaff}*/}
            {fielTotalLiburBiasa}
          </tr>
        </tbody>
      );
    });
    var countHeaderTanggal = 0;

    const headerTanggal = tableData.map((item, index) => {
      if (index == 0) {
        return item.Details.map((t, i) => {
          countHeaderTanggal++;
          return (
            <th className='align-middle text-center'>{moment(t.Date).format("DD")}</th>
          )
        });
      }
    });

    // var countHeaderStaf = 0
    // const headerTotLiburStaff = tableData.map((item, index) => {
    //   return item.TotalLiburStaff.map((t, i) => {
    //     countHeaderStaf++;
    //     return (<th className='align-middle text-center nowarping'>{t.Name}</th>)
    //   });
    // });

    var countHeaderBiasa = 0
    const headerTotLiburBiasa = tableData.map((item, index) => {
      return item.TotalLiburHarian.map((t, i) => {
        countHeaderBiasa++;
        return (<th className='align-middle text-center nowarping'>{t.Name}</th>)
      });
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
                      placeholder={'pilih unit'}
                      isClearable={true}
                      options={this.state.units}
                      value={this.state.selectedUnit}
                      onChange={(value) => {
                        if (value != null)
                          this.setSectionsByUnit(value.Id);
                        this.setState({ selectedUnit: value });
                      }} />
                      <span className="text-danger">{this.state.validationSearch?.Unit}</span>
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
                        if (value != null)
                          this.setGroupsBySection(value.Id);
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
                        <Form.Control
                          type="date"
                          value={this.state.startDate}
                          onChange={((event) => {
                            this.setState({ startDate: event.target.value });
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
                            this.setState({ endDate: event.target.value });
                          })}
                          isInvalid={this.state.validationSearch.EndDate} />
                        <Form.Control.Feedback
                          type="invalid">{this.state.validationSearch.EndDate}</Form.Control.Feedback>
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
                    <Button className="btn btn-secondary mr-5" name="reset"
                      onClick={this.resetPagingConfiguration}>Reset</Button>
                    <Button className="btn btn-success mr-5" name="search" onClick={this.search}>Cari</Button>
                  </Col>

                </Row>

                <Row>
                  <Col className="pull-right">
                    <Button className="btn btn-primary mr-5 pull-right" name="export" onClick={this.downloadExcel}>Download
                    Excel</Button>
                    <Button className="btn btn-primary mr-5 pull-right" name="export" onClick={this.downloadRekapLembur}>Rekap
                    Lembur</Button>
                    <Button className="btn btn-primary mr-5 pull-right" name="pdf" onClick={this.downloadPdfLemburGroup}>Pdf Lembur
                    per Group </Button>
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                {this.state.loadingData ? (
                  <span><Spinner size="sm" color="primary" /> Loading Data...</span>

                ) : this.state.tableData.length <= 0 ? (<Row>
                  <Table responsive bordered striped>
                    <thead>
                      <tr className={'text-center'}>
                        <th rowSpan='2' className={'align-middle'}>No.</th>
                        <th rowSpan='2' className={'align-middle'}>Identitas Karyawan</th>
                        <th colSpan='7' className={'align-middle'}>Tanggal</th>
                        <th rowSpan='2' className={'align-middle'}>Total Lembur Hari Biasa</th>
                        {/*<th colSpan='3' className={'align-middle'}>Total Lembur Libur (Staff)</th>*/}
                        <th colSpan='3' className={'align-middle'}>Total Lembur Libur (Harian)</th>
                      </tr>
                      <tr>
                        <td><strong>01</strong></td>
                        <td><strong>02</strong></td>
                        <td><strong>03</strong></td>
                        <td><strong>04</strong></td>
                        <td><strong>05</strong></td>
                        <td><strong>06</strong></td>
                        <td><strong>07</strong></td>
                        {/*<td><strong>1-8</strong></td>*/}
                        {/*<td><strong>9</strong></td>*/}
                        {/*<td><strong>10</strong></td>*/}
                        <td><strong>1-8</strong></td>
                        <td><strong>9</strong></td>
                        <td><strong>10</strong></td>
                      </tr>
                    </thead>
                    <tbody>
                      <td colspan='19'>Data Kosong</td>
                    </tbody>
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
                </Row>) : (
                      <Row>


                        <Table responsive bordered striped>
                          <thead>
                            <tr className={'text-center'}>
                              <th rowSpan='2' className={'align-middle'}>No.</th>
                              <th rowSpan='2' className={'align-middle'}>Identitas Karyawan</th>
                              <th colSpan={countHeaderTanggal} className={'align-middle'}>Tanggal</th>
                              <th rowSpan='2' className={'align-middle'}>Total Lembur Hari Biasa</th>
                              {/*<th colSpan={countHeaderStaf} className={'align-middle'}>Total Lembur Libur (Staff)</th>*/}
                              <th colSpan={countHeaderBiasa} className={'align-middle'}>Total Lembur Libur (Harian)</th>
                            </tr>
                            <tr className="flex-nowrap">
                              {headerTanggal}
                              {/*{headerTotLiburStaff}*/}
                              {headerTotLiburBiasa}
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

export default ReportOvertime;
