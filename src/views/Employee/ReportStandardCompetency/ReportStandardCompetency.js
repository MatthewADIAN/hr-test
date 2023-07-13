import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from '../../../react-components/RowButtonComponent';
import * as CONST from '../../../Constant';
import axios from 'axios';
import Service from './Service';
import swal from 'sweetalert';

import './style.css';
var fileDownload = require('js-file-download');

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const moment = require('moment');
const DOWNLOAD_REPORT_STANDARD_COMPETENCY =  "report-standard-competency/download-xls"

class ReportStandardCompetency extends Component {
  typeaheadEmployeeCreateForm = {};
  typeaheadEmployeeSearchForm = {};
  state = {
    loading: false,
    isAutoCompleteLoading: false,
    selectedUnit: null,
    selectedSection: null,
    selectedGroup: null,
    selectedUnitToCreate: null,

    selectedStartPeriode: new Date(),
    selectedEndPeriode: new Date(),
    selectedSearchUnit: null,
    selectedSearchSection: null,
    selectedSearchGroup: null,
    selectedSearchEmployee: null,
    dateRange: [],
    dateRangeLength: 0,

    selectedTypeToEdit: {},

    units: [],
    groups: [],
    sections: [],
    employees: [],

    searchUnits: [],
    searchSections: [],
    searchGroups: [],
    searchEmployee: [],

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],

    validationSearch: {},
    form: {},


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

