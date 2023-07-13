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
import NumberFormat from "react-number-format";

import "./style.css";

var fileDownload = require("js-file-download");
const moment = require("moment");

const DOWNLOAD_SLIP_BONUS = "bonus/slip-bonus";
const DOWNLOAD_BONUS_ACCOUNTING = "bonus/bonus-accounting";
const DOWNLOAD_SLIP_EXCEL_BANKING = "bonus/slip-excel-to-banking";
const DOWNLOAD_POINT_PERFORMANCE = "bonus/point-performance";

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";

class Bonus extends Component {
  typeaheadEmployeeCreateForm = {};
  typeaheadEmployeeSearchForm = {};
  state = {
    loading: false,
    isCreateLoading: false,
    isEditLoading: false,
    isAutoCompleteLoading: false,
    deleteBonusLoading: false,

    selectedUnit: null,
    selectedSection: null,
    selectedGroup: null,
    selectedUnitToCreate: null,
    selectedEmployeeToCreate: null,

    selectedStartPeriode: new Date(),
    selectedEndPeriode: new Date(),
    selectedSearchUnit: null,
    selectedSearchSection: null,
    selectedSearchGroup: null,
    selectedSearchEmployee: null,
    dateRange: [],
    dateRangeLength: 0,
    selectedBonus: {},

    units: [],
    groups: [],
    sections: [],
    employees: [],

    searchUnits: [],
    searchSections: [],
    searchGroups: [],
    searchEmployee: [],
    fixedIncome: 0,

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],

    validationSearch: {},
    form: {},
    //replace Form :
    validationCreateForm: {},

