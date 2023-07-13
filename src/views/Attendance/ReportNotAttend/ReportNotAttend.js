import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';
import * as CONST from '../../../Constant';
import axios from 'axios';
import Service from './../Service';
import swal from 'sweetalert';

import './style.css';

var fileDownload = require('js-file-download');
const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const UPAH = "Upah";
const PIMPINAN = "Pimpinan";
class ReportNotAttend extends Component {

  typeaheadEmployee = {};

  state = {
    loading: false,
    selectedUnit: null,
    selectedSection: null,
    selectedGroup: null,
    selectedDate: new Date(),
    flag: 0,
    size: 10,
    units: [],
    groups: [],
    sections: [],

    // minimum date value js
    date: "",

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],
    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),
    validationSearch: {}

  }


  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
      selectedUnit: null,
      selectedSection: null,
      selectedGroup: null,
      flag: 0,
      size: 10,
      date: "",
      selectedDate: new Date(),
    })
  }

  constructor(props) {
    super(props);
    // console.log(props);
    this.service = new Service();
  }


  componentDidMount() {
    this.setGroups();
    this.setSections();
    this.setUnits();
    this.setData();
  }

  setData = () => {
    const params = {
      unitId: this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.selectedUnit ? this.state.selectedUnit.Id : 0 : 0,
      groupId: this.state.selectedGroup ? this.state.selectedGroup.Id : 0,
      sectionId: this.state.selectedSection ? this.state.selectedSection.Id : 0,
      page: this.state.activePage,
      size: this.state.size,
      flag: this.state.flag,
      date: moment(this.state.date).format('YYYY-MM-DD'),
    };

    this.setState({ loadingData: true })
    this.service
      .getNotAttendReport(params)
      .then((result) => {
        // console.log(result);
        this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
      }).catch((err) => {
        // console.log(err);
        this.setState({ activePage: 1, total: 0, tableData: [], loadingData: false })
      });
  }

  setUnits = () => {
    this.setState({ loading: true })
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
  }

  setSectionsByUnit = (unitId) => {
    // this.setState({ loading: true })
    this.service
      .getAllSectionsByUnitId(unitId)
      .then((result) => {
        this.setState({ sections: result, selectedSection: null, selectedGroup: null, loading: false })
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

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  }

  search = () => {
    this.setState({ validationSearch: {} });
    if (this.state.date == null || this.state.date == "") {
      this.setState({ validationSearch: { date: "Tanggal Harus DIisi" } })
    }
    else {
      this.setData();
    }
  }

  downloadPdf = () => {
    this.setState({ validationSearch: {} });

    if (this.state.date == null || this.state.date == "") {
      this.setState({ validationSearch: { date: "Tanggal Harus DIisi" } })
    }
    else {

      this.downloadData();
    }
  }
  downloadData = () => {
    this.setState({ loadingData: true })

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let unitId = this.state.selectedUnit ? this.state.selectedUnit.Id : 0;
    let groupId = this.state.selectedGroup ? this.state.selectedGroup.Id : 0;
    let sectionId = this.state.selectedSection ? this.state.selectedSection.Id : 0;
    let date = this.state.date && this.state.date != "Invalid date" ? moment(this.state.date).format("YYYY-MM-DD") : null;
    let flag = this.state.flag || 0;
    let query = `?adminEmployeeId=${adminEmployeeId}&date=${date}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&flag=${flag}`;

    const value = localStorage.getItem('token');
    const Header = { accept: 'application/json', Authorization: `Bearer ` + value, 'x-timezone-offset': moment().utcOffset() / 60 };

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + "report-not-attend/download" + query,
      responseType: 'blob',
      headers: Header,
    }).then(data => {
      let disposition = data.headers['content-disposition']
      let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])

      fileDownload(data.data, filename);
      this.setState({ loading: false, loadingData: false });
    }).catch(err => {
      // console.log(err);
      this.setState({ loading: false, loadingData: false });
      swal({
        icon: 'error',
        title: 'Oops...',
        text: 'Cannot Download File!'
      });
    });
  }

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item, index) => {

      return (
        <tbody key={index} data-category={index}>
          <tr>
            <td>{moment.utc(item.Date).local().format('DD/MM/YYYY')}</td>
            <td>{item.EmployeeIdentity}</td>
            <td>{item.EmployeeName}</td>
            <td>{item.SectionName}</td>
            <td>{item.GroupName}</td>
            <td>{item.Status}</td>
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
              <Row>
                <Col>
                  <FormGroup>
                    <Row>
                      <Col sm={1} className={'text-right'} style={{ 'marginRight': '10px' }}>
                        <FormLabel>Tanggal</FormLabel>
                      </Col>
                      <Col sm={8}>
                        <Form.Control
                          type="date"
                          value={this.state.date}
                          onChange={((event) => {
                            this.setState({ date: event.target.value });
                          })}
                          isInvalid={this.state.validationSearch.date} />
                        <Form.Control.Feedback type="invalid">{this.state.validationSearch.date}</Form.Control.Feedback>
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Col sm={1} className={'text-right'} style={{ 'marginRight': '10px' }}>
                        <FormLabel>Unit</FormLabel>
                      </Col>
                      <Col sm={8}>
                        <Select
                          placeholder={'pilih unit'}
                          isClearable={true}
                          options={this.state.units}
                          value={this.state.selectedUnit}
                          onChange={(value) => {
                            if (value?.Id) {
                              this.setSectionsByUnit(value?.Id);
                            }
                            this.setState({ selectedUnit: value });
                          }} />
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Col sm={1} className={'text-right'} style={{ 'marginRight': '10px' }}>
                        <FormLabel>Seksi</FormLabel>
                      </Col>
                      <Col sm={8}>
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
                      <Col sm={1} className={'text-right'} style={{ 'marginRight': '10px' }}>
                        <FormLabel>Group</FormLabel>
                      </Col>
                      <Col sm={8}>
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
                </Col>
                <Col>
                  <FormGroup>
                    <Row>
                      <Form.Check
                        type={'radio'}
                        id={'all-checked'}
                        name={'flag'}
                        onChange={(val) => {
                          this.setState({ flag: 0 });
                          console.log(this.state);
                        }
                        }
                        checked={(this.state.flag === 0)}
                        label={'Semua'}>
                      </Form.Check>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Form.Check
                        type={'radio'}
                        id={'leave-checked'}
                        name={'flag'}
                        checked={(this.state.flag === 1)}
                        onChange={(val) => {
                          this.setState({ flag: 1 });
                          console.log(this.state);
                        }
                        }
                        label={'Ada Izin'}>
                      </Form.Check>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Form.Check
                        type={'radio'}
                        id={'non-leave-checked'}
                        name={'flag'}
                        checked={(this.state.flag === 2)}
                        onChange={(val) => {
                          this.setState({ flag: 2 });
                          console.log(this.state);
                        }
                        }
                        label={'Tidak Ada Izin'}>
                      </Form.Check>
                    </Row>
                  </FormGroup>
                </Col>
              </Row>


              <FormGroup>
                <Row>
                  <Col sm={1}>
                  </Col>
                  <Col sm={4}>
                    <Button className="btn btn-secondary mr-5" name="reset" onClick={this.resetPagingConfiguration}>Reset</Button>
                    <Button className="btn btn-success mr-5" name="search" onClick={this.search}>Cari</Button>
                    <Button className="btn btn-primary mr-5" name="export" onClick={this.downloadPdf}>Cetak</Button>
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
                        <th>Tanggal</th>
                        <th>NIK</th>
                        <th>Nama</th>
                        <th>Seksi</th>
                        <th>Group</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={'text-center'}>
                        <td colSpan='6' className={'align-middle text-center'}>Data Kosong</td>
                      </tr>
                    </tbody>
                  </Table>

                </Row>) : (
                      <Row>
                        <Table responsive bordered striped >
                          <thead>
                            <tr>
                              <th>Tanggal</th>
                              <th>NIK</th>
                              <th>Nama</th>
                              <th>Seksi</th>
                              <th>Group</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          {items}
                        </Table>
                        <Pagination
                          activePage={this.state.activePage}
                          itemsCountPerPage={this.state.size}
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
          )
        }

      </div>
    );
  }
}

export default ReportNotAttend;
