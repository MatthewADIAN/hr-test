import React, { Component } from "react";
import { Input, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import {
  ToggleButton,
  Form,
  Spinner,
  FormGroup,
  FormLabel,
  Row,
  Col,
  Table,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
} from "react-bootstrap";
import Select from "react-select";
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from "../../../react-components/RowButtonComponent";
import Service from "../Service";
import swal from "sweetalert";

import "./style.css";
import { roundToNearestMinutes } from "date-fns/fp";
var fileDownload = require("js-file-download");

const moment = require("moment");
const minimumDate = new Date(1945, 8, 17);

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
class SuggestionBoxRecap extends Component {
  typeaheadEmployee = {};

  state = {
    loading: false,
    isAutoCompleteLoading: false,
    selectedUnitToCreate: null,
    selectedEmployeeToCreate: null,
    isCreateLoading: false,
    isDeleteSuggestionBoxLoading: false,

    isShowDeleteDataRevisionModal: false,
    //  isShowDeleteSuggestionForCompanyModal:false,

    selectedUnit: null,
    units: [],

    selectedEmployee: null,
    employees: [],

    suggestionBoxType: 0,
    // minimum date value js
    startDate: null,
    endDate: null,

    suggestionBox: {},

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],
    selectedItem: null,

    isEditLoading: false,
    startDateToEdit: null,
    endDateToEdit: null,

    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    validationCreateForm: {},
    validationEditForm: {},
    validationSearch: {},
    otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),
  };

  resetCreateModalValue = () => {
    this.setState({
      selectedEmployeeToCreate: null,
      startDate: null,
      endDate: null,

      validationCreateForm: {},
      validationEditForm: {},
      validationSearch: {},
    });
  };

  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
      selectedUnit: null,
      selectedEmployee: null,
      validationSearch: {},
      startDate: null,
      endDate: null,
    });
  };

  constructor(props) {
    super(props);
    this.service = new Service();
    this.handleEmployeeTypeahead = this.handleEmployeeTypeahead.bind(this);
    this.typeaheadEmployeeCreateForm = null;
    console.log("fad this.props.match.params", this.props.match.params);
  }

  componentDidMount() {
    this.setUnits();
    this.setData();
  }

  setData = () => {
    const params = {
      unitId: this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
      employeeId: this.state.selectedEmployee
        ? this.state.selectedEmployee.Id
        : 0,
      page: this.state.activePage,
      startDate: this.state.startDate
        ? moment(this.state.startDate).format("YYYY-MM-DD")
        : null,
      endDate: this.state.endDate
        ? moment(this.state.endDate).format("YYYY-MM-DD")
        : null,
      type: this.state.suggestionBoxType,
    };

    this.setState({ loadingData: true });
    this.service.getSuggestionBoxRecap(params).then((result) => {
      // console.log(result);
      this.setState({
        activePage: result.Page,
        total: result.Total,
        tableData: result.Data,
        loadingData: false,
      });
    });
  };

  setUnits = () => {
    this.setState({ loading: true });
    this.service.getAllUnits().then((result) => {
      var units = [];
      result.map((s) => {
        if (
          this.state.userAccessRole == PERSONALIA_BAGIAN &&
          this.state.otherUnitId.includes(s.Id)
        ) {
          units.push(s);
        } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
          units.push(s);
        }
      });
      this.setState({ units: units, loading: false });
    });
  };

  //if needed filter by employee
  handleEmployeeSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const params = {
      unitId:
        this.state.userAccessRole == PERSONALIA_BAGIAN
          ? this.state.userUnitId
          : this.state.selectedUnit
          ? this.state.selectedUnit.Id
          : 0,
      keyword: query,
      statusEmployee: "AKTIF",
    };

    this.service.searchEmployee(params).then((result) => {
      result = result.map((employee) => {
        employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} - ${employee.Name}`;
        return employee;
      });
      this.setState({ employees: result }, () => {
        this.setState({ isAutoCompleteLoading: false });
      });
    });
  };

  search = () => {
    this.setState({ validationSearch: {} });
    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({
        validationSearch: {
          EndDate: "Tanggal Akhir Harus lebih Dari Tanggal Awal",
        },
      });
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({
        validationSearch: { StartDate: "Tanggal mulai harus diisi" },
      });
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({
        validationSearch: { EndDate: "Tanggal akhir harus diisi" },
      });
    } else {
      this.setData();
    }
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  };

  handleEmployeeTypeahead() {
    this.typeaheadEmployeeCreateForm.clear();
  }

  handleDeleteDataRevisionClick = (item) => {
    this.setState({ suggestionBox: item }, () => {
      this.showDeleteSuggestionBoxModal(true);
    });
  };

  showDeleteSuggestionBoxModal = (value) => {
    this.setState({ isShowDeleteDataRevisionModal: value });
  };

  deleteSuggestionBoxClickHandler = () => {
    this.setState({ isDeleteSuggestionBoxLoading: true });
    this.service
      .deleteSuggestionBox(this.state.suggestionBox?.Id)
      .then((result) => {
        // console.log(result);
        swal({
          icon: "success",
          title: "Good...",
          text: "Data berhasil dihapus!",
        });
        this.setState(
          { isDeleteSuggestionBoxLoading: false, suggestionBox: null },
          () => {
            this.resetPagingConfiguration();
            this.setData();
            this.showDeleteSuggestionBoxModal(false);
          }
        );
      });
  };

  //Change radio buton type suggestion Box
  onTypeChange(event) {
    let value = parseInt(event.target.value);

    this.setState(
      {
        suggestionBoxType: value,
      },
      () => {
        this.setData();
      }
    );
  }

  handlePdf = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({
        validationSearch: {
          StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir",
        },
      });
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({
        validationSearch: { StartDate: "Tanggal Awal Harus DIisi" },
      });
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({
        validationSearch: { EndDate: "Tanggal Akhir Harus Diisi" },
      });
    } else {
      this.getPdf();
    }
  };

  getPdf = () => {
    this.setState({ loadingData: true });

    let query = `?`;
    query += "type=" + this.state.suggestionBoxType;

    if (this.state.startDate)
      query +=
        "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD");

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD");

    if (this.state.selectedSearchEmployee)
      query += "&employeeId=" + this.state.selectedSearchEmployee?.Id;

    if (this.state.selectedSearchUnit)
      query += "&unitId=" + this.state.selectedSearchUnit?.Id;

    if (this.state.selectedSearchGroup)
      query += "&groupId=" + this.state.selectedSearchGroup?.Id;
    if (this.state.selectedSearchSection)
      query += "&sectionId=" + this.state.selectedSearchSection?.Id;

    console.log(query);

    this.service
      .getRecapPdf(query)
      .then((data) => {
        let disposition = data.headers["content-disposition"];
        let filename = decodeURI(disposition.match(/filename="(.*)"/)[1]);

        fileDownload(data.data, filename);
        this.setState({ loading: false, loadingData: false });
      })
      .catch((err) => {
        this.setState({ loading: false, loadingData: false });
      });
  };

  handleXls = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({
        validationSearch: {
          StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir",
        },
      });
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({
        validationSearch: { StartDate: "Tanggal Awal Harus DIisi" },
      });
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({
        validationSearch: { EndDate: "Tanggal Akhir Harus Diisi" },
      });
    } else {
      this.getXls();
    }
  };

  getXls = () => {
    this.setState({ loadingData: true });

    let query = `?`;
    query += "type=" + this.state.suggestionBoxType;

    if (this.state.startDate)
      query +=
        "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD");

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD");

    if (this.state.selectedSearchEmployee)
      query += "&employeeId=" + this.state.selectedSearchEmployee?.Id;

    if (this.state.selectedSearchUnit)
      query += "&unitId=" + this.state.selectedSearchUnit?.Id;

    if (this.state.selectedSearchGroup)
      query += "&groupId=" + this.state.selectedSearchGroup?.Id;
    if (this.state.selectedSearchSection)
      query += "&sectionId=" + this.state.selectedSearchSection?.Id;

    console.log(query);

    this.service
      .getRecapXls(query)
      .then((data) => {
        let disposition = data.headers["content-disposition"];
        let filename = decodeURI(disposition.match(/filename="(.*)"/)[1]);

        fileDownload(data.data, filename);
        this.setState({ loading: false, loadingData: false });
      })
      .catch((err) => {
        this.setState({ loading: false, loadingData: false });
      });
  };

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item, index) => {
      var days = [
        "Minggu,",
        "Senin,",
        "Selasa,",
        "Rabu,",
        "Kamis,",
        "Jum'at,",
        "Sabtu,",
      ];
      return item.SuggestionBoxType === 0 ? (
        <tr key={item.Id} data-category={item.Id}>
          <td>{++index}</td>
          <td>
            {days[moment(item.StartDate).day()]}{" "}
            {moment(item.StartDate).format("DD/MM/YYYY")}
          </td>
          <td>{item.EmployeeIdentity}</td>
          <td>{item.EmployeeName}</td>
          <td>{item.UnitName}</td>
          <td>{item.SuggestionMessage}</td>
          <td>
            <Form>
              <FormGroup>
                <RowButtonComponent
                  className="btn btn-danger"
                  name="delete-suggestion"
                  onClick={this.handleDeleteDataRevisionClick}
                  data={item}
                  iconClassName="fa fa-trash"
                  label=""
                ></RowButtonComponent>
              </FormGroup>
            </Form>
          </td>
        </tr>
      ) : (
        <tr key={item.Id} data-category={item.Id}>
          <td>{++index}</td>
          <td>
            {days[moment(item.StartDate).day()]}{" "}
            {moment(item.StartDate).format("DD/MM/YYYY")}
          </td>
          <td>{item.EmployeeIdentity}</td>
          <td>{item.EmployeeName}</td>
          <td>{item.UnitName}</td>
          <td>{item.SuggestionMessage}</td>
          <td>
            <img className="photo" src={item.SuggestionImageUri} />
          </td>
          <td>
            <Form>
              <FormGroup>
                <RowButtonComponent
                  className="btn btn-danger"
                  name="delete-suggestion"
                  onClick={this.handleDeleteDataRevisionClick}
                  data={item}
                  iconClassName="fa fa-trash"
                  label=""
                ></RowButtonComponent>
              </FormGroup>
            </Form>
          </td>
        </tr>
      );
    });

    return (
      <div className="animated fadeIn">
        {this.state.loading ? (
          <span>
            <Spinner size="sm" color="primary" /> Please wait...
          </span>
        ) : (
          <Form>
            <FormGroup>
              <Row>
                <Col sm={1} className={"text-left"}>
                  <FormLabel>Unit</FormLabel>
                </Col>
                <Col sm={4}>
                  <Select
                    placeholder={"pilih unit"}
                    isClearable={true}
                    options={this.state.units}
                    value={this.state.selectedUnit}
                    onChange={(value) => {
                      this.setState({ selectedUnit: value });
                    }}
                  />
                </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              <Row>
                <Col sm={1} className={"text-left"}>
                  <FormLabel>Periode</FormLabel>
                </Col>
                <Col sm={4}>
                  <Row>
                    <Col sm={5}>
                      <Input
                        type="date"
                        value={this.state.startDate}
                        onChange={(event) => {
                          let errors = this.state.validationSearch;
                          if (errors?.StartDate) {
                            errors["StartDate"] = "";
                          }

                          this.setState({
                            startDate: event.target.value,
                            validationSearch: errors,
                          });
                        }}
                        isInvalid={
                          this.state.validationSearch.StartDate ? true : null
                        }
                      />
                      <span className="text-danger">
                        {this.state.validationSearch?.StartDate}
                      </span>
                    </Col>
                    <Col sm={2} className={"text-center"}>
                      s/d
                    </Col>
                    <Col sm={5}>
                      <Input
                        type="date"
                        value={this.state.endDate}
                        onChange={(event) => {
                          let errors = this.state.validationSearch;
                          if (errors?.EndDate) {
                            errors["EndDate"] = "";
                          }

                          if (errors?.InvalidDateRange) {
                            errors["InvalidDateRange"] = "";
                          }

                          this.setState({
                            endDate: event.target.value,
                            validationSearch: errors,
                          });
                        }}
                      />
                      <span className="text-danger">
                        {this.state.validationSearch?.EndDate}
                      </span>
                      <span className="text-danger">
                        {this.state.validationSearch?.InvalidDateRange}
                      </span>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </FormGroup>

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
                <Col sm={1}></Col>

                <Col sm={2}>
                  <Input
                    type="radio"
                    name="suggestionBoxType"
                    value={0}
                    checked={this.state.suggestionBoxType === 0}
                    onChange={(event) => {
                      this.onTypeChange(event);
                    }}
                  />
                  Ketidaksesuaian Data
                </Col>
                <Col sm={2}>
                  <Input
                    type="radio"
                    name="suggestionBoxType"
                    value={1}
                    checked={this.state.suggestionBoxType === 1}
                    onChange={(event) => {
                      this.onTypeChange(event);
                    }}
                  />
                  Saran Untuk Perusahaan
                </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              <Row>
                <Col sm={1}></Col>
                <Col sm={11}>
                  <Button
                    className="btn btn-sm btn-secondary mr-3"
                    name="btn-reset"
                    onClick={this.resetPagingConfiguration}
                  >
                    Reset
                  </Button>
                  <Button
                    className="btn btn-primary btn-sm mr-3"
                    name="btn-search"
                    onClick={this.search}
                  >
                    Cari
                  </Button>
                  <Button
                    className="btn btn-success btn-sm mr-3"
                    name="btn-excel"
                    onClick={this.handleXls}
                  >
                    Excel
                  </Button>
                  <Button
                    className="btn btn-success btn-sm mr-3"
                    name="btn-pdf"
                    onClick={this.handlePdf}
                  >
                    Pdf
                  </Button>
                </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              {this.state.loadingData ? (
                <span>
                  <Spinner size="sm" color="primary" /> Loading Data...
                </span>
              ) : (
                <Row>
                  {this.state.suggestionBoxType === 0 ? (
                    <Table responsive bordered striped>
                      <thead>
                        <tr className={"text-center"}>
                          <th>No</th>
                          <th>Tanggal</th>
                          <th>NIK</th>
                          <th>Nama</th>
                          <th>Seksi</th>
                          <th>Revisi Data</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>{items}</tbody>
                    </Table>
                  ) : (
                    <Table responsive bordered striped>
                      <thead>
                        <tr className={"text-center"}>
                          <th>No</th>
                          <th>Tanggal</th>
                          <th>NIK</th>
                          <th>Nama</th>
                          <th>Unit</th>
                          <th>Saran untuk perusahaan</th>
                          <th>Foto</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>{items}</tbody>
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
                </Row>
              )}
            </FormGroup>

            <Modal
              aria-labelledby="modal-delete-datarevison"
              show={this.state.isShowDeleteDataRevisionModal}
              onHide={() => this.showDeleteSuggestionBoxModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-delete-datarevison">
                  Hapus Data Pengumuman
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Apakah anda yakin ingin menghapus data ini?
              </Modal.Body>
              <Modal.Footer>
                {this.state.isDeleteSuggestionBoxLoading ? (
                  <span>
                    <Spinner size="sm" color="primary" /> Mohon tunggu...
                  </span>
                ) : (
                  <div>
                    <Button
                      className="btn btn-danger"
                      name="delete-suggestionbox"
                      onClick={this.deleteSuggestionBoxClickHandler}
                    >
                      Hapus
                    </Button>
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

export default SuggestionBoxRecap;
