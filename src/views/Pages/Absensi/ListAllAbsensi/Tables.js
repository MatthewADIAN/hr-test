import React, { Component } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Spinner,
  Input,
  FormGroup,
  Label,
  InputGroupAddon,
  InputGroupText,
  Button,
} from "reactstrap";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import Pagination from "react-js-pagination";
import axios from "axios";
import $ from "jquery";
import Modal from "react-bootstrap/Modal";
import SelectSearch from "react-select-search";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import {
  urlAbsen,
  urlBlob,
  appovedList,
  stateList,
  urlUser,
} from "../../../../Constant";
import * as CONST from "../../../../Constant";
import RowButtonComponent from "./RowButtonComponent";
import swal from "sweetalert";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import TimeField from "react-simple-timefield";

import "react-datepicker/dist/react-datepicker.css";

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";

const REPORT_EXCEL_DESKTOP = "attendances/report/excel-desktop";
const DOWNLOAD_ATTENDANCE_REPORT = "attendances/report/download";

var fileDownload = require("js-file-download");
const moment = require("moment");
const HEADERS = {
  "Content-Type": "application/json",
  accept: "application/json",
  Authorization: `Bearer ` + localStorage.getItem("token"),
  "x-timezone-offset": moment().utcOffset() / 60,
};
class Tables extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateHeadDivision: [],
      results: [],
      units: [],
      sections: [],
      groups: [],
      startDate: null,
      endDate: null,
      selectedUnit: null,
      selectedSection: null,
      selectedGroup: null,
      isLate: false,
      isEarly: false,
      loading: true,
      loadingData: false,
      url: urlAbsen,
      currentPage: 1,
      resultsPerPage: 40,
      rangePicker: {},
      show: false,
      step: 1,

      activePage: 1,
      page: 1,
      size: 20,
      total: 0,

      employees: [],
      selectedEmployee: null,

      selectedOption: {},
      selectedOptionAdmin: {},
      selectedOptionState: {},
      selectedOptionHeadDivision: {},
      selectedOptionApprovalHeadDivision: {},
      selectedAttendance: {},
      checkInDate: '',
      checkInTime: '',
      checkOutDate: '',
      checkOutTime: '',

      isShowComponent: true,

      isShowEditAttendanceModal: false,
      isShowDeleteAttendanceModal: false,

      isAutoCompleteLoading: false,

      validationSearchForm: {},

      updateAttendanceLoading: true,
      deleteAttendanceLoading: true,
      showImage: false,
      stream: null,
      validationEditForm: {},
      userUnitId: localStorage.getItem("unitId"),
      userAccessRole: localStorage.getItem("accessRole"),
      otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),

    };


    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleClick = (event) => {
    // console.log(event.target.name)
    event.preventDefault();

    switch (event.target.name) {
      case "cari":
        if (this.state.startDate && this.state.endDate &&
          this.state.selectedUnit) {
          this.getData();
        } else {
          if (!this.state.startDate) {
            var { validationSearchForm } = this.state;
            validationSearchForm.startDate = "Tanggal Awal harus diisi";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.startDate = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
          if (!this.state.endDate) {
            var { validationSearchForm } = this.state;
            validationSearchForm.endDate = "Tanggal Akhir harus diisi";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.endDate = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
          if (!this.state.selectedUnit) {
            var { validationSearchForm } = this.state;
            validationSearchForm.unit = "Unit Harus dipilih";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.unit = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
        }
        break;
      case "reset":
        this.setState(
          {
            selectedEmployee: null,
            selectedUnit: null,
            selectedSection: null,
            selectedGroup: null,
            validationSearchForm: {},
            startDate: null,
            endDate: null,
            isLate: false,
            isEarly: false,
          },
          () => {
            this.getData();
          }
        );
        break;
      case "download":
        if (this.state.startDate && this.state.endDate &&
          this.state.selectedUnit) {
          this.downloadReportXls();
        } else {
          if (!this.state.startDate) {
            var { validationSearchForm } = this.state;
            validationSearchForm.startDate = "Tanggal Awal harus diisi";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.startDate = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
          if (!this.state.endDate) {
            var { validationSearchForm } = this.state;
            validationSearchForm.endDate = "Tanggal Akhir harus diisi";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.endDate = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
          if (!this.state.selectedUnit) {
            var { validationSearchForm } = this.state;
            validationSearchForm.unit = "Unit Harus dipilih";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.unit = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
        }
        break;
      case "downloadPdf":
        if (
          this.state.startDate &&
          this.state.endDate &&
          this.state.selectedEmployee != null
        ) {
          this.downloadPdf();
        } else {
          if (!this.state.startDate) {
            var { validationSearchForm } = this.state;
            validationSearchForm.startDate = "Tanggal Awal harus diisi";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.startDate = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
          if (!this.state.endDate) {
            var { validationSearchForm } = this.state;
            validationSearchForm.endDate = "Tanggal Akhir harus diisi";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.endDate = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
          if (!this.state.selectedEmployee) {
            var { validationSearchForm } = this.state;
            validationSearchForm.Employee = "Employee harus diisi";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.Employee = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
        }
        break;
      case "exsportToDestop":
        if (
          this.state.startDate &&
          this.state.endDate &&
          this.state.selectedUnit
        ) {
          this.downloadExcelToDesktop();
        } else {
          if (!this.state.startDate) {
            var { validationSearchForm } = this.state;
            validationSearchForm.startDate = "Tanggal Awal harus diisi";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.startDate = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
          if (!this.state.endDate) {
            var { validationSearchForm } = this.state;
            validationSearchForm.endDate = "Tanggal Akhir harus diisi";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.endDate = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
          if (!this.state.selectedUnit) {
            var { validationSearchForm } = this.state;
            validationSearchForm.unit = "Unit Harus dipilih";
            this.setState({ validationSearchForm: validationSearchForm });
          } else {
            var { validationSearchForm } = this.state;
            validationSearchForm.unit = null;
            this.setState({ validationSearchForm: validationSearchForm });
          }
        }
        break;

      case "editAll":
        this.props.history.push("/attendance/attendance-report-edit-all");
        break;

      default:
        break;
    }
  };

  findAttendanceById = (attendance) => {

    const attendanceEdit = this.state.results.find(element => element.Id === attendance.Id);

    const dataToEdit = {
      Id: attendanceEdit.Id,
      EmployeeIdentity: attendanceEdit.EmployeeIdentity,
      EmployeeName: attendanceEdit.EmployeeName,
      Unit: attendanceEdit.Unit,
      CheckIn: attendanceEdit.CheckIn,
      CheckOut: attendanceEdit.CheckOut 
    }

    const checkInDateFormat = moment(attendanceEdit.CheckIn).format("YYYY-MM-DD");
    const checkInTimeFormat = moment(attendanceEdit.CheckIn).format("HH:mm");

    const checkOutDateFormat = moment(attendanceEdit.CheckOut).format("YYYY-MM-DD");
    const checkOutTimeFormat = moment(attendanceEdit.CheckOut).format("HH:mm");

    this.setState(
      {
        selectedAttendance: dataToEdit,
        checkInDate: checkInDateFormat,
        checkInTime: checkInTimeFormat,
        checkOutDate: checkOutDateFormat,
        checkOutTime: checkOutTimeFormat,
        updateAttendanceLoading: false
      }
    );

  }

  handleEditAttendanceClick = (attendance) => {

    this.showEditAttendanceModal(true);

    this.findAttendanceById(attendance);
  };
  handleDeleteAttendanceClick = (attendance) => {

    this.showDeleteAttendanceModal(true);
    this.setState(
      { selectedAttendance: attendance, deleteAttendanceLoading: false }
    );
  };

  handleChange(event) {
    this.setState({ [`${event.target.name}`]: event.target.checked });
  }

  handleDateChange(name, value) {
    this.setState({ [`${name}`]: value });
  }

  handlePageChange = (pageNumber) => {
    //console.log(pageNumber);
    this.setState({ activePage: pageNumber, page: pageNumber }, () => {
      this.getData();
    });
  };

  componentDidMount() {
    this.getData();
    this.getUnits();
    this.setGroups();
    this.setSections();
    this.setHiden();
  }
  setHiden = () => {
    if (UPAH == this.state.userAccessRole) {
      this.setState({ isShowComponent: false });
    }
  };
  handleEmployeeSearch = (params) => {
    this.setState({ isAutoCompleteLoading: true });

    let keyword = params;
    let adminEmployeeId = Number(localStorage.getItem("employeeId"));

    let url = `${CONST.URI_ATTENDANCE
      }employees/filter?keyword=${keyword}&unitId=${0}&adminEmployeeId=${adminEmployeeId}&statusEmployee=AKTIF`;

    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    // if (unitId) {
    //   url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${keyword}&unitId=${unitId}`;
    // }

    return axios
      .get(url, { headers: headers })
      .then((result) => {
        let items = [];
        result.data.data.map((datum) => {
          datum.NameAndEmployeeIdentity = `${datum.EmployeeIdentity} - ${datum.Name}`;
          items.push(datum);
        });

        this.setState({ employees: items }, () => {
          this.setState({ isAutoCompleteLoading: false });
        });

        return items;
      })
      .catch((err) => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan",
        });
      });
  };
  showEditAttendanceModal = (stateModal) => {
    this.setState({
      isShowEditAttendanceModal: stateModal,
      checkInDate: '',
      checkInTime: '',
      checkOutDate: '',
      checkOutTime: '',
      validationEditForm: {}
    });
  };
  showDeleteAttendanceModal = (stateModal) => {
    this.setState({ isShowDeleteAttendanceModal: stateModal });
  };
  cancelUpdateAttendanceClickHandler = () => {
    this.setState({ isShowEditAttendanceModal: false });
  };
  cancelDeleteAttendanceClickHandler = () => {
    this.setState({ isShowDeleteAttendanceModal: false });
  };
  updateAttendanceClickHandler = (data) => {
    var { selectedAttendance, checkInDate, checkInTime, checkOutDate, checkOutTime } = this.state;

    var checkinFormat = moment.utc(checkInDate + " " + checkInTime).subtract(CONST.OFFSET, 'hours');
    var checkoutFormat = moment.utc(checkOutDate + " " + checkOutTime).subtract(CONST.OFFSET, 'hours');
    selectedAttendance["CheckIn"] = checkinFormat.isValid() ? checkinFormat.format() : new Date(CONST.DATETIMEOFFSETMINVALUE).toISOString();
    selectedAttendance["CheckOut"] = checkoutFormat.isValid() ? checkoutFormat.format() : new Date(CONST.DATETIMEOFFSETMINVALUE).toISOString();

    this.setState({ updateAttendanceLoading: true });

    const url = `${CONST.URI_ATTENDANCE}attendances/${selectedAttendance.Id}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios
      .put(url, selectedAttendance, { headers: headers })
      .then(() => {
        swal("Data berhasil disimpan!");
        this.setState(
          {
            updateAttendanceLoading: false,
            selectedAttendance: {},
            currentPage: 1,
          },
          () => {
            this.showEditAttendanceModal(false);
            this.getData();
          }
        );
      })
      .catch((err) => {
        if (err.response) {
          let message = "Terjadi kesalahan\n";
          const errorMessage = err.response.data.error

          this.setState({ validationEditForm: errorMessage });

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

          //console.log(this.state);
        }

        this.setState({ updateAttendanceLoading: false });
      });
  };
  deleteAttendanceClickHandler = (data) => {
    this.setState({ deleteAttendanceLoading: true });

    const url = `${CONST.URI_ATTENDANCE}attendances/${this.state.selectedAttendance.Id}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .delete(url, { headers: headers })
      .then(() => {
        swal("Data berhasil dihapus!");
        this.setState({ deleteAttendanceLoading: false, currentPage: 1 });
        this.showDeleteAttendanceModal(false);
        this.getData();
      })
      .catch(() => {
        alert("Terjadi kesalahan!");
        this.setState({ deleteAttendanceLoading: false });
      });
  };

  downloadReportXls = () => {
    this.setState({ loadingData: true });

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query =
      `?adminEmployeeId=${adminEmployeeId}&page=` +
      this.state.page +
      "&size=" +
      this.state.size +
      "";

    if (this.state.startDate)
      query +=
        "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD");

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD");

    if (this.state.selectedUnit) {
      query += "&unitId=" + this.state.selectedUnit;
    } else {
      if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
        query += "&unitId=" + this.state.userUnitId;
      }
    }

    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection;

    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup;

    if (this.state.selectedEmployee)
      query += "&employeeId=" + this.state.selectedEmployee.Id;

    if (this.state.isLate) query += "&isLate=" + this.state.isLate;

    if (this.state.isEarly) query += "&isEarlier=" + this.state.isEarly;

    //console.log(query);

    const value = localStorage.getItem("token");
    const Header = {
      accept: "application/json",
      Authorization: `Bearer ` + value,
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios({
      method: "get",
      url: CONST.URI_ATTENDANCE + DOWNLOAD_ATTENDANCE_REPORT + query,
      responseType: "blob",
      headers: Header,
    })
      .then((data) => {
        //console.log(data);
        let disposition = data.headers["content-disposition"];
        let filename = decodeURI(disposition.match(/filename="(.*)"/)[1]);

        fileDownload(data.data, filename);
        this.setState({
          loading: false,
          loadingData: false,
          validationSearchForm: {},
        });
      })
      .catch((err) => {
        //console.log(err);
        this.setState({ loading: false, loadingData: false });
      });
  };

  downloadExcelToDesktop = () => {
    this.setState({ loadingData: true });

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query =
      `?adminEmployeeId=${adminEmployeeId}&page=` +
      this.state.page +
      "&size=" +
      this.state.size +
      "";

    if (this.state.startDate)
      query +=
        "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD");

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD");

    if (this.state.selectedUnit) {
      query += "&unitId=" + this.state.selectedUnit;
    } else {
      if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
        query += "&unitId=" + this.state.userUnitId;
      }
    }

    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection;

    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup;

    if (this.state.selectedEmployee)
      query += "&employeeId=" + this.state.selectedEmployee.Id;

    if (this.state.isLate) query += "&isLate=" + this.state.isLate;

    if (this.state.isEarly) query += "&isEarlier=" + this.state.isEarly;

    //console.log(query);

    const value = localStorage.getItem("token");
    const Header = {
      accept: "application/json",
      Authorization: `Bearer ` + value,
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios({
      method: "get",
      url: CONST.URI_ATTENDANCE + REPORT_EXCEL_DESKTOP + query,
      responseType: "blob",
      headers: Header,
    })
      .then((data) => {
        //console.log(data);
        let disposition = data.headers["content-disposition"];
        let filename = decodeURI(disposition.match(/filename="(.*)"/)[1]);

        fileDownload(data.data, filename);
        this.setState({
          loading: false,
          loadingData: false,
          validationSearchForm: {},
        });
      })
      .catch((err) => {
        //console.log(err);
        this.setState({ loading: false, loadingData: false });
      });
  };

  downloadPdf = () => {
    this.setState({ loadingData: true });

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query =
      `?adminEmployeeId=${adminEmployeeId}&page=` +
      this.state.page +
      "&size=" +
      this.state.size +
      "";

    if (this.state.startDate)
      query +=
        "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD");

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD");

    if (this.state.selectedUnit) {
      query += "&unitId=" + this.state.selectedUnit;
    } else {
      if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
        query += "&unitId=" + this.state.userUnitId;
      }
    }

    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection;

    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup;

    if (this.state.selectedEmployee)
      query += "&employeeId=" + this.state.selectedEmployee.Id;

    if (this.state.isLate) query += "&isLate=" + this.state.isLate;

    if (this.state.isEarly) query += "&isEarlier=" + this.state.isEarly;

    const value = localStorage.getItem("token");
    const Header = {
      accept: "application/json",
      Authorization: `Bearer ` + value,
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios({
      method: "get",
      url: CONST.URI_ATTENDANCE + "attendances/report/download-pdf" + query,
      responseType: "blob",
      headers: Header,
    })
      .then((data) => {
        let disposition = data.headers["content-disposition"];

        let filename = decodeURI(disposition.match(/filename="(.*)"/)[1]);

        fileDownload(data.data, filename);
        this.setState({
          loading: false,
          loadingData: false,
          validationSearchForm: {},
        });
      })
      .catch((err) => {
        this.setState({ loading: false, loadingData: false });
      });
  };

  getData = () => {
    if (this.state.startDate && this.state.endDate) {
      this.setState({ loadingData: true });

      let adminEmployeeId = Number(localStorage.getItem("employeeId"));
      let query =
        `?adminEmployeeId=${adminEmployeeId}&page=` +
        this.state.page +
        "&size=" +
        this.state.size +
        "";

      if (this.state.startDate)
        query +=
          "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD");

      if (this.state.endDate)
        query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD");

      if (this.state.selectedUnit) {
        query += "&unitId=" + this.state.selectedUnit;
      } else {
        if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
          query += "&unitId=" + this.state.userUnitId;
        }
      }

      if (this.state.selectedSection)
        query += "&sectionId=" + this.state.selectedSection;

      if (this.state.selectedGroup)
        query += "&groupId=" + this.state.selectedGroup;

      if (this.state.selectedEmployee)
        query += "&employeeId=" + this.state.selectedEmployee.Id;

      if (this.state.isLate) query += "&isLate=" + this.state.isLate;

      if (this.state.isEarly) query += "&isEarlier=" + this.state.isEarly;

      const value = localStorage.getItem("token");
      const Header = {
        accept: "application/json",
        Authorization: `Bearer ` + value,
        "x-timezone-offset": moment().utcOffset() / 60,
      };

      axios({
        method: "get",
        url: CONST.URI_ATTENDANCE + CONST.GET_ATTENDANCE_REPORT + query,
        headers: Header,
      })
        .then((data) => {
          // console.log(data.data)
          // var dataRemoveNullDate = [];
          // data.data.forEach(element => {
          //   var ifdatenullOut = moment(element.CheckOut).year() == 1;
          //   var ifdatenullIn = moment(element.CheckIn).year() == 1;

          //   // console.log(ifdatenull);
          //   if(ifdatenullOut)
          //     element.CheckOut = "";

          //   if(ifdatenullIn)
          //     element.CheckIn = "";

          // });

          this.setState({
            results: data.data.data,
            validationSearchForm: {},
            validationEditForm: {},
            loading: false,
            loadingData: false,
            total: data.data.total,
          });
        })
        .catch((err) => {
          //console.log(err);
          this.setState({ loading: false, loadingData: false });
        });
    }
  };

  getAllGroups = () => {
    const url = `${CONST.URI_ATTENDANCE}groups?size=1000000`;

    return axios
      .get(url, { headers: HEADERS })
      .then((data) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });

        var units = data.data.Data.map((datum) => {
          datum.value = datum.Id.toString();
          datum.name = datum.Name;
          return datum;
        });

        return units;
      })
      .catch((err) => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Data tidak ditemukan!",
        });
      });
  };

  getAllGroupsBySectionId = (sectionId) => {
    const url = `${CONST.URI_ATTENDANCE}groups/by-section?sectionId=${sectionId}&size=1000000`;

    return axios
      .get(url, { headers: HEADERS })
      .then((data) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });

        var units = data.data.Data.map((datum) => {
          datum.value = datum.Id.toString();
          datum.name = datum.Name;
          return datum;
        });

        return units;
      })
      .catch((err) => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Data tidak ditemukan!",
        });
      });
  };
  getAllSections = () => {
    const url = `${CONST.URI_ATTENDANCE}sections?size=1000000`;

    return axios
      .get(url, { headers: HEADERS })
      .then((data) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });

        var units = data.data.Data.map((datum) => {
          datum.value = datum.Id.toString();
          datum.name = datum.Name;
          return datum;
        });

        return units;
      })
      .catch((err) => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Data tidak ditemukan!",
        });
      });
  };

  getAllSectionsByUnitId = (unitId) => {
    const url = `${CONST.URI_ATTENDANCE}sections/by-unit?unitId=${unitId}&size=1000000`;

    return axios
      .get(url, { headers: HEADERS })
      .then((data) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });

        var units = data.data.Data.map((datum) => {
          datum.value = datum.Id.toString();
          datum.name = datum.Name;
          return datum;
        });

        return units;
      })
      .catch((err) => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Data tidak ditemukan!",
        });
      });
  };

  getUnits = () => {
    axios({
      method: "get",
      url: CONST.URI_ATTENDANCE + CONST.GET_UNITS + "?page=1&size=1000",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((data) => {
        let units = [{ name: "", value: 0 }];
        data.data.Data.map((v) => {
          if (
            (this.state.userAccessRole == PERSONALIA_BAGIAN ||
              this.state.userAccessRole == PIMPINAN ||
              this.state.userAccessRole == UPAH) &&
            (this.state.otherUnitId.includes(v.Id))
          ) {
            units.push({
              name: v.Name,
              value: v.Id.toString(),
            });
          } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
            units.push({
              name: v.Name,
              value: v.Id.toString(),
            });
          }
        });
        this.setState({ loading: false, units: units });
      })
      .catch((err) => {
        //console.log(err);
        this.setState({ loading: false });
      });
  };

  setGroups = () => {
    this.setState({ loading: true });
    this.getAllGroups().then((result) => {
      this.setState({ groups: result, loading: false });
    });
  };

  setGroupsBySection = (sectionId) => {
    // this.setState({ loading: true })
    this.getAllGroupsBySectionId(sectionId).then((result) => {
      this.setState({ groups: result, selectedGroup: null, loading: false });
    });
  };

  setSections = () => {
    this.setState({ loading: true });
    this.getAllSections().then((result) => {
      this.setState({ sections: result, loading: false });
    });
  };

  setSectionsByUnit = (unitId) => {
    // this.setState({ loading: true })
    this.getAllSectionsByUnitId(unitId).then((result) => {
      this.setState({
        sections: result,
        selectedSection: null,
        selectedGroup: null,
        loading: false,
      });
    });
  };

  convertMinutesToHours(n) {
    let num = n;
    let hours = num / 60;
    let rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);
    var totalHour =
      rhours.toString().padStart(2, "0") +
      ":" +
      rminutes.toString().padStart(2, "0");

    return totalHour;
  }

  render() {
    const { results } = this.state;

    const renderresults = results.map((result, index) => {
      //convert to timespan
      let totalMinutesStart = result.StartHour * 60 + result.StartMinute;
      var startHour = this.convertMinutesToHours(totalMinutesStart);

      let totalMinutesEnd = result.EndHour * 60 + result.EndMinute;
      var endHour = this.convertMinutesToHours(totalMinutesEnd);

      return (
        <tr key={index} data-category={index}>
          <td>{result.EmployeeIdentity}</td>
          <td>{result.EmployeeName}</td>
          <td>{result.Unit}</td>
          <td>
            {startHour} - {endHour}
          </td>
          <td>
            <span
              className={
                result.IsLate ? "text text-danger" : "text text-default"
              }
            >
              {moment.utc(result.CheckIn).local().format("DD/MM/YYYY HH:mm")}
            </span>
          </td>
          <td>
            <span
              className={
                result.IsEarlier ? "text text-danger" : "text text-default"
              }
            >
              {moment(result.CheckOut).year() === 1
                ? ""
                : moment
                  .utc(result.CheckOut)
                  .local()
                  .format("DD/MM/YYYY HH:mm")}
            </span>
          </td>
          {/* <td>{results.IsLate ? Math.ceil(results.LateMinutes) + " Menit" : ""}</td>
          <td>{results.IsEarlier ? Math.ceil(results.EarlierMinutes) + " Menit" : ""}</td> */}
          <td>{result.LateString}</td>
          <td>{result.EarlyString}</td>
          <td>
            {result.CheckInImageUri === "" && <span>Tidak Ada Foto</span>}
            {result.CheckInImageUri !== "" && <img src={result.CheckInImageUri} height="200px" />}
          </td>
          <td>
            {result.CheckInImageUri === "" && <span>Tidak Ada Foto</span>}
            {result.CheckInImageUri !== "" && <img src={result.CheckOutImageUri} height="200px" />}
          </td>
          <td>
            {this.state.isShowComponent && (
              <Form>
                <FormGroup style={{ display: "inline" }}>
                  <RowButtonComponent
                    className="btn btn-primary"
                    name="ubah-attendance"
                    onClick={this.handleEditAttendanceClick}
                    data={result}
                    iconClassName="fa fa-pencil-square"
                    label=""
                  ></RowButtonComponent>
                  <RowButtonComponent
                    className="btn btn-danger"
                    name="hapus-attendance"
                    onClick={this.handleDeleteAttendanceClick}
                    data={result}
                    iconClassName="fa fa-trash"
                    label=""
                  ></RowButtonComponent>
                </FormGroup>
              </Form>
            )}
          </td>
        </tr>
      );
    });

    return (
      <div>
        <div className="animated fadeIn">
          {this.state.loading ? (
            <span>
              <Spinner size="sm" color="primary" /> Please wait...
            </span>
          ) : (
            <Row>
              <Col xs="12" lg="12">
                <Form className="mb-5">
                  <FormGroup>
                    <Label className="mr-sm-2">Tanggal</Label>
                    <div className="d-flex flex-row align-items-center">
                      <div className="d-flex flex-column align-items-center">
                        <DatePicker
                          className="form-control"
                          name="startDate"
                          selected={this.state.startDate}
                          onChange={(val) =>
                            this.handleDateChange("startDate", val)
                          }
                          dateFormat="dd/MM/yyyy"
                        />
                        <span style={{ color: "red" }}>
                          {this.state.validationSearchForm.startDate}
                        </span>
                      </div>

                      <div className="d-flex flex-column align-items-center">
                        <span className="mx-3">s/d</span>
                      </div>
                      <div className="d-flex flex-column align-items-center">
                        <DatePicker
                          className="form-control"
                          name="endDate"
                          dateFormat="dd/MM/yyyy"
                          selected={this.state.endDate}
                          onChange={(val) =>
                            this.handleDateChange("endDate", val)
                          }
                        />
                        <span style={{ color: "red" }}>
                          {this.state.validationSearchForm.endDate}
                        </span>
                      </div>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label for="exampleEmail" className="mr-sm-2">
                      Unit/Bagian
                    </Label>
                    <div className="d-flex flex-row align-items-center">
                      <div>
                        <SelectSearch
                          options={this.state.units}
                          value={this.state.selectedUnit}
                          search
                          name="unit"
                          onChange={(val) => {
                            //console.log(val);
                            if (val) {
                              this.setSectionsByUnit(val);
                            }
                            this.setState({ selectedUnit: val });
                          }}
                          placeholder="--select unit--"
                        />
                        <span style={{ color: "red" }}>
                          {this.state.validationSearchForm.unit}
                        </span>
                      </div>
                      <FormGroup check className="mx-3">
                        <Label check>
                          <Input
                            type="checkbox"
                            name="isLate"
                            onChange={this.handleChange}
                          />{" "}
                          Terlambat
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="isEarly"
                            onChange={this.handleChange}
                          />{" "}
                          Pulang Lebih Awal
                        </Label>
                      </FormGroup>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label for="exampleEmail" className="mr-sm-2">
                      Seksi
                    </Label>
                    <div className="d-flex flex-row align-items-center">
                      <SelectSearch
                        options={this.state.sections}
                        value={this.state.selectedSection}
                        search
                        name="section"
                        onChange={(val) => {
                          if (val) {
                            this.setGroupsBySection(val);
                          }
                          this.setState({ selectedSection: val });
                        }}
                        placeholder="--select section--"
                      />
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label for="exampleEmail" className="mr-sm-2">
                      Group
                    </Label>
                    <div className="d-flex flex-row align-items-center">
                      <SelectSearch
                        options={this.state.groups}
                        value={this.state.selectedGroup}
                        search
                        name="group"
                        onChange={(val) => {
                          this.setState({ selectedGroup: val });
                        }}
                        placeholder="--select group--"
                      />
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <Label for="exampleEmail" className="mr-sm-2">
                      Karyawan
                    </Label>
                    <div className="d-flex flex-row align-items-center">
                      <AsyncTypeahead
                        id="loader-employee"
                        ref={(typeahead) => {
                          this.typeaheadEmployee = typeahead;
                        }}
                        isLoading={this.state.isAutoCompleteLoading}
                        onChange={(selected) => {
                          this.setState({ selectedEmployee: selected[0] });
                        }}
                        labelKey="NameAndEmployeeIdentity"
                        minLength={1}
                        onSearch={this.handleEmployeeSearch}
                        options={this.state.employees}
                        placeholder="Cari karyawan..."
                        clearButton
                        style={{
                          width: "300px",
                        }}
                      />
                    </div>
                    <span style={{ color: "red" }}>
                      {this.state.validationSearchForm.Employee}
                    </span>
                  </FormGroup>

                  <Button
                    className="btn mr-2"
                    color="secondary"
                    name="reset"
                    onClick={this.handleClick}
                  >
                    Reset
                  </Button>
                  <Button
                    className="btn mr-2"
                    color="primary"
                    name="cari"
                    onClick={this.handleClick}
                  >
                    Cari
                  </Button>
                  {this.state.isShowComponent === true && (
                    <Button
                      className="btn mr-2"
                      color="info"
                      name="editAll"
                      onClick={this.handleClick}
                    >
                      Edit All
                    </Button>
                  )}

                  <Button
                    className="btn mr-2"
                    color="success"
                    name="download"
                    onClick={this.handleClick}
                  >
                    Excel
                  </Button>
                  <Button
                    className="btn mr-2"
                    color="success"
                    name="downloadPdf"
                    onClick={this.handleClick}
                  >
                    Pdf
                  </Button>
                  <Button
                    className="btn mr-2"
                    color="warning"
                    name="exsportToDestop"
                    onClick={this.handleClick}
                  >
                    Ekspor ke Desktop
                  </Button>
                </Form>
                <Card>
                  <CardHeader>
                    <Row>
                      <Col>
                        <i className="fa fa-user" />{" "}
                        <b>&nbsp;Laporan Absensi</b>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    {this.state.loadingData ? (
                      <span>
                        <Spinner size="sm" color="primary" /> Loading Data...
                      </span>
                    ) : (
                      <Table id="myTable" responsive striped bordered>
                        <thead>
                          <tr>
                            <th>NIK</th>
                            <th>Nama Karyawan</th>
                            <th>Unit/Bagian</th>
                            <th>Jadwal</th>
                            <th>Waktu Check-In</th>
                            <th>Waktu Check-Out</th>
                            <th>Terlambat</th>
                            <th>Pulang Lebih Awal</th>
                            <th>Foto Check-In</th>
                            <th>Foto Check-Out</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>{renderresults}</tbody>
                      </Table>
                    )}
                    <Pagination
                      activePage={this.state.activePage}
                      itemsCountPerPage={20}
                      totalItemsCount={this.state.total}
                      pageRangeDisplayed={5}
                      onChange={this.handlePageChange}
                      innerClass={"pagination"}
                      itemClass={"page-item"}
                      linkClass={"page-link"}
                    />
                  </CardBody>
                  <Modal
                    aria-labelledby="modal-ubah-data"
                    show={this.state.isShowEditAttendanceModal}
                    onHide={() => this.showEditAttendanceModal(false)}
                    animation={true}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title id="modal-ubah-data">
                        Edit Data Absensi
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form noValidate>
                        <Row>
                          <Col sm={4}>
                            <Form.Label>NIK</Form.Label>
                          </Col>
                          <Col>
                            <Form.Label>
                              {this.state.selectedAttendance.EmployeeIdentity}
                            </Form.Label>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={4}>
                            <Form.Label>Nama Karyawan</Form.Label>
                          </Col>
                          <Col>
                            <Form.Label>
                              {this.state.selectedAttendance.EmployeeName}
                            </Form.Label>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={4}>
                            <Form.Label>Unit</Form.Label>
                          </Col>
                          <Col>
                            <Form.Label>
                              {this.state.selectedAttendance.Unit}
                            </Form.Label>
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
                              value={this.state.checkInDate}
                              onChange={(val) => {
                                return this.setState({
                                  checkInDate: val.target.value
                                });
                              }}
                              isInvalid={
                                this.state.validationEditForm.CheckIn
                                  ? true
                                  : null
                              }
                            ></Form.Control>
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
                              value={this.state.checkInTime}
                              onChange={(val) => {
                                return this.setState({
                                  checkInTime: val.target.value
                                });
                              }}
                              style={{
                                border: "1px solid #c2d6d6",
                                fontSize: 14,
                                width: "100%",
                                padding: "5px 8px",
                                color: "#333",
                                borderRadius: 1,
                              }}
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={4}>
                            <Form.Label>Tanggal CheckOut</Form.Label>
                          </Col>
                          <Col>
                            {this.state.selectedAttendance.CheckOut ? (
                              // moment(
                              //   this.state.selectedAttendance.CheckOut
                              // ).year() != 1 ?
                              (
                                <Form.Control
                                  type="date"
                                  name="dateCheckOut"
                                  id="dateCheckOut"
                                  value={this.state.checkOutDate}
                                  onChange={(val) => {
                                    return this.setState({
                                      checkOutDate: val.target.value
                                    });
                                  }}
                                  isInvalid={
                                    this.state.validationEditForm.CheckOut
                                      ? true
                                      : null
                                  }
                                ></Form.Control>
                              )
                              // : null
                            ) : null}
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={4}>
                            <Form.Label>Jam CheckOut</Form.Label>
                          </Col>
                          <Col>
                            {this.state.selectedAttendance.CheckOut ? (
                              // moment(
                              //   this.state.selectedAttendance.CheckOut
                              // ).year() != 1 ?
                              (
                                <TimeField
                                  id="timeCheckOut"
                                  name="timeCheckOut"
                                  value={this.state.checkOutTime}
                                  onChange={(val) => {
                                    return this.setState({
                                      checkOutTime: val.target.value
                                    });
                                  }}
                                  style={{
                                    border: "1px solid #c2d6d6",
                                    fontSize: 14,
                                    width: "100%",
                                    padding: "5px 8px",
                                    color: "#333",
                                    borderRadius: 1,
                                  }}
                                />
                              )
                              //: null
                            ) : null}
                          </Col>
                        </Row>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      {this.state.updateAttendaceLoading ? (
                        <span>
                          <Spinner size="sm" color="primary" /> Mohon tunggu...
                        </span>
                      ) : (
                        <span>
                          <Button
                            className="btn btn-primary"
                            name="cancel-attendance"
                            onClick={this.cancelUpdateAttendanceClickHandler}
                          >
                            Batal
                          </Button>
                          <Button
                            className="btn btn-success"
                            name="update-attendance"
                            onClick={this.updateAttendanceClickHandler}
                          >
                            Simpan
                          </Button>
                        </span>
                      )}
                    </Modal.Footer>
                  </Modal>

                  <Modal
                    aria-labelledby="modal-delete-data"
                    show={this.state.isShowDeleteAttendanceModal}
                    onHide={() => this.showDeleteAttendanceModal(false)}
                    animation={true}
                  >
                    <Modal.Header closeButton>
                      <Modal.Title id="modal-delete-data">
                        Hapus Data Absensi
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      Apakah anda yakin ingin menghapus data ini?
                    </Modal.Body>
                    <Modal.Footer>
                      {this.state.deleteAttendanceLoading ? (
                        <span>
                          <Spinner size="sm" color="primary" /> Mohon tunggu...
                        </span>
                      ) : (
                        <div>
                          <Button
                            className="btn btn-primary"
                            name="cancel-delete-attenddance"
                            onClick={this.cancelDeleteAttendanceClickHandler}
                          >
                            Tidak
                          </Button>
                          <Button
                            className="btn btn-danger"
                            name="delete-attenddance"
                            onClick={this.deleteAttendanceClickHandler}
                          >
                            Ya
                          </Button>
                        </div>
                      )}
                    </Modal.Footer>
                  </Modal>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </div>
    );
  }
}

export default Tables;
