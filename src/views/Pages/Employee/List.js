import React, { Component } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Spinner,
  Input,
  FormGroup,
  Button,
  Label,
} from "reactstrap";
import { Form } from "react-bootstrap";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Pagination from "react-js-pagination";
import RowButtonComponent from "./RowButtonComponent";
import ViewTable from "./ViewTable";
import RiwayatMutasi from "./RiwayatMutasi";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import Select from "react-select";
import swal from "sweetalert";
import debounce from "lodash.debounce";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
// import AsyncSelect from 'react-select/async';
import * as CONST from "../../../Constant";
import NumberFormat from "react-number-format";

import Service from "./Service";

import "react-datepicker/dist/react-datepicker.css";

import "./style.css";

const moment = require("moment");
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";

class List extends Component {
  constructor(props) {
    super(props);
    this.service = new Service();
    this.state = {
      loading: false,
      loadingData: false,

      selectedFile: null,
      isShowUploadModal: false,
      uploadFileLoading: false,

      trainings: [],
      mutationLogs: [],

      selectedEmployee: {},
      isShowCreateEmployeeModal: false,

      isShowEditEmployeeModal: false,

      isShowDeleteEmployeeModal: false,
      isShowRestoreMutationModal: false,
      isShowViewEmployeeModal: false,

      isResign: false,
      isMutation: false,
      isMutationButton: true,
      isActive: true,
      statusEmployee: "AKTIF",

      employeeUpdateFormData: {},

      employees: [],
      employeeKeyword: "",

      activePage: 1,
      page: 1,
      size: 10,
      total: 0,

      groups: [],
      selectedGroup: {},
      locations: [],
      selectedLocation: {},
      roleEmployees: [],
      selectedRoleEmployee: {},
      sections: [],
      allSections: [],
      selectedSection: {},
      grades: [],
      selectedGradeFilter: null,
      gradeByPosition: [],
      allGrades: [],
      selectedGrade: {},
      units: [],
      bpjsKetenagakerjaans: [],
      selectedUnit: {},
      selectedStatusPph: {},
      selectedBpjsKesehatan: {},
      selectedEmploymentStatus: {},
      selectedBpjsKetenagakerjaan: {},
      statusPphs: [],
      gender: [
        { name: "L", label: "Laki-Laki", value: "L" },
        { name: "P", label: "Perempuan", value: "P" },
      ],
      religions: [
        { name: "Islam", label: "Islam", value: "Islam" },
        {
          name: "Kristen Protestan",
          label: "Kristen Protestan",
          value: "Kristen Protestan",
        },
        {
          name: "Kristen Katolik",
          label: "Kristen Katolik",
          value: "Kristen Katolik",
        },
        { name: "Hindu", label: "Hindu", value: "Hindu" },
        { name: "Buddha", label: "Buddha", value: "Buddha" },
        { name: "Konghucu", label: "Konghucu", value: "Konghucu" },
      ],
      educations: [
        {
          name: "TIDAK SEKOLAH",
          label: "TIDAK SEKOLAH",
          value: "TIDAK SEKOLAH",
        },
        { name: "SD", label: "SD", value: "SD" },
        { name: "SMP", label: "SMP", value: "SMP" },
        { name: "SMA", label: "SMA", value: "SMA" },
        { name: "SMK", label: "SMK", value: "SMK" },
        { name: "STM", label: "STM", value: "STM" },
        { name: "D1", label: "D1", value: "D1" },
        { name: "D2", label: "D2", value: "D2" },
        { name: "D3", label: "D3", value: "D3" },
        { name: "D4", label: "D4", value: "D4" },
        { name: "S1", label: "S1", value: "S1" },
        { name: "S2", label: "S2", value: "S2" },
        { name: "S3", label: "S3", value: "S3" },
      ],
      maritals: [
        { name: "TIDAK KAWIN", label: "TIDAK KAWIN", value: "TIDAK KAWIN" },
        { name: "KAWIN", label: "KAWIN", value: "KAWIN" },
        { name: "JANDA", label: "JANDA", value: "JANDA" },
        { name: "DUDA", label: "DUDA", value: "DUDA" },
        { name: "LAINNYA", label: "LAINNYA", value: "LAINNYA" },
      ],
      employmentClasses: [],
      allEmployementClasses: [],
      employementClassesByGrade: [],
      employmentStatusOptions: [
        { name: "TETAP", label: "TETAP", value: "TETAP" },
        { name: "PKWT", label: "PKWT", value: "PKWT" },
      ],
      statusEmployeeOptions: [
        { name: "AKTIF", label: "AKTIF", value: "AKTIF" },
        { name: "TIDAK AKTIF", label: "TIDAK AKTIF", value: "TIDAK AKTIF" },
      ],
      statusEmployeeRemarks: [
        { name: "MANGKIR", label: "MANGKIR", value: "MANGKIR" },
        {
          name: "HABIS KONTRAK",
          label: "HABIS KONTRAK",
          value: "HABIS KONTRAK",
        },
        { name: "PENSIUN", label: "PENSIUN", value: "PENSIUN" },
        { name: "RESIGN", label: "RESIGN", value: "RESIGN" },
      ],
      workerUnions: [
        { name: "YA", label: "YA", value: true },
        { name: "TIDAK", label: "TIDAK", value: false },
      ],
      workDays: [
        { name: "5 hari", label: "5 hari", value: 5 },
        { name: "6 hari", label: "6 hari", value: 6 },
      ],
      bpjsKesehatan: [
        { name: "YA", label: "YA", value: "YA" },
        { name: "TIDAK", label: "TIDAK", value: "TIDAK" },
      ],

      bpjsKetenagakerjaan: [
        { name: "G", label: "G", value: "G" },
        { name: "T", label: "T", value: "T" },
        { name: "K", label: "K", value: "K" },
        { name: "TIDAK", label: "TIDAK", value: "TIDAK" },
      ],
      validationCreateForm: {},
      stateValidationCreateForm: false,
      isAutoCompleteLoading: false,

      userUnitId: localStorage.getItem("unitId"),
      userAccessRole: localStorage.getItem("accessRole"),
      otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),
      nikUnits: [],
      sectionByUnit: [],
      allGroups: [],
      groupBySection: [],
    };
  }

  componentDidMount() {
    this.setEmployee();
    this.getAllGroups();
    this.getAllLocations();
    this.getAllRoleEmployees();
    this.getAllSections();
    this.getAllUnits();
    this.getAllGrades();
    this.getAllEmploymentClasses();
    this.getAllStatusPPh();
    this.getAllBPJSTK();
    // this.getAllEducations();
    // this.setState({ loading: false });
  }

  //#region  Upload Action
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

    const url = `${CONST.URI_ATTENDANCE}employees/upload`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .post(url, data, { headers: headers, responseType: "blob" })
      .then((response) => {
        if (response.status === 200) {
          let filename = response.headers["content-disposition"]
            .split(";")[1]
            .replace("filename=", "")
            .replace(/"/, "")
            .replace(/"/, "");
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();

          swal({
            icon: "error",
            title: "Cek data di file excel yang di upload",
            text: "Harap cek file Log Error",
          });
        }
        else {
          var result = response.data;

          let message = `Import file selesai`;
          swal({
            icon: "success",
            title: "Good...",
            text: message,
          });
        }
        this.setState({ uploadFileLoading: false, activePage: 1, page: 1 });
        this.showUploadModal(false);
        this.setEmployee();
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status == 400) {
            var messages = "Cek data di file excel yang di upload";
            swal("Terjadi kesalahan", messages, "error").then((value) => {
              this.setState({ uploadFileLoading: false, activePage: 1, page: 1 });
              this.showUploadModal(false);
              this.setEmployee();
            });
          }
          else {
            var messages = "Terjadi kesalahan, silakan coba lagi";
            swal("Maaf", messages, "error").then(
              (value) => {
                this.setState({ uploadFileLoading: false, activePage: 1, page: 1 });
                this.showUploadModal(false);
                this.setEmployee();
              }
            );
          }
        } else {
          swal("Maaf", "Terjadi kesalahan, silakan coba lagi", "error").then(
            (value) => {
              this.setState({ uploadFileLoading: false, activePage: 1, page: 1 });
              this.showUploadModal(false);
              this.setEmployee();
            }
          );
        }
      });
  };

  showUploadModal = (value) => {
    this.setState({ isShowUploadModal: value });
  };
  //#endregion

  handleClick = (event) => {
    event.preventDefault();

    switch (event.target.name) {
      case "upload":
        this.showUploadModal(true);
        break;
      default:
        break;
    }
  };

  download = () => {
    // const params = {
    //   unitId: this.state.selectedUnitFilter?.Id,
    //   sectionId: this.state.selectedSectionFilter?.Id,
    //   groupId: this.state.selectedGroupFilter?.Id,
    //   employeeId: this.state.selectedEmployeeFilter?.Id
    // };

    const params = {
      employeeId: this.state.selectedEmployeeFilter?.Id || 0,
      unitId: this.state.selectedUnitFilter?.Id || 0,
      sectionId: this.state.selectedSectionFilter?.Id || 0,
      groupId: this.state.selectedGroupFilter?.Id || 0,
      employeeStatus: this.state.selectedStatusEmployeeFilter?.value || "",
      roleEmployeeId: this.state.selectedRoleEmployeeFilter?.value || 0,
      employmentClass: this.state.selectedEmploymentClassFilter?.value || "",
      employmentStatus: this.state.selectedEmploymentStatusFilter?.value || "",
      workday: this.state.selectedWorkDayFilter?.value || 0,
      isWorkerUnion: this.state.selectedWorkerUnionFilter?.value || false,
      bpjsTKId: this.state.selectedBpjsKetenagakerjaan?.Id || 0,
      adminEmployeeId: Number(localStorage.getItem("employeeId")),
    };

    this.setState({ downloadLoading: true }, () => {
      return this.service
        .download(params, this.state.page)
        .then(() => { })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.setState({ downloadLoading: false });
        });
    });
  };

  downloadEmployeeRecap = () => {
    const params = {
      employeeId: this.state.selectedEmployeeFilter?.Id || 0,
      unitId: this.state.selectedUnitFilter?.Id || 0,
      sectionId: this.state.selectedSectionFilter?.Id || 0,
      groupId: this.state.selectedGroupFilter?.Id || 0,
      employmentClass: this.state.selectedEmploymentClassFilter?.value || "",
      adminEmployeeId: Number(localStorage.getItem("employeeId")),
    };

    this.setState({ downloadLoadingRecap: true }, () => {
      return this.service
        .getPdfEmployeeRecap(params, this.state.page)
        .then(() => { })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.setState({ downloadLoadingRecap: false });
        });
    });
  };

  setLoading = (value) => {
    this.setState({ loading: value });
  };

  setLoadingData = (value) => {
    this.setState({ loadingData: value });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber, page: pageNumber }, () => {
      this.setEmployee();
    });
  };

  handleKeywordChange = (event) => {
    this.setState(
      { employeeKeyword: event.target.value, page: 1, activePage: 1 },
      () => {
        this.setEmployee();
      }
    );
  };

  //#region Create Employee Modal
  showCreateEmployeeModal = (value) => {
    if (!value)
      this.setState({ selectedEmployee: {}, validationCreateForm: {} });

    this.setState({ isShowCreateEmployeeModal: value });
  };

  handleCreateEmployeeClick = () => {
    this.setState(
      {
        selectedEmployee: {
          NPWPNo: "000000000000000",
        },
        selectedGroup: {},
        selectedLocation: {},
        selectedRoleEmployee: {},
        selectedSection: {},
        selectedUnit: {},
        selectedEmploymentClass: {},
        selectedGrade: {},
        selectedGender: {},
        selectedReligion: {},
        selectedEducation: {},
        selectedBpjsKesehatan: {},
        selectedEmploymentStatus: {},
        selectedBpjsKetenagakerjaan: {},
        selectedStatusPph: {},
        selectedWorkDays: {},
        selectedStatusEmployee: {},
        validationCreateForm: {},
        selectedMarital: {},
        sectionByUnit: [],
        groupBySection: [],
        gradeByPosition: [],
        employementClassesByGrade: []
      },
      () => {
        this.showCreateEmployeeModal(true);
      }
    );
  };

  createEmployeeClickHandler = () => {
    // console.log(this.state.selectedEmployee);
    this.createEmployee();
  };
  //#endregion

  //#region Edit Employee Modal
  showEditEmployeeModal = (value) => {
    if (!value)
      this.setState({
        selectedEmployee: {},
        validationCreateForm: {},
        isMutationButton: true,
      });

    this.setState({ isShowEditEmployeeModal: value });
  };

  handleEditEmployeeClick = (employee) => {
    this.setState({ selectedEmployee: employee }, () => {
      this.getEmployeeById(employee.Id, "EDIT");
    });
  };

  updateEmployeeClickHandler = () => {
    if (this.state.isActive) {
      this.updateEmployee();
    } else if (this.state.isResign) {
      this.resignEmployee();
    } else if (this.state.isMutation) {
      this.mutationEmployee();
    } else {
      this.updateEmployee();
    }
  };

  buildEmployeeFormData = (property, value) => {
    const { employeeUpdateFormData } = this.state;

    employeeUpdateFormData[property] = value;
    this.setState({ employeeUpdateFormData: employeeUpdateFormData });
  };

  //#endregion

  //#region Delete Employee Modal
  handleDeleteEmployeeClick = (employee) => {
    this.setState({ selectedEmployee: employee }, () => {
      this.showDeleteEmployeeModal(true);
    });
  };

  showDeleteEmployeeModal = (value) => {
    if (!value) this.setState({ selectedEmployee: {} });

    this.setState({ isShowDeleteEmployeeModal: value });
  };

  //#region Delete Employee Modal
  handleCancelMutationClick = (employee) => {
    this.setState({ selectedEmployee: employee }, () => {
      this.showRestoreMutationModal(true);
    });
  };

  showRestoreMutationModal = (value) => {
    if (!value) this.setState({ selectedEmployee: {} });

    this.setState({ isShowRestoreMutationModal: value });
  };

  deleteEmployeeClickHandler = () => {
    this.setState({ deleteEmployeeLoading: true });

    const url = `${CONST.URI_ATTENDANCE}employees/${this.state.selectedEmployee.Id}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    const headerFaceId = {
      "Content-Type": "application/json",
      // 'Access-Control-Allow-Origin':'*',
      // 'Access-Control-Allow-Methods':'OPTIONS,DELETE',
      // 'Access-Control-Allow-Headers':'Content-Type'
    };
    const requestDeleteFaceId = {
      nik: this.state.selectedEmployee.EmployeeIdentity,
    };

    Promise.all([
      axios.delete(url, { headers: headers }),
      axios.delete(
        CONST.urlUser + "/" + this.state.selectedEmployee.EmployeeIdentity,
        { headers: headers }
      ),
      // axios.delete(CONST.urlFaceId,
      //   {
      //     // mode: 'no-cors',
      //     // credentials: 'same-origin',
      //     headers: headerFaceId,
      //     crossdomain: true,
      //     data: JSON.stringify({nik: this.state.selectedEmployee.EmployeeIdentity})
      //   })
      /// {FACEIDDelete} Begin
      // axios({
      //   method: 'DELETE',
      //   url: CONST.urlFaceId,
      //   headers: headerFaceId,
      //   data: requestDeleteFaceId
      // })
      /// {FACEIDDelete} End
    ])
      .then((values) => {
        console.log(values);
        // //delete face id using jquery
        // $.ajax({
        //   url : CONST.urlFaceId,
        //   xhrFields: {
        //     withCredentials: true
        //  },
        //   method : 'DELETE',
        //   contentType:'text/plain',
        //   data : JSON.stringify(requestDeleteFaceId),
        //   crossDomain: true,
        //   async : true,
        //   type:'DELETE',
        //   headers:headerFaceId,
        //   dataType:'text'
        // }).done(function(result){
        //   console.log(result);
        // });
        // var url = CONST.urlFaceId;
        // var xhr = new XMLHttpRequest();
        // xhr.open("DELETE", url, true);
        // xhr.setRequestHeader('Content-type','text/plain; charset=utf-8');
        // xhr.setRequestHeader('Accepts','text/plain;');
        // xhr.setRequestHeader('Access-Control-Allow-Headers','Content-Type');
        // xhr.setRequestHeader('Access-Control-Allow-Origin','*');
        // xhr.setRequestHeader('Access-Control-Allow-Methods','OPTIONS,POST,GET,DELETE,PUT');

        // xhr.onload = function () {
        //   var users = JSON.parse(xhr.responseText);
        //   if (xhr.readyState == 4 && xhr.status == "200") {
        //     console.table(users);
        //   } else {
        //     console.error(users);
        //   }
        // }

        // xhr.send(JSON.stringify(requestDeleteFaceId));

        alert("Data Berhasil dihapus");
        this.setState({ deleteEmployeeLoading: false });
      })
      .catch((err) => {
        if (err.response.status == 400) {
          swal({
            icon: "error",
            title: "Oops...",
            text: "Terjadi kesalahan!",
          });
        } else {
          swal({
            icon: "error",
            title: "Oops...",
            text: "Terjadi kesalahan!",
          });
        }
        console.log(err.response);
        this.setState({ deleteEmployeeLoading: false });
      })
      .then(() => {
        this.showDeleteEmployeeModal(false);
        this.setEmployee();
      });
  };

  restoreMutationClickHandler = () => {
    console.log(
      "this.state.selectedEmployee.",
      this.state.selectedEmployee.EmployeeIdentity
    );
    this.setState({ restoreMutationLoading: true });

    const url = `${CONST.URI_ATTENDANCE}employees/restore-mutation/${this.state.selectedEmployee.Id}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    return axios
      .delete(url, { headers: headers })
      .then((result) => {
        console.log("result", result);
        this.updateEmployeeIdentity(
          result.data,
          this.state.selectedEmployee.EmployeeIdentity,
          () => {
            swal({
              icon: "success",
              title: "Good...",
              text: "Data berhasil direstore!",
            });

            this.setState({ restoreMutationLoading: false }, () => {
              this.showRestoreMutationModal(false);
              this.setEmployee();
            });
          }
        );
      })
      .catch((err) => {
        this.showRestoreMutationModal(false);
        this.setEmployee();

        const error = err.response.data.error;
        throw error;
      });
  };

  //#endregion

  //#region View Employee Modal
  handleViewEmployeeClick = (employee) => {
    this.setState({ selectedEmployee: employee }, () => {
      this.getEmployeeById(employee.Id, "VIEW");
      this.getEmployeeMutationLogs(employee.CitizenshipIdentity);
    });
  };

  showViewEmployeeModal = (value) => {
    if (!value) this.setState({ selectedEmployee: {} });

    this.setState({ isShowViewEmployeeModal: value });
  };
  //#endregion

  //#region Service Helper
  setEmployee = () => {
    this.setLoadingData(true);

    let employeeId = this.state.selectedEmployeeFilter?.Id || 0;
    let unitId = this.state.selectedUnitFilter?.Id || 0;
    let sectionId = this.state.selectedSectionFilter?.Id || 0;
    let groupId = this.state.selectedGroupFilter?.Id || 0;
    let employeeStatus = this.state.selectedStatusEmployeeFilter?.value || "";
    let roleEmployeeId = this.state.selectedRoleEmployeeFilter?.value || 0;
    let grade = this.state.selectedGradeFilter?.label || 0;
    let employmentClass = this.state.selectedEmploymentClassFilter?.label || "";
    let employmentStatus =
      this.state.selectedEmploymentStatusFilter?.value || "";
    let workday = this.state.selectedWorkDayFilter?.value || 0;
    let isWorkerUnion = this.state.selectedWorkerUnionFilter?.value || false;
    let bpjsTKId = this.state.selectedBpjsKetenagakerjaan?.Id || 0;
    let adminEmployeeId = Number(localStorage.getItem("employeeId"));

    const url = `${CONST.URI_ATTENDANCE}employees/filterized?EmployeeId=${employeeId}&UnitId=${unitId}&SectionId=${sectionId}&GroupId=${groupId}&EmployeeStatus=${employeeStatus}&RoleEmployeeId=${roleEmployeeId}&grade=${grade}&EmploymentClass=${employmentClass}&EmploymentStatus${employmentStatus}&WorkDays=${workday}&IsWorkerUnion=${isWorkerUnion}&page=${this.state.page}&adminEmployeeId=${adminEmployeeId}`;

    axios({
      method: "GET",
      url: url,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        let employees = [];
        result.data.data.map((datum) => {
          employees.push(datum);
        });
        this.setState({
          employees: employees,
          page: result.data.page,
          size: result.data.size,
          total: result.data.total,
        });
        this.setLoadingData(false);
      })
      .catch(() => {
        this.setLoadingData(false);
      });
  };

  getEmployeeById = (id, state) => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}employees/${id}`;
    const trainingUrl = `${CONST.URI_ATTENDANCE}employee-trainings/by-employee-id/${id}`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        return axios
          .get(trainingUrl, { headers: headers })
          .then((trainingresponse) => {
            // console.log(data);
            // console.log(trainingresponse.data);
            let trainings = trainingresponse.data;

            var selectedEmployee = data.data;
            selectedEmployee.JoinDate = moment(
              selectedEmployee.JoinDate
            ).format("YYYY-MM-DD");
            selectedEmployee.DoB = moment(selectedEmployee.DoB).format(
              "YYYY-MM-DD"
            );
            selectedEmployee.DateOfBirth = moment(selectedEmployee.DoB).format(
              "YYYY-MM-DD"
            );
            selectedEmployee.DateResign = selectedEmployee.DateResign
              ? moment(selectedEmployee.DateResign).format("YYYY-MM-DD")
              : null;
            selectedEmployee.DateMutation = selectedEmployee.DateMutation
              ? moment(selectedEmployee.DateMutation).format("YYYY-MM-DD")
              : null;
            selectedEmployee.RetirementDate = selectedEmployee.RetirementDate
              ? moment(selectedEmployee.RetirementDate).format("YYYY-MM-DD")
              : null;
            selectedEmployee.BeginContractDate =
              selectedEmployee.BeginContractDate
                ? moment(selectedEmployee.BeginContractDate).format(
                  "YYYY-MM-DD"
                )
                : null;
            selectedEmployee.EndContractDate = selectedEmployee.EndContractDate
              ? moment(selectedEmployee.EndContractDate).format("YYYY-MM-DD")
              : null;
            selectedEmployee.BeginContractExtensionDate =
              selectedEmployee.BeginContractExtensionDate
                ? moment(selectedEmployee.BeginContractExtensionDate).format(
                  "YYYY-MM-DD"
                )
                : null;
            selectedEmployee.EndContractExtensionDate =
              selectedEmployee.EndContractExtensionDate
                ? moment(selectedEmployee.EndContractExtensionDate).format(
                  "YYYY-MM-DD"
                )
                : null;
            selectedEmployee.TrainingEndDate = selectedEmployee.TrainingEndDate
              ? moment(selectedEmployee.TrainingEndDate).format("YYYY-MM-DD")
              : null;
            selectedEmployee.PreviouseId = id;
            selectedEmployee.PreviouseEmployeeIdentity =
              selectedEmployee.EmployeeIdentity;
            selectedEmployee.EmployeeStatus = selectedEmployee.StatusEmployee;
            selectedEmployee.StatusPph = selectedEmployee.StatusPphId;
            selectedEmployee.NPWPNo = selectedEmployee.NPWPNo
              ? selectedEmployee.NPWPNo
              : "000000000000000";

            // console.log(selectedEmployee);
            if (selectedEmployee.EmployeeStatus === "AKTIF") {
              this.setState({
                isActive: true,
                isResign: false,
                isMutation: false,
              });
            } else if (selectedEmployee.EmployeeStatus === "MUTATED") {
              this.setState({
                isActive: false,
                isResign: false,
                isMutation: true,
              });
            } else if (selectedEmployee.EmployeeStatus === "RESIGN") {
              this.setState({
                isActive: false,
                isResign: true,
                isMutation: false,
              });
            } else {
              this.setState({
                isActive: true,
                isResign: false,
                isMutation: false,
              });
            }

            //console.log(this.state);
            var selectedGroup = this.state.allGroups.find(
              (f) => f.Id === selectedEmployee.GroupId
            );
            var selectedLocation = this.state.locations.find(
              (f) => f.Id === selectedEmployee.LocationId
            );
            var selectedRoleEmployee = this.state.roleEmployees.find(
              (f) => f.Id === selectedEmployee.RoleEmployeeId
            );
            var selectedSection = this.state.allSections.find(
              (f) => f.Id === selectedEmployee.SectionId
            );
            var selectedUnit = this.state.units.find(
              (f) => f.Id === selectedEmployee.UnitId
            );
            var selectedGender = this.state.gender.find(
              (f) => f.value === selectedEmployee.Gender
            );
            var selectedStatusEmployee = this.state.statusEmployeeOptions.find(
              (f) =>
                f.value.toUpperCase() ===
                selectedEmployee.EmployeeStatus?.toUpperCase()
            );
            var selectedReligion = this.state.religions.find(
              (f) =>
                f.value.toUpperCase() ===
                selectedEmployee.Religion?.toUpperCase()
            );
            var selectedEducation = this.state.educations.find(
              (f) => f.value === selectedEmployee.Education
            );
            var selectedMarital = this.state.maritals.find(
              (f) =>
                f.value.toUpperCase() ===
                selectedEmployee.MaritalStatus?.toUpperCase()
            );

            var selectedGrade = this.state.allGrades.find(
              (f) => f.label === selectedEmployee.EmployeeGrade
            );

            var selectedEmploymentClass = this.state.allEmployementClasses.find(
              (f) => f.label === selectedEmployee.EmploymentClass
            );

            var selectedEmploymentStatus =
              this.state.employmentStatusOptions.find(
                (f) => f.value === selectedEmployee.EmploymentStatus
              );
            var selectedRemark = this.state.statusEmployeeRemarks.find(
              (f) => f.value === selectedEmployee.EmployeeStatusRemark
            );
            var selectedWorkDays = this.state.workDays.find(
              (f) => f.value === selectedEmployee.WorkDays
            );
            var selectedWorkerUnion = this.state.workerUnions.find(
              (f) => f.value === selectedEmployee.IsWorkerUnion
            );
            var selectedStatusPph = this.state.statusPphs.find(
              (f) => f.value === selectedEmployee.StatusPphId
            );
            var selectedBpjsKesehatan = this.state.bpjsKesehatan.find(
              (f) =>
                f.value === (selectedEmployee.BpjsKesehatan ? "YA" : "TIDAK")
            );
            var selectedBpjsKetenagakerjaan =
              this.state.bpjsKetenagakerjaans.find(
                (f) =>
                  f.label.toUpperCase() ===
                  selectedEmployee.BpjsKetenagakerjaan?.toUpperCase()
              );

            if (
              !selectedEmployee.BpjsKetenagakerjaanId ||
              selectedEmployee.BpjsKetenagakerjaanId === 0
            ) {
              if (selectedBpjsKetenagakerjaan) {
                selectedEmployee.BpjsKetenagakerjaanId =
                  selectedBpjsKetenagakerjaan.value;
              }
            }

            this.setState(
              {
                loading: false,
                activePage: 1,
                page: 1,
                employeeKeyword: "",
                selectedEmployee: selectedEmployee,
                selectedGroup: selectedGroup,
                selectedLocation: selectedLocation,
                selectedRoleEmployee: selectedRoleEmployee,
                selectedSection: selectedSection,
                selectedUnit: selectedUnit,
                selectedGender: selectedGender,
                selectedStatusEmployee: selectedStatusEmployee,
                selectedReligion: selectedReligion,
                selectedEducation: selectedEducation,
                selectedMarital: selectedMarital,
                selectedGrade: selectedGrade,
                selectedEmploymentClass: selectedEmploymentClass,
                selectedEmploymentStatus: selectedEmploymentStatus,
                selectedRemark: selectedRemark,
                selectedWorkDays: selectedWorkDays,
                selectedWorkerUnion: selectedWorkerUnion,
                selectedStatusPph: selectedStatusPph,
                selectedBpjsKesehatan: selectedBpjsKesehatan,
                selectedBpjsKetenagakerjaan: selectedBpjsKetenagakerjaan,
                trainings: trainings,
              },
              () => {
                this.getAllSectionsByUnit(this.state.selectedEmployee.UnitId);
                this.getAllGroupsBySection(this.state.selectedEmployee.SectionId);
                if (state === "VIEW") this.showViewEmployeeModal(true);
                else if (state === "EDIT") this.showEditEmployeeModal(true);
              }
            );
          });
      })
      .catch((err) => {
        console.log(err);
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ loading: false });
      });
  };

  getEmployeeMutationLogs = (citizenshipIdentity) => {
    this.service
      .getMutationLog(citizenshipIdentity)
      .then((res) => {
        if (res) this.setState({ mutationLogs: [res] });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  getAllGroups = () => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}groups?size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        var groups = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.Name;
          return datum;
        });
        this.setState({ allGroups: groups }, () => {
          this.setState({ loading: false });
        });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ loading: false });
      });
  };

  getAllGroupsBySection = (sectionId) => {
    const url = `${CONST.URI_ATTENDANCE}groups/by-section?sectionId=${sectionId}&size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        var groups = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.Name;
          return datum;
        });
        this.setState({ groups: groups, selectedGroupFilter: null }, () => { });
        //console.log(this.state.groups);
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
      });
  };

  getAllGradesByRoleEmployees = (positionId) => {
    let unitId = this.state.selectedUnitFilter?.value || 0;

    const url = `${CONST.URI_ATTENDANCE}employee-class/filterized?unitId=${unitId}&positionId=${positionId}&size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        var grades = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.Grade;
          return datum;
        });
        this.setState({ grades: grades, employmentClasses: [], selectedGradeFilter: null, selectedEmploymentClassFilter: null }, () => { });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
      });
  }

  getAllEmployeeClassByGrade = (positionId, grade) => {

    let unitId = this.state.selectedUnitFilter?.value || 0;

    const url = `${CONST.URI_ATTENDANCE}employee-class/filterized?unitId=${unitId}&positionId=${positionId}&grade=${grade}&size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        var employmentClasses = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.NameClass;
          return datum;
        });
        this.setState({ employmentClasses: employmentClasses, selectedEmploymentClassFilter: null }, () => { });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
      });
  }

  getAllLocations = () => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}locations?size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });

        var locations = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.Name;
          return datum;
        });

        this.setState({ locations: locations }, () => {
          this.setState({ loading: false });
        });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ loading: false });
      });
  };

  getAllRoleEmployees = () => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}positions?size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });
        var roleEmployees = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.Name;
          return datum;
        });

        this.setState({ roleEmployees: roleEmployees }, () => {
          this.setState({ loading: false });
        });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ loading: false });
      });
  };

  updateEmployee = () => {
    this.setState({ updateEmployeeLoading: true });

    // const url = `${CONST.URI_ATTENDANCE}employees/${this.state.selectedEmployee.Id}`;
    const url = `${CONST.URI_ATTENDANCE}employees/update`;
    let selectedEmployee = this.state.selectedEmployee;
    let payload = {
      Id: selectedEmployee["Id"],
      EmployeeIdentity: selectedEmployee["EmployeeIdentity"],
      Firstname: selectedEmployee["Firstname"],
      Lastname: selectedEmployee["Lastname"],
      CitizenshipIdentity: selectedEmployee["CitizenshipIdentity"],
      Gender: selectedEmployee["Gender"],
      BloodType: selectedEmployee["BloodType"],
      Religion: selectedEmployee["Religion"],
      PlaceOfBirth: selectedEmployee["PlaceOfBirth"],
      DateOfBirth: selectedEmployee["DateOfBirth"],
      Address: selectedEmployee["Address"],
      City: selectedEmployee["City"],
      PhoneNumber: selectedEmployee["PhoneNumber"],
      Education: selectedEmployee["Education"],
      Specialization: selectedEmployee["Education"],
      School: selectedEmployee["School"],
      MaritalStatus: selectedEmployee["MaritalStatus"],
      Trustee: selectedEmployee["Trustee"],
      FamilyMember: selectedEmployee["FamilyMember"],
      ChildNumber: selectedEmployee["ChildNumber"],
      UnitId: selectedEmployee["UnitId"],
      SectionId: selectedEmployee["SectionId"],
      GroupId: selectedEmployee["GroupId"],
      RoleEmployeeId: selectedEmployee["RoleEmployeeId"],
      EmployeeClassId: selectedEmployee["EmployeeClassId"],
      EmployeeGrade: selectedEmployee["EmployeeGrade"],
      EmploymentClass: selectedEmployee["EmploymentClass"],
      EmploymentStatus: selectedEmployee["EmploymentStatus"],
      ContractNumber: selectedEmployee["ContractNumber"],
      BeginContractDate:
        moment(selectedEmployee["BeginContractDate"]).year() !== 1
          ? moment(selectedEmployee["BeginContractDate"])
          : null,
      EndContractDate:
        moment(selectedEmployee["EndContractDate"]).year() !== 1
          ? moment(selectedEmployee["EndContractDate"])
          : null,
      BeginContractExtensionDate:
        moment(selectedEmployee["BeginContractExtensionDate"]).year() !== 1
          ? moment(selectedEmployee["BeginContractExtensionDate"])
          : null,
      EndContractExtensionDate:
        moment(selectedEmployee["EndContractExtensionDate"]).year() !== 1
          ? moment(selectedEmployee["EndContractExtensionDate"])
          : null,
      TrainingEndDate:
        moment(selectedEmployee["TrainingEndDate"]).year() !== 1
          ? moment(selectedEmployee["TrainingEndDate"])
          : null,
      LocationId: selectedEmployee["LocationId"],
      EmployeeStatus: selectedEmployee["EmployeeStatus"],
      EmployeeStatusRemark: selectedEmployee["EmployeeStatusRemark"],
      JPKNo: selectedEmployee["JPKNo"],
      JoinDate:
        moment(selectedEmployee["JoinDate"]).year() !== 1
          ? moment(selectedEmployee["JoinDate"])
          : null,
      RetirementDate:
        moment(selectedEmployee["RetirementDate"]).year() !== 1
          ? moment(selectedEmployee["RetirementDate"])
          : null,
      WorkDays: selectedEmployee["WorkDays"],
      BaseSalary: selectedEmployee["BaseSalary"],
      GrossIncome: selectedEmployee["GrossIncome"],
      IsWorkerUnion: selectedEmployee["IsWorkerUnion"],
      MealAllowance: selectedEmployee["MealAllowance"],
      LeaderAllowance: selectedEmployee["LeaderAllowance"],
      AchievementBonus: selectedEmployee["AchievementBonus"],
      BpjsKesehatan: selectedEmployee["BpjsKesehatan"],
      BpjsKetenagakerjaan: selectedEmployee["BpjsKetenagakerjaan"],
      BpjsKetenagakerjaanId: selectedEmployee["BpjsKetenagakerjaanId"],
      StatusPph: selectedEmployee["StatusPph"],
      SocialMedia: selectedEmployee["SocialMedia"],
      AssignmentDate: selectedEmployee["AssignmentDate"],
      BpjsKesehatanPercentage: selectedEmployee["BpjsKesehatanPercentage"],
      AccountNo: selectedEmployee["AccountNo"],
      NPWPNo: selectedEmployee["NPWPNo"],
      CanAccessQRCode: selectedEmployee["CanAccessQRCode"],
      CanAccessResetPassword: selectedEmployee["CanAccessResetPassword"],
      IsCanApproveRequestLeave: selectedEmployee["IsCanApproveRequestLeave"],
      IsCanApproveRequestWfh: selectedEmployee["IsCanApproveRequestWfh"],
    };

    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };

    axios
      .post(url, payload, { headers: headers })
      .then(() => {
        swal("Data berhasil disimpan!");
        this.setState(
          {
            updateEmployeeLoading: false,
            selectedEmployee: {},
            page: 1,
            activePage: 1,
          },
          () => {
            this.showEditEmployeeModal(false);
            this.setEmployee();
          }
        );
      })
      .catch((err) => {
        console.log(err);
        if (err.response) {
          this.setState({ validationCreateForm: err.response.data.error });
        }
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        // alert("Terjadi kesalahan!");
        this.setState({ updateEmployeeLoading: false });
      });
  };

  createEmployee = () => {
    this.setState({ createEmployeeLoading: true });

    const url = `${CONST.URI_ATTENDANCE}employees`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .post(url, this.state.selectedEmployee, { headers: headers })
      .then(() => {
        swal("Data berhasil disimpan!");
        this.setState(
          {
            createEmployeeLoading: false,
            selectedEmployee: {},
            page: 1,
            activePage: 1,
          },
          () => {
            this.showCreateEmployeeModal(false);
            this.setEmployee();
          }
        );
      })
      .catch((err) => {
        console.log(err);
        if (err.response) {
          this.setState({ validationCreateForm: err.response.data.error });
          console.log("err.response :", err.response);
          console.log(
            "validationCreateForm : ",
            this.state.validationCreateForm
          );
        }
        // if(err.r)

        let message = "Cek Form Isian, Isian Mandatory tidak boleh kosong\n";

        const error = err.response.data.error;
        // console.log(Object.keys(error).forEach(e => console.log(`key=${e}  value=${error[e]}`)));
        Object.keys(error).forEach((e) => {
          if (e) {
            message += `- ${error[e]}\n`;
          }
        });
        // if (error.CitizenshipIdentity)
        //   message += `- ${error.CitizenshipIdentity}\n`;

        // if (error.Firstname)
        //   message += `- ${error.Firstname}\n`;

        // if (error.DateOfBirth)
        //   message += `- ${error.DateOfBirth}\n`;

        // if (error.EmployeeIdentity)
        //   message += `- ${error.EmployeeIdentity}\n`;

        // if (error.RoleEmployeeId)
        //   message += `- ${error.RoleEmployeeId}\n`;

        // if (error.UnitId)
        //   message += `- ${error.UnitId}\n`;

        // if (error.GroupId)
        //   message += `- ${error.GroupId}\n`;

        // if (error.DateMutation)
        //   message += `- ${error.DateMutation}\n`;

        swal({
          icon: "error",
          title: "Data Invalid",
          text: message,
        });

        // swal("Data Invalid", "Cek Form Isian, Isian Mandatory tidak boleh kosong", "error");
        this.setState({ createEmployeeLoading: false });
      });
  };

  mutationEmployee = () => {
    this.setState({ updateEmployeeLoading: true });
    const nik = this.state.selectedEmployee.EmployeeIdentity;
    const url = `${CONST.URI_ATTENDANCE}employees/mutation`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .post(url, this.state.selectedEmployee, { headers: headers })
      .then(() => {
        this.updateEmployeeIdentity(
          this.state.employees[0].EmployeeIdentity,
          nik,
          () => {
            swal({
              icon: "success",
              title: "Good...",
              text: "Data berhasil disimpan!",
            });

            this.setState(
              {
                selectedEmployee: {},
                page: 1,
                activePage: 1,
                isMutationButton: true,
                updateEmployeeLoading: false,
              },
              () => {
                this.showEditEmployeeModal(false);
                this.setEmployee();
              }
            );
          }
        );
      })
      .catch((e) => {
        const error = e.response.data.error;
        console.log("error", e);
        console.log("error", error);

        let message = "";

        if (error.CitizenshipIdentity)
          message += `- ${error.CitizenshipIdentity}\n`;

        if (error.Firstname) message += `- ${error.Firstname}\n`;

        if (error.DateOfBirth) message += `- ${error.DateOfBirth}\n`;

        if (error.EmployeeIdentity) message += `- ${error.EmployeeIdentity}\n`;

        if (error.RoleEmployeeId) message += `- ${error.RoleEmployeeId}\n`;

        if (error.UnitId) message += `- ${error.UnitId}\n`;

        if (error.GroupId) message += `- ${error.GroupId}\n`;

        if (error.DateMutation) message += `- ${error.DateMutation}\n`;

        swal({
          icon: "error",
          title: "Oops...",
          text: message,
        });
        this.setState({
          updateEmployeeLoading: false,
          isMutationButton: false,
        });
      });
  };

  updateEmployeeIdentity = (oldNik, newNik, onSuccess) => {
    this.service
      .updateNIK(oldNik, newNik)
      .then((res) => {
        onSuccess();
      })
      .catch((err) => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Gagal Mengubah NIK!",
        });
      });
  };

  resignEmployee = () => {
    this.setState({ updateEmployeeLoading: true });

    const url = `${CONST.URI_ATTENDANCE}employees/resign`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .post(url, this.state.selectedEmployee, { headers: headers })
      .then(() => {
        swal("Data berhasil disimpan!");
        this.setState(
          {
            updateEmployeeLoading: false,
            selectedEmployee: {},
            page: 1,
            activePage: 1,
          },
          () => {
            this.showEditEmployeeModal(false);
            this.setEmployee();
          }
        );
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ updateEmployeeLoading: false });
      });
  };

  getAllSections = () => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}sections?size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });

        var sections = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.Name;
          return datum;
        });

        this.setState({ allSections: sections }, () => {
          this.setState({ loading: false });
        });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ loading: false });
      });
  };

  getSectionByUnitId = (unitId) => {
    let res = this.state.allSections.filter(d => d.UnitId === unitId);
    this.setState({ sectionByUnit: res, sections: res })
  }

  getGroupBySectionId = (sectionId) => {
    let res = this.state.allGroups.filter(d => d.SectionId === sectionId && d.UnitId === this.state.selectedUnit.Id);
    this.setState({ groupBySection: res, groups: res })
  }

  getGradeByPositionId = (positionId) => {
    let res = this.state.allGrades.filter(d => d.UnitId === this.state.selectedUnit.Id && d.PositionId === positionId);
    this.setState({ gradeByPosition: res, grades: res })
  }

  getEmploymentClassesByGrade = (grade) => {
    let res = this.state.allEmployementClasses.filter(d => d.Grade === grade && d.UnitId === this.state.selectedUnit.Id && d.PositionId === this.state.selectedRoleEmployee.Id);
    this.setState({ employementClassesByGrade: res, employmentClasses: res })
  }

  getAllSectionsByUnit = (unitId) => {
    const url = `${CONST.URI_ATTENDANCE}sections/by-unit?unitId=${unitId}&size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });

        var sections = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.Name;
          return datum;
        });

        this.setState(
          {
            sections: sections,
            selectedSectionFilter: null,
            selectedGroupFilter: null,
            selectedRoleEmployeeFilter: null,
            selectedGradeFilter: null,
            selectedEmploymentClassFilter: null
            // grades: [],
            // employmentClasses: []
          },
          () => { }
        );
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
      });
  };

  getAllUnits = () => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}units?size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((result) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });

        var units = [];
        result.data.Data.map((s) => {
          s.value = s.Id;
          s.label = s.Name;

          if (
            this.state.userAccessRole == PERSONALIA_BAGIAN &&
            (this.state.otherUnitId.includes(s.Id))
          ) {
            units.push(s);
          } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
            units.push(s);
          }
        });

        this.setState({ units: units }, () => {
          this.setState({ loading: false });
        });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ loading: false });
      });
  };

  getAllGrades = () => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}employee-class?size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        var allGrades = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.Grade;
          return datum;
        });

        this.setState({ allGrades: allGrades }, () => {
          this.setState({ loading: false });
        });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ loading: false });
      });
  }

  getAllEmploymentClasses = () => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}employee-class?size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        var allEmployementClasses = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.NameClass;
          return datum;
        });

        this.setState({ allEmployementClasses: allEmployementClasses }, () => {
          this.setState({ loading: false });
        });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ loading: false });
      });
  }

  getAllBPJSTK = () => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}bpjs-tk?size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });

        var bpjs = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.Code;
          return datum;
        });

        this.setState({ bpjsKetenagakerjaans: bpjs }, () => {
          this.setState({ loading: false });
        });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ loading: false });
      });
  };

  getAllStatusPPh = () => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}status-pph?size=10000`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });

        var statusPphs = data.data.Data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.Status;
          return datum;
        });

        this.setState({ statusPphs: statusPphs }, () => {
          this.setState({ loading: false });
        });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ loading: false });
      });
  };

  getAllEducations = () => {
    this.setState({ loading: true });

    const url = `${CONST.URI_ATTENDANCE}education/educations`;
    const headers = {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ` + localStorage.getItem("token"),
      "x-timezone-offset": moment().utcOffset() / 60,
    };
    axios
      .get(url, { headers: headers })
      .then((data) => {
        // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
        //     this.showViewEmployeeModal(true);
        // });

        let educations = data.data.map((datum) => {
          datum.value = datum.Code;
          datum.label = datum.Code;
          return datum;
        });

        this.setState({ educations: educations }, () => {
          this.setState({ loading: false });
        });
      })
      .catch(() => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan!",
        });
        this.setState({ loading: false });
      });
  };

  handleUnitSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const url = `${CONST.URI_ATTENDANCE}units?keyword=${query}`;

    axios({
      method: "GET",
      url: url,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        let units = [];
        result.data.Data.map((datum) => {
          units.push(datum);
        });

        this.setState({ unitsLoader: units });
        this.setState({ isAutoCompleteLoading: false });
      })
      .catch(() => {
        this.setState({ isAutoCompleteLoading: false });
      });
  };

  handleSectionSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });
    let url = `${CONST.URI_ATTENDANCE}sections?keyword=${query}`;
    if (this.state.selectedUnitFilter) {
      let unitid = this.state.selectedUnitFilter.Id;
      url = `${CONST.URI_ATTENDANCE}sections/by-unit?keyword=${query}&unitId=${unitid}`;
    }

    axios({
      method: "GET",
      url: url,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        let items = [];
        result.data.Data.map((datum) => {
          items.push(datum);
        });

        this.setState({ sectionsLoader: items });
        this.setState({ isAutoCompleteLoading: false });
      })
      .catch(() => {
        this.setState({ isAutoCompleteLoading: false });
      });
  };

  handleGroupSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });
    let url = `${CONST.URI_ATTENDANCE}groups?keyword=${query}`;

    if (this.state.selectedSectionFilter) {
      url = `${CONST.URI_ATTENDANCE}groups/by-section?keyword=${query}&sectionId=${this.state.selectedSectionFilter.Id}`;
    }

    axios({
      method: "GET",
      url: url,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        let items = [];
        result.data.Data.map((datum) => {
          items.push(datum);
        });

        this.setState({ groupsLoader: items });
        this.setState({ isAutoCompleteLoading: false });
      })
      .catch(() => {
        this.setState({ isAutoCompleteLoading: false });
      });
  };

  handleEmployeeSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    // const url = `${CONST.URI_ATTENDANCE}employees?keyword=${query}`;
    let unitId =
      this.state.selectedUnitFilter != null
        ? this.state.selectedUnitFilter.Id
        : 0;
    let sectionId =
      this.state.selectedSectionFilter != null
        ? this.state.selectedSectionFilter.Id
        : 0;
    let groupId =
      this.state.selectedGroupFilter != null
        ? this.state.selectedGroupFilter.Id
        : 0;
    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${query}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&adminEmployeeId=${adminEmployeeId}`;

    if (unitId) {
      url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${query}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&adminEmployeeId=${adminEmployeeId}`;
    }

    axios({
      method: "GET",
      url: url,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ` + localStorage.getItem("token"),
        "x-timezone-offset": moment().utcOffset() / 60,
      },
    })
      .then((result) => {
        let items = result.data.data.map((datum) => {
          datum.NameAndEmployeeIdentity = `${datum.EmployeeIdentity} - ${datum.Name}`;
          return datum;
        });

        this.setState({ employeesLoader: items });
        this.setState({ isAutoCompleteLoading: false });
      })
      .catch(() => {
        this.setState({ isAutoCompleteLoading: false });
      });
  };

  //#endregion

  resetFilter = () => {
    this.setState({
      selectedUnitFilter: null,
      selectedGroupFilter: null,
      selectedSectionFilter: null,
      selectedEmployeeFilter: null,
      selectedStatusEmployeeFilter: null,
      selectedRoleEmployeeFilter: null,
      selectedGradeFilter: null,
      selectedEmploymentClassFilter: null,
      selectedEmploymentStatusFilter: null,
      selectedWorkDayFilter: null,
      selectedWorkerUnionFilter: null,
      grades: [],
      employmentClasses: []
    });
    this.typeaheadEmployee.clear();
  };

  search = () => {
    this.setState({ page: 1 }, () => {
      this.setEmployee();
    });
  };

  render() {
    const { employees } = this.state;
    const items = employees.map((employee) => {
      let cssResign = {
        backgroundColor: "rgba(248, 108, 107,0.2)",
      };
      return (
        <tr
          style={
            employee.StatusEmployee === "RESIGN" ||
              employee.StatusEmployee === "MUTATED"
              ? cssResign
              : null
          }
          key={employee.Id}
          data-category={employee.Id}
        >
          <td>{employee.EmployeeIdentity}</td>
          <td>{employee.Name}</td>
          <td>{employee.Unit}</td>
          <td>{employee.Section}</td>
          <td>{employee.Group}</td>
          <td>{employee.EmployeeClass}</td>
          <td>{employee.EmploymentStatus}</td>
          <td>{employee.LocationName}</td>
          <td>
            <Form>
              <FormGroup>
                <RowButtonComponent
                  className="btn btn-success"
                  name="lihat-employee"
                  onClick={this.handleViewEmployeeClick}
                  data={employee}
                  iconClassName="fa fa-eye"
                  label=""
                ></RowButtonComponent>
                {(() => {
                  if (employee.StatusEmployee === "RESIGN") {
                    return (
                      <RowButtonComponent
                        className="btn btn-primary"
                        name="ubah-employee"
                        onClick={this.handleEditEmployeeClick}
                        data={employee}
                        iconClassName="fa fa-pencil-square"
                        label=""
                      ></RowButtonComponent>
                    );
                  } else if (employee.StatusEmployee === "MUTATED") {
                    return (
                      <RowButtonComponent
                        className="btn btn-primary"
                        name="ubah-employee"
                        onClick={this.handleCancelMutationClick}
                        data={employee}
                        iconClassName="fa fa-history"
                        label=""
                      ></RowButtonComponent>
                    );
                  } else {
                    return (
                      <RowButtonComponent
                        className="btn btn-primary"
                        name="ubah-employee"
                        onClick={this.handleEditEmployeeClick}
                        data={employee}
                        iconClassName="fa fa-pencil-square"
                        label=""
                      ></RowButtonComponent>
                    );
                  }
                })()}

                <RowButtonComponent
                  className="btn btn-danger"
                  name="hapus-employee"
                  onClick={this.handleDeleteEmployeeClick}
                  data={employee}
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
      <div>
        <div className="animated fadeIn">
          {this.state.loading ? (
            <span>
              <Spinner size="sm" color="primary" /> Please wait...
            </span>
          ) : (
            <Row>
              <Col xs="12" lg="12">
                <Form className="mb-5">
                  <Row>
                    <Col sm={4}>
                      <FormGroup>
                        <Button
                          className="btn btn-sm btn-primary mr-2"
                          name="upload"
                          onClick={this.handleClick}
                        >
                          Upload Excel
                        </Button>
                        <Button
                          className="btn btn-sm btn-success mr-5"
                          name="add_employee"
                          onClick={this.handleCreateEmployeeClick}
                        >
                          Tambah Karyawan
                        </Button>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Select
                        placeholder={"pilih unit..."}
                        isClearable={true}
                        options={this.state.units}
                        value={this.state.selectedUnitFilter}
                        onChange={(value) => {
                          if (value != null)
                            this.getAllSectionsByUnit(value.Id);
                          this.setState({ selectedUnitFilter: value });
                        }}
                      ></Select>
                    </Col>
                    <Col sm={3}>
                      <Select
                        placeholder={"pilih jabatan"}
                        isClearable={true}
                        options={this.state.roleEmployees}
                        value={this.state.selectedRoleEmployeeFilter}
                        onChange={(value) => {
                          if (value != null)
                            this.getAllGradesByRoleEmployees(value.Id);
                          this.setState({ selectedRoleEmployeeFilter: value });
                        }}
                      ></Select>
                    </Col>
                    <Col sm={3}>
                      <Select
                        placeholder={"koperasi"}
                        isClearable={true}
                        options={this.state.workerUnions}
                        value={this.state.selectedWorkerUnionFilter}
                        onChange={(value) => {
                          this.setState({ selectedWorkerUnionFilter: value });
                        }}
                      ></Select>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Select
                        placeholder={"pilih seksi..."}
                        isClearable={true}
                        options={this.state.sections}
                        value={this.state.selectedSectionFilter}
                        onChange={(value) => {
                          if (value != null)
                            this.getAllGroupsBySection(value.Id);
                          this.setState({ selectedSectionFilter: value });
                        }}
                      ></Select>
                    </Col>
                    <Col sm={3}>
                      <Select
                        placeholder={"pilih grade"}
                        isClearable={true}
                        options={this.state.grades}
                        value={this.state.selectedGradeFilter}
                        onChange={(value) => {
                          if (value != null)
                            this.getAllEmployeeClassByGrade(this.state.selectedRoleEmployeeFilter?.value, value.Grade);
                          this.setState({
                            selectedGradeFilter: value,
                          });
                        }}
                      ></Select>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
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
                    <Col sm={3}>
                      <Select
                        placeholder={"pilih golongan"}
                        isClearable={true}
                        options={this.state.employmentClasses}
                        value={this.state.selectedEmploymentClassFilter}
                        onChange={(value) => {
                          this.setState({
                            selectedEmploymentClassFilter: value,
                          });
                        }}
                      ></Select>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Select
                        placeholder={"Status karyawan..."}
                        isClearable={true}
                        options={this.state.statusEmployeeOptions}
                        value={this.state.selectedStatusEmployeeFilter}
                        onChange={(value) => {
                          this.setState({
                            selectedStatusEmployeeFilter: value,
                          });
                        }}
                      ></Select>
                    </Col>
                    <Col sm={3}>
                      <Select
                        placeholder={"pilih status"}
                        isClearable={true}
                        options={this.state.employmentStatusOptions}
                        value={this.state.selectedEmploymentStatusFilter}
                        onChange={(value) => {
                          this.setState({
                            selectedEmploymentStatusFilter: value,
                          });
                        }}
                      ></Select>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <AsyncTypeahead
                        id="loader-employee"
                        ref={(typeahead) =>
                          (this.typeaheadEmployee = typeahead)
                        }
                        isLoading={this.state.isAutoCompleteLoading}
                        onChange={(selected) => {
                          this.setState({
                            selectedEmployeeFilter: selected[0],
                          });
                        }}
                        renderMenuItemChildren={(option, props, index) => {
                          if (option.StatusEmployee === 'MUTATED') {
                            return (
                              <span style={{ color: 'red' }}>{option.NameAndEmployeeIdentity}</span>
                            )
                          } else {
                            return (
                              <span>{option.NameAndEmployeeIdentity}</span>
                            )
                          }
                        }}
                        labelKey="NameAndEmployeeIdentity"
                        minLength={1}
                        onSearch={debounce(this.handleEmployeeSearch, 500)}
                        options={this.state.employeesLoader}
                        placeholder="Cari karyawan..."
                      />
                    </Col>
                    <Col sm={3}>
                      <Select
                        placeholder={"pilih hari kerja"}
                        isClearable={true}
                        options={this.state.workDays}
                        value={this.state.selectedWorkDayFilter}
                        onChange={(value) => {
                          this.setState({ selectedWorkDayFilter: value });
                        }}
                      ></Select>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={8}>
                      <Button
                        className="btn btn-sm btn-default mr-2"
                        name="add_employee"
                        onClick={this.resetFilter}
                      >
                        Reset
                      </Button>
                      <Button
                        className="btn btn-sm btn-info mr-2"
                        name="upload"
                        onClick={this.search}
                      >
                        Cari
                      </Button>
                      <Button
                        disabled={this.state.downloadLoading}
                        className="btn btn-sm btn-success mr-2"
                        name="download-employeeTraining"
                        onClick={this.download}
                      >
                        Download Excel
                      </Button>
                      <Button
                        disabled={this.state.downloadLoadingRecap}
                        className="btn btn-sm btn-success mr-2"
                        name="download-recap"
                        onClick={this.downloadEmployeeRecap}
                      >
                        Download Rekap Pdf{" "}
                      </Button>
                    </Col>
                  </Row>
                </Form>
                <Card>
                  <CardHeader>
                    <Row>
                      <Col>
                        <i className="fa fa-user" />{" "}
                        <b>&nbsp;Daftar Karyawan</b>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    {this.state.loadingData ? (
                      <span>
                        <Spinner size="sm" color="primary" /> Loading Data...
                      </span>
                    ) : (
                      <Table id="myTable" responsive striped bordered>
                        <thead>
                          <tr>
                            <th>NIK</th>
                            <th>Nama Karyawan</th>
                            <th>Unit/Bagian</th>
                            <th>Seksi</th>
                            <th>Grup</th>
                            <th>Golongan</th>
                            <th>Status Kepegawaian</th>
                            <th>Lokasi Check-In</th>
                            <th></th>
                            {/* <th>Action</th> */}
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
                  </CardBody>
                </Card>
              </Col>

              <Modal
                dialogClassName="modal-90w"
                aria-labelledby="modal-set-jadwal"
                show={this.state.isShowUploadModal}
                onHide={() => this.showUploadModal(false)}
                animation={true}
              >
                <Modal.Header closeButton>
                  <Modal.Title id="modal-set-jadwal">
                    Upload Karyawan
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

              <Modal
                aria-labelledby="modal-buat-data"
                size={"lg"}
                show={this.state.isShowCreateEmployeeModal}
                onHide={() => this.showCreateEmployeeModal(false)}
                animation={true}
              >
                <Modal.Header closeButton>
                  <Modal.Title id="modal-buat-data">
                    Tambah Karyawan
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form noValidate>
                    <Row>
                      <Col>
                        <Form.Label className={"font-weight-bold"}>
                          Data Pribadi
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor Induk Karyawan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="EmployeeIdentity"
                          value={this.state.selectedEmployee.EmployeeIdentity}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            var prefixNIK =
                              selectedEmployee.EmployeeIdentity.substr(0, 3);
                            var nikUnit = this.state.units.find(
                              (s) =>
                                s.EmployeeIdentityReferenceCode === prefixNIK
                            );
                            selectedEmployee["UnitId"] = nikUnit
                              ? nikUnit.Id
                              : 0;

                            var nikUnits = [];
                            if (prefixNIK.length >= 3) {
                              this.state.units.map((s) => {
                                if (
                                  s.EmployeeIdentityReferenceCode === prefixNIK
                                ) {
                                  nikUnits.push(s);
                                }
                              });
                            } else {
                              nikUnits = this.state.units;
                            }

                            return this.setState({
                              selectedEmployee: { ...selectedEmployee, SectionId: null },
                              selectedUnit: nikUnit ? nikUnit : {},
                              nikUnits: nikUnits,
                            }, () => this.getSectionByUnitId(this.state.selectedUnit.Id));
                          }}
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
                        <Form.Label>Nama Depan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="Firstname"
                          value={this.state.selectedEmployee.Firstname}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.Firstname
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nama Belakang</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="Lastname"
                          value={this.state.selectedEmployee.Lastname}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor KTP</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="CitizenshipIdentity"
                          value={
                            this.state.selectedEmployee.CitizenshipIdentity
                          }
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.CitizenshipIdentity
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Jenis Kelamin</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm?.Gender
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.gender}
                          value={this.state.selectedGender}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["Gender"] = e.value;
                            // if (e.value)
                            //     validationCreateForm["Gender"] = "";
                            return this.setState({
                              selectedGender: e,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Golongan Darah</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="BloodType"
                          value={this.state.selectedEmployee.BloodType}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.BloodType
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Agama</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm?.Religion
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.religions}
                          value={this.state.selectedReligion}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["Religion"] = e.value;
                            return this.setState({
                              selectedReligion: e,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tempat Lahir</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="PlaceOfBirth"
                          value={this.state.selectedEmployee.PlaceOfBirth}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.PlaceOfBirth
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tanggal Lahir</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="date"
                          name="DoB"
                          id="DoB"
                          value={
                            this.state.selectedEmployee.DateOfBirth
                              ? moment(
                                this.state.selectedEmployee.DateOfBirth
                              ).format("YYYY-MM-DD")
                              : ""
                          }
                          onChange={(val) => {
                            console.log(val.target.value);
                            var { selectedEmployee } = this.state;
                            selectedEmployee["DateOfBirth"] = val.target.value;
                            selectedEmployee["DoB"] = val.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.DateOfBirth
                              ? true
                              : null
                          }
                        ></Form.Control>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Alamat Lengkap</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          as="textarea"
                          name="Address"
                          value={this.state.selectedEmployee.Address}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.Address
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Kota</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="City"
                          value={this.state.selectedEmployee.City}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.City ? true : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor Telepon</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="PhoneNumber"
                          value={this.state.selectedEmployee.PhoneNumber}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.PhoneNumber
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col sm={4}>
                        <Form.Label>Sosial Media</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          as="textarea"
                          name="SocialMedia"
                          value={this.state.selectedEmployee.SocialMedia}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.SocialMedia
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Pendidikan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Select
                              className={
                                this.state.validationCreateForm?.Education
                                  ? "invalid-select"
                                  : ""
                              }
                              options={this.state.educations}
                              value={this.state.selectedEducation}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["Education"] = e.value;
                                return this.setState({
                                  selectedEducation: e,
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="text"
                              name="Specialization"
                              placeholder={"Jurusan"}
                              value={this.state.selectedEmployee.Specialization}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee[e.target.name] =
                                  e.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.Specialization
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Asal Sekolah</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="School"
                          value={this.state.selectedEmployee.School}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.School ? true : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status Perkawinan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Select
                              className={
                                this.state.validationCreateForm?.MaritalStatus
                                  ? "invalid-select"
                                  : ""
                              }
                              options={this.state.maritals}
                              value={this.state.selectedMarital}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["MaritalStatus"] = e.value;
                                return this.setState({
                                  selectedMarital: e,
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.MaritalStatus
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Wali</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Form.Control
                              type="text"
                              name="Trustee"
                              value={this.state.selectedEmployee?.Trustee}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee[e.target.name] =
                                  e.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.Trustee
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Keluarga</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Form.Control
                              type="number"
                              name="FamilyMember"
                              value={this.state.selectedEmployee.FamilyMember}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee[e.target.name] =
                                  e.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.FamilyMember
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Anak</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Form.Control
                              type="number"
                              name="ChildNumber"
                              value={this.state.selectedEmployee.ChildNumber}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee[e.target.name] =
                                  e.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.ChildNumber
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row style={{ margin: "10px" }}></Row>
                    <Row>
                      <Col>
                        <Form.Label className={"font-weight-bold"}>
                          Data Karyawan
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Unit</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.UnitId
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.nikUnits}
                          value={this.state.selectedUnit}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["UnitId"] = value.Id;
                            this.setState({
                              selectedUnit: value,
                              selectedEmployee: { ...selectedEmployee, SectionId: null },
                              selectedSection: {}
                            }, () => this.getSectionByUnitId(value.Id));
                          }}
                          isInvalid={
                            this.state.validationCreateForm.UnitId ? true : null
                          }
                        ></Select>
                        {/*<Form.Label>{this.state.selectedUnit?.Name}</Form.Label>*/}
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Seksi</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Select
                              className={
                                this.state.validationCreateForm?.SectionId
                                  ? "invalid-select"
                                  : ""
                              }
                              options={this.state.sectionByUnit}
                              value={this.state.selectedSection}
                              onChange={(value) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["SectionId"] = value.Id;
                                this.setState({
                                  selectedSection: value,
                                  selectedEmployee: selectedEmployee,
                                }, () => {
                                  this.getGroupBySectionId(value.Id)
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.SectionId
                                  ? true
                                  : null
                              }
                            ></Select>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Grup</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Select
                              className={
                                this.state.validationCreateForm?.GroupId
                                  ? "invalid-select"
                                  : ""
                              }
                              options={this.state.groupBySection}
                              value={this.state.selectedGroup}
                              onChange={(value) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["GroupId"] = value.Id;
                                this.setState({
                                  selectedGroup: value,
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm.GroupId
                                  ? true
                                  : null
                              }
                            ></Select>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Jabatan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Select
                              className={
                                this.state.validationCreateForm.RoleEmployeeId
                                  ? "invalid-select"
                                  : ""
                              }
                              options={this.state.roleEmployees}
                              value={this.state.selectedRoleEmployee}
                              onChange={(value) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["RoleEmployeeId"] = value.Id;
                                this.setState({
                                  selectedRoleEmployee: value,
                                  selectedEmployee: selectedEmployee,
                                  selectedGrade: {},
                                  selectedEmploymentClass: {},
                                }, () => { this.getGradeByPositionId(value.Id) });
                              }}
                              isInvalid={
                                this.state.validationCreateForm.RoleEmployeeId
                                  ? true
                                  : null
                              }
                            ></Select>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Grade</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Select
                              className={
                                this.state.validationCreateForm.EmployeeGrade
                                  ? "invalid-select"
                                  : ""
                              }
                              options={this.state.gradeByPosition}
                              value={this.state.selectedGrade}
                              onChange={(value) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["EmployeeGrade"] = value.Grade;
                                this.setState({
                                  selectedGrade: value,
                                  selectedEmployee: selectedEmployee,
                                  selectedEmploymentClass: {}
                                }, () => { this.getEmploymentClassesByGrade(value.Grade) });
                              }}
                              isInvalid={
                                this.state.validationCreateForm.EmployeeGrade
                                  ? true
                                  : null
                              }
                            ></Select>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Golongan</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.EmploymentClass
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.employementClassesByGrade}
                          value={this.state.selectedEmploymentClass}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["EmploymentClass"] = value.NameClass;
                            selectedEmployee["EmployeeClassId"] = value.value;
                            this.setState({
                              selectedEmploymentClass: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.EmploymentClass
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status Kepegawaian</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Select
                              className={
                                this.state.validationCreateForm.EmploymentStatus
                                  ? "invalid-select"
                                  : ""
                              }
                              options={this.state.employmentStatusOptions}
                              value={this.state.selectedEmploymentStatus}
                              onChange={(value) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["EmploymentStatus"] =
                                  value?.value;
                                this.setState({
                                  selectedEmploymentStatus: value,
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm.EmploymentStatus
                                  ? true
                                  : null
                              }
                            ></Select>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Kontrak ke-</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Form.Control
                              type="number"
                              name="ContractNumber"
                              value={this.state.selectedEmployee.ContractNumber}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee[e.target.name] =
                                  e.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm.ContractNumber
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    {this.state.selectedEmploymentStatus?.value == "TETAP" ? (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Tanggal Penetapan</Form.Label>
                        </Col>
                        <Col>
                          <Form.Control
                            type="date"
                            name="AssignmentDate"
                            id="AssignmentDate"
                            value={
                              this.state.selectedEmployee.AssignmentDate
                                ? moment(
                                  this.state.selectedEmployee.AssignmentDate
                                ).format("YYYY-MM-DD")
                                : ""
                            }
                            onChange={(val) => {
                              var { selectedEmployee } = this.state;
                              selectedEmployee["AssignmentDate"] =
                                val.target.value;
                              return this.setState({
                                selectedEmployee: selectedEmployee,
                              });
                            }}
                            isInvalid={
                              this.state.validationCreateForm.AssignmentDate
                                ? true
                                : null
                            }
                          ></Form.Control>
                        </Col>
                      </Row>
                    ) : null}
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tanggal Bergabung</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="date"
                          name="JoinDate"
                          id="JoinDate"
                          value={
                            this.state.selectedEmployee.JoinDate
                              ? moment(
                                this.state.selectedEmployee.JoinDate
                              ).format("YYYY-MM-DD")
                              : ""
                          }
                          onChange={(val) => {
                            console.log(val.target.value);
                            var { selectedEmployee } = this.state;
                            selectedEmployee["JoinDate"] = val.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.JoinDate
                              ? true
                              : null
                          }
                        ></Form.Control>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tanggal Pensiun</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="date"
                          name="RetirementDate"
                          id="RetirementDate"
                          value={
                            this.state.selectedEmployee.RetirementDate
                              ? moment(
                                this.state.selectedEmployee.RetirementDate
                              ).format("YYYY-MM-DD")
                              : ""
                          }
                          onChange={(val) => {
                            console.log(val.target.value);
                            var { selectedEmployee } = this.state;
                            selectedEmployee["RetirementDate"] =
                              val.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.RetirementDate
                              ? true
                              : null
                          }
                        ></Form.Control>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Mulai Kontrak</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col sm={5}>
                            <Form.Control
                              type="date"
                              name="BeginContractDate"
                              id="BeginContractDate"
                              value={
                                this.state.selectedEmployee.BeginContractDate
                                  ? moment(
                                    this.state.selectedEmployee
                                      .BeginContractDate
                                  ).format("YYYY-MM-DD")
                                  : ""
                              }
                              onChange={(val) => {
                                console.log(val.target.value);
                                var { selectedEmployee } = this.state;
                                selectedEmployee["BeginContractDate"] =
                                  val.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm
                                  .BeginContractDate
                                  ? true
                                  : null
                              }
                            ></Form.Control>
                          </Col>
                          <Col sm={2} className={"text-center"}>
                            s/d
                          </Col>
                          <Col sm={5}>
                            <Form.Control
                              type="date"
                              name="EndContractDate"
                              id="EndContractDate"
                              value={
                                this.state.selectedEmployee.EndContractDate
                                  ? moment(
                                    this.state.selectedEmployee
                                      .EndContractDate
                                  ).format("YYYY-MM-DD")
                                  : ""
                              }
                              onChange={(val) => {
                                console.log(val.target.value);
                                var { selectedEmployee } = this.state;
                                selectedEmployee["EndContractDate"] =
                                  val.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm.EndContractDate
                                  ? true
                                  : null
                              }
                            ></Form.Control>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Perpanjangan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col sm={5}>
                            <Form.Control
                              type="date"
                              name="BeginContractExtensionDate"
                              id="BeginContractExtensionDate"
                              value={
                                this.state.selectedEmployee
                                  .BeginContractExtensionDate
                                  ? moment(
                                    this.state.selectedEmployee
                                      .BeginContractExtensionDate
                                  ).format("YYYY-MM-DD")
                                  : ""
                              }
                              onChange={(val) => {
                                console.log(val.target.value);
                                var { selectedEmployee } = this.state;
                                selectedEmployee["BeginContractExtensionDate"] =
                                  val.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm
                                  .BeginContractExtensionDate
                                  ? true
                                  : null
                              }
                            ></Form.Control>
                          </Col>
                          <Col sm={2} className={"text-center"}>
                            s/d
                          </Col>
                          <Col sm={5}>
                            <Form.Control
                              type="date"
                              name="EndContractExtensionDate"
                              id="EndContractExtensionDate"
                              value={
                                this.state.selectedEmployee
                                  .EndContractExtensionDate
                                  ? moment(
                                    this.state.selectedEmployee
                                      .EndContractExtensionDate
                                  ).format("YYYY-MM-DD")
                                  : ""
                              }
                              onChange={(val) => {
                                console.log(val.target.value);
                                var { selectedEmployee } = this.state;
                                selectedEmployee["EndContractExtensionDate"] =
                                  val.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm
                                  .EndContractExtensionDate
                                  ? true
                                  : null
                              }
                            ></Form.Control>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor KPJ</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="JPKNo"
                          value={this.state.selectedEmployee.JPKNo}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.JPKNo ? true : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor Rekening</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="AccountNo"
                          value={this.state.selectedEmployee.AccountNo}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor NPWP</Form.Label>
                      </Col>
                      <Col>
                        <NumberFormat
                          customInput={Form.Control}
                          defaultValue={"000000000000000"}
                          name="NPWPNo"
                          isNumericString={true}
                          value={this.state.selectedEmployee.NPWPNo}
                          onValueChange={(val) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["NPWPNo"] = val.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.NPWPNo ? true : null
                          }
                          format="##.###.###.#-###.###"
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Lokasi CheckIn</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.LocationId
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.locations}
                          value={this.state.selectedLocation}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["LocationId"] = value.Id;
                            this.setState({
                              selectedLocation: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.LocationId
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Upah Pokok</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          name="BaseSalary"
                          value={this.state.selectedEmployee.BaseSalary}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            var baseSalary = selectedEmployee.BaseSalary
                              ? parseFloat(selectedEmployee.BaseSalary)
                              : 0;
                            var mealAllowance = selectedEmployee.MealAllowance
                              ? parseFloat(selectedEmployee.MealAllowance)
                              : 0;
                            var leaderAllowance =
                              selectedEmployee.LeaderAllowance
                                ? parseFloat(selectedEmployee.LeaderAllowance)
                                : 0;
                            var achievementBonus =
                              selectedEmployee.AchievementBonus
                                ? parseFloat(selectedEmployee.AchievementBonus)
                                : 0;

                            selectedEmployee["GrossIncome"] =
                              baseSalary +
                              mealAllowance +
                              leaderAllowance +
                              achievementBonus;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.BaseSalary
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tunjangan Tetap Makan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          name="MealAllowance"
                          value={this.state.selectedEmployee.MealAllowance}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            var baseSalary = selectedEmployee.BaseSalary
                              ? parseFloat(selectedEmployee.BaseSalary)
                              : 0;
                            var mealAllowance = selectedEmployee.MealAllowance
                              ? parseFloat(selectedEmployee.MealAllowance)
                              : 0;
                            var leaderAllowance =
                              selectedEmployee.LeaderAllowance
                                ? parseFloat(selectedEmployee.LeaderAllowance)
                                : 0;
                            var achievementBonus =
                              selectedEmployee.AchievementBonus
                                ? parseFloat(selectedEmployee.AchievementBonus)
                                : 0;

                            selectedEmployee["GrossIncome"] =
                              baseSalary +
                              mealAllowance +
                              leaderAllowance +
                              achievementBonus;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.MealAllowance
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tunjangan Leader</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          name="LeaderAllowance"
                          value={this.state.selectedEmployee.LeaderAllowance}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            var baseSalary = selectedEmployee.BaseSalary
                              ? parseFloat(selectedEmployee.BaseSalary)
                              : 0;
                            var mealAllowance = selectedEmployee.MealAllowance
                              ? parseFloat(selectedEmployee.MealAllowance)
                              : 0;
                            var leaderAllowance =
                              selectedEmployee.LeaderAllowance
                                ? parseFloat(selectedEmployee.LeaderAllowance)
                                : 0;
                            var achievementBonus =
                              selectedEmployee.AchievementBonus
                                ? parseFloat(selectedEmployee.AchievementBonus)
                                : 0;

                            selectedEmployee["GrossIncome"] =
                              baseSalary +
                              mealAllowance +
                              leaderAllowance +
                              achievementBonus;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.LeaderAllowance
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Premi Prestasi</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          name="AchievementBonus"
                          value={this.state.selectedEmployee.AchievementBonus}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            var baseSalary = selectedEmployee.BaseSalary
                              ? parseFloat(selectedEmployee.BaseSalary)
                              : 0;
                            var mealAllowance = selectedEmployee.MealAllowance
                              ? parseFloat(selectedEmployee.MealAllowance)
                              : 0;
                            var leaderAllowance =
                              selectedEmployee.LeaderAllowance
                                ? parseFloat(selectedEmployee.LeaderAllowance)
                                : 0;
                            var achievementBonus =
                              selectedEmployee.AchievementBonus
                                ? parseFloat(selectedEmployee.AchievementBonus)
                                : 0;

                            selectedEmployee["GrossIncome"] =
                              baseSalary +
                              mealAllowance +
                              leaderAllowance +
                              achievementBonus;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.AchievementBonus
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Penerimaan Per Bulan</Form.Label>
                      </Col>
                      {/* <Col>
                          <Form.Control
                            type="number"
                            name="GrossIncome"
                            value={this.state.selectedEmployee.GrossIncome}
                            onChange={(e) => {
                              var { selectedEmployee } = this.state;
                              selectedEmployee[e.target.name] = e.target.value;
                              return this.setState({ selectedEmployee: selectedEmployee });
                            }}
                            isInvalid={this.state.validationCreateForm.GrossIncome ? true : null}
                          />
                        </Col> */}
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.GrossIncome}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>BPJS Kesehatan</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.BpjsKesehatan
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.bpjsKesehatan}
                          value={this.state.selectedBpjsKesehatan}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["BpjsKesehatan"] = e.value;
                            return this.setState({
                              selectedBpjsKesehatan: e,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.BpjsKesehatan
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    {this.state.selectedBpjsKesehatan?.value == "YA" ? (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Persentase BPJS Kesehatan</Form.Label>
                        </Col>
                        <Col>
                          <Form.Control
                            type="number"
                            name="BpjsKesehatanPercentage"
                            value={
                              this.state.selectedEmployee
                                .BpjsKesehatanPercentage
                            }
                            onChange={(e) => {
                              var { selectedEmployee } = this.state;
                              selectedEmployee[e.target.name] = e.target.value;
                              return this.setState({
                                selectedEmployee: selectedEmployee,
                              });
                            }}
                          />
                        </Col>
                      </Row>
                    ) : null}

                    <Row>
                      <Col sm={4}>
                        <Form.Label>BPJS Ketenagakerjaan</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.BpjsKetenagakerjaan
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.bpjsKetenagakerjaans}
                          value={this.state.selectedBpjsKetenagakerjaan}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["BpjsKetenagakerjaan"] = e.Code;
                            selectedEmployee["BpjsKetenagakerjaanId"] = e.value;
                            return this.setState({
                              selectedBpjsKetenagakerjaan: e,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.BpjsKetenagakerjaan
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status PPh</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.StatusPph
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.statusPphs}
                          value={this.state.selectedStatusPph}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["StatusPph"] = value.Id;
                            this.setState({
                              selectedStatusPph: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.StatusPph
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Hari Kerja</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.WorkDays
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.workDays}
                          value={this.state.selectedWorkDays}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["WorkDays"] = value.value;
                            this.setState({
                              selectedWorkDays: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.WorkDays
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Koperasi</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.IsWorkerUnion
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.workerUnions}
                          value={this.state.selectedWorkerUnion}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["IsWorkerUnion"] = value.value;
                            this.setState({
                              selectedWorkerUnion: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.IsWorkerUnion
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status Karyawan</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.EmployeeStatus
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.statusEmployeeOptions}
                          value={this.state.selectedStatusEmployee}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["EmployeeStatus"] = value?.value;
                            if (value?.value === 'AKTIF') {
                              selectedEmployee["EmployeeStatusRemark"] = null;
                            }
                            this.setState({
                              selectedStatusEmployee: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.EmployeeStatus
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Fitur</Form.Label>
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="CanAccessQRCode"
                          label="Absensi QR Code"
                          className="form-check-input"
                          checked={this.state.selectedEmployee.CanAccessQRCode}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.checked;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="CanAccessResetPassword"
                          label="Reset Password"
                          className="form-check-input"
                          checked={
                            this.state.selectedEmployee.CanAccessResetPassword
                          }
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.checked;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>

                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="IsCanApproveRequestLeave"
                          label="Approve Request Cuti"
                          className="form-check-input"
                          checked={
                            this.state.selectedEmployee.IsCanApproveRequestLeave
                          }
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.checked;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label></Form.Label>
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="IsCanApproveRequestWfh"
                          label="Approve Request WFH"
                          className="form-check-input"
                          checked={
                            this.state.selectedEmployee.IsCanApproveRequestWfh
                          }
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.checked;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                    </Row>
                    {this.state.selectedStatusEmployee &&
                      this.state.selectedStatusEmployee.value ===
                      "TIDAK AKTIF" ? (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Keterangan</Form.Label>
                        </Col>
                        <Col>
                          <Select
                            options={this.state.statusEmployeeRemarks}
                            value={this.state.selectedRemark}
                            onChange={(value) => {
                              var { selectedEmployee } = this.state;
                              selectedEmployee["EmployeeStatusRemark"] =
                                value.value;
                              this.setState({
                                selectedRemark: value,
                                selectedEmployee: selectedEmployee,
                              });
                            }}
                            isInvalid={
                              this.state.validationCreateForm
                                .EmployeeStatusRemark
                                ? true
                                : null
                            }
                          ></Select>
                        </Col>
                      </Row>
                    ) : (
                      <Row></Row>
                    )}
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  {this.state.createEmployeeLoading ? (
                    <span>
                      <Spinner size="sm" color="primary" /> Mohon tunggu...
                    </span>
                  ) : (
                    <div>
                      <Button
                        className="btn btn-success"
                        name="create-employee"
                        onClick={this.createEmployeeClickHandler}
                      >
                        Simpan
                      </Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>

              <Modal
                aria-labelledby="modal-ubah-data"
                size={"lg"}
                show={this.state.isShowEditEmployeeModal}
                onHide={() => this.showEditEmployeeModal(false)}
                animation={true}
              >
                <Modal.Header closeButton>
                  <Modal.Title id="modal-ubah-data">
                    Ubah Data Karyawan
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form noValidate>
                    <Row>
                      <Col>
                        <Form.Label className={"font-weight-bold"}>
                          Data Pribadi
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor Induk Karyawan</Form.Label>
                      </Col>
                      <Col>
                        {!this.state.isMutation ? (
                          <Form.Label>
                            {this.state.selectedEmployee.EmployeeIdentity}
                          </Form.Label>
                        ) : (
                          <Form.Control
                            type="text"
                            name="EmployeeIdentity"
                            value={this.state.selectedEmployee.EmployeeIdentity}
                            onChange={(e) => {
                              var { selectedEmployee } = this.state;
                              selectedEmployee[e.target.name] = e.target.value;
                              var prefixNIK =
                                selectedEmployee.EmployeeIdentity.substr(0, 3);
                              var nikUnit = this.state.units.find(
                                (s) =>
                                  s.EmployeeIdentityReferenceCode === prefixNIK
                              );
                              selectedEmployee["UnitId"] = nikUnit
                                ? nikUnit.Id
                                : 0;
                              return this.setState({
                                selectedEmployee: selectedEmployee,
                                selectedUnit: nikUnit ? nikUnit : {},
                              });
                            }}
                          />
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nama Depan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="Firstname"
                          value={this.state.selectedEmployee.Firstname || ""}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.Firstname
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nama Belakang</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="Lastname"
                          value={this.state.selectedEmployee.Lastname || ""}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor KTP</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="CitizenshipIdentity"
                          value={
                            this.state.selectedEmployee.CitizenshipIdentity
                          }
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.CitizenshipIdentity
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Jenis Kelamin</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          options={this.state.gender}
                          value={this.state.selectedGender}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["Gender"] = e.value;
                            return this.setState({
                              selectedGender: e,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          className={
                            this.state.validationCreateForm?.Gender
                              ? "invalid-select"
                              : ""
                          }
                          isInvalid={
                            this.state.validationCreateForm?.Gender
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Golongan Darah</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="BloodType"
                          value={this.state.selectedEmployee.BloodType || ""}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.BloodType
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col sm={4}>
                        <Form.Label>Agama</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          options={this.state.religions}
                          value={this.state.selectedReligion}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["Religion"] = e.value;
                            return this.setState({
                              selectedReligion: e,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          className={
                            this.state.validationCreateForm?.Religion
                              ? "invalid-select"
                              : ""
                          }
                          isInvalid={
                            this.state.validationCreateForm?.Religion
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tempat Lahir</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="PlaceOfBirth"
                          value={this.state.selectedEmployee.PlaceOfBirth || ""}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.PlaceOfBirth
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tanggal Lahir</Form.Label>
                      </Col>
                      <Col>
                        <Input
                          type="date"
                          name="DoB"
                          id="DoB"
                          value={
                            this.state.selectedEmployee.DoB
                              ? moment(this.state.selectedEmployee.DoB).format(
                                "YYYY-MM-DD"
                              )
                              : ""
                          }
                          onChange={(val) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["DateOfBirth"] = moment(
                              val.target.value
                            ).format("YYYY-MM-DD");
                            selectedEmployee["DoB"] = moment(
                              val.target.value
                            ).format("YYYY-MM-DD");
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.DateOfBirth
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Alamat Lengkap</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          as="textarea"
                          name="Address"
                          value={this.state.selectedEmployee.Address || ""}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.Address
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Sosial Media</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          as="textarea"
                          name="SocialMedia"
                          value={this.state.selectedEmployee.SocialMedia || ""}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.SocialMedia
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col sm={4}>
                        <Form.Label>Kota</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="City"
                          value={this.state.selectedEmployee.City || ""}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.City ? true : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor Telepon</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="PhoneNumber"
                          value={this.state.selectedEmployee.PhoneNumber || ""}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.PhoneNumber
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Pendidikan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Select
                              options={this.state.educations}
                              value={this.state.selectedEducation}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["Education"] = e.value;
                                return this.setState({
                                  selectedEducation: e,
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              className={
                                this.state.validationCreateForm?.Education
                                  ? "invalid-select"
                                  : ""
                              }
                              isInvalid={
                                this.state.validationCreateForm?.Education
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="text"
                              name="Specialization"
                              placeholder={"Jurusan"}
                              value={
                                this.state.selectedEmployee.Specialization || ""
                              }
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee[e.target.name] =
                                  e.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.Specialization
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Asal Sekolah</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="School"
                          value={this.state.selectedEmployee.School || ""}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.School
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status Perkawinan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Select
                              options={this.state.maritals}
                              value={this.state.selectedMarital}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["MaritalStatus"] = e.value;
                                return this.setState({
                                  selectedMarital: e,
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              className={
                                this.state.validationCreateForm?.MaritalStatus
                                  ? "invalid-select"
                                  : ""
                              }
                              isInvalid={
                                this.state.validationCreateForm?.MaritalStatus
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Wali</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Form.Control
                              type="text"
                              name="Trustee"
                              value={this.state.selectedEmployee.Trustee}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee[e.target.name] =
                                  e.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.Trustee
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Keluarga</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Form.Control
                              type="number"
                              name="FamilyMember"
                              value={this.state.selectedEmployee.FamilyMember}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee[e.target.name] =
                                  e.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.FamilyMember
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Anak</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Form.Control
                              type="number"
                              name="ChildNumber"
                              value={this.state.selectedEmployee.ChildNumber}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee[e.target.name] =
                                  e.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.ChildNumber
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row style={{ margin: "10px" }}></Row>
                    <Row>
                      <Col>
                        <Form.Label className={"font-weight-bold"}>
                          Data Karyawan
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Unit</Form.Label>
                      </Col>
                      <Col>
                        {!this.state.isMutation ? (
                          <Form.Label>
                            {this.state.selectedUnit?.Name}
                          </Form.Label>
                        ) : (
                          <Select
                            options={this.state.units}
                            value={this.state.selectedUnit}
                            onChange={(value) => {
                              var { selectedEmployee } = this.state;
                              selectedEmployee["UnitId"] = value.Id;
                              this.setState({
                                selectedUnit: value,
                                selectedEmployee: selectedEmployee,
                              }, () => this.getSectionByUnitId(value.Id));
                            }}
                            className={
                              this.state.validationCreateForm.UnitId
                                ? "invalid-select"
                                : ""
                            }
                            isInvalid={
                              this.state.validationCreateForm.UnitId
                                ? true
                                : null
                            }
                          ></Select>
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Seksi</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Select
                              options={this.state.sections}
                              value={this.state.selectedSection}
                              onChange={(value) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["SectionId"] = value.Id;
                                this.setState({
                                  selectedSection: value,
                                  selectedEmployee: selectedEmployee,
                                }, () => {
                                  this.getGroupBySectionId(value.Id)
                                });
                              }}
                              className={
                                this.state.validationCreateForm?.SectionId
                                  ? "invalid-select"
                                  : ""
                              }
                              isInvalid={
                                this.state.validationCreateForm?.SectionId
                                  ? true
                                  : null
                              }
                            ></Select>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Grup</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Select
                              options={this.state.groups}
                              value={this.state.selectedGroup}
                              onChange={(value) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["GroupId"] = value.Id;
                                this.setState({
                                  selectedGroup: value,
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              className={
                                this.state.validationCreateForm?.GroupId
                                  ? "invalid-select"
                                  : ""
                              }
                              isInvalid={
                                this.state.validationCreateForm?.GroupId
                                  ? true
                                  : null
                              }
                            ></Select>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Jabatan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Select
                              options={this.state.roleEmployees}
                              value={this.state.selectedRoleEmployee}
                              onChange={(value) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["RoleEmployeeId"] = value.Id;
                                this.setState({
                                  selectedRoleEmployee: value,
                                  selectedEmployee: selectedEmployee,
                                  selectedGrade: {},
                                  selectedEmploymentClass: {},
                                }, () => { this.getGradeByPositionId(value.Id) });
                              }}
                              className={
                                this.state.validationCreateForm?.RoleEmployeeId
                                  ? "invalid-select"
                                  : ""
                              }
                              isInvalid={
                                this.state.validationCreateForm?.RoleEmployeeId
                                  ? true
                                  : null
                              }
                            ></Select>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Grade</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Select
                              options={this.state.grades}
                              value={this.state.selectedGrade}
                              onChange={(value) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["EmployeeGrade"] = value.Grade;
                                this.setState({
                                  selectedGrade: value,
                                  selectedEmployee: selectedEmployee,
                                }, () => { this.getEmploymentClassesByGrade(value.Grade) });
                              }}
                              className={
                                this.state.validationCreateForm?.EmployeeGrade
                                  ? "invalid-select"
                                  : ""
                              }
                              isInvalid={
                                this.state.validationCreateForm?.EmployeeGrade
                                  ? true
                                  : null
                              }
                            ></Select>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Golongan</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          options={this.state.employmentClasses}
                          value={this.state.selectedEmploymentClass}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["EmploymentClass"] = value.NameClass;
                            selectedEmployee["EmployeeClassId"] = value.value;
                            this.setState({
                              selectedEmploymentClass: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          className={
                            this.state.validationCreateForm?.EmploymentClass
                              ? "invalid-select"
                              : ""
                          }
                          isInvalid={
                            this.state.validationCreateForm?.EmploymentClass
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status Kepegawaian</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Select
                              options={this.state.employmentStatusOptions}
                              value={this.state.selectedEmploymentStatus}
                              onChange={(value) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["EmploymentStatus"] =
                                  value?.value;
                                this.setState({
                                  selectedEmploymentStatus: value,
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              className={
                                this.state.validationCreateForm
                                  ?.EmploymentStatus
                                  ? "invalid-select"
                                  : ""
                              }
                              isInvalid={
                                this.state.validationCreateForm
                                  ?.EmploymentStatus
                                  ? true
                                  : null
                              }
                            ></Select>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Kontrak ke-</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Form.Control
                              type="number"
                              name="ContractNumber"
                              value={this.state.selectedEmployee.ContractNumber}
                              onChange={(e) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee[e.target.name] =
                                  e.target.value;
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.ContractNumber
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    {this.state.selectedEmploymentStatus?.value == "TETAP" ? (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Tanggal Penetapan</Form.Label>
                        </Col>
                        <Col>
                          <Form.Control
                            type="date"
                            name="AssignmentDate"
                            id="AssignmentDate"
                            value={
                              this.state.selectedEmployee.AssignmentDate
                                ? moment(
                                  this.state.selectedEmployee.AssignmentDate
                                ).format("YYYY-MM-DD")
                                : ""
                            }
                            onChange={(val) => {
                              var { selectedEmployee } = this.state;
                              selectedEmployee["AssignmentDate"] = moment(
                                val.target.value
                              ).format("YYYY-MM-DD");
                              return this.setState({
                                selectedEmployee: selectedEmployee,
                              });
                            }}
                            isInvalid={
                              this.state.validationCreateForm?.AssignmentDate
                                ? true
                                : null
                            }
                          ></Form.Control>
                        </Col>
                      </Row>
                    ) : null}
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tanggal Bergabung</Form.Label>
                      </Col>
                      <Col>
                        <Input
                          type="date"
                          name="JoinDate"
                          id="JoinDate"
                          value={
                            this.state.selectedEmployee.JoinDate
                              ? moment(
                                this.state.selectedEmployee.JoinDate
                              ).format("YYYY-MM-DD")
                              : ""
                          }
                          onChange={(val) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["JoinDate"] = moment(
                              val.target.value
                            ).format("YYYY-MM-DD");
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.JoinDate
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tanggal Pensiun</Form.Label>
                      </Col>
                      <Col>
                        <Input
                          type="date"
                          name="RetirementDate"
                          id="RetirementDate"
                          value={
                            this.state.selectedEmployee.RetirementDate
                              ? moment(
                                this.state.selectedEmployee.RetirementDate
                              ).format("YYYY-MM-DD")
                              : ""
                          }
                          onChange={(val) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["RetirementDate"] = moment(
                              val.target.value
                            ).format("YYYY-MM-DD");
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.RetirementDate
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Mulai Kontrak</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col sm={5}>
                            <Input
                              type="date"
                              name="BeginContractDate"
                              id="BeginContractDate"
                              value={
                                this.state.selectedEmployee.BeginContractDate
                                  ? moment(
                                    this.state.selectedEmployee
                                      .BeginContractDate
                                  ).format("YYYY-MM-DD")
                                  : ""
                              }
                              onChange={(val) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["BeginContractDate"] = moment(
                                  val.target.value
                                ).format("YYYY-MM-DD");
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm
                                  ?.BeginContractDate
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                          <Col sm={2} className={"text-center"}>
                            s/d
                          </Col>
                          <Col sm={5}>
                            <Input
                              type="date"
                              name="EndContractDate"
                              id="EndContractDate"
                              value={
                                this.state.selectedEmployee.EndContractDate
                                  ? moment(
                                    this.state.selectedEmployee
                                      .EndContractDate
                                  ).format("YYYY-MM-DD")
                                  : ""
                              }
                              onChange={(val) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["EndContractDate"] = moment(
                                  val.target.value
                                ).format("YYYY-MM-DD");
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm?.EndContractDate
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Perpanjangan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col sm={5}>
                            <Input
                              type="date"
                              name="BeginContractExtensionDate"
                              id="BeginContractExtensionDate"
                              value={
                                this.state.selectedEmployee
                                  .BeginContractExtensionDate
                                  ? moment(
                                    this.state.selectedEmployee
                                      .BeginContractExtensionDate
                                  ).format("YYYY-MM-DD")
                                  : ""
                              }
                              onChange={(val) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["BeginContractExtensionDate"] =
                                  moment(val.target.value).format("YYYY-MM-DD");

                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm
                                  ?.BeginContractExtensionDate
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                          <Col sm={2} className={"text-center"}>
                            s/d
                          </Col>
                          <Col sm={5}>
                            <Input
                              type="date"
                              name="EndContractExtensionDate"
                              id="EndContractExtensionDate"
                              value={
                                this.state.selectedEmployee
                                  .EndContractExtensionDate
                                  ? moment(
                                    this.state.selectedEmployee
                                      .EndContractExtensionDate
                                  ).format("YYYY-MM-DD")
                                  : ""
                              }
                              onChange={(val) => {
                                var { selectedEmployee } = this.state;
                                selectedEmployee["EndContractExtensionDate"] =
                                  moment(val.target.value).format("YYYY-MM-DD");
                                return this.setState({
                                  selectedEmployee: selectedEmployee,
                                });
                              }}
                              isInvalid={
                                this.state.validationCreateForm
                                  ?.EndContractExtensionDate
                                  ? true
                                  : null
                              }
                            />
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor KPJ</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="JPKNo"
                          value={this.state.selectedEmployee.JPKNo}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.JPKNo ? true : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor Rekening</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="text"
                          name="AccountNo"
                          value={this.state.selectedEmployee.AccountNo}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor NPWP</Form.Label>
                      </Col>
                      <Col>
                        <NumberFormat
                          customInput={Form.Control}
                          defaultValue={"000000000000000"}
                          name="NPWPNo"
                          isNumericString={true}
                          value={this.state.selectedEmployee.NPWPNo}
                          onValueChange={(val) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["NPWPNo"] = val.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.NPWPNo
                              ? true
                              : null
                          }
                          format="##.###.###.#-###.###"
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Lokasi CheckIn</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          options={this.state.locations}
                          value={this.state.selectedLocation}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["LocationId"] = value.Id;
                            this.setState({
                              selectedLocation: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          className={
                            this.state.validationCreateForm?.LocationId
                              ? "invalid-select"
                              : ""
                          }
                          isInvalid={
                            this.state.validationCreateForm?.LocationId
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Upah Pokok</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          name="BaseSalary"
                          value={this.state.selectedEmployee.BaseSalary}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            var baseSalary = selectedEmployee.BaseSalary
                              ? parseFloat(selectedEmployee.BaseSalary)
                              : 0;
                            var mealAllowance = selectedEmployee.MealAllowance
                              ? parseFloat(selectedEmployee.MealAllowance)
                              : 0;
                            var leaderAllowance =
                              selectedEmployee.LeaderAllowance
                                ? parseFloat(selectedEmployee.LeaderAllowance)
                                : 0;
                            var achievementBonus =
                              selectedEmployee.AchievementBonus
                                ? parseFloat(selectedEmployee.AchievementBonus)
                                : 0;

                            selectedEmployee["GrossIncome"] =
                              baseSalary +
                              mealAllowance +
                              leaderAllowance +
                              achievementBonus;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.BaseSalary
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tunjangan Tetap Makan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          name="MealAllowance"
                          value={this.state.selectedEmployee.MealAllowance}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            var baseSalary = selectedEmployee.BaseSalary
                              ? parseFloat(selectedEmployee.BaseSalary)
                              : 0;
                            var mealAllowance = selectedEmployee.MealAllowance
                              ? parseFloat(selectedEmployee.MealAllowance)
                              : 0;
                            var leaderAllowance =
                              selectedEmployee.LeaderAllowance
                                ? parseFloat(selectedEmployee.LeaderAllowance)
                                : 0;
                            var achievementBonus =
                              selectedEmployee.AchievementBonus
                                ? parseFloat(selectedEmployee.AchievementBonus)
                                : 0;

                            selectedEmployee["GrossIncome"] =
                              baseSalary +
                              mealAllowance +
                              leaderAllowance +
                              achievementBonus;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.MealAllowance
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tunjangan Leader</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          name="LeaderAllowance"
                          value={this.state.selectedEmployee.LeaderAllowance}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            var baseSalary = selectedEmployee.BaseSalary
                              ? parseFloat(selectedEmployee.BaseSalary)
                              : 0;
                            var mealAllowance = selectedEmployee.MealAllowance
                              ? parseFloat(selectedEmployee.MealAllowance)
                              : 0;
                            var leaderAllowance =
                              selectedEmployee.LeaderAllowance
                                ? parseFloat(selectedEmployee.LeaderAllowance)
                                : 0;
                            var achievementBonus =
                              selectedEmployee.AchievementBonus
                                ? parseFloat(selectedEmployee.AchievementBonus)
                                : 0;

                            selectedEmployee["GrossIncome"] =
                              baseSalary +
                              mealAllowance +
                              leaderAllowance +
                              achievementBonus;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.LeaderAllowance
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Premi Prestasi</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          name="AchievementBonus"
                          value={this.state.selectedEmployee.AchievementBonus}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.value;
                            var baseSalary = selectedEmployee.BaseSalary
                              ? parseFloat(selectedEmployee.BaseSalary)
                              : 0;
                            var mealAllowance = selectedEmployee.MealAllowance
                              ? parseFloat(selectedEmployee.MealAllowance)
                              : 0;
                            var leaderAllowance =
                              selectedEmployee.LeaderAllowance
                                ? parseFloat(selectedEmployee.LeaderAllowance)
                                : 0;
                            var achievementBonus =
                              selectedEmployee.AchievementBonus
                                ? parseFloat(selectedEmployee.AchievementBonus)
                                : 0;

                            selectedEmployee["GrossIncome"] =
                              baseSalary +
                              mealAllowance +
                              leaderAllowance +
                              achievementBonus;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.AchievementBonus
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Penerimaan Per Bulan</Form.Label>
                      </Col>
                      {/* <Col>
                          <Form.Control
                            type="number"
                            name="GrossIncome"
                            value={this.state.selectedEmployee.GrossIncome}
                            onChange={(e) => {
                              var { selectedEmployee } = this.state;
                              selectedEmployee[e.target.name] = e.target.value;
                              return this.setState({ selectedEmployee: selectedEmployee });
                            }}
                            isInvalid={this.state.validationCreateForm.GrossIncome ? true : null}
                          />
                        </Col> */}
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.GrossIncome}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>BPJS Kesehatan</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm?.BpjsKesehatan
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.bpjsKesehatan}
                          value={this.state.selectedBpjsKesehatan}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["BpjsKesehatan"] = e.value;
                            return this.setState({
                              selectedBpjsKesehatan: e,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.BpjsKesehatan
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    {this.state.selectedBpjsKesehatan?.value == "YA" ? (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Persentase BPJS Kesehatan</Form.Label>
                        </Col>
                        <Col>
                          <Form.Control
                            type="number"
                            name="BpjsKesehatanPercentage"
                            value={
                              this.state.selectedEmployee
                                .BpjsKesehatanPercentage
                            }
                            onChange={(e) => {
                              var { selectedEmployee } = this.state;
                              selectedEmployee[e.target.name] = e.target.value;
                              return this.setState({
                                selectedEmployee: selectedEmployee,
                              });
                            }}
                          />
                        </Col>
                      </Row>
                    ) : null}
                    <Row>
                      <Col sm={4}>
                        <Form.Label>BPJS Ketenagakerjaan</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.BpjsKetenagakerjaan
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.bpjsKetenagakerjaans}
                          value={this.state.selectedBpjsKetenagakerjaan}
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["BpjsKetenagakerjaan"] = e.Code;
                            selectedEmployee["BpjsKetenagakerjaanId"] = e.value;
                            return this.setState({
                              selectedBpjsKetenagakerjaan: e,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm?.BpjsKetenagakerjaan
                              ? true
                              : null
                          }
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status PPh</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.StatusPph
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.statusPphs}
                          value={this.state.selectedStatusPph}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["StatusPph"] = value.Id;
                            this.setState({
                              selectedStatusPph: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.StatusPph
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Hari Kerja</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.WorkDays
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.workDays}
                          value={this.state.selectedWorkDays}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["WorkDays"] = value.value;
                            this.setState({
                              selectedWorkDays: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.WorkDays
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Koperasi</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm.IsWorkerUnion
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.workerUnions}
                          value={this.state.selectedWorkerUnion}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["IsWorkerUnion"] = value.value;
                            this.setState({
                              selectedWorkerUnion: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.IsWorkerUnion
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status Karyawan</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          options={this.state.statusEmployeeOptions}
                          value={this.state.selectedStatusEmployee}
                          onChange={(value) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["EmployeeStatus"] = value?.value;
                            selectedEmployee["StatusEmployee"] = value?.value;
                            if (value?.value === 'AKTIF') {
                              selectedEmployee["EmployeeStatusRemark"] = null;
                            }
                            this.setState({
                              selectedStatusEmployee: value,
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          className={
                            this.state.validationCreateForm.EmployeeStatus
                              ? "invalid-select"
                              : ""
                          }
                          isInvalid={
                            this.state.validationCreateForm.EmployeeStatus
                              ? true
                              : null
                          }
                        ></Select>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Fitur</Form.Label>
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="CanAccessQRCode"
                          label="Absensi QR Code"
                          checked={this.state.selectedEmployee.CanAccessQRCode}
                          className="form-check-input"
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.checked;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="CanAccessResetPassword"
                          label="Reset Password"
                          checked={
                            this.state.selectedEmployee.CanAccessResetPassword
                          }
                          className="form-check-input"
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.checked;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="IsCanApproveRequestLeave"
                          label="Approve Request Cuti"
                          checked={
                            this.state.selectedEmployee.IsCanApproveRequestLeave
                          }
                          className="form-check-input"
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.checked;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label></Form.Label>
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="IsCanApproveRequestWfh"
                          label="Approve Request WFH"
                          checked={
                            this.state.selectedEmployee.IsCanApproveRequestWfh
                          }
                          className="form-check-input"
                          onChange={(e) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee[e.target.name] = e.target.checked;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                        />
                      </Col>
                    </Row>
                    {this.state.selectedStatusEmployee &&
                      this.state.selectedStatusEmployee.value ===
                      "TIDAK AKTIF" ? (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Keterangan</Form.Label>
                        </Col>
                        <Col>
                          <Select
                            options={this.state.statusEmployeeRemarks}
                            value={this.state.selectedRemark}
                            onChange={(value) => {
                              var { selectedEmployee } = this.state;
                              selectedEmployee["EmployeeStatusRemark"] =
                                value.value;
                              this.setState({
                                selectedRemark: value,
                                selectedEmployee: selectedEmployee,
                              });
                            }}
                            className={
                              this.state.validationCreateForm
                                .EmployeeStatusRemark
                                ? "invalid-select"
                                : ""
                            }
                            isInvalid={
                              this.state.validationCreateForm
                                .EmployeeStatusRemark
                                ? true
                                : null
                            }
                          ></Select>
                        </Col>
                      </Row>
                    ) : (
                      <Row></Row>
                    )}

                    {!this.state.isMutationButton ? (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Tanggal Mutasi</Form.Label>
                        </Col>
                        <Col>
                          <Input
                            type="date"
                            name="DateMutation"
                            id="DateMutation"
                            value={
                              this.state.selectedEmployee.DateMutation
                                ? moment(
                                  this.state.selectedEmployee.DateMutation
                                ).format("YYYY-MM-DD")
                                : ""
                            }
                            onChange={(val) => {
                              var { selectedEmployee } = this.state;
                              selectedEmployee["DateMutation"] = moment(
                                val.target.value
                              ).format("YYYY-MM-DD");
                              return this.setState({
                                selectedEmployee: selectedEmployee,
                              });
                            }}
                            isInvalid={
                              this.state.validationCreateForm.DateMutation
                                ? true
                                : null
                            }
                          />
                        </Col>
                      </Row>
                    ) : (
                      <Row></Row>
                    )}
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status Registrasi</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.IsClaimed
                            ? "Sudah Terdaftar"
                            : "Belum Terdaftar"}
                        </Form.Label>
                      </Col>
                    </Row>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  {this.state.updateEmployeeLoading ? (
                    <span>
                      <Spinner size="sm" color="primary" /> Mohon tunggu...
                    </span>
                  ) : (
                    <div className="row">
                      {this.state.isMutationButton ? (
                        <div className="col-md-6 pull-left">
                          <Button
                            className="btn btn-default"
                            name="update-employee"
                            onClick={() => {
                              var { selectedEmployee } = this.state;
                              //console.log(selectedEmployee);
                              if (
                                selectedEmployee.CitizenshipIdentity === null
                              ) {
                                swal({
                                  icon: "error",
                                  title: "Oops...",
                                  text: "Mohon untuk mengisi No. KTP terlebih dahulu",
                                });
                              } else {
                                selectedEmployee["PreviouseId"] =
                                  this.state.selectedEmployee.Id;
                                selectedEmployee["PreviouseEmployeeIdentity"] =
                                  this.state.selectedEmployee.EmployeeIdentity;
                                selectedEmployee["StatusEmployee"] = "MUTATED";
                                selectedEmployee["DateResign"] = null;
                                selectedEmployee["IsMutation"] = true;
                                return this.setState({
                                  isActive: false,
                                  isResign: false,
                                  isMutation: true,
                                  isMutationButton: false,
                                });
                              }
                            }}
                          >
                            Mutasi
                          </Button>
                        </div>
                      ) : null}

                      <div className="col-md-6 pull-right">
                        <Button
                          className="btn btn-success"
                          name="update-employee"
                          onClick={this.updateEmployeeClickHandler}
                        >
                          Simpan
                        </Button>
                      </div>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>

              <Modal
                aria-labelledby="modal-lihat-data"
                size={"lg"}
                show={this.state.isShowViewEmployeeModal}
                onHide={() => this.showViewEmployeeModal(false)}
                animation={true}
              >
                <Modal.Header closeButton>
                  <Modal.Title id="modal-lihat-data">
                    Detail Karyawan
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form noValidate>
                    <Row>
                      <Col>
                        <Form.Label className={"font-weight-bold"}>
                          Data Pribadi
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor Induk Karyawan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.EmployeeIdentity}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nama Depan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.Firstname}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nama Belakang</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.Lastname}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor KTP</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.CitizenshipIdentity}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Jenis Kelamin</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedGender?.label}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Golongan Darah</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.BloodType}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Agama</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.Religion}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tempat Lahir</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.PlaceOfBirth}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tanggal Lahir</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.DateOfBirth
                            ? moment(
                              this.state.selectedEmployee.DateOfBirth
                            ).format("DD-MM-YYYY")
                            : ""}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Alamat Lengkap</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.Address}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Kota</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.City}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor Telepon</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.PhoneNumber}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Sosial Media</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.SocialMedia}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Pendidikan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Form.Label>
                              {this.state.selectedEmployee.Education}
                            </Form.Label>
                          </Col>
                          <Col>
                            <Form.Label>
                              {this.state.selectedEmployee.Specialization}
                            </Form.Label>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Asal Sekolah</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.School}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status Perkawinan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Form.Label>
                              {this.state.selectedEmployee.MaritalStatus}
                            </Form.Label>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Wali</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Form.Label>
                              {this.state.selectedEmployee.Trustee}
                            </Form.Label>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Keluarga</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Form.Label>
                              {this.state.selectedEmployee.FamilyMember}
                            </Form.Label>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Anak</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Form.Label>
                              {this.state.selectedEmployee.ChildNumber}
                            </Form.Label>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row style={{ margin: "10px" }}></Row>
                    <Row>
                      <Col>
                        <Form.Label className={"font-weight-bold"}>
                          Data Karyawan
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Unit</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>{this.state.selectedEmployee.UnitName}</Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Seksi</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Form.Label>
                              {this.state.selectedEmployee.SectionName}
                            </Form.Label>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Grup</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Form.Label>
                              {this.state.selectedEmployee.GroupName}
                            </Form.Label>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Jabatan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Form.Label>
                              {this.state.selectedEmployee.Position}
                            </Form.Label>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Grade</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Form.Label>
                              {this.state.selectedEmployee.EmployeeGrade}
                            </Form.Label>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Golongan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>{this.state.selectedEmployee.EmploymentClass}</Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status Kepegawaian</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <Form.Label>
                              {this.state.selectedEmployee.EmploymentStatus}
                            </Form.Label>
                          </Col>
                          <Col sm={2}>
                            <Form.Label>Kontrak ke-</Form.Label>
                          </Col>
                          <Col sm={4}>
                            <Form.Label>
                              {this.state.selectedEmployee.ContractNumber}
                            </Form.Label>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    {this.state.selectedEmployee.EmploymentStatus == "TETAP" ? (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Tanggal Penetapan</Form.Label>
                        </Col>
                        <Col>
                          <Form.Label>
                            {this.state.selectedEmployee.AssignmentDate
                              ? moment(
                                this.state.selectedEmployee.AssignmentDate
                              ).format("DD-MM-YYYY")
                              : ""}
                          </Form.Label>
                        </Col>
                      </Row>
                    ) : null}

                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tanggal Bergabung</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.JoinDate
                            ? moment(
                              this.state.selectedEmployee.JoinDate
                            ).format("DD-MM-YYYY")
                            : ""}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tanggal Pensiun</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.RetirementDate
                            ? moment(
                              this.state.selectedEmployee.RetirementDate
                            ).format("DD-MM-YYYY")
                            : ""}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Mulai Kontrak</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col sm={5}>
                            <Form.Label>
                              {this.state.selectedEmployee.BeginContractDate
                                ? moment(
                                  this.state.selectedEmployee
                                    .BeginContractDate
                                ).format("DD-MM-YYYY")
                                : ""}
                            </Form.Label>
                          </Col>
                          <Col sm={2} className={"text-center"}>
                            s/d
                          </Col>
                          <Col sm={5}>
                            <Form.Label>
                              {this.state.selectedEmployee.EndContractDate
                                ? moment(
                                  this.state.selectedEmployee.EndContractDate
                                ).format("DD-MM-YYYY")
                                : ""}
                            </Form.Label>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Perpanjangan</Form.Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col sm={5}>
                            <Form.Label>
                              {this.state.selectedEmployee
                                .BeginContractExtensionDate
                                ? moment(
                                  this.state.selectedEmployee
                                    .BeginContractExtensionDate
                                ).format("DD-MM-YYYY")
                                : ""}
                            </Form.Label>
                          </Col>
                          <Col sm={2} className={"text-center"}>
                            s/d
                          </Col>
                          <Col sm={5}>
                            <Form.Label>
                              {this.state.selectedEmployee
                                .EndContractExtensionDate
                                ? moment(
                                  this.state.selectedEmployee
                                    .EndContractExtensionDate
                                ).format("DD-MM-YYYY")
                                : ""}
                            </Form.Label>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor KPJ</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.JPKNo}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor Rekening</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.AccountNo}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Nomor NPWP</Form.Label>
                      </Col>
                      <Col>
                        <NumberFormat
                          customInput={Form.Control}
                          defaultValue={"000000000000000"}
                          name="NPWPNo"
                          value={this.state.selectedEmployee.NPWPNo}
                          displayType="text"
                          isNumericString={true}
                          onValueChange={(val) => {
                            var { selectedEmployee } = this.state;
                            selectedEmployee["NPWPNo"] = val.value;
                            return this.setState({
                              selectedEmployee: selectedEmployee,
                            });
                          }}
                          format="##.###.###.#-###.###"
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Lokasi CheckIn</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedLocation?.Name}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Upah Pokok</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.BaseSalary}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tunjangan Tetap Makan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.MealAllowance}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Tunjangan Leader</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.LeaderAllowance}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Premi Prestasi</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.AchievementBonus}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Penerimaan Per Bulan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.GrossIncome}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>BPJS Kesehatan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.BpjsKesehatan
                            ? "YA"
                            : "TIDAK"}
                        </Form.Label>
                      </Col>
                    </Row>
                    {this.state.selectedEmployee.BpjsKesehatan ? (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Persentase BPJS Kesehatan</Form.Label>
                        </Col>
                        <Col>
                          <Form.Label>
                            {
                              this.state.selectedEmployee
                                .BpjsKesehatanPercentage
                            }
                          </Form.Label>
                        </Col>
                      </Row>
                    ) : null}
                    <Row>
                      <Col sm={4}>
                        <Form.Label>BPJS Ketenagakerjaan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.BpjsKetenagakerjaan}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status PPh</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedStatusPph?.Status || ""}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Hari Kerja</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.WorkDays}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Koperasi</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.IsWorkerUnion
                            ? "YA"
                            : "TIDAK"}
                        </Form.Label>
                      </Col>
                    </Row>
                    {this.state.selectedEmployee.StatusEmployee === "MUTATED" && (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Mutasi Ke</Form.Label>
                        </Col>
                        <Col>
                          <Form.Label>
                            {this.state.mutationLogs[0]?.MutationTo}
                          </Form.Label>
                        </Col>
                      </Row>
                    )}
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status Karyawan</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.StatusEmployee}
                        </Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Fitur</Form.Label>
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="CanAccessQRCode"
                          label="Absensi QR Code"
                          checked={this.state.selectedEmployee.CanAccessQRCode}
                          className="form-check-input"
                          disabled
                        />
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="CanAccessResetPassword"
                          label="Reset Password"
                          checked={
                            this.state.selectedEmployee.CanAccessResetPassword
                          }
                          className="form-check-input"
                          disabled
                        />
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="IsCanApproveRequestLeave"
                          label="Approve Request Cuti"
                          checked={
                            this.state.selectedEmployee.IsCanApproveRequestLeave
                          }
                          className="form-check-input"
                          disabled
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={4}>
                        <Form.Label></Form.Label>
                      </Col>
                      <Col>
                        <Form.Check
                          type="checkbox"
                          name="IsCanApproveRequestWfh"
                          label="Approve Request WFH"
                          checked={
                            this.state.selectedEmployee.IsCanApproveRequestWfh
                          }
                          className="form-check-input"
                          disabled
                        />
                      </Col>
                    </Row>
                    {this.state.selectedEmployee["StatusEmployee"] &&
                      this.state.selectedEmployee["StatusEmployee"] ===
                      "MUTATED" ? (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Tanggal Mutasi</Form.Label>
                        </Col>
                        <Col>
                          <Form.Label>
                            {this.state.selectedEmployee.DateMutation
                              ? moment(
                                this.state.selectedEmployee.DateMutation
                              ).format("DD-MM-YYYY")
                              : ""}
                          </Form.Label>
                        </Col>
                      </Row>
                    ) : (
                      <Row></Row>
                    )}

                    {this.state.selectedStatusEmployee &&
                      this.state.selectedStatusEmployee.value ===
                      "TIDAK AKTIF" ? (
                      <Row>
                        <Col sm={4}>
                          <Form.Label>Keterangan</Form.Label>
                        </Col>
                        <Col>
                          <Form.Label>
                            {this.state.selectedEmployee.EmployeeStatusRemark}
                          </Form.Label>
                        </Col>
                      </Row>
                    ) : (
                      <Row></Row>
                    )}
                    <Row>
                      <Col sm={4}>
                        <Form.Label>Status Registrasi</Form.Label>
                      </Col>
                      <Col>
                        <Form.Label>
                          {this.state.selectedEmployee.IsClaimed
                            ? "Sudah Terdaftar"
                            : "Belum Terdaftar"}
                        </Form.Label>
                      </Col>
                    </Row>
                    {(this.state.selectedEmployee.StatusEmployee === "AKTIF" ||
                      this.state.selectedEmployee.StatusEmployee === null) && (
                        this.state.mutationLogs.length > 0 &&
                        <Row style={{ marginTop: 10 }}>
                          <Col>
                            <Card>
                              <CardHeader>
                                <Row>
                                  <Col>
                                    <i className="fa fa-user" />{" "}
                                    <b>&nbsp;Riwayat Mutasi</b>
                                  </Col>
                                </Row>
                              </CardHeader>
                              <CardBody>
                                <RiwayatMutasi
                                  data={this.state.mutationLogs}
                                ></RiwayatMutasi>
                              </CardBody>
                            </Card>
                          </Col>
                        </Row>
                      )}

                    <Row>
                      <Col>
                        <Card>
                          <CardHeader>
                            <Row>
                              <Col>
                                <i className="fa fa-user" />{" "}
                                <b>&nbsp;Daftar Training</b>
                              </Col>
                            </Row>
                          </CardHeader>
                          <CardBody>
                            <ViewTable data={this.state.trainings}></ViewTable>
                          </CardBody>
                        </Card>
                      </Col>
                    </Row>
                  </Form>
                </Modal.Body>
                <Modal.Footer></Modal.Footer>
              </Modal>

              <Modal
                aria-labelledby="modal-restore-mutation"
                show={this.state.isShowRestoreMutationModal}
                onHide={() => this.showRestoreMutationModal(false)}
                animation={true}
              >
                <Modal.Header closeButton>
                  <Modal.Title id="modal-restore-mutation">
                    Restore Mutasi Data Karyawan
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Apakah anda yakin ingin mengembalikan mutasi data{" "}
                  {this.state.selectedEmployee.Name}?
                </Modal.Body>
                <Modal.Footer>
                  {this.state.restoreMutationLoading ? (
                    <span>
                      <Spinner size="sm" color="primary" /> Mohon tunggu...
                    </span>
                  ) : (
                    <div>
                      <Button
                        className="btn btn-default"
                        name="delete-employee"
                        onClick={this.restoreMutationClickHandler}
                      >
                        Restore Mutasi
                      </Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>

              <Modal
                aria-labelledby="modal-delete-data"
                show={this.state.isShowDeleteEmployeeModal}
                onHide={() => this.showDeleteEmployeeModal(false)}
                animation={true}
              >
                <Modal.Header closeButton>
                  <Modal.Title id="modal-delete-data">
                    Hapus Data Karyawan
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Apakah anda yakin ingin menghapus data{" "}
                  {this.state.selectedEmployee.Name}?
                </Modal.Body>
                <Modal.Footer>
                  {this.state.deleteEmployeeLoading ? (
                    <span>
                      <Spinner size="sm" color="primary" /> Mohon tunggu...
                    </span>
                  ) : (
                    <div>
                      <Button
                        className="btn btn-danger"
                        name="delete-employee"
                        onClick={this.deleteEmployeeClickHandler}
                      >
                        Hapus
                      </Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>
            </Row>
          )}
        </div>
      </div>
    );
  }
}

export default List;
