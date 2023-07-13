import React, { Component } from "react";
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input } from 'reactstrap';
import {
  Form,
  Spinner,
  FormGroup,
  Row,
  Col,
  Table,
  Button,
  Modal,
} from "react-bootstrap";
import Select from "react-select";
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from "./../../../react-components/RowButtonComponent";
import DragScrollTable from "./../../../react-components/DragScrollTable";

import Service from "./Service";
import MasterService from "../../Master/Service";
import AttendanceService from "../../Attendance/Service";
import swal from "sweetalert";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import id from 'date-fns/locale/id';

import "./style.css";

const moment = require("moment");

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
class EmployeeTraining extends Component {
  constructor(props) {
    super(props);
    this.service = new Service();
    this.masterService = new MasterService();
    this.attendanceService = new AttendanceService();

    this.sliderContainer = React.createRef();
  }

  typeaheadEmployee = {};

  state = {
    loading: false,

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],
    selectedItem: null,

    form: {},
    isCreateLoading: false,
    isShowAddEmployeeTrainingModal: false,

    isShowDeleteEmployeeTrainingModal: false,

    isShowEditEmployeeTrainingModal: false,
    isEditLoading: false,

    isShowUploadModal: false,
    selectedFile: null,

    validationCreateForm: {},

    types: [
      { name: "Bulanan", label: "Bulanan", value: "Bulanan" },
      { name: "Tahunan", label: "Tahunan", value: "Tahunan" },
    ],
    annualLeaveOptions: [
      { name: "YA", label: "YA", value: true },
      { name: "TIDAK", label: "TIDAK", value: false },
    ],

    selectedEmployeeFilter: null,
    selectedStartDateFilter: null,
    selectedEndDateFilter: null,
    keywordFilter: "",
    isAutoCompleteLoading: false,
    employees: [],

    selectedEffectiveness: null,
    effectiveness: [
      { name: "Effective", label: "Efektif", value: "Efektif" },
      { name: "Ineffective", label: "Tidak Efektif", value: "Tidak Efektif" },
    ],

    competencyTypes: [
      // { name: "Kompetensi", label: "Kompetensi", value: "Kompetensi" },
      // { name: "Terprogram", label: "Terprogram", value: "Terprogram" },
      // { name: "Insidentil", label: "Insidentil", value: "Insidentil" },
      { name: "Kompetensi Dasar", label: "Kompetensi Dasar", value: "Kompetensi Dasar" },
      { name: "Kompetensi Managerial", label: "Kompetensi Managerial", value: "Kompetensi Managerial" },
      { name: "Kompetensi Teknis", label: "Kompetensi Teknis", value: "Kompetensi Teknis" },
      { name: "Terprogram", label: "Terprogram", value: "Terprogram" },
      { name: "Insidentil", label: "Insidentil", value: "Insidentil" },
    ],
    selectedGroupFilter: null,
    groups: [],

    selectedOrganizer: null,
    organizers: [
      { name: "External", label: "External", value: "External" },
      { name: "Internal", label: "Internal", value: "Internal" },
    ],

    selectedSectionFilter: null,
    sections: [],

