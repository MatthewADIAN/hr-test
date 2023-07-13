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

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";

class Donation extends Component {
  typeaheadEmployeeCreateForm = {};
  typeaheadEmployeeSearchForm = {};
  state = {
    loading: false,
    isCreateLoading: false,
    isEditLoading: false,
    isAutoCompleteLoading: false,

    deleteDonationLoading: false,

    selectedUnit: null,
    selectedSection: null,
    selectedGroup: null,
    selectedUnitToCreate: null,

    selectedStartPeriode: new Date(),
    selectedEndPeriode: new Date(),
    selectedSearchUnit: null,
    selectedSearchSection: null,
    selectedSearchGroup: null,
    selectedMonth: null,
    selectedSearchEmployee: null,
    dateRange: [],
    dateRangeLength: 0,
    selectedDonation: {},
    selectedTypeToEdit: {},
    donationPercentageToEdit: {},
    units: [],
    groups: [],
    sections: [],
    employees: [],

    searchUnits: [],
    searchSections: [],
    searchGroups: [],
    searchEmployee: [],

    // minimum date value js
    //   startDate: "",
    //   endDate: "",

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],

    validationSearch: {},
    form: {},
    //replace Form :
    validationCreateForm: {},

    //modal state
    isShowAddDonationModal: false,
    isShowEditDonationModal: false,
    isShowViewDonationModal: false,
    isShowDeleteDonationModal: false,

    isReadOnlyPercentage: false,

    donationtypes: [
      { name: "nikah", label: "nikah", value: "nikah" },
      { name: "kematian", label: "kematian", value: "kematian" },
      { name: "kelahiran", label: "kelahiran", value: "kelahiran" },
      { name: "uangPisah", label: "uang pisah", value: "uang pisah" },
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
      validationCreateForm: {},
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
    this.setEmployeeSearch();
  }

  getStartDate = () => {
    let dateTemp = this.state.selectedMonth.split('-');
    let startDate = `${dateTemp[0]}-${dateTemp[1]}-01`
    return startDate;
  }

  getEndDate = () => {
    let dateTemp = this.state.selectedMonth.split('-');
    let lastDay = new Date(dateTemp[0], Number(dateTemp[1]), 0).getDate();
    let endDate = `${dateTemp[0]}-${dateTemp[1]}-${lastDay}`
    return endDate;
  }

