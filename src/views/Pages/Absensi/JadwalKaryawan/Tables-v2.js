import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Spinner, InputGroup, InputGroupAddon, InputGroupText, Form, Button, FormGroup, Label, Input,FormFeedback,Jumbotron } from 'reactstrap';
import axios from 'axios';
import SelectSearch from 'react-select-search';
import $ from 'jquery';
import swal from 'sweetalert';
import DatePicker from "react-datepicker";
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import Select from 'react-select';
import { urlAbsen, urlBlob, appovedList, stateList, urlUser } from '../../../../Constant'
import * as CONST from '../../../../Constant'

import "react-datepicker/dist/react-datepicker.css";
import { Z_DEFAULT_STRATEGY } from 'zlib';

const moment = require('moment');
//Tidak digunakan lagi
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
      isDisabledSunday : false,
      
      selectedShiftMonday: null,
      isDisabledMonday : false,
      
      selectedShiftTuesday: null,
      isDisabledTuesday : false,
      
      selectedShiftWednesday: null,
      isDisabledWednesday : false,
      
      selectedShiftThursday: null,
      isDisabledThursday : false,
      
      selectedShiftFriday: null,
      isDisabledFriday : false,
      
      selectedShiftSaturday: null,
      isDisabledSaturday : false,

      selectedRentangDate : {},
      shiftDropdownOptions: [],
      rentangDateOptions:[],
      StartPeriode:null,
      EndPeriode: null,
      previewPeriode: []
      
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

        activePage: 1,
        page: 1,
        size: 10,
        total: 0,

        isAutoCompleteLoading: false,

        selectedShiftSunday: null,
        isDisabledSunday : false,
        
        selectedShiftMonday: null,
        isDisabledMonday : false,
        
        selectedShiftTuesday: null,
        isDisabledTuesday : false,
        
        selectedShiftWednesday: null,
        isDisabledWednesday : false,
        
        selectedShiftThursday: null,
        isDisabledThursday : false,
        
        selectedShiftFriday: null,
        isDisabledFriday : false,
        
        selectedShiftSaturday: null,
        isDisabledSaturday : false,
        isSubmitScheduleLoading: false,
        selectedRentangDate : {},
        shiftDropdownOptions: [],
        rentangDateOptions:[],
        showEditScheduleModal: false,
        monthYearPeriod:null,
        StartPeriode :null,
        EndPeriode:null,
        previewPeriode: []
    });
}
  componentDidMount() {
    this.setData();
    this.setShiftSchedules();
  }
  setShowEditScheduleModal = (value) => {
    this.setState({ showEditScheduleModal: value })
}
  setData = () => {
    this.setState({ loadingData: true });

    let query = `?page=${this.state.page}&size=${this.state.size}`;

    if (this.state.selectedUnit)
      query += "&unitId=" + this.state.selectedUnit.Id;

    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id;

    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id;

    if (this.state.selectedEmployee)
      query += "&employeeId=" + this.state.selectedEmployee.Id;

    axios({
      method: 'get',
      // url: CONST.URI_ATTENDANCE + CONST.GET_SCHEDULE + query,
      url: CONST.URI_ATTENDANCE + CONST.GET_SCHEDULE_COMPRESS_PERIODE + query,
      
      headers: { accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token') },
    }).then(data => {
      console.log(data);
      this.setState({ results: data.data.data, loading: false, loadingData: false, page: data.data.page, total: data.data.total});
    }).catch(err => {
      this.setState({ loading: false, loadingData: false });
    });
  }
  setDataSearch = () => {
    this.setState({ loadingData: true });

    let query = `?page=${this.state.page}&size=${this.state.size}`;

    if (this.state.selectedUnit)
      query += "&unitId=" + this.state.selectedUnit.Id;

    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id;

    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id;

    if (this.state.selectedEmployee)
      query += "&employeeId=" + this.state.selectedEmployee.Id;

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + CONST.GET_SCHEDULE + query,
      headers: { accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token') },
    }).then(data => {
      console.log(data);
      this.setState({ results: data.data.data, loading: false, loadingData: false, page: data.data.page, total: data.data.total,employeesToSet:data.data.data});
    }).catch(err => {
      this.setState({ loading: false, loadingData: false });
    });
  }
  onSelectMonday = (option) => {
    this.setState({ selectedShiftMonday: option })
    console.log(option);
}
submitScheduleHandler= (event) => {
  // let employeeIds = []
        this.setState({ isSubmitScheduleLoading: true })
        // console.log(this.state);
        // this.state.employeesToSet.map((v) => {
        //     employeeIds.push(v.Id)
        // })
        console.log(this.state);
        if(this.state.monthYearPeriod == null){
          swal("Tidak Dapat Tervalidasi", "Bulan Dan Tahun Kosong", "error").then((value) => {
            this.setState({ isSubmitScheduleLoading: false })
        });
        }else if(this.state.selectedRentangDate== null){
          swal("Tidak Dapat Tervalidasi", "Rentang Tanggal Belum Dipilih", "error").then((value) => {
            this.setState({ isSubmitScheduleLoading: false })
        });
        }else
        {
        let body = {
            "StartPeriod": this.state.selectedRentangDate&& this.state.selectedRentangDate.payload.StartPeriod? this.state.selectedRentangDate.payload.StartPeriod : 0,
            "EndPeriod":  this.state.selectedRentangDate&& this.state.selectedRentangDate.payload.EndPeriod? this.state.selectedRentangDate.payload.EndPeriod : 0,
            "ShiftScheduleSundayId": this.state.selectedShiftSunday && this.state.selectedShiftSunday.payload ? this.state.selectedShiftSunday.payload.Id : 0,
            "ShiftScheduleMondayId": this.state.selectedShiftMonday && this.state.selectedShiftMonday.payload ? this.state.selectedShiftMonday.payload.Id : 0,
            "ShiftScheduleTuesdayId": this.state.selectedShiftTuesday && this.state.selectedShiftTuesday.payload ? this.state.selectedShiftTuesday.payload.Id : 0,
            "ShiftScheduleWednesdayId": this.state.selectedShiftWednesday && this.state.selectedShiftWednesday.payload ? this.state.selectedShiftWednesday.payload.Id : 0,
            "ShiftScheduleThursdayId": this.state.selectedShiftThursday && this.state.selectedShiftThursday.payload ? this.state.selectedShiftThursday.payload.Id : 0,
            "ShiftScheduleFridayId": this.state.selectedShiftFriday && this.state.selectedShiftFriday.payload ? this.state.selectedShiftFriday.payload.Id : 0,
            "ShiftScheduleSaturdayId": this.state.selectedShiftSaturday && this.state.selectedShiftSaturday.payload ? this.state.selectedShiftSaturday.payload.Id : 0,
            "IsFiveDaysCycle": this.state.isFiveDaysCycle,
            // "Employees": employeeIds,
            "SearchUnitId": this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
            "SearchSectionId": this.state.selectedSection ? this.state.selectedSection.Id : 0,
            "SearchGroupId": this.state.selectedGroup ? this.state.selectedGroup.Id : 0,
            "SearchEmployeeId": this.state.selectedEmployee ? this.state.selectedEmployee.Id : 0,
            "Id": this.state.selectedRentangDate.payload.Id
        }

        axios({
            method: 'put',
            url: CONST.URI_ATTENDANCE + CONST.SET_SCHEDULE,
            // url: CONST.URI_ATTENDANCE + CONST.SET_SCHEDULE_PERIODE_SPLIT,
            headers: { accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token') },
            data: body
        }).then(data => {

            swal("Berhasil", "Jadwal berhasil di buat", "success").then((value) => {
                this.resetState();
            });
        }).catch(err => {
            if (err.response) {
                if (err.response.status == 400) {
                    var messages = "Cek Form Input untuk Input Data Valid";
                    if (err.response.data.error.PeriodeRange) {
                        messages = err.response.data.error.PeriodeRange;
                    }
                    else if (err.response.data.error.Periode) {
                        messages = err.response.data.error.Periode;
                    }
                    else if (err.response.data.error.StartPeriod) {
                        messages = err.response.data.error.StartPeriod;
                    }
                    swal("Tidak Dapat Tervalidasi", messages, "error").then((value) => {
                        this.setState({ isSubmitScheduleLoading: false })
                    });
                }
            }
            else {
                swal("Maaf", "Terjadi kesalahan, silakan coba lagi", "error").then((value) => {
                    this.setState({ isSubmitScheduleLoading: false })
                });
            }
        });
      }
}
onSelectTuesday = (option) => {
    this.setState({ selectedShiftTuesday: option })
    console.log(option);
}

onSelectWednesday = (option) => {
    this.setState({ selectedShiftWednesday: option })
    console.log(option);
}

onSelectThursday = (option) => {
    this.setState({ selectedShiftThursday: option })
    console.log(option);
}

onSelectFriday = (option) => {
    this.setState({ selectedShiftFriday: option })
    console.log(option);
}

onSelectSaturday = (option) => {
    this.setState({ selectedShiftSaturday: option })
    console.log(option);
}

onSelectSunday = (option) => {
    this.setState({ selectedShiftSunday: option })
    console.log(option);
}

  async onRentangDateSelect(value){
    // console.log(value);
    var values = await value;
    let datum = value.payload.ShiftScheduleMondayId;
    let selectMonday = {
        value: datum.Id,
        payload: datum,
        label: `${datum.Name} (${datum.StartHour.toString().padStart(2, '0')}.${datum.StartMinute.toString().padStart(2, '0')} - ${datum.EndHour.toString().padStart(2, '0')}.${datum.EndMinute.toString().padStart(2, '0')})`
    };
    datum = value.payload.ShiftScheduleTuesdayId;
    let selectTuesday = {
        value: datum.Id,
        payload: datum,
        label: `${datum.Name} (${datum.StartHour.toString().padStart(2, '0')}.${datum.StartMinute.toString().padStart(2, '0')} - ${datum.EndHour.toString().padStart(2, '0')}.${datum.EndMinute.toString().padStart(2, '0')})`
    };
    datum = value.payload.ShiftScheduleWednesdayId;
    let selectWednesday = {
        value: datum.Id,
        payload: datum,
        label: `${datum.Name} (${datum.StartHour.toString().padStart(2, '0')}.${datum.StartMinute.toString().padStart(2, '0')} - ${datum.EndHour.toString().padStart(2, '0')}.${datum.EndMinute.toString().padStart(2, '0')})`
    }
    datum = value.payload.ShiftScheduleThursdayId;
    let selectThursday = {
        value: datum.Id,
        payload: datum,
        label: `${datum.Name} (${datum.StartHour.toString().padStart(2, '0')}.${datum.StartMinute.toString().padStart(2, '0')} - ${datum.EndHour.toString().padStart(2, '0')}.${datum.EndMinute.toString().padStart(2, '0')})`
    }
    datum = value.payload.ShiftScheduleFridayId;
    let selectFriday = {
        value: datum.Id,
        payload: datum,
        label: `${datum.Name} (${datum.StartHour.toString().padStart(2, '0')}.${datum.StartMinute.toString().padStart(2, '0')} - ${datum.EndHour.toString().padStart(2, '0')}.${datum.EndMinute.toString().padStart(2, '0')})`
    }
    datum = value.payload.ShiftScheduleSaturdayId;
    let selectSaturday = {
        value: datum.Id,
        payload: datum,
        label: `${datum.Name} (${datum.StartHour.toString().padStart(2, '0')}.${datum.StartMinute.toString().padStart(2, '0')} - ${datum.EndHour.toString().padStart(2, '0')}.${datum.EndMinute.toString().padStart(2, '0')})`
    }
    datum = value.payload.ShiftScheduleSundayId;
    let selectSunday = {
        value: datum.Id,
        payload: datum,
        label: `${datum.Name} (${datum.StartHour.toString().padStart(2, '0')}.${datum.StartMinute.toString().padStart(2, '0')} - ${datum.EndHour.toString().padStart(2, '0')}.${datum.EndMinute.toString().padStart(2, '0')})`
    }
    this.setState(
      {
        selectedRentangDate:values, 
        selectedShiftMonday: selectMonday,
        selectedShiftTuesday : selectTuesday,
        selectedShiftWednesday : selectWednesday,
        selectedShiftThursday : selectThursday,
        selectedShiftFriday : selectFriday,
        selectedShiftSaturday : selectSaturday,
        selectedShiftSunday : selectSunday,
        isDisabledMonday : selectMonday.value === 0? true:false,
        isDisabledTuesday : selectMonday.value ==0? true:false,
        isDisabledWednesday : selectWednesday.value == 0? true:false,
        isDisabledThursday : selectThursday.value == 0? true:false,
        isDisabledFriday : selectFriday.value ==0? true:false,
        isDisabledSaturday : selectSaturday.value ==0? true:false,
        isDisabledSunday : selectSunday.value == 0? true:false
      });

      // console.log(selectMonday.value);
    console.log(this.state.selectedRentangDate);
  }
  onmonthYearPeriodSelect(date){
    this.setState({ monthYearPeriod : date})
    // console.log(this.state.monthYearPeriod);
    // console.log(date);
    let query = `?monthYear=${moment(date).format("YYYY-MM-DD")}`;

    if (this.state.selectedUnit)
      query += "&unitId=" + this.state.selectedUnit.Id;

    if (this.state.selectedSection)
      query += "&sectionId=" + this.state.selectedSection.Id;

    if (this.state.selectedGroup)
      query += "&groupId=" + this.state.selectedGroup.Id;

    if (this.state.selectedEmployee)
      query += "&employeeId=" + this.state.selectedEmployee.Id;

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + CONST.GET_SCHEDULE_BY_MONTHYEAR + query,
      headers: { accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token') },
    }).then(result => {
      // console.log(result);
      var data = result.data.map(datum => {
        return {
            value: datum.Id,
            payload: datum,
            label: `${moment(datum.StartPeriod).format("DD MMM").toString()} - ${moment(datum.EndPeriod).format("DD MMM").toString()}`
        }
    });
    // console.log(data);
      this.setState({ rentangDateOptions: data, loading: false, loadingData: false});
    }).catch(err => {
      this.setState({ loading: false, loadingData: false });
    });
  }
  onStartPeriodeChange(date){
    this.setState({StartPeriode: date})
  }
  onEndPeriodeChange(date){
    this.setState({EndPeriode: date})
  }

  setShiftSchedules = () => {
    this.setState({ loading: true });
    const url = `${CONST.URI_ATTENDANCE}schedules/shift-schedules?page=1&size=${2147483647}`;

    axios({
        method: 'GET',
        url: url,
        headers: { accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 },
    }).then(result => {
        var data = result.data.Data.map(datum => {
            return {
                value: datum.Id,
                payload: datum,
                label: `${datum.Name} (${datum.StartHour.toString().padStart(2, '0')}.${datum.StartMinute.toString().padStart(2, '0')} - ${datum.EndHour.toString().padStart(2, '0')}.${datum.EndMinute.toString().padStart(2, '0')})`
            }
        });

        this.setState({ shiftDropdownOptions: data });
        this.setState({ shiftSchedules: result.data.Data });
        this.setState({ loading: false });

    }).catch(err => {
        this.setState({ loading: false });
    });
}

  handleReset = async (event) => {
    this.typeaheadEmployee.getInstance().clear();
    this.typeaheadGroup.getInstance().clear();
    this.typeaheadSection.getInstance().clear();
    this.typeaheadUnit.getInstance().clear();
    this.setState({ selectedEmployee: null, selectedGroup: null, selectedSection: null, selectedUnit: null, employeesToSet:[], page: 0 });
  }

  handleSearch = async (event) => {
    this.setDataSearch();
  }

  handleUnitSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const url = `${CONST.URI_ATTENDANCE}units?keyword=${query}`;

    axios({
      method: 'GET',
      url: url,
      headers: { accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 },
    }).then(result => {
      let units = [];
      result.data.Data.map(datum => {
        units.push(datum)
      });

      this.setState({ units: units });
      this.setState({ isAutoCompleteLoading: false });
    }).catch(err => {
      this.setState({ isAutoCompleteLoading: false });
    });
  }

  handleGroupSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    let url = `${CONST.URI_ATTENDANCE}groups?keyword=${query}`;
    if(this.state.selectedSection){
      url =`${CONST.URI_ATTENDANCE}groups/by-section?keyword=${query}&sectionId=${this.state.selectedSection.Id}`
    }
    axios({
      method: 'GET',
      url: url,
      headers: { accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 },
    }).then(result => {
      let items = [];
      result.data.Data.map(datum => {
        items.push(datum)
      });

      this.setState({ groups: items });
      this.setState({ isAutoCompleteLoading: false });
    }).catch(err => {
      this.setState({ isAutoCompleteLoading: false });
    });
  }

  handleSectionSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    let url = `${CONST.URI_ATTENDANCE}sections?keyword=${query}`;
    if(this.state.selectedUnit)
    {
        let unitid = this.state.selectedUnit.Id;
        url =`${CONST.URI_ATTENDANCE}sections/by-unit?keyword=${query}&unitId=${unitid}`;
    }
    axios({
      method: 'GET',
      url: url,
      headers: { accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 },
    }).then(result => {
      let items = [];
      result.data.Data.map(datum => {
        items.push(datum)
      });

      this.setState({ sections: items });
      this.setState({ isAutoCompleteLoading: false });
    }).catch(err => {
      this.setState({ isAutoCompleteLoading: false });
    });
  }
  handleEdit = () => {
    if (this.state.selectedUnit == null)
        alert("Unit harus dipilih");
    else if(this.state.employeesToSet.length ==0)
        alert("pilih karyawan untuk di set jadwal");
    else
        this.setShowEditScheduleModal(true);
  }
  handleEmployeeSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    // const url = `${CONST.URI_ATTENDANCE}employees?keyword=${query}`;
    let unitId = (this.state.selectedUnit!= null)?this.state.selectedUnit.Id:0;
    let sectionId = (this.state.selectedSection!= null)?this.state.selectedSection.Id:0;
    let groupId = (this.state.selectedGroup!= null)?this.state.selectedGroup.Id:0;
    let url = `${CONST.URI_ATTENDANCE}employees?keyword=${query}`;

    if(unitId || sectionId || groupId)
    {
         url =`${CONST.URI_ATTENDANCE}employees/filter?keyword=${query}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}`;
    }

    axios({
      method: 'GET',
      url: url,
      headers: { accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 },
    }).then(result => {
      let items = [];
      result.data.data.map(datum => {
        items.push(datum)
      });

      this.setState({ employees: items });
      this.setState({ isAutoCompleteLoading: false });
    }).catch(err => {
      this.setState({ isAutoCompleteLoading: false });
    });
  }

  handlePageChange = async (pageNumber) => {
    await this.setState({ activePage: pageNumber, page: pageNumber });
    this.setData();
  }

  render() {
    const { results } = this.state;
    console.log("render");
    console.log(this);
    const renderresults = results.map((result, index) => {
      return (
        <tr key={result.Id} data-category={result.Id}>
          <td>{moment(result.StartPeriod).format("DD MMM").toString()} - {moment(result.EndPeriod).format("DD MMM").toString()}</td>
          <td>{result.EmployeeIdentity}</td>
          <td>{result.Firstname} {result.Lastname}</td>
          <td>{result.UnitName}</td>
          <td>{result.ShiftScheduleMondayName}</td>
          <td>{result.ShiftScheduleTuesdayName}</td>
          <td>{result.ShiftScheduleWednesdayName}</td>
          <td>{result.ShiftScheduleThursdayName}</td>
          <td>{result.ShiftScheduleFridayName}</td>
          <td>{result.ShiftScheduleSaturdayName}</td>
          <td>{result.ShiftScheduleSundayName}</td>
        </tr>
      );
    });

    const renderPeriodePreview = results.map((result, index) => {
      return (
        <tr key={result.Id} data-category={result.Id}>
          <td>{moment(result.StartPeriod).format("DD MMM").toString()} - {moment(result.EndPeriod).format("DD MMM").toString()}</td>
          {/* <td>{result.EmployeeIdentity}</td> */}
          {/* <td>{result.Firstname} {result.Lastname}</td> */}
          {/* <td>{result.UnitName}</td> */}
        </tr>
      );
    });
    return (
      <div>
        <div className="animated fadeIn">
          {this.state.loading ? (
            <span><Spinner size="sm" color="primary" /> Please wait...</span>
          ) : (
              <Row>
                <Col xs="12" lg="12">
                  <Form className="mb-5">
                    <Table className="borderless">
                      <tr>
                        <td>
                          <AsyncTypeahead
                            id="loader-unit"
                            ref={typeahead => this.typeaheadUnit = typeahead}
                            isLoading={this.state.isAutoCompleteLoading}
                            onChange={(selectedUnit) => {
                              this.setState({ selectedUnit: selectedUnit.lastItem });
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
                            ref={typeahead => this.typeaheadGroup = typeahead}
                            isLoading={this.state.isAutoCompleteLoading}
                            onChange={(selected) => {
                              this.setState({ selectedGroup: selected.lastItem });
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
                            ref={typeahead => this.typeaheadSection = typeahead}
                            isLoading={this.state.isAutoCompleteLoading}
                            onChange={(selected) => {
                              this.setState({ selectedSection: selected.lastItem });
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
                            ref={typeahead => this.typeaheadEmployee = typeahead}
                            isLoading={this.state.isAutoCompleteLoading}
                            onChange={(selected) => {
                              this.setState({ selectedEmployee: selected.lastItem });
                            }}
                            labelKey="Name"
                            minLength={1}
                            onSearch={this.handleEmployeeSearch}
                            options={this.state.employees}
                            placeholder="Cari karyawan..."
                            renderMenuItemChildren={(option, props) => (
                              <div>
                                <span>{option.Name}</span>
                              </div>
                            )}
                          />
                        
                        </td>
                      </tr>
                    </Table>

                    <FormGroup>
                      <div className="d-flex flex-row">
                        <div className="flex-fill">
                          <Button className="btn btn-secondary mr-2" name="reset" onClick={this.handleReset}>Reset</Button>
                          <Button className="btn btn-success mr-5" name="cari" onClick={this.handleSearch}>Cari</Button>
                          <Button className="btn btn-warning mr-5" name="edit-jadwal" onClick={this.handleEdit}>Edit Jadwal</Button>                          
                        </div>
                      </div>
                    </FormGroup>
                  </Form>
                  <Card>
                    <CardHeader>
                      <Row>
                        <Col>
                          <i className="fa fa-user" /> <b>&nbsp;Jadwal Karyawan</b>
                        </Col>
                      </Row>
                    </CardHeader>
                    <CardBody>
                      <Table id="myTable" responsive striped bordered>
                        <thead>
                          <tr>
                            <th>Periode</th>
                            <th>NIK</th>
                            <th>Nama Karyawan</th>
                            <th>Unit/Bagian</th>
                            <th>Senin</th>
                            <th>Selasa</th>
                            <th>Rabu</th>
                            <th>Kamis</th>
                            <th>Jumat</th>
                            <th>Sabtu</th>
                            <th>Minggu</th>
                            {/* <th>Action</th> */}
                          </tr>
                        </thead>
                        <tbody>{renderresults}</tbody>
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
                      
                      <Modal dialogClassName="modal-90w" size="lg" aria-labelledby="modal-edit-jadwal" show={this.state.showEditScheduleModal} onHide={() => this.setShowEditScheduleModal(false)} animation={true}>
                                    <Modal.Header closeButton>
                                        <Modal.Title id="modal-edit-jadwal">Ubah Jadwal</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                    <FormGroup>
                                      <div className="row">
                                        <div className="col-md-4"> 
                                            <span className="mr-sm-2">Periode Awal </span>
                                            <div className="d-flex flex-row align-items-center">
                                                {/* <DatePicker className="form-control" name="periodStart" selected={this.state.periodStart} onChange={(val) => this.handleDateChange("periodStart", val)} /> */}
                                                {/* <DatePicker
                                                  className="form-control"
                                                  name="monthYearPeriod"
                                                  selected={this.state.monthYearPeriod}
                                                  onChange={date => this.onmonthYearPeriodSelect(date)}
                                                  dateFormat="MM/yyyy"
                                                  showMonthYearPicker
                                                />
                                                 <FormFeedback>Harus Diisi</FormFeedback> */}
                                                  <DatePicker
                                                  className="form-control"
                                                  name="StartPeriode"
                                                  selected={this.state.StartPeriode}
                                                  onChange={date => this.onStartPeriodeChange(date)}
                                                  // dateFormat="MM/yyyy"
                                                  // showMonthYearPicker
                                                />
                                                 <FormFeedback>Harus Diisi</FormFeedback>
                                            </div>
                                          </div>
                                          <div className="col-md-4"> 
                                            <span className="mr-sm-12">Periode Akhir</span>
                                            <div className="align-items-center">
                                                {/* <Select
                                                    options={this.state.rentangDateOptions}
                                                    value={this.state.selectedRentangDate}
                                                    onChange={value => this.onRentangDateSelect(value)}>
                                                </Select> */}
                                                <DatePicker
                                                  className="form-control"
                                                  name="EndPeriode"
                                                  selected={this.state.EndPeriode}
                                                  onChange={date => this.onEndPeriodeChange(date)}
                                                  // dateFormat="MM/yyyy"
                                                  // showMonthYearPicker
                                                />
                                            </div>
                                          </div>
                                        </div>
                                        </FormGroup>
                                        <div className="row">
                                            <div className="col-md-8 ">
                                              <div className="row">
                                                <div className="col-md-12">
                                                  <h4>Periode Preview</h4>
                                                  </div>
                                              </div>
                                              <div className="row">
                                                <div className="col-md-12">
                                                  {this.state.selectedUnit != null? "Unit : "+ this.state.selectedUnit.Name :"Unit : Semua"}
                                                  </div>
                                                  <div className="col-md-12">
                                                  {this.state.selectedSection != null? "Seksi : "+ this.state.selectedSection.Name :"Seksi: Semua"}
                                                  </div>
                                                  <div className="col-md-12">
                                                  {this.state.selectedGroup != null? "Grup : "+ this.state.selectedGroup.Name :"Grup : Semua"}
                                                  </div>
                                              </div>
                                              <div className="row">
                                                <div className="col-md-12">
                                                  <Table size="sm" id="tablePeriode" responsive striped bordered>
                                                    <thead>
                                                      <tr>
                                                        <th>Periode</th>
                                                        {/* <th>NIK</th> */}
                                                        {/* <th>Nama Karyawan</th> */}
                                                        {/* <th>Unit/Bagian</th> */}
                                                        {/* <th>Action</th> */}
                                                      </tr>
                                                    </thead>
                                                    <tbody>{renderPeriodePreview}</tbody>
                                                  </Table>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="col-md-4 ">
                                            {!this.state.isDisabledMonday ?
                                              <FormGroup>
                                                  <div className="row">
                                                      <div className="col">
                                                          <div>
                                                              <span>Senin :</span>
                                                          </div>
                                                          <div>
                                                              <Select
                                                                  options={this.state.shiftDropdownOptions}
                                                                  value={this.state.selectedShiftMonday}
                                                                  onChange={this.onSelectMonday}
                                                                  disabled = {this.state.selectedShiftMonday == null ? true : false}
                                                                  >
                                                              </Select>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </FormGroup>
                                              :null
                                              }
                                              {!this.state.isDisabledTuesday ?
                                              <FormGroup>
                                                  <div className="row">
                                                      <div className="col">
                                                          <div>
                                                              <span>Selasa :</span>
                                                          </div>
                                                          <div>
                                                              <Select
                                                                  options={this.state.shiftDropdownOptions}
                                                                  value={this.state.selectedShiftTuesday}
                                                                  onChange={this.onSelectTuesday}>
                                                              </Select>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </FormGroup>
                                              :null
                                              }
                                              {!this.state.isDisabledWednesday ?
                                              <FormGroup>
                                                  <div className="row">
                                                      <div className="col">
                                                          <div>
                                                              <span>Rabu :</span>
                                                          </div>
                                                          <div>
                                                              <Select
                                                                  options={this.state.shiftDropdownOptions}
                                                                  value={this.state.selectedShiftWednesday}
                                                                  onChange={this.onSelectWednesday}>
                                                              </Select>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </FormGroup>
                                              :null
                                              }
                                              {!this.state.isDisabledThursday ?
                                              <FormGroup>
                                                  <div className="row">
                                                      <div className="col">
                                                          <div>
                                                              <span>Kamis :</span>
                                                          </div>
                                                          <div>
                                                              <Select
                                                                  options={this.state.shiftDropdownOptions}
                                                                  value={this.state.selectedShiftThursday}
                                                                  onChange={this.onSelectThursday}>
                                                              </Select>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </FormGroup>
                                              :null}
                                              {!this.state.isDisabledFriday ?
                                              <FormGroup>
                                                  <div className="row">
                                                      <div className="col">
                                                          <div>
                                                              <span>Jumat :</span>
                                                          </div>
                                                          <div>
                                                              <Select
                                                                  options={this.state.shiftDropdownOptions}
                                                                  value={this.state.selectedShiftFriday}
                                                                  onChange={this.onSelectFriday}>
                                                              </Select>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </FormGroup>
                                              :null}
                                              {!this.state.isDisabledSaturday ?
                                              <FormGroup>
                                                  <div className="row">
                                                      <div className="col">
                                                          <div>
                                                              <span>Sabtu :</span>
                                                          </div>
                                                          <div>
                                                              <Select
                                                                  options={this.state.shiftDropdownOptions}
                                                                  value={this.state.selectedShiftSaturday}
                                                                  onChange={this.onSelectSaturday}>
                                                              </Select>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </FormGroup>
                                              :null
                                              }
                                              {!this.state.isDisabledSunday ?
                                              <FormGroup>
                                                  <div className="row">
                                                      <div className="col">
                                                          <div>
                                                              <span>Minggu :</span>
                                                          </div>
                                                          <div>
                                                              <Select
                                                                  options={this.state.shiftDropdownOptions}
                                                                  value={this.state.selectedShiftSunday}
                                                                  onChange={this.onSelectSunday}>
                                                              </Select>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </FormGroup>
                                              :null
                                              }
                                            </div>
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        {this.state.isSubmitScheduleLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                            <div>
                                                <Button className="btn btn-success" onClick={this.submitScheduleHandler}>Submit</Button>
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
