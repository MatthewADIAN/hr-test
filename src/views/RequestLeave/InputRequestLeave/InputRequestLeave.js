import React, { Component } from 'react';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';

import Service from './../Service';
import swal from 'sweetalert';

import './style.css';


const moment = require('moment');
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const USER_BIASA = "User Biasa";
const days = ["Minggu,", "Senin,", "Selasa,", "Rabu,", "Kamis,", "Jum'at,", "Sabtu,"];
class InputRequestLeave extends Component {

  typeaheadEmployee = {};

  state = {
    loading: false,
    isAutoCompleteLoading: false,
    selectedUnitToCreate: null,
    selectedLeaderToCreate: null,
    selectedApplicantToCreate: null,
    selectedHourToCreate: "00",
    selectedMinuteToCreate: "00",
    startDateToCreate: null,
    endDateToCreate: null,
    isCreateLoading: false,
    isShowAddRequestModal: false,
    isShowDeleteRequestModal: false,
    isDeleteRequestLoading: false,

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
    selectedItem: null,

    requestLeave: {},
    isShowViewRequestModal: false,

    isShowRequestModal: false,
    isEditLoading: false,
    startDateToEdit: null,
    endDateToEdit: null,
    reasonLeaveToEdit: "",
    selectedLeaveTypeToEdit: [],

    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    userEmployeeIdentity: localStorage.getItem("nik"),
    validationCreateForm: {},
    validationEditForm: {},
    validationSearch: {},
    types: [],
    selectedLeaveTypeToCreate: [],
  }

  constructor(props) {
    super(props);
    this.service = new Service();
    this.handleEmployeeTypeahead = this.handleEmployeeTypeahead.bind(this);
    this.typeaheadEmployeeCreateForm = null
  }



  componentDidMount() {
    // this.setUnits();
    this.setData();

  }