  setData = () => {
    this.resetPagingConfiguration();

    let unitId =0;
    if(this.state.userAccessRole == PERSONALIA_BAGIAN || this.state.userAccessRole == PIMPINAN || this.state.userAccessRole == UPAH){
      unitId=0;
    }else{
      unitId = this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0
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
      startDate: this.state.selectedMonth ? this.getStartDate() : "",
      endDate: this.state.selectedMonth ? this.getEndDate() : "",
      page: this.state.activePage,
      //   startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
      //   endDate: moment(this.state.endDate).format('YYYY-MM-DD')
    };

    this.setState({ loadingData: true });
    this.service
      .getDonation(params)
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

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
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
    // this.setState({ loading: true })
    this
    .service
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
   //   this.setState({ units: units, loading: false })
      this.setState({ searchUnits: units });
    });
  };

  setEmployeeSearch = () => {
    let params = {};
    params.unitId = this.state.selectedSearchUnit?.Id;
    params.groupId = this.state.selectedSearchGroup?.Id;
    params.sectionId = this.state.selectedSearchSection?.Id;
    params.employeeId = this.state.selectedSearchEmployee?.Id;

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

  handleEmployeeSearchModal = (query) => {
    this.setState({ isAutoCompleteLoading: true });

   
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
      validationCreateForm: {},
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
    this.showAddDonationModal(true);
  };

  showAddDonationModal = (value) => {
    this.resetCreateModalValue();
    this.setState({ isShowAddDonationModal: value, isCreateLoading: false });
  };

  showDeleteDonationModal = (value) => {
    this.setState({
      isShowDeleteDonationModal: value,
      deleteDonationLoading: false,
    });
  };

  handleCreateDonation = () => {
    let donationDate = moment(this.state.form.DonationDate).format(
      "DD/MM/YYYY"
    );

    if (donationDate !== "01/01/0001") {
      this.createDonation();
    } else {
      this.setState({
        validationCreateForm: {
          DonationDate: "Tanggal harus lebih dari 01/01/0001",
        },
        isCreateLoading: false,
      });
    }
  };

  createDonation = () => {
    const payload = {
      EmployeeId: this.state.selectedEmployeeToCreate?.Id,
      DonationDate: this.state.form.DonationDate,
      DonationType: this.state.selectedTypeToCreate?.value,
      DonationPercentage: this.state.form.DonationPercentage,
      NominalAmmount: this.state.form.NominalAmmount,
    };

    this.setState({ isCreateLoading: true });
    this.service
      .createDonation(payload)
      .then((result) => {
        swal({
          icon: "success",
          title: "Good...",
          text: "Data berhasil disimpan!",
        });
        this.setState({ isCreateLoading: false }, () => {
          this.resetPagingConfiguration();
          this.setData();
          this.showAddDonationModal(false);
        });
      })
      .catch((error) => {
        if (error) {
          let message = "";
          if (error.DonationDate) message += `- ${error.DonationDate}\n`;

          if (error.Employee) message += `- ${error.Employee}\n`;

          if (error.DonationPercentage)
            message += `- ${error.DonationPercentage}\n`;

          if (error.NominalAmmount) message += `- ${error.NominalAmmount}\n`;

          if (error.DonationType) message += `- ${error.DonationType}\n`;

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

  handleEditDonationClick = (donation) => {
    this.setState({ selected: donation }, () => {
      this.getDonationById(donation.Id, "EDIT");
    });
  };

  handleDeleteDonationClick = (donation) => {
    this.setState({ selectedDonation: donation }, () => {
      this.showDeleteDonationModal(true);
    });
  };

  handleViewDonationClick = (donation) => {
    this.setState({ selectedDonation: donation }, () => {
      this.getDonationById(donation.Id, "VIEW");
    });
  };

  deleteDonationClickHandler = () => {
    this.setState({ deleteDonationLoading: true });

    const url = `${CONST.URI_ATTENDANCE}donation/${this.state.selectedDonation.Id}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    Promise.all([axios.delete(url, { headers: headers })])
      .then((values) => {
        alert("Data Berhasil dihapus");
        this.setState({ deleteDonationLoading: false });
        this.setData();
      })
      .catch((err) => {
        if (err.response.status === 400) {
          alert("Data Berhasil dihapus");
          this.setState({ deleteDonationLoading: false });
        } else {
          alert("Terjadi kesalahan!");
          this.setState({ deleteDonationLoading: false });
        }
        console.log(err.response);
        this.setState({ deleteDonationLoading: false });
      })
      .then(() => {
        this.showDeleteDonationModal(false);
        this.setData();
      });
  };

  handleEditDonation = () => {
    let donationDate = moment(this.state.selectedDonation?.DonationDate).format(
      "DD/MM/YYYY"
    );
    if (donationDate !== "01/01/0001") {
      this.updateDonation();
    } else {
      this.setState({
        validationCreateForm: {
          DonationDate: "Tanggal harus lebih dari 01/01/0001",
        },
        isEditLoading: false,
      });
    }
  };

  updateDonation = () => {
    let donationDate = moment
      .utc(this.state.selectedDonation?.DonationDate)
      .format("DD/MM/YYYY");
    this.setState({ updateEmployeeLoading: true });

    const payload = {
      Id: this.state.selectedDonation?.Id,
      EmployeeId: this.state.selectedDonation?.EmployeeId,
      DonationDate: donationDate,
      DonationType: this.state.selectedTypeToEdit?.value,
      DonationPercentage: this.state.donationPercentageToEdit,
      NominalAmmount: this.state.selectedDonation?.NominalAmmount,
    };

    const url = `${CONST.URI_ATTENDANCE}donation/${payload.Id}`;
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
          {
            isEditLoading: false,
            selectedDonation: {},
            page: 1,
            activePage: 1,
          },
          () => {
            this.showEditDonationModal(false);
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

  getDonationById = (id, state) => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}donation/${id}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        var selectedDonation = data.data;
        selectedDonation.DonationDate = moment(
          selectedDonation.DonationDate
        ).format("YYYY-MM-DD");

        let selectedTypeToEdit = {
          value: selectedDonation.DonationType,
          label: selectedDonation.DonationType,
        };

        // var selectedUnit = this.state.units.find(f => f.Id === selectedDonation.Unit.Id);

        this.setState(
          {
            loading: false,
            activePage: 1,
            page: 1,
            //   selectedUnitToCreate : selectedUnit,
            selectedDonation: selectedDonation,
            selectedTypeToEdit: selectedTypeToEdit,
            donationPercentageToEdit: selectedDonation.DonationPercentage,
          },
          () => {
            if (state === "VIEW") this.showViewDonationModal(true);
            else if (state === "EDIT") this.showEditDonationModal(true);
          }
        );
      })
      .catch((err) => {
        alert("Terjadi kesalahan!");
        this.setState({ loading: false });
      });
  };

  showEditDonationModal = (value) => {
    if (!value) this.setState({ selectedDonation: {} });

    this.setState({ isShowEditDonationModal: value, isEditLoading: false });
  };
  showViewDonationModal = (value) => {
    if (!value) this.setState({ selectedDonation: {} });

    this.setState({ isShowViewDonationModal: value });
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
            <td>{item.FixedIncome}</td>
            <td>{item.DonationType}</td>
            <td>{item.DonationPercentage}</td>
            <td>{item.NominalAmmount}</td>
            <td>{moment(item.DonationDate).format("DD-MM-YYYY")}</td>
            <td>
              <Form>
                <FormGroup>
                  <RowButtonComponent
                    className="btn btn-success"
                    name="view-credit-union-cut"
                    onClick={this.handleViewDonationClick}
                    data={item}
                    iconClassName="fa fa-eye"
                    label=""
                  ></RowButtonComponent>
                  <RowButtonComponent
                    className="btn btn-primary"
                    name="edit-credit-union-cut"
                    onClick={this.handleEditDonationClick}
                    data={item}
                    iconClassName="fa fa-pencil-square"
                    label=""
                  ></RowButtonComponent>
                  <RowButtonComponent
                    className="btn btn-danger"
                    name="delete-credit-union-cut"
                    onClick={this.handleDeleteDonationClick}
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
                className="btn btn-success mr-5"
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
                  <FormLabel>Bulan</FormLabel>
                </Col>
                <Col sm={4}>
                  <DatePicker
                    className="datePickerMonthYearOnly"
                    name="Period"
                    id="Period"
                    dateFormat="MMMM yyyy"
                    placeholderText="pilih bulan"
                    showMonthYearPicker
                    value={
                      this.state.selectedMonth
                        ? moment(this.state.selectedMonth).format("MMMM yyyy")
                        : null
                    }
                    onChange={(value) => {
                      const date = moment(value).format("YYYY-MM-DD");
                      this.setState({ selectedMonth: date });
                    }}
                  />
                </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              <Row>
                <Col sm={1} className={"text-right"}>
                  <FormLabel>Karyawan</FormLabel>
                </Col>
                <Col sm={4}>
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
                </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              <Row>
                <Col sm={1}></Col>
                <Col sm={4}>
                  <Button
                    className="btn btn-secondary mr-5"
                    name="reset"
                    onClick={this.resetPagingConfiguration}
                  >
                    Reset
                  </Button>
                  <Button
                    className="btn btn-primary mr-5"
                    name="search"
                    onClick={this.search}
                  >
                    Cari
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
                      <th>Jenis Sumbangan</th>
                      <th>Upah Tetap(Rp)</th>
                      <th>Besar Sumbangan(%)</th>
                      <th>Nominal(Rp)</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr key="0">
                      <td colSpan="10" className="text-center">
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
                        <th>Upah Tetap(Rp)</th>
                        <th>Jenis Sumbangan</th>
                        <th>Besar Sumbangan(%)</th>
                        <th>Nominal(Rp)</th>
                        <th>Tanggal</th>
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

            {/* modal Create */}
            <Modal
              dialogClassName="modal-90w"
              aria-labelledby="modal-add-donation"
              show={this.state.isShowAddDonationModal}
              onHide={() => this.showAddDonationModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-add-donation">
                  Tambah Sumbangan
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
                        let form = this.state.form;
                        let percentage = form["DonationPercentage"];
                        let fixedIncome = selected[0]?.BaseSalary + selected[0]?.MealAllowance;

                        if (!isNaN(percentage) && !isNaN(fixedIncome)) {
                          form["NominalAmmount"] = (percentage / 100) * fixedIncome;
                        }
                        this.setState({
                          selectedEmployeeToCreate: selected[0],
                          form: form,
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

                {/*<Row>*/}
                {/*  <Col sm={4}>*/}
                {/*    <Form.Label>Masa Kerja</Form.Label>*/}
                {/*  </Col>*/}
                {/*  <Col sm={8}>*/}
                {/*    {console.log(this.state.selectedEmployeeToCreate?.BeginContractDate)}*/}
                {/*    <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{moment(this.state.selectedEmployeeToCreate?.BeginContractDate).format("DD-MM-YYYY")} s/d {moment(this.state.selectedEmployeeToCreate?.EndContractDate).format("DD-MM-YYYY")}  </Form.Label>*/}
                {/*  </Col>*/}
                {/*</Row>*/}

                <Row>
                  <Col sm={4}>
                    <Form.Label>Upah Tetap</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedEmployeeToCreate?.FixedIncome }
                     
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
                      value={this.state.form.DonationDate || ""}
                      onChange={(event) => {
                        var { form } = this.state;
                        form["DonationDate"] = event.target.value;

                        this.setState({ form: form });
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.DonationDate}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Jenis Sumbangan</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Select
                      className={
                        this.state.validationSearch.Type ? "invalid-select" : ""
                      }
                      options={this.state.donationtypes}
                      value={this.state.selectedTypeToCreate}
                      onChange={(event) => {
                        var { form } = this.state;
                        let isReadOnlyPercentage = false;
                        if (event.value === "uang pisah") {
                          isReadOnlyPercentage = true;
                        }
                        this.setState({
                          selectedTypeToCreate: event,
                          form: form,
                          isReadOnlyPercentage: isReadOnlyPercentage,
                        });
                      }}
                    ></Select>
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.DonationType}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Besar Sumbangan</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Input
                      type="number"
                      max={100}
                      min={0}
                      readOnly={this.state.isReadOnlyPercentage}
                      value={this.state.form.DonationPercentage || ""}
                      onChange={(value) => {
                        var { form } = this.state;

                        let fixedIncome = this.state.selectedEmployeeToCreate
                          ?.BaseSalary;

                        let percentage = value.target.value;
                        form["DonationPercentage"] = percentage;

                        if (!isNaN(percentage) && !isNaN(fixedIncome)) {
                          form["NominalAmmount"] =
                            (value.target.value / 100) * fixedIncome;
                        }

                        this.setState({ form: form });
                      }}
                    />
                  </Col>
                  <span style={{ color: "red" }}>
                    {this.state.validationCreateForm?.DonationPercentage}
                  </span>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Nominal (Rp)</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Input
                      type="number"
                      value={this.state.form.NominalAmmount || ""}
                      onChange={(value) => {
                        var { form } = this.state;
                        form["NominalAmmount"] = value.target.value;
                        this.setState({ form: form });
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.NominalAmmount}
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
                      name="create-donation"
                      onClick={this.handleCreateDonation}
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
              aria-labelledby="modal-view-donation"
              show={this.state.isShowViewDonationModal}
              onHide={() => this.showViewDonationModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-view-donation">
                  Lihat Detail Sumbangan
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedDonation?.EmployeeIdentity}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedDonation?.EmployeeName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Unit/Bagian</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedDonation?.UnitName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedDonation?.SectionName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Group</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedDonation?.GroupName}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Upah Tetap</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedDonation?.FixedIncome}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Jenis Sumbangan</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {this.state.selectedDonation?.DonationType}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Tanggal Sumbangan</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      {moment(this.state.selectedDonation?.DonationDate).format(
                        "DD-MM-YYYY"
                      )}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Besar Sumbangan (%)</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Form.Label>
                      {Number(
                        this.state.selectedDonation?.DonationPercentage
                          ? this.state.selectedDonation.DonationPercentage
                          : 0
                      )}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Nominal(Rp)</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Form.Label>
                      {Number(
                        this.state.selectedDonation?.NominalAmmount
                          ? this.state.selectedDonation?.NominalAmmount
                          : 0
                      )}
                    </Form.Label>
                  </Col>
                </Row>
              </Modal.Body>
              {/* <Modal.Footer>
                            {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                <div>
                                <Button className="btn btn-success" name="view-driver-allowance" onClick={this.setState({isShowViewDonationModal:false})}>Close</Button>
                                </div>
                            )}
                            </Modal.Footer> */}
            </Modal>

            {/* modal edit */}
            <Modal
              dialogClassName="modal-90w"
              aria-labelledby="modal-edit-donation"
              show={this.state.isShowEditDonationModal}
              onHide={() => this.showEditDonationModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-edit-donation">
                  Edit Sumbangan
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
                      {this.state.selectedDonation?.EmployeeIdentity}
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
                      {this.state.selectedDonation?.EmployeeName}
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
                      {this.state.selectedDonation?.UnitName}
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
                      {this.state.selectedDonation?.SectionName}
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
                      {this.state.selectedDonation?.GroupName}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Upah Tetap</Form.Label>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {this.state.selectedDonation?.FixedIncome}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Tanggal Sumbangan</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Input
                      type="date"
                      value={this.state.selectedDonation.DonationDate}
                      onChange={(event) => {
                        var { selectedDonation } = this.state;
                        selectedDonation["DonationDate"] = event.target.value;
                        this.setState({ selectedDonation: selectedDonation });
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.DonationDate}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Jenis Sumbangan</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Select
                      className={
                        this.state.validationSearch.Type ? "invalid-select" : ""
                      }
                      options={this.state.donationtypes}
                      value={this.state.selectedTypeToEdit}
                      onChange={(event) => {
                        var { form } = this.state;
                        let isReadOnlyPercentage = false;
                        let donationPercentageToEdit = this.state
                          .selectedDonation.DonationPercentage;

                        if (event.value === "uang pisah") {
                          isReadOnlyPercentage = true;
                          donationPercentageToEdit = 0;
                        }

                        this.setState({
                          selectedTypeToEdit: event,
                          form: form,
                          donationPercentageToEdit: donationPercentageToEdit,
                          isReadOnlyPercentage: isReadOnlyPercentage,
                        });
                      }}
                    ></Select>
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.DonationType}
                    </span>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Besar Sumbangan (%)</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      readOnly={this.state.isReadOnlyPercentage}
                      value={Number(
                        this.state.donationPercentageToEdit
                          ? this.state.donationPercentageToEdit
                          : 0
                      )}
                      onChange={(event) => {
                        var { selectedDonation } = this.state;
                        let fixIncome = selectedDonation["FixedIncome"];
                        let percentage = this.state.donationPercentageToEdit;
                        if (!isNaN(fixIncome && !isNaN(percentage))) {
                          let nominal = (percentage / 100) * fixIncome;
                          selectedDonation["NominalAmmount"] = nominal;
                        }
                        percentage = event.target.value;
                        selectedDonation["DonationPercentage"] = percentage;
                        this.setState({
                          selectedDonation: selectedDonation,
                          donationPercentageToEdit: percentage,
                        });
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.DonationPercentage}
                    </span>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4} className={"text-left"}>
                    <FormLabel>Nominal (Rp)</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Input
                      type="number"
                      value={this.state.selectedDonation.NominalAmmount || ""}
                      onChange={(value) => {
                        var { selectedDonation } = this.state;
                        selectedDonation["NominalAmmount"] = value.target.value;
                        this.setState({ selectedDonation: selectedDonation });
                      }}
                    />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.NominalAmmount}
                    </span>
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
                      onClick={this.handleEditDonation}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            {/* modal delete */}

            <Modal
              aria-labelledby="modal-delete-donation"
              show={this.state.isShowDeleteDonationModal}
              onHide={() => this.showDeleteDonationModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-delete-data">
                  Hapus Sumbangan
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Apakah anda yakin ingin menghapus data{" "}
                {this.state.selectedDonation?.Name}?
              </Modal.Body>
              <Modal.Footer>
                {this.state.deleteDonationLoading ? (
                  <span>
                    <Spinner size="sm" color="primary" /> Mohon tunggu...
                  </span>
                ) : (
                  <div>
                    <Button
                      className="btn btn-danger"
                      name="delete-donation"
                      onClick={this.deleteDonationClickHandler}
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
export default Donation;
