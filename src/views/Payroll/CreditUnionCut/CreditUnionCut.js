import React, { Component } from "react";
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from "reactstrap";
import {
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
import RowButtonComponent from "./../../../react-components/RowButtonComponent";
import * as CONST from "../../../Constant";
import axios from "axios";
import Service from "./../Service";
import swal from "sweetalert";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./style.css";

const moment = require("moment");
const minimumDate = new Date(1945, 8, 17);
const DOWNLOAD_REPORT_CREDIT_UNION_CUT_PDF = "credit-union-cut/report-credit-union-cut-pdf";
var fileDownload = require("js-file-download");
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";

class CreditUnionCut extends Component {
  typeaheadEmployeeCreateForm = {};
  typeaheadEmployeeSearchForm = {};
  state = {
    loading: false,
    isCreateLoading: false,
    isEditLoading: false,
    isAutoCompleteLoading: false,
    uploadFileLoading: false,
    isShowUploadModal: false,
    deleteCreditUnionCutLoading: false,

    selectedFile: null,
    selectedUnit: null,
    selectedSection: null,
    selectedGroup: null,
    selectedUnitToCreate: null,
    selectedDayOfDuty: null,
    selectedAreaOfDuty: null,
    selectedStartPeriode: new Date(),
    selectedEndPeriode: new Date(),
    selectedSearchUnit: null,
    selectedSearchSection: null,
    selectedSearchGroup: null,
    selectedSearchEmployee: null,
    dateRange: [],
    dateRangeLength: 0,
    selectedCreditUnionCut: {},

    units: [],
    groups: [],
    sections: [],
    employees: [],

    searchUnits: [],
    searchSections: [],
    searchGroups: [],
    searchEmployee: [],

    // minimum date value js
    startDate: "",
    endDate: "",

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],

    validationSearch: {},
    form: {},
    //replace Form :
    DateOfDuty: null,
    TotalHours: null,
    TotalCreditUnionCut: null,

    //modal state
    isShowAddCreditUnionCutModal: false,
    isShowEditCreditUnionCutModal: false,
    isShowViewCreditUnionCutModal: false,
    isShowDeleteCreditUnionCutModal: false,

    dayOfDuty: [
      {
        name: "HariKerjaBiasa",
        label: "Hari Kerja Biasa",
        value: "Hari Kerja Biasa",
      },
      {
        name: "HariLiburLRCR",
        label: "Hari Libur LR/CR",
        value: "Hari Libur LR/CR",
      },
    ],
    areaOfDuty: [
      {
        name: "dalamSolo",
        label: "Dalam batas eks keresidenan solo",
        value: "Dalam batas eks keresidenan solo",
      },
      { name: "JawaTengah", label: "Jawa Tengah", value: "Jawa Tengah" },
      { name: "JawaTimur", label: "Jawa Timur", value: "Jawa Timur" },
      { name: "JawaBarat", label: "Jawa Barat", value: "Jawa Barat" },
      {
        name: "Bandung",
        label: "Bandung, Jabodetabek",
        value: "Bandung, Jabodetabek",
      },
      {
        name: "Bali",
        label: "Bali dan Luar Jawa",
        value: "Bali dan Luar Jawa",
      },
    ],
    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    otherUnitId: JSON.parse(localStorage.getItem("otherUnitId"))
  };
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
    });
  };

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
    //   this.setEmployeeSearch();
  }
  setData = () => {
    this.resetPagingConfiguration();
    const params = {
      unitId: this.state.selectedSearchUnit
        ? this.state.selectedSearchUnit.Id
        : 0,
      groupId: this.state.selectedSearchGroup
        ? this.state.selectedSearchGroup.Id
        : 0,
      sectionId: this.state.selectedSearchSection
        ? this.state.selectedSearchSection.Id
        : 0,
      employeeId: this.state.selectedSearchEmployee
        ? this.state.selectedSearchEmployee.Id
        : 0,
      page: this.state.activePage,
      startDate: moment(this.state.startDate).format("YYYY-MM-DD"),
      endDate: moment(this.state.endDate).format("YYYY-MM-DD"),
    };

    this.setState({ loadingData: true });
    this.service
      .getCreditUnionCut(params)
      .then((result) => {
        this.setState({
          activePage: result.page,
          total: result.total,
          tableData: result.data,
          loadingData: false,
        });
      })
      .catch((err) => {
        this.setState({
          activePage: 1,
          total: 0,
          tableData: [],
          loadingData: false,
        });
      });
  };

  setGroups = () => {
    this.setState({ loading: true });
    this.service.getAllGroups().then((result) => {
      this.setState({ groups: result, loading: false });
    });
  };

  setSections = () => {
    this.setState({ loading: true });
    this.service.getAllSections().then((result) => {
      this.setState({ sections: result, loading: false });
    });
  };

  setUnits = () => {
    this.setState({ loading: true });
    this.service.getAllUnits().then((result) => {
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
  };

  setGroupsSearch = (sectionId) => {
    // this.setState({ loading: true })
    if (sectionId == null) {
      this.service.getAllGroups().then((result) => {
        this.setState({ searchGroups: result });
      });
    } else {
      this.service.getAllGroupsBySection(sectionId).then((result) => {
        var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm.getInstance();
        instanceEmployeeSearch.clear();
        this.setState({
          searchGroups: result,
          selectedSearchGroup: null,
          selectedSearchEmployee: null,
        });
      });
    }
  };

  setSectionsSearch = (unitId) => {
    // this.setState({ loading: true })
    if (unitId == null) {
      this.service.getAllSections().then((result) => {
        this.setState({ searchSections: result });
      });
    } else {
      this.service.getAllSectionsByUnit(unitId).then((result) => {
        var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm.getInstance();
        instanceEmployeeSearch.clear();
        this.setState({
          searchSections: result,
          selectedSearchGroup: null,
          selectedSearchSection: null,
          selectedSearchEmployee: null,
        });
      });
    }
  };

  setUnitsSearch = () => {
  
    this.service.getAllUnits()
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

        this.setState({ searchUnits: units })

      });
  };

  setEmployeeSearch = () => {
    //   console.log(this.state);
    let params = {};
    params.unitId = this.state.selectedSearchUnit?.Id;
    params.groupId = this.state.selectedSearchGroup?.Id;
    params.sectionId = this.state.selectedSearchSection?.Id;
    params.employeeId = this.state.selectedSearchEmployee?.Id;
    // params.unitId = params?.unitId??0;
    // params.groupId = params?.groupId??0;
    // params.sectionId = params?.sectionId??0;
    // params.employeeId = params?.employeeId??0;
    // console.log(params);

    // console.log(this);
    // this.setState({ loading: true })
    this.service.searchEmployeeSearch(params).then((result) => {
      console.log(result);
      this.setState({ searchEmployee: result });
    });
  };

  search = () => {
    this.setState({ validationSearch: {} });
    //   if(moment(this.state.startDate) >moment(this.state.endDate)){
    //   this.setState({validationSearch:{StartDate:"Tanggal Awal Harus Kurang Dari Tanggal Akhir"}})
    //   }
    //   else if(this.state.startDate == null || this.state.startDate==""){
    //   this.setState({validationSearch:{StartDate:"Tanggal Awal Harus DIisi"}})
    //   }
    //   else if(this.state.endDate == null || this.state.endDate==""){
    //   this.setState({validationSearch:{endDate:"Tanggal Akhir Harus DIisi"}})
    //   }
    //   else{
    //   this.setData();
    //   }
    this.setData();
  };
  onFileUploadChangeHandler = (event) => {
    this.setFile(event.target.files[0]);
  };
  setFile = (file) => {
    this.setState({ selectedFile: file });
  };
  uploadClickHandler = () => {
    this.setState({ uploadFileLoading: true });

    var data = new FormData();
    data.append("file", this.state.selectedFile);

    const url = `${CONST.URI_ATTENDANCE}credit-union-cut/upload`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .post(url, data, { headers: headers })
      .then(() => {
        alert("Data berhasil di upload!");
        this.setState({ uploadFileLoading: false, activePage: 1, page: 1 });
        this.showUploadModal(false);
        this.setData();
      })
      .catch(() => {
        alert("Terjadi kesalahan!");
        this.setState({ uploadFileLoading: false });
      });
  };
  handleEmployeeSearchModal = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    // const params = {
    //   unitId: this.state.selectedUnitToCreate ? this.state.selectedUnitToCreate.Id : 0,
    //   keyword: query
    // }
    const params = {
      keyword: query,
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
  showUploadModal = (value) => {
    this.setState({ isShowUploadModal: value });
  };
  handleEmployeeFilter = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const params = {
      unitId: this.state.selectedSearchUnit
        ? this.state.selectedSearchUnit.Id
        : 0,
      groupId: this.state.selectedSearchGroup
        ? this.state.selectedSearchGroup.Id
        : 0,
      sectionId: this.state.selectedSearchSection
        ? this.state.selectedSearchSection.Id
        : 0,
      keyword: query,
    };

    this.service.searchEmployeeSearch(params).then((result) => {
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
  };

  resetCreateModalValue = () => {
    this.setState({
      form: {},

      selectedEmployeeToCreate: null,
      selectedUnitToCreate: null,
      selectedDayOfDuty: null,
      selectedAreaOfDuty: null,
    });
  };

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
      //   startDate :null,
      //   endDate : null,
      selectedSearchGroup: null,
      selectedSearchUnit: null,
      selectedSearchSection: null,
      selectedSearchEmployee: null,
    });
    var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm.getInstance();
    instanceEmployeeSearch.clear();
  };

  create = () => {
    this.showAddCreditUnionCutModal(true);
  };

  showAddCreditUnionCutModal = (value) => {
    this.resetCreateModalValue();
    this.setState({
      isShowAddCreditUnionCutModal: value,
      isCreateLoading: false,
    });
  };

  showDeleteCreditUnionCutModal = (value) => {
    this.setState({
      isShowDeleteCreditUnionCutModal: value,
      deleteCreditUnionCutLoading: false,
    });
  };

  handleCreateCreditUnionCut = () => {
    //   console.log(this.state.form);
    const payload = {
      EmployeeId: this.state.selectedEmployeeToCreate?.Id,
      DateCuts: this.state.form.DateCuts,
      CutCash: this.state.form.CutCash,
    };

    this.setState({ isCreateLoading: true });
    this.service
      .createCreditUnionCut(payload)
      .then((result) => {
        // console.log(result);
        swal({
          icon: "success",
          title: "Good...",
          text: "Data berhasil disimpan!",
        });
        this.setState({ isCreateLoading: false }, () => {
          this.resetPagingConfiguration();
          this.setData();
          this.showAddCreditUnionCutModal(false);
        });
      })
      .catch((error) => {
        if (error) {
          let message = "";
          if (error.DayOfDuty) message += `- ${error.DayOfDuty}\n`;

          if (error.DateOfDuty) message += `- ${error.DateOfDuty}\n`;

          if (error.TotalHours) message += `- ${error.TotalHours}\n`;

          if (error.AreaOfDuty) message += `- ${error.AreaOfDuty}\n`;

          if (error.Task) message += `- ${error.Task}\n`;

          if (error.MealAllowanceTotal)
            message += `- ${error.MealAllowanceTotal}\n`;

          if (error.MealAllowanceCash)
            message += `- ${error.MealAllowanceCash}\n`;

          if (error.DutyAllowanceCash)
            message += `- ${error.DutyAllowanceCash}\n`;

          this.setState({ isCreateLoading: false });
          swal({
            icon: "error",
            title: "Oops...",
            text: message,
          });
        }
      });
    // console.log(payload);
  };

  handleEditCreditUnionCutClick = (CreditUnionCut) => {
    this.setState({ selectedCreditUnionCut: CreditUnionCut }, () => {
      this.getCreditUnionCutById(CreditUnionCut.Id, "EDIT");
    });
  };

  handleDeleteCreditUnionCutClick = (CreditUnionCut) => {
    this.setState({ selectedCreditUnionCut: CreditUnionCut }, () => {
      this.showDeleteCreditUnionCutModal(true);
    });
  };

  handleViewCreditUnionCutClick = (CreditUnionCut) => {
    this.setState({ selectedCreditUnionCut: CreditUnionCut }, () => {
      this.getCreditUnionCutById(CreditUnionCut.Id, "VIEW");
    });
  };

  deleteCreditUnionCutClickHandler = () => {
    this.setState({ deleteCreditUnionCutLoading: true });

    const url = `${CONST.URI_ATTENDANCE}credit-union-cut/${this.state.selectedCreditUnionCut.Id}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    Promise.all([axios.delete(url, { headers: headers })])
      .then((values) => {
        console.log(values);

        alert("Data Berhasil dihapus");
        this.setState({ deleteCreditUnionCutLoading: false });
        this.setData();
      })
      .catch((err) => {
        if (err.response.status == 400) {
          alert("Data Berhasil dihapus");
          this.setState({ deleteCreditUnionCutLoading: false });
        } else {
          alert("Terjadi kesalahan!");
          this.setState({ deleteCreditUnionCutLoading: false });
        }
        console.log(err.response);
        this.setState({ deleteCreditUnionCutLoading: false });
      })
      .then(() => {
        this.showDeleteCreditUnionCutModal(false);
        this.setData();
      });
  };

  handleEditCreditUnionCut = () => {
    this.updateCreditUnionCut();
  };
  upload = (event) => {
    event.preventDefault();
    this.showUploadModal(true);
  };

  updateCreditUnionCut = () => {
    this.setState({ updateEmployeeLoading: true });

    const url = `${CONST.URI_ATTENDANCE}credit-union-cut/update`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .post(url, this.state.selectedCreditUnionCut, { headers: headers })
      .then(() => {
        swal("Data berhasil disimpan!");
        this.setState(
          {
            isEditLoading: false,
            selectedCreditUnionCut: {},
            page: 1,
            activePage: 1,
          },
          () => {
            this.showEditCreditUnionCutModal(false);
            this.setData();
          }
        );
      })
      .catch((err) => {
        if (err.response) {
          // this.setState({ validationCreateForm: err.response.data.error });
          console.log(this.state);
        }
        // alert("Terjadi kesalahan!");
        this.setState({ isEditLoading: false });
        this.setData();
      });
  };

  getCreditUnionCutById = (id, state) => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}credit-union-cut/${id}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        var selectedCreditUnionCut = data.data;
        selectedCreditUnionCut.DateCuts = moment(
          selectedCreditUnionCut.DateCuts
        ).format("YYYY-MM-DD");
        // console.log(selectedCreditUnionCut);

        // var selectedUnit = this.state.units.find(f => f.Id === selectedCreditUnionCut.Unit.Id);
        // console.log("nyame2")
        // console.log("nyampe");
        this.setState(
          {
            loading: false,
            activePage: 1,
            page: 1,
            //   selectedUnitToCreate : selectedUnit,
            selectedCreditUnionCut: selectedCreditUnionCut,
          },
          () => {
            if (state === "VIEW") this.showViewCreditUnionCutModal(true);
            else if (state === "EDIT") this.showEditCreditUnionCutModal(true);
          }
        );
      })
      .catch((err) => {
        alert("Terjadi kesalahan!");
        this.setState({ loading: false });
      });
  };

  showEditCreditUnionCutModal = (value) => {
    if (!value) this.setState({ selectedCreditUnionCut: {} });

    this.setState({
      isShowEditCreditUnionCutModal: value,
      isEditLoading: false,
    });
  };
  showViewCreditUnionCutModal = (value) => {
    if (!value) this.setState({ selectedCreditUnionCut: {} });

    this.setState({ isShowViewCreditUnionCutModal: value });
  };

  downloadCreditUnionCutPdf = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({
        validationSearch: {
          StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir",
        },
      });
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({
        validationSearch: { StartDate: "Tanggal Awal Harus Diisi" },
      });
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({
        validationSearch: { EndDate: "Tanggal Akhir Harus Diisi" },
      });
    } else {
      this.dataCreditUnionCut();
    }
  };

  dataCreditUnionCut = () => {
    console.log("selectedSearchEmployee ", this.state.selectedSearchEmployee);
    this.setState({ loadingData: true });

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?adminEmployeeId=${adminEmployeeId}`;

    if (this.state.selectedSearchEmployee)
      query += "&employeeId=" + this.state.selectedSearchEmployee?.Id;

    if (this.state.startDate)
      query +=
        "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD");

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD");

    if (this.state.selectedSearchUnit)
      query += "&unitId=" + this.state.selectedSearchUnit?.Id;

    if (this.state.selectedSearchGroup)
      query += "&groupId=" + this.state.selectedSearchGroup?.Id;
    if (this.state.selectedSearchSection)
      query += "&sectionId=" + this.state.selectedSearchSection?.Id;

    console.log("query", query);

    const value = localStorage.getItem("token");
    const Header = {
      accept: "application/json",
      Authorization: `Bearer ` + value,
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios({
      method: "get",
      url: CONST.URI_ATTENDANCE + DOWNLOAD_REPORT_CREDIT_UNION_CUT_PDF + query,
      responseType: "blob",
      headers: Header,
    })
      .then((data) => {
        console.log(data);
        let disposition = data.headers["content-disposition"];
        let filename = decodeURI(disposition.match(/filename="(.*)"/)[1]);

        fileDownload(data.data, filename);
        this.setState({ loading: false, loadingData: false });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false, loadingData: false });
      });
  };

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item, index) => {
      return (
        <tbody key={index}>
          <tr>
            <td>{item.EmployeeIdentity}</td>
            <td>{item.EmployeeName}</td>
            <td>{item.UnitName}</td>
            <td>{item.SectionName}</td>
            <td>{item.GroupName}</td>
            <td>{item.CutCash}</td>
            <td>{moment(item.DateCuts).format("DD-MM-YYYY")}</td>
            <td>
              <Form>
                <FormGroup>
                  <RowButtonComponent
                    className="btn btn-success"
                    name="view-credit-union-cut"
                    onClick={this.handleViewCreditUnionCutClick}
                    data={item}
                    iconClassName="fa fa-eye"
                    label=""
                  ></RowButtonComponent>
                  <RowButtonComponent
                    className="btn btn-primary"
                    name="edit-credit-union-cut"
                    onClick={this.handleEditCreditUnionCutClick}
                    data={item}
                    iconClassName="fa fa-pencil-square"
                    label=""
                  ></RowButtonComponent>
                  <RowButtonComponent
                    className="btn btn-danger"
                    name="delete-credit-union-cut"
                    onClick={this.handleDeleteCreditUnionCutClick}
                    data={item}
                    iconClassName="fa fa-trash"
                    label=""
                  ></RowButtonComponent>
                </FormGroup>
              </Form>
            </td>
          </tr>
        </tbody>
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
              <Button
                className="btn btn-primary btn-sm mr-3"
                name="upload-driver-allowance"
                onClick={this.upload}
              >
                Upload Data
              </Button>
              <Button
                className="btn btn-success btn-sm mr-3"
                name="input-driver-allowance"
                onClick={this.create}
              >
                Tambah Data
              </Button>
            </FormGroup>
            <FormGroup>
              <Row>
                <Col sm={1} className={"text-right"}>
                  <FormLabel>Unit/Bagian</FormLabel>
                </Col>
                <Col sm={4}>
                  <Select
                    placeholder={"pilih unit"}
                    isClearable={true}
                    options={this.state.searchUnits}
                    value={this.state.selectedSearchUnit}
                    onChange={(value) => {
                      // console.log(value);
                      if (value != null) {
                        this.setSectionsSearch(value.Id);
                      } else {
                        this.setSectionsSearch(null);
                      }

                      this.setState({ selectedSearchUnit: value }, () => {
                        // this.setEmployeeSearch();
                      });
                    }}
                  />
                </Col>
              </Row>
            </FormGroup>
            <FormGroup>
              <Row>
                <Col sm={1} className={"text-right"}>
                  <FormLabel>Seksi</FormLabel>
                </Col>
                <Col sm={4}>
                  <Select
                    placeholder={"pilih seksi"}
                    isClearable={true}
                    options={this.state.searchSections}
                    value={this.state.selectedSearchSection}
                    onChange={(value) => {
                      if (value != null) {
                        this.setGroupsSearch(value.Id);
                      } else {
                        this.setGroupsSearch(null);
                      }

                      this.setState({ selectedSearchSection: value }, () => {
                        // this.setEmployeeSearch();
                      });
                    }}
                  />
                </Col>
              </Row>
            </FormGroup>
            <FormGroup>
              <Row>
                <Col sm={1} className={"text-right"}>
                  <FormLabel>Group</FormLabel>
                </Col>
                <Col sm={4}>
                  <Select
                    placeholder={"pilih group"}
                    isClearable={true}
                    options={this.state.searchGroups}
                    value={this.state.selectedSearchGroup}
                    onChange={(value) => {
                      this.setState({ selectedSearchGroup: value }, () => {
                        // this.setEmployeeSearch();
                      });
                    }}
                  />
                </Col>
              </Row>
            </FormGroup>
            <FormGroup>
              <Row>
                <Col sm={1} className={"text-right"}>
                  <FormLabel>Periode</FormLabel>
                </Col>
                <Col sm={4}>
                  <Row>
                    <Col sm={5}>
                      <DatePicker
                        className="datePickerMonthYearOnly"
                        name="Period"
                        id="Period"
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        value={
                          this.state.startDate
                            ? moment(this.state.startDate).format("MMMM yyyy")
                            : ""
                        }
                        onChange={(value) => {
                          return this.setState({ startDate: value });
                        }}
                      />
                      <br />
                      <span style={{ color: "red" }}>
                        {this.state.validationSearch?.StartDate}
                      </span>
                    </Col>
                    <Col sm={2} className={"text-center"}>
                      s/d
                    </Col>
                    <Col sm={5}>
                      <span className="pull-right">
                        <DatePicker
                          className="datePickerMonthYearOnly"
                          name="Period"
                          id="Period"
                          dateFormat="MMMM yyyy"
                          showMonthYearPicker
                          value={
                            this.state.endDate
                              ? moment(this.state.endDate).format("MMMM yyyy")
                              : ""
                          }
                          onChange={(value) => {
                            return this.setState({ endDate: value });
                          }}
                        />
                        <br />
                        <span style={{ color: "red" }}>
                          {this.state.validationSearch?.EndDate}
                        </span>
                      </span>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </FormGroup>
            <FormGroup>
              <Row>
                <Col sm={1} className={"text-right"}>
                  <FormLabel>Karyawan</FormLabel>
                </Col>
                <Col sm={4}>
                  {/* <Select
                                placeholder={'pilih karyawan'}
                                isClearable={true}
                                options={this.state.searchEmployee}
                                value={this.state.selectedSearchEmployee}
                                onChange={(value) => {
                                    console.log(this.state.searchEmployee);
                                    console.log(value);
                                    this.setState({ selectedSearchEmployee: value });
                                }}
                                /> */}
                  <AsyncTypeahead
                    id="loader-employee-search-form"
                    ref={(typeahead) => {
                      this.typeaheadEmployeeSearchForm = typeahead;
                    }}
                    isLoading={this.state.isAutoCompleteLoading}
                    onChange={(selected) => {
                      // console.log(this.state.searchEmployee);
                      this.setState({ selectedSearchEmployee: selected[0] });
                    }}
                    labelKey="NameAndEmployeeIdentity"
                    minLength={1}
                    onSearch={this.handleEmployeeFilter}
                    options={this.state.searchEmployee}
                    placeholder="Cari karyawan..."
                  />

                  {/* <AsyncTypeahead
                                        id="loader-employee-create-form"
                                        ref={(typeahead) => { this.typeaheadEmployeeCreateForm = typeahead }}
                                        isLoading={this.state.isAutoCompleteLoading}
                                        onChange={(selected) => {
                                        this.setState({ selectedEmployeeToCreate: selected[0] });
                                        }}
                                        labelKey="NameAndEmployeeIdentity"
                                        minLength={1}
                                        onSearch={this.handleEmployeeSearchModal}
                                        options={this.state.employees}
                                        placeholder="Cari karyawan..."
                                    /> */}
                </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              <Row>
                <Col sm={1}></Col>
                <Col sm={4}>
                  <Button
                    className="btn btn-secondary btn-sm mr-3"
                    name="reset"
                    onClick={this.resetPagingConfiguration}
                  >
                    Reset
                  </Button>
                  <Button
                    className="btn btn-primary btn-sm mr-3"
                    name="search"
                    onClick={this.search}
                  >
                    Cari
                  </Button>
                </Col>

                <Col sm={7}>
                  <Button
                    className="btn btn-primary  btn-sm mr-3  pull-right"
                    name="credit-union-cut"
                    onClick={this.downloadCreditUnionCutPdf}
                  >
                    Laporan Potongan Koperasi
                  </Button>
                </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              {this.state.loadingData ? (
                <span>
                  <Spinner size="sm" color="primary" /> Loading Data...
                </span>
              ) : this.state.tableData.length <= 0 ? (
                <Table responsive bordered striped>
                  <thead>
                    <tr className={"text-center"}>
                      <th>NIK</th>
                      <th>Nama</th>
                      <th>Unit/Bagian</th>
                      <th>Seksi</th>
                      <th>Group</th>
                      <th>Potongan/Bulan(Rp)</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr key="0">
                      <td colSpan="7" className="text-center">
                        Data Kosong
                      </td>
                    </tr>
                  </tbody>
                </Table>
              ) : (
                <Row>
                  <Table responsive bordered striped>
                    <thead>
                      <tr className={"text-center"}>
                        <th>NIK</th>
                        <th>Nama</th>
                        <th>Unit/Bagian</th>
                        <th>Seksi</th>
                        <th>Group</th>
                        <th>Potongan/Bulan(Rp)</th>
                        <th>Tanggal</th>
                        <th></th>
                      </tr>
                    </thead>
                    {items}
                  </Table>
                  {/* <Pagination
                                    activePage={this.state.activePage}
                                    itemsCountPerPage={10}
                                    totalItemsCount={this.state.total}
                                    pageRangeDisplayed={5}
                                    onChange={this.handlePageChange}
                                    innerClass={"pagination"}
                                    itemClass={"page-item"}
                                    linkClass={"page-link"}
                                /> */}
                </Row>
              )}
            </FormGroup>

            {/* modal Create */}
            <Modal
              dialogClassName="modal-90w"
              aria-labelledby="modal-add-driver-allowance"
              show={this.state.isShowAddCreditUnionCutModal}
              onHide={() => this.showAddCreditUnionCutModal(false)}
              animation={true}
            >
              <Modal.Header>
                <Modal.Title id="modal-add-driver-allowance">
                  Input Potongan Koperasi
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <AsyncTypeahead
                      id="loader-employee-create-form"
                      ref={(typeahead) => {
                        this.typeaheadEmployeeCreateForm = typeahead;
                      }}
                      isLoading={this.state.isAutoCompleteLoading}
                      onChange={(selected) => {
                        this.setState({
                          selectedEmployeeToCreate: selected[0],
                        });
                      }}
                      labelKey="NameAndEmployeeIdentity"
                      minLength={1}
                      onSearch={this.handleEmployeeSearchModal}
                      options={this.state.employees}
                      placeholder="Cari karyawan..."
                    />
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedEmployeeToCreate?.Name}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Unit/Bagian</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedEmployeeToCreate?.Unit}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedEmployeeToCreate?.Section}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Group</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedEmployeeToCreate?.Group}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Tanggal</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <DatePicker
                      className="datePickerMonthYearOnly2"
                      name="Period"
                      id="Period"
                      dateFormat="MMMM yyyy"
                      showMonthYearPicker
                      value={
                        this.state.form.DateCuts
                          ? moment(this.state.form.DateCuts).format("MMMM yyyy")
                          : ""
                      }
                      onChange={(value) => {
                        var { form } = this.state;
                        form["DateCuts"] = moment(value).format("YYYY-MM-DD");
                        console.log("DateCuts", form["DateCuts"]);
                        this.setState({ form: form });
                      }}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Potongan per Bulan</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Input
                      type="number"
                      value={this.state.form.CutCash}
                      onChange={(value) => {
                        var { form } = this.state;
                        form["CutCash"] = value.target.value;
                        this.setState({ form: form });
                      }}
                    />
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
                      name="create-credit-union-cut"
                      onClick={this.handleCreateCreditUnionCut}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            {/* modal View */}
            <Modal
              dialogClassName="modal-90w"
              aria-labelledby="modal-view-driver-allowance"
              show={this.state.isShowViewCreditUnionCutModal}
              onHide={() => this.showViewCreditUnionCutModal(false)}
              animation={true}
            >
              <Modal.Header>
                <Modal.Title id="modal-view-driver-allowance">
                  View Potongan Koperasi
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedCreditUnionCut?.EmployeeIdentity}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedCreditUnionCut?.EmployeeName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Unit/Bagian</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedCreditUnionCut?.UnitName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedCreditUnionCut?.SectionName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Group</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedCreditUnionCut?.GroupName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Tanggal</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedCreditUnionCut?.DateCuts}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Potongan per Bulan</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Form.Label>
                      {Number(
                        this.state.selectedCreditUnionCut.CutCash
                          ? this.state.selectedCreditUnionCut.CutCash
                          : 0
                      )}
                    </Form.Label>
                  </Col>
                </Row>
              </Modal.Body>
              {/* <Modal.Footer>
                            {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                <div>
                                <Button className="btn btn-success" name="view-driver-allowance" onClick={this.setState({isShowViewCreditUnionCutModal:false})}>Close</Button>
                                </div>
                            )}
                            </Modal.Footer> */}
            </Modal>

            {/* modal edit */}
            <Modal
              dialogClassName="modal-90w"
              aria-labelledby="modal-edit-credit-union-cut"
              show={this.state.isShowEditCreditUnionCutModal}
              onHide={() => this.showEditCreditUnionCutModal(false)}
              animation={true}
            >
              <Modal.Header>
                <Modal.Title id="modal-edit-credit-union-cut">
                  Edit Potongan Koperasi
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedCreditUnionCut?.EmployeeIdentity}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedCreditUnionCut?.EmployeeName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Unit/Bagian</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedCreditUnionCut?.UnitName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedCreditUnionCut?.SectionName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Group</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedCreditUnionCut?.GroupName}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Tanggal</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="date"
                      value={this.state.selectedCreditUnionCut.DateCuts}
                      onChange={(event) => {
                        var { selectedCreditUnionCut } = this.state;
                        selectedCreditUnionCut["DateCuts"] = event.target.value;
                        this.setState({
                          selectedCreditUnionCut: selectedCreditUnionCut,
                        });
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Potongan per Bulan</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Input
                      type="number"
                      value={Number(
                        this.state.selectedCreditUnionCut.CutCash
                          ? this.state.selectedCreditUnionCut.CutCash
                          : 0
                      )}
                      onChange={(value) => {
                        var { selectedCreditUnionCut } = this.state;
                        selectedCreditUnionCut["CutCash"] = value.target.value;
                        this.setState({
                          selectedCreditUnionCut: selectedCreditUnionCut,
                        });
                      }}
                    />
                    {/* <Input
                                        type='number'
                                        value={this.state.selectedCreditUnionCut.CutCash}
                                        onChange={(value) => {
                                            var {selectedCreditUnionCut} = this.state;
                                            selectedCreditUnionCut["CutCash"] = value.target.value;
                                            this.setState({ selectedCreditUnionCut: selectedCreditUnionCut });
                                        }} /> */}
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
                      name="edit-credit-union-cut"
                      onClick={this.handleEditCreditUnionCut}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            {/* modal delete */}

            <Modal
              aria-labelledby="modal-delete-driver-allowance"
              show={this.state.isShowDeleteCreditUnionCutModal}
              onHide={() => this.showDeleteCreditUnionCutModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-delete-data">
                  Hapus Potongan Koperasi
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Apakah anda yakin ingin menghapus data{" "}
                {this.state.selectedCreditUnionCut?.Name}?
              </Modal.Body>
              <Modal.Footer>
                {this.state.deleteCreditUnionCutLoading ? (
                  <span>
                    <Spinner size="sm" color="primary" /> Mohon tunggu...
                  </span>
                ) : (
                  <div>
                    <Button
                      className="btn btn-danger"
                      name="delete-driver-allowance"
                      onClick={this.deleteCreditUnionCutClickHandler}
                    >
                      Hapus
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            {/* modal upload */}
            <Modal
              dialogClassName="modal-90w"
              aria-labelledby="modal-upload-data"
              show={this.state.isShowUploadModal}
              onHide={() => this.showUploadModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-upload-data">
                  Upload Potongan Koperasi
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div>
                  <input
                    type="file"
                    name="file"
                    onChange={this.onFileUploadChangeHandler}
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
                      onClick={this.uploadClickHandler}
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
  }
}
export default CreditUnionCut;
