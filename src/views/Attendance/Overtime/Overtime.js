import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';

import Service from './../Service';
import swal from 'sweetalert';

import TimeField from 'react-simple-timefield';

import './style.css';

const moment = require('moment');

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
class Overtime extends Component {

  typeaheadEmployee = {};

  state = {
    loading: false,
    isAutoCompleteLoading: false,

    types: [
      { value: "Lembur Hari Biasa INSIDENTIL", label: "Lembur Hari Biasa INSIDENTIL" },
      { value: "Lembur Hari Libur Bagian", label: "Lembur Hari Libur Bagian" },
      { value: "Lembur Hari Libur Resmi", label: "Lembur Hari Libur Resmi" },
    ],

    attendance: "",
    schedule: "",
    overtimeTotalHours: "",
    selectedUnitToCreate: null,
    selectedEmployeeToCreate: null,
    selectedHourToCreate: "00",
    selectedMinuteToCreate: "00",

    selectedTypeToCreate:
    {
      name: "Lembur Hari Biasa INSIDENTIL",
      value: "Lembur Hari Biasa INSIDENTIL",
      label: "Lembur Hari Biasa INSIDENTIL"
    }
    ,
    dateToCreate: null,
    dateToCreateUtc: new Date(),
    attendanceToCreate: null,
    isCreateLoading: false,
    isShowAddOvertimeModal: false,

    isShowDeleteOvertimeModal: false,
    isDeleteOvertimeLoading: false,

    selectedUnit: null,
    units: [],

    selectedEmployee: null,
    employees: [],

    // minimum date value js
    startDate: "",
    endDate: "",

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],
    selectedOvertime: null,

    hours: [],
    minutes: [],

    overtime: {},

    isShowViewOvertimeModal: false,

    isShowEditOvertimeModal: false,
    isEditLoading: false,
    selectedHourToEdit: "00",
    selectedMinuteToEdit: "00",
    selectedTypeToEdit: "",
    validationCreateForm: {},
    maxOvertimeToCreate: "00:00",

    startHour1: "00:00",
    endHour1: "00:00",
    startHour2: "00:00",
    endHour2: "00:00",
    totalHours: "00:00",
    totalHours1: "00:00",
    totalHours2: "00:00",
    breakTime: "00:30",

    startHour1ToEdit: "00:00:00",
    endHour1ToEdit: "00:00:00",
    startHour2ToEdit: "00:00:00",
    endHour2ToEdit: "00:00:00",

