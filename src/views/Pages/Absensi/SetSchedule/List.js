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
import axios from "axios";
import $ from "jquery";
import swal from "sweetalert";
import Modal from "react-bootstrap/Modal";
import Select from "react-select";
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import "bootstrap/dist/css/bootstrap.min.css";
// import AsyncSelect from 'react-select/async';
import Autocomplete from "react-autocomplete";
import {
  urlAbsen,
  urlBlob,
  appovedList,
  stateList,
  urlUser,
} from "../../../../Constant";
import * as CONST from "../../../../Constant";

import "react-datepicker/dist/react-datepicker.css";
import { addYears, parseISO } from "date-fns";

var fileDownload = require("js-file-download");
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";
const moment = require("moment");
const SET_SCHEDULE_SHIFT_ITEM = "schedules/schedule-shift-item";
class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      selectedFile: null,
      showSetScheduleModal: false,
      uploadFileLoading: false,
      isShowComponent: true,

      shiftDropdownOptions: [],
      shiftSchedules: [],
      selectedShiftSunday: null,
      selectedShiftSundayIds: [],

      selectedShiftMonday: null,
      selectedShiftMondayIds: [],

      selectedShiftTuesday: null,
      selectedShiftTuesdayIds: [],

      selectedShiftWednesday: null,
      selectedShiftWednesdayIds: [],

      selectedShiftThursday: null,
      selectedShiftThursdayIds: [],

      selectedShiftFriday: null,
      selectedShiftFridayIds: [],

      selectedShiftSaturday: null,
      selectedShiftSaturdayIds: [],

      isFiveDaysCycle: false,

      employees: [],
      selectedEmployee: null,

      units: [],
      selectedUnit: null,

      sections: [],
      selectedSection: null,

      groups: [],
      selectedGroup: null,

      employeesToSet: [],

      activePage: 1,
      page: 1,
      size: 10,
      total: 0,

      userUnitId: localStorage.getItem("unitId"),
      userAccessRole: localStorage.getItem("accessRole"),

      isAutoCompleteLoading: false,

      periodStart: "",
      periodEnd: "",
      isSubmitScheduleLoading: false,
      flavourOptions: [
        { value: "vanilla", label: "Vanilla", rating: "safe" },
        { value: "chocolate", label: "Chocolate", rating: "good" },
        { value: "strawberry", label: "Strawberry", rating: "wild" },
        { value: "salted-caramel", label: "Salted Caramel", rating: "crazy" },
      ],
      checkBoxType: 0,
      otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),
      validationCreateForm: {},
      endPeriodReadonly: false
    };
  }

  resetState = () => {
    this.setState(
      {
        loading: false,
        selectedFile: null,
        isShowComponent: true,
        showSetScheduleModal: false,
        uploadFileLoading: false,

        selectedShiftSunday: null,
        selectedShiftMonday: null,
        selectedShiftTuesday: null,
        selectedShiftWednesday: null,
        selectedShiftThursday: null,
        selectedShiftFriday: null,
        selectedShiftSaturday: null,

        selectedShiftSundayIds: [],
        selectedShiftMondayIds: [],
        selectedShiftTuesdayIds: [],
        selectedShiftWednesdayIds: [],
        selectedShiftThursdayIds: [],
        selectedShiftFridayIds: [],
        selectedShiftSaturdayIds: [],

        employees: [],
        selectedEmployee: null,

        units: [],
        selectedUnit: null,

        sections: [],
        selectedSection: null,

        groups: [],
        selectedGroup: null,

        employeesToSet: [],

        activePage: 1,
        page: 1,
        size: 10,
        total: 0,

        isAutoCompleteLoading: false,

        periodStart: "",
        periodEnd: "",
        endPeriodReadonly: false,
        isSubmitScheduleLoading: false,
        validationCreateForm: {}
      },
      () => {
        this.typeaheadEmployee.getInstance().clear();
        this.typeaheadGroup.getInstance().clear();
        this.typeaheadSection.getInstance().clear();
        this.typeaheadUnit.getInstance().clear();
      }
    );
  };

  componentDidMount() {
    this.setShiftSchedules();
    this.setHiden();
  }

  setHiden = () => {
    if (UPAH == this.state.userAccessRole) {
      this.setState({ isShowComponent: false });
    }
  };
  
  setShiftSchedules = () => {
    this.setState({ loading: true });
    const url = `${CONST.URI_ATTENDANCE
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

  handleUnitSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let url = `${CONST.URI_ATTENDANCE}units?keyword=${query}&adminEmployeeId=${adminEmployeeId}`;

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

        result.data.Data.map((datum) => {
          if (
            (this.state.userAccessRole == PERSONALIA_BAGIAN ||
              this.state.userAccessRole == PIMPINAN ||
              this.state.userAccessRole == UPAH) && this.state.otherUnitId.includes(datum.Id)
          ) {
            units.push(datum);
          } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
            units.push(datum);
          }
        });

        this.setState({ units: units });
        this.setState({ isAutoCompleteLoading: false });
        this.setState({ section: [] });
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

  handleEmployeeSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    // const url = `${CONST.URI_ATTENDANCE}employees?keyword=${query}`;
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

  handleSearch = (event) => {
    if (
      this.state.selectedUnit ||
      this.state.selectedSection ||
      this.state.selectedGroup ||
      this.state.selectedEmployee
    ) {
      this.setState({ loadingData: true });
      const endpoint =
        this.state.checkBoxType === 0
          ? "schedules/employee-by-filter"
          : "schedules/employee-no-schedule-by-filter";

      var url = `${CONST.URI_ATTENDANCE}${endpoint}?size=${Number.MAX_SAFE_INTEGER}`;

      if (this.state.selectedGroup) {
        url += `&groupId=${this.state.selectedGroup.Id}`;
      }

      if (this.state.selectedEmployee) {
        url += `&employeeId=${this.state.selectedEmployee.Id}`;
      }

      if (this.state.selectedSection) {
        url += `&sectionId=${this.state.selectedSection.Id}`;
      }

      if (this.state.selectedUnit) {
        url += `&unitId=${this.state.selectedUnit.Id}`;
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
          let employees = [];
          result.data.map((datum) => {
            datum.checked = true;
            employees.push(datum);
          });
          this.setState({ employeesToSet: employees });
          this.setState({ loadingData: false });
        })
        .catch((err) => {
          this.setState({ loadingData: false });
        });
    } else {
      swal("Mohon untuk mengisi salah satu kolom filter");
    }
  };

  handlePeriodTypeChange = (event) => {
    const periodType = event.target.checked;

    if (periodType) {
      let date = new Date();
      date = addYears(date, 10);
      date.setHours(0,0,0,0);
      this.setState({ endPeriodReadonly: true, periodEnd: parseISO(date.toISOString()) });
    } else {
      this.setState({ endPeriodReadonly: false, periodEnd: "" });
    }
  }

  handleReset = (event) => {
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
    });
  };

  handleSet = () => {
    const checkedEmployee = this.state.employeesToSet.filter((d) => d.checked);
    if (
      this.state.employeesToSet.length === 0 ||
      checkedEmployee.length === 0
    ) {
      swal({
        icon: "error",
        title: "Oops...",
        text: "Tidak ada karyawan yang dipilih",
      });
    } else {
      this.setShowSetScheduleModal(true);
    }
  };

  setShowSetScheduleModal = (value) => {
    this.setState({ showSetScheduleModal: value, periodStart: "", periodEnd: "", endPeriodReadonly: false, validationCreateForm: {} });
  };

  submitScheduleHandler = (event) => {
    let employeeIds = [];
    this.setState({ isSubmitScheduleLoading: true });

    const checkedEmployee = this.state.employeesToSet.filter((d) => d.checked);
    checkedEmployee.map((v) => {
      employeeIds.push(v.Id);
    });

    let body = {
      StartPeriod: this.state.periodStart ? moment(this.state.periodStart).format("YYYY-MM-DD HH:mm:ss") : null,
      EndPeriod: this.state.periodEnd ? moment(this.state.periodEnd).format("YYYY-MM-DD HH:mm:ss") : null,
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
      SearchSectionId: this.state.selectedSection
        ? this.state.selectedSection.Id
        : 0,
      SearchGroupId: this.state.selectedGroup ? this.state.selectedGroup.Id : 0,
      SearchEmployeeId: this.state.selectedEmployee
        ? this.state.selectedEmployee.Id
        : 0,
    };

    axios({
      method: "post",
      url: CONST.URI_ATTENDANCE + SET_SCHEDULE_SHIFT_ITEM,
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
        });
      })
      .catch((err) => {
        if (err.response) {
          var messages = "Cek Form Input untuk Input Data Valid\n";
          const errorMessage = err.response.data.error
          Object.keys(errorMessage).forEach(e => {
            if (e && typeof errorMessage[e] == "string") {
              messages += `- ${errorMessage[e]}\n`
            }
          });
          swal("Tidak Dapat Tervalidasi", messages, "error").then((value) => {
            this.setState({ validationCreateForm: err.response.data.error, isSubmitScheduleLoading: false });
          });
        } else {
          swal("Maaf", "Terjadi kesalahan, silakan coba lagi", "error").then(
            (value) => {
              this.setState({ isSubmitScheduleLoading: false });
            }
          );
        }
      });

  };

  handleHourChange = (event) => {
    this.setState({ [`${event.target.name}`]: event.target.value });
  };

  handleDateChange = (name, value) => {
    this.setState({ [`${name}`]: value });
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

  // onSelectMonday = (option) => {
  //   console.log("option",option.length)
  //     this.setState({ selectedShiftMonday: option })
  //     console.log(option);
  // }
  //
  // onSelectTuesday = (option) => {
  //     this.setState({ selectedShiftTuesday: option })
  //     console.log(option);
  // }
  //
  // onSelectWednesday = (option) => {
  //     this.setState({ selectedShiftWednesday: option })
  //     console.log(option);
  // }
  //
  // onSelectThursday = (option) => {
  //     this.setState({ selectedShiftThursday: option })
  //     console.log(option);
  // }
  //
  // onSelectFriday = (option) => {
  //     this.setState({ selectedShiftFriday: option })
  //     console.log(option);
  // }
  //
  // onSelectSaturday = (option) => {
  //     this.setState({ selectedShiftSaturday: option })
  //     console.log(option);
  // }
  //
  // onSelectSunday = (option) => {
  //     this.setState({ selectedShiftSunday: option })
  //     console.log(option);
  // }

  isFiveDaysCycleCheckBoxHandle = (event) => {
    this.setState({ isFiveDaysCycle: event.target.checked });
  };

  isAllChecked = () => {
    const { employeesToSet } = this.state;

    if (employeesToSet.length > 0) {
      const checkedEmployee = employeesToSet.filter((d) => d.checked);
      return checkedEmployee.length === employeesToSet.length;
    }
    return false;
  };

  onClickPrimaryCheckbox = (e) => {
    const { employeesToSet } = this.state;

    if (employeesToSet.length > 0) {
      const checkedEmployee = employeesToSet.map((d) => {
        d.checked = e.target.checked;
        return d;
      });

      this.setState({ employeesToSet: checkedEmployee });
    }
  };

  onClickSecondaryCheckbox = (e) => {
    const { employeesToSet } = this.state;
    const eIndex = employeesToSet.findIndex((d) => d.Id == e.target.value);

    employeesToSet[eIndex].checked = !employeesToSet[eIndex].checked;
    this.setState({ employeesToSet: employeesToSet });
  };

  onTypeChange(event) {
    let value = parseInt(event.target.value);
    this.setState({
      checkBoxType: value,
      employeesToSet: [],
      activePage: 1,
      page: 1,
    });
  }

  render() {
    const { employeesToSet } = this.state;

    const items = employeesToSet.map((employee, index) => {
      return (
        <tr key={employee.Id} data-category={employee.Id}>
          <td className="text-center">
            <input
              value={employee.Id}
              type="checkbox"
              checked={employee.checked}
              onClick={this.onClickSecondaryCheckbox}
            />
          </td>
          <td>{employee.EmployeeIdentity}</td>
          <td>{employee.Firstname + " " + employee.Lastname}</td>
          <td>{employee.UnitName}</td>
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
                <Form>
                  <Table className="borderless">
                    <tr>
                      <td>
                        <AsyncTypeahead
                          id="loader-unit"
                          ref={(typeahead) => (this.typeaheadUnit = typeahead)}
                          isLoading={this.state.isAutoCompleteLoading}
                          onChange={(selectedUnit) => {
                            this.setState({
                              selectedUnit: selectedUnit[0],
                              selectedSection: null,
                            });
                          }}
                          labelKey="Name"
                          minLength={1}
                          onSearch={this.handleUnitSearch}
                          options={this.state.units}
                          placeholder="Cari unit..."
                        // renderMenuItemChildren={(option, props) => (
                        //     <div>
                        //         <span>{option.Name}</span>
                        //     </div>
                        // )}
                        />
                      </td>
                      <td>
                        <AsyncTypeahead
                          id="loader-group"
                          ref={(typeahead) => (this.typeaheadGroup = typeahead)}
                          isLoading={this.state.isAutoCompleteLoading}
                          onChange={(selected) => {
                            this.setState({ selectedGroup: selected[0] });
                          }}
                          labelKey="Name"
                          minLength={1}
                          onSearch={this.handleGroupSearch}
                          options={this.state.groups}
                          placeholder="Cari grup..."
                        // renderMenuItemChildren={(option, props) => (
                        //     <div>
                        //         <span>{option.Name}</span>
                        //     </div>
                        // )}
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
                            this.setState({ selectedSection: selected[0] });
                          }}
                          labelKey="Name"
                          minLength={1}
                          onSearch={this.handleSectionSearch}
                          options={this.state.sections}
                          placeholder="Cari Seksi..."
                        // renderMenuItemChildren={(option, props) => (
                        //     <div>
                        //         <span>{option.Name}</span>
                        //     </div>
                        // )}
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
                            this.setState({ selectedEmployee: selected[0] });
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

                  <FormGroup className="ml-2">
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
                    {this.state.isShowComponent && (
                      <Button
                        className="btn btn-warning mr-2 pull-right"
                        name="set_schedule"
                        onClick={this.handleSet}
                      >
                        Set Jadwal
                      </Button>
                    )}
                  </FormGroup>
                </Form>

                <Card className="ml-2">
                  <CardHeader>
                    <Row>
                      <Col>
                        <i className="fa fa-user" />{" "}
                        <b>&nbsp;Atur Jadwal Karyawan</b>
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
                            <th className="text-center">
                              <input
                                type="checkbox"
                                checked={this.isAllChecked()}
                                onClick={this.onClickPrimaryCheckbox}
                              />
                            </th>
                            <th>NIK</th>
                            <th>Nama Karyawan</th>
                            <th>Unit/Bagian</th>
                            {/* <th>Action</th> */}
                          </tr>
                        </thead>
                        <tbody>{items}</tbody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              </Col>

              <Modal
                dialogClassName="modal-90w"
                aria-labelledby="modal-set-jadwal"
                show={this.state.showSetScheduleModal}
                onHide={() => this.setShowSetScheduleModal(false)}
                animation={true}
              >
                <Modal.Header closeButton>
                  <Modal.Title id="modal-set-jadwal">Atur Jam</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <FormGroup>
                    <Row>
                      <Col sm={2}>
                        <span>Senin:</span>
                      </Col>
                      <Col sm={10}>
                        <Select
                          isMulti
                          name="monday"
                          className={this.state.validationCreateForm.ShiftScheduleMondayId ? 'invalid-select' : ''}
                          value={this.state.selectedShiftMondayIds}
                          options={this.state.shiftDropdownOptions}
                          onChange={this.onSelectMonday}
                          isInvalid={this.state.validationCreateForm.ShiftScheduleMondayId ? true : null}
                        />
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Col sm={2}>
                        <span>Selasa:</span>
                      </Col>
                      <Col sm={10}>
                        <Select
                          isMulti
                          name="tuesday"
                          className={this.state.validationCreateForm.ShiftScheduleTuesdayId ? 'invalid-select' : ''}
                          options={this.state.shiftDropdownOptions}
                          value={this.state.selectedShiftTuesdayIds}
                          onChange={this.onSelectTuesday}
                          isInvalid={this.state.validationCreateForm.ShiftScheduleTuesdayId ? true : null}
                        ></Select>
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Col sm={2}>
                        <span>Rabu:</span>
                      </Col>
                      <Col sm={10}>
                        <Select
                          isMulti
                          name="wednesday"
                          className={this.state.validationCreateForm.ShiftScheduleWednesdayId ? 'invalid-select' : ''}
                          options={this.state.shiftDropdownOptions}
                          value={this.state.selectedShiftWednesdayIds}
                          onChange={this.onSelectWednesday}
                          isInvalid={this.state.validationCreateForm.ShiftScheduleWednesdayId ? true : null}
                        ></Select>
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Col sm={2}>
                        <span>Kamis:</span>
                      </Col>
                      <Col sm={10}>
                        <Select
                          isMulti
                          name="thursday"
                          className={this.state.validationCreateForm.ShiftScheduleThursdayId ? 'invalid-select' : ''}
                          options={this.state.shiftDropdownOptions}
                          value={this.state.selectedShiftThursdayIds}
                          onChange={this.onSelectThursday}
                          isInvalid={this.state.validationCreateForm.ShiftScheduleThursdayId ? true : null}
                        ></Select>
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Col sm={2}>
                        <span>Jumat:</span>
                      </Col>
                      <Col sm={10}>
                        <Select
                          isMulti
                          name="friday"
                          className={this.state.validationCreateForm.ShiftScheduleFridayId ? 'invalid-select' : ''}
                          options={this.state.shiftDropdownOptions}
                          value={this.state.selectedShiftFridayIds}
                          onChange={this.onSelectFriday}
                          isInvalid={this.state.validationCreateForm.ShiftScheduleFridayId ? true : null}
                        ></Select>
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Col sm={2}>
                        <span>Sabtu:</span>
                      </Col>
                      <Col sm={10}>
                        <Select
                          isMulti
                          name="saturday"
                          className={this.state.validationCreateForm.ShiftScheduleSaturdayId ? 'invalid-select' : ''}
                          options={this.state.shiftDropdownOptions}
                          value={this.state.selectedShiftSaturdayIds}
                          onChange={this.onSelectSaturday}
                          isInvalid={this.state.validationCreateForm.ShiftScheduleSaturdayId ? true : null}
                        ></Select>
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Col sm={2}>
                        <span>Minggu:</span>
                      </Col>
                      <Col sm={10}>
                        <Select
                          isMulti
                          name="sunday"
                          className={this.state.validationCreateForm.ShiftScheduleSundayId ? 'invalid-select' : ''}
                          options={this.state.shiftDropdownOptions}
                          value={this.state.selectedShiftSundayIds}
                          onChange={this.onSelectSunday}
                          isInvalid={this.state.validationCreateForm.ShiftScheduleSundayId ? true : null}
                        ></Select>
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Label check>
                      Periode Tetap
                      <Input
                        className="mx-2"
                        type="checkbox"
                        name="isLate"
                        onChange={this.handlePeriodTypeChange}
                      />
                    </Label>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Col sm={2}>
                        <span className="mr-sm-2">Periode: </span>
                      </Col>
                      <Col sm={10}>
                        <div className="d-flex flex-row align-items-center">
                          <DatePicker
                            className={this.state.validationCreateForm.StartPeriod ? 'form-control is-invalid' : 'form-control'}
                            name="periodStart"
                            selected={this.state.periodStart}
                            minDate={moment().toDate()}
                            onChange={(val) =>
                              this.handleDateChange("periodStart", val)
                            }
                            isInvalid={this.state.validationCreateForm.StartPeriod ? true : null}
                          />
                          <span className="mx-3">s/d</span>
                          <DatePicker
                            className={this.state.validationCreateForm.EndPeriod ? 'form-control is-invalid' : 'form-control'}
                            name="periodEnd"
                            selected={this.state.periodEnd}
                            minDate={moment().toDate()}
                            readOnly={this.state.endPeriodReadonly}
                            onChange={(val) =>
                              this.handleDateChange("periodEnd", val)
                            }
                            isInvalid={this.state.validationCreateForm.EndPeriod ? true : null}
                          />
                        </div>
                      </Col>
                    </Row>
                  </FormGroup>
                  {/* <FormGroup check>
                                            <Label check><Input type="checkbox" name="isFiveDaysCycle" onChange={this.isFiveDaysCycleCheckBoxHandle} />Jadwal 5 harian</Label>
                                        </FormGroup> */}
                </Modal.Body>
                <Modal.Footer>
                  {this.state.isSubmitScheduleLoading ? (
                    <span>
                      <Spinner size="sm" color="primary" /> Mohon tunggu...
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

              {/*<Modal dialogClassName="modal-90w" aria-labelledby="modal-set-jadwal" show={this.state.showSetScheduleModal} onHide={() => this.setShowSetScheduleModal(false)} animation={true}>*/}
              {/*    <Modal.Header closeButton>*/}
              {/*        <Modal.Title id="modal-set-jadwal">Atur Jam</Modal.Title>*/}
              {/*    </Modal.Header>*/}
              {/*    <Modal.Body>*/}
              {/*        <FormGroup>*/}
              {/*          <Row>*/}
              {/*            <Col sm={2}>*/}
              {/*              <span>Senin :</span>*/}
              {/*            </Col>*/}
              {/*            <Col sm={8}>*/}
              {/*              <Select*/}
              {/*                options={this.state.shiftDropdownOptions}*/}
              {/*                value={this.state.selectedShiftMonday}*/}
              {/*                onChange={this.onSelectMonday}>*/}

              {/*              </Select>*/}
              {/*            </Col>*/}
              {/*            <Col sm={2}>*/}
              {/*              <Button className="btn btn-primary" name="add-items" onClick={this.addItems}>+</Button>*/}
              {/*            </Col>*/}
              {/*          </Row>*/}

              {/*        </FormGroup>*/}
              {/*        <FormGroup>*/}
              {/*            <div className="row">*/}
              {/*                <div className="col">*/}
              {/*                    <div>*/}
              {/*                        <span>Selasa :</span>*/}
              {/*                    </div>*/}
              {/*                    <div>*/}
              {/*                        <Select*/}
              {/*                            options={this.state.shiftDropdownOptions}*/}
              {/*                            value={this.state.selectedShiftTuesday}*/}
              {/*                            onChange={this.onSelectTuesday}>*/}
              {/*                        </Select>*/}
              {/*                    </div>*/}
              {/*                </div>*/}
              {/*            </div>*/}
              {/*        </FormGroup>*/}
              {/*        <FormGroup>*/}
              {/*            <div className="row">*/}
              {/*                <div className="col">*/}
              {/*                    <div>*/}
              {/*                        <span>Rabu :</span>*/}
              {/*                    </div>*/}
              {/*                    <div>*/}
              {/*                        <Select*/}
              {/*                            options={this.state.shiftDropdownOptions}*/}
              {/*                            value={this.state.selectedShiftWednesday}*/}
              {/*                            onChange={this.onSelectWednesday}>*/}
              {/*                        </Select>*/}
              {/*                    </div>*/}
              {/*                </div>*/}
              {/*            </div>*/}
              {/*        </FormGroup>*/}
              {/*        <FormGroup>*/}
              {/*            <div className="row">*/}
              {/*                <div className="col">*/}
              {/*                    <div>*/}
              {/*                        <span>Kamis :</span>*/}
              {/*                    </div>*/}
              {/*                    <div>*/}
              {/*                        <Select*/}
              {/*                            options={this.state.shiftDropdownOptions}*/}
              {/*                            value={this.state.selectedShiftThursday}*/}
              {/*                            onChange={this.onSelectThursday}>*/}
              {/*                        </Select>*/}
              {/*                    </div>*/}
              {/*                </div>*/}
              {/*            </div>*/}
              {/*        </FormGroup>*/}
              {/*        <FormGroup>*/}
              {/*            <div className="row">*/}
              {/*                <div className="col">*/}
              {/*                    <div>*/}
              {/*                        <span>Jumat :</span>*/}
              {/*                    </div>*/}
              {/*                    <div>*/}
              {/*                        <Select*/}
              {/*                            options={this.state.shiftDropdownOptions}*/}
              {/*                            value={this.state.selectedShiftFriday}*/}
              {/*                            onChange={this.onSelectFriday}>*/}
              {/*                        </Select>*/}
              {/*                    </div>*/}
              {/*                </div>*/}
              {/*            </div>*/}
              {/*        </FormGroup>*/}
              {/*        <FormGroup>*/}
              {/*            <div className="row">*/}
              {/*                <div className="col">*/}
              {/*                    <div>*/}
              {/*                        <span>Sabtu :</span>*/}
              {/*                    </div>*/}
              {/*                    <div>*/}
              {/*                        <Select*/}
              {/*                            options={this.state.shiftDropdownOptions}*/}
              {/*                            value={this.state.selectedShiftSaturday}*/}
              {/*                            onChange={this.onSelectSaturday}>*/}
              {/*                        </Select>*/}
              {/*                    </div>*/}
              {/*                </div>*/}
              {/*            </div>*/}
              {/*        </FormGroup>*/}
              {/*        <FormGroup>*/}
              {/*            <div className="row">*/}
              {/*                <div className="col">*/}
              {/*                    <div>*/}
              {/*                        <span>Minggu :</span>*/}
              {/*                    </div>*/}
              {/*                    <div>*/}
              {/*                        <Select*/}
              {/*                            options={this.state.shiftDropdownOptions}*/}
              {/*                            value={this.state.selectedShiftSunday}*/}
              {/*                            onChange={this.onSelectSunday}>*/}
              {/*                        </Select>*/}
              {/*                    </div>*/}
              {/*                </div>*/}
              {/*            </div>*/}
              {/*        </FormGroup>*/}
              {/*        <FormGroup>*/}
              {/*            <span className="mr-sm-2">Periode: </span>*/}
              {/*            <div className="d-flex flex-row align-items-center">*/}
              {/*                <DatePicker className="form-control" name="periodStart" selected={this.state.periodStart} onChange={(val) => this.handleDateChange("periodStart", val)} />*/}
              {/*                <span className="mx-3">s/d</span>*/}
              {/*                <DatePicker className="form-control" name="periodEnd" selected={this.state.periodEnd} onChange={(val) => this.handleDateChange("periodEnd", val)} />*/}
              {/*            </div>*/}
              {/*        </FormGroup>*/}
              {/*        /!* <FormGroup check>*/}
              {/*            <Label check><Input type="checkbox" name="isFiveDaysCycle" onChange={this.isFiveDaysCycleCheckBoxHandle} />Jadwal 5 harian</Label>*/}
              {/*        </FormGroup> *!/*/}
              {/*    </Modal.Body>*/}
              {/*    <Modal.Footer>*/}
              {/*        {this.state.isSubmitScheduleLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (*/}
              {/*            <div>*/}
              {/*                <Button className="btn btn-success" onClick={this.submitScheduleHandler}>Submit</Button>*/}
              {/*            </div>*/}
              {/*        )}*/}
              {/*    </Modal.Footer>*/}
              {/*</Modal>*/}
            </Row>
          )}
        </div>
      </div>
    );
  }
}

export default List;