      //   startDate :null,
      //   endDate : null,
    })
  }

  constructor(props) {
    super(props);
    this.service = new Service();
  }

  componentDidMount() {
    this.setData();
    this.setUnits();
    this.setGroups();
    this.setSections();
    this.setUnitsSearch();
    this.setGroupsSearch(null);
    this.setSectionsSearch(null);
    this.setEmployeeSearch();

  }

  setData = () => {
    // this.resetPagingConfiguration();
    const params = {
      unitId: this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0,
      groupId: this.state.selectedSearchGroup ? this.state.selectedSearchGroup.Id : 0,
      sectionId: this.state.selectedSearchSection ? this.state.selectedSearchSection.Id : 0,
      employeeId: this.state.selectedSearchEmployee ? this.state.selectedSearchEmployee.Id : 0,
      page: this.state.activePage,
      //   startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
      //   endDate: moment(this.state.endDate).format('YYYY-MM-DD')
    };
    let variableTanggal;
    
    this.setState({ loadingData: true })
    this.service
      .getStandardComptency(params)
      .then((result) => {
        this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false, validationSearch: {} })
      }).catch((err) => {
        this.setState({ activePage: 1, total: 0, tableData: [], loadingData: false, validationSearch: {} })
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

  setUnits = () => {
    this.setState({ loading: true })
    this.service
      .getAllUnits()
      .then((result) => {
        this.setState({ units: result, loading: false })
      });
  }

  setGroupsSearch = (sectionId) => {
    // this.setState({ loading: true })
    if (sectionId == null) {

      this.service
        .getAllGroups()
        .then((result) => {
          this.setState({ searchGroups: result })
        });
    } else {
      this.service
        .getAllGroupsBySection(sectionId)
        .then((result) => {
          var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm.getInstance()
          instanceEmployeeSearch.clear();
          this.setState({ searchGroups: result, selectedSearchGroup: null, selectedSearchEmployee: null })
        });
    }
  }

  setSectionsSearch = (unitId) => {
    // this.setState({ loading: true })
    if (unitId == null) {

      this.service
        .getAllSections()
        .then((result) => {
          this.setState({ searchSections: result })
        });
    } else {
      this.service
        .getAllSectionsByUnit(unitId)
        .then((result) => {
          var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm.getInstance()
          instanceEmployeeSearch.clear();
          this.setState({ searchSections: result, selectedSearchGroup: null, selectedSearchSection: null, selectedSearchEmployee: null })
        });
    }
  }

  setUnitsSearch = () => {
    // this.setState({ loading: true })
    this.service
      .getAllUnits()
      .then((result) => {
        var units = [];
        result.map(s => {
          if (this.state.userAccessRole == PERSONALIA_BAGIAN && 
            (this.state.otherUnitId.includes(s.Id))) {
            units.push(s);
          } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
            units.push(s);
          }
        });
        this.setState({ searchUnits: units, validationSearch: {} })
      });
  }

  setEmployeeSearch = () => {

    let params = {};
    params.unitId = this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.userUnitId : this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0;
    params.groupId = this.state.selectedSearchGroup?.Id;
    params.sectionId = this.state.selectedSearchSection?.Id;
    params.employeeId = this.state.selectedSearchEmployee?.Id;

    // this.setState({ loading: true })
    this.service
      .searchEmployeeSearch(params)
      .then((result) => {
       
        this.setState({ searchEmployee: result })
      });

  }

  search = () => {
    if(!this.state.selectedSearchUnit){
      this.setState({ validationSearch: {Unit: 'Unit Harus Diisi'} });
    } else {
      this.setData();
    }
  }

  downloadExcel = () => {
    if(!this.state.selectedSearchUnit){
      this.setState({ validationSearch: {Unit: 'Unit Harus Diisi'} });
    } else {
      this.downloadData();
    }
  }

  downloadData = () => {
    this.setState({ loadingData: true })
    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?page=1&size=1000&adminEmployeeId=${adminEmployeeId}`;

    if (this.state.selectedSearchUnit) {

      query += "&unitId=" + this.state.selectedSearchUnit.Id;
    } else {
      if (this.state.userAccessRole == PERSONALIA_BAGIAN) {
        query += "&unitId=" + this.state.userUnitId;
      }
    }
    if (this.state.selectedSearchGroup)
      query += "&groupId=" + this.state.selectedSearchGroup.Id
    if (this.state.selectedSearchSection)
      query += "&sectionId=" + this.state.selectedSearchSection.Id

    if (this.state.selectedSearchEmployee)
      query += "&employeeId=" + this.state.selectedSearchEmployee.Id;

    const value = localStorage.getItem('token');
    const Header = {
      accept: 'application/json',
      Authorization: `Bearer ` + value,
      'x-timezone-offset': moment().utcOffset() / 60
    };

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + DOWNLOAD_REPORT_STANDARD_COMPETENCY+ query,
      responseType: 'blob',
      headers: Header,
    }).then(data => {
      
      let disposition = data.headers['content-disposition']
      let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])

      fileDownload(data.data, filename);
      this.setState({ loading: false, loadingData: false, validationSearch: {} });
    }).catch(err => {
     
      this.setState({ loading: false, loadingData: false, validationSearch: {} });

    });
  }

  handleEmployeeSearchModal = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    // const params = {
    //   unitId: this.state.selectedUnitToCreate ? this.state.selectedUnitToCreate.Id : 0,
    //   keyword: query
    // }
    const params = {
      keyword: query
    };

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

  handleEmployeeFilter = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const params = {
      unitId: this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0,
      groupId: this.state.selectedSearchGroup ? this.state.selectedSearchGroup.Id : 0,
      sectionId: this.state.selectedSearchSection ? this.state.selectedSearchSection.Id : 0,
      keyword: query,
      adminEmployeeId: Number(localStorage.getItem("employeeId"))
    }

    this.service
      .searchEmployeeSearch(params)
      .then((result) => {
        result = result.map((employee) => {
          employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} - ${employee.Name}`;
          //   employee.label = `${employee.EmployeeIdentity} - ${employee.Name}`;
          //   employee.value = `${employee.Id}`;
          return employee;
        });
        // this.setEmployeeSearch();
        this.setState({ searchEmployee: result }, () => {
          this.setState({ isAutoCompleteLoading: false });
        });
      });
  }

  resetPagingConfiguration = () => {
    this.setUnitsSearch();
    this.setGroupsSearch(null);
    this.setSectionsSearch(null);
    this.setState({
      activePage: 1,
      selectedUnit: null,
      selectedSection: null,
      selectedGroup: null,
      selectedStartPeriode: new Date(),
      selectedEndPeriode: new Date(),
      selectedSearchGroup: null,
      selectedSearchUnit: null,
      selectedSearchSection: null,
      selectedSearchEmployee: null,
      validationSearch: {}
    });
    var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm.getInstance()
    instanceEmployeeSearch.clear();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  }

  render() {
    const { tableData } = this.state;
    const items = tableData.map((item, index) => {
      let numRowsSpan = Math.max(item.StandardCompetencies.length, item.TrainingEmployees.length)
      return (
        <tbody>
          {item.StandardCompetencies.length == 0 && item.TrainingEmployees.length == 0
            ? (
              <tr key={index} data-category={index}>
                <td>{item.EmployeeIdentity}</td>
                <td>{item.EmployeeName}</td>
                <td>{item.UnitName}</td>
                <td>{item.SectionName}</td>
                <td>{item.GroupName}</td>
                <td>{item.EmploymentClass}</td>
                <td><ul type="none"></ul></td>
                <td><ul type="none"></ul></td>
                <td><ul type="none"></ul></td>
                <td><ul type="none"></ul></td>
                
              </tr>

            )
            : item.StandardCompetencies.length > item.TrainingEmployees.length ?
              (
                item.StandardCompetencies.map((itemCompetency, indexCompetency) => {
                 
                  return (
                    indexCompetency == 0 ? (
                      <tr key={index} data-category={index}>
                        <td rowspan={numRowsSpan}>{item.EmployeeIdentity}</td>
                        <td rowspan={numRowsSpan}>{item.EmployeeName}</td>
                        <td rowspan={numRowsSpan}>{item.UnitName}</td>
                        <td rowspan={numRowsSpan}>{item.SectionName}</td>
                        <td rowspan={numRowsSpan}>{item.GroupName}</td>
                        <td rowspan={numRowsSpan}>{item.EmploymentClass}</td>
                        <td>{itemCompetency.StandardCompetencyName}</td>
                        <td>{itemCompetency.StandardCompetencyType}</td>
                        <td>{item.TrainingEmployees[indexCompetency]?.TrainingCompleteName}</td>
                        <td>{item.TrainingEmployees[indexCompetency]?.TrainingCompleteDate == undefined || moment(item.TrainingEmployees[indexCompetency]?.TrainingCompleteDate).year() == 1 ? " " : moment(item.TrainingEmployees[indexCompetency]?.TrainingCompleteDate).format("YYYY-MMM-DD")}</td>
                      </tr>
                    ) : (
                      
                      <tr key={index} data-category={index}>
                        <td>{itemCompetency.StandardCompetencyName}</td>
                        <td>{itemCompetency.StandardCompetencyType}</td>
                        <td>{item.TrainingEmployees[indexCompetency]?.TrainingCompleteName}</td>
                        <td>{item.TrainingEmployees[indexCompetency]?.TrainingCompleteDate == undefined || moment(item.TrainingEmployees[indexCompetency]?.TrainingCompleteDate).year() == 1 ? " " : moment(item.TrainingEmployees[indexCompetency]?.TrainingCompleteDate).format("YYYY-MMM-DD")}</td>   
                      </tr>
                    )
                  )
                }
                )
              ) : (
                item.TrainingEmployees.map((itemTraining, indexTraining) => {
                  return (
                    indexTraining == 0 ? (
                      <tr key={index} data-category={index}>
                        <td rowspan={numRowsSpan}>{item.EmployeeIdentity}</td>
                        <td rowspan={numRowsSpan}>{item.EmployeeName}</td>
                        <td rowspan={numRowsSpan}>{item.UnitName}</td>
                        <td rowspan={numRowsSpan}>{item.SectionName}</td>
                        <td rowspan={numRowsSpan}>{item.GroupName}</td>
                        <td rowspan={numRowsSpan}>{item.EmploymentClass}</td>
                        <td>{item.StandardCompetencies[indexTraining]?.StandardCompetencyName}</td>
                        <td>{item.StandardCompetencies[indexTraining]?.StandardCompetencyType}</td>
                        <td>{itemTraining.TrainingCompleteName}</td>
                        <td>{itemTraining.TrainingCompleteDate == undefined || moment(itemTraining.TrainingCompleteDate).year() == 1 ? " " : moment(itemTraining.TrainingCompleteDate).format("YYYY-MMM-DD")}</td>
                      </tr>
                    ) : (            
                      <tr key={index} data-category={index}>
                        <td>{item.StandardCompetencies[indexTraining]?.StandardCompetencyName}</td>
                        <td>{item.StandardCompetencies[indexTraining]?.StandardCompetencyType}</td>
                        <td>{itemTraining.TrainingCompleteName}</td>
                        <td>{itemTraining.TrainingCompleteDate == undefined || moment(itemTraining.TrainingCompleteDate).year() == 1 ? " " : moment(itemTraining.TrainingCompleteDate).format("YYYY-MMM-DD")}</td>         
                      </tr>
                    )
                  )
                }
                )
              )}

        </tbody>
      )
    });




    return (
      <div className="animated fadeIn">
        {this.state.loading ? (
          <span><Spinner size="sm" color="primary" /> Please wait...</span>
        ) : (
          <Form>
            {/*<FormGroup>*/}

            {/*</FormGroup>*/}
            <FormGroup>
              <Row>
                <Col sm={1} className={'text-right'}>
                  <FormLabel>Unit/Bagian</FormLabel>
                </Col>
                <Col sm={4}>
                  <Select
                    placeholder={'pilih unit'}
                    isClearable={true}
                    options={this.state.searchUnits}
                    value={this.state.selectedSearchUnit}
                    onChange={(value) => {

                      if (value != null) {
                        this.setSectionsSearch(value.Id);
                      }
                      else {
                        this.setSectionsSearch(null);
                      }

                      this.setState({ selectedSearchUnit: value, validationSearch: {} }, () => {
                        // this.setEmployeeSearch();
                      });
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
                    options={this.state.searchSections}
                    value={this.state.selectedSearchSection}
                    onChange={(value) => {
                      if (value != null) {
                        this.setGroupsSearch(value.Id);
                      }
                      else {
                        this.setGroupsSearch(null);
                      }

                      this.setState({ selectedSearchSection: value }, () => {
                        // this.setEmployeeSearch();
                      });

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
                    options={this.state.searchGroups}
                    value={this.state.selectedSearchGroup}
                    onChange={(value) => {
                      this.setState({ selectedSearchGroup: value }, () => {
                        // this.setEmployeeSearch();
                      });
                    }} />
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
                    id="loader-employee-search-form"
                    ref={(typeahead) => { this.typeaheadEmployeeSearchForm = typeahead }}
                    isLoading={this.state.isAutoCompleteLoading}
                    onChange={(selected) => {
                      
                      this.setState({ selectedSearchEmployee: selected[0] });
                    }}
                    labelKey="NameAndEmployeeIdentity"
                    minLength={1}
                    onSearch={this.handleEmployeeFilter}
                    options={this.state.searchEmployee}
                    placeholder="Cari karyawan..."
                  />


                </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              <Row>
                <Col sm={1}>
                </Col>
                <Col sm={4}>
                  <Button className="btn btn-secondary mr-5" name="reset" onClick={this.resetPagingConfiguration}>Reset</Button>
                  <Button className="btn btn-primary mr-5" name="search" onClick={this.search}>Cari</Button>
                </Col>
                <Col sm={7}>
                  <FormGroup>
                    <Button className="btn btn-success mr-5 pull-right" name="input-driver-allowance" onClick={this.downloadExcel}>Download Excel</Button>
                  </FormGroup>
                </Col>

              </Row>

            </FormGroup>

            <FormGroup>
              {this.state.loadingData ? (
                <span><Spinner size="sm" color="primary" /> Loading Data...</span>
              ) : this.state.tableData.length <= 0 ? (<Table responsive bordered striped >
                <thead>
                  <tr className={'text-center'}>
                    <th>NIK</th>
                    <th>Nama Karyawan</th>
                    <th>Unit/Bagian</th>
                    <th>Seksi</th>
                    <th>Group</th>
                    <th>Gol</th>
                    <th>Daftar Pelatihan Yang Harus Dikerjakan</th>
                    <th>Jenis Pelatihan</th>
                    <th>Pelatihan Yang Sudah Dikerjakan</th>
                    <th>Tanggal Pelatihan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr key="0">
                    <td colSpan='10' className='text-center'>Data Kosong</td>
                  </tr>
                </tbody>
              </Table>) : (
                <Row>
                  <Table responsive bordered striped >
                    <thead>
                      <tr className={'text-center'}>
                        <th>NIK</th>
                        <th>Nama Karyawan</th>
                        <th>Unit/Bagian</th>
                        <th>Seksi</th>
                        <th>Group</th>
                        <th>Gol</th>
                        <th>Daftar Pelatihan Yang Harus Dikerjakan</th>
                        <th>Jenis Pelatihan</th>
                        <th>Pelatihan Yang Sudah Dikerjakan</th>
                        <th>Tanggal Pelatihan</th>
                       
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
export default ReportStandardCompetency;
