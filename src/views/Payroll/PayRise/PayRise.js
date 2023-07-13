import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';
import * as CONST from '../../../Constant';
import Service from './Service';
import MasterService from '../../Master/Service';
import AttendanceService from '../../Attendance/Service';
import PayrollService from './../Service';
import swal from 'sweetalert';
import axios from 'axios';
import './style.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import id from 'date-fns/locale/id';

const moment = require('moment/min/moment-with-locales');

//moment.locale('id')

var fileDownload = require('js-file-download');
const minimumDate = new Date(1945, 8, 17);
const Kompetensi_Dasar = "Kompetensi Dasar";
const Kompetensi_Managerial = "Kompetensi Managerial";
const Kompetensi_Teknis = "Kompetensi Teknis";
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";

class PayRise extends Component {

    state = {
        loading: false,
        typeaheadEmployeeSearchForm: {},
        typeaheadEmployee: {},
        activePage: 1,
        total: 0,
        size: 10,
        loadingData: false,
        tableData: [],
        selectedUnit: null,
        selectedEmploymentClass: null,
        selectedPeriod: null,
        selectedItem: null,
        Items: [
            { Ranking: "Upah Pokok", OldValue: 0, RiseValue: 0, Total: 0 },
            { Ranking: "Tunjangan Prestasi", OldValue: 0, RiseValue: 0, Total: 0 },
            { Ranking: "Upah Makan", OldValue: 0, RiseValue: 0, Total: 0 },
            { Ranking: "Tunjangan Jabatan", OldValue: 0, RiseValue: 0, Total: 0 },
        ],
        form: {
            ItemTotal: 0
        },
        selectedEmployee: [],
        isCreateLoading: false,
        isShowAddModal: false,
        employees: [],
        isShowDeleteModal: false,

        isDeleteLoading: false,
        isShowViewModal: false,
        isShowEditModal: false,
        isEditLoading: false,

        isShowUploadModal: false,
        selectedFile: null,
        bpjsLoader: [],
        validationCreateForm: {},
        validationSearch: {},
        keyword: "",
        units: [],
        isAutoCompleteLoading: false,
        rankingItems: [],
        employmentClasses: [],
        userUnitId: localStorage.getItem("unitId"),
        userAccessRole: localStorage.getItem("accessRole"),
        otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),
        uploadFileLoading: false
    }

    resetModalValue = () => {
        this.setState({
            validationCreateForm: {},
            form: {
                ItemTotal: 0
            },
            selectedEmployee: [],
            Items: [
                { Ranking: "Upah Pokok", OldValue: 0, RiseValue: 0, Total: 0 },
                { Ranking: "Tunjangan Prestasi", OldValue: 0, RiseValue: 0, Total: 0 },
                { Ranking: "Upah Makan", OldValue: 0, RiseValue: 0, Total: 0 },
                { Ranking: "Tunjangan Jabatan", OldValue: 0, RiseValue: 0, Total: 0 },
            ],
            rankingItems: []
        })
    }

    resetModalValueCreate = () => {
        var form = {};
        form.Period = this.state.form?.Period;
        form.UnitId = this.state.form?.UnitId;
        form.UnitName = this.state.form?.UnitName;
        form.Unit = this.state.form?.Unit;
        form.RankingItem = null;
        var Items = [
            { Ranking: "Upah Pokok", OldValue: 0, RiseValue: 0, Total: 0 },
            { Ranking: "Tunjangan Prestasi", OldValue: 0, RiseValue: 0, Total: 0 },
            { Ranking: "Upah Makan", OldValue: 0, RiseValue: 0, Total: 0 },
            { Ranking: "Tunjangan Jabatan", OldValue: 0, RiseValue: 0, Total: 0 },
        ]
        form.ItemTotal = Items.reduce((a, b) => +a + +b.Total, 0);
        this.setState({
            validationCreateForm: {},
            form: form,
            selectedEmployee: [],
            Items: Items,
            rankingItems: []
        })
    }

    resetPagingConfiguration = () => {
        this.setState({
            activePage: 1,
            size: 10,
            selectedUnit: null,
            selectedSection: null,
            selectedGroup: null,
            selectedEmploymentClass: null,
            selectedPeriod: null,
            selectedSearchEmployee: null,
            validationSearch: {},

        });
        var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm.getInstance()
        instanceEmployeeSearch.clear();
    }

    constructor(props) {
        super(props);
        this.service = new Service();
        this.payrollService = new PayrollService();
        this.attendanceService = new AttendanceService();
        this.masterService = new MasterService();
    }

    componentDidMount() {
        this.setData();
        this.setUnit();
        this.setGroups();
        this.setSections();
        this.setEmploymentClass();
    }

    setUnit = () => {
        const params = {
            page: 1,
            size: 2147483647
        };

        this.setState({ loadingData: true })
        this.payrollService
            .getAllUnits()
            .then((result) => {
                var units = [];

                result.map(s => {
                    if ((this.state.userAccessRole == PERSONALIA_BAGIAN || this.state.userAccessRole == PIMPINAN || this.state.userAccessRole == UPAH)
                        && (this.state.otherUnitId.includes(s.Id))) {
                        units.push(s);
                    } else if (this.state.userAccessRole == PERSONALIA_PUSAT) {
                        units.push(s);
                    }
                });
                this.setState({ units: units, loading: false })

            });
    }

    setGroups = () => {
        this.setState({ loading: true })
        this.payrollService
            .getAllGroups()
            .then((result) => {
                this.setState({ groups: result, loading: false })
            });
    }

    setSections = () => {
        this.setState({ loading: true })
        this.payrollService
            .getAllSections()
            .then((result) => {
                this.setState({ sections: result, loading: false })
            });
    }

    setEmploymentClass = () => {
        this.setState({ loading: true })
        this.payrollService
            .getAllEmploymentClasses()
            .then((result) => {
                this.setState({ employmentClasses: result, loading: false })
            });
    }

    setGroupsBySection = (sectionId) => {
        // this.setState({ loading: true })
        this.payrollService
            .getAllGroupsBySectionId(sectionId)
            .then((result) => {
                var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm.getInstance();
                instanceEmployeeSearch.clear();
                this.setState({ groups: result, selectedGroup: null, loading: false })
            });
    }

    setSectionsByUnit = (unitId) => {
        // this.setState({ loading: true })
        this.payrollService
            .getAllSectionsByUnitId(unitId)
            .then((result) => {
                var instanceEmployeeSearch = this.typeaheadEmployeeSearchForm.getInstance();
                instanceEmployeeSearch.clear();
                this.setState({ sections: result, selectedSection: null, selectedGroup: null, loading: false })
            });
    }

    setRanking = () => {
        const params = {
            period: this.state.form?.Period ? moment.utc(this.state.form?.Period).format() : null,
            unitId: this.state.form?.UnitId,
            employmentClass: this.state.form?.EmploymentClass
        };

        this.setState({ loadingData: true })
        this.masterService
            .getRankingItems(params)
            .then((result) => {
                this.setState({ rankingItems: result, loadingData: false })
            });
    }


    handleEmployeeFilter = (query) => {
        this.setState({ isAutoCompleteLoading: true });

        const params = {
            unitId: this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
            groupId: this.state.selectedGroup ? this.state.selectedGroup.Id : 0,
            sectionId: this.state.selectedSection ? this.state.selectedSection.Id : 0,
            keyword: query,
            statusEmployee: "AKTIF",
        }

        this.attendanceService
            .searchEmployee(params)
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

    handleEmployeeSearchModal = (query) => {
        this.setState({ isAutoCompleteLoading: true });

        const params = {
            keyword: query,
            statusEmployee: "AKTIF",
            unitId: this.state.form?.UnitId
        }

        this.attendanceService
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

    setData = () => {
        const params = {
            page: this.state.activePage,
            size: this.state.size,
            keyword: this.state.keyword,
            unitId: this.state.selectedUnit?.Id,
            groupId: this.state.selectedGroup?.Id,
            sectionId: this.state.selectedSection?.Id,
            employeeId: this.state.selectedSearchEmployee?.Id,
            employmentClass: this.state.selectedEmploymentClass?.label,
            period: this.state.selectedPeriod ? moment.utc(this.state.selectedPeriod).format() : null,
            adminEmployeeId: Number(localStorage.getItem("employeeId"))
        };

        this.setState({ loadingData: true })
        this.service
            .search(params)
            .then((result) => {
                this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false, validationSearch: {} })
            });
    }

    create = () => {
        this.showAddModal(true);
    }

    upload = () => {
        this.showUploadModal(true);
    }

    showUploadModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowUploadModal: value });
    }

    showAddModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddModal: value, validationCreateForm: {} });
    }

    showDeleteModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeleteModal: value });
    }

    showViewModal = (value) => {
        if (!value)
            this.resetModalValue();
        this.setState({ isShowViewModal: value, validationCreateForm: {} });
    }

    showEditModal = (value) => {
        if (!value)
            this.resetModalValue();
        this.setState({ isShowEditModal: value, validationCreateForm: {} });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreate = () => {
        const payload = {
            Period: this.state.form?.Period,
            UnitId: this.state.form?.UnitId,
            UnitName: this.state.form?.UnitName,
            SectionId: this.state.form?.SectionId,
            SectionName: this.state.form?.SectionName,
            GroupId: this.state.form?.GroupId,
            GroupName: this.state.form?.GroupName,
            EmployeeId: this.state.form?.EmployeeId,
            EmployeeIdentity: this.state.form?.EmployeeIdentity,
            EmployeeName: this.state.form?.EmployeeName,
            EmploymentClass: this.state.form?.EmploymentClass,
            RankingItemId: this.state.form?.RankingItemId,
            RankingItemName: this.state.form?.RankingItemName,
            ItemTotal: this.state.form?.ItemTotal,
            PayRiseItems: this.state.Items
        }

        this.setState({ isCreateLoading: true });
        this.service.create(payload)
            .then((result) => {
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil disimpan!'
                })
                this.setState({ isCreateLoading: false }, () => {

                    this.resetModalValueCreate();
                    // this.clearItems();
                    // this.resetPagingConfiguration();
                    // this.setData();
                    // this.showAddModal(false);
                });
            })
            .catch((error) => {
                if (error.response) {
                    let message = "Cek Form Isian, Isian Mandatory tidak boleh kosong\n";

                    const errorMessage = error.response.data.error
                    Object.keys(errorMessage).forEach(e => {
                        if (e && typeof errorMessage[e] == "string") {
                            message += `- ${errorMessage[e]}\n`
                        }
                    });

                    swal({
                        icon: 'error',
                        title: 'Data Invalid',
                        text: message
                    });

                    this.setState({ validationCreateForm: error.response.data.error, isCreateLoading: false });
                }
            });
    }

    handleEdit = () => {
        const payload = {
            Id: this.state.form?.Id,
            Period: this.state.form?.Period,
            UnitId: this.state.form?.UnitId,
            UnitName: this.state.form?.UnitName,
            SectionId: this.state.form?.SectionId,
            SectionName: this.state.form?.SectionName,
            GroupId: this.state.form?.GroupId,
            GroupName: this.state.form?.GroupName,
            EmployeeId: this.state.form?.EmployeeId,
            EmployeeIdentity: this.state.form?.EmployeeIdentity,
            EmployeeName: this.state.form?.EmployeeName,
            EmploymentClass: this.state.form?.EmploymentClass,
            RankingItemId: this.state.form?.RankingItemId,
            RankingItemName: this.state.form?.RankingItemName,
            ItemTotal: this.state.form?.ItemTotal,
            PayRiseItems: this.state.Items
        }

        this.setState({ isEditLoading: true });
        this.service.edit(this.state.selectedItem?.Id, payload)
            .then((result) => {
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil diubah!'
                })
                this.setState({ isEditLoading: false }, () => {

                    this.resetModalValue();
                    this.resetPagingConfiguration();
                    this.setData();
                    this.showEditModal(false);
                });
            })
            .catch((error) => {
                if (error.response) {
                    let message = "Cek Form Isian, Isian Mandatory tidak boleh kosong\n";

                    const errorMessage = error.response.data.error

                    Object.keys(errorMessage).forEach(e => {
                        if (e && typeof errorMessage[e] == "string") {
                            message += `- ${errorMessage[e]}\n`
                        }
                    });

                    swal({
                        icon: 'error',
                        title: 'Data Invalid',
                        text: message
                    });

                    this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
                }
            });
    }

    search = () => {
        this.setState({ activePage: 1 }, () => {
            this.setData();
        })
    }

    handleViewClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getById(item.Id)
            .then((data) => {
                var selectedEmployee = [
                    {
                        Id: data.EmployeeId,
                        EmployeeIdentity: data.EmployeeIdentity,
                        EmployeeClass: data.EmploymentClass,
                        Name: data.EmployeeName,
                        SectionId: data.SectionId,
                        Section: data.SectionName,
                        GroupId: data.GroupId,
                        Group: data.GroupName,
                        NameAndEmployeeIdentity: `${data.EmployeeIdentity} - ${data.EmployeeName}`
                    }
                ];

                data.Period = new Date(data.Period);
                data.Unit = {
                    Id: data.UnitId,
                    Name: data.UnitName,
                    value: data.UnitId,
                    label: data.UnitName
                };

                data.RankingItem = {
                    Id: data.RankingItemId,
                    RankingName: data.RankingItemName,
                    label: data.RankingItemName,
                    value: data.RankingItemId
                }
                this.setState({ form: data, Items: data.PayRiseItems, selectedEmployee: selectedEmployee }, () => {
                    this.setRanking();
                    this.showViewModal(true);
                })
            })
    }

    handleEditClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getById(item.Id)
            .then((data) => {
                var selectedEmployee = [
                    {
                        Id: data.EmployeeId,
                        EmployeeIdentity: data.EmployeeIdentity,
                        EmployeeClass: data.EmploymentClass,
                        Name: data.EmployeeName,
                        SectionId: data.SectionId,
                        Section: data.SectionName,
                        GroupId: data.GroupId,
                        Group: data.GroupName,
                        NameAndEmployeeIdentity: `${data.EmployeeIdentity} - ${data.EmployeeName}`
                    }
                ];

                data.Period = new Date(data.Period);
                data.Unit = {
                    Id: data.UnitId,
                    Name: data.UnitName,
                    value: data.UnitId,
                    label: data.UnitName
                };

                data.RankingItem = {
                    Id: data.RankingItemId,
                    RankingName: data.RankingItemName,
                    label: data.RankingItemName,
                    value: data.RankingItemId
                }

                this.setState({ form: data, Items: data.PayRiseItems, selectedEmployee: selectedEmployee }, () => {
                    this.setRanking();
                    this.showEditModal(true);
                })
            })
    }

    handleDeleteClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeleteModal(true);
        })
    }

    deleteClickHandler = () => {
        this.setState({ isDeleteLoading: true })
        this.service.delete(this.state.selectedItem?.Id)
            .then((result) => {
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteLoading: false, selectedItem: null }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteModal(false);
                });
            })
    }

    clearPeriod = () => {
        var { form, Items } = this.state;
        for (var item of Items) {
            item.RiseValue = 0;
            item.Total = item.OldValue + item.RiseValue;

        }
        form.ItemTotal = Items.reduce((a, b) => +a + +b.Total, 0);
        this.setState({ Items: Items, form: form });
    }

    clearItems = () => {
        var { Items, form } = this.state;
        Items = [
            { Ranking: "Upah Pokok", OldValue: 0, RiseValue: 0, Total: 0 },
            { Ranking: "Tunjangan Prestasi", OldValue: 0, RiseValue: 0, Total: 0 },
            { Ranking: "Upah Makan", OldValue: 0, RiseValue: 0, Total: 0 },
            { Ranking: "Tunjangan Jabatan", OldValue: 0, RiseValue: 0, Total: 0 },
        ]
        form.ItemTotal = Items.reduce((a, b) => +a + +b.Total, 0);
        this.setState({ Items: Items, form: form });
    }

    changeEmployeeItems = (employee) => {
        var { Items, form } = this.state;
        Items = [
            { Ranking: "Upah Pokok", OldValue: employee?.BaseSalary ?? 0, RiseValue: 0, Total: employee?.BaseSalary ?? 0 },
            { Ranking: "Tunjangan Prestasi", OldValue: employee?.AchievementBonus ?? 0, RiseValue: 0, Total: employee?.AchievementBonus ?? 0 },
            { Ranking: "Upah Makan", OldValue: employee?.MealAllowance ?? 0, RiseValue: 0, Total: employee?.MealAllowance ?? 0 },
            { Ranking: "Tunjangan Jabatan", OldValue: employee?.LeaderAllowance ?? 0, RiseValue: 0, Total: employee?.LeaderAllowance ?? 0 },
        ]
        form.ItemTotal = Items.reduce((a, b) => +a + +b.Total, 0);
        this.setState({ Items: Items, form: form });
    }

    changeRankingItems = (ranking) => {
        var { form, Items } = this.state;
        for (var item of Items) {
            if (item.Ranking == "Upah Pokok") {
                item.RiseValue = ranking.BaseSalary;
                item.Total = item.OldValue + item.RiseValue;
            }
            else if (item.Ranking == "Tunjangan Prestasi") {
                item.RiseValue = ranking.PerformanceAllowance;
                item.Total = item.OldValue + item.RiseValue;
            }
            else if (item.Ranking == "Upah Makan") {
                item.RiseValue = ranking.MealAllowance;
                item.Total = item.OldValue + item.RiseValue;
            }
            else if (item.Ranking == "Tunjangan Jabatan") {
                item.RiseValue = ranking.PositionalAllowance;
                item.Total = item.OldValue + item.RiseValue;
            }
        }
        form.ItemTotal = Items.reduce((a, b) => +a + +b.Total, 0);
        this.setState({ Items: Items, form: form });
    }

    numberFormat = (value) => {
        return new Intl.NumberFormat('id-ID').format(value);
    }

    downloadBlangko = () => {
        this.setState({ validationSearch: {} });

        var validation = {};
        var isValid = true;
        if (!this.state.selectedUnit) {
            isValid = false;
            validation.SelectedUnit = "Unit Harus Diisi";
        }

        if (!this.state.selectedSection) {
            isValid = false;
            validation.SelectedSection = "Seksi Harus Diisi";
        }

        if (!this.state.selectedGroup) {
            isValid = false;
            validation.SelectedGroup = "Group Harus Diisi";
        }

        if (!this.state.selectedPeriod) {
            isValid = false;
            validation.SelectedPeriod = "Periode Harus Diisi";
        }

        if (isValid) {
            this.fileDownloadBlanko();
        } else {
            this.setState({ validationSearch: validation });
        }
    }

    fileDownloadBlanko = () => {
        this.setState({ loadingData: true })

        let query = '';
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));

        if (this.state.selectedPeriod) {
            if (query === '') {
                query = `period=${moment.utc(this.state.selectedPeriod).format()}`
            } else {
                query = `${query}&period=${moment.utc(this.state.selectedPeriod).format()}`
            }
        }

        if (this.state.selectedUnit) {
            if (query === '') {
                query = `unitId=${this.state.selectedUnit.Id}`
            } else {
                query = `${query}&unitId=${this.state.selectedUnit.Id}`
            }
        }

        if (this.state.selectedSection) {
            if (query === '') {
                query = `sectionId=${this.state.selectedSection.Id}`
            } else {
                query = `${query}&sectionId=${this.state.selectedSection.Id}`
            }
        }

        if (this.state.selectedGroup) {
            if (query === '') {
                query = `groupId=${this.state.selectedGroup.Id}`
            } else {
                query = `${query}&groupId=${this.state.selectedGroup.Id}`
            }
        }

        if (query !== '') {
            query = `?${query}&adminEmployeeId=${adminEmployeeId}`
        }

        if (query === '') {
            query = `?adminEmployeeId=${adminEmployeeId}`
        }

        const value = localStorage.getItem('token');
        const Header = { accept: 'application/json', Authorization: `Bearer ` + value, 'x-timezone-offset': moment().utcOffset() / 60 };

        axios({
            method: 'get',
            url: CONST.URI_ATTENDANCE + "pay-rises/download/blanko" + query,
            responseType: 'blob',
            headers: Header,
        }).then(data => {
            console.log(data)
            let disposition = data.headers['content-disposition']
            let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])

            fileDownload(data.data, filename);
            this.setState({ loading: false, loadingData: false, validationSearch: {} });
        }).catch(err => {
            console.log(err);
            this.setState({ loading: false, loadingData: false, validationSearch: {} });
        });
    }


    downloadIncrementList = () => {
        this.setState({ validationSearch: {} });

        var validation = {};
        var isValid = true;
        if (!this.state.selectedUnit) {
            isValid = false;
            validation.SelectedUnit = "Unit Harus Diisi";
        }

        if (!this.state.selectedSection) {
            isValid = false;
            validation.SelectedSection = "Seksi Harus Diisi";
        }

        if (!this.state.selectedGroup) {
            isValid = false;
            validation.SelectedGroup = "Group Harus Diisi";
        }

        if (!this.state.selectedPeriod) {
            isValid = false;
            validation.SelectedPeriod = "Periode Harus Diisi";
        }

        if (isValid) {
            this.fileDownloadList();
        } else {
            this.setState({ validationSearch: validation });
        }
    }

    fileDownloadList = () => {
        this.setState({ loadingData: true })

        let query = '';
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));

        if (this.state.selectedPeriod) {
            if (query === '') {
                query = `period=${moment.utc(this.state.selectedPeriod).format()}`
            } else {
                query = `${query}&period=${moment.utc(this.state.selectedPeriod).format()}`
            }
        }

        if (this.state.selectedUnit) {
            if (query === '') {
                query = `unitId=${this.state.selectedUnit.Id}`
            } else {
                query = `${query}&unitId=${this.state.selectedUnit.Id}`
            }
        }

        if (this.state.selectedSection) {
            if (query === '') {
                query = `sectionId=${this.state.selectedSection.Id}`
            } else {
                query = `${query}&sectionId=${this.state.selectedSection.Id}`
            }
        }

        if (this.state.selectedGroup) {
            if (query === '') {
                query = `groupId=${this.state.selectedGroup.Id}`
            } else {
                query = `${query}&groupId=${this.state.selectedGroup.Id}`
            }
        }

        if (query !== '') {
            query = `?${query}&adminEmployeeId=${adminEmployeeId}`
        }

        if (query === '') {
            query = `?adminEmployeeId=${adminEmployeeId}`
        }

        const value = localStorage.getItem('token');
        const Header = { accept: 'application/json', Authorization: `Bearer ` + value, 'x-timezone-offset': moment().utcOffset() / 60 };

        axios({
            method: 'get',
            url: CONST.URI_ATTENDANCE + "pay-rises/download/report" + query,
            responseType: 'blob',
            headers: Header,
        }).then(data => {
            console.log(data)
            let disposition = data.headers['content-disposition']
            let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])

            fileDownload(data.data, filename);
            this.setState({ loading: false, loadingData: false, validationSearch: {} });
        }).catch(err => {
            console.log(err);
            this.setState({ loading: false, loadingData: false, validationSearch: {} });
        });
    }

    downloadIncrementRecap = () => {
        this.setState({ validationSearch: {} });

        var validation = {};
        var isValid = true;
        if (!this.state.selectedUnit) {
            isValid = false;
            validation.SelectedUnit = "Unit Harus Diisi";
        }

        if (!this.state.selectedPeriod) {
            isValid = false;
            validation.SelectedPeriod = "Periode Harus Diisi";
        }

        if (isValid) {
            this.fileDownloadRecap();

        } else {
            this.setState({ validationSearch: validation });
        }
    }

    fileDownloadRecap = () => {
        this.setState({ loadingData: true })

        let query = '';

        if (this.state.selectedPeriod) {
            if (query === '') {
                query = `period=${moment.utc(this.state.selectedPeriod).format()}`
            } else {
                query = `${query}&period=${moment.utc(this.state.selectedPeriod).format()}`
            }
        }

        if (this.state.selectedUnit) {
            if (query === '') {
                query = `unitId=${this.state.selectedUnit.Id}`
            } else {
                query = `${query}&unitId=${this.state.selectedUnit.Id}`
            }
        }

        if (query !== '') {
            query = `?${query}`
        }

        const value = localStorage.getItem('token');
        const Header = { accept: 'application/json', Authorization: `Bearer ` + value, 'x-timezone-offset': moment().utcOffset() / 60 };

        axios({
            method: 'get',
            url: CONST.URI_ATTENDANCE + "pay-rises/download/recapitulation" + query,
            responseType: 'blob',
            headers: Header,
        }).then(data => {
            console.log(data)
            let disposition = data.headers['content-disposition']
            let filename = decodeURI(disposition.match(/filename="(.*)"/)[1])

            fileDownload(data.data, filename);
            this.setState({ loading: false, loadingData: false, validationSearch: {} });
        }).catch(err => {
            console.log(err);
            this.setState({ loading: false, loadingData: false, validationSearch: {} });
        });
    }

    onFileUploadChangeHandler = (event) => {
        this.setState({ selectedFile: event.target.files[0] });
    };

    uploadClickHandler = () => {
        this.setState({ uploadFileLoading: true });

        var data = new FormData();
        data.append("file", this.state.selectedFile);

        const url = `${CONST.URI_ATTENDANCE}pay-rises/upload`;
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
                            - ${result.RecordUpdated} Baris diubah
                            `;
                swal({
                    icon: "success",
                    title: "Good...",
                    text: message,
                });

                this.setState({ uploadFileLoading: false, activePage: 1, page: 1 });
                this.showUploadModal(false);
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
                <tr key={item.Id} data-category={item.Id}>
                    <td>{item.UnitName}</td>
                    <td>{moment(item.Period).format('MMMM YYYY')}</td>
                    <td>{item.EmployeeName}</td>
                    <td>{item.EmployeeIdentity}</td>
                    <td>{item.RankingItemName}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-success" name="view-compentencies" onClick={this.handleViewClick} data={item} iconClassName="fa fa-eye" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-primary" name="edit-compentencies" onClick={this.handleEditClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-compentencies" onClick={this.handleDeleteClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
                            </FormGroup>
                        </Form>
                    </td>
                </tr>
            );
        });

        var { Items } = this.state;
        var masterItems = Items.map((item, index) => {
            return (
                <tr key={index} data-category={item.Id}>
                    <td>
                        {item.Ranking}
                    </td>
                    <td>
                        {this.numberFormat(item.OldValue.toFixed(2))}
                    </td>
                    <td>
                        {this.numberFormat(item.RiseValue.toFixed(2))}
                    </td>
                    <td>
                        {this.numberFormat(item.Total.toFixed(2))}
                    </td>
                </tr>
            );
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
                                    <FormLabel>Unit</FormLabel>
                                </Col>
                                <Col sm={4}>
                                    <Select
                                        placeholder={'pilih unit'}
                                        isClearable={true}
                                        options={this.state.units}
                                        value={this.state.selectedUnit}
                                        onChange={(value) => {
                                            if (value != null) {
                                                this.setSectionsByUnit(value.Id);
                                            }
                                            this.setState({ selectedUnit: value });
                                        }} />
                                    <span className="text-danger">
                                        <small>
                                            {this.state.validationSearch.SelectedUnit}
                                        </small>
                                    </span>
                                </Col>
                            </Row>

                            <Row>
                                <Col sm={1} className={'text-right'}>
                                    <FormLabel>Seksi</FormLabel>
                                </Col>
                                <Col sm={4}>
                                    <Select
                                        placeholder={'pilih seksi'}
                                        isClearable={true}
                                        options={this.state.sections}
                                        value={this.state.selectedSection}
                                        onChange={(value) => {
                                            if (value != null)
                                                this.setGroupsBySection(value.Id);
                                            this.setState({ selectedSection: value });
                                        }} />
                                    <span className="text-danger">
                                        <small>
                                            {this.state.validationSearch.SelectedSection}
                                        </small>
                                    </span>
                                </Col>
                            </Row>

                            <Row>
                                <Col sm={1} className={'text-right'}>
                                    <FormLabel>Group</FormLabel>
                                </Col>
                                <Col sm={4}>
                                    <Select
                                        placeholder={'pilih group'}
                                        isClearable={true}
                                        options={this.state.groups}
                                        value={this.state.selectedGroup}
                                        onChange={(value) => {

                                            this.setState({ selectedGroup: value });
                                        }} />
                                    <span className="text-danger">
                                        <small>
                                            {this.state.validationSearch.SelectedGroup}
                                        </small>
                                    </span>
                                </Col>
                            </Row>

                            <Row>
                                <Col sm={1} className={'text-right'}>
                                    <FormLabel>Golongan</FormLabel>
                                </Col>
                                <Col sm={4}>
                                    <Select
                                        placeholder={'pilih golongan'}
                                        isClearable={true}
                                        options={this.state.employmentClasses}
                                        value={this.state.selectedEmploymentClass}
                                        onChange={(value) => {
                                            this.setState({ selectedEmploymentClass: value });
                                        }} />
                                </Col>
                            </Row>

                            <Row>
                                <Col sm={1} className={'text-right'}>
                                    <FormLabel>Periode</FormLabel>
                                </Col>
                                <Col sm={4}>
                                    <div className="customDatePickerWidth">
                                        <DatePicker
                                            className="form-control"
                                            name="SelectedPeriod"
                                            selected={this.state.selectedPeriod}
                                            onChange={date => {
                                                this.setState({ selectedPeriod: date });
                                            }}
                                            locale={id}
                                            dateFormat="MMMM yyyy"
                                            showMonthYearPicker
                                        />
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationSearch.SelectedPeriod}
                                            </small>
                                        </span>
                                    </div>
                                </Col>
                            </Row>

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

                            <br>
                            </br>

                            <Row>
                                <Col sm={1}>
                                </Col>
                                <Col sm={6}>
                                    <Button className="btn btn-secondary mr-3" name="reset" onClick={this.resetPagingConfiguration}>Reset</Button>
                                    <Button className="btn btn-info mr-3" name="search" onClick={this.search}>Cari</Button>
                                    <Button className="btn btn-success mr-3" name="create" onClick={this.create}>Input Kenaikan</Button>
                                    <Button className="btn btn-success mr-3" name="create" onClick={this.upload}>Upload</Button>
                                </Col>
                                <Col sm={5}>
                                    <Button className="btn btn-primary mr-3 pull-right" name="blangko" onClick={this.downloadBlangko}>Cetak Blangko</Button>
                                    <Button className="btn btn-primary mr-3 pull-right" name="incrementList" onClick={this.downloadIncrementList}>Cetak Daftar Kenaikan</Button>
                                    {/* Hide Button */}
                                    {/* <Button className="btn btn-primary mr-3" name="incrementRecap" onClick={this.downloadIncrementRecap}>Cetak Rekapitulasi Kenaikan</Button> */}
                                </Col>
                            </Row>
                        </FormGroup>



                        <FormGroup>
                            {this.state.loadingData ? (
                                <span><Spinner size="sm" color="primary" /> Loading Data...</span>
                            ) : (
                                <Row>
                                    <Table responsive bordered striped>
                                        <thead>
                                            <tr className={'text-center'}>
                                                <th>Unit</th>
                                                <th>Periode</th>
                                                <th>Nama Karyawan</th>
                                                <th>NIK</th>
                                                <th>Ranking</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                items.length > 0 ? items :
                                                    <tr className={'text-center'}>
                                                        <td colSpan='6' className={'align-middle text-center'}>Data Kosong</td>
                                                    </tr>
                                            }
                                        </tbody>
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

                        <Modal dialogClassName='custom-dialog' aria-labelledby="modal_add" show={this.state.isShowAddModal} onHide={() => this.showAddModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal_add">Tambah Kenaikan Gaji Karyawan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Periode</Form.Label>
                                    </Col>
                                    <Col>
                                        <div className="customDatePickerWidth">
                                            <DatePicker
                                                className={this.state.validationCreateForm.Period ? 'form-control is-invalid' : 'form-control'}
                                                name="Period"
                                                id="Period"
                                                selected={this.state.form?.Period}
                                                onChange={val => {
                                                    var { form } = this.state;
                                                    form["Period"] = val;
                                                    form["RankingItem"] = null;
                                                    form["RankingItemId"] = null;
                                                    form["RankingItemName"] = null;
                                                    this.clearPeriod();
                                                    if (form.Period && form.UnitId && form.EmploymentClass) {
                                                        this.setRanking();
                                                    }

                                                    return this.setState({ form: form });
                                                }}
                                                locale={id}
                                                dateFormat="MMMM yyyy"
                                                showMonthYearPicker
                                                isInvalid={this.state.validationCreateForm.Period ? true : null}
                                            />
                                            <span className="text-danger">
                                                <small>
                                                    {this.state.validationCreateForm.Period}
                                                </small>
                                            </span>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Unit</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm.UnitId ? 'invalid-select' : ''}
                                            options={this.state.units}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.Unit}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["Unit"] = value;
                                                form["UnitId"] = value?.Id;
                                                form["UnitName"] = value?.Name;
                                                form["EmployeeId"] = null;
                                                form["EmployeeIdentity"] = null;
                                                form["EmployeeName"] = null;
                                                form["EmploymentClass"] = null;
                                                form["RankingItem"] = null;
                                                form["RankingItemId"] = null;
                                                form["RankingItemName"] = null;
                                                form["SectionId"] = null;
                                                form["SectionName"] = null;
                                                form["GroupId"] = null;
                                                form["GroupName"] = null;
                                                this.clearItems();
                                                if (form.Period && form.UnitId && form.EmploymentClass) {
                                                    this.setRanking();
                                                }
                                                this.setState({ form: form, selectedEmployee: [] });
                                            }}
                                            isInvalid={this.state.validationCreateForm.UnitId ? true : null}>
                                        </Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.UnitId}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>NIK</Form.Label>
                                    </Col>
                                    <Col>
                                        <AsyncTypeahead
                                            id="loader-employee-create-form"
                                            className={this.state.validationCreateForm.EmployeeId ? 'invalid-select' : ''}
                                            ref={(typeahead) => { this.typeaheadEmployeeCreateForm = typeahead }}
                                            isLoading={this.state.isAutoCompleteLoading}
                                            onChange={(selected) => {
                                                var { form, selectedEmployee } = this.state;
                                                form["EmployeeId"] = selected[0]?.Id;
                                                form["EmployeeIdentity"] = selected[0]?.EmployeeIdentity;
                                                form["EmployeeName"] = selected[0]?.Name;
                                                form["EmploymentClass"] = selected[0]?.EmployeeClass;
                                                form["SectionId"] = selected[0]?.SectionId;
                                                form["SectionName"] = selected[0]?.Section;
                                                form["GroupId"] = selected[0]?.GroupId;
                                                form["GroupName"] = selected[0]?.Group;
                                                form["RankingItem"] = null;
                                                form["RankingItemId"] = null;
                                                form["RankingItemName"] = null;
                                                selectedEmployee = selected;
                                                this.changeEmployeeItems(selected[0]);
                                                if (form.Period && form.UnitId && form.EmploymentClass) {
                                                    this.setRanking();
                                                }
                                                this.setState({ form: form, selectedEmployee: selectedEmployee });
                                            }}
                                            selected={this.state.selectedEmployee}
                                            labelKey="NameAndEmployeeIdentity"
                                            minLength={1}
                                            onSearch={this.handleEmployeeSearchModal}
                                            options={this.state.employees}
                                            placeholder="Cari karyawan..."
                                            isInvalid={this.state.validationCreateForm.EmployeeId ? true : false}
                                        />
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.EmployeeId}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Nama</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.EmployeeName}</Form.Label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Golongan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.EmploymentClass}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Ranking</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm.RankingItemId ? 'invalid-select' : ''}
                                            options={this.state.rankingItems}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.RankingItem}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["RankingItem"] = value;
                                                form["RankingItemId"] = value?.Id;
                                                form["RankingItemName"] = value?.RankingName;
                                                this.changeRankingItems(value);
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.RankingItemId ? true : null}>
                                        </Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.RankingItemId}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <br>
                                </br>
                                <Row>
                                    <Col >
                                        <Table bordered striped>
                                            <thead>
                                                <tr className={'text-center'}>
                                                    <th>Ranking</th>
                                                    <th>Data Lama</th>
                                                    <th>Kenaikan</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    masterItems.length > 0 ? masterItems :
                                                        <tr className={'text-center'}>
                                                            <td colSpan='7' className={'align-middle text-center'}>Data Kosong</td>
                                                        </tr>
                                                }
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td className={'align-right text-right'} colSpan='3'>
                                                        Total :
                                                    </td>
                                                    <td>
                                                        {this.numberFormat(this.state.form?.ItemTotal.toFixed(2))}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </Table>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="create" onClick={this.handleCreate}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal aria-labelledby="modal-delete" show={this.state.isShowDeleteModal} onHide={() => this.showDeleteModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-delete">Hapus Kenaikan Gaji Karyawan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Apakah anda yakin ingin menghapus data ini?
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isDeleteLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-danger" name="delete" onClick={this.deleteClickHandler}>Hapus</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName='custom-dialog' aria-labelledby="modal-edit" show={this.state.isShowEditModal} onHide={() => this.showEditModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-edit">Edit Kenaikan Gaji Karyawan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Periode</Form.Label>
                                    </Col>
                                    <Col>
                                        <div className="customDatePickerWidth">
                                            <DatePicker
                                                className={this.state.validationCreateForm.Period ? 'form-control is-invalid' : 'form-control'}
                                                name="Period"
                                                id="Period"
                                                selected={this.state.form?.Period}
                                                onChange={val => {
                                                    var { form } = this.state;
                                                    form["Period"] = val;
                                                    form["RankingItem"] = null;
                                                    form["RankingItemId"] = null;
                                                    form["RankingItemName"] = null;
                                                    this.clearPeriod();
                                                    if (form.Period && form.UnitId && form.EmploymentClass) {
                                                        this.setRanking();
                                                    }

                                                    return this.setState({ form: form });
                                                }}
                                                locale={id}
                                                dateFormat="MMMM yyyy"
                                                showMonthYearPicker
                                                isInvalid={this.state.validationCreateForm.Period ? true : null}
                                            />
                                            <span className="text-danger">
                                                <small>
                                                    {this.state.validationCreateForm.Period}
                                                </small>
                                            </span>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Unit</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm.UnitId ? 'invalid-select' : ''}
                                            options={this.state.units}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.Unit}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["Unit"] = value;
                                                form["UnitId"] = value?.Id;
                                                form["UnitName"] = value?.Name;
                                                form["EmployeeId"] = null;
                                                form["EmployeeIdentity"] = null;
                                                form["EmployeeName"] = null;
                                                form["EmploymentClass"] = null;
                                                form["RankingItem"] = null;
                                                form["RankingItemId"] = null;
                                                form["RankingItemName"] = null;
                                                form["SectionId"] = null;
                                                form["SectionName"] = null;
                                                form["GroupId"] = null;
                                                form["GroupName"] = null;
                                                this.clearItems();
                                                if (form.Period && form.UnitId && form.EmploymentClass) {
                                                    this.setRanking();
                                                }
                                                this.setState({ form: form, selectedEmployee: [] });
                                            }}
                                            isInvalid={this.state.validationCreateForm.UnitId ? true : null}>
                                        </Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.UnitId}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>NIK</Form.Label>
                                    </Col>
                                    <Col>
                                        <AsyncTypeahead
                                            id="loader-employee-create-form"
                                            className={this.state.validationCreateForm.EmployeeId ? 'invalid-select' : ''}
                                            ref={(typeahead) => { this.typeaheadEmployeeCreateForm = typeahead }}
                                            isLoading={this.state.isAutoCompleteLoading}
                                            onChange={(selected) => {
                                                var { form, selectedEmployee } = this.state;
                                                form["EmployeeId"] = selected[0]?.Id;
                                                form["EmployeeIdentity"] = selected[0]?.EmployeeIdentity;
                                                form["EmployeeName"] = selected[0]?.Name;
                                                form["EmploymentClass"] = selected[0]?.EmployeeClass;
                                                form["SectionId"] = selected[0]?.SectionId;
                                                form["SectionName"] = selected[0]?.Section;
                                                form["GroupId"] = selected[0]?.GroupId;
                                                form["GroupName"] = selected[0]?.Group;
                                                form["RankingItem"] = null;
                                                form["RankingItemId"] = null;
                                                form["RankingItemName"] = null;
                                                selectedEmployee = selected;
                                                this.changeEmployeeItems(selected[0]);
                                                if (form.Period && form.UnitId && form.EmploymentClass) {
                                                    this.setRanking();
                                                }
                                                this.setState({ form: form, selectedEmployee: selectedEmployee });
                                            }}
                                            selected={this.state.selectedEmployee}
                                            labelKey="NameAndEmployeeIdentity"
                                            minLength={1}
                                            onSearch={this.handleEmployeeSearchModal}
                                            options={this.state.employees}
                                            placeholder="Cari karyawan..."
                                            isInvalid={this.state.validationCreateForm.EmployeeId ? true : false}
                                        />
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.EmployeeId}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Nama</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.EmployeeName}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Golongan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.EmploymentClass}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Ranking</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm.RankingItemId ? 'invalid-select' : ''}
                                            options={this.state.rankingItems}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.RankingItem}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["RankingItem"] = value;
                                                form["RankingItemId"] = value?.Id;
                                                form["RankingItemName"] = value?.RankingName;
                                                this.changeRankingItems(value);
                                                this.setState({ form: form });
                                            }}
                                            isInvalid={this.state.validationCreateForm.RankingItemId ? true : null}>
                                        </Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm.RankingItemId}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>
                                <br>
                                </br>
                                <Row>
                                    <Col >
                                        <Table bordered striped>
                                            <thead>
                                                <tr className={'text-center'}>
                                                    <th>Ranking</th>
                                                    <th>Data Lama</th>
                                                    <th>Kenaikan</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    masterItems.length > 0 ? masterItems :
                                                        <tr className={'text-center'}>
                                                            <td colSpan='7' className={'align-middle text-center'}>Data Kosong</td>
                                                        </tr>
                                                }
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td className={'align-right text-right'} colSpan='3'>
                                                        Total :
                                                    </td>
                                                    <td>
                                                        {this.numberFormat(this.state.form?.ItemTotal.toFixed(2))}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </Table>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="edit-standard-competencies" onClick={this.handleEdit}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName='custom-dialog' aria-labelledby="modal-view" show={this.state.isShowViewModal} onHide={() => this.showViewModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-view">Lihat Kenaikan Gaji Karyawan</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Periode</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.Period ? moment(this.state.form?.Period).format("MMMM YYYY") : null}</Form.Label>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Unit</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.UnitName}</Form.Label>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>NIK</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{`${this.state.form?.EmployeeIdentity} - ${this.state.form?.EmployeeName}`}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Nama</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.EmployeeName}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Golongan</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.EmploymentClass}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Ranking</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Label>{this.state.form?.RankingItemName}</Form.Label>
                                    </Col>
                                </Row>
                                <br>
                                </br>
                                <Row>
                                    <Col >
                                        <Table bordered striped>
                                            <thead>
                                                <tr className={'text-center'}>
                                                    <th>Ranking</th>
                                                    <th>Data Lama</th>
                                                    <th>Kenaikan</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    masterItems.length > 0 ? masterItems :
                                                        <tr className={'text-center'}>
                                                            <td colSpan='7' className={'align-middle text-center'}>Data Kosong</td>
                                                        </tr>
                                                }
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td className={'align-right text-right'} colSpan='3'>
                                                        Total :
                                                    </td>
                                                    <td>
                                                        {this.numberFormat(this.state.form?.ItemTotal.toFixed(2))}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </Table>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                            </Modal.Footer>
                        </Modal>

                        <Modal
                            dialogClassName="modal-90w"
                            aria-labelledby="modal-set-jadwal"
                            show={this.state.isShowUploadModal}
                            onHide={() => this.showUploadModal(false)}
                            animation={true}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-set-jadwal">
                                    Upload File
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
                )
                }

            </div>
        );
    }
}

export default PayRise;
