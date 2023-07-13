import React, { Component } from "react";
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from "reactstrap";
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
  ModalFooter,
} from "react-bootstrap";
import Select from "react-select";
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from "./../../../react-components/RowButtonComponent";
import DragScrollTable from "./../../../react-components/DragScrollTable";
import * as CONST from "../../../Constant";
import axios from "axios";
import Service from "./../Service";
import swal from "sweetalert";

import "./style.css";

var fileDownload = require("js-file-download");
const moment = require("moment");
const minimumDate = new Date(1945, 8, 17);
const DOWNLOAD_REPORTDAILYPAYEMPLOYEE_VERIFICATION ="report-daily-pay-employee/report/download-verication"
const DOWNLOAD_REPORTDAILYPAYEMPLOYEE_REPORT = "report-daily-pay-employee/report/download"
const DOWNLOAD_REPORTDAILYPAYEMPLOYEE_TO_BANKING =  "report-daily-pay-employee/report/download-report-to-banking"

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";

class DailyPayEmployee extends Component {
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

    bpjsFlag: true,
    bpjstkFlag: true,
    spriFlag: true,
    pphFlag: true,
    koperasiFlag: true,
    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    otherUnitId: JSON.parse(localStorage.getItem("otherUnitId"))
  };

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
      bpjsFlag: true,
      bpjstkFlag: true,
      spriFlag: true,
      pphFlag: true,
      koperasiFlag: true,
    });
  };

  constructor(props) {
    super(props);
    this.service = new Service();
    this.sliderContainer = React.createRef();
  }

  componentDidMount() {
    this.setUnits();
    this.setGroups();
    this.setSections();

    this.setData();
  }

  setData = () => {
    const params = {
      unitId: this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
      groupId: this.state.selectedGroup ? this.state.selectedGroup.Id : 0,
      sectionId: this.state.selectedSection ? this.state.selectedSection.Id : 0,
      page: this.state.activePage,
      startDate: moment(this.state.startDate).format("YYYY-MM-DD"),
      endDate: moment(this.state.endDate).format("YYYY-MM-DD"),
      bpjsFlag: this.state.bpjsFlag,
      bpjstkFlag: this.state.bpjstkFlag,
      spriFlag: this.state.spriFlag,
      pphFlag: this.state.pphFlag,
      koperasiFlag: this.state.koperasiFlag,
    };
    console.log(params);
    this.setState({ loadingData: true });
    this.service
      .getDailyPayEmployeeReport(params)
      .then((result) => {
        const res = result?.Result ? result.Result : result;
        this.setState({
          activePage: res.page,
          total: res.total,
          tableData: res.data,
          loadingData: false,
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          activePage: 1,
          total: 0,
          tableData: [],
          loadingData: false,
        });
      });
  };

  setUnits = () => {
    this.setState({ loading: true });
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
  };

  setGroups = () => {
    this.setState({ loading: true });
    this.service.getAllGroups().then((result) => {
      this.setState({ groups: result, loading: false });
    });
  };

  setSections = () => {
    this.setState({ loading: true });
    this.service.getAllSections().then((result) => {
      this.setState({ sections: result, loading: false });
    });
  };

  setGroupsBySection = (sectionId) => {
    // this.setState({ loading: true })
    this.service.getAllGroupsBySectionId(sectionId).then((result) => {
      this.setState({ groups: result, selectedGroup: null, loading: false });
    });
  };

  setSectionsByUnit = (unitId) => {
    // this.setState({ loading: true })
    this.service.getAllSectionsByUnitId(unitId).then((result) => {
      this.setState({
        sections: result,
        selectedSection: null,
        selectedGroup: null,
        loading: false,
      });
    });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  };
  search = () => {
    this.setState({ validationSearch: {} });
    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({
        validationSearch: {
          StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir",
        },
      });
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({
        validationSearch: { StartDate: "Tanggal Awal Harus DIisi" },
      });
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({
        validationSearch: { endDate: "Tanggal Akhir Harus DIisi" },
      });
    } 
    if (!this.state.selectedUnit) {
      this.setState({
        validationSearch: {
          SelectedUnit: "Unit Harus Dipilih",
        },
      });
    }
    else {
      this.setData();
    }
  };

  downloadVerification = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({
        validationSearch: {
          StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir",
        },
      });
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({
        validationSearch: { StartDate: "Tanggal Awal Harus DIisi" },
      });
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({
        validationSearch: { endDate: "Tanggal Akhir Harus DIisi" },
      });
    } else {
      this.dataVerification();
    }
  };

  dataVerification = () => {
    this.setState({ loadingData: true });

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?adminEmployeeId=${adminEmployeeId}&page=1&size=1000&bpjsFlag=${this.state.bpjsFlag}&bpjstkFlag=${this.state.bpjstkFlag}&spriFlag=${this.state.spriFlag}&pphFlag=${this.state.pphFlag}&koperasiFlag=${this.state.koperasiFlag}`;

    if (this.state.startDate)
      query +=
        "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD");

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD");

    if (this.state.selectedUnit)
      query += "&unitId=" + this.state.selectedUnit.Id;
    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id;
    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id;

    console.log(query);

    const value = localStorage.getItem("token");
    const Header = {
      accept: "application/json",
      Authorization: `Bearer ` + value,
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios({
      method: "get",
      url:
        CONST.URI_ATTENDANCE +
        DOWNLOAD_REPORTDAILYPAYEMPLOYEE_VERIFICATION +
        query,
      responseType: "blob",
      headers: Header,
    })
      .then((data) => {
        console.log(data);
        let disposition = data.headers["content-disposition"];
        let filename = decodeURI(disposition.match(/filename="(.*)"/)[1]);

        fileDownload(data.data, filename);
        this.setState({ loading: false, loadingData: false });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false, loadingData: false });
      });
  };

  downloadReportToBanking = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({
        validationSearch: {
          StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir",
        },
      });
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({
        validationSearch: { StartDate: "Tanggal Awal Harus DIisi" },
      });
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({
        validationSearch: { endDate: "Tanggal Akhir Harus DIisi" },
      });
    } else {
      this.dataReportToBanking();
    }
  };

  dataReportToBanking = () => {
    this.setState({ loadingData: true });
    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?adminEmployeeId=${adminEmployeeId}&page=1&size=1000&bpjsFlag=${this.state.bpjsFlag}&bpjstkFlag=${this.state.bpjstkFlag}&spriFlag=${this.state.spriFlag}&pphFlag=${this.state.pphFlag}&koperasiFlag=${this.state.koperasiFlag}`;

    if (this.state.startDate)
      query +=
        "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD");

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD");

    if (this.state.selectedUnit)
      query += "&unitId=" + this.state.selectedUnit.Id;
    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id;
    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id;

    console.log(query);

    const value = localStorage.getItem("token");
    const Header = {
      accept: "application/json",
      Authorization: `Bearer ` + value,
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios({
      method: "get",
      url:
        CONST.URI_ATTENDANCE +
        DOWNLOAD_REPORTDAILYPAYEMPLOYEE_TO_BANKING +
        query,
      responseType: "blob",
      headers: Header,
    })
      .then((data) => {
        console.log(data);
        let disposition = data.headers["content-disposition"];
        let filename = decodeURI(disposition.match(/filename="(.*)"/)[1]);

        fileDownload(data.data, filename);
        this.setState({ loading: false, loadingData: false });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false, loadingData: false });
      });
  };

  downloadExcel = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({
        validationSearch: {
          StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir",
        },
      });
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({
        validationSearch: { StartDate: "Tanggal Awal Harus DIisi" },
      });
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({
        validationSearch: { endDate: "Tanggal Akhir Harus DIisi" },
      });
    } else {
      this.downloadData();
    }
  };

  downloadRekapLembur = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({
        validationSearch: {
          StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir",
        },
      });
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({
        validationSearch: { StartDate: "Tanggal Awal Harus DIisi" },
      });
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({
        validationSearch: { endDate: "Tanggal Akhir Harus DIisi" },
      });
    } else {
      this.downloadDataRekap();
    }
  };

  downloadData = () => {
    this.setState({ loadingData: true });

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?adminEmployeeId=${adminEmployeeId}&page=1&size=1000&bpjsFlag=${this.state.bpjsFlag}&bpjstkFlag=${this.state.bpjstkFlag}&spriFlag=${this.state.spriFlag}&pphFlag=${this.state.pphFlag}&koperasiFlag=${this.state.koperasiFlag}`;

    if (this.state.startDate)
      query +=
        "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD");

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD");

    if (this.state.selectedUnit)
      query += "&unitId=" + this.state.selectedUnit.Id;
    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id;
    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id;

    console.log(query);

    const value = localStorage.getItem("token");
    const Header = {
      accept: "application/json",
      Authorization: `Bearer ` + value,
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios({
      method: "get",
      url:
        CONST.URI_ATTENDANCE +
        DOWNLOAD_REPORTDAILYPAYEMPLOYEE_REPORT +
        query,
      responseType: "blob",
      headers: Header,
    })
      .then((data) => {
        console.log(data);
        let disposition = data.headers["content-disposition"];
        let filename = decodeURI(disposition.match(/filename="(.*)"/)[1]);
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
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false, loadingData: false });
      });
  };

  numberFormat = (value) => new Intl.NumberFormat("id-ID").format(value);

  downloadDataRekap = () => {
    this.setState({ loadingData: true });

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?adminEmployeeId=${adminEmployeeId}&page=1&size=1000&bpjsFlag=${this.state.bpjsFlag}&bpjstkFlag=${this.state.bpjstkFlag}&spriFlag=${this.state.spriFlag}&pphFlag=${this.state.pphFlag}&koperasiFlag=${this.state.koperasiFlag}`;

    if (this.state.startDate)
      query +=
        "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD");

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD");

    if (this.state.selectedUnit)
      query += "&unitId=" + this.state.selectedUnit.Id;
    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id;
    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id;

    console.log(query);

    const value = localStorage.getItem("token");
    const Header = {
      accept: "application/json",
      Authorization: `Bearer ` + value,
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios({
      method: "get",
      url:
        CONST.URI_ATTENDANCE +
        DOWNLOAD_REPORTDAILYPAYEMPLOYEE_REPORT +
        "-rekap" +
        query,
      responseType: "blob",
      headers: Header,
    })
      .then((data) => {
        console.log(data);
        let disposition = data.headers["content-disposition"];
        let filename = decodeURI(disposition.match(/filename="(.*)"/)[1]);
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
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false, loadingData: false });
      });
  };

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item, index) => {
      return (
        <tr>
          <td className="align-middle text-center">{index + 1}</td>
          <td className="align-middle">
            {item.Employee.Firstname + " " + item.Employee.Lastname}
          </td>
          <td className="align-middle">{item.Employee.EmployeeIdentity}</td>
          <td className="align-middle">{item.Employee.EmploymentClass}</td>
          <td className="align-middle">
            {moment(item.Employee.JoinDate).format("DD-MM-YYYY")}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.PayPerMonth.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.PayPerMonth.toFixed(0))}
          </td>
          <td className="align-middle">
            {item.AttendCount.toFixed(0) == 0
              ? "-"
              : item.AttendCount.toFixed(0)}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.TakeHomePay.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.TakeHomePay.toFixed(0))}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.TotalTakeHomePay.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.TotalTakeHomePay.toFixed(0))}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.AdditionalPayLeave.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.AdditionalPayLeave.toFixed(0))}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.AddCorrection.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.AddCorrection.toFixed(0))}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.PayCutJHT.toFixed(2)) == 0
              ? "-"
              : this.numberFormat(item.PayCutJHT.toFixed(2))}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.PayCutJP.toFixed(2)) == 0
              ? "-"
              : this.numberFormat(item.PayCutJP.toFixed(2))}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.PayCutsSPN.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.PayCutsSPN.toFixed(0))}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.MinusCorrection.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.MinusCorrection.toFixed(0))}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.PayCutsBPSJ.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.PayCutsBPSJ.toFixed(0))}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.PayCutsPPH21.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.PayCutsPPH21.toFixed(0))}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.PayCutsCreditUnion.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.PayCutsCreditUnion.toFixed(0))}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.TotalPay.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.TotalPay.toFixed(0))}
          </td>
          <td className="align-middle">
            {item.TotalTimeOvertime.toFixed(0) == 0
              ? "-"
              : item.TotalTimeOvertime.toFixed(0)}
          </td>
          <td className="align-middle">
            {this.numberFormat(
              item.ReportOvertime?.TotalCashOvertime.toFixed(0) ?? 0
            ) == 0
              ? "-"
              : this.numberFormat(
                  item.ReportOvertime?.TotalCashOvertime.toFixed(0) ?? 0
                )}
          </td>
          <td className="align-middle">
            {this.numberFormat(item.TotalPaySalary.toFixed(0)) == 0
              ? "-"
              : this.numberFormat(item.TotalPaySalary.toFixed(0))}
          </td>
          {/* <td className='align-middle'>{this.numberFormat(item.PayPerMonth.toFixed(0))}</td>
            <td className='align-middle'>{item.AttendCount.toFixed(1)}</td>
            <td className='align-middle'>{this.numberFormat(item.TakeHomePay.toFixed(0))}</td>
            <td className='align-middle'>{this.numberFormat(item.TotalTakeHomePay.toFixed(0))}</td>
            <td className='align-middle'>{this.numberFormat(item.AdditionalPayLeave.toFixed(0))}</td>
            <td></td>
            <td className='align-middle'>{this.numberFormat(item.PayCutsThtJp.toFixed(0))}</td>
            <td className='align-middle'>{this.numberFormat(item.PayCutsSPN.toFixed(0))}</td>
            <td></td>
            <td className='align-middle'>{this.numberFormat(item.PayCutsBPSJ.toFixed(0))}</td>
            <td className='align-middle'>{this.numberFormat(item.PayCutsPPH21.toFixed(0))}</td>
            <td className='align-middle'>{this.numberFormat(item.PayCutsCreditUnion.toFixed(0))}</td>
            <td className='align-middle'>{this.numberFormat(item.TotalPay.toFixed(0))}</td>
            <td className='align-middle'>{item.TotalTimeOvertime.toFixed(0)}</td>
            <td className='align-middle'>{this.numberFormat(item.ReportOvertime?.TotalCashOvertime.toFixed(0) ?? 0)}</td>
            <td className='align-middle'>{this.numberFormat(item.TotalPaySalary.toFixed(0))}</td> */}
          <td></td>
        </tr>
      );
    });

    return (
      <div className="animated fadeIn">
        {this.state.loading ? (
          <span>
            <Spinner size="sm" color="primary" /> Please wait...
          </span>
        ) : (
          <Form>
            <Row>
              <Col>
                <FormGroup>
                  <Row>
                    <Col sm={2} className={"text-right"}>
                      <FormLabel>Unit/Bagian</FormLabel>
                    </Col>
                    <Col sm={8}>
                      <Select
                        placeholder={"pilih unit"}
                        isClearable={true}
                        options={this.state.units}
                        value={this.state.selectedUnit}
                        onChange={(value) => {
                          if (value != null) this.setSectionsByUnit(value.Id);
                          this.setState({ selectedUnit: value });
                        }}
                        isInvalid={this.state.validationSearch.SelectedUnit ? true : null}
                      />
                      <span style={{ color: "red" }}>{this.state.validationSearch.SelectedUnit}</span>
                    </Col>
                  </Row>
                </FormGroup>
                <FormGroup>
                  <Row>
                    <Col sm={2} className={"text-right"}>
                      <FormLabel>Seksi</FormLabel>
                    </Col>
                    <Col sm={8}>
                      <Select
                        placeholder={"pilih seksi"}
                        isClearable={true}
                        options={this.state.sections}
                        value={this.state.selectedSection}
                        onChange={(value) => {
                          if (value != null) this.setGroupsBySection(value.Id);
                          this.setState({ selectedSection: value });
                        }}
                      />
                    </Col>
                  </Row>
                </FormGroup>
                <FormGroup>
                  <Row>
                    <Col sm={2} className={"text-right"}>
                      <FormLabel>Group</FormLabel>
                    </Col>
                    <Col sm={8}>
                      <Select
                        placeholder={"pilih group"}
                        isClearable={true}
                        options={this.state.groups}
                        value={this.state.selectedGroup}
                        onChange={(value) => {
                          this.setState({ selectedGroup: value });
                        }}
                      />
                    </Col>
                  </Row>
                </FormGroup>

                <FormGroup>
                  <Row>
                    <Col sm={2} className={"text-right"}>
                      <FormLabel>Periode Pembayaran</FormLabel>
                    </Col>
                    <Col sm={8}>
                      <Row>
                        <Col sm={5}>
                          <Form.Control
                            type="date"
                            value={this.state.startDate}
                            onChange={(event) => {
                              this.setState({ startDate: event.target.value });
                            }}
                            isInvalid={this.state.validationSearch.StartDate}
                          />
                          <Form.Control.Feedback type="invalid">
                            {this.state.validationSearch.StartDate}
                          </Form.Control.Feedback>
                        </Col>
                        <Col sm={2} className={"text-center"}>
                          s/d
                        </Col>
                        <Col sm={5}>
                          <Form.Control
                            type="date"
                            value={this.state.endDate}
                            onChange={(event) => {
                              this.setState({ endDate: event.target.value });
                            }}
                            isInvalid={this.state.validationSearch.EndDate}
                          />
                          <Form.Control.Feedback type="invalid">
                            {this.state.validationSearch.EndDate}
                          </Form.Control.Feedback>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </FormGroup>
              </Col>
              <Col>
                <Row>
                  <FormLabel>Apakah Kena Potongan</FormLabel>
                </Row>
                <FormGroup>
                  <FormGroup>
                    <Row>
                      <Form.Check
                        type={"checkbox"}
                        id={"bpjs-checked"}
                        name={"bpjsFlag"}
                        onChange={(val) => {
                          this.setState({ bpjsFlag: val.target.checked });
                        }}
                        checked={this.state.bpjsFlag}
                        label={"BPJS Kesehatan"}
                      ></Form.Check>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Form.Check
                        type={"checkbox"}
                        id={"bpjstk-checked"}
                        name={"bpjstkFlag"}
                        checked={this.state.bpjstkFlag}
                        onChange={(val) => {
                          this.setState({ bpjstkFlag: val.target.checked });
                        }}
                        label={"BPJS Ketenagakerjaan"}
                      ></Form.Check>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Form.Check
                        type={"checkbox"}
                        id={"spri-checked"}
                        name={"spriFlag"}
                        checked={this.state.spriFlag}
                        onChange={(val) => {
                          this.setState({ spriFlag: val.target.checked });
                        }}
                        label={"SPRI"}
                      ></Form.Check>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Form.Check
                        type={"checkbox"}
                        id={"pph-checked"}
                        name={"pphFlag"}
                        checked={this.state.pphFlag}
                        onChange={(val) => {
                          this.setState({ pphFlag: val.target.checked });
                        }}
                        label={"PPH"}
                      ></Form.Check>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Form.Check
                        type={"checkbox"}
                        id={"koperasi-checked"}
                        name={"koperasiFlag"}
                        checked={this.state.koperasiFlag}
                        onChange={(val) => {
                          this.setState({ koperasiFlag: val.target.checked });
                        }}
                        label={"Koperasi"}
                      ></Form.Check>
                    </Row>
                  </FormGroup>
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Row>
                <Col sm={1}></Col>
                <Col sm={4}>
                  <Button
                    className="btn btn-secondary mr-5"
                    name="reset"
                    onClick={this.resetPagingConfiguration}
                  >
                    Reset
                  </Button>
                  <Button
                    className="btn btn-success mr-5"
                    name="search"
                    onClick={this.search}
                  >
                    Cari
                  </Button>
                </Col>
              </Row>

              <Row>
                <Col className="pull-right">
                  <Button
                    className="btn btn-primary mr-5 pull-right"
                    name="verification"
                    onClick={this.downloadVerification}
                  >
                    Cetak ke Verfikasi
                  </Button>
                  <Button
                    className="btn btn-primary mr-5 pull-right"
                    name="toBanking"
                    onClick={this.downloadReportToBanking}
                  >
                    Cetak ke Bank
                  </Button>

                  <Button
                    className="btn btn-primary mr-5 pull-right"
                    name="export"
                    onClick={this.downloadExcel}
                  >
                    Cetak
                  </Button>
                  <Button
                    className="btn btn-primary mr-5 pull-right"
                    name="export"
                    onClick={this.downloadRekapLembur}
                  >
                    Cetak Slip Upah
                  </Button>
                </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              {this.state.loadingData ? (
                <span>
                  <Spinner size="sm" color="primary" /> Loading Data...
                </span>
              ) : this.state.tableData.length <= 0 ? (
                <div>
                  <div id="sliderContainer2" ref={this.sliderContainer}>
                    <DragScrollTable
                      elementContainer={document.getElementById(
                        "sliderContainer2"
                      )}
                    >
                      <thead>
                        <tr className={"text-center"}>
                          <th rowSpan="2" className={"align-middle"}>
                            No.
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Nama Karyawan
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Nomor Barcode
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Gol
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Tanggal Masuk
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Upah / Bln (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Jml hr Msk
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Terima per bulan (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Jumlah (Rp)
                          </th>
                          <th colSpan="2" className={"align-middle"}>
                            Tambahan
                          </th>
                          <th colSpan="6" className={"align-middle"}>
                            Potongan
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Pot. Koperasi
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Jumlah Upah (Rp)
                          </th>
                          <th colSpan="2" className={"align-middle"}>
                            Lembur
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Jumlah dibayar(Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Paraf
                          </th>
                        </tr>
                        <tr>
                          <th rowSpan="2" className={"align-middle"}>
                            lr.cr.ch.lr (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Koreksi Upah (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            J.H.T (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            JP (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            SPRI (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                          Koreksi Upah (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            BPJS Kes (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            PPH 21 (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Jml Jam
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Dibayar (Rp)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan="23" className={"text-center"}>
                            Data Kosong
                          </td>
                        </tr>
                      </tbody>
                    </DragScrollTable>
                  </div>

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
                </div>
              ) : (
                <Row>
                  <div id="sliderContainer3" ref={this.sliderContainer}>
                    <DragScrollTable
                      elementContainer={document.getElementById(
                        "sliderContainer3"
                      )}
                    >
                      <thead>
                        <tr className={"text-center"}>
                          <th rowSpan="2" className={"align-middle"}>
                            No.
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Nama Karyawan
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Nomor Barcode
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Gol
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Tanggal Masuk
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Upah / Bln (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Jml hr Msk
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Terima per bulan (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Jumlah (Rp)
                          </th>
                          <th colSpan="2" className={"align-middle"}>
                            Tambahan
                          </th>
                          <th colSpan="6" className={"align-middle"}>
                            Potongan
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Pot. Koperasi
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Jumlah Upah (Rp)
                          </th>
                          <th colSpan="2" className={"align-middle"}>
                            Lembur
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Jumlah dibayar(Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Paraf
                          </th>
                        </tr>
                        <tr>
                          <th rowSpan="2" className={"align-middle"}>
                            lr.cr.ch.lr (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            J.H.T (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            JP (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            SPN (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            BPJS (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            PPH 21 (Rp)
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Jml Jam
                          </th>
                          <th rowSpan="2" className={"align-middle"}>
                            Dibayar (Rp)
                          </th>
                        </tr>
                      </thead>
                      <tbody>{items}</tbody>
                    </DragScrollTable>
                  </div>
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

export default DailyPayEmployee;
