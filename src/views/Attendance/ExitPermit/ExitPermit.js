import React, { Component } from 'react';
import { Input, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';


import Service from './../Service';
import swal from 'sweetalert';

import './style.css';
import { roundToNearestMinutes } from 'date-fns/fp';

const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
class ExitPermit extends Component {

  typeaheadEmployee = {};

  state = {
    loading: false,
    isAutoCompleteLoading: false,
    selectedUnitToCreate: null,
    selectedEmployeeToCreate: null,
    selectedHourToCreate: "00",
    selectedMinuteToCreate: "00",
    startDateToCreate: null,
    endDateToCreate: null,
    isCreateLoading: false,
    isShowAddExitPermitModal: false,
    isShowDeleteExitPermitModal: false,
    isDeleteExitPermitLoading: false,

    selectedUnit: null,
    units: [],   

    selectedEmployee: null,
    employees: [],

    // minimum date value js
    startDate: null,
    endDate: null,

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],
    selectedItem: null,

    exitpermit: {},
    isShowViewExitPermitModal: false,

    isShowExitPermitModal: false,
    isEditLoading: false,
    startDateToEdit: null,
    endDateToEdit: null,
    isHalfDayToEdit:false,

    isHalfDay: false,
    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    validationCreateForm: {},
    validationEditForm: {},
    validationSearch: {}
  }

  resetCreateModalValue = () => {
    this.setState({
     
      
      exitpermit: {},
      selectedEmployeeToCreate: null,
      startDate: null,
      endDate: null,
      startDateToCreate: null,
      endDateToCreate: null,
      validationCreateForm: {},
      validationEditForm: {},
      validationSearch: {},

      isHalfDay: false
    })
  }

  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
      selectedUnit: null,
      selectedEmployee: null,
      validationSearch: {},
      startDate: null,
      endDate: null
    })
  }

  constructor(props) {
    super(props);
    this.service = new Service();
    this.handleEmployeeTypeahead = this.handleEmployeeTypeahead.bind(this);
    this.typeaheadEmployeeCreateForm = null
  }

  

  componentDidMount() {
    this.setUnits();
    this.setData();
 
  }

  setData = () => {
    const params = {
      unitId: this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.userUnitId : this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
      employeeId: this.state.selectedEmployee ? this.state.selectedEmployee.Id : 0,
      page: this.state.activePage,
      startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.state.endDate).format('YYYY-MM-DD')
    };

    this.setState({ loadingData: true })
    this.service
      .getExitPermit(params)
      .then((result) => {
        // console.log(result);
        this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
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

  

  handleEmployeeSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const params = {
      unitId: this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.userUnitId : this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
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
      unitId: this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.userUnitId : this.state.selectedUnitToCreate ? this.state.selectedUnitToCreate.Id : 0,
      keyword: query,
      statusEmployee: "AKTIF"
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

  create = () => {
    this.showAddExitPermitModal(true);
  }

  createMany = () => {
    this.props.history.push('/attendance/many-exitpermit');

  }

  showAddExitPermitModal = (value) => {
    this.resetCreateModalValue();
    this.setState({ isShowAddExitPermitModal: value });
  }

  showDeleteExitPermitModal = (value) => {
    this.setState({ isShowDeleteExitPermitModal: value });
  }

  showViewExitPermitModal = (value) => {
    this.setState({ isShowViewExitPermitModal: value });
  }

  showEditExitPermitModal = (value) => {
    this.setState({ isShowExitPermitModal: value, validationEditForm: {} });
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  }

  handleCreateExitPermit = () => {
    const payload = {
      UnitId: this.state.selectedUnitToCreate?.Id,
      EmployeeId: this.state.selectedEmployeeToCreate?.Id,
      StartDate: this.state.startDateToCreate,
      EndDate: this.state.endDateToCreate,
      IsHalfDay: this.state.isHalfDay
    }

    this.setState({ isCreateLoading: true });
    this.service.createExitPermit(payload)
      .then((result) => {
        // console.log(result);
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil disimpan!'
        })

        this.setState({ isCreateLoading: false }, () => {
          this.handleEmployeeTypeahead()
          this.resetPagingConfiguration();
          this.setData();
          this.showAddExitPermitModal(true);
        });
      })
      .catch((error) => {
        if (error) {
          let message = "";
          if (error.NotSetNIK)
            message += `- ${error.NotSetNIK}\n`;

          if (error.NotSetUnit)
            message += `- ${error.NotSetUnit}\n`;

          if (error.InvalidDateRange)
            message += `- ${error.InvalidDateRange}\n`;

          if (error.StartDateHasNoValue)
            message += `- ${error.StartDateHasNoValue}\n`;

          if (error.EndDateHasNoValue)
            message += `- ${error.EndDateHasNoValue}\n`;

          if (error.InvalidDateRange)
            message += `- ${error.InvalidDateRange}\n`;

          this.setState({ isCreateLoading: false, validationCreateForm: error });
          swal({
            icon: 'error',
            title: 'Oops...',
            text: message
          });
        }
      });
    // console.log(payload);
  }

  handleEditExitPermit = () => {
    
    const payload = {
      UnitId: this.state.exitpermit?.UnitId,
      EmployeeId: this.state.exitpermit?.EmployeeId,
      StartDate: this.state.startDateToEdit,
      EndDate: this.state.endDateToEdit,
      IsHalfDay: this.state.exitpermit.isHalfDayToEdit ? true : false
    }

    this.setState({ isEditLoading: true });
    this.service.editExitPermit(this.state.selectedItem?.Id, payload)
      .then((result) => {
        // console.log(result);
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil diubah!'
        })
        this.setState({ isEditLoading: false }, () => {

          this.resetPagingConfiguration();
          this.setData();
          this.showEditExitPermitModal(false);
        });
      })
      .catch((error) => {
        if (error) {
          let message = "";
          if (error.NotSetNIK)
            message += `- ${error.NotSetNIK}\n`;

          if (error.StartDateHasNoValue)
            message += `- ${error.StartDateHasNoValue}\n`;

          if (error.NotSetUnit)
            message += `- ${error.NotSetUnit}\n`;

          if (error.EndDateHasNoValue)
            message += `- ${error.EndDateHasNoValue}\n`;

          if (error.InvalidDateRange)
            message += `- ${error.InvalidDateRange}\n`;

          this.setState({ isCreateLoading: false, validationEditForm: error });
          swal({
            icon: 'error',
            title: 'Oops...',
            text: message
          });
        }
      });
  }

  handleViewExitPermitClick = (item) => {
        let startDate = moment(item.StartDate).format('YYYY-MM-DD');
        let endDate = moment(item.EndDate).format('YYYY-MM-DD');

        item.StartDate = startDate;
        item.EndDate = endDate;

        this.setState({ exitpermit: item }, () => {
          this.showViewExitPermitModal(true);
        })
    
  }

  handleEditExitPermitClick = (item) => {
    this.setState({ selectedItem: item });
    this.service.getExitPermitById(item.Id)
      .then((exitpermit) => {
        let startDate = moment(exitpermit.StartDate).format('YYYY-MM-DD');
        let endDate = moment(exitpermit.EndDate).format('YYYY-MM-DD');
        
        this.setState({ exitpermit: exitpermit, startDateToEdit: startDate,isHalfDayToEdit:exitpermit.IsHalfDay, endDateToEdit: endDate }, () => {
          this.showEditExitPermitModal(true);
        })
      })
  }

  handleDeleteExitPermitClick = (item) => {
    this.setState({ selectedItem: item }, () => {
      this.showDeleteExitPermitModal(true);
    })
  }

  deleteExitPermitClickHandler = () => {
    this.setState({ isDeleteExitPermitLoading: true })
    this.service.deleteExitPermit(this.state.selectedItem?.Id)
      .then((result) => {
        // console.log(result);
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil dihapus!'
        })
        this.setState({ isDeleteExitPermitLoading: false, selectedItem: null }, () => {
          this.resetPagingConfiguration();
          this.setData();
          this.showDeleteExitPermitModal(false);
        });
      })
  }
  handleEmployeeTypeahead() {

    this.typeaheadEmployeeCreateForm.clear();
  }


  render() {
    const { tableData } = this.state;

    
    const items = tableData.map((item, index) => {
      var days = ["Minggu,","Senin,", "Selasa,", "Rabu,","Kamis,","Jum'at,","Sabtu,"];
      return (
        <tr key={item.Id} data-category={item.Id}>

          <td>{++index}</td>
          <td>{ days[moment(item.StartDate).day()]} {moment(item.StartDate).format('DD/MM/YYYY')}</td>
          <td>{item.EmployeeIdentity}</td>
          <td>{item.EmployeeName}</td>
          <td>{item.UnitName}</td>
          <td>{item.SectionName}</td>
          <td>{item.GroupName}</td>
          <td>{item.Code}</td>
          <td>{item.Type}</td>
          <td>
            <Form>
              <FormGroup>
                <RowButtonComponent className="btn btn-success" name="view-exitpermit" onClick={this.handleViewExitPermitClick} data={item} iconClassName="fa fa-eye" label=""></RowButtonComponent>
                <RowButtonComponent className="btn btn-primary" name="edit-exitpermit" onClick={this.handleEditExitPermitClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                <RowButtonComponent className="btn btn-danger" name="delete-exitpermit" onClick={this.handleDeleteExitPermitClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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
                            let errors =this.state.validationSearch
                            if (errors?.StartDate) {
                              errors['StartDate'] = ""
                            }

                            this.setState({ startDate: event.target.value ,validationSearch:errors });
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

                            let errors =this.state.validationSearch
                            if (errors?.EndDate) {
                              errors['EndDate'] = ""
                            }

                            if (errors?.InvalidDateRange) {
                              errors['InvalidDateRange'] = ""
                            }
                           
                            this.setState({ endDate: event.target.value, validationSearch:errors });
                          })}

                        />
                        <span className="text-danger">{this.state.validationSearch?.EndDate}</span>
                        <span className="text-danger">{this.state.validationSearch?.InvalidDateRange}</span>

                      </Col>
                    </Row>
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
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
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col sm={1}>
                  </Col>
                  <Col sm={11}>

                    <Button className="btn btn-primary btn-sm mr-3" name="search" onClick={this.search}>Cari</Button>
                    <Button className="btn btn-success btn-sm mr-3" name="input-exitpermit" onClick={this.create}>Input Ijin</Button>
                    <Button className="btn btn-success btn-sm mr-3" name="many-input-exitpermit" onClick={this.createMany}>Input Banyak Ijin</Button>
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
                            <th>Seksi</th>
                            <th>Group</th>
                            <th>Kode Izin</th>
                            <th>Jenis Izin</th>
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

              <Modal dialogClassName="modal-100w" aria-labelledby="modal-add-exitpermit" show={this.state.isShowAddExitPermitModal} onHide={() => this.showAddExitPermitModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-add-exitpermit">Tambah Ijin Keluar</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Unit</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Select
                        options={this.state.units}
                        value={this.state.selectedUnitToCreate}
                        onChange={(value) => {
                          let errors = this.state.validationCreateForm;
                          if (errors?.Unit) {
                            errors['Unit'] = ""
                          }
                          this.setState({ selectedUnitToCreate: value, validationCreateForm: errors });
                        }}>
                      </Select>
                      <span className="text-danger" >{this.state.validationCreateForm.NotSetUnit}</span>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>NIK</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <AsyncTypeahead
                        id="loader-employee-create-form"
                        ref={(typeahead) => { this.typeaheadEmployeeCreateForm = typeahead }}
                        isLoading={this.state.isAutoCompleteLoading}
                        onChange={(selected) => {
                          let errors = this.state.validationCreateForm;
                          if (errors?.Employee) {
                            errors['Employee'] = ""
                          }
                          this.setState({ selectedEmployeeToCreate: selected[0], validationCreateForm: errors });
                        }}
                        labelKey="NameAndEmployeeIdentity"
                        minLength={1}
                        onSearch={this.handleEmployeeSearchModal}
                        options={this.state.employees}
                        placeholder="Cari karyawan..."
                      />
                      <span className="text-danger" >{this.state.validationCreateForm?.NotSetNIK}</span>
                    </Col>

                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Nama</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Label>{this.state.selectedEmployeeToCreate?.Name}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Seksi</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Label>{this.state.selectedEmployeeToCreate?.Section}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Group</Form.Label>
                    </Col>
                    <Col sm={10}>
                      <Form.Label>{this.state.selectedEmployeeToCreate?.Group}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={2}>
                      <Form.Label>Tanggal Ijin</Form.Label>
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
                          <span className="text-danger" >{this.state.validationCreateForm?.StartDateHasNoValue}</span>
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
                            IsInvalid={roundToNearestMinutes}
                          />
                          <span className="text-danger" >{this.state.validationCreateForm?.EndDateHasNoValue}</span><br />
                          <span className="text-danger" >{this.state.validationCreateForm?.InvalidDateRange}</span>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                 
                  <Row>
                    <Col sm={2}>
                      Setengah Hari?
                    </Col>
                    <Col sm={8}>
                      <Form.Check
                        checked={this.state.isHalfDay}
                        onChange={(value) => {
                          this.setState({ isHalfDay: value.target.checked })
                        }}
                        size='sm'
                      />
                    </Col>
                  </Row>
                </Modal.Body>
                <Modal.Footer>
                  {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                    <div>
                      <Button className="btn btn-success" name="create-exit-permit" onClick={this.handleCreateExitPermit}>Submit</Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>

              <Modal dialogClassName="modal-100w"  aria-labelledby="modal-view-exitpermit" show={this.state.isShowViewExitPermitModal} onHide={() => this.showViewExitPermitModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-view-exitpermit">Lihat Detail Ijin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Unit</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.UnitName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>NIK</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.EmployeeIdentity}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Nama</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.EmployeeName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Seksi</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.SectionName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Group</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.GroupName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Tanggal Ijin</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Row>
                        <Col className={'col-md-5'}>
                          <Form.Label>{moment(this.state.exitpermit.StartDate).format('DD/MM/YYYY')}</Form.Label>
                        </Col>
                        <Col className={'col-md-2 text-center'}>-</Col>
                        <Col className={'col-md-5'}>
                          <Form.Label>{moment(this.state.exitpermit.EndDate).format('DD/MM/YYYY')}</Form.Label>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Code ijin</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.Code}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Jenis ijin</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.Type}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      Setengah Hari?
                    </Col>
                    <Col sm={9}>
                      <Form.Check
                        checked={this.state.exitpermit.IsHalfDay}
                        size='sm'
                        readOnly
                      />
                    </Col>
                  </Row>
                </Modal.Body>
              </Modal>

              <Modal aria-labelledby="modal-delete-exitpermit" show={this.state.isShowDeleteExitPermitModal} onHide={() => this.showDeleteExitPermitModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-delete-exitpermit">Hapus Data Ijin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                <Modal.Footer>
                  {this.state.isDeleteExitPermitLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                    <div>
                      <Button className="btn btn-danger" name="delete-exitpermit" onClick={this.deleteExitPermitClickHandler}>Hapus</Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>

              <Modal dialogClassName="modal-100w" size={'md'} aria-labelledby="modal-edit-permit" show={this.state.isShowExitPermitModal} onHide={() => this.showEditExitPermitModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-edit-permit">Edit Ijin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Unit</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.UnitName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>NIK</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.EmployeeIdentity}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Nama</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.EmployeeName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Seksi</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.SectionName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Group</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit.GroupName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Tanggal Ijin</Form.Label>
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
                      <Form.Label>Jenis Ijin</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit?.Type}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Kode Ijin</Form.Label>
                    </Col>
                    <Col sm={9}>
                      <Form.Label>{this.state.exitpermit?.Code}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      Setengah Hari?
                    </Col>
                    <Col sm={9}>
                      <Form.Check

                        checked={this.state.exitpermit.IsHalfDay}
                        onChange={(value) => {
                          var { exitpermit } = this.state;
                          exitpermit.IsHalfDay = value.target.checked;
                          this.setState({ exitpermit: exitpermit });
                        }}
                        size='sm'
                      />
                    </Col>
                  </Row>
                </Modal.Body>
                <Modal.Footer>
                  {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                    <div>
                      <Button className="btn btn-success" name="edit-permit" onClick={this.handleEditExitPermit}>Submit</Button>
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

export default ExitPermit;