    breakTimeToEdit:"00:30:00",
    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),
  }

  resetCreateModalValue = () => {
    this.setState({
      attendance: "",
      schedule: "",
      overtime: "",
      //  selectedUnitToCreate: null,
      selectedEmployeeToCreate: null,
      selectedHourToCreate: "00",
      selectedMinuteToCreate: "00",
      selectedTypeToCreate: {
        name: "Lembur Hari Biasa INSIDENTIL",
        value: "Lembur Hari Biasa INSIDENTIL",
        label: "Lembur Hari Biasa INSIDENTIL"
      },
      dateToCreate: new Date(),
      dateToCreateUtc: new Date(),
      attendanceToCreate: null,
      startTimeToCreate: "00:00",
      maxOvertimeToCreate: "00,00",
      endTimeToCreate: "00:00",
      totalHours: "00:00",
      validationCreateForm: {},

      startHour1: "00:00",
      endHour1: "00:00",
      startHour2: "00:00",
      endHour2: "00:00",

      startHour1ToEdit: "00:00:00",
      endHour1ToEdit: "00:00:00",
      startHour2ToEdit: "00:00:00",
      endHour2ToEdit: "00:00:00",

      breakTime: "00:30:00",
    })

  }

  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
      selectedUnit: null,
      selectedEmployee: null,
      startDate: moment().subtract(1, 'months').format('YYYY-MM-DD'),
      endDate: new Date(),

    })

  }

  constructor(props) {
    super(props);
    this.service = new Service();
    this.tanggalLemburRef = null;
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
    this.setData();
    this.setHours();
    this.setMinutes();
  }

  setData = () => {
    if(this.state.selectedUnit){
      const params = {
        unitId: this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
        employeeId: this.state.selectedEmployee ? this.state.selectedEmployee.Id : 0,
        page: this.state.activePage,
        startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
        endDate: moment(this.state.endDate).format('YYYY-MM-DD')
      };

      this.setState({ loadingData: true })
      this.service
        .getOvertime(params)
        .then((result) => {
          this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
        });
    }
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

  handleEmployeeSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });
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
          this.setState({ isAutoCompleteLoading: false });
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
          employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} - ${employee.Name}`;
          return employee;
        });
        this.setState({ employees: result }, () => {
          this.setState({ isAutoCompleteLoading: false });
        });
      });
  }

  search = () => {
    if(this.state.selectedUnit)
      this.setData();
    else{
      swal({
        icon: 'error',
        title: 'Oops...',
        text: 'Unit harus dipilih'
      });
    }
  }

  create = () => {
    this.showAddOvertimeModal(true);
  }

  showAddOvertimeModal = (value) => {
    this.resetCreateModalValue();
    this.setState({ isShowAddOvertimeModal: value });
  }

  showDeleteOvertimeModal = (value) => {
    this.setState({ isShowDeleteOvertimeModal: value });
  }

  showViewOvertimeModal = (value) => {
    this.setState({ isShowViewOvertimeModal: value });
  }

  showEditOvertimeModal = (value) => {
    this.setState({ isShowEditOvertimeModal: value, validationCreateForm: {} });
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  }

  handleCreateOvertime = () => {

    const payload = {
      UnitId: this.state.selectedUnitToCreate?.Id,
      EmployeeId: this.state.selectedEmployeeToCreate?.Id,
      Date: this.state.dateToCreateUtc,
      AttendanceId: this.state.attendanceToCreate?.AttendanceId,
      TotalHours: this.state?.totalHours,
      // StartHour: this.state?.startTimeToCreate,
      // EndHour: this.state?.endTimeToCreate,
      Type: this.state.selectedTypeToCreate.value,
      BreakTime: this.state.breakTime,
      StartHour1: this.state.selectedTypeToCreate.value === 'Lembur Hari Libur Resmi' ?
                  this.state.attendanceStart
                  : this.state.startHour1,
      EndHour1: this.state.selectedTypeToCreate.value === 'Lembur Hari Libur Resmi' ?
                  this.state.attendanceEnd
                  : this.state.endHour1,
      StartHour2: this.state.startHour2,
      EndHour2: this.state.endHour2,
      MaxOvertime: this.state.maxOvertimeToCreate
    }
    console.log(payload);
    this.setState({ isCreateLoading: true });

    this.service.createOvertime(payload)
      .then(() => {
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil disimpan!'
        })
        this.setState({
          isCreateLoading: false,
          dateToCreateUtc: null,
          dateToCreate: null,
          attendance: "",
          schedule: "",
          overtimeTotalHours: "",
          attendanceToCreate: "",
          startHour1: "00:00",
          endHour1: "00:00",
          startHour2: "00:00",
          endHour2: "00:00",
          totalHours: "00:00",
          maxOvertimeToCreate:  "00,00",
          isDayOff: false,
          attendanceStart: "00:00",
          attendanceEnd: "00:00"
        }, () => {
          this.tanggalLemburRef.value = "";
          this.resetPagingConfiguration();
          this.setData();
          this.showAddOvertimeModal(false);
        });
      })
      .catch((error) => {
        this.setState({ isCreateLoading: false });
        if (error) {
          let message = "";
          if (error.Attendance)
            message += `- ${error.Attendance}\n`;

          if (error.Employee)
            message += `- ${error.Employee}\n`;

          if (error.Type)
            message += `- ${error.Type}\n`;

          if (error.Unit)
            message += `- ${error.Unit}\n`;

          if (error.TotalHours)
            message += `- ${error.TotalHours}\n`;

          if (error.Date)
            message += `- ${error.Date}\n`;

          if (error.StartHour1)
            message += `- ${error.StartHour1}\n`;

          if (error.EndHour1)
            message += `- ${error.EndHour1}\n`;

          if (error.StartHour2)
            message += `- ${error.StartHour2}\n`;

          if (error.EndHour2)
            message += `- ${error.EndHour2}\n`;


          if (error.InvalidTime)
            message += `- ${error.InvalidTime}\n`;

          if (error.MaxOvertime)
            message += `- ${error.MaxOvertime}\n`;

          this.setState({ isCreateLoading: false, validationCreateForm: error });

          swal({
            icon: 'error',
            title: 'Oops...',
            text: message
          });
        }

      });

  }

  handleEditOvertime = () => {
    const payload = {
      Id: this.state.selectedOvertime?.Id,
      BreakTime: this.state.breakTimeToEdit,
      UnitId: this.state.selectedOvertime?.UnitId,
      EmployeeId: this.state.selectedOvertime?.EmployeeId,
      MaxOvertime: this.state.selectedOvertime?.MaxOvertime,
      Date: this.state.selectedOvertime.Date,
      AttendanceId: this.state.selectedOvertime?.AttendanceId,
      TotalHours: this.state?.totalHours,
      StartHour: this.state?.startTimeToEdit,
      EndHour: this.state?.endTimeToEdit,
      Type: this.state.selectedTypeToEdit.value,
      StartHour1: this.state.selectedTypeToEdit.value === 'Lembur Hari Libur Resmi' ?
                  moment(this.state.selectedOvertime?.CheckIn).format('HH:mm')
                  : this.state.startHour1,
      EndHour1: this.state.selectedTypeToEdit.value === 'Lembur Hari Libur Resmi' ?
                  moment(this.state.selectedOvertime?.CheckOut).format('HH:mm')
                  : this.state.endHour1,
      StartHour2: this.state.selectedOvertime?.StartHour2,
      EndHour2: this.state.selectedOvertime?.EndHour2
    }

    console.log("payload update", payload);
    this.setState({ isEditLoading: true });
    this.service.editOvertime(this.state.selectedOvertime?.Id, payload)
      .then(() => {
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil diubah!'
        })
        this.setState({ isEditLoading: false }, () => {
          this.resetPagingConfiguration();
          this.setData();
          this.showEditOvertimeModal(false);
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

          if (error.InvalidTime)
            message += `- ${error.InvalidTime}\n`;

          if (error.MaxOvertime)
            message += `- ${error.MaxOvertime}\n`;

          this.setState({ isEditLoading: false, isCreatLoading: true, validationCreateForm: error });
          swal({
            icon: 'error',
            title: 'Oops...',
            text: message
          });

        }
      });
  }

  handleDateCreateFormChange = (value) => {
    this.setState({isSearchAttendanceLoading: true});
    const params = {
      employeeId: this.state.selectedEmployeeToCreate?.Id,
      date: this.state.dateToCreate
    };

    this.service.getAttendanceByEmployeeAndDate(params)
      .then((result) => {
        if (result) {
          const attendanceStart = moment(result.CheckIn).format('HH:mm');
          const attendanceEnd = moment(result.CheckOut).format('HH:mm');
          const scheduleStart = `${result.ShiftStartHour.toString().padStart(2, '0')}:${result.ShiftStartMinute.toString().padStart(2, '0')}`;
          const scheduleEnd = `${result.ShiftEndHour.toString().padStart(2, '0')}:${result.ShiftEndMinute.toString().padStart(2, '0')}`;

          let tempAttendanceStart = moment(attendanceStart, "HH:mm");
          let tempScheduleStart = moment(scheduleStart, "HH:mm");

          let diffStartDuration = moment.duration(tempScheduleStart.diff(tempAttendanceStart));
          let diffCheckin = parseInt(diffStartDuration.asMinutes())

          let tempTotalMinutes = 0;
          let tempStartHour1 = "00:00"
          let tempEndHour1 = "00:00"
          console.log("diffCheckin", diffCheckin)

          if (diffCheckin <= 0 || isNaN(diffCheckin)) {
            tempStartHour1 = "00:00"
            tempEndHour1 = "00:00";

          } else {
            tempTotalMinutes += diffCheckin
            tempStartHour1 = attendanceStart;
            tempEndHour1 = scheduleStart;
          }

          let tempAttendanceEnd = moment(attendanceEnd, "HH:mm");
          let tempScheduleEnd = moment(scheduleEnd, "HH:mm");
          let diffEndDuration = moment.duration(tempAttendanceEnd.diff(tempScheduleEnd));

          let diffCheckOut = parseInt(diffEndDuration.asMinutes())
          let tempStartHour2 = "00:00"
          let tempEndHour2 = "00:00"

          if (diffCheckOut <= 0 || isNaN(diffCheckOut)) {
            tempStartHour2 = "00:00"
            tempEndHour2 = "00:00";

          } else {
            tempTotalMinutes += diffCheckOut
            tempStartHour2 = scheduleEnd;
            tempEndHour2 = attendanceEnd;
          }

          let totalHours = "00:00";

          if (result.IsDayOff) {
            let diffDayOff = parseInt(moment.duration(tempAttendanceEnd.diff(tempAttendanceStart)).asMinutes());
            totalHours = this.convertMinutesToHours(diffDayOff);
          }
          else {
            totalHours = this.convertMinutesToHours(tempTotalMinutes)
          }

          // less than zero is overtime
          let overtime = "";
          if (result.CheckOutDifference < 0) {
            const difference = result.CheckOutDifference * -1;
            const hour = Math.floor(difference / 60);
            const minute = difference % 60;

            overtime = `${hour.toString().padStart(2, '0')} Jam ${minute.toString().padStart(2, '0')} Menit`;

          }

          const attendance = `${attendanceStart} - ${attendanceEnd}`;
          const schedule = `${scheduleStart} - ${scheduleEnd}`;
          this.setState({
            dateToCreateUtc: result.CheckIn,
            dateToCreate: this.state.dateToCreate,
            attendanceStart: attendanceStart,
            attendanceEnd: attendanceEnd,
            attendance: attendance,
            schedule: schedule,
            overtimeTotalHours: overtime,
            attendanceToCreate: result,
            startHour1: tempStartHour1,
            endHour1: tempEndHour1,
            startHour2: tempStartHour2,
            endHour2: tempEndHour2,
            totalHours: totalHours,
            maxOvertimeToCreate: totalHours,
            isSearchAttendanceLoading: false,
            isDayOff: result.IsDayOff
          });

        }
        else {
          this.setState({isSearchAttendanceLoading: false})
          this.setState({
            dateToCreateUtc: this.state.dateToCreate,
            dateToCreate: this.state.dateToCreate,
            attendance: null,
            schedule: null,
            overtimeTotalHours: "00:00",
            attendanceToCreate: null,
            startHour1: "00:00",
            endHour1: "00:00",
            startHour2: "00:00",
            endHour2: "00:00",
            totalHours: "00:00",
            maxOvertimeToCreate: "00,00",
            isSearchAttendanceLoading: false,
            isDayOff: false
          });

          swal({
              icon: 'error',
              title: 'Oops...',
              text: 'Tidak ada kehadiran atau belum checkout pada tanggal yang dipilih!'
          });
        }
      })
      .catch((err) => {
        this.setState({isSearchAttendanceLoading: false})
        this.setState({
          dateToCreateUtc: this.state.dateToCreate,
          dateToCreate: this.state.dateToCreate,
          attendance: null,
          schedule: null,
          overtimeTotalHours: "00:00",
          attendanceToCreate: null,
          startHour1: "00:00",
          endHour1: "00:00",
          startHour2: "00:00",
          endHour2: "00:00",
          totalHours: "00:00",
          maxOvertimeToCreate: "00,00",
          isSearchAttendanceLoading: false
        });

        swal({
            icon: 'error',
            title: 'Oops...',
            text: 'Tidak ada kehadiran atau belum checkout pada tanggal yang dipilih!'
        });
    });
  }

  convertMinutesToHours(n) {
    let num = n;
    let hours = (num / 60);
    let rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);
    var totalHour = rhours.toString().padStart(2, '0') + ":" + rminutes.toString().padStart(2, '0')

    return totalHour
  }


  handleViewOvertimeClick = (item) => {
    console.log(item);
    this.setState({ selectedOvertime: item, selectedIsDayOff: item.IsDayOff }, () => {

      this.showViewOvertimeModal(true);
    })
    // this.service.getOvertimeById(item.Id)
    //   .then((overtime) => {
    //     this.setState({ overtime: overtime }, () => {

    //       this.showViewOvertimeModal(true);
    //     })
    //   })

  }

  handleEditOvertimeClick = (item) => {

    console.log("item", item)
    let selectedTypeToEdit = {
      value: item.Type,
      label: item.Type
    }
    this.setState({
      selectedOvertime: item,

      startHour1ToEdit: item.StartHour1,
      endHour1ToEdit:item.EndHour1,
      startHour2ToEdit: item.StartHour2,
      endHour2ToEdit: item.EndHour2,

      breakTimeToEdit: item.BreakTime,
      selectedTypeToEdit: selectedTypeToEdit,
      totalHours: item.TotalHours,
      isDayOff: item.IsDayOff
    }, () => {
      this.showEditOvertimeModal(true);
    });


  }


  handleDeleteOvertimeClick = (item) => {
    this.setState({ selectedOvertime: item }, () => {
      this.showDeleteOvertimeModal(true);
    })
  }

  deleteOvertimeClickHandler = () => {
    this.setState({ isDeleteOvertimeLoading: true })
    this.service.deleteOvertime(this.state.selectedOvertime?.Id)
      .then(() => {

        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil dihapus!'
        })
        this.setState({ isDeleteOvertimeLoading: false, selectedOvertime: null }, () => {

          this.resetPagingConfiguration();
          this.setData();
          this.showDeleteOvertimeModal(false);
        });
      })
  }



  render() {
    const { tableData } = this.state;

    console.log("tableData", tableData)
    const items = tableData.map((item) => {



      return (
        <tr key={item.Id} data-category={item.Id}>

          <td>{item.DayOfWeek} {moment.utc(item.Date).local().format('DD/MM/YYYY')}</td>
          <td>{item.EmployeeIdentity}</td>
          <td>{item.EmployeeName}</td>
          <td>{item.UnitName}</td>
          <td>{item.GroupName}</td>
          <td>{item.SectionName}</td>
          <td>{moment(item.CheckIn).format("HH:mm")}</td>
          <td>{moment(item.CheckOut).format("HH:mm")}</td>
          <td>{item.ScheduleStart === "1.00:00:00" ? "00:00:00" : item.ScheduleStart}</td>
          <td>{item.ScheduleEnd === "1.00:00:00" ? "24:00:00" : item.ScheduleEnd}</td>
          <td>{item.BreakTime}</td>
          <td>{item.DiffWorkingTimeInFormat}</td>
          <td>{item.TotalHours}</td>


          {/*<td>{`${hours} Jam ${minutes} Menit`}</td>*/}
          <td>{item.Type}</td>
          <td>
            <span>

              <FormGroup>
                <RowButtonComponent className="btn btn-success" name="view-overtime"
                  onClick={this.handleViewOvertimeClick} data={item} iconClassName="fa fa-eye"
                  label=""></RowButtonComponent>
                <RowButtonComponent className="btn btn-primary" name="edit-overtime"
                  onClick={this.handleEditOvertimeClick} data={item}
                  iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                <RowButtonComponent className="btn btn-danger" name="delete-overtime"
                  onClick={this.handleDeleteOvertimeClick} data={item} iconClassName="fa fa-trash"
                  label=""></RowButtonComponent>
              </FormGroup>

            </span>

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
                  <Col sm={1} className={'text-right'}>
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
                  <Col sm={1} className={'text-right'}>
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
                          })} />
                      </Col>
                      <Col sm={2} className={'text-center'}>s/d</Col>
                      <Col sm={5}>
                        <Input
                          type="date"
                          value={this.state.endDate}
                          onChange={((event) => {
                            this.setState({ endDate: event.target.value });
                          })} />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col sm={1} className={'text-right'}>
                    <FormLabel>Karyawan</FormLabel>
                  </Col>
                  <Col sm={4}>
                    <AsyncTypeahead
                      clearButton
                      id="loader-employee"
                      ref={(typeahead) => {
                        this.typeaheadEmployee = typeahead
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
                    />
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col sm={1}>
                  </Col>
                  <Col sm={5}>
                    <Button className="btn btn-primary mr-5 btn-sm" name="search" onClick={this.search}>Cari</Button>
                    <Button className="btn btn-success mr-5 btn-sm" name="input-overtime" onClick={this.create}>Input Lembur</Button>

                  </Col>

                  <Col sm={6}></Col>

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
                            <th>Group</th>
                            <th>Seksi</th>
                            <th>Jam masuk</th>
                            <th>Jam Pulang</th>
                            <th>Jadwal Jam masuk</th>
                            <th>Jadwal Jam Pulang</th>
                            <th>Lama Istirahat Lembur</th>
                            <th>Waktu Kerja Lebih</th>
                            <th>Total Lembur</th>
                            <th>Jenis Lembur</th>
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

              <Modal dialogClassName="modal-90w" size={"lg"} aria-labelledby="modal-add-overtime"
                show={this.state.isShowAddOvertimeModal} onHide={() => this.showAddOvertimeModal(false)}
                animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-add-overtime">Tambah Lembur</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Unit</Form.Label>
                    </Col>
                    <Col>
                      <Select
                        isClearable={true}
                        options={this.state.units}
                        value={this.state.selectedUnitToCreate}
                        onChange={(value) => {
                          this.setState({ selectedUnitToCreate: value });
                        }}
                        className={this.state.validationCreateForm.Unit ? 'invalid-select' : ''}
                      >
                      </Select>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>NIK</Form.Label>
                    </Col>
                    <Col>

                      <AsyncTypeahead
                        id="loader-employee-create-form"
                        clearButton
                        ref={(typeahead) => {
                          this.typeaheadEmployeeCreateForm = typeahead

                        }}
                        isLoading={this.state.isAutoCompleteLoading}
                        onChange={(selected) => {
                          this.setState({ selectedEmployeeToCreate: selected[0] });
                        }}
                        value={this.state.selectedEmployeeToCreate}
                        labelKey="NameAndEmployeeIdentity"
                        minLength={1}
                        onSearch={this.handleEmployeeSearchModal}
                        options={this.state.employees}
                        placeholder="Cari karyawan..."
                        isInvalid={this.state.validationCreateForm.Employee ? true : null}

                      />


                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Nama</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedEmployeeToCreate?.Name}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Seksi</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedEmployeeToCreate?.Section}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Group</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedEmployeeToCreate?.Group}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Tanggal Lembur</Form.Label>
                    </Col>
                    <Col>

                      <Form.Control
                        type="date"
                        name="Date"
                        id="Date"
                        ref={(ref) => this.tanggalLemburRef = ref}
                        onChange={((event) => {
                          console.log('value',event.target.value);
                          this.setState({ dateToCreate: event.target.value });
                        })}
                        isInvalid={this.state.validationCreateForm.Date || this.state.validationCreateForm.Attendance ? true : null}>
                      </Form.Control>
                      <Form.Control.Feedback
                        type="invalid">{this.state.validationCreateForm.Date || this.state.validationCreateForm.Attendance}</Form.Control.Feedback>

                    </Col>
                        {!this.state.isSearchAttendanceLoading && <Button className="btn btn-success" name="create-overtime"
                        onClick={this.handleDateCreateFormChange}>Cari</Button>}
                        {this.state.isSearchAttendanceLoading && <div style={{paddingTop: 8}}>
                          <span>mohon tunggu..</span>
                        </div>}
                    <Col sm="2">
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Jadwal Karyawan</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>Absensi Karyawan</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>{this.state.schedule}</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.attendance}</Form.Label>
                    </Col>
                  </Row>

                  {this.state.isDayOff ? (
                  <Row></Row>
                  ) : (
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Waktu Kerja Lebih</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.overtimeTotalHours}</Form.Label>
                    </Col>
                  </Row>
                  )}

                  {this.state.isDayOff ? (
                  <Row></Row>
                  ) : (
                  <Row>
                    <Col sm={3}>
                      <Form.Label> Lembur Awal</Form.Label>
                    </Col>
                    <Col>
                      <Row>
                        <Col sm={4} className="mr-1">

                          <Form.Control
                            type="text"
                            name="startHour1"
                            id="startHour1"
                            value={this.state.startHour1}
                            readOnly={true}
                            isInvalid={this.state.validationCreateForm.starHour1 ? true : null}>
                          </Form.Control>
                          <Form.Control.Feedback
                            type="invalid">{this.state.validationCreateForm.StartHour1}</Form.Control.Feedback>

                        </Col>
                        <Col sm={2} className="text-center mr-1">
                          s/d
                      </Col>
                        <Col sm={4}>
                          <Form.Control
                            type="text"
                            name="endHour1"
                            id="endHour1"
                            value={this.state.endHour1}
                            readOnly={true}
                            isInvalid={this.state.validationCreateForm.endHour1 ? true : null}>
                          </Form.Control>
                          <Form.Control.Feedback
                            type="invalid">{this.state.validationCreateForm.endHour1}</Form.Control.Feedback>

                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  )}

                  {this.state.isDayOff ? (
                  <Row></Row>
                  ) : (
                  <Row>
                    <Col sm={3}>
                      <Form.Label> Lembur Akhir</Form.Label>
                    </Col>
                    <Col>
                      <Row>
                        <Col sm={4} className="mr-1">

                          <Form.Control
                            type="text"
                            name="startHour2"
                            id="startHour2"
                            value={this.state.startHour2}
                            readOnly={true}
                            isInvalid={this.state.validationCreateForm.startHour2 ? true : null}>
                          </Form.Control>
                          <Form.Control.Feedback
                            type="invalid">{this.state.validationCreateForm.startHour2}</Form.Control.Feedback>

                        </Col>
                        <Col sm={2} className="text-center mr-1">
                          s/d
                      </Col>
                        <Col sm={4}>
                          <Form.Control
                            type="text"
                            name="endHour2"
                            id="endHour2"
                            value={this.state.endHour2}
                            readOnly={true}
                            isInvalid={this.state.validationCreateForm.EndHour2 ? true : null}>
                          </Form.Control>
                          <Form.Control.Feedback
                            type="invalid">{this.state.validationCreateForm.EndHour2}</Form.Control.Feedback>

                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  )}

                  <Row>
                    <Col sm={3}>
                      <Form.Label>Total Jam Lembur</Form.Label>
                    </Col>
                    <Col>

                      <TimeField
                        name="totalHours"
                        id="totalHours"
                        value={this.state?.totalHours}
                        onChange={((event) => {
                          this.setState({ totalHours: event.target.value });

                        })}
                        style={{
                          border: '1px solid #666',
                          fontSize: 14,
                          width: 167,
                          padding: '5px 8px',
                          color: '#333',
                          borderRadius: 1
                        }}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>

                    </Col>
                    <Col>
                      <span
                        style={{ color: "red" }}>{this.state.validationCreateForm.TotalHours || this.state.validationCreateForm.MaxOvertime}</span>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Jenis Lembur</Form.Label>
                    </Col>
                    <Col>
                      <Select
                        className={this.state.validationCreateForm.Type ? 'invalid-select' : ''}
                        options={this.state.types}
                        value={this.state.selectedTypeToCreate}
                        defaultValue={this.state.selectedTypeToCreate}
                        onChange={(value) => {
                          this.setState({ selectedTypeToCreate: value });
                        }}>
                      </Select>

                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Lama Istirahat Lembur</Form.Label>
                    </Col>
                    <Col>
                      <Row>

                        <Col sm={4} className="mr-1">

                          <TimeField
                            name="breakTime"
                            id="breakTime"
                            value={this.state.breakTime}
                            onChange={((event) => {
                              this.setState({ breakTime: event.target.value });

                            })}
                            style={{
                              border: '1px solid #666',
                              fontSize: 14,
                              width: 167,
                              padding: '5px 8px',
                              color: '#333',
                              borderRadius: 1
                            }}
                          />
                        </Col>

                      </Row>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={3}>
                    </Col>
                    <Col>
                      <span style={{ color: "red" }}>{this.state.validationCreateForm.BreakTime || this.state.validationCreateForm.InvalidTime}</span>
                    </Col>
                  </Row>

                </Modal.Body>
                <Modal.Footer>
                  {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                    <div>
                      <Button className="btn btn-success" name="create-overtime"
                        onClick={this.handleCreateOvertime}>Submit</Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>

              <Modal dialogClassName="modal-90w" aria-labelledby="modal-view-overtime"
                show={this.state.isShowViewOvertimeModal} onHide={() => this.showViewOvertimeModal(false)}
                animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-view-overtime">Lihat Detail Lembur</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col>
                      <Form.Label>Unit</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.UnitName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>NIK</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.EmployeeIdentity}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Nama</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.EmployeeName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Seksi</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.SectionName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Group</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.GroupName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Tanggal Lembur</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{moment(this.state.selectedOvertime?.Date).format('DD/MM/YYYY')}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Jadwal Karyawan</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>Absensi Karyawan</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>
                        { this.state.selectedOvertime?.ScheduleStart === "1.00:00:00" ? "00:00:00" : this.state.selectedOvertime?.ScheduleStart}
                        -
                        {this.state.selectedOvertime?.ScheduleEnd === "1.00:00:00" ? "24:00:00" : this.state.selectedOvertime?.ScheduleEnd}
                      </Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{ moment(this.state.selectedOvertime?.CheckIn).format("hh:mm:ss")} - { moment(this.state.selectedOvertime?.CheckOut).format("hh:mm:ss")}</Form.Label>
                    </Col>
                  </Row>

                  {this.state.selectedIsDayOff ? (
                  <Row></Row>
                  ) : (
                  <Row>
                    <Col>
                      <Form.Label>Waktu Kerja Lebih</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.DiffWorkingTimeInFormat}</Form.Label>
                    </Col>
                  </Row>
                  )}

                  {this.state.selectedIsDayOff ? (
                  <Row></Row>
                  ) : (
                  <Row>
                    <Col>
                      <Form.Label>Jam Lembur Awal</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{`${this.state.selectedOvertime?.StartHour1} s/d ${this.state.selectedOvertime?.EndHour1}`}</Form.Label>
                    </Col>
                  </Row>
                  )}

                  {this.state.selectedIsDayOff ? (
                  <Row></Row>
                  ) : (
                  <Row>
                    <Col>
                      <Form.Label>Jam Lembur Akhir</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{`${this.state.selectedOvertime?.StartHour2} s/d ${this.state.selectedOvertime?.EndHour2}`}</Form.Label>
                    </Col>
                  </Row>
                  )}

                  <Row>
                    <Col>
                      <Form.Label>Total Lembur</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.TotalHours}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Jenis Lembur</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.Type}</Form.Label>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <Form.Label>Istirahat Lembur</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.BreakTime}</Form.Label>
                    </Col>
                  </Row>
                </Modal.Body>
              </Modal>

              <Modal aria-labelledby="modal-delete-overtime" show={this.state.isShowDeleteOvertimeModal}
                onHide={() => this.showDeleteOvertimeModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-delete-overtime">Hapus Data Lembur</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Apakah anda yakin ingin menghapus data ini?
              </Modal.Body>
                <Modal.Footer>
                  {this.state.isDeleteOvertimeLoading ? (
                    <span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                      <div>
                        <Button className="btn btn-danger" name="delete-overtime"
                          onClick={this.deleteOvertimeClickHandler}>Hapus</Button>
                      </div>
                    )}
                </Modal.Footer>
              </Modal>

              <Modal dialogClassName="modal-90w" size={"lg"} aria-labelledby="modal-edit-overtime"
                show={this.state.isShowEditOvertimeModal} onHide={() => this.showEditOvertimeModal(false)}
                animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-edit-overtime">Edit Lembur</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col>
                      <Form.Label>Unit</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.UnitName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>NIK</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.EmployeeIdentity}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Nama</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.EmployeeName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Seksi</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.SectionName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Group</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.GroupName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Tanggal Lembur</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{moment(this.state.selectedOvertime?.Date).format('DD/MM/YYYY')}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Jadwal Karyawan</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>Absensi Karyawan</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>
                        { this.state.selectedOvertime?.ScheduleStart === "1.00:00:00" ? "00:00:00" : this.state.selectedOvertime?.ScheduleStart}
                        -
                        {this.state.selectedOvertime?.ScheduleEnd === "1.00:00:00" ? "24:00:00" : this.state.selectedOvertime?.ScheduleEnd}
                      </Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{moment(this.state.selectedOvertime?.CheckIn).format("hh:mm:ss")} - {moment(this.state.selectedOvertime?.CheckOut).format("hh:mm:ss")}</Form.Label>
                    </Col>
                  </Row>

                  {this.state.isDayOff ? (
                  <Row></Row>
                  ) : (
                  <Row>
                    <Col>
                      <Form.Label>Waktu Kerja Lebih</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>{this.state.selectedOvertime?.DiffWorkingTimeInFormat}</Form.Label>
                    </Col>
                  </Row>
                  )}

                  {this.state.isDayOff ? (
                  <Row></Row>
                  ) : (
                  <Row>
                    <Col>
                      <Form.Label>Lembur Awal</Form.Label>
                    </Col>
                    <Col>
                      <Row>
                        <Col sm={4} className="mr-1">

                          <Form.Control
                            type="text"
                            name="startHour1"
                            id="startHour1"
                            value={this.state.startHour1ToEdit}
                            readOnly={true}
                            isInvalid={this.state.validationCreateForm.startHour1 ? true : null}>
                          </Form.Control>
                          <Form.Control.Feedback
                            type="invalid">{this.state.validationCreateForm.StartHour1}</Form.Control.Feedback>
                        </Col>
                        <Col sm={2} className="text-center mr-1">
                          s/d
                      </Col>
                        <Col sm={4}>

                          <Form.Control
                            type="text"
                            name="endHour1"
                            id="endHour1"
                            value={this.state.endHour1ToEdit}
                            readOnly={true}
                            isInvalid={this.state.validationCreateForm.endHour1 ? true : null}>
                          </Form.Control>
                          <Form.Control.Feedback
                            type="invalid">{this.state.validationCreateForm.endHour1}</Form.Control.Feedback>

                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  )}

                  {this.state.isDayOff ? (
                  <Row></Row>
                  ) : (
                  <Row>
                    <Col>
                      <Form.Label>Lembur Akhir</Form.Label>
                    </Col>
                    <Col>
                      <Row>
                        <Col sm={4} className="mr-1">

                          <Form.Control
                            type="text"
                            name="startHour2"
                            id="startHour2"
                            value={this.state.startHour2ToEdit}
                            readOnly={true}
                            isInvalid={this.state.validationCreateForm.startHour2 ? true : null}>
                          </Form.Control>
                          <Form.Control.Feedback
                            type="invalid">{this.state.validationCreateForm.startHour2}</Form.Control.Feedback>
                        </Col>
                        <Col sm={2} className="text-center mr-1">
                          s/d
                      </Col>
                        <Col sm={4}>

                          <Form.Control
                            type="text"
                            name="endHour2"
                            id="endHour2"

                            value={this.state.endHour2ToEdit}
                            readOnly={true}
                            isInvalid={this.state.validationCreateForm.EndHour2 ? true : null}>
                          </Form.Control>
                          <Form.Control.Feedback
                            type="invalid">{this.state.validationCreateForm.EndHour2}</Form.Control.Feedback>

                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  )}

                  <Row>
                    <Col>
                      <Form.Label>Total Lembur</Form.Label>
                    </Col>
                    <Col>

                      <TimeField
                        name="totalHours"
                        id="totalHours"
                        value={this.state?.totalHours}
                        onChange={((event) => {
                          let errors = this.state.validationCreateForm;
                          if (errors?.totalHours) {
                           errors['totalHours'] = ""
                          }

                          this.setState({ totalHours: event.target.value });
                          //  this.handleDateCreateFormChange(event.target.value);
                        })}
                        style={{
                          border: '1px solid #666',
                          fontSize: 14,
                          width: 167,
                          padding: '5px 8px',
                          color: '#333',
                          borderRadius: 1
                        }}
                      />
                      <span style={{ color: "red" }}>{this.state.validationCreateForm.totalHours}</span>

                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Label>Jenis Lembur</Form.Label>
                    </Col>
                    <Col>
                      <Select
                        className={this.state.validationCreateForm.Type ? 'invalid-select' : ''}
                        options={this.state.types}
                        value={this.state.selectedTypeToEdit}
                        onChange={(value) => {
                          this.setState({ selectedTypeToEdit: value });
                        }}>
                      </Select>
                    </Col>
                  </Row>

                  <Row>
                    <Col>
                      <Form.Label>Istirahat Lembur</Form.Label>
                    </Col>
                    <Col>
                      <TimeField
                        name="breakTime"
                        id="breakTime"
                        value={this.state.breakTimeToEdit}
                        onChange={((event) => {
                          this.setState({ breakTimeToEdit: event.target.value });

                        })}
                        style={{
                          border: '1px solid #666',
                          fontSize: 14,
                          width: 167,
                          padding: '5px 8px',
                          color: '#333',
                          borderRadius: 1
                        }}
                      />
                      <span style={{ color: "red" }}>{this.state.validationCreateForm.BreakTime || this.state.validationCreateForm.InvalidTime}</span>

                    </Col>
                  </Row>

                </Modal.Body>
                <Modal.Footer>
                  {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                    <div>
                      <Button className="btn btn-success" name="edit-overtime"
                        onClick={this.handleEditOvertime}>Submit</Button>
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

export default Overtime;
