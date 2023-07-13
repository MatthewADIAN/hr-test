import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter, Alert } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../../react-components/RowButtonComponent';
import * as CONST from '../../../../Constant';
import axios from 'axios';
import Service from './../../Service';
import swal from 'sweetalert';

import './style.css';


var fileDownload = require('js-file-download');
const moment = require('moment');

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
class MultipleInput extends Component {

  typeaheadEmployee = {};

  state = {
    loading: false,

    postedData: {},

    selectedUnit: null,
    selectedSection: null,
    selectedGroup: null,

    startDate: "",
    endDate: "",

    size: 10,
    units: [],
    groups: [],
    sections: [],

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],
    submitLoading: false,
    validationSearch: {},
    selectedLeaveType: null,
    isCheckedAll: false,
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
      size: 10,
      tableData: [],
      startDate: "",
      endDate: "",
      postedData: {},
      selectedLeaveType: null
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
    this.setLeaveTypes();
    // this.setData();
  }

  getMasterLeave = () => {
    const params = {
      groupId: this.state.selectedGroup ? this.state.selectedGroup.Id : 0,
      sectionId: this.state.selectedSection ? this.state.selectedSection.Id : 0,
      unitId: this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.userUnitId : this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
      leaveTypeId: this.state.selectedLeaveType?.Id,
      startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.state.endDate).format('YYYY-MM-DD'),
      size: this.state.size,
      page: this.state.activePage,

    };

    this.setState({ loadingData: true })
    this.service
      .getMasterLeave(params)
      .then((result) => {

        var data = result.data;
        
        this.setState({ activePage: result.page, total: result.total, tableData: data, loadingData: false })

      }).catch((error) => {

      })

  }

  setData = () => {
    const params = {
      groupId: this.state.selectedGroup ? this.state.selectedGroup.Id : 0,
      sectionId: this.state.selectedSection ? this.state.selectedSection.Id : 0,
      unitId: this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.userUnitId : this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
      leaveTypeId: this.state.selectedLeaveType?.Id,
      startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.state.endDate).format('YYYY-MM-DD'),
      size: this.state.size,
      page: this.state.activePage,

    };

    this.setState({ loadingData: true })
    this.service
      .getMasterLeave(params)
      .then((result) => {

        var data = result.data;
        
        this.setState({ activePage: result.page, total: result.total, tableData: data, loadingData: false })

      }).catch((error) => {
        console.log(error);
      })

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

  setLeaveTypes = () => {
    this.setState({ loading: true })
    this.service
      .getAllLeaveTypes()
      .then((result) => {
        this.setState({ leaveTypes: result, loading: false })
      });
  }

  search = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { EndDate: "Tanggal Akhir Harus lebih Dari Tanggal Awal" } })
    }else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal mulai harus diisi" } })
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { EndDate: "Tanggal akhir harus diisi" } })
    }else if(this.state.selectedUnit?.Id == 0 || this.state.selectedUnit ==null){
      this.setState({ validationSearch: { Unit: "Unit harus diisi" } })
    }
    else if (this.state.selectedLeaveType == null) {
      this.setState({ validationSearch: { LeaveType: "Jenis cuti harus diisi" } })
    } else {
      this.getMasterLeave()
    }
  }

  setCheckedAll = () => {

    var isCheckedAll = this.state.isCheckedAll;
    const { tableData } = this.state;
    const items = tableData.map((item, index) => {

      return {
        EmployeeId: item.EmployeeId,
        EmployeeIdentity: item.EmployeeIdentity,
        EmployeeName: item.EmployeeName,
        EndDate: item.EndDate,
        GroupId: item.GroupId,
        GroupName: item.GroupName,
        Id: item.Id,
        IsHalfDay: item.IsHalfDay,
        IsSave: isCheckedAll,
        LastModifiedUtc: item.LastModifiedUtc,
        LeaveTypeCode: item.LeaveTypeCode,
        LeaveTypeId: item.LeaveTypeId,
        LeaveTypeName: item.LeaveTypeName,
        SectionId: item.SectionId,
        SectionName: item.SectionName,
        StartDate: item.StartDate,
        UnitId: item.UnitId,
        UnitName: item.UnitName,
      }
    });
    this.setState({ tableData: items })

  }

  handleSubmit = () => {
   
    var payload = {};

    var payloadData = this.state.tableData.filter(s => s.IsSave).map(s => {
      return {

        EmployeeId: s.EmployeeId,
        EmployeeName: s.EmployeeName,
        SectionId: s.SectionId,
        SectionName: s.SectionName,
        GroupName: s.GroupName,
        UnitName: s.UnitName,
        LeaveTypeId: s.LeaveTypeId,
        UnitId: s.UnitId,
        IsSave: s.IsSave,
        GroupId: s.GroupId,
        StartDate: s.StartDate,
        EndDate: s.EndDate,

      };
    });
    payload.Data = payloadData;

    this.setState({ submitLoading: true });

    this.service.createManyLeave(payload)
      .then(() => {
        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil disimpan!'
        })
          .then((value) => {
            this.setState({ submitLoading: false }, () => {
              this.resetPagingConfiguration();
              this.props.history.push('/attendance/leave');
            })
          });


      })
      .catch((error) => {
        if (error) {
          let message = "";
          if (error.EmptyItems)
              message += `- ${error.EmptyItems}\n`;

          if (error.Items?.length > 0){
            message += `Items Error:\n`;

            error.Items.forEach(element => {
              if(element.InvalidRangeDate){
                message += `   -${element.InvalidRangeDate}\n`;
              }
            });
          }
              
          
             
          this.setState({ submitLoading: false });
          console.log("error",error);
          swal({
            icon: 'error',
            title: 'Oops...',
            text: message
          });
        }

      });
  }

  render() {
    const { tableData } = this.state;
    console.log("tableData", tableData)
    const items = tableData.map((item, index) => {

      return (
        <tbody key={index} data-category={index}>
          <tr>
            <td>{item.EmployeeIdentity}</td>
            <td>{item.EmployeeName}</td>
            <td>{item.SectionName}</td>
            <td>{item.GroupName}</td>
            <td>
              <Form.Group controlId="formBasicCheckbox">
                <Form.Check
                  type="checkbox"
                  id="selectedEmployee"
                  checked={item.IsSave}

                  value={item.IsSave}
                  onChange={((event) => {

                    const { tableData } = this.state;
                    var selectedData = tableData.find(s => s.Id === item.Id);
                    selectedData.IsSave = event.target.checked;
                    this.setState({ tableData: tableData });
                  })}
                />
              </Form.Group>

            </td>


          </tr>
        </tbody>
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
                    <FormLabel>Tanggal Ijin Cuti</FormLabel>
                  </Col>
                  <Col sm={5} >
                    <Row>
                    <Col sm={5}>
                        <Form.Control
                          type="date"
                          value={this.state.startDate}
                          onChange={((event) => {

                            let errors = this.state.validationCreateForm;
                          if (errors?.StartDate) {
                            errors['StartDate'] = ""
                          }
                            this.setState({ startDate: event.target.value,validationSearch:errors  });
                          })}
                          isInvalid={this.state.validationSearch?.StartDate} />
                        <Form.Control.Feedback type="invalid">{this.state.validationSearch?.StartDate}</Form.Control.Feedback>


                      </Col><Col sm={2}><span>sd</span></Col>
                      <Col sm={5}>

                        <Form.Control
                          type="date"

                          value={this.state.endDate}
                          onChange={((event) => {
                            let errors = this.state.validationCreateForm;
                            if (errors?.EndDate) {
                              errors['EndDate'] = ""
                            }
                            this.setState({ endDate: event.target.value,validationSearch:errors  });
                          })}
                          isInvalid={this.state.validationSearch?.EndDate} />
                        <Form.Control.Feedback type="invalid">{this.state.validationSearch?.EndDate}</Form.Control.Feedback>
                      </Col>
                    </Row>
                  </Col>

                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col sm={1} className={'text-left'}>
                    <FormLabel>Unit/Bagian</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Select
                      placeholder={'pilih unit'}
                      isClearable={true}
                      options={this.state.units}
                      value={this.state.selectedUnit}
                      onChange={(value) => {
                        if (value?.Id) {
                          this.setSectionsByUnit(value?.Id);
                        }

                        let errors = this.state.validationSearch;
                            if (errors?.Unit) {
                              errors['Unit'] = ""
                            }

                        this.setState({ selectedUnit: value });
                      }} />
                      <span className="text-danger">{this.state.validationSearch?.Unit}</span>
                  </Col>

                </Row>
              </FormGroup>
              <FormGroup>
                <Row>
                  <Col sm={1} className={'text-left'}>
                    <FormLabel>Seksi</FormLabel>
                  </Col>
                  <Col sm={5}>
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
                  <Col sm={1} className={'text-left'}>
                    <FormLabel>Group</FormLabel>
                  </Col>
                  <Col sm={5}>
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
                  <Col sm={1} className={'text-left'}>
                    <FormLabel>Jenis Cuti</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Select required
                      placeholder={'pilih jenis cuti'}
                      isClearable={true}
                      options={this.state.leaveTypes}
                      value={this.state.selectedLeaveType}
                      onChange={(value) => {
                        let errors = this.state.validationSearch;
                            if (errors?.LeaveType) {
                              errors['LeaveType'] = ""
                            }
                        this.setState({ selectedLeaveType: value ,validationSearch:errors  });
                      }} />

                    <span className="text-danger">{this.state.validationSearch?.LeaveType}</span>

                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Row>
                  <Col sm={1}>
                  </Col>
                  <Col sm={5}>
                    <Button className="btn btn-sm btn-secondary mr-3" name="reset" onClick={this.resetPagingConfiguration}>Reset</Button>
                    <Button className="btn btn-sm btn-primary mr-3" name="search" onClick={this.search}>Cari</Button>
                  </Col>

                </Row>

              </FormGroup>

              <FormGroup>
                {this.state.loadingData ? (
                  <span><Spinner size="sm" color="primary" /> Loading Data...</span>
                ) : this.state.tableData.length <= 0 ? (<Row>
                  <Table id="test" responsive bordered striped >
                    <thead>
                      <tr>
                        <th>NIK</th>
                        <th>Nama</th>
                        <th>Seksi</th>
                        <th>Group</th>
                        <th>Pilih Semua
                      <Form.Group controlId="formBasicCheckbox">
                            <Form.Check
                              type="checkbox"
                              id="selectedEmployee"
                              value={this.state.isCheckedAll}

                              onChange={((event) => {
                                this.setState({ isCheckedAll: event.target.checked });
                              })}


                            />
                          </Form.Group>


                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={'text-center'}>
                        <td colSpan='10' className={'align-middle text-center'}>Data Kosong</td>
                      </tr>
                    </tbody>
                  </Table>

                </Row>) : (
                      <Row>
                        <Table  id="test2" responsive bordered striped>
                          <thead>
                            <tr>
                              <th>NIK</th>
                              <th>Nama</th>
                              <th>Seksi</th>
                              <th>Group</th>
                              <th>Pilih
                        <Form.Group controlId="formBasicCheckbox">
                                  <Form.Check
                                    type="checkbox"
                                    id="selectedEmployee"
                                    value={this.state.isCheckedAll}
                                    onChange={(event) => {

                                      let { tableData } = this.state;

                                      let items = tableData.map((item, index) => {

                                        return {
                                          EmployeeId: item.EmployeeId,
                                          EmployeeIdentity: item.EmployeeIdentity,
                                          EmployeeName: item.EmployeeName,
                                          EndDate: item.EndDate,
                                          GroupId: item.GroupId,
                                          GroupName: item.GroupName,
                                          Id: item.Id,
                                          IsHalfDay: item.IsHalfDay,
                                          IsSave: event.target.checked,
                                          LastModifiedUtc: item.LastModifiedUtc,
                                          LeaveTypeCode: item.LeaveTypeCode,
                                          LeaveTypeId: item.LeaveTypeId,
                                          LeaveTypeName: item.LeaveTypeName,
                                          SectionId: item.SectionId,
                                          SectionName: item.SectionName,
                                          StartDate: item.StartDate,
                                          UnitId: item.UnitId,
                                          UnitName: item.UnitName,
                                        }
                                      });
                                      this.setState({ isCheckedAll: event.target.checked, tableData: items })

                                    }}
                                  />
                                </Form.Group>

                              </th>

                            </tr>
                          </thead>
                          {items}
                        </Table>
                      </Row>
                    )}
              </FormGroup>
              {this.state.tableData.length > 0 ? this.state.submitLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                <Button className="btn btn-success pull-right" name="edit-all" style={{ 'marginBottom': '20px' }}
                  onClick={this.handleSubmit}>Submit</Button>
              ) : null}
            </Form>
          )
        }

      </div>
    );
  }
}

export default MultipleInput;