  resetCreateModalValue = () => {
    this.setState({
      requestLeave: {},
      selectedLeaderToCreate: null,
      selectedApplicantToCreate: null,
      startDate: new Date(),
      endDate: new Date(),
      startDateToCreate: null,
      endDateToCreate: null,
      types: [],
      validationCreateForm: {},
      validationEditForm: {},
      validationSearch: {},

    })
  }

  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
      selectedUnit: null,
      selectedEmployee: null,
      validationSearch: {},
      startDate: new Date(),
      endDate: new Date(),
    })
  }


  setData = () => {
    if (this.state.userAccessRole == USER_BIASA) {
      this.getIndexByEmployeeIdentity();
    } else {
      this.getIndexByEmployeeId();
    }

  }

  getIndexByEmployeeId = () => {
    console.log('fad',this.state.startDate)
    console.log('fade',this.state.endDate)
    const params = {
      unitId: 0,
      employeeId: this.state.selectedEmployee ? this.state.selectedEmployee.Id : 0,
      page: this.state.activePage,
      startDate: this.state.startDate ? moment(this.state.startDate).format('YYYY-MM-DD') : "",
      endDate: this.state.endDate ? moment(this.state.endDate).format('YYYY-MM-DD') : "",
    };

    this.setState({ loadingData: true })
    this.service
      .getRequestLeave(params)
      .then((result) => {
        // console.log(result);
        this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
      });
  }

  getIndexByEmployeeIdentity = () => {
    const params = {
      unitId: this.state.userAccessRole == USER_BIASA ? this.state.userUnitId : this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
      page: this.state.activePage,
      startDate: this.state.startDate ? moment(this.state.startDate).format('YYYY-MM-DD') : "",
      endDate: this.state.endDate ? moment(this.state.endDate).format('YYYY-MM-DD') : "",
      employeeIdentity:this.state.userEmployeeIdentity,
    };

    this.setState({ loadingData: true })
    this.service
      .getRequestLeaveByEmployeeIdentity(params)
      .then((result) => {
        // console.log(result);
        this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
      });
  }
  setUnits = () => {
    this.setState({ loading: true })
    this.service
      .getAllUnits()
      .then((result) => {
        var units = [];
        result.map(s => {
          if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
            units.push(s);
          } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
            units.push(s);
          }
        });
        this.setState({ units: units, loading: false })
      });
  }

  setApplicant = () => {

    if (this.state.userAccessRole == USER_BIASA) {
      this.service.getEmployeeByEmployeeIdentity(this.state.userEmployeeIdentity)
        .then((result) => {
          this.setRequestLeaveType(result?.Id)
          this.setState({
            selectedApplicantToCreate: result
          })

        })
    }


  }

  handleEmployeeLeadSearchModal = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const params = {
      unitId: this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.selectedUnitToCreate ? this.state.selectedUnitToCreate.Id : 0 : 0,
      keyword: query,
      statusEmployee: "AKTIF",
      isLeadEmployee: true
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

  handleEmployeeSearchModal = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const params = {
      unitId: this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.selectedUnitToCreate ? this.state.selectedUnitToCreate.Id : 0 : 0,
      keyword: query,
      statusEmployee: "AKTIF",
      isLeadEmployee: false
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

  reset = () => {
    this.setState({
      startDate: new Date(),
      endDate: new Date()
    })

  }

  create = () => {
    this.showAddRequestModal(true);
    this.setApplicant()
  }


  showAddRequestModal = (value) => {
    this.resetCreateModalValue();
    this.setState({ isShowAddRequestModal: value });
  }

  showDeleteRequestModal = (value) => {
    this.setState({ isShowDeleteRequestModal: value });
  }

  showViewRequestModal = (value) => {
    this.setState({ isShowViewRequestModal: value });
  }

  showEditRequestModal = (value) => {
    this.setState({ isShowRequestModal: value, validationEditForm: {} });
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  }

  handleCreateRequest = () => {
    const payload = {
      UnitId: this.state.selectedApplicantToCreate?.UnitId,
      EmployeeId: this.state.selectedApplicantToCreate?.Id,
      EmployeeIdentity: this.state.selectedApplicantToCreate?.EmployeeIdentity,
      EmployeeLeaderId: this.state.selectedLeaderToCreate?.Id,
      StartDate: moment(this.state.startDateToCreate).format("YYYY-MM-DD"),
      EndDate: moment(this.state.endDateToCreate).format("YYYY-MM-DD"),
      ReasonLeave: this.state.ReasonLeave,
      LeaveTypeId: this.state.selectedLeaveTypeToCreate?.Id,
      EmployeeLeaderIdentity: this.state.selectedLeaderToCreate?.EmployeeIdentity,
    }


    this.setState({ isCreateLoading: true });
    if (payload.UnitId === undefined && payload.EmployeeId === undefined && payload.EmployeeIdentity === undefined && payload.EmployeeLeaderId === undefined
        && payload.StartDate === "Invalid date" && payload.EndDate === "Invalid date" && payload.ReasonLeave === undefined && payload.LeaveTypeId === undefined
        && payload.EmployeeLeaderIdentity === undefined) {
          this.setState({ isCreateLoading: false });
          swal({
            icon: 'error',
            title: 'Oops...',
            text: 'Harap isi semua field!'
          });
        }
        else {
          this.service.createRequestLeave(payload)
          .then((result) => {
            swal({
              icon: 'success',
              title: 'Good...',
              text: 'Data berhasil disimpan!'
            })

            this.setState({ isCreateLoading: false }, () => {
              this.handleEmployeeTypeahead()
              this.resetPagingConfiguration();
              this.setData();
              this.showAddRequestModal(true);
            });
          })
          .catch((error) => {
            if (error) {
              let message = "";
              if (error.Employee)
                message += `- ${error.Employee}\n`;

              if (error.EmployeeLeaderIdentity)
                message += `- ${error.EmployeeLeaderIdentity}\n`;

              if (error.EmployeeLeaderId)
                message += `- ${error.EmployeeLeaderId}\n`;

              if (error.Unit)
                message += `- ${error.Unit}\n`;

              if (error.LeaveType)
                message += `- ${error.LeaveType}\n`;

              if (error.StartDate)
                message += `- ${error.StartDate}\n`;

              if (error.EndDate)
              message += `- ${error.EndDate}\n`;

              if (error.PastDate)
              message += `- ${error.PastDate}\n`;

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
        }
  }

  handleEditRequest = () => {

    const payload = {
      UnitId: this.state.requestLeave?.UnitId,
      EmployeeId: this.state.requestLeave?.EmployeeId,
      StartDate: this.state.startDateToEdit,
      EndDate: this.state.endDateToEdit,
      LeaveTypeId: this.state.selectedLeaveTypeToEdit?.Id,
      ReasonLeave: this.state.reasonLeaveToEdit,
    }

    this.setState({ isEditLoading: true });
    this.service.editRequestLeave(this.state.requestLeave?.Id, payload)
      .then((result) => {
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil diubah!'
        })
        this.setState({ isEditLoading: false }, () => {

          this.resetPagingConfiguration();
          this.setData();
          this.showEditRequestModal(false);
        });
      })
      .catch((error) => {
        if (error) {
          let message = "";
          if (error.Employee)
            message += `- ${error.Employee}\n`;

          if (error.EmployeeLeaderIdentity)
            message += `- ${error.EmployeeLeaderIdentity}\n`;

          if (error.EmployeeLeaderId)
            message += `- ${error.EmployeeLeaderId}\n`;

          if (error.Unit)
            message += `- ${error.Unit}\n`;

          if (error.LeaveType)
            message += `- ${error.LeaveType}\n`;

          if (error.StartDate)
            message += `- ${error.StartDate}\n`;

          this.setState({ isCreateLoading: false, validationEditForm: error });
          swal({
            icon: 'error',
            title: 'Oops...',
            text: message
          });
        }
      });
  }

  handleViewRequestClick = (item) => {
    let startDate = moment(item.StartDate).format('YYYY-MM-DD');
    let endDate = moment(item.EndDate).format('YYYY-MM-DD');

    item.StartDate = startDate;
    item.EndDate = endDate;

    this.setState({ requestLeave: item }, () => {
      this.showViewRequestModal(true);
    })

  }

  handleEditRequestClick = (item) => {
    this.setState({
      selectedItem: item,
      requestLeave: item,
      reasonLeaveToEdit: item.ReasonLeave,
      startDateToEdit: moment(item.StartDate).format("YYYY-MM-DD"),
      endDateToEdit: moment(item.EndDate).format("YYYY-MM-DD"),

    }, () => {
      this.showEditRequestModal(true);
      this.setRequestLeaveType(item.employeeId)
    });
    // this.service.getRequestLeaveById(item.Id)
    //   .then((requestLeave) => {
    //     let startDate = moment(requestLeave.StartDate).format('YYYY-MM-DD');
    //     let endDate = moment(requestLeave.EndDate).format('YYYY-MM-DD');

    //     this.setState({ requestLeave: requestLeave, startDateToEdit: startDate, endDateToEdit: endDate }, () => {
    //       this.showEditRequestModal(true);
    //     })
    //   })
  }

  handleDeleteRequestClick = (item) => {
    this.setState({ selectedItem: item }, () => {
      this.showDeleteRequestModal(true);
    })
  }

  deleteRequestClickHandler = () => {
    this.setState({ isDeleteRequestLoading: true })
    this.service.deleteRequestLeave(this.state.selectedItem?.Id)
      .then((result) => {
        // console.log(result);
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil dihapus!'
        })
        this.setState({ isDeleteRequestLoading: false, selectedItem: null }, () => {
          this.resetPagingConfiguration();
          this.setData();
          this.showDeleteRequestModal(false);
        });
      })
  }
  handleEmployeeTypeahead() {

    this.typeaheadEmployeeCreateForm.clear();
  }

  setRequestLeaveType = (employeeId) => {
    let params = {
      EmployeeId: employeeId
    }
    this.service
      .getLeaveTypebyRequest(params)
      .then((result) => {
        this.setState({ types: result })
      });
  }


  render() {
    const { tableData } = this.state;


    const items = tableData.map((item, index) => {

      return (
        <tr key={item.Id} data-category={item.Id}>

          <td>{++index}</td>
          <td>{days[moment(item.StartDate).day()]} {moment(item.StartDate).format('DD/MM/YYYY')}</td>
          <td>{item.EmployeeIdentity}</td>
          <td>{item.EmployeeName}</td>
          <td>{item.UnitName}</td>
          <td>{item.LeaveTypeName}</td>
          <td>{item.StatusRequestName}</td>
          <td>
            <Form>
              <FormGroup>
                <RowButtonComponent className="btn btn-success" name="btn-view" onClick={this.handleViewRequestClick} data={item} iconClassName="fa fa-eye" label=""></RowButtonComponent>
                <RowButtonComponent className="btn btn-primary" name="btn-edit" onClick={this.handleEditRequestClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                {/* <RowButtonComponent className="btn btn-danger" name="btn-delete" onClick={this.handleDeleteRequestClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent> */}
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
                  <FormLabel>Periode</FormLabel>
                </Col>
                <Col sm={4}>
                  <Row>
                    <Col sm={5}>
                      <Input
                        type="date"
                        value={this.state.startDate}
                        onChange={((event) => {
                          let errors = this.state.validationSearch
                          if (errors?.StartDate) {
                            errors['StartDate'] = ""
                          }

                          this.setState({ startDate: event.target.value, validationSearch: errors });
                        })}
                        isInvalid={this.state.validationSearch.StartDate ? true : null}
                      />
                      <span className="text-danger">{this.state.validationSearch?.StartDate}</span>
                    </Col>
                    <Col sm={2} className={'text-center'}>s/d</Col>
                    <Col sm={5}>
                      <Input
                        type="date"
                        value={this.state.endDate}
                        onChange={((event) => {

                          let errors = this.state.validationSearch
                          if (errors?.EndDate) {
                            errors['EndDate'] = ""
                          }

                          if (errors?.InvalidDateRange) {
                            errors['InvalidDateRange'] = ""
                          }

                          this.setState({ endDate: event.target.value, validationSearch: errors });
                        })}

                      />
                      <span className="text-danger">{this.state.validationSearch?.EndDate}</span>
                      <span className="text-danger">{this.state.validationSearch?.InvalidDateRange}</span>

                    </Col>
                  </Row>
                </Col>
              </Row>
            </FormGroup>

            {/* if someday need filter by employee or employee Leader */}

            {/* <FormGroup>
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
              </FormGroup> */}

            <FormGroup>
              <Row>
                <Col sm={1}>
                </Col>
                <Col sm={11}>

                  <Button className="btn btn-default btn-sm mr-3" name="btn-reset" onClick={this.reset}>Reset</Button>
                  <Button className="btn btn-primary btn-sm mr-3" name="btn-search" onClick={this.search}>Cari</Button>
                  <Button className="btn btn-success btn-sm mr-3" name="btn-create" onClick={this.create}>Input Request Cuti</Button>
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
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>NIK</th>
                        <th>Nama</th>
                        <th>Unit</th>
                        <th>Jenis Cuti</th>
                        <th>Status Permohonan</th>
                        <th>/</th>
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

            <Modal dialogClassName="modal-100w" size="lg" aria-labelledby="modal-add-request" show={this.state.isShowAddRequestModal} onHide={() => this.showAddRequestModal(false)} animation={true}>
              <Modal.Header closeButton>
                <Modal.Title id="modal-add-request">Input Request Cuti</Modal.Title>
              </Modal.Header>
              <Modal.Body>

                <Row>
                  <Col sm={2}>
                    <Form.Label>NIK Pimpinan</Form.Label>
                  </Col>
                  <Col sm={10}>
                    <AsyncTypeahead
                      id="loader-employee-leader"
                      ref={(typeahead) => { this.typeaheadEmployeeCreateForm = typeahead }}
                      isLoading={this.state.isAutoCompleteLoading}
                      onChange={(selected) => {
                        let errors = this.state.validationCreateForm;
                        if (errors?.Employee) {
                          errors['Employee'] = ""
                        }
                        this.setState({ selectedLeaderToCreate: selected[0], validationCreateForm: errors });
                      }}
                      labelKey="NameAndEmployeeIdentity"
                      minLength={1}
                      onSearch={this.handleEmployeeLeadSearchModal}
                      options={this.state.employees}
                      placeholder="Cari Pimpinan karyawan..."
                    />
                    <span className="text-danger" >{this.state.validationCreateForm?.EmployeeLeaderId}</span>
                  </Col>

                </Row>

                <Row>
                  <Col sm={2}>
                    <Form.Label>NIK Pemohon</Form.Label>
                  </Col>
                  <Col sm={10}>
                    {this.state.userAccessRole == USER_BIASA ? (<>
                      <Input
                        type="text"
                        readOnly={true}
                        value={this.state.selectedApplicantToCreate?.EmployeeIdentity}
                      />

                    </>) : (
                      <AsyncTypeahead
                        id="loader-employee-applicant"
                        ref={(typeahead) => { this.typeaheadEmployeeCreateForm = typeahead }}
                        isLoading={this.state.isAutoCompleteLoading}
                        onChange={(selected) => {
                          let errors = this.state.validationCreateForm;
                          if (errors?.Employee) {
                            errors['Employee'] = ""
                          }
                          let employee = selected[0]
                          this.setRequestLeaveType(employee?.Id)
                          this.setState({ selectedApplicantToCreate: employee, validationCreateForm: errors });
                        }}
                        labelKey="NameAndEmployeeIdentity"
                        minLength={1}
                        onSearch={this.handleEmployeeSearchModal}
                        options={this.state.employees}
                        placeholder="Cari karyawan pemohon..."
                      />
                    )}

                    <span className="text-danger" >{this.state.validationCreateForm?.EmployeeLeaderIdentity}</span>
                    <span className="text-danger" >{this.state.validationCreateForm?.EmployeeLeaderId}</span>
                  </Col>

                </Row>


                <Row>
                  <Col sm={2}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col sm={10}>
                    <Form.Label>{this.state.selectedApplicantToCreate?.Name }</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={2}>
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col sm={10}>
                    <Form.Label>{this.state.selectedApplicantToCreate?.Unit || this.state.selectedApplicantToCreate?.UnitName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={2}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col sm={10}>
                    <Form.Label>{this.state.selectedApplicantToCreate?.Section || this.state.selectedApplicantToCreate?.SectionName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={2}>
                    <Form.Label>Group</Form.Label>
                  </Col>
                  <Col sm={10}>
                    <Form.Label>{this.state.selectedApplicantToCreate?.Group || this.state.selectedApplicantToCreate?.GroupName }</Form.Label>
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

                        <span className="text-danger" >{this.state.validationCreateForm?.PastDate}</span>
                        <span className="text-danger" >{this.state.validationCreateForm?.StartDate}</span>
                        <span className="text-danger" >{this.state.validationCreateForm?.DayOff}</span>
                        <span className="text-danger" >{this.state.validationCreateForm?.NoAvailableSchedule}</span>
                      </Col>

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

                        />
                        <span className="text-danger" >{this.state.validationCreateForm?.EndDate}</span><br />
                        <span className="text-danger" >{this.state.validationCreateForm?.InvalidDateRange}</span>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row>
                  <Col sm={2}>
                    Jenis Cuti
                    </Col>
                  <Col sm={10}>
                    <Select
                      className={this.state.validationCreateForm.Type ? 'invalid-select' : ''}
                      options={this.state.types}
                      value={this.state.selectedLeaveTypeToCreate}
                      defaultValue={this.state.selectedLeaveTypeToCreate}
                      onChange={(value) => {
                        this.setState({ selectedLeaveTypeToCreate: value });
                      }}>
                    </Select>
                  </Col>
                </Row>

                <Row>
                  <Col sm={2}>
                    Alasan cuti
                    </Col>
                  <Col sm={10}>
                    <Form.Control
                      type="text"
                      as="textarea"
                      name="description"
                      value={this.state.ReasonLeave}
                      onChange={(e) => {
                        return this.setState({ ReasonLeave: e.target.value });
                      }}
                    />
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                  <div>
                    <Button className="btn btn-success" name="create-request" onClick={this.handleCreateRequest}>Submit</Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal dialogClassName="modal-100w" size="lg" aria-labelledby="modal-view-request" show={this.state.isShowViewRequestModal} onHide={() => this.showViewRequestModal(false)} animation={true}>
              <Modal.Header closeButton>
                <Modal.Title id="modal-view-request">Detail Request Cuti</Modal.Title>
              </Modal.Header>
              <Modal.Body>

                <Row>
                  <Col sm={3}>
                    <Form.Label>NIK Pimpinan</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave.EmployeeLeaderIdentity}</Form.Label>
                  </Col>
                </Row>


                <Row>
                  <Col sm={3}>
                    <Form.Label>NIK Pemohon</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave.EmployeeIdentity}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Form.Label>Nama </Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave.EmployeeName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave.UnitName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave.SectionName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Form.Label>Group</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave.GroupName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Form.Label>Tanggal Cuti</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Row>
                      <Col className={'col-md-5'}>
                        <Form.Label>{days[moment(this.state.requestLeave?.StartDate).day()]} {moment(this.state.requestLeave.StartDate).format('DD/MM/YYYY')}</Form.Label>
                      </Col>
                      <Col className={'col-md-2 text-center'}>-</Col>
                      <Col className={'col-md-5'}>
                        <Form.Label>{days[moment(this.state.requestLeave?.EndDate).day()]} {moment(this.state.requestLeave.EndDate).format('DD/MM/YYYY')}</Form.Label>
                      </Col>
                    </Row>
                  </Col>
                </Row>


                <Row>
                  <Col sm={3}>
                    <Form.Label>Jenis Cuti</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave.LeaveTypeName}</Form.Label>
                  </Col>
                </Row>


                <Row>
                  <Col sm={3}>
                    <Form.Label>Alasan</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave.ReasonLeave}</Form.Label>
                  </Col>
                </Row>

              </Modal.Body>
            </Modal>

            <Modal aria-labelledby="modal-delete-request" show={this.state.isShowDeleteRequestModal} onHide={() => this.showDeleteRequestModal(false)} animation={true}>
              <Modal.Header closeButton>
                <Modal.Title id="modal-delete-request">Hapus Data Request</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
              <Modal.Footer>
                {this.state.isDeleteRequestLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                  <div>
                    <Button className="btn btn-danger" name="delete-request" onClick={this.deleteRequestClickHandler}>Hapus</Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal dialogClassName="modal-100w" size={'lg'} aria-labelledby="modal-edit-request" show={this.state.isShowRequestModal} onHide={() => this.showEditRequestModal(false)} animation={true}>
              <Modal.Header closeButton>
                <Modal.Title id="modal-edit-request">Edit Request Cuti</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={3}>
                    <Form.Label>NIK Pimpinan</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave?.EmployeeLeaderIdentity}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Form.Label>NIK Pemohon</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave?.EmployeeIdentity}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave?.EmployeeName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave?.UnitName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave?.SectionName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Form.Label>Group</Form.Label>
                  </Col>
                  <Col sm={9}>
                    <Form.Label>{this.state.requestLeave?.GroupName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={3}>
                    <Form.Label>Tanggal Cuti</Form.Label>
                  </Col>
                  <Col sm={9}>
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
                  <Col sm={3}>
                    Jenis Cuti
                    </Col>
                  <Col sm={9}>
                    <Select
                      className={this.state.validationCreateForm.Type ? 'invalid-select' : ''}
                      options={this.state.types}
                      value={this.state.selectedLeaveTypeToEdit}
                      defaultValue={this.state.selectedLeaveTypeToEdit}
                      onChange={(value) => {
                        this.setState({ selectedLeaveTypeToEdit: value });
                      }}>
                    </Select>
                  </Col>
                </Row>

                <Row>
                  <Col sm={3}>
                    Alasan cuti
                    </Col>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      as="textarea"
                      name="description"
                      value={this.state.reasonLeaveToEdit}
                      onChange={(e) => {
                        return this.setState({ reasonLeaveToEdit: e.target.value });
                      }}
                    />
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                  <div>
                    <Button className="btn btn-success" name="btn-edit" onClick={this.handleEditRequest}>Submit</Button>
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

export default InputRequestLeave;
