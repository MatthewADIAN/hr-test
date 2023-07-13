import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
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
  ModalFooter
} from "react-bootstrap";
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
const DOWNLOAD_BANKING_REPORT = "thr/banking-report"
const DOWNLOAD_THR_REPORT = "thr/thr-report"
const DOWNLOAD_SLIP_THR = "thr/slip-thr"

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";

class Thr extends Component {
  typeaheadEmployeeCreateForm = {};
  typeaheadEmployeeSearchForm = {};
  state = {
    loading: false,
    isCreateLoading: false,
    isEditLoading: false,
    isAutoCompleteLoading: false,
    deleteThrLoading: false,


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
    selectedThr: {},

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

    //modal state
    isShowAddThrModal: false,
    isShowEditThrModal: false,
    isShowViewThrModal: false,
    isShowDeleteThrModal: false,

    thrPercentageToCreate: 0,
    thrNominalToCreate: 0,
    piecesOfClothToCreate: 0,
    totalDaysToCreate: 0,

    thrPercentageToEdit: 0,
    thrNominalToEdit: 0,
    piecesOfClothToEdit: 0,
    periodToEdit: "",

    startDate: "",
    endDate: "",
     userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    otherUnitId: JSON.parse(localStorage.getItem("otherUnitId"))

  }
  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
      selectedUnit: null,
      selectedSection: null,
      selectedGroup: null,
      selectedStartPeriode: new Date(),
      selectedEndPeriode: new Date(),
      validationCreateForm: {},
      piecesOfClothToCreate: 0
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

  searchData = () => {
    // this.resetPagingConfiguration();

    const params = {
      unitId: this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0,
      groupId: this.state.selectedSearchGroup ? this.state.selectedSearchGroup.Id : 0,
      sectionId: this.state.selectedSearchSection ? this.state.selectedSearchSection.Id : 0,
      employeeId: this.state.selectedSearchEmployee ? this.state.selectedSearchEmployee.Id : 0,
      page: this.state.activePage,

      startDate: moment(this.state.startDate).format("YYYY-MM-DD"),
      endDate: moment(this.state.endDate).format("YYYY-MM-DD")
    };

    this.setState({ loadingData: true })
    this.service
      .getThr(params)
      .then((result) => {
       
        this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
      }).catch((err) => {
        this.setState({ activePage: 1, total: 0, tableData: [], loadingData: false })
      });
  }

