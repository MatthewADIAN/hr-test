import React, { Component, Fragment } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Spinner,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Form,
  Button,
  FormGroup,
  Label,
  Input,
  FormFeedback,
} from "reactstrap";
import axios from "axios";
import SelectSearch from "react-select-search";
import $ from "jquery";
import swal from "sweetalert";
import DatePicker from "react-datepicker";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import Select from "react-select";
import {
  urlAbsen,
  urlBlob,
  appovedList,
  stateList,
  urlUser,
} from "../../../../Constant";
import * as CONST from "../../../../Constant";
import Schedules from "./Schedules";

import "react-datepicker/dist/react-datepicker.css";

const moment = require("moment");
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";
const GET_SCHEDULE_SHIFT_ITEM = "schedules/employee-schedule-shift-item";
const GET_EMPLOYEE_WITHOUT_SCHEDULE =
  "schedules/employee-without-schedule-shift-item";

const GET_SCHEDULE_SHIFT_ITEM_BY_PERIOD =
  "schedules/multiple-schedule-by-period";
const UPDATE_MULTIPLE_SCHEDULES = "schedules/multiple-schedules";

class Tables extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],

      employees: [],
      selectedEmployee: null,

      units: [],
      selectedUnit: null,

      sections: [],
      selectedSection: null,

      groups: [],
      selectedGroup: null,

      loading: false,
      loadingData: false,

      employeesToSet: [],

      isAutoCompleteLoading: false,

      activePage: 1,
      page: 1,
      size: 10,
      total: 0,
      isSubmitScheduleLoading: false,
      showEditScheduleModal: false,

      selectedShiftSunday: null,
      selectedShiftSundayIds: [],
      isDisabledSunday: false,

      selectedShiftMonday: null,
      selectedShiftMondayIds: [],
      isDisabledMonday: false,

      selectedShiftTuesday: null,
      selectedShiftTuesdayIds: [],
      isDisabledTuesday: false,

      selectedShiftWednesday: null,
      selectedShiftWednesdayIds: [],
      isDisabledWednesday: false,

      selectedShiftThursday: null,
      selectedShiftThursdayIds: [],
      isDisabledThursday: false,

      selectedShiftFriday: null,
      selectedShiftFridayIds: [],
      isDisabledFriday: false,

      selectedShiftSaturday: null,
      selectedShiftSaturdayIds: [],
      isDisabledSaturday: false,

      selectedRentangDate: {},
      shiftDropdownOptions: [],
      rentangDateOptions: [],
      StartPeriode: null,
      IsStartPeriodeHasValue: true,
      EndPeriode: null,
      userUnitId: localStorage.getItem("unitId"),
      userAccessRole: localStorage.getItem("accessRole"),
      validationSearch: {},

      isShowComponent: true,
      checkBoxType: 0,
      otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),
    };
  }
  
  resetState = () => {
    this.setState({
      loading: false,
      selectedFile: null,
      showSetScheduleModal: false,
      uploadFileLoading: false,

      selectedShiftSunday: null,
      selectedShiftMonday: null,
      selectedShiftTuesday: null,
      selectedShiftWednesday: null,
      selectedShiftThursday: null,
      selectedShiftFriday: null,
      selectedShiftSaturday: null,

      employees: [],
      // selectedEmployee: null,

      units: [],
      // selectedUnit: null,

      sections: [],
      // selectedSection: null,

      groups: [],
      // selectedGroup: null,

      activePage: this.state.activePage,
      page: this.state.page,
      size: 10,
      total: 0,

      isAutoCompleteLoading: false,

      selectedShiftSunday: null,
      isDisabledSunday: false,

      selectedShiftMonday: null,
      isDisabledMonday: false,

      selectedShiftTuesday: null,
      isDisabledTuesday: false,

      selectedShiftWednesday: null,
      isDisabledWednesday: false,

      selectedShiftThursday: null,
      isDisabledThursday: false,

      selectedShiftFriday: null,
      isDisabledFriday: false,

      selectedShiftSaturday: null,
      isDisabledSaturday: false,
      isSubmitScheduleLoading: false,
      selectedRentangDate: {},

      rentangDateOptions: [],
      showEditScheduleModal: false,
      monthYearPeriod: null,
      StartPeriode: null,
      EndPeriode: null,

      validationSearch: {},
    });
  };

  componentDidMount() {
    this.setData();
    this.setShiftSchedules();
    this.setHiden();
  }

  setHiden = () => {
    if (UPAH == this.state.userAccessRole) {
      this.setState({ isShowComponent: false });
    }
  };

  setShowEditScheduleModal = (value) => {
    this.setState({
      StartPeriode: null,
      EndPeriode: null,
      validationSearch: {},
      IsStartPeriodeHasValue: true,
      showEditScheduleModal: value,
      selectedShiftSundayIds: [],
      selectedShiftMondayIds: [],
      selectedShiftTuesdayIds: [],
      selectedShiftWednesdayIds: [],
      selectedShiftThursdayIds: [],
      selectedShiftFridayIds: [],
      selectedShiftSaturdayIds: [],
    });
  };

  onSelectMonday = (option) => {
    this.setState({ selectedShiftMondayIds: option });
  };

  onSelectTuesday = (option) => {
    this.setState({ selectedShiftTuesdayIds: option });
  };

  onSelectWednesday = (option) => {
    this.setState({ selectedShiftWednesdayIds: option });
  };

  onSelectThursday = (option) => {
    this.setState({ selectedShiftThursdayIds: option });
  };

  onSelectFriday = (option) => {
    this.setState({ selectedShiftFridayIds: option });
  };

  onSelectSaturday = (option) => {
    this.setState({ selectedShiftSaturdayIds: option });
  };

  onSelectSunday = (option) => {
    this.setState({ selectedShiftSundayIds: option });
  };

  setData = () => {
    if (
      this.state.selectedUnit ||
      this.state.selectedSection ||
      this.state.selectedGroup ||
      this.state.selectedEmployee
    ) {
      this.setState({ loadingData: true });

      let query = `?page=${this.state.page}&size=${this.state.size}`;

      if (this.state.selectedUnit) {
        query += "&unitId=" + this.state.selectedUnit.Id;
      } else {
        if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
          query += "&unitId=" + this.state.userUnitId;
        }
      }

      if (this.state.selectedSection)
        query += "&sectionId=" + this.state.selectedSection.Id;

      if (this.state.selectedGroup)
        query += "&groupId=" + this.state.selectedGroup.Id;

      if (this.state.selectedEmployee)
        query += "&employeeId=" + this.state.selectedEmployee.Id;

      const endpoint =
        this.state.checkBoxType === 0
          ? GET_SCHEDULE_SHIFT_ITEM
          : GET_EMPLOYEE_WITHOUT_SCHEDULE;

      axios({
        method: "get",
        url: CONST.URI_ATTENDANCE + endpoint + query,

        headers: {
          accept: "application/json",
          Authorization: `Bearer ` + localStorage.getItem("token"),
          "x-timezone-offset": moment().utcOffset() / 60,
        },
      })
        .then((data) => {
          this.setState({
            results: data.data.data,
            loading: false,
            loadingData: false,
            page: data.data.page,
            total: data.data.total,
          });
        })
        .catch((err) => {
          this.setState({ loading: false, loadingData: false });
        });
    }
  };

  setDataSearch = () => {
    if (
      this.state.selectedUnit ||
      this.state.selectedSection ||
      this.state.selectedGroup ||
      this.state.selectedEmployee
    ) {
      this.setState({ loadingData: true, page: 1 }, () => {
        let query = `?page=${this.state.page}&size=${this.state.size}`;

        if (this.state.selectedUnit) {
          query += "&unitId=" + this.state.selectedUnit.Id;
        } else {
          if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
            query += "&unitId=" + this.state.userUnitId;
          }
        }

        if (this.state.selectedSection)
          query += "&sectionId=" + this.state.selectedSection.Id;

        if (this.state.selectedGroup)
          query += "&groupId=" + this.state.selectedGroup.Id;

        if (this.state.selectedEmployee)
          query += "&employeeId=" + this.state.selectedEmployee.Id;

        const endpoint =
          this.state.checkBoxType === 0
            ? GET_SCHEDULE_SHIFT_ITEM
            : GET_EMPLOYEE_WITHOUT_SCHEDULE;

        axios({
          method: "get",
          url: CONST.URI_ATTENDANCE + endpoint + query,

          headers: {
            accept: "application/json",
            Authorization: `Bearer ` + localStorage.getItem("token"),
            "x-timezone-offset": moment().utcOffset() / 60,
          },
        })
          .then((data) => {
            this.setState({
              results: data.data.data,
              loading: false,
              loadingData: false,
              page: data.data.page,
              total: data.data.total,
              employeesToSet: data.data.data,
            });
          })
          .catch((err) => {
            this.setState({ loading: false, loadingData: false });
          });
      });
    } else {
      swal("Mohon untuk mengisi salah satu kolom filter");
    }
  };

  submitScheduleHandler = (event) => {
    this.setState({ isSubmitScheduleLoading: true });

    let employeeIds = [];
    this.setState({ isSubmitScheduleLoading: true });

    this.state.employeesToSet.map((v) => {
      employeeIds.push(v.EmployeeId);
    });

    let body = {
      StartPeriod: moment(this.state.StartPeriode).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
      EndPeriod: moment(this.state.EndPeriode).format("YYYY-MM-DD HH:mm:ss"),

      SundayShiftIds:
        this.state.selectedShiftSundayIds.length > 0
          ? this.state.selectedShiftSundayIds.map(
              (value, index) => value.payload.Id
            )
          : [],
      MondayShiftIds:
        this.state.selectedShiftMondayIds.length > 0
          ? this.state.selectedShiftMondayIds.map(
              (value, index) => value.payload.Id
            )
          : [],
      TuesdayShiftIds:
        this.state.selectedShiftTuesdayIds.length > 0
          ? this.state.selectedShiftTuesdayIds.map(
              (value, index) => value.payload.Id
            )
          : [],
      WednesdayShiftIds:
        this.state.selectedShiftWednesdayIds.length > 0
          ? this.state.selectedShiftWednesdayIds.map(
              (value, index) => value.payload.Id
            )
          : [],
      ThursdayShiftIds:
        this.state.selectedShiftThursdayIds.length > 0
          ? this.state.selectedShiftThursdayIds.map(
              (value, index) => value.payload.Id
            )
          : [],
      FridayShiftIds:
        this.state.selectedShiftFridayIds.length > 0
          ? this.state.selectedShiftFridayIds.map(
              (value, index) => value.payload.Id
            )
          : [],
      SaturdayShiftIds:
        this.state.selectedShiftSaturdayIds.length > 0
          ? this.state.selectedShiftSaturdayIds.map(
              (value, index) => value.payload.Id
            )
          : [],

      IsFiveDaysCycle: this.state.isFiveDaysCycle,
      Employees: employeeIds,
      SearchUnitId: this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
      // "SearchUnitId": this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.userUnitId : this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
      SearchSectionId: this.state.selectedSection
        ? this.state.selectedSection.Id
        : 0,
      SearchGroupId: this.state.selectedGroup ? this.state.selectedGroup.Id : 0,
      SearchEmployeeId: this.state.selectedEmployee
        ? this.state.selectedEmployee.Id
        : 0,
    };

    axios({
      method: "put",
      url: CONST.URI_ATTENDANCE + UPDATE_MULTIPLE_SCHEDULES,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
      data: body,
    })
      .then((data) => {
        swal("Berhasil", "Jadwal berhasil di buat", "success").then((value) => {
          this.resetState();
          this.setDataSearch();
        });
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status == 400) {
            console.log(err.response);
            let error = err.response.data.error;
            let messages = "";
            if (error.PeriodeRange) messages += `- ${error.PeriodeRange}\n`;

            if (error.Periode) messages += `- ${error.Periode}\n`;

            if (error.StartPeriod) messages += `- ${error.StartPeriod}\n`;

            if (error.NoExistSchedule)
              messages += `- ${error.NoExistSchedule}\n`;

            if (error.WrongInputPeriod)
              messages += `- ${error.WrongInputPeriod}\n`;

            swal("Data Tidak Valid", messages, "error").then((value) => {
              this.setState({ isSubmitScheduleLoading: false });
            });
          }

          if (err.response.status == 500) {
            let message = err.response.data.message;

            swal("Terjadi kesalahan", message, "error").then((value) => {
              this.setState({ isSubmitScheduleLoading: false });
            });
          }
        } else {
          swal("Maaf", "Terjadi kesalahan, silakan coba lagi", "error").then(
            (value) => {
              this.setState({ isSubmitScheduleLoading: false });
            }
          );
        }
      });
    // }
  };

  onmonthYearPeriodSelect(date) {
    this.setState({ monthYearPeriod: date });

    let query = `?monthYear=${moment(date).format("YYYY-MM-DD")}`;

    if (this.state.selectedUnit) {
      query += "&unitId=" + this.state.selectedUnit.Id;
    } else {
      if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
        query += "&unitId=" + this.state.userUnitId;
      }
    }

    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id;

    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id;

    if (this.state.selectedEmployee)
      query += "&employeeId=" + this.state.selectedEmployee.Id;

    axios({
      method: "get",
      url: CONST.URI_ATTENDANCE + CONST.GET_SCHEDULE_BY_MONTHYEAR + query,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        var data = result.data.map((datum) => {
          return {
            value: datum.Id,
            payload: datum,
            label: `${moment(datum.StartPeriod)
              .format("DD MMM")
              .toString()} - ${moment(datum.EndPeriod)
              .format("DD MMM")
              .toString()}`,
          };
        });

        this.setState({
          rentangDateOptions: data,
          loading: false,
          loadingData: false,
        });
      })
      .catch((err) => {
        this.setState({ loading: false, loadingData: false });
      });
  }

  onEndPeriodeChange() {
    this.setState({ validationSearch: {} });
    if (moment(this.state.StartPeriode) > moment(this.state.EndPeriode)) {
      this.setState({
        selectedShiftSundayIds: [],
        selectedShiftMondayIds: [],
        selectedShiftTuesdayIds: [],
        selectedShiftWednesdayIds: [],
        selectedShiftThursdayIds: [],
        selectedShiftFridayIds: [],
        selectedShiftSaturdayIds: [],
        validationSearch: {
          EndPeriode: "Tanggal Akhir Harus lebih Dari Tanggal Awal",
        },
      });
    } else if (
      this.state.StartPeriode == null ||
      this.state.StartPeriode == ""
    ) {
      this.setState({
        validationSearch: { StartPeriode: "Tanggal mulai harus diisi" },
      });
    } else {
      this.setDataToUpdate();
    }

    // this.setState({ EndPeriode: date })
  }

  setDataToUpdate = () => {
    this.setState({ loadingData: true });

    let query = `?page=${this.state.page}&size=${this.state.size}`;

    if (this.state.selectedUnit) {
      query += "&unitId=" + this.state.selectedUnit.Id;
    } else {
      if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
        query += "&unitId=" + this.state.userUnitId;
      }
    }

    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id;

    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id;

    if (this.state.selectedEmployee)
      query += "&employeeId=" + this.state.selectedEmployee.Id;

    if (this.state.StartPeriode !== null)
      query +=
        "&startDate=" + moment(this.state.StartPeriode).format("YYYY-MM-DD");

    if (this.state.EndPeriode !== null)
      query += "&endDate=" + moment(this.state.EndPeriode).format("YYYY-MM-DD");

    axios({
      method: "get",
      url: CONST.URI_ATTENDANCE + GET_SCHEDULE_SHIFT_ITEM_BY_PERIOD + query,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        var shiftOptions = this.state.shiftDropdownOptions;
        var shiftScheduleSundayIds = result.data.ShiftScheduleSundayIds;
        var selectedShiftSundays = [];
        if (shiftScheduleSundayIds && shiftScheduleSundayIds.length > 0) {
          shiftScheduleSundayIds.forEach((element) => {
            let selectedShift = shiftOptions.find((o) => o.value === element);
            selectedShiftSundays.push(selectedShift);
          });
        }

        if (shiftScheduleSundayIds === null) {
          selectedShiftSundays = [];
        }

        var shiftScheduleMondayIds = result.data.ShiftScheduleMondayIds;
        var selectedShiftMondays = [];
        if (shiftScheduleMondayIds && shiftScheduleMondayIds.length > 0) {
          shiftScheduleMondayIds.forEach((element) => {
            let selectedShift = shiftOptions.find((o) => o.value === element);
            selectedShiftMondays.push(selectedShift);
          });
        }

        if (shiftScheduleMondayIds === null) {
          selectedShiftMondays = [];
        }

        var shiftScheduleTuesdayIds = result.data.ShiftScheduleTuesdayIds;
        var selectedShiftTuesdays = [];
        if (shiftScheduleTuesdayIds && shiftScheduleTuesdayIds.length > 0) {
          shiftScheduleTuesdayIds.forEach((element) => {
            let selectedShift = shiftOptions.find((o) => o.value === element);
            selectedShiftTuesdays.push(selectedShift);
          });
        }

        if (shiftScheduleTuesdayIds === null) {
          selectedShiftTuesdays = [];
        }

        var shiftScheduleWednesdayIds = result.data.ShiftScheduleWednesdayIds;
        var selectedShiftWednesadays = [];
        if (shiftScheduleWednesdayIds && shiftScheduleWednesdayIds.length > 0) {
          shiftScheduleWednesdayIds.forEach((element) => {
            let selectedShift = shiftOptions.find((o) => o.value === element);
            selectedShiftWednesadays.push(selectedShift);
          });
        }

        if (shiftScheduleWednesdayIds === null) {
          selectedShiftWednesadays = [];
        }

        var shiftScheduleThursdayIds = result.data.ShiftScheduleThursdayIds;
        var selectedShiftThursdays = [];
        if (shiftScheduleThursdayIds && shiftScheduleThursdayIds.length > 0) {
          shiftScheduleThursdayIds.forEach((element) => {
            let selectedShift = shiftOptions.find((o) => o.value === element);
            selectedShiftThursdays.push(selectedShift);
          });
        }

        if (shiftScheduleThursdayIds === null) {
          selectedShiftThursdays = [];
        }

        var shiftScheduleFridayIds = result.data.ShiftScheduleFridayIds;
        var selectedShiftFridays = [];
        if (shiftScheduleFridayIds && shiftScheduleFridayIds.length > 0) {
          shiftScheduleFridayIds.forEach((element) => {
            let selectedShift = shiftOptions.find((o) => o.value === element);
            selectedShiftFridays.push(selectedShift);
          });
        }

        if (shiftScheduleFridayIds === null) {
          selectedShiftFridays = [];
        }

        var shiftScheduleSaturdayIds = result.data.ShiftScheduleSaturdayIds;
        var selectedShiftSaturdays = [];
        if (shiftScheduleSaturdayIds && shiftScheduleSaturdayIds.length > 0) {
          shiftScheduleSaturdayIds.forEach((element) => {
            let selectedShift = shiftOptions.find((o) => o.value === element);
            selectedShiftSaturdays.push(selectedShift);
          });
        }

        if (shiftScheduleSaturdayIds === null) {
          selectedShiftSaturdays = [];
        }

        this.setState({
          selectedShiftSundayIds: selectedShiftSundays,
          selectedShiftMondayIds: selectedShiftMondays,
          selectedShiftTuesdayIds: selectedShiftTuesdays,
          selectedShiftWednesdayIds: selectedShiftWednesadays,
          selectedShiftThursdayIds: selectedShiftThursdays,
          selectedShiftFridayIds: selectedShiftFridays,
          selectedShiftSaturdayIds: selectedShiftSaturdays,
        });
      })
      .catch((err) => {
        this.setState({ loading: false, loadingData: false });
      });
  };

  setShiftSchedules = () => {
    this.setState({ loading: true });
    const url = `${
      CONST.URI_ATTENDANCE
    }schedules/shift-schedules?page=1&size=${2147483647}`;

    axios({
      method: "GET",
      url: url,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        var data = result.data.Data.map((datum) => {
          return {
            value: datum.Id,
            payload: datum,
            label: `${datum.Name} (${datum.StartHour.toString().padStart(
              2,
              "0"
            )}.${datum.StartMinute.toString().padStart(
              2,
              "0"
            )} - ${datum.EndHour.toString().padStart(
              2,
              "0"
            )}.${datum.EndMinute.toString().padStart(2, "0")})`,
          };
        });

        this.setState({ shiftDropdownOptions: data });
        this.setState({ shiftSchedules: result.data.Data });
        this.setState({ loading: false });
      })
      .catch((err) => {
        this.setState({ loading: false });
      });
  };

  handleReset = async (event) => {
    this.typeaheadEmployee.getInstance().clear();
    this.typeaheadGroup.getInstance().clear();
    this.typeaheadSection.getInstance().clear();
    this.typeaheadUnit.getInstance().clear();
    this.setState({
      selectedEmployee: null,
      selectedGroup: null,
      selectedSection: null,
      selectedUnit: null,
      employeesToSet: [],
      page: 0,
    });
  };

  handleSearch = async (event) => {
    this.setDataSearch();
  };

  handleUnitSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    var url = `${CONST.URI_ATTENDANCE}units?keyword=${query}&adminEmployeeId=${adminEmployeeId}`;

    // if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
    //   url = url + `/${this.state.userUnitId}`;
    // } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
    //   url = url + `?keyword=${query}`;
    // }

    // const url = `${CONST.URI_ATTENDANCE}units?keyword=${query}`;

    axios({
      method: "GET",
      url: url,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        let units = [];

        if (
          this.state.userAccessRole == PERSONALIA_BAGIAN ||
          this.state.userAccessRole == PIMPINAN ||
          this.state.userAccessRole == UPAH
        ) {
          result.data.Data.map((datum) => {
            if(this.state.otherUnitId.includes(datum.Id)){
              units.push(datum);
            }
          });
        } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
          // units.push(result.data);
          result.data.Data.map((datum) => {
            units.push(datum);
          });
        }

        this.setState({ units: units });
        this.setState({ isAutoCompleteLoading: false });
      })
      .catch((err) => {
        this.setState({ isAutoCompleteLoading: false });
      });
  };

  handleGroupSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    let url = `${CONST.URI_ATTENDANCE}groups?keyword=${query}`;
    if (this.state.selectedSection) {
      url = `${CONST.URI_ATTENDANCE}groups/by-section?keyword=${query}&sectionId=${this.state.selectedSection.Id}`;
    }
    axios({
      method: "GET",
      url: url,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        let items = [];
        result.data.Data.map((datum) => {
          items.push(datum);
        });

        this.setState({ groups: items });
        this.setState({ isAutoCompleteLoading: false });
      })
      .catch((err) => {
        this.setState({ isAutoCompleteLoading: false });
      });
  };

  handleSectionSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    let url = `${CONST.URI_ATTENDANCE}sections?keyword=${query}`;
    if (this.state.selectedUnit) {
      let unitid = this.state.selectedUnit.Id;
      url = `${CONST.URI_ATTENDANCE}sections/by-unit?keyword=${query}&unitId=${unitid}`;
    } else if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
      let unitid = this.state.userUnitId;
      url = `${CONST.URI_ATTENDANCE}sections/by-unit?keyword=${query}&unitId=${unitid}`;
    }
    axios({
      method: "GET",
      url: url,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        let items = [];
        result.data.Data.map((datum) => {
          items.push(datum);
        });

        this.setState({ sections: items });
        this.setState({ isAutoCompleteLoading: false });
      })
      .catch((err) => {
        this.setState({ isAutoCompleteLoading: false });
      });
  };

  handleEdit = () => {
    // if (this.state.selectedUnit == null) {
    //   swal({
    //     icon: "error",
    //     title: "Oops...",
    //     text: "Unit harus dipilih",
    //   });
    // } else
    if (this.state.employeesToSet.length === 0) {
      swal({
        icon: "error",
        title: "Oops...",
        text: "pilih karyawan untuk di set jadwal",
      });
    } else {
      this.setShowEditScheduleModal(true);
    }

    // console.log(this.state.employeesToSet);
  };

  handleEmployeeSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    let unitId =
      this.state.selectedUnit != null ? this.state.selectedUnit.Id : 0;
    let sectionId =
      this.state.selectedSection != null ? this.state.selectedSection.Id : 0;
    let groupId =
      this.state.selectedGroup != null ? this.state.selectedGroup.Id : 0;
    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${query}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&adminEmployeeId=${adminEmployeeId}&statusEmployee=AKTIF`;

    if (unitId) {
      url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${query}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&adminEmployeeId=${adminEmployeeId}&statusEmployee=AKTIF`;
    }

    axios({
      method: "GET",
      url: url,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        let items = [];
        result.data.data.map((datum) => {
          datum.NameAndEmployeeIdentity = `${datum.EmployeeIdentity} - ${datum.Name}`;
          items.push(datum);
        });

        this.setState({ employees: items });
        this.setState({ isAutoCompleteLoading: false });
      })
      .catch((err) => {
        this.setState({ isAutoCompleteLoading: false });
      });
  };

  handlePageChange = async (pageNumber) => {
    await this.setState({
      activePage: pageNumber,
      page: pageNumber,
      loadingData: true,
    });
    this.setData();
  };

  showSchedules = (no) => {
    const { results } = this.state;
    let selectIdx = results.findIndex((d) => d.No === no);
    results[selectIdx].ShowSchedule = !results[selectIdx].ShowSchedule;

    this.setState({ results: results });
  };

  onTypeChange(event) {
    let value = parseInt(event.target.value);
    this.setState({ checkBoxType: value, results: [], activePage: 1, page: 1 });
  }

  getNo(no){
    const page = this.state.page;
    return page * 10 - 10 + no;
  }

  render() {
    const { results } = this.state;
    const renderresults = results.map((result, index) => {
      return (
        // <tr key={result.Id} data-category={result.Id}>
        <Fragment>
          <tr key={index} data-category={result.Id}>
            <td className="text-center">{this.getNo(result.No)}</td>
            <td>{result.EmployeeIdentity}</td>
            <td>
              {result.Firstname} {result.Lastname}
            </td>
            <td>{result.UnitName}</td>
            {this.state.checkBoxType === 0 && (
              <td className="text-center">
                <Button
                  className="btn btn-success"
                  onClick={() => this.showSchedules(result.No)}
                >
                  <i className="fa fa-eye"></i>
                </Button>
              </td>
            )}
          </tr>
          {result.ShowSchedule && result.schedules.length > 0 && (
            <tr>
              <td colSpan="5">
                <Schedules data={result.schedules} />
              </td>
            </tr>
          )}
        </Fragment>
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
                <Form>
                  <Table className="borderless">
                    <tbody>
                      <tr>
                        <td>
                          <AsyncTypeahead
                            id="loader-unit"
                            ref={(typeahead) =>
                              (this.typeaheadUnit = typeahead)
                            }
                            isLoading={this.state.isAutoCompleteLoading}
                            onChange={(selectedUnit) => {
                              this.setState({
                                selectedUnit: selectedUnit.lastItem,
                              });
                            }}
                            labelKey="Name"
                            minLength={1}
                            onSearch={this.handleUnitSearch}
                            options={this.state.units}
                            placeholder="Cari unit..."
                            renderMenuItemChildren={(option, props) => (
                              <div>
                                <span>{option.Name}</span>
                              </div>
                            )}
                          />
                        </td>
                        <td>
                          <AsyncTypeahead
                            id="loader-group"
                            ref={(typeahead) =>
                              (this.typeaheadGroup = typeahead)
                            }
                            isLoading={this.state.isAutoCompleteLoading}
                            onChange={(selected) => {
                              this.setState({
                                selectedGroup: selected.lastItem,
                              });
                            }}
                            labelKey="Name"
                            minLength={1}
                            onSearch={this.handleGroupSearch}
                            options={this.state.groups}
                            placeholder="Cari grup..."
                            renderMenuItemChildren={(option, props) => (
                              <div>
                                <span>{option.Name}</span>
                              </div>
                            )}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <AsyncTypeahead
                            id="loader-section"
                            ref={(typeahead) =>
                              (this.typeaheadSection = typeahead)
                            }
                            isLoading={this.state.isAutoCompleteLoading}
                            onChange={(selected) => {
                              this.setState({
                                selectedSection: selected.lastItem,
                              });
                            }}
                            labelKey="Name"
                            minLength={1}
                            onSearch={this.handleSectionSearch}
                            options={this.state.sections}
                            placeholder="Cari seksi..."
                            renderMenuItemChildren={(option, props) => (
                              <div>
                                <span>{option.Name}</span>
                              </div>
                            )}
                          />
                        </td>
                        <td>
                          <AsyncTypeahead
                            id="loader-employee"
                            ref={(typeahead) =>
                              (this.typeaheadEmployee = typeahead)
                            }
                            isLoading={this.state.isAutoCompleteLoading}
                            onChange={(selected) => {
                              this.setState({
                                selectedEmployee: selected.lastItem,
                              });
                            }}
                            labelKey="NameAndEmployeeIdentity"
                            minLength={1}
                            onSearch={this.handleEmployeeSearch}
                            options={this.state.employees}
                            placeholder="Cari karyawan..."
                            renderMenuItemChildren={(option, props) => (
                              <div>
                                <span>
                                  {option.EmployeeIdentity} - {option.Name}
                                </span>
                              </div>
                            )}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <FormGroup>
                    <div className="d-flex flex-row ml-3 mb-4">
                      <Col sm={3}>
                        <Input
                          type="radio"
                          name="suggestionBoxType"
                          value={0}
                          checked={this.state.checkBoxType === 0}
                          onChange={(event) => {
                            this.onTypeChange(event);
                          }}
                        />
                        Karyawan yang memiliki jadwal
                      </Col>
                      <Col sm={3}>
                        <Input
                          type="radio"
                          name="suggestionBoxType"
                          value={1}
                          checked={this.state.checkBoxType === 1}
                          onChange={(event) => {
                            this.onTypeChange(event);
                          }}
                        />
                        Karyawan yang belum terjadwal
                      </Col>
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <div className="d-flex flex-row ml-2">
                      <div className="flex-fill">
                        <Button
                          className="btn btn-secondary mr-2"
                          name="reset"
                          onClick={this.handleReset}
                        >
                          Reset
                        </Button>
                        <Button
                          className="btn btn-success mr-2"
                          name="cari"
                          onClick={this.handleSearch}
                        >
                          Cari
                        </Button>

                        {this.state.isShowComponent === true && (
                          <Button
                            className="btn btn-warning mr-2 pull-right"
                            name="edit-jadwal"
                            onClick={this.handleEdit}
                          >
                            Edit Jadwal
                          </Button>
                        )}
                      </div>
                    </div>
                  </FormGroup>
                </Form>
                <Card className="ml-2">
                  <CardHeader>
                    <Row>
                      <Col>
                        <i className="fa fa-user" />{" "}
                        <b>&nbsp;Jadwal Karyawan</b>
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
                          <tr className="text-center">
                            <th style={{ width: "10%" }}>No</th>
                            <th style={{ width: "20%" }}>NIK</th>
                            <th style={{ width: "30%" }}>Nama Karyawan</th>
                            <th style={{ width: "30%" }}>Unit/Bagian</th>
                            {this.state.checkBoxType === 0 && (
                              <th style={{ width: "10%" }}></th>
                            )}
                            {/**
                            <th>Selasa</th>
                          <th>Rabu</th>
                          <th>Kamis</th>
                          <th>Jumat</th>
                          <th>Sabtu</th>
                          <th>Minggu</th>
                           */}
                            {/* <th>Action</th> */}
                          </tr>
                        </thead>
                        <tbody>{renderresults}</tbody>
                      </Table>
                    )}
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

                    <Modal
                      dialogClassName="modal-90w"
                      aria-labelledby="modal-edit-jadwal"
                      show={this.state.showEditScheduleModal}
                      onHide={() => this.setShowEditScheduleModal(false)}
                      animation={true}
                    >
                      <Modal.Header closeButton>
                        <Modal.Title id="modal-edit-jadwal">
                          Ubah Jadwal
                        </Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <FormGroup>
                          <div className="row">
                            <div className="col-md-6">
                              <span className="mr-sm-2">Periode Awal </span>
                              <div className="d-flex flex-row align-items-center">
                                <DatePicker
                                  className="form-control"
                                  name="StartPeriode"
                                  selected={this.state.StartPeriode}
                                  onChange={(date) => {
                                    console.log("tanggal period", new Date());
                                    this.setState({
                                      StartPeriode: date,
                                      IsStartPeriodeHasValue: false,
                                    });
                                    //this.onStartPeriodeChange(date)
                                  }}
                                  dateFormat="dd/MM/yyyy"
                                  // showMonthYearPicker
                                />

                                <FormFeedback>Harus Diisi</FormFeedback>
                                <span style={{ color: "red" }}>
                                  {this.state.validationSearch.StartPeriode}
                                </span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <span className="mr-sm-12">Periode Akhir</span>
                              <div className="align-items-center">
                                <DatePicker
                                  readOnly={this.state.IsStartPeriodeHasValue}
                                  className="form-control"
                                  name="EndPeriode"
                                  selected={this.state.EndPeriode}
                                  onChange={(date) => {
                                    this.setState({ EndPeriode: date }, () => {
                                      this.onEndPeriodeChange(date);
                                    });
                                  }}
                                  dateFormat="dd/MM/yyyy"
                                  // showMonthYearPicker
                                />
                                <span style={{ color: "red" }}>
                                  {this.state.validationSearch.EndPeriode}
                                </span>
                              </div>
                            </div>
                          </div>
                        </FormGroup>
                        {!this.state.isDisabledMonday ? (
                          <FormGroup>
                            <div className="row">
                              <div className="col">
                                <div>
                                  <span>Senin :</span>
                                </div>
                                <div>
                                  <Select
                                    isMulti
                                    options={this.state.shiftDropdownOptions}
                                    value={this.state.selectedShiftMondayIds}
                                    onChange={this.onSelectMonday}
                                    //disabled={this.state.selectedShiftMonday == null ? true : false}
                                  ></Select>
                                </div>
                              </div>
                            </div>
                          </FormGroup>
                        ) : null}
                        {!this.state.isDisabledTuesday ? (
                          <FormGroup>
                            <div className="row">
                              <div className="col">
                                <div>
                                  <span>Selasa :</span>
                                </div>
                                <div>
                                  <Select
                                    isMulti
                                    options={this.state.shiftDropdownOptions}
                                    value={this.state.selectedShiftTuesdayIds}
                                    onChange={this.onSelectTuesday}
                                  ></Select>
                                </div>
                              </div>
                            </div>
                          </FormGroup>
                        ) : null}
                        {!this.state.isDisabledWednesday ? (
                          <FormGroup>
                            <div className="row">
                              <div className="col">
                                <div>
                                  <span>Rabu :</span>
                                </div>
                                <div>
                                  <Select
                                    isMulti
                                    options={this.state.shiftDropdownOptions}
                                    value={this.state.selectedShiftWednesdayIds}
                                    onChange={this.onSelectWednesday}
                                  ></Select>
                                </div>
                              </div>
                            </div>
                          </FormGroup>
                        ) : null}
                        {!this.state.isDisabledThursday ? (
                          <FormGroup>
                            <div className="row">
                              <div className="col">
                                <div>
                                  <span>Kamis :</span>
                                </div>
                                <div>
                                  <Select
                                    isMulti
                                    options={this.state.shiftDropdownOptions}
                                    value={this.state.selectedShiftThursdayIds}
                                    onChange={this.onSelectThursday}
                                  ></Select>
                                </div>
                              </div>
                            </div>
                          </FormGroup>
                        ) : null}
                        {!this.state.isDisabledFriday ? (
                          <FormGroup>
                            <div className="row">
                              <div className="col">
                                <div>
                                  <span>Jumat :</span>
                                </div>
                                <div>
                                  <Select
                                    isMulti
                                    options={this.state.shiftDropdownOptions}
                                    value={this.state.selectedShiftFridayIds}
                                    onChange={this.onSelectFriday}
                                  ></Select>
                                </div>
                              </div>
                            </div>
                          </FormGroup>
                        ) : null}
                        {!this.state.isDisabledSaturday ? (
                          <FormGroup>
                            <div className="row">
                              <div className="col">
                                <div>
                                  <span>Sabtu :</span>
                                </div>
                                <div>
                                  <Select
                                    isMulti
                                    options={this.state.shiftDropdownOptions}
                                    value={this.state.selectedShiftSaturdayIds}
                                    onChange={this.onSelectSaturday}
                                  ></Select>
                                </div>
                              </div>
                            </div>
                          </FormGroup>
                        ) : null}
                        {!this.state.isDisabledSunday ? (
                          <FormGroup>
                            <div className="row">
                              <div className="col">
                                <div>
                                  <span>Minggu :</span>
                                </div>
                                <div>
                                  <Select
                                    isMulti
                                    options={this.state.shiftDropdownOptions}
                                    value={this.state.selectedShiftSundayIds}
                                    onChange={this.onSelectSunday}
                                  ></Select>
                                </div>
                              </div>
                            </div>
                          </FormGroup>
                        ) : null}
                      </Modal.Body>
                      <Modal.Footer>
                        {this.state.isSubmitScheduleLoading ? (
                          <span>
                            <Spinner size="sm" color="primary" /> Mohon
                            tunggu...
                          </span>
                        ) : (
                          <div>
                            <Button
                              className="btn btn-success"
                              onClick={this.submitScheduleHandler}
                            >
                              Submit
                            </Button>
                          </div>
                        )}
                      </Modal.Footer>
                    </Modal>
                  </CardBody>
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