    selectedUnitFilter: null,
    units: [],
    competencies: [],
    selectedCompetency: null,
    selectedType: null,
   
    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),

    left: 0,
  };

  resetFilter = () => {
    this.setState({
      selectedUnitFilter: null,
      selectedGroupFilter: null,
      selectedSectionFilter: null,
      selectedEmployeeFilter: null,
      selectedStartDateFilter: null,
      selectedEndDateFilter: null,
      keywordFilter: null,
    });
    this.typeaheadEmployee.clear();
  };

  resetModalValue = () => {
    this.setState({
      validationCreateForm: {},
      form: {},
      selectedFile: null,
      selectedType: null,
      selectedCompetency: null,
      selectedEffectiveness: null,
      selectedOrganizer: null,
    });
  };

  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
    });
  };

  componentDidMount() {
    this.setUnit();
    this.setSection();
    this.setGroup();
    this.setData();
    // this.setCompetency();
  }

  setCompetency = () => {
    const params = {
      page: this.state.activePage,
    };

    this.setState({ loadingData: true });
    this.masterService.getAllCompetencies(params).then((result) => {
      this.setState({ competencies: result, loadingData: false });
    });
  };

  setCompetencyByType = async (type) => {
    const params = {
      Type: type,
    };

    this.setState({ loadingData: true });

    var competencies = [];

    await this.masterService.getAllCompetenciesByType(params)
      .then((result) => {
        console.log(result);

        result.map((header) => {
          header.CompetencyItems.map((item) => {
            var competenciesItem = 
            {
              id: header.Id,
              trainingId: header.Id,
              unitId: header.UnitId,
              date: header.Date,
              type: item.Type,
              name: item.Name,
              itemId: item.Id,
              trainingItemId: item.Id,
              label: item.Name,
            }

            return competencies.push(competenciesItem);
          })
        });
      });
    

    console.log(this.state.form);

    if(this.state.form?.UnitId) {
      competencies = competencies.filter(x=> x.unitId === this.state.form?.UnitId)
    } else {
      competencies = [];
    }
  
    this.setState({ competencies: competencies, loadingData: false });
  };

  setData = () => {
    const params = {
      page: this.state.activePage,
      unitId:
        this.state.userAccessRole == PERSONALIA_BAGIAN
          ? this.state.userUnitId
          : this.state.selectedUnitFilter
          ? this.state.selectedUnitFilter.Id
          : 0,
      sectionId: this.state.selectedSectionFilter?.Id,
      groupId: this.state.selectedGroupFilter?.Id,
      employeeId: this.state.selectedEmployeeFilter?.Id,
      startDate: this.state.selectedStartDateFilter ? moment(this.state.selectedStartDateFilter).format("MM/DD/YYYY") : "",
      endDate: this.state.selectedEndDateFilter ? moment(this.state.selectedEndDateFilter).format("MM/DD/YYYY") : "",
      keyword: this.state.keywordFilter
    };

    this.setState({ loadingData: true });
    this.service.search(params).then((result) => {
      this.setState({
        activePage: result.page,
        total: result.total,
        tableData: result.data,
        loadingData: false,
      });
    });
  };

  setUnit = () => {
    this.setState({ loadingData: true });
    this.masterService.getAllUnits().then((result) => {
      var units = [];
      result.map((s) => {
        if (
          this.state.userAccessRole == PERSONALIA_BAGIAN &&
          (this.state.otherUnitId.includes(s.Id))
        ) {
          units.push(s);
        } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
          units.push(s);
        }
      });
      this.setState({ units: units, loadingData: false });
    });
  };

  setSection = () => {
    this.setState({ loadingData: true });
    this.masterService.getAllSections().then((result) => {
      this.setState({ sections: result, loadingData: false });
    });
  };

  setGroup = () => {
    this.setState({ loadingData: true });
    this.masterService.getAllGroups().then((result) => {
      this.setState({ groups: result, loadingData: false });
    });
  };

  search = () => {
    this.setData();
  };

  print = () => {
    let unitId = this.state.selectedUnitFilter ? this.state.selectedUnitFilter.Id : 0;
    
    const params = {
      unitId: unitId,
      sectionId: this.state.selectedSectionFilter?.Id,
      groupId: this.state.selectedGroupFilter?.Id,
      employeeId: this.state.selectedEmployeeFilter?.Id,
      adminEmployeeId: Number(localStorage.getItem("employeeId")),
      startDate: this.state.selectedStartDateFilter ? moment(this.state.selectedStartDateFilter).format("MM/DD/YYYY") : "",
      endDate: this.state.selectedEndDateFilter ? moment(this.state.selectedEndDateFilter).format("MM/DD/YYYY") : "",
      keyword: this.state.keywordFilter
    };

    this.setState({ downloadLoading: true }, () => {
      return this.service
        .download(params)
        .then(() => {})
        .catch((err) => {
          // console.log(err);
        })
        .finally(() => {
          this.setState({ downloadLoading: false });
        });
    });
  };

  create = () => {
    this.showAddEmployeeTrainingModal(true);
  };

  upload = () => {
    this.showUploadModal(true);
  };

  showUploadModal = (value) => {
    this.resetModalValue();
    this.setState({ isShowUploadModal: value });
  };

  showAddEmployeeTrainingModal = (value) => {
    this.resetModalValue();
    this.setState({
      isShowAddEmployeeTrainingModal: value,
      validationCreateForm: {},
    });
  };

  showDeleteEmployeeTrainingModal = (value) => {
    this.resetModalValue();
    this.setState({ isShowDeleteEmployeeTrainingModal: value });
  };

  showEditEmployeeTrainingModal = (value) => {
    this.setState({
      isShowEditEmployeeTrainingModal: value,
      validationCreateForm: {},
    });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  };

  handleCreateEmployeeTraining = () => {
    const payload = {
      Date: this.state.form?.Date,
      EmployeeId: this.state.form?.EmployeeId,
      UnitId: this.state.form?.UnitId,
      Remark: this.state.form?.Remark,
      TrainingId: this.state.selectedCompetency?.trainingId,
      TrainingItemId: this.state.selectedCompetency?.trainingItemId,
      TrainingName: this.state.selectedCompetency?.label,
      TrainingType: this.state.selectedType?.value,
      TotalHours: this.state.form?.TotalHours,
      Organizer: this.state.selectedOrganizer?.value,
      Instructor: this.state.form?.Instructor,
      Effectiveness: this.state.selectedEffectiveness?.value,
    };

    this.setState({ isCreateLoading: true });
    this.service
      .create(payload)
      .then((result) => {
        let message = "";
        if (result.data.TrainingRecordCreated > 0) {
          message += `- ${result.data.TrainingRecordCreated} Baris data baru tersimpan \n`;
        } else {
          message += `- ${result.data.TrainingRecordUpdated} Baris data termodifikasi \n`;
        }
        swal({
          icon: "success",
          title: "Good...",
          // text: 'Data berhasil disimpan!'
          text: message,
        });
        this.setState({ isCreateLoading: false }, () => {
          this.resetModalValue();
          this.resetPagingConfiguration();
          this.setData();
          this.showAddEmployeeTrainingModal(false);
        });
      })
      .catch((error) => {
        if (error.response) {
          this.setState({
            validationCreateForm: error.response.data.error,
            isCreateLoading: false,
          });
        }

        swal(
          "Data Invalid",
          "Cek Form Isian, Isian Mandatory tidak boleh kosong",
          "error"
        );
        this.setState({ isCreateLoading: false });
      });
  };

  handleEditEmployeeTraining = () => {
    const payload = {
      Date: this.state.form?.Date,
      EmployeeId: this.state.selectedItem.EmployeeId,
      UnitId: this.state.selectedItem.UnitId,
      Remark: this.state.form?.Remark,
      TrainingName: this.state.selectedCompetency?.label,
      TrainingId: this.state.selectedCompetency?.trainingId,
      TrainingItemId: this.state.selectedCompetency?.trainingItemId,
      TrainingType: this.state.selectedType?.value,
      TotalHours: this.state.form?.TotalHours,
      Organizer: this.state.selectedOrganizer?.value,
      Instructor: this.state.form?.Instructor,
      Effectiveness: this.state.selectedEffectiveness?.value,
    };

    this.setState({ isEditLoading: true });
    this.service
      .edit(this.state.selectedItem?.Id, payload)
      .then(() => {
        // console.log(result);
        swal({
          icon: "success",
          title: "Good...",
          text: "Data berhasil diubah!",
        });
        this.setState({ isEditLoading: false }, () => {
          this.resetModalValue();
          this.resetPagingConfiguration();
          this.setData();
          this.showEditEmployeeTrainingModal(false);
        });
      })
      .catch((error) => {
        this.setState({
          validationCreateForm: error.response.data.error,
          isEditLoading: false,
        });
      });
  };

  handleEditEmployeeTrainingClick = (item) => {
    this.setState({ selectedItem: item });
    this.service.getById(item.Id).then((employeeTraining) => {
      const { types } = this.state;
      let type = types.find(
        (element) => element.value === employeeTraining.Type
      );
      let isDeductedFromAnnualLeave = types.find(
        (element) =>
          element.value === employeeTraining.IsDeductedFromAnnualLeave
      );

      employeeTraining["type"] = type;
      employeeTraining["selectedCompetency"] = {
        trainingId: employeeTraining.TrainingId,
        trainingItemId: employeeTraining.TrainingItemId,
        unitId: employeeTraining.UnitId,
        type: employeeTraining.Type,
        name: employeeTraining.TrainingName,
        label: employeeTraining.TrainingName
      };

      var { competencyTypes } = this.state;
      var { selectedCompetency } = this.state;

      selectedCompetency = {
        trainingId: employeeTraining.TrainingId,
        trainingItemId: employeeTraining.TrainingItemId,
        unitId: employeeTraining.UnitId,
        type: employeeTraining.Type,
        name: employeeTraining.TrainingName,
        label: employeeTraining.TrainingName
      }

      let compType = competencyTypes.find(
        (s) => s.value === employeeTraining.TrainingType
      );
      employeeTraining["isDeductedFromAnnualLeave"] = isDeductedFromAnnualLeave;
      let selectedOrganizer = this.state.organizers.find(
        (f) => f.value === employeeTraining.Organizer
      );
      let selectedEffectiveness = this.state.effectiveness.find(
        (f) => f.value === employeeTraining.Effectiveness
      );
      this.setState({ form: employeeTraining }, () => {
        this.showEditEmployeeTrainingModal(true);
        this.setCompetencyByType(compType.name);
        this.state.selectedOrganizer = selectedOrganizer;
        this.state.selectedEffectiveness = selectedEffectiveness;
        this.state.selectedType = compType;
        this.state.selectedCompetency = selectedCompetency;
      });
    });
  };

  handleEmployeeSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    let unitId = this.state.selectedUnitFilter ? this.state.selectedUnitFilter.Id : 0;

    const params = {
      unitId: unitId,
      keyword: query,
      statusEmployee: "AKTIF",
      adminEmployeeId: Number(localStorage.getItem("employeeId"))
    };

    this.attendanceService.searchEmployee(params).then((result) => {
      result = result.map((employee) => {
        employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} - ${employee.Name}`;
        return employee;
      });
      this.setState({ employees: result }, () => {
        this.setState({ isAutoCompleteLoading: false });
      });
    });
  };

  handleEmployeeSearchModal = (query) => {
    this.setState({ isAutoCompleteLoading: true, competencies: [], selectedCompetency: null, selectedType: null });

    const params = {
      unitId: 0,
      keyword: query,
      statusEmployee: "AKTIF",
      adminEmployeeId: Number(localStorage.getItem("employeeId"))
    };

    this.attendanceService.searchEmployee(params).then((result) => {
      result = result.map((employee) => {
        employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} - ${employee.Name}`;
        return employee;
      });
      this.setState({ employees: result }, () => {
        this.setState({ isAutoCompleteLoading: false });
      });
    });
  };

  handleDeleteEmployeeTrainingClick = (item) => {
    this.setState({ selectedItem: item }, () => {
      this.showDeleteEmployeeTrainingModal(true);
    });
  };

  deleteEmployeeTrainingClickHandler = () => {
    this.setState({ isDeleteEmployeeTrainingLoading: true });
    this.service.delete(this.state.selectedItem?.Id).then(() => {
      // console.log(result);
      swal({
        icon: "success",
        title: "Good...",
        text: "Data berhasil dihapus!",
      });
      this.setState(
        { isDeleteEmployeeTrainingLoading: false, selectedItem: null },
        () => {
          this.resetPagingConfiguration();
          this.setData();
          this.showDeleteEmployeeTrainingModal(false);
        }
      );
    });
  };

  onInputFileHandler = (event) => {
    this.setFile(event.target.files[0]);
  };

  setFile = (file) => {
    this.setState({ selectedFile: file });
  };

  handleUploadEmployeeTraining = () => {
    this.setState({ uploadFileLoading: true });
    this.service
      .upload(this.state.selectedFile)
      .then((result) => {
        console.log(result);
        let message = "";
        message +=
          "- " +
          result.data.TrainingRecordCreated +
          " Baris data baru tersimpan \n";
        message +=
          "- " +
          result.data.TrainingRecordUpdated +
          " Baris data termodifikasi \n";

        swal({
          icon: "success",
          title: "Good...",
          text: message,
        });
        this.resetModalValue();
        this.resetPagingConfiguration();
        this.setData();
        this.showUploadModal(false);
      })
      .catch((error) => {
        this.setState({ validationCreateForm: error.response.data.error });
        let message = "";
        message +=
          "- " +
          this.state.validationCreateForm?.NotMatchEmployeeIdentity +
          " \n";
        swal({
          icon: "error",
          title: "Gagal Upload!",
          text: "Pastikan Format Excel benar! Hubungi IT support.\n" + message,
        });
      })
      .finally(() => {
        this.setState({ uploadFileLoading: false });
      });
  };

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item) => {
      return (
        <tr key={item.Id} data-category={item.Id}>
          <td>{item.EmployeeIdentity}</td>
          <td>{item.EmployeeName}</td>
          <td>{item.Unit}</td>
          <td>{item.Section}</td>
          <td>{item.Group}</td>
          <td>{item.TrainingType}</td>
          <td>{item.TrainingName}</td>
          <td>{item.Date ? moment(item.Date).format("MM/DD/YYYY") : ""}</td>
          <td>{item.TotalHours}</td>
          <td>{item.Instructor}</td>
          <td>{item.Organizer}</td>
          <td>{item.Effectiveness}</td>
          <td>{item.Remark}</td>
          <td>
            <Form>
              <FormGroup>
                <RowButtonComponent
                  className="btn btn-primary"
                  name="edit-employeeTraining"
                  onClick={this.handleEditEmployeeTrainingClick}
                  data={item}
                  iconClassName="fa fa-pencil-square"
                  label=""
                ></RowButtonComponent>
                <RowButtonComponent
                  className="btn btn-danger"
                  name="delete-employeeTraining"
                  onClick={this.handleDeleteEmployeeTrainingClick}
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
                <Col sm={6}>
                  <Button
                    className="btn btn-primary mr-2"
                    name="upload"
                    onClick={this.upload}
                  >
                    Upload Excel
                  </Button>
                  <Button
                    className="btn btn-success mr-5"
                    name="create"
                    onClick={this.create}
                  >
                    Tambah Training
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col sm={5}>
                  <Select
                    placeholder={"pilih unit..."}
                    isClearable={true}
                    options={this.state.units}
                    value={this.state.selectedUnitFilter}
                    onChange={(value) => {
                      this.setState({ selectedUnitFilter: value });
                    }}
                  ></Select>
                </Col>
              </Row>
              <Row>
                <Col sm={5}>
                  <Select
                    placeholder={"pilih seksi..."}
                    isClearable={true}
                    options={this.state.sections}
                    value={this.state.selectedSectionFilter}
                    onChange={(value) => {
                      this.setState({ selectedSectionFilter: value });
                    }}
                  ></Select>
                </Col>
              </Row>
              <Row>
                <Col sm={5}>
                  <Select
                    placeholder={"pilih grup..."}
                    isClearable={true}
                    options={this.state.groups}
                    value={this.state.selectedGroupFilter}
                    onChange={(value) => {
                      this.setState({ selectedGroupFilter: value });
                    }}
                  ></Select>
                </Col>
              </Row>
              <Row>
                <Col sm={2}>
                  <div className="customDatePickerWidth">
                    <DatePicker
                      className={this.state.validationSearch?.StartDate ? 'form-control is-invalid' : 'form-control'}
                      name="StartDate"
                      showIcon
                      id="StartDate"
                      selected={this.state.selectedStartDateFilter}
                      placeholderText="pilih awal periode..."
                      dateFormat="dd MMMM yyyy"
                      locale={id}
                      onChange={val => {
                        this.setState({ selectedStartDateFilter: val });
                      }}
                      isInvalid={this.state.validationSearch?.StartDate ? true : null}
                    />
                  </div>
                  <Form.Control.Feedback type="invalid">{this.state.validationSearch?.StartDate}</Form.Control.Feedback>
                </Col>
                <Col sm={1} className={'text-center'}>s/d</Col>
                <Col sm={2}>
                  <div className="customDatePickerWidth">
                    <DatePicker
                      className={this.state.validationSearch?.EndDate ? 'form-control is-invalid' : 'form-control'}
                      name="EndDate"
                      showIcon
                      id="EndDate"
                      selected={this.state.selectedEndDateFilter}
                      placeholderText="pilih akhir periode..."
                      dateFormat="dd MMMM yyyy"
                      locale={id}
                      onChange={val => {
                        this.setState({ selectedEndDateFilter: val });
                      }}
                      isInvalid={this.state.validationSearch?.EndDate ? true : null}
                    />
                  </div>
                  <Form.Control.Feedback type="invalid">{this.state.validationSearch?.EndDate}</Form.Control.Feedback>
                </Col>
              </Row>
              <Row>
                <Col sm={5}>
                  <Input
                    type="text"
                    value={this.state.keywordFilter}
                    onChange={((event) => {
                      this.setState({ keywordFilter: event.target.value });
                    })}
                    placeholder="nama pelatihan..."
                  />
                  <Form.Control.Feedback type="invalid">{this.state.validationSearch?.Keyword}</Form.Control.Feedback>
                </Col>
              </Row>
              <Row>
                <Col sm={5}>
                  <AsyncTypeahead
                    id="loader-employee"
                    ref={(typeahead) => {
                      this.typeaheadEmployee = typeahead;
                    }}
                    isLoading={this.state.isAutoCompleteLoading}
                    onChange={(selected) => {
                      this.setState({ selectedEmployeeFilter: selected[0] });
                    }}
                    labelKey="NameAndEmployeeIdentity"
                    minLength={1}
                    onSearch={this.handleEmployeeSearch}
                    options={this.state.employees}
                    placeholder="Cari karyawan..."
                  />
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <Button
                    className="btn btn-light mr-2"
                    name="upload"
                    onClick={this.resetFilter}
                  >
                    Reset
                  </Button>
                  <Button
                    className="btn btn-primary mr-2"
                    name="search"
                    onClick={this.search}
                  >
                    Cari
                  </Button>
                  {/* {this.state.downloadLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : ( */}
                  <Button
                    disabled={this.state.downloadLoading}
                    className="btn btn-success"
                    name="download-employeeTraining"
                    onClick={this.print}
                  >
                    Download Excel
                  </Button>
                  {/* )} */}
                </Col>
              </Row>
            </FormGroup>

            <div>
              {this.state.loadingData ? (
                <span>
                  <Spinner size="sm" color="primary" /> Loading Data...
                </span>
              ) : (
                <div>
                  <div id="sliderContainer" ref={this.sliderContainer}>
                    <DragScrollTable
                      elementContainer={document.getElementById(
                        "sliderContainer"
                      )}
                    >
                      <thead>
                        <tr className={"text-center"}>
                          <th>NIK</th>
                          <th>Nama Karyawan</th>
                          <th>Unit</th>
                          <th>Seksi</th>
                          <th>Grup</th>
                          <th>Jenis Pelatihan</th>
                          <th>Pelatihan</th>
                          <th>Tanggal</th>
                          <th>Total Jam</th>
                          <th>Instruktur</th>
                          <th>Penyelenggara</th>
                          <th>Nilai</th>
                          <th>Keterangan</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>{items}</tbody>
                    </DragScrollTable>
                  </div>
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
                </div>
              )}
            </div>

            <Modal
              aria-labelledby="modal_add_employeeTraining"
              dialogClassName="modal-90w"
              show={this.state.isShowAddEmployeeTrainingModal}
              onHide={() => this.showAddEmployeeTrainingModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal_add_employeeTraining">
                  Tambah Training
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col>
                    <AsyncTypeahead
                      id="loader-employee-create-form"
                      ref={(typeahead) => {
                        this.typeaheadEmployeeCreateForm = typeahead;
                      }}
                      isLoading={this.state.isAutoCompleteLoading}
                      onChange={(selected) => {
                        const { form } = this.state;
                        form["employee"] = selected[0];
                        form["EmployeeId"] = selected[0]?.Id;
                        form["UnitId"] = selected[0]?.UnitId;
                        this.setState({ form: form }, () => {
                          // console.log(this.state)
                        });
                      }}
                      labelKey="NameAndEmployeeIdentity"
                      minLength={1}
                      onSearch={this.handleEmployeeSearchModal}
                      options={this.state.employees}
                      placeholder="Cari karyawan..."
                      isInvalid={
                        this.state.validationCreateForm?.EmployeeIdentity
                          ? true
                          : null
                      }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.employee?.Name}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.employee?.Unit}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>
                      {this.state.form?.employee?.Section}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Grup</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.employee?.Group}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Tanggal</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      type="date"
                      name="Date"
                      id="Date"
                      value={
                        this.state.form.Date
                          ? moment(this.state.form.Date).format("YYYY-MM-DD")
                          : ""
                      }
                      onChange={(val) => {
                        // console.log(val.target.value);
                        const { form } = this.state;
                        form["Date"] = val.target.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={
                        this.state.validationCreateForm?.Date ? true : null
                      }
                    ></Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm?.Date}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Jenis Pelatihan</Form.Label>
                  </Col>
                  <Col>
                    {/* <Form.Control
                        type="text"
                        name="TrainingType"
                        value={this.state.form.TrainingType}
                        onChange={(e) => {
                          const { form } = this.state;
                          form[e.target.name] = e.target.value;
                          return this.setState({ form: form });
                        }}
                        isInvalid={this.state.validationCreateForm.TrainingType}
                      /> */}
                    <Select
                      className={
                        this.state.validationCreateForm?.TrainingType
                          ? "invalid-select"
                          : ""
                      }
                      isClearable={true}
                      options={this.state.competencyTypes}
                      value={this.state.selectedType}
                      onChange={(value) => {
                        this.setCompetencyByType(value.value);
                        this.setState({ selectedType: value, selectedCompetency: null });
                      }}
                    ></Select>
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm?.TrainingType}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Pelatihan</Form.Label>
                  </Col>
                  <Col>
                    {/* <Form.Control
                        as="textarea"
                        rows="3"
                        name="TrainingName"
                        value={this.state.form.TrainingName}
                        onChange={(e) => {
                          var { form } = this.state;
                          form[e.target.name] = e.target.value;
                          return this.setState({ form: form });
                        }}
                        isInvalid={this.state.validationCreateForm.TrainingName}
                      /> */}
                    <Select
                      className={
                        this.state.validationCreateForm?.TrainingName
                          ? "invalid-select"
                          : ""
                      }
                      isClearable={true}
                      options={this.state.competencies}
                      value={this.state.selectedCompetency}
                      onChange={(value) => {
                        this.setState({ selectedCompetency: value });
                      }}
                    ></Select>
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm?.TrainingName}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Total Jam</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      name="TotalHours"
                      value={this.state.form.TotalHours}
                      onChange={(e) => {
                        var { form } = this.state;
                        form[e.target.name] = e.target.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={this.state.validationCreateForm?.TotalHours}
                    />
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm?.TotalHours}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Instruktur</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      type="text"
                      name="Instructor"
                      value={this.state.form.Instructor}
                      onChange={(e) => {
                        const { form } = this.state;
                        form[e.target.name] = e.target.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={
                        this.state.validationCreateForm?.Instructor
                          ? true
                          : null
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm?.Instructor}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Penyelenggara</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      className={
                        this.state.validationCreateForm?.Organizer
                          ? "invalid-select"
                          : ""
                      }
                      placeholder={"Pilih penyelenggara"}
                      isClearable={true}
                      options={this.state.organizers}
                      value={this.state.selectedOrganizer}
                      onChange={(value) => {
                        this.setState({ selectedOrganizer: value });
                      }}
                    ></Select>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Nilai Efektivitas</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      className={
                        this.state.validationCreateForm?.Effectiveness
                          ? "invalid-select"
                          : ""
                      }
                      placeholder={"Pilih nilai"}
                      isClearable={true}
                      options={this.state.effectiveness}
                      value={this.state.selectedEffectiveness}
                      onChange={(value) => {
                        this.setState({ selectedEffectiveness: value });
                      }}
                    ></Select>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Keterangan</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      name="Remark"
                      value={this.state.form.Remark}
                      onChange={(e) => {
                        var { form } = this.state;
                        form[e.target.name] = e.target.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={this.state.validationCreateForm?.Remark}
                    />
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm?.Remark}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                {this.state.isCreateLoading ? (
                  <span>
                    <Spinner size="sm" color="primary" /> Mohon tunggu...
                  </span>
                ) : (
                  <div>
                    <Button
                      className="btn btn-success"
                      name="create-employeeTraining"
                      onClick={this.handleCreateEmployeeTraining}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal
              aria-labelledby="modal-delete-employeeTraining"
              show={this.state.isShowDeleteEmployeeTrainingModal}
              onHide={() => this.showDeleteEmployeeTrainingModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-delete-employeeTraining">
                  Hapus Training
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Apakah anda yakin ingin menghapus data ini?
              </Modal.Body>
              <Modal.Footer>
                {this.state.isDeleteEmployeeTrainingLoading ? (
                  <span>
                    <Spinner size="sm" color="primary" /> Mohon tunggu...
                  </span>
                ) : (
                  <div>
                    <Button
                      className="btn btn-danger"
                      name="delete-employeeTraining"
                      onClick={this.deleteEmployeeTrainingClickHandler}
                    >
                      Hapus
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal
              aria-labelledby="modal-edit-employeeTraining"
              dialogClassName="modal-90w"
              show={this.state.isShowEditEmployeeTrainingModal}
              onHide={() => this.showEditEmployeeTrainingModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-edit-employeeTraining">
                  Edit Training
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>
                      {this.state.selectedItem?.EmployeeIdentity}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>
                      {this.state.selectedItem?.EmployeeName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.selectedItem?.Unit}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.selectedItem?.Section}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Grup</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.selectedItem?.Group}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Tanggal</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      type="date"
                      name="Date"
                      id="Date"
                      value={
                        this.state.form?.Date
                          ? moment(this.state.form.Date).format("YYYY-MM-DD")
                          : ""
                      }
                      onChange={(val) => {
                        // console.log(val.target.value);
                        var { form } = this.state;
                        form["Date"] = val.target.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={
                        this.state.validationCreateForm.Date ? true : null
                      }
                    ></Form.Control>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Jenis Pelatihan</Form.Label>
                  </Col>
                  <Col>
                    {/* <Form.Control
                        type="text"
                        name="TrainingType"
                        value={this.state.form.TrainingType}
                        onChange={(e) => {
                          var { form } = this.state;
                          form[e.target.name] = e.target.value;
                          return this.setState({ form: form });
                        }}
                        isInvalid={this.state.validationCreateForm.TrainingType}
                      /> */}
                    <Select
                      className={
                        this.state.validationCreateForm.TrainingType
                          ? "invalid-select"
                          : ""
                      }
                      isClearable={true}
                      options={this.state.competencyTypes}
                      value={this.state.selectedType}
                      onChange={(value) => {
                        this.setCompetencyByType(value.value);
                        this.setState({ selectedType: value, selectedCompetency: null });
                      }}
                    ></Select>
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm.TrainingType}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Pelatihan</Form.Label>
                  </Col>
                  <Col>
                    {/* <Form.Control
                        as="textarea"
                        rows="3"
                        name="TrainingName"
                        value={this.state.form.TrainingName}
                        onChange={(e) => {
                          var { form } = this.state;
                          form[e.target.name] = e.target.value;
                          return this.setState({ form: form });
                        }}
                        isInvalid={this.state.validationCreateForm.TrainingName}
                      /> */}
                    <Select
                      className={
                        this.state.validationCreateForm.TrainingName
                          ? "invalid-select"
                          : ""
                      }
                      isClearable={true}
                      options={this.state.competencies}
                      value={this.state.selectedCompetency}
                      onChange={(value) => {
                        this.setState({ selectedCompetency: value });
                      }}
                    ></Select>
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm.TrainingName}
                    </Form.Control.Feedback>
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm.DuplicateTrainingName}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Total Jam</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      name="TotalHours"
                      value={this.state.form.TotalHours}
                      onChange={(e) => {
                        var { form } = this.state;
                        form[e.target.name] = e.target.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={this.state.validationCreateForm.TotalHours}
                    />
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm.TotalHours}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Instruktur</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      type="text"
                      name="Instructor"
                      value={this.state.form.Instructor}
                      onChange={(e) => {
                        const { form } = this.state;
                        form[e.target.name] = e.target.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={this.state.validationCreateForm.Instructor}
                    />
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm.TrainingType}
                    </Form.Control.Feedback>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Penyelenggara</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      className={
                        this.state.validationCreateForm.Organizer
                          ? "invalid-select"
                          : ""
                      }
                      isClearable={true}
                      placeholder={"Pilih penyelenggara"}
                      options={this.state.organizers}
                      value={this.state.selectedOrganizer}
                      onChange={(value) => {
                        this.setState({ selectedOrganizer: value });
                      }}
                    ></Select>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Nilai Efektivitas</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      className={
                        this.state.validationCreateForm.Effectiveness
                          ? "invalid-select"
                          : ""
                      }
                      placeholder={"Pilih nilai"}
                      isClearable={true}
                      options={this.state.effectiveness}
                      value={this.state.selectedEffectiveness}
                      onChange={(value) => {
                        this.setState({ selectedEffectiveness: value });
                      }}
                    ></Select>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Keterangan</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      as="textarea"
                      rows="3"
                      name="Remark"
                      value={this.state.form.Remark}
                      onChange={(e) => {
                        var { form } = this.state;
                        form[e.target.name] = e.target.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={this.state.validationCreateForm.Remark}
                    />
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm.Remark}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                {this.state.isEditLoading ? (
                  <span>
                    <Spinner size="sm" color="primary" /> Mohon tunggu...
                  </span>
                ) : (
                  <div>
                    <Button
                      className="btn btn-success"
                      name="edit-employeeTraining"
                      onClick={this.handleEditEmployeeTraining}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal
              aria-labelledby="modal-upload-employeeTraining"
              dialogClassName="modal-90w"
              show={this.state.isShowUploadModal}
              onHide={() => this.showUploadModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-set-jadwal">Upload Training</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div>
                  <input
                    type="file"
                    name="file"
                    onChange={this.onInputFileHandler}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                {this.state.uploadFileLoading ? (
                  <span>
                    <Spinner size="sm" color="primary" /> Mohon tunggu...
                  </span>
                ) : (
                  <div>
                    <Button
                      className="btn btn-success"
                      name="upload_file"
                      onClick={this.handleUploadEmployeeTraining}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>
          </Form>
        )}
      </div>
    );
  };
}

export default EmployeeTraining;