    Period: "",

    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),

    //modal state
    isShowAddBonusModal: false,
    isShowEditThrModal: false,
    isShowViewThrModal: false,
    isShowDeleteBonusModal: false,

    periodToCreate: new Date(),
    countDateToCreate: "",
    corporateBonusToCreate: 0,
    performanceUnitBonusToCreate: 0,
    FixedIncomeToCreate: 0,
    bonusClassificationToCreate: 0,
    pointToCreate: 0,
    performanceValueToCreate: 0,
    amountPaidToCreate: 0,
    employmentClassToCreate: "",
    joinDateToCreate: "",
    fixedIncomeToCreate: 0,
    mealAllowanceToCreate: 0,
    baseSalaryToCreate: 0,

    //Edit
    periodToEdit: "",
    countDateToEdit: new Date(),
    corporateBonusToEdit: 0,
    performanceUnitBonusToEdit: 0,
    fixedIncomeToEdit: 0,
    bonusClassificationToEdit: 0,
    pointToEdit: 0,
    performanceValueToEdit: 0,
    amountPaidToEdit: 0,
    employmentClassToEdit: 0,
    joinDateToEdit: "",

    startDate: "",
    endDate: "",
    selectedFile: null,
    uploadFileLoading: false,
  };
  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
      //  selectedUnit: null,
      selectedSection: null,
      selectedGroup: null,
      selectedStartPeriode: new Date(),
      selectedEndPeriode: new Date(),
      validationCreateForm: {},
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
    this.setEmployeeSearch();
  }

  searchData = () => {
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
      adminEmployeeId: Number(localStorage.getItem("employeeId")),

      startDate: moment(this.state.startDate).format("YYYY-MM-DD"),
      endDate: moment(this.state.endDate).format("YYYY-MM-DD"),
    };

    this.setState({ loadingData: true });
    this.service
      .getBonus(params)
      .then((result) => {
        this.setState({
          activePage: result.Page,
          total: result.Total,
          tableData: result.Data,
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

  setData = () => {
    this.resetPagingConfiguration();

    let unitId = 0;
    if (
      this.state.userAccessRole == PERSONALIA_BAGIAN ||
      this.state.userAccessRole == PIMPINAN ||
      this.state.userAccessRole == UPAH
    ) {
      unitId = 0;
    } else {
      unitId = this.state.selectedSearchUnit
        ? this.state.selectedSearchUnit.Id
        : 0;
    }

    const params = {
      unitId: unitId,
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
      .getBonus(params)
      .then((result) => {
        this.setState({
          activePage: result.Page,
          total: result.Total,
          tableData: result.Data,
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
      console.log("result", result);
      var units = [];

      result.map((s) => {
        if (
          (this.state.userAccessRole == PERSONALIA_BAGIAN ||
            this.state.userAccessRole == PIMPINAN ||
            this.state.userAccessRole == UPAH) &&
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

  setGroupsSearch = (sectionId) => {
    // this.setState({ loading: true })
    if (sectionId == null) {
      this.service.getAllGroups().then((result) => {
        this.setState({ searchGroups: result });
      });
    } else {
      this.service.getAllGroupsBySection(sectionId).then((result) => {
        var instanceEmployeeSearch =
          this.typeaheadEmployeeSearchForm.getInstance();
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
        var instanceEmployeeSearch =
          this.typeaheadEmployeeSearchForm.getInstance();
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
    // this.setState({ loading: true })
    this.service.getAllUnits().then((result) => {
      var units = [];

      result.map((s) => {
        if (
          (this.state.userAccessRole == PERSONALIA_BAGIAN ||
            this.state.userAccessRole == PIMPINAN ||
            this.state.userAccessRole == UPAH) &&
          this.state.otherUnitId.includes(s.Id)
        ) {
          units.push(s);
        } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
          units.push(s);
        }
      });
      this.setState({ searchUnits: units, loading: false });
      //  this.setState({ searchUnits: result })
    });
  };

  setEmployeeSearch = () => {
    let params = {};
    params.unitId = this.state.selectedSearchUnit?.Id;
    params.groupId = this.state.selectedSearchGroup?.Id;
    params.sectionId = this.state.selectedSearchSection?.Id;
    params.employeeId = this.state.selectedSearchEmployee?.Id;

    // this.setState({ loading: true })
    this.service.searchEmployeeSearch(params).then((result) => {
      console.log(result);
      this.setState({ searchEmployee: result });
    });
  };

  search = () => {
    this.setState({ validationSearch: {} });

    this.searchData();
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  };

  handleEmployeeAndTransferSalary = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    // const params = {
    //   unitId: this.state.selectedUnitToCreate ? this.state.selectedUnitToCreate.Id : 0,
    //   keyword: query
    // }
    const params = {
      keyword: query,
      unitId: this.state.selectedSearchUnit
        ? this.state.selectedSearchUnit.Id
        : 0,
    };

    this.service.searchEmployeeAndTransferSalary(params).then((result) => {
      result = result.map((employee) => {
        employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} - ${employee.Name}`;
        return employee;
      });

      this.setState({ employees: result }, () => {
        this.setState({ isAutoCompleteLoading: false });
      });
    });
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
      adminEmployeeId: Number(localStorage.getItem("employeeId")),
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

  downloadSlipBonusPdf = () => {
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
      this.dataSlipBonus();
    }
  };

  dataSlipBonus = () => {
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

    console.log(query);

    const value = localStorage.getItem("token");
    const Header = {
      accept: "application/json",
      Authorization: `Bearer ` + value,
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios({
      method: "get",
      url: CONST.URI_ATTENDANCE + DOWNLOAD_SLIP_BONUS + query,
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

  downloadBonusAccounting = () => {
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
      this.dataBonusAccounting();
    }
  };

  dataBonusAccounting = () => {
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

    console.log(query);

    const value = localStorage.getItem("token");
    const Header = {
      accept: "application/json",
      Authorization: `Bearer ` + value,
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios({
      method: "get",
      url: CONST.URI_ATTENDANCE + DOWNLOAD_BONUS_ACCOUNTING + query,
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

  downloadSlipExcelToBanking = () => {
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
      this.dataSlipExcelToBanking();
    }
  };

  dataSlipExcelToBanking = () => {
    console.log("Unit ", this.state.selectedSearchUnit);
    this.setState({ loadingData: true });

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?adminEmployeeId=${adminEmployeeId}`;

    if (this.state.selectedSearchEmployee)
      query += "employeeId=" + this.state.selectedSearchEmployee?.Id;

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
      url: CONST.URI_ATTENDANCE + DOWNLOAD_SLIP_EXCEL_BANKING + query,
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

  downloadPointPerformancePdf = () => {
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
      this.dataPointPerformance();
    }
  };

  dataPointPerformance = () => {
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
      url: CONST.URI_ATTENDANCE + DOWNLOAD_POINT_PERFORMANCE + query,
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

  resetCreateModalValue = () => {
    this.setState(
      {
        // periodToCreate: new Date(),
        // countDateToCreate: "",
        // corporateBonusToCreate: 0,
        // performanceUnitBonusToCreate: 0,

        FixedIncomeToCreate: 0,
        bonusClassificationToCreate: 0,
        pointToCreate: 0,
        performanceValueToCreate: 0,
        amountPaidToCreate: 0,
        employmentClassToCreate: "",
        joinDateToCreate: "",
        fixedIncomeToCreate: 0,
        selectedSearchEmployee: null,
        //Edit
        periodToEdit: "",
        countDateToEdit: new Date(),
        corporateBonusToEdit: 0,
        performanceUnitBonusToEdit: 0,
        fixedIncomeToEdit: 0,
        bonusClassificationToEdit: 0,
        pointToEdit: 0,
        performanceValueToEdit: 0,
        amountPaidToEdit: 0,
        employmentClassToEdit: 0,
        joinDateToEdit: "",
        selectedEmployeeToCreate: null,
        //  selectedUnitToCreate: null,
        validationCreateForm: {},
      },
      () => {
        var instanceEmployeeCreate = this.typeaheadEmployeeCreateForm;
        instanceEmployeeCreate.clear();
      }
    );
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
    var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm;
    instanceEmployeeSearch.clear();
  };

  create = () => {
    this.showAddBonusModal(true);
  };

  upload = () => {
    this.setState({ isShowUploadExcelModal: true });
  };

  showAddBonusModal = (value) => {
    this.resetCreateModalValue();
    this.setState({ isShowAddBonusModal: value, isCreateLoading: false });
  };

  showDeleteBonusModal = (value) => {
    this.setState({ isShowDeleteBonusModal: value, deleteBonusLoading: false });
  };

  handleCreateBonus = () => {
    let periode = moment(this.state.periodToCreate).format("DD/MM/YYYY");

    if (periode !== "01/01/0001") {
      this.createBonus();
    } else {
      this.setState({
        validationCreateForm: {
          Periode: "Tanggal harus lebih dari 01/01/0001",
        },
        isCreateLoading: false,
      });
    }
  };

  createBonus = () => {
    const payload = {
      EmployeeId: this.state.selectedEmployeeToCreate?.Id,
      UnitId: this.state.selectedSearchUnit?.Id,
      // GroupId:this.state.selectedSearchGroup?.Id,
      // SectionId : this.state.selectedSearchSection?.Id,
      Period: moment(this.state.periodToCreate).format("YYYY-MM-DD"),
      CountDate: moment(this.state.countDateToCreate).format("YYYY-MM-DD"),
      CorporateBonus: this.state.corporateBonusToCreate,
      PerformanceUnitBonus: this.state.performanceUnitBonusToCreate,
      FixedIncome: this.state.fixedIncomeToCreate,
      MealAllowance: this.state.mealAllowanceToCreate,
      BaseSalary: this.state.baseSalaryToCreate,
      BonusClassification: this.state.bonusClassificationToCreate,
      Point: this.state.pointToCreate,
      PerformanceValue: this.state.performanceValueToCreate,
      AmountPaid: this.state.amountPaidToCreate,
      EmploymentClass: this.state.employmentClassToCreate,
      JoinDate: this.state.joinDateToCreate,
    };

    this.setState({ isCreateLoading: true });
    this.service
      .postBonus(payload)
      .then((result) => {
        swal({
          icon: "success",
          title: "Good...",
          text: "Data berhasil disimpan!",
        });
        this.setState({ isCreateLoading: false }, () => {
          //  this.resetPagingConfiguration();
          // this.setData();
          this.showAddBonusModal(true);
        });
      })
      .catch((error) => {
        if (error) {
          let message = "";
          if (error.Period) message += `- ${error.Period}\n`;

          if (error.EmployeeId) message += `- ${error.EmployeeId}\n`;

          if (error.BonusClassification)
            message += `- ${error.BonusClassification}\n`;

          if (error.UnitId) message += `- ${error.UnitId}\n`;

          if (error.CorporateBonus) message += `- ${error.CorporateBonus}\n`;

          if (error.PerformanceValue)
            message += `- ${error.PerformanceValue}\n`;

          if (error.AmountPaid) message += `- ${error.AmountPaid}\n`;

          this.setState({ validationCreateForm: error });

          this.setState({ isCreateLoading: false });
          swal({
            icon: "error",
            title: "Oops...",
            text: message,
          });
        }
      });
  };

  handleEditBonusClick = (bonus) => {
    this.setState({ selected: bonus }, () => {
      this.getBonusById(bonus, "EDIT");
    });
  };

  handleDeleteBonusClick = (bonus) => {
    this.setState({ selectedBonus: bonus }, () => {
      this.showDeleteBonusModal(true);
    });
  };

  handleViewBonusClick = (bonus) => {
    this.setState({ selectedBonus: bonus }, () => {
      this.getBonusById(bonus, "VIEW");
    });
  };

  deleteBonusClickHandler = () => {
    this.setState({ deleteBonusLoading: true });

    const url = `${CONST.URI_ATTENDANCE}bonus/${this.state.selectedBonus.Id}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    Promise.all([axios.delete(url, { headers: headers })])
      .then((values) => {
        alert("Data Berhasil dihapus");
        this.setState({ deleteBonusLoading: false });
        this.setData();
      })
      .catch((err) => {
        if (err.response.status === 400) {
          alert("Data Berhasil dihapus");
          this.setState({ deleteBonusLoading: false });
        } else {
          alert("Terjadi kesalahan!");
          this.setState({ deleteBonusLoading: false });
        }
        console.log(err.response);
        this.setState({ deleteBonusLoading: false });
      })
      .then(() => {
        this.showDeleteBonusModal(false);
        this.setData();
      });
  };

  handleEditBonus = () => {
    let period = moment(this.state.selectedBonus?.Period).format("DD/MM/YYYY");
    if (period !== "01/01/0001") {
      this.updateBonus();
    } else {
      this.setState({
        validationCreateForm: { Period: "Tanggal harus lebih dari 01/01/0001" },
        isEditLoading: false,
      });
    }
  };

  updateBonus = () => {
    // this.setState({isEditLoading: true});
    const payload = {
      Id: this.state.selectedBonus?.Id,
      Period: moment(this.state.selectedBonus?.Period).format("YYYY-MM-DD"),
      UnitId: this.state.selectedBonus?.UnitId,
      FixedIncome: this.state.selectedBonus?.FixedIncome,
      CountDate: moment(this.state.countDateToEdit).format("YYYY-MM-DD"),
      CorporateBonus: this.state.corporateBonusToEdit,
      PerformanceUnitBonus: this.state.performanceUnitBonusToEdit,
      BonusClassification: this.state.bonusClassificationToEdit,
      Point: this.state.pointToEdit,
      PerformanceValue: this.state.performanceValueToEdit,
      AmountPaid: this.state.amountPaidToEdit,
    };

    console.log("payload edit ", payload);

    const url = `${CONST.URI_ATTENDANCE}bonus/${payload.Id}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .put(url, payload, { headers: headers })
      .then(() => {
        swal("Data berhasil disimpan!");
        this.setState(
          { isEditLoading: false, selectedBonus: {}, page: 1, activePage: 1 },
          () => {
            this.showEditBonusModal(false);
            this.setData();
          }
        );
      })
      .catch((err) => {
        if (err.response) {
          this.setState({ validationCreateForm: err.response.data.error });
          console.log(this.state);
        }
        // alert("Terjadi kesalahan!");
        this.setState({ isEditLoading: false });
        this.setData();
      });
  };

  getBonusById = (bonus, state) => {
    this.setState(
      {
        loading: false,
        activePage: 1,
        page: 1,
        selectedBonus: bonus,

        periodToEdit: moment(bonus.Period).format("YYYY-MM-DD"),
        countDateToEdit: moment(bonus.CountDate).format("YYYY-MM-DD"),
        corporateBonusToEdit: bonus.CorporateBonus,
        performanceUnitBonusToEdit: bonus.PerformanceUnitBonus,
        fixedIncomeToEdit: bonus.FixedIncome,

        bonusClassificationToEdit: bonus.BonusClassification,
        pointToEdit: bonus.Point,
        performanceValueToEdit: bonus.PerformanceValue,
        amountPaidToEdit: bonus.AmountPaid,
      },
      () => {
        if (state === "VIEW") this.showViewBonusModal(true);
        else if (state === "EDIT") this.showEditBonusModal(true);
      }
    );

    // this.setState({ loading: true });

    // const url = `${CONST.URI_ATTENDANCE}bonus/${id}`;
    // const headers = {
    //   'Content-Type': 'application/json',
    //   accept: 'application/json',
    //   Authorization: `Bearer ` + localStorage.getItem('token'),
    //   'x-timezone-offset': moment().utcOffset() / 60
    // }
    // axios.get(url, { headers: headers }).then((data) => {

    //   var selectedBonus = data.data;
    //   //  selectedThr.Period = moment(selectedThr.Period).format("YYYY-MM-DD");

    //   this.setState({
    //     loading: false,
    //     activePage: 1,
    //     page: 1,
    //     selectedBonus: selectedBonus,

    //     periodToEdit: moment(selectedBonus.Period).format("YYYY-MM-DD"),
    //     countDateToEdit: moment(selectedBonus.CountDate).format("YYYY-MM-DD"),
    //     corporateBonusToEdit: selectedBonus.CorporateBonus,
    //     performanceUnitBonusToEdit: selectedBonus.PerformanceUnitBonus,
    //     fixedIncomeToEdit: selectedBonus.FixedIncome,

    //     bonusClassificationToEdit: selectedBonus.BonusClassification,
    //     pointToEdit: selectedBonus.Point,
    //     performanceValueToEdit: selectedBonus.PerformanceValue,
    //     amountPaidToEdit: selectedBonus.AmountPaid,

    //   }, () => {
    //     if (state === "VIEW")
    //       this.showViewBonusModal(true);
    //     else if (state === "EDIT")
    //       this.showEditBonusModal(true);
    //   });

    // }).catch(err => {

    //   alert("Terjadi kesalahan!");
    //   this.setState({ loading: false });
    // });
  };

  showEditBonusModal = (value) => {
    if (!value) this.setState({ selectedBonus: {} });

    this.setState({ isShowEditThrModal: value, isEditLoading: false });
  };

  showViewBonusModal = (value) => {
    if (!value) this.setState({ selectedBonus: {} });

    this.setState({ isShowViewThrModal: value });
  };

  dateDiffInDays(date1, date2) {
    date1 = new Date(date1);
    date2 = new Date(date2);
    let difference_In_Time = date2.getTime() - date1.getTime();
    let difference_In_Days = difference_In_Time / (1000 * 3600 * 24);

    return difference_In_Days;
  }

  calculateAmountPaidToCreate = () => {
    console.log("employmentClassToCreate", this.state.employmentClassToCreate);
    let fixedIncome = this.state.fixedIncomeToCreate;
    let corporateBonus = this.state.corporateBonusToCreate;
    let performanceUnitBonus = this.state.performanceUnitBonusToCreate;
    let bonusClassification = this.state.bonusClassificationToCreate;
    let performanceValue = this.state.performanceValueToCreate;

    var employmentClass = this.state.employmentClassToCreate;
    if (employmentClass === "A") {
      bonusClassification = 30;
    } else if (employmentClass === "B") {
      bonusClassification = 30;
    } else if (employmentClass === "C") {
      bonusClassification = 40;
    } else if (employmentClass === "D") {
      bonusClassification = 50;
    } else if (employmentClass === "E") {
      bonusClassification = 60;
    }

    let amountPaid =
      fixedIncome *
      (corporateBonus / 100) *
      (performanceUnitBonus / 100) *
      (bonusClassification / 100) *
      (performanceValue * 0.1);

    this.setState({
      amountPaidToCreate: amountPaid,
      bonusClassificationToCreate: bonusClassification,
    });
  };

  calculateAmountPaidToEdit = () => {
    console.log("employmentClassToCreate", this.state.employmentClassToEdit);
    let fixedIncome = this.state.fixedIncomeToEdit;
    let corporateBonus = this.state.corporateBonusToEdit;
    let performanceUnitBonus = this.state.performanceUnitBonusToEdit;
    let bonusClassification = this.state.bonusClassificationToEdit;
    let performanceValue = this.state.performanceValueToEdit;

    var employmentClass = this.state.employmentClassToEdit;
    if (employmentClass === "A") {
      bonusClassification = 30;
    } else if (employmentClass === "B") {
      bonusClassification = 30;
    } else if (employmentClass === "C") {
      bonusClassification = 40;
    } else if (employmentClass === "D") {
      bonusClassification = 50;
    } else if (employmentClass === "E") {
      bonusClassification = 60;
    }

    let amountPaid =
      fixedIncome *
      (corporateBonus / 100) *
      (performanceUnitBonus / 100) *
      (bonusClassification / 100) *
      (performanceValue * 0.1);

    this.setState({
      amountPaidToEdit: amountPaid,
      bonusClassificationToEdit: bonusClassification,
    });
  };

  getAmounPaid = (item) => {
    let amountPaid = item.AmountPaid;
    let period = moment(item.Period).format("MM-YYYY").split("-");
    let join = moment(item.JoinDate).format("MM-YYYY").split("-");
    let periodDate = new Date(period[1], period[0] - 1, 1);
    let joinDate = new Date(join[1], join[0] - 1, 1);

    // let diff = this.monthDiff(joinDate, periodDate);
    let diff = Math.floor(moment(item.CountDate).diff(moment(item.JoinDate), 'months', true));
    console.log('diff a',diff);
    diff = diff >= 12 ? 1 : diff / 12;
    console.log('amountPaid a',amountPaid);
    amountPaid = amountPaid * diff;
    console.log('diff b',diff);
console.log('amountPaid b',amountPaid);
    if (item.ReductionPoint > 0) {
      const reductionPaid = (amountPaid * item.ReductionPoint) / 100;
      console.log('reductionPaid a',reductionPaid);
      amountPaid = amountPaid - reductionPaid;
      console.log('amountPaid c',amountPaid);
    }
    return Math.round(amountPaid);
  };

  monthDiff = (d1, d2) => {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  };

  onFileUploadChangeHandler = (event) => {
    this.setState({ selectedFile: event.target.files[0] });
  };

  uploadClickHandler = () => {
    this.setState({ uploadFileLoading: true });

    var data = new FormData();
    data.append("file", this.state.selectedFile);

    const url = `${CONST.URI_ATTENDANCE}bonus/upload`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .post(url, data, { headers: headers })
      .then((response) => {
        var result = response.data;

        let message = `Import file selesai
                     - ${result.RecordCreated} Baris ditambah
                     `;
        //- ${result.RecordUpdated} Baris diubah
        swal({
          icon: "success",
          title: "Good...",
          text: message,
        });
        this.setState({
          isShowUploadExcelModal: false,
          uploadFileLoading: false,
          activePage: 1,
          page: 1,
        });
        this.setData();
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });

        this.setState({ uploadFileLoading: false });
      });
  };

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item, index) => {
      return (
        <tbody key={index}>
          <tr>
            <td>{item.UnitName}</td>
            <td>{moment(item.Period).format("MMMM YYYY")}</td>
            <td>{moment(item.CountDate).format("DD-MM-YYYY")}</td>
            <td>{item.EmployeeName}</td>
            <td>{item.EmployeeIdentity}</td>
            <td>{item.SectionName}</td>
            <td> {moment(item.JoinDate).format("DD-MM-YYYY")}</td>
            <td>{item.EmploymentClass}</td>
            <td>{item.BonusClassification} % </td>
            <td>{item.Point}</td>
            <td>{item.PerformanceValue}</td>
            <td>
              <NumberFormat
                displayType={"text"}
                thousandSeparator={true}
                prefix={"Rp "}
                value={this.getAmounPaid(item)}
              />
            </td>
            <td>
              <Form>
                <FormGroup>
                  <RowButtonComponent
                    className="btn btn-success"
                    name="view-credit-union-cut"
                    onClick={this.handleViewBonusClick}
                    data={item}
                    iconClassName="fa fa-eye"
                    label=""
                  ></RowButtonComponent>
                  <RowButtonComponent
                    className="btn btn-primary"
                    name="edit-credit-union-cut"
                    onClick={this.handleEditBonusClick}
                    data={item}
                    iconClassName="fa fa-pencil-square"
                    label=""
                  ></RowButtonComponent>
                  <RowButtonComponent
                    className="btn btn-danger"
                    name="delete-credit-union-cut"
                    onClick={this.handleDeleteBonusClick}
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
              <Row>
                <Col sm={1} className={"text-right"}>
                  <FormLabel>Unit/Bagian</FormLabel>
                </Col>
                <Col sm={5}>
                  <Select
                    placeholder={"pilih unit"}
                    isClearable={true}
                    options={this.state.searchUnits}
                    value={this.state.selectedSearchUnit}
                    onChange={(value) => {
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
                <Col sm={5}>
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
                <Col sm={5}>
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

                <Col sm={5}>
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
                <Col sm={5}>
                  <AsyncTypeahead
                    id="loader-employee-search-form"
                    ref={(typeahead) => {
                      this.typeaheadEmployeeSearchForm = typeahead;
                    }}
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
                  <Button
                    size="sm"
                    className="btn btn-success mr-3"
                    name="input-bonus"
                    onClick={this.create}
                  >
                    Tambah Data
                  </Button>
                  <Button
                    size="sm"
                    className="btn btn-success mr-3"
                    name="input-bonus"
                    onClick={this.upload}
                  >
                    Upload
                  </Button>
                </Col>
                <Col sm={7}>
                  <Button
                    className="btn btn-primary  btn-sm mr-3  pull-right"
                    name="point-performance"
                    onClick={this.downloadPointPerformancePdf}
                  >
                    Poin Absensi & Nilai Kinerja{" "}
                  </Button>
                  <Button
                    className="btn btn-primary btn-sm mr-3 pull-right"
                    name="slip-excel-to-banking"
                    onClick={this.downloadSlipExcelToBanking}
                  >
                    Slip Excel ke Bank{" "}
                  </Button>
                  <Button
                    className="btn btn-primary btn-sm mr-3 pull-right"
                    name="slip-bonus"
                    onClick={this.downloadSlipBonusPdf}
                  >
                    Slip Bonus{" "}
                  </Button>
                  <Button
                    className="btn btn-primary btn-sm mr-3 pull-right"
                    name="bonus-accounting"
                    onClick={this.downloadBonusAccounting}
                  >
                    Laporan Penghitung Tunjangan{" "}
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
                      <th>Unit/Bagian</th>
                      <th>Periode</th>
                      <th>Tanggal Hitung</th>
                      <th>Nama</th>
                      <th>NIK</th>
                      <th>Seksi</th>
                      <th>Tanggal Masuk</th>
                      <th>Golongan</th>
                      <th>Golongan Bonus</th>
                      <th>Point</th>
                      <th>Nilai Kinerja</th>
                      <th>Jumlah Dibayar</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr key="0">
                      <td colSpan="12" className="text-center">
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
                        <th>Unit/Bagian</th>
                        <th>Periode</th>
                        <th>Tanggal Hitung</th>
                        <th>Nama</th>
                        <th>NIK</th>
                        <th>Seksi</th>
                        <th>Tanggal Masuk</th>
                        <th>Golongan</th>
                        <th>Golongan Bonus</th>
                        <th>Point</th>
                        <th>Nilai Kinerja</th>
                        <th>Jumlah Dibayar</th>
                        <th></th>
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

            <Modal
              dialogClassName="custom-dialog"
              aria-labelledby="modal-add-bonus"
              show={this.state.isShowAddBonusModal}
              onHide={() => this.showAddBonusModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-add-bonus">
                  {" "}
                  Input Data Bonus Karyawan
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <Form.Label>Periode</Form.Label>
                  </Col>
                  <Col>
                    <DatePicker
                      className="datePickerMonthYearOnly"
                      name="Period"
                      id="Period"
                      dateFormat="MMMM yyyy"
                      showMonthYearPicker
                      value={
                        this.state.periodToCreate
                          ? moment(this.state.periodToCreate).format(
                              "MMMM yyyy"
                            )
                          : ""
                      }
                      onChange={(value) => {
                        return this.setState({ periodToCreate: value });
                      }}
                    />
                    <br />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.Period}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Unit/Bagian</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Select
                      placeholder={"pilih unit"}
                      isClearable={true}
                      options={this.state.searchUnits}
                      value={this.state.selectedSearchUnit}
                      onChange={(value) => {
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
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.UnitId}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Tanggal Hitung</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="date"
                      value={this.state.countDateToCreate || ""}
                      onChange={(event) => {
                        console.log(event.target.value);

                        this.setState({
                          countDateToCreate: event.target.value,
                        });
                      }}
                    />
                    <br />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.CountDate}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Bonus Perusahaan (%)</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="number"
                      min={0}
                      value={this.state.corporateBonusToCreate || ""}
                      onChange={(event) => {
                        this.setState(
                          { corporateBonusToCreate: event.target.value },
                          () => {
                            this.calculateAmountPaidToCreate();
                          }
                        );
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.CorporateBonus}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Bonus Kinerja Unit (%) </FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      min={0}
                      type="number"
                      value={this.state.performanceUnitBonusToCreate || ""}
                      onChange={(event) => {
                        this.setState(
                          { performanceUnitBonusToCreate: event.target.value },
                          () => {
                            this.calculateAmountPaidToCreate();
                          }
                        );
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.PerformanceUnitBonus}
                    </span>
                  </Col>
                </Row>

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
                        let fixedIncome =
                          selected[0]?.BaseSalary + selected[0]?.MealAllowance;
                        let employmentClass = selected[0]?.EmployeeClass;

                        this.setState(
                          {
                            selectedEmployeeToCreate: selected[0],
                            fixedIncomeToCreate: selected[0]?.FixedIncome,
                            employmentClassToCreate: employmentClass,
                            mealAllowanceToCreate: selected[0]?.MealAllowance,
                            baseSalaryToCreate: selected[0]?.BaseSalary,
                          },
                          () => {
                            this.calculateAmountPaidToCreate();
                          }
                        );
                      }}
                      labelKey="NameAndEmployeeIdentity"
                      minLength={1}
                      onSearch={this.handleEmployeeAndTransferSalary}
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
                    <Form.Label>Golongan</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedEmployeeToCreate?.EmployeeClass}
                    </Form.Label>
                    <br />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.EmploymentClass}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Tanggal Masuk</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {moment(
                        this.state.selectedEmployeeToCreate?.JoinDate
                      ).format("DD MMMM YYYY")}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Upah Tahun Lalu (Rp)</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedEmployeeToCreate?.FixedIncome}
                    </Form.Label>
                    <br />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.FixedIncome}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Golongan Bonus </Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.bonusClassificationToCreate} (%)
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Point</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="number"
                      min={0}
                      value={this.state.pointToCreate || ""}
                      onChange={(event) => {
                        this.setState({ pointToCreate: event.target.value });
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.Point}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Nilai Kinerja</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="number"
                      min={0}
                      value={this.state.performanceValueToCreate || ""}
                      onChange={(event) => {
                        this.setState(
                          { performanceValueToCreate: event.target.value },
                          () => {
                            this.calculateAmountPaidToCreate();
                          }
                        );
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.PerformanceValue}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Jumlah Dibayar ( Rp)</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;{" "}
                      {Number(this.state.amountPaidToCreate).toFixed(2)}{" "}
                    </Form.Label>
                    <span style={{ color: "red" }}>
                      <NumberFormat
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"Rp "}
                        value={this.getAmounPaid(
                          this.state.validationCreateForm
                        )}
                      />
                    </span>
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
                      name="create-thr"
                      onClick={this.handleCreateBonus}
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
              aria-labelledby="modal-view-thr"
              show={this.state.isShowViewThrModal}
              onHide={() => this.showViewBonusModal(false)}
              animation={true}
            >
              <Modal.Header>
                <Modal.Title id="modal-view-thr">Detail Bonus</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Periode</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;{" "}
                      {moment(this.state.selectedBonus?.Period).format(
                        "MMMM YYYY"
                      )}
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
                      {this.state.selectedBonus?.UnitName}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Tanggal Hitung</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;{" "}
                      {moment(this.state.selectedBonus?.CountDate).format(
                        "DD-MM-YYYY"
                      )}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Bonus Perusahaan</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedBonus?.CorporateBonus} %
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Bonus Kinerja Unit (%) </FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedBonus?.PerformanceUnitBonus}{" "}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedBonus?.EmployeeIdentity}
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
                      {this.state.selectedBonus?.EmployeeName}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Golongan</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedBonus?.EmploymentClass}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Tanggal Masuk</FormLabel>
                  </Col>

                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {moment(this.state.selectedBonus?.JoinDate).format(
                        "DD-MM-YYYY"
                      )}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Upah Tahun Lalu</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedBonus?.FixedIncome}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Golongan Bonus (%)</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedBonus?.BonusClassification}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Point</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedBonus?.Point}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Nilai Kinerja</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedBonus?.PerformanceValue}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Jumlah Dibayar (Rp.)</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Form.Label>
                      {" "}
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <NumberFormat
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"Rp "}
                        value={this.getAmounPaid(this.state.selectedBonus)}
                      />
                    </Form.Label>
                  </Col>
                </Row>
              </Modal.Body>
              {/* <Modal.Footer>
                            {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                <div>
                                <Button className="btn btn-success" name="view-driver-allowance" onClick={this.setState({isShowViewThrModal:false})}>Close</Button>
                                </div>
                            )}
                            </Modal.Footer> */}
            </Modal>

            {/* modal edit */}
            <Modal
              dialogClassName="custom-dialog"
              aria-labelledby="modal-edit-bonus"
              show={this.state.isShowEditThrModal}
              onHide={() => this.showEditBonusModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-edit-bonus">Edit Bonus</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Periode</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <DatePicker
                      className="datePickerMonthYearOnly"
                      name="Period"
                      id="Period"
                      dateFormat="MMMM yyyy"
                      showMonthYearPicker
                      readOnly={true}
                      value={
                        this.state.periodToEdit
                          ? moment(this.state.periodToEdit).format("MMMM yyyy")
                          : ""
                      }
                      onChange={(value) => {
                        return this.setState({ periodToEdit: value });
                      }}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Unit/Bagian</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedBonus?.UnitName}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Tanggal Hitung</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="date"
                      readOnly={false}
                      value={this.state.countDateToEdit}
                      onChange={(event) => {
                        this.setState({ countDateToEdit: event.target.value });
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.CountDate}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Bonus Perusahaan (%)</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="number"
                      min={0}
                      // max={10}
                      value={this.state.corporateBonusToEdit}
                      onChange={(event) => {
                        this.setState(
                          { corporateBonusToEdit: event.target.value },
                          () => {
                            this.calculateAmountPaidToEdit();
                          }
                        );
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.CorporateBonus}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Bonus Kinerja Unit (%)</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="number"
                      min={0}
                      // max={10}
                      value={this.state.performanceUnitBonusToEdit}
                      onChange={(event) => {
                        this.setState(
                          { performanceUnitBonusToEdit: event.target.value },
                          () => {
                            this.calculateAmountPaidToEdit();
                          }
                        );
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.PerformanceUnitBonus}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedBonus?.EmployeeIdentity}
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
                      {this.state.selectedBonus?.EmployeeName}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Golongan</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedBonus?.EmploymentClass}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Tanggal Masuk</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="date"
                      readOnly={true}
                      value={this.state.countDateToEdit}
                      onChange={(event) => {
                        this.setState({ countDateToEdit: event.target.value });
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.CountDate}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Upah Tahun Lalu (Rp)</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;{" "}
                      {this.state.selectedBonus?.FixedIncome}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Golongan Bonus (%)</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedBonus?.BonusClassification}{" "}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Point</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="number"
                      min={0}
                      // max={10}
                      value={this.state.pointToEdit}
                      onChange={(event) => {
                        this.setState({ pointToEdit: event.target.value });
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.Point}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Nilai Kinerja</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="number"
                      min={0}
                      // max={10}
                      value={this.state.performanceUnitBonusToEdit}
                      onChange={(event) => {
                        this.setState(
                          { performanceUnitBonusToEdit: event.target.value },
                          () => {
                            this.calculateAmountPaidToEdit();
                          }
                        );
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.PerformanceUnitBonus}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Jumlah Dibayar (Rp)</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <NumberFormat
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"Rp "}
                        value={this.getAmounPaid(this.state.selectedBonus)}
                      />
                    </Form.Label>
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
                      name="edit-bonus"
                      onClick={this.handleEditBonus}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            {/* modal delete */}

            <Modal
              aria-labelledby="modal-delete-bonus"
              show={this.state.isShowDeleteBonusModal}
              onHide={() => this.showDeleteBonusModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-delete-bonus">Hapus Bonus</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Apakah anda yakin ingin menghapus data{" "}
                {this.state.selectedBonus?.Name}?
              </Modal.Body>
              <Modal.Footer>
                {this.state.deleteBonusLoading ? (
                  <span>
                    <Spinner size="sm" color="primary" /> Mohon tunggu...
                  </span>
                ) : (
                  <div>
                    <Button
                      className="btn btn-danger"
                      name="delete-delete"
                      onClick={this.deleteBonusClickHandler}
                    >
                      Hapus
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            {/* modal upload excel */}

            <Modal
              dialogClassName="modal-90w"
              aria-labelledby="modal-set-jadwal"
              show={this.state.isShowUploadExcelModal}
              onHide={() => this.setState({ isShowUploadExcelModal: false })}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-set-jadwal">Upload File</Modal.Title>
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

export default Bonus;