  setData = () => {
    this.resetPagingConfiguration();
   
    const params = {
      unitId: this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0,
      groupId: this.state.selectedSearchGroup ? this.state.selectedSearchGroup.Id : 0,
      sectionId: this.state.selectedSearchSection ? this.state.selectedSearchSection.Id : 0,
      employeeId: this.state.selectedSearchEmployee ? this.state.selectedSearchEmployee.Id : 0,
      page: this.state.activePage,

      startDate: moment(this.state.startDate).format("YYYY-MM-DD"),
      endDate: moment(this.state.endDate).format("YYYY-MM-DD")
    };

    this.setState({ loadingData: true })
    this.service
      .getThr(params)
      .then((result) => {
       
        this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
      }).catch((err) => {
        this.setState({ activePage: 1, total: 0, tableData: [], loadingData: false })
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
          var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm
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
          this.setState({
            searchSections: result,
            selectedSearchGroup: null,
            selectedSearchSection: null,
            selectedSearchEmployee: null
          })
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
          if ((this.state.userAccessRole == PERSONALIA_BAGIAN || this.state.userAccessRole == PIMPINAN || this.state.userAccessRole == UPAH) 
          && (this.state.otherUnitId.includes(s.Id))) {
            units.push(s);
          } else if (this.state.userAccessRole == PERSONALIA_PUSAT ) {
            units.push(s);
          }
        });
       
        this.setState({ searchUnits: units })
      });
  }

  setEmployeeSearch = () => {

    let params = {};
    params.unitId = this.state.selectedSearchUnit?.Id;
    params.groupId = this.state.selectedSearchGroup?.Id;
    params.sectionId = this.state.selectedSearchSection?.Id;
    params.employeeId = this.state.selectedSearchEmployee?.Id;


    
    this.service
      .searchEmployeeSearch(params)
      .then((result) => {
        
        this.setState({ searchEmployee: result })
      });

  }

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
    this.searchData();
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
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
      keyword: query
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

  downloadBankingReport = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus DIisi" } })
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { EndDate: "Tanggal Akhir Harus Diisi" } })
    } else {
      this.dataBankingReport();
    }
  }

  dataBankingReport = () => {
    this.setState({ loadingData: true })

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?adminEmployeeId=${adminEmployeeId}`

    if (this.state.startDate)
      query += "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD")

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD")

    if (this.state.selectedSearchEmployee)
      query += "&employeeId=" + this.state.selectedSearchEmployee?.Id

    if (this.state.selectedSearchUnit)
      query += "&unitId=" + this.state.selectedSearchUnit?.Id
    if (this.state.selectedSearchGroup)
      query += "&groupId=" + this.state.selectedSearchGroup?.Id
    if (this.state.selectedSearchSection)
      query += "&sectionId=" + this.state.selectedSearchSection?.Id



    const value = localStorage.getItem('token');
    const Header = {
      accept: 'application/json',
      Authorization: `Bearer ` + value,
      'x-timezone-offset': moment().utcOffset() / 60
    };

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + DOWNLOAD_BANKING_REPORT + query,
      responseType: 'blob',
      headers: Header,
    }).then(data => {
     
      let disposition = data.headers['content-disposition']
      let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])

      fileDownload(data.data, filename);
      this.setState({ loading: false, loadingData: false });
    }).catch(err => {
      
      this.setState({ loading: false, loadingData: false });
    });
  }

  downloadThrReport = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus DIisi" } })
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { EndDate: "Tanggal Akhir Harus Diisi" } })
    } else {
      this.dataThrReport();
    }
  }

  dataThrReport = () => {
    this.setState({ loadingData: true })

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?adminEmployeeId=${adminEmployeeId}`

    if (this.state.startDate)
      query += "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD")

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD")

    if (this.state.selectedSearchEmployee)
      query += "&employeeId=" + this.state.selectedSearchEmployee?.Id

    if (this.state.selectedSearchUnit)
      query += "&unitId=" + this.state.selectedSearchUnit?.Id

    if (this.state.selectedSearchGroup)
      query += "&groupId=" + this.state.selectedSearchGroup?.Id
    if (this.state.selectedSearchSection)
      query += "&sectionId=" + this.state.selectedSearchSection?.Id

  

    const value = localStorage.getItem('token');
    const Header = {
      accept: 'application/json',
      Authorization: `Bearer ` + value,
      'x-timezone-offset': moment().utcOffset() / 60
    };

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + DOWNLOAD_THR_REPORT + query,
      responseType: 'blob',
      headers: Header,
    }).then(data => {

      let disposition = data.headers['content-disposition']
      let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])

      fileDownload(data.data, filename);
      this.setState({ loading: false, loadingData: false });
    }).catch(err => {
     
      this.setState({ loading: false, loadingData: false });
    });
  }

  downloadSlipThr = () => {
    this.setState({ validationSearch: {} });

    if (moment(this.state.startDate) > moment(this.state.endDate)) {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus Kurang Dari Tanggal Akhir" } })
    } else if (this.state.startDate == null || this.state.startDate == "") {
      this.setState({ validationSearch: { StartDate: "Tanggal Awal Harus DIisi" } })
    } else if (this.state.endDate == null || this.state.endDate == "") {
      this.setState({ validationSearch: { EndDate: "Tanggal Akhir Harus Diisi" } })
    } else {
      this.dataSlipThr();
    }
  }

  dataSlipThr = () => {
   
    this.setState({ loadingData: true })

    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let query = `?adminEmployeeId=${adminEmployeeId}`

    if (this.state.startDate)
      query += "&startDate=" + moment(this.state.startDate).format("YYYY-MM-DD")

    if (this.state.endDate)
      query += "&endDate=" + moment(this.state.endDate).format("YYYY-MM-DD")

    if (this.state.selectedSearchEmployee)
      query += "&employeeId=" + this.state.selectedSearchEmployee?.Id

    if (this.state.selectedSearchUnit)
      query += "&unitId=" + this.state.selectedSearchUnit?.Id

    if (this.state.selectedSearchGroup)
      query += "&groupId=" + this.state.selectedSearchGroup?.Id
    if (this.state.selectedSearchSection)
      query += "&sectionId=" + this.state.selectedSearchSection?.Id

   

    const value = localStorage.getItem('token');
    const Header = {
      accept: 'application/json',
      Authorization: `Bearer ` + value,
      'x-timezone-offset': moment().utcOffset() / 60
    };

    axios({
      method: 'get',
      url: CONST.URI_ATTENDANCE + DOWNLOAD_SLIP_THR + query,
      responseType: 'blob',
      headers: Header,
    }).then(data => {
    
      let disposition = data.headers['content-disposition']
      let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])

      fileDownload(data.data, filename);
      this.setState({ loading: false, loadingData: false });
    }).catch(err => {
      
      this.setState({ loading: false, loadingData: false });
    });
  }

  resetCreateModalValue = () => {
    this.setState({
      form: {},

      selectedEmployeeToCreate: null,
      selectedUnitToCreate: null,
      validationCreateForm: {},

    })
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
      //   startDate :null,
      //   endDate : null,
      selectedSearchGroup: null,
      selectedSearchUnit: null,
      selectedSearchSection: null,
      selectedSearchEmployee: null,
    });
    var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm
    instanceEmployeeSearch.clear();
  }

  create = () => {

    this.showAddDonationModal(true);
  }

  showAddDonationModal = (value) => {
    this.resetCreateModalValue();
    this.setState({ isShowAddThrModal: value, isCreateLoading: false });
  }

  showDeleteThrModal = (value) => {
    this.setState({ isShowDeleteThrModal: value, deleteThrLoading: false });
  }

  handleCreateThr = () => {
    let periode = moment(this.state.form.Period).format("DD/MM/YYYY")

    if (periode !== "01/01/0001") {
      this.createThr()
    } else {
      this.setState({
        validationCreateForm: { DonationDate: "Tanggal harus lebih dari 01/01/0001" },
        isCreateLoading: false
      })
    }

  }

  createThr = () => {

    const payload = {
      UnitId: this.state.selectedSearchUnit?.Id,
      GroupId: this.state.selectedSearchGroup?.Id,
      SectionId: this.state.selectedSearchSection?.Id,
      Period: this.state.form.Period,
      PiecesOfCloth: this.state.piecesOfClothToCreate,

    }

    this.setState({ isCreateLoading: true });
    this.service.postThr(payload)
      .then((result) => {

        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil disimpan!'
        })
        this.setState({ isCreateLoading: false }, () => {

          this.resetPagingConfiguration();
          this.setData();
          this.showAddDonationModal(false);
        });
      })
      .catch((error) => {
        if (error) {
          let message = "";
          if (error.Period)
            message += `- ${error.Period}\n`;

          if (error.Employee)
            message += `- ${error.Employee}\n`;

          if (error.ThrPercentage)
            message += `- ${error.ThrPercentage}\n`;

          if (error.UnitId)
            message += `- ${error.UnitId}\n`;

          if (error.PiecesOfCloth)
            message += `- ${error.PiecesOfCloth}\n`;

          this.setState({ validationCreateForm: error });

          this.setState({ isCreateLoading: false });
          swal({
            icon: 'error',
            title: 'Oops...',
            text: message
          });
        }
      });

  }

  handleViewThrClick = (thr) => {

    this.setState({
      loading: false,
      activePage: 1,
      page: 1,
      selectedThr: thr,

    }, () => {
      this.showViewThrModal(true);
    });

  }


  handleEditThrClick = (thr) => {

    this.setState({
      loading: false,
      activePage: 1,
      page: 1,
      selectedThr: thr,
      thrPercentageToEdit: thr.ThrPercentage,
      thrNominalToEdit: thr.ThrNominal,
      piecesOfClothToEdit: thr.PiecesOfCloth,
      periodToEdit: moment(thr.Period).format("YYYY-MM-DD"),
    }, () => {
      this.showEditThrModal(true);
    });

    // this.setState({selected: thr}, () => {
    //   this.getThrById(thr.Id, "EDIT")
    // });
  }

  handleDeleteThrClick = (donation) => {
    this.setState({ selectedThr: donation }, () => {
      this.showDeleteThrModal(true);
    });
  }


  deleteThrClickHandler = () => {
    this.setState({ deleteThrLoading: true });

    const url = `${CONST.URI_ATTENDANCE}thr/${this.state.selectedThr.Id}`;
    const headers = {
      'Content-Type': 'application/json',
      accept: 'application/json',
      Authorization: `Bearer ` + localStorage.getItem('token'),
      'x-timezone-offset': moment().utcOffset() / 60
    }

    Promise.all([
      axios.delete(url, { headers: headers }),
    ])
      .then((values) => {

        alert("Data Berhasil dihapus");
        this.setState({ deleteThrLoading: false });
        this.setData();
      }).catch((err) => {
        if (err.response.status === 400) {
          alert("Data Berhasil dihapus");
          this.setState({ deleteThrLoading: false });

        } else {
          alert("Terjadi kesalahan!");
          this.setState({ deleteThrLoading: false });
        }
     
        this.setState({ deleteThrLoading: false });
      }).then(() => {
        this.showDeleteThrModal(false);
        this.setData();
      });
  }

  handleEditThr = () => {
    let period = moment(this.state.selectedThr?.Period).format("DD/MM/YYYY")
    if (period !== "01/01/0001") {
      this.updateThr();
    } else {
      this.setState({ validationCreateForm: { Period: "Tanggal harus lebih dari 01/01/0001" }, isEditLoading: false })
    }

  }


  updateThr = () => {

    let periodToEdit = moment.utc(this.state.periodToEdit).format("DD/MM/YYYY")
    this.setState({ updateEmployeeLoading: true });

    const payload = {
      Id: this.state.selectedThr?.Id,
      EmployeeId: this.state.selectedThr?.EmployeeId,
      // Period: periodToEdit,
      PiecesOfCloth: this.state.piecesOfClothToEdit,
      ThrPercentage: this.state.thrPercentageToEdit,
      ThrNominal: this.state.thrNominalToEdit,
    }

    
    const url = `${CONST.URI_ATTENDANCE}thr/${payload.Id}`;
    const headers = {
      'Content-Type': 'application/json',
      accept: 'application/json',
      Authorization: `Bearer ` + localStorage.getItem('token'),
      'x-timezone-offset': moment().utcOffset() / 60
    }
    axios.put(url, payload, { headers: headers }).then(() => {
      swal("Data berhasil disimpan!");
      this.setState({ isEditLoading: false, selectedThr: {}, page: 1, activePage: 1 }, () => {
        this.showEditThrModal(false);
        this.setData();
      });
    }).catch((err) => {
      if (err.response) {
        this.setState({ validationCreateForm: err.response.data.error });
      
      }
      // alert("Terjadi kesalahan!");
      this.setState({ isEditLoading: false });
      this.setData();
    });
  }

  getThrById = (id, state) => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}thr/${id}`;
    const headers = {
      'Content-Type': 'application/json',
      accept: 'application/json',
      Authorization: `Bearer ` + localStorage.getItem('token'),
      'x-timezone-offset': moment().utcOffset() / 60
    }
    axios.get(url, { headers: headers }).then((data) => {

      var selectedThr = data.data;
      //  selectedThr.Period = moment(selectedThr.Period).format("YYYY-MM-DD");

      this.setState({
        loading: false,
        activePage: 1,
        page: 1,
        selectedThr: selectedThr,
        thrPercentageToEdit: selectedThr.ThrPercentage,
        thrNominalToEdit: selectedThr.ThrNominal,
        piecesOfClothToEdit: selectedThr.PiecesOfCloth,
        periodToEdit: moment(selectedThr.Period).format("YYYY-MM-DD"),


      }, () => {
        if (state === "VIEW")
          this.showViewThrModal(true);
        else if (state === "EDIT")
          this.showEditThrModal(true);
      });


    }).catch(err => {

      alert("Terjadi kesalahan!");
      this.setState({ loading: false });
    });
  }


  showEditThrModal = (value) => {
    if (!value)
      this.setState({ selectedThr: {} });

    this.setState({ isShowEditThrModal: value, isEditLoading: false });
  }
  showViewThrModal = (value) => {

    if (!value)
      this.setState({ selectedThr: {} });

    this.setState({ isShowViewThrModal: value });
  }

  dateDiffInDays(date1, date2) {
    date1 = new Date(date1);
    date2 = new Date(date2);
    let difference_In_Time = date2.getTime() - date1.getTime();
    let difference_In_Days = difference_In_Time / (1000 * 3600 * 24);

    return difference_In_Days;
  }

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item, index) => {
      var totaldays = item.TotalDays;
      return (
        <tbody key={index}>
          <tr>

            <td>{item.EmployeeIdentity}</td>
            <td>{item.EmployeeName}</td>
            <td>{item.UnitName}</td>
            <td>{item.SectionName}</td>
            <td>{item.GroupName}</td>
            <td>{item.Jabatan}</td>
            <td> {moment(item.JoinDate).format("DD-MM-YYYY")}</td>
            <td> {
              Math.floor(totaldays / 365)
            } thn {
                Math.floor((totaldays % 365) / 30.4368499)
              } bln
          </td>
            <td>{(item.FixedIncome).toFixed(0)}</td>
            <td>{moment(item.Period).format("DD-MM-YYYY")}</td>
            <td>{item.PiecesOfCloth}</td>


            <td>
              <Form>
                <FormGroup>
                  <RowButtonComponent className="btn btn-success" name="view-credit-union-cut"
                    onClick={this.handleViewThrClick} data={item} iconClassName="fa fa-eye"
                    label=""></RowButtonComponent>
                  <RowButtonComponent className="btn btn-primary" name="edit-credit-union-cut"
                    onClick={this.handleEditThrClick} data={item} iconClassName="fa fa-pencil-square"
                    label=""></RowButtonComponent>
                  <RowButtonComponent className="btn btn-danger" name="delete-credit-union-cut"
                    onClick={this.handleDeleteThrClick} data={item} iconClassName="fa fa-trash"
                    label=""></RowButtonComponent>
                </FormGroup>
              </Form>
            </td>
          </tr>
        </tbody>
      )
    });

    return (
      <div className="animated fadeIn">
        {this.state.loading ? (
          <span><Spinner size="sm" color="primary" /> Please wait...</span>
        ) : (
            <Form>

              <FormGroup>
                <Row>
                  <Col sm={1} className={'text-right'}>
                    <FormLabel>Unit/Bagian</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Select
                      placeholder={'pilih unit'}
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
                      }} />
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Row>
                  <Col sm={1} className={'text-right'}>
                    <FormLabel>Seksi</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Select
                      placeholder={'pilih seksi'}
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

                      }} />
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Row>
                  <Col sm={1} className={'text-right'}>
                    <FormLabel>Group</FormLabel>
                  </Col>
                  <Col sm={5}>
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
                    <FormLabel>Periode</FormLabel>
                  </Col>
                  <Col sm={5}>
                    <Row>
                      <Col sm={5}>
                        <Form.Control
                          type="date"
                          value={this.state.startDate}
                          onChange={((event) => {

                            this.setState({ startDate: event.target.value });
                          })}
                          isInvalid={this.state.validationSearch.StartDate} />
                        <Form.Control.Feedback
                          type="invalid">{this.state.validationSearch.StartDate}</Form.Control.Feedback>
                      </Col>
                      <Col sm={2} className={'text-center'}>s/d</Col>
                      <Col sm={5}>
                        <Form.Control
                          type="date"
                          value={this.state.endDate}
                          onChange={((event) => {
                           
                            this.setState({ endDate: event.target.value });
                          })}
                          isInvalid={this.state.validationSearch.EndDate} />
                        <Form.Control.Feedback
                          type="invalid">{this.state.validationSearch.EndDate}</Form.Control.Feedback>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col sm={1} className={'text-right'}>
                    <FormLabel>Karyawan</FormLabel>
                  </Col>
                  <Col sm={5}>

                    <AsyncTypeahead
                      id="loader-employee-search-form"
                      ref={(typeahead) => {
                        this.typeaheadEmployeeSearchForm = typeahead
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
                  <Col sm={1}>
                  </Col>
                  <Col sm={11}>
                    <Button className="btn btn-secondary btn-sm mr-2 pull-left" name="reset" onClick={this.resetPagingConfiguration}>Reset</Button>
                    <Button className="btn btn-primary btn-sm mr-2 pull-left" name="search" onClick={this.search}>Cari</Button>
                    <Button className="btn btn-success btn-sm mr-2 pull-left" name="input-thr" onClick={this.create}>Tambah Data</Button>
                    <Button className="btn btn-primary btn-sm mr-2 pull-right" name="slip-thr" onClick={this.downloadSlipThr}>Slip THR </Button>
                    <Button className="btn btn-primary btn-sm mr-2 pull-right" name="slip-to-bank" onClick={this.downloadBankingReport}>Slip THR Ke Bank</Button>
                    <Button className="btn btn-primary btn-sm mr-2 pull-right" name="calculate-thr" onClick={this.downloadThrReport}>Laporan Perhitungan THR</Button>
                  </Col>


                </Row>

              </FormGroup>

              <FormGroup>
                {this.state.loadingData ? (
                  <span><Spinner size="sm" color="primary" /> Loading Data...</span>
                ) : this.state.tableData.length <= 0 ? (<Table responsive bordered striped>
                  <thead>
                    <tr className={'text-center'}>
                      <th>NIK</th>
                      <th>Nama</th>
                      <th>Unit/Bagian</th>
                      <th>Seksi</th>
                      <th>Group</th>
                      <th>Jabatan</th>
                      <th>Tanggal Masuk</th>
                      <th>Lama Masa kerja</th>
                      <th>Upah Tetap /Bulan</th>
                      <th>Periode</th>
                      <th>Jumlah Potongan Bahan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr key="0">
                      <td colSpan='12' className='text-center'>Data Kosong</td>
                    </tr>
                  </tbody>
                </Table>) : (
                      <Row>
                        <Table responsive bordered striped>
                          <thead>
                            <tr className={'text-center'}>
                              <th>NIK</th>
                              <th>Nama</th>
                              <th>Unit/Bagian</th>
                              <th>Seksi</th>
                              <th>Group</th>
                              <th>Jabatan</th>
                              <th>Tanggal Masuk</th>
                              <th>Lama Masa kerja</th>
                              <th>Upah Tetap /Bulan</th>
                              <th>Periode</th>
                              <th>Jumlah Potongan Bahan</th>
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
              <Modal dialogClassName="modal-90w" aria-labelledby="modal-add-thr" show={this.state.isShowAddThrModal}
                onHide={() => this.showAddDonationModal(false)} animation={true}>
                <Modal.Header>
                  <Modal.Title id="modal-add-thr">Tambah THR</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Periode</FormLabel>
                    </Col>
                    <Col sm={8}>
                      <Input
                        type='date'
                        value={this.state.form.Period || ''}
                        onChange={(event) => {
                          var { form } = this.state;
                          form["Period"] = event.target.value;
                          let period = event.target.value
                          this.setState({ form: form, Period: period });
                        }} />
                      <span style={{ color: "red" }}>{this.state.validationCreateForm?.Period}</span>
                    </Col>
                  </Row>


                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Unit/Bagian</FormLabel>
                    </Col>
                    <Col sm={8}>

                      <Select
                        placeholder={'pilih unit'}
                        isClearable={true}
                        options={this.state.units}
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
                        }} />
                      <span style={{ color: "red" }}>{this.state.validationCreateForm?.UnitId}</span>
                    </Col>

                  </Row>
                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Seksi</FormLabel>
                    </Col>
                    <Col sm={8}>
                      <Select
                        placeholder={'pilih seksi'}
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

                        }} />
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Group</FormLabel>
                    </Col>
                    <Col sm={8}>
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

                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Jumlah Potongan Kain</FormLabel>
                    </Col>
                    <Col sm={8}>
                      <Input
                        type='text'
                        value={this.state.piecesOfClothToCreate || ''}
                        onChange={(event) => {
                          let piecesOfClothToCreate = event.target.value
                          this.setState({ piecesOfClothToCreate: piecesOfClothToCreate });
                        }} />
                      <span style={{ color: "red" }}>{this.state.validationCreateForm?.PiecesOfCloth}</span>
                    </Col>
                  </Row>

                  {/*<Row>*/}
                  {/*  <Col sm={4}>*/}
                  {/*    <Form.Label>Upah per Bulan (Rp)</Form.Label>*/}
                  {/*  </Col>*/}
                  {/*  <Col sm={8}>*/}
                  {/*    <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedEmployeeToCreate?.FixedIncome }</Form.Label>*/}
                  {/*  </Col>*/}
                  {/*</Row>*/}

                  {/*<Row>*/}
                  {/*  <Col sm={4}>*/}
                  {/*    <Form.Label>Jumlah THR (Rp)</Form.Label>*/}
                  {/*  </Col>*/}
                  {/*  <Col sm={8}>*/}
                  {/*    <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.thrNominalToCreate} </Form.Label>*/}
                  {/*  */}
                  {/*  </Col>*/}
                  {/*</Row>*/}


                </Modal.Body>
                <Modal.Footer>
                  {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                    <div>
                      <Button className="btn btn-success" name="create-thr" onClick={this.handleCreateThr}>Submit</Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>

              {/* modal View */}
              <Modal dialogClassName="modal-90w" aria-labelledby="modal-view-thr" show={this.state.isShowViewThrModal}
                onHide={() => this.showViewThrModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-view-thr">Detail THR</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Periode</FormLabel>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>
                        {moment(this.state.selectedThr?.Period).format("DD-MM-YYYY")}
                      </Form.Label>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={4}>
                      <Form.Label>NIK</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>{this.state.selectedThr?.EmployeeIdentity}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4}>
                      <Form.Label>Nama</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>{this.state.selectedThr?.EmployeeName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4}>
                      <Form.Label>Unit/Bagian</Form.Label>
                    </Col>
                    <Col sm={8}>

                      <Form.Label>{this.state.selectedThr?.UnitName}</Form.Label>

                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4}>
                      <Form.Label>Seksi</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>{this.state.selectedThr?.SectionName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4}>
                      <Form.Label>Group</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>{this.state.selectedThr?.GroupName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Tanggal Masuk</FormLabel>
                    </Col>
                    <Col sm={8}>
                      <Form.Label> {moment(this.state.selectedThr?.JoinDate).format("DD-MM-YYYY")}</Form.Label>
                    </Col>
                  </Row>

                  {/* <Row>
                  <Col sm={4} className={'text-left'}>
                    <FormLabel>Lama Masa Kerja</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>{Math.floor(this.state.selectedThr?.TotalDays / 365) } Tahun  {Math.floor((this.state.selectedThr?.TotalDays % 365)/ 30.4368499)} bulan</Form.Label>
                  </Col>
                </Row> */}


                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Besar THR (%)</FormLabel>
                    </Col>
                    <Col sm={5}>
                      <Form.Label>
                        {Number(this.state.selectedThr?.ThrPercentage).toFixed(2)}
                      </Form.Label>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Potongan Kain</FormLabel>
                    </Col>
                    <Col sm={5}>
                      <Form.Label>
                        {Number(this.state.selectedThr?.PiecesOfCloth)}
                      </Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4}>
                      <Form.Label>Upah Tetap per Bulan</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>{this.state.selectedThr?.FixedIncome}</Form.Label>
                    </Col>
                  </Row>
                  {/*<Row>*/}
                  {/*  <Col sm={4} className={'text-left'}>*/}
                  {/*    <FormLabel>Nominal THR (Rp)</FormLabel>*/}
                  {/*  </Col>*/}
                  {/*  <Col sm={5}>*/}
                  {/*    <Form.Label>*/}
                  {/*      {Number(this.state.selectedThr?.ThrNominal)}*/}
                  {/*    </Form.Label>*/}
                  {/*  </Col>*/}
                  {/*</Row>*/}
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
              <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-thr" show={this.state.isShowEditThrModal}
                onHide={() => this.showEditThrModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-edit-thr">Edit THR</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={4}>
                      <Form.Label>NIK</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedThr?.EmployeeIdentity}</Form.Label>

                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4}>
                      <Form.Label>Nama</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedThr?.EmployeeName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4}>
                      <Form.Label>Unit/Bagian</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedThr?.UnitName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4}>
                      <Form.Label>Seksi</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedThr?.SectionName}</Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={4}>
                      <Form.Label>Group</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedThr?.GroupName}</Form.Label>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Periode</FormLabel>
                    </Col>
                    <Col sm={8}>
                      <Input
                        type='date'
                        readOnly={true}
                        value={this.state.periodToEdit}
                        onChange={(event) => {
                          this.setState({ periodToEdit: event.target.value });
                        }} />
                      <span style={{ color: "red" }}>{this.state.validationCreateForm?.Periode}</span>

                    </Col>
                  </Row>
                  {/* <Row>
                  <Col sm={4} className={'text-left'}>
                    <FormLabel>Lama Masa Kerja</FormLabel>
                  </Col>
                  <Col sm={8}>
                    <Form.Label>{Math.floor(this.state.selectedThr?.TotalDays / 365) } Tahun  {Math.floor((this.state.selectedThr?.TotalDays % 365)/ 30.4368499)} bulan</Form.Label>
                  </Col>
                </Row> */}
                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Jumlah Potongan</FormLabel>
                    </Col>
                    <Col sm={5}>
                      <Input
                        type='number'
                        min={0}
                        max={10}
                        value={this.state.piecesOfClothToEdit}
                        onChange={(event) => {
                          let piecesOfCloth = event.target.value
                          this.setState({ piecesOfClothToEdit: piecesOfCloth });
                        }} />
                      <span style={{ color: "red" }}>{this.state.validationCreateForm?.PiecesOfCloth}</span>

                    </Col>
                  </Row>

                  <Row>
                    <Col sm={4} className={'text-left'}>
                      <FormLabel>Besar THR (%)</FormLabel>
                    </Col>
                    <Col sm={5}>
                      <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedThr?.ThrPercentage}</Form.Label>
                      {/*<Input*/}
                      {/*  type='number'*/}
                      {/*  min={0}*/}
                      {/*  max={200}*/}
                      {/*  value={this.state.thrPercentageToEdit}*/}
                      {/*  onChange={(event) => {*/}
                      {/*    var { selectedThr } = this.state;*/}
                      {/*    let fixIncome =selectedThr["FixedIncome"];*/}
                      {/*    let percentage=event.target.value*/}
                      {/*    var nominal =this.state.thrNominalToEdit;*/}
                      {/*    if(!isNaN(fixIncome && !isNaN(percentage))){*/}
                      {/*       nominal = (percentage /100)* fixIncome;*/}
                      {/*    }*/}
                      {/*    this.setState({selectedThr:selectedThr,thrPercentageToEdit :percentage , thrNominalToEdit:nominal } );*/}
                      {/*  }}/>*/}
                      {/*<span style={{color:"red"}}>{this.state.validationCreateForm?.ThrPercentage}</span>*/}

                    </Col>


                  </Row>

                  <Row>
                    <Col sm={4}>
                      <Form.Label>Upah Per Bulan</Form.Label>
                    </Col>
                    <Col sm={8}>
                      <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedThr?.FixedIncome}</Form.Label>
                    </Col>
                  </Row>
                  {/*<Row>*/}
                  {/*  <Col sm={4} className={'text-left'}>*/}
                  {/*    <FormLabel>Jumlah THR (Rp)</FormLabel>*/}
                  {/*  </Col>*/}
                  {/*  <Col sm={5}>*/}
                  {/*    <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedThr?.thrNominalToEdit}</Form.Label>*/}

                  {/*  </Col>*/}
                  {/*</Row>*/}
                </Modal.Body>
                <Modal.Footer>
                  {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                    <div>
                      <Button className="btn btn-success" name="edit-credit-union-cut"
                        onClick={this.handleEditThr}>Submit</Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>

              {/* modal delete */}

              <Modal aria-labelledby="modal-delete-thr" show={this.state.isShowDeleteThrModal}
                onHide={() => this.showDeleteThrModal(false)} animation={true}>
                <Modal.Header closeButton>
                  <Modal.Title id="modal-delete-thr">Hapus THR</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Apakah anda yakin ingin menghapus data {this.state.selectedThr?.Name}?
              </Modal.Body>
                <Modal.Footer>
                  {this.state.deleteThrLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                    <div>
                      <Button className="btn btn-danger" name="delete-delete"
                        onClick={this.deleteThrClickHandler}>Hapus</Button>
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

export default Thr;
