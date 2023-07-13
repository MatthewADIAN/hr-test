import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Spinner, InputGroup, InputGroupAddon, InputGroupText, Form, Button, FormGroup, Label, Input } from 'reactstrap';
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

const moment = require('moment');

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

      isAutoCompleteLoading: false,

      activePage: 1,
      page: 1,
      size: 10,
      total: 0
    };
  }

  componentDidMount() {
    this.setData()
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
      url: CONST.URI_ATTENDANCE + CONST.GET_SCHEDULE + query,
      headers: { accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token') },
    }).then(data => {
      console.log(data);
      this.setState({ results: data.data.data, loading: false, loadingData: false, page: data.data.page, total: data.data.total});
    }).catch(err => {
      this.setState({ loading: false, loadingData: false });
    });
  }

  handleReset = async (event) => {
    this.typeaheadEmployee.getInstance().clear();
    this.typeaheadGroup.getInstance().clear();
    this.typeaheadSection.getInstance().clear();
    this.typeaheadUnit.getInstance().clear();
    this.setState({ selectedEmployee: null, selectedGroup: null, selectedSection: null, selectedUnit: null, page: 0 });
  }

  handleSearch = async (event) => {
    this.setData();
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

    const renderresults = results.map((result, index) => {
      return (
        <tr key={result.Id} data-category={result.Id}>
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
                      </tr>
                      <tr>
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
                    </Table>

                    <FormGroup>
                      <div className="d-flex flex-row">
                        <div className="flex-fill">
                          <Button className="btn btn-secondary mr-2" name="reset" onClick={this.handleReset}>Reset</Button>
                          <Button className="btn btn-warning mr-5" name="cari" onClick={this.handleSearch}>Cari</Button>
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
