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

const moment = require('moment');

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";
class DriverAllowance extends Component {
    typeaheadEmployee = {};

    state = {
      loading: false,
      isCreateLoading:false,
      isEditLoading:false,
      deleteDriverAllowanceLoading: false,
      
      selectedUnit: null,
      selectedSection: null,
      selectedGroup: null,
      selectedUnitToCreate:null,
      selectedDayOfDuty: null,
      selectedAreaOfDuty: null,
      selectedStartPeriode :new Date(),
      selectedEndPeriode : new Date(),
      selectedSearchUnit:null,
      selectedSearchSection:null,
      selectedSearchGroup: null,
      dateRange:[],
      dateRangeLength:0,
      selectedDriverAllowance:{},
  
      units: [],
      groups: [],
      sections: [],
      employees:[],

      searchUnits:[],
      searchSections:[],
      searchGroups:[],

      // minimum date value js
      startDate: "",
      endDate: "",
  
      activePage: 1,
      total: 0,
      loadingData: false,
      tableData: [],
  
      validationSearch:{},
      form:{},
      //replace Form :
      DateOfDuty:null,
      TotalHours:null,
      TotalDriverAllowance: null,
      
      otherUnitId: JSON.parse(localStorage.getItem("otherUnitId")),
      //modal state
      isShowAddDriverAllowanceModal:false,
      isShowEditDriverAllowanceModal:false,
      isShowViewDriverAllowanceModal:false,
      isShowDeleteDriverAllowanceModal:false,
      

      dayOfDuty: [
        { name: "HariKerjaBiasa", label: "Hari Kerja Biasa", value: "Hari Kerja Biasa" },
        { name: "HariLiburLRCR", label: "Hari Libur LR/CR", value: "Hari Libur LR/CR" }
      ],
      areaOfDuty: [
        { name: "dalamSolo", label: "Dalam batas eks keresidenan solo", value: "Dalam batas eks keresidenan solo" },
        { name: "JawaTengah", label: "Jawa Tengah", value: "Jawa Tengah" },
        { name: "JawaTimur", label: "Jawa Timur", value: "Jawa Timur" },
        { name: "JawaBarat", label: "Jawa Barat", value: "Jawa Barat" },
        { name: "Bandung", label: "Bandung, Jabodetabek", value: "Bandung, Jabodetabek" },
        { name: "Bali", label: "Bali dan Luar Jawa", value: "Bali dan Luar Jawa" }
        
      ],
      userUnitId: localStorage.getItem("unitId"),
      userAccessRole: localStorage.getItem("accessRole")
    }
    resetPagingConfiguration = () => {
        this.setState({
          activePage: 1,
          selectedUnit: null,
          selectedSection: null,
          selectedGroup: null,
          selectedStartPeriode :new Date(),
          selectedEndPeriode : new Date(),
          startDate :null,
          endDate : null,
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
      }
      setData = () => {
        this.resetPagingConfiguration();
        const params = {
          unitId: this.state.selectedSearchUnit ? this.state.selectedSearchUnit.Id : 0,
          groupId: this.state.selectedSearchGroup ? this.state.selectedSearchGroup.Id : 0,
          sectionId :this.state.selectedSearchSection ? this.state.selectedSearchSection.Id : 0,
          page: this.state.activePage,
          startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
          endDate: moment(this.state.endDate).format('YYYY-MM-DD'),
          adminEmployeeId: Number(localStorage.getItem("employeeId"))
        };
    
        this.setState({ loadingData: true })
        this.service
          .getDriverAllowance(params)
          .then((result) => {
            this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
          }).catch((err)=>{
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
        if(sectionId == null){
        this.service
          .getAllGroups()
          .then((result) => {
            this.setState({ searchGroups: result })
          });
        }else{
        this.service
          .getAllGroupsBySection(sectionId)
          .then((result) => {
            this.setState({ searchGroups: result , selectedSearchGroup:null })
          });
        }
      }

      setSectionsSearch = (unitId) => {
        // this.setState({ loading: true })
        if(unitId == null){
        this.service
          .getAllSections()
          .then((result) => {
            this.setState({ searchSections: result })
          });
        }else{
        this.service
            .getAllSectionsByUnit(unitId)
            .then((result) => {
              this.setState({ searchSections: result, selectedSearchGroup :null, selectedSearchSection:null })
            });  
        }
      }

      setUnitsSearch = () => {
      
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

      search = () =>
      {
          this.setState({validationSearch:{}});
          if(moment(this.state.startDate) >moment(this.state.endDate)){
          this.setState({validationSearch:{StartDate:"Tanggal Awal Harus Kurang Dari Tanggal Akhir"}})
          }
          else if(this.state.startDate == null || this.state.startDate==""){
          this.setState({validationSearch:{StartDate:"Tanggal Awal Harus DIisi"}})
          }
          else if(this.state.endDate == null || this.state.endDate==""){
          this.setState({validationSearch:{endDate:"Tanggal Akhir Harus DIisi"}})
          }
          else{
          this.setData();
          }
      }

      handleEmployeeSearchModal = (query) => {
        this.setState({ isAutoCompleteLoading: true });
    
        const params = {
          unitId: this.state.selectedUnitToCreate ? this.state.selectedUnitToCreate.Id : 0,
          keyword: query
        }
    
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

      resetCreateModalValue = () => {
        this.setState({
          form: {},
        
          selectedEmployeeToCreate: null,
          selectedUnitToCreate:null,
            selectedDayOfDuty: null,
            selectedAreaOfDuty: null
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
          selectedStartPeriode :new Date(),
          selectedEndPeriode : new Date(),
          startDate :null,
          endDate : null,
          selectedSearchGroup : null,
          selectedSearchUnit :null,
          selectedSearchSection:null
        })
      }

      create = () => {
        this.showAddDriverAllowanceModal(true);
      }

      showAddDriverAllowanceModal = (value) => {
        this.resetCreateModalValue();
        this.setState({ isShowAddDriverAllowanceModal: value });
      }

      showDeleteDriverAllowanceModal = (value) => {
        this.setState({ isShowDeleteDriverAllowanceModal: value });
      }

      calculateUangTugas=()=>{
          var totalHours = this.state.form?.TotalHours == null? this.state.selectedDriverAllowance.TotalHours: this.state.form.TotalHours;
          var hariKerja  = this.state.selectedDayOfDuty;
          var uangTugas = 0;

          if(hariKerja.value.toLowerCase() == "hari kerja biasa"){
              if(totalHours >= 12){
                //   uangTugas = totalHours*7000;
                uangTugas =7000;
                
              }else if(totalHours>= 4 && totalHours <12){
                // uangTugas = totalHours*5600;
                uangTugas = 5600;
                
              }else{
                  uangTugas = 0;
              }
          }else if(hariKerja.value.toLowerCase() == "hari libur lr/cr"){
            if(totalHours >= 12){
                // uangTugas = totalHours*10000;
                uangTugas = 10000;

            }else if(totalHours>= 4 && totalHours <12){
            //   uangTugas = totalHours*8000;
              uangTugas = 8000;
              
            }else{
                uangTugas = 0;
            }
        }
        var {form} = this.state;
        var{selectedDriverAllowance} = this.state;
          form["DutyAllowanceCash"] = uangTugas;
          selectedDriverAllowance["DutyAllowanceCash"] = uangTugas;
        //   this.setState({form: {DutyAllowanceCash:uangTugas},selectedDriverAllowance:selectedDriverAllowance});
        console.log(form);
        console.log(selectedDriverAllowance);
        this.setState({form: form,selectedDriverAllowance:selectedDriverAllowance});
        
      }

      calculateUangMakan = ()=>{
          var areaDuty = this.state.selectedAreaOfDuty;
          var makanDitanggung = this.state.form?.MealAllowanceTotal == null? this.state.selectedDriverAllowance.MealAllowanceTotal : this.state.form.MealAllowanceTotal;
          var uangMakan = 0;
          switch(areaDuty.value.toLowerCase()){
              case "dalam batas eks keresidenan solo":
                uangMakan = makanDitanggung* 15000;
                break;
              case "jawa tengah":
                uangMakan = makanDitanggung* 20000;
                break;
              case "jawa timur":
                uangMakan = makanDitanggung* 25000;
                break;
              case "jawa barat":
                uangMakan = makanDitanggung* 25000;
                break;
              case "bandung, jabodetabek":
                uangMakan = makanDitanggung* 35000;
                break;
              case "bali dan luar jawa":
                uangMakan = makanDitanggung* 35000;
                break;
              default:
                uangMakan = 0;
                break;
          }
          var {form} = this.state;
          var{selectedDriverAllowance} = this.state;
          form["MealAllowanceCash"] = uangMakan;
          selectedDriverAllowance["MealAllowanceCash"] = uangMakan;
          console.log(form);
        console.log(selectedDriverAllowance);
          this.setState({form: form,selectedDriverAllowance:selectedDriverAllowance})
      }

      handleCreateDriverAllowance =() =>
      {
        //   console.log(this.state.form);
        const payload = {
            EmployeeId: this.state.selectedEmployeeToCreate?.Id,
            DayOfDuty: this.state.selectedDayOfDuty?.value,
            DateOfDuty: this.state.DateOfDuty,
            TotalHours: this.state.TotalHours,
            AreaOfDuty : this.state.selectedAreaOfDuty?.value,
            Task : this.state.form.Task,
            MealAllowanceTotal : this.state.form.MealAllowanceTotal,
            MealAllowanceCash : this.state.form.MealAllowanceCash,
            DutyAllowanceCash : this.state.form.DutyAllowanceCash,
            TotalDriverAllowance : this.state.form.TotalDriverAllowance
          }
      
          this.setState({ isCreateLoading: true });
          this.service.createDriverAllowance(payload)
            .then((result) => {
              // console.log(result);
              swal({
                icon: 'success',
                title: 'Good...',
                text: 'Data berhasil disimpan!'
              })
              this.setState({ isCreateLoading: false }, () => {
      
                this.resetPagingConfiguration();
                this.setData();
                this.showAddDriverAllowanceModal(false);
              });
            })
            .catch((error) => {
              if (error) {
                let message = "";
                if (error.DayOfDuty)
                  message += `- ${error.DayOfDuty}\n`;
      
                if (error.DateOfDuty)
                  message += `- ${error.DateOfDuty}\n`;
      
                if (error.TotalHours)
                  message += `- ${error.TotalHours}\n`;
      
                if (error.AreaOfDuty)
                  message += `- ${error.AreaOfDuty}\n`;
      
                if (error.Task)
                  message += `- ${error.Task}\n`;

                if (error.MealAllowanceTotal)
                  message += `- ${error.MealAllowanceTotal}\n`;
                
                if (error.MealAllowanceCash)
                  message += `- ${error.MealAllowanceCash}\n`;

                if (error.DutyAllowanceCash)
                  message += `- ${error.DutyAllowanceCash}\n`;
                
                this.setState({ isCreateLoading: false });
                swal({
                  icon: 'error',
                  title: 'Oops...',
                  text: message
                });
              }
            });
          // console.log(payload);
      }

      handleEditDriverAllowanceClick = (driverAllowance) => {
        this.setState({ selectedDriverAllowance: driverAllowance }, () => {
          this.getDriverAllowanceById(driverAllowance.Id, "EDIT")
        });
      }

      handleDeleteDriverAllowanceClick = (driverAllowance) => {
        this.setState({ selectedDriverAllowance: driverAllowance }, () => {
          this.showDeleteDriverAllowanceModal(true);
        });
      }

      handleViewDriverAllowanceClick = (driverAllowance) => {
        this.setState({ selectedDriverAllowance: driverAllowance }, () => {
          this.getDriverAllowanceById(driverAllowance.Id, "VIEW")
        });
      }
      
      deleteDriverAllowanceClickHandler = () => {
        this.setState({ deleteDriverAllowanceLoading: true });
    
        const url = `${CONST.URI_ATTENDANCE}driver-allowances/${this.state.selectedDriverAllowance.Id}`;
        const headers = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 }
        
        Promise.all([
          axios.delete(url,{headers:headers}),
        ])
        .then((values)=>{
          console.log(values);
         
          alert("Data Berhasil dihapus");
          this.setState({ deleteDriverAllowanceLoading: false });
          this.setData();
        }).catch((err) => {
          if(err.response.status==400){
            alert("Data Berhasil dihapus");
            this.setState({ deleteDriverAllowanceLoading: false });
            
          }else{
            alert("Terjadi kesalahan!");
            this.setState({ deleteDriverAllowanceLoading: false });
          }
          console.log(err.response);
          this.setState({ deleteDriverAllowanceLoading: false });
        }).then(() => {
          this.showDeleteDriverAllowanceModal(false);
          this.setData();
        });
      }

      handleEditDriverAllowance=()=>{
          this.updateDriverAllowance();
      }

      updateDriverAllowance = () => {
        this.setState({ updateEmployeeLoading: true });
    
        const url = `${CONST.URI_ATTENDANCE}driver-allowances`;
        const headers = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 }
        axios.put(url, this.state.selectedDriverAllowance, { headers: headers }).then(() => {
          swal("Data berhasil disimpan!");
          this.setState({ isEditLoading: false, selectedDriverAllowance: {}, page: 1, activePage: 1 }, () => {
            this.showEditDriverAllowanceModal(false);
            this.setData();
          });
        }).catch((err) => {
          if (err.response) {
            // this.setState({ validationCreateForm: err.response.data.error });
            console.log(this.state);
          }
          // alert("Terjadi kesalahan!");
          this.setState({ isEditLoading: false });
          this.setData();
        });
      }

      getDriverAllowanceById = (id, state) => {
        this.setState({ loading: true });
    
        const url = `${CONST.URI_ATTENDANCE}driver-allowances/${id}`;
        const headers = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 }
        axios.get(url, { headers: headers }).then((data) => {
    
            var selectedDriverAllowance = data.data;
            selectedDriverAllowance.DateOfDuty = moment(selectedDriverAllowance.DateOfDuty).format("YYYY-MM-DD");
            // console.log(selectedDriverAllowance);

            var selectedUnit = this.state.units.find(f => f.Id === selectedDriverAllowance.Unit.Id);
            // console.log("nyame2")
            var selectedDayOfDuty = this.state.dayOfDuty.find(f => f.value.toLowerCase() === selectedDriverAllowance.DayOfDuty.toLowerCase());
            var selectedAreaOfDuty = this.state.areaOfDuty.find(f=> f.value.toLowerCase() === selectedDriverAllowance.AreaOfDuty.toLowerCase());
            // console.log("nyampe");
            this.setState({
              loading: false,
              activePage: 1,
              page: 1,
              selectedUnitToCreate : selectedUnit,
              selectedDayOfDuty : selectedDayOfDuty,
              selectedAreaOfDuty : selectedAreaOfDuty,
              selectedDriverAllowance : selectedDriverAllowance
              
            }, () => {
              if (state === "VIEW")
                this.showViewDriverAllowanceModal(true);
              else if (state === "EDIT")
                this.showEditDriverAllowanceModal(true);
            });
    
          
        }).catch(err => {
          
          alert("Terjadi kesalahan!");
          this.setState({ loading: false });
        });
      }

      showEditDriverAllowanceModal = (value) => {
        if (!value)
          this.setState({ selectedDriverAllowance: {} });
    
        this.setState({ isShowEditDriverAllowanceModal: value });
      }
      showViewDriverAllowanceModal = (value) => {
        if (!value)
          this.setState({ selectedDriverAllowance: {} });
    
        this.setState({ isShowViewDriverAllowanceModal: value });
      }

    render(){
        const { tableData } = this.state;
        
        const items = tableData.map((item, index) => {
            return(
                <tr>
                    <td>{moment(item.DateOfDuty).format("DD-MM-YYYY")}</td>
                    <td>{item.Unit.Name}</td>
                    <td>{item.Employee.EmployeeIdentity}</td>
                    <td>{item.Employee.Firstname+' '+item.Employee.Lastname}</td>
                    <td>{item.Task}</td>
                    <td>{item.TotalAllowance}</td>
                    <td>
                        <Form>
                        <FormGroup>
                            <RowButtonComponent className="btn btn-success" name="view-driver-allowance" onClick={this.handleViewDriverAllowanceClick} data={item} iconClassName="fa fa-eye" label=""></RowButtonComponent>
                            <RowButtonComponent className="btn btn-primary" name="edit-driver-allowance" onClick={this.handleEditDriverAllowanceClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                            <RowButtonComponent className="btn btn-danger" name="delete-driver-allowance" onClick={this.handleDeleteDriverAllowanceClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
                        </FormGroup>
                        </Form>
                    </td>
                </tr>
            )
        });

        return (
            <div className="animated fadeIn">
                {this.state.loading ? (
                    <span><Spinner size="sm" color="primary" /> Please wait...</span>
                ) : (
                    <Form>
                        <FormGroup>
                            <Button className="btn btn-success mr-5" name="input-driver-allowance" onClick={this.create}>Tambah Data</Button>
                        </FormGroup>
                        <FormGroup>
                            <Row>
                            <Col sm={1} className={'text-right'}>
                                <FormLabel>Unit/Bagian</FormLabel>
                            </Col>
                            <Col sm={4}>
                                <Select
                                placeholder={'pilih unit'}
                                isClearable={true}
                                options={this.state.searchUnits}
                                value={this.state.selectedSearchUnit}
                                onChange={(value) => {
                                    // console.log(value);
                                    if(value != null)
                                    this.setSectionsSearch(value.Id);
                                    else
                                    this.setSectionsSearch(null);
                                    this.setState({ selectedSearchUnit: value });
                                }} />
                            </Col>
                            </Row>
                        </FormGroup>
                        <FormGroup>
                            <Row>
                            <Col sm={1} className={'text-right'}>
                                <FormLabel>Seksi</FormLabel>
                            </Col>
                            <Col sm={4}>
                                <Select
                                placeholder={'pilih seksi'}
                                isClearable={true}
                                options={this.state.searchSections}
                                value={this.state.selectedSearchSection}
                                onChange={(value) => {
                                    if(value != null)
                                        this.setGroupsSearch(value.Id);
                                        else
                                        this.setGroupsSearch(null);
                                        
                                    this.setState({ selectedSearchSection: value });
                                }} />
                            </Col>
                            </Row>
                        </FormGroup>
                        <FormGroup>
                            <Row>
                            <Col sm={1} className={'text-right'}>
                                <FormLabel>Group</FormLabel>
                            </Col>
                            <Col sm={4}>
                                <Select
                                placeholder={'pilih group'}
                                isClearable={true}
                                options={this.state.searchGroups}
                                value={this.state.selectedSearchGroup}
                                onChange={(value) => {
                                    this.setState({ selectedSearchGroup: value });
                                }} />
                            </Col>
                            </Row>
                        </FormGroup>

                        <FormGroup>
                            <Row>
                            <Col sm={1} className={'text-right'}>
                                <FormLabel>Periode</FormLabel>
                            </Col>
                            <Col sm={4}>
                                <Row>
                                <Col sm={5}>
                                    <Form.Control
                                    type="date"
                                    value={this.state.startDate}
                                    onChange={((event) => {
                                        this.setState({ startDate: event.target.value });
                                    })}
                                    isInvalid={this.state.validationSearch.StartDate} />
                                    <Form.Control.Feedback type="invalid">{this.state.validationSearch.StartDate}</Form.Control.Feedback>
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
                                    <Form.Control.Feedback type="invalid">{this.state.validationSearch.EndDate}</Form.Control.Feedback>
                                </Col>
                                </Row>
                            </Col>
                            </Row>
                        </FormGroup>

                        <FormGroup>
                            <Row>
                            <Col sm={1}>
                            </Col>
                            <Col sm={4}>
                                <Button className="btn btn-secondary mr-5" name="reset" onClick={this.resetPagingConfiguration}>Reset</Button>
                                <Button className="btn btn-primary mr-5" name="search" onClick={this.search}>Cari</Button>
                            </Col>

                            </Row>

                        </FormGroup>

                        <FormGroup>
                            {this.state.loadingData ? (
                            <span><Spinner size="sm" color="primary" /> Loading Data...</span>
                            ) : this.state.tableData.length<=0 ? (<Table responsive bordered striped >
                                <thead>
                                <tr className={'text-center'}>
                                    <th>Tanggal</th>
                                    <th>Unit</th>
                                    <th>NIK</th>
                                    <th>Nama</th>
                                    <th>Keperluan</th>
                                    <th>Total Uang Tugas</th>
                                </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan='6' className='text-center'>Data Kosong</td>
                                    </tr>
                                </tbody>
                            </Table>): (
                                <Row>
                                <Table responsive bordered striped >
                                    <thead>
                                    <tr className={'text-center'}>
                                        <th>Tanggal</th>
                                        <th>Unit</th>
                                        <th>NIK</th>
                                        <th>Nama</th>
                                        <th>Keperluan</th>
                                        <th>Total Uang Tugas</th>
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
                        <Modal dialogClassName="modal-90w" aria-labelledby="modal-add-driver-allowance" show={this.state.isShowAddDriverAllowanceModal} onHide={() => this.showAddDriverAllowanceModal(false)} animation={true}>
                            <Modal.Header>
                                <Modal.Title id="modal-add-driver-allowance">Input Uang Tugas Supir</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                    <Form.Label>Unit/Bagian</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                    <Select
                                        options={this.state.units}
                                        value={this.state.selectedUnitToCreate}
                                        onChange={(value) => {
                                        this.setState({ selectedUnitToCreate: value });
                                        }}>
                                    </Select>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                    <Form.Label>NIK</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                    <AsyncTypeahead
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
                                    />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                    <Form.Label>Nama</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                    <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedEmployeeToCreate?.Name}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Hari Kerja</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Select
                                        placeholder={'pilih hari kerja'}
                                        isClearable={true}
                                        options={this.state.dayOfDuty}
                                        value={this.state.selectedDayOfDuty}
                                        onChange={(value) => {
                                            // console.log(value);
                                            // console.log(this.state.form?.TotalHours);
                                            this.setState({ selectedDayOfDuty: value });
                                            // var {selectedDayOfDuty} = this.state;
                                            // var {form} = this.state;
                                            if(this.state.selectedDayOfDuty!= null && (this.state.form.TotalHours != 0||this.state.form.TotalHours != undefined))
                                            {
                                                this.calculateUangTugas();
                                            }
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Tanggal Bertugas</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Input
                                        type='date'
                                        value={this.state.form.DateOfDuty}
                                        onChange={(event) => {
                                            var { form } = this.state;
                                            form["DateOfDuty"] = event.target.value;
                                            this.setState({form : form, DateOfDuty: event.target.value});
                                            // this.setState({ form: {DateOfDuty : event.target.value} });
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Total Waktu Kerja</FormLabel>
                                    </Col>
                                    <Col sm={3}>
                                        <Input
                                        type='number'
                                        value={this.state.form.TotalHours}
                                        onChange={(value) => {
                                            var {form} = this.state;
                                            form["TotalHours"] = value.target.value;
                                            // this.setState({ form: {TotalHours: value.target.value} });
                                            this.setState({form: form,TotalHours:  value.target.value});
                                            if(this.state.selectedDayOfDuty!= null && (this.state.form.TotalHours != 0||this.state.form.TotalHours != undefined))
                                            {
                                                this.calculateUangTugas();
                                            }
                                        }} />
                                    </Col>
                                    <Col sm={2} className={'text-left'}>
                                        <FormLabel>Jam</FormLabel>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Daerah Tugas</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Select
                                        placeholder={'pilih daerah'}
                                        isClearable={true}
                                        options={this.state.areaOfDuty}
                                        value={this.state.selectedAreaOfDuty}
                                        onChange={(value) => {
                                            this.setState({ selectedAreaOfDuty: value });
                                            if(this.state.selectedAreaOfDuty!= null && (this.state.form.MealAllowanceTotal != 0||this.state.form.MealAllowanceTotal != undefined))
                                            {
                                                this.calculateUangMakan();
                                            }
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Keperluan</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Input
                                        type='text'
                                        value={this.state.form.Task}
                                        onChange={(event) => {
                                            var {form} = this.state;
                                            form["Task"] = event.target.value;
                                            this.setState({ form: form });
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Makan Ditanggung</FormLabel>
                                    </Col>
                                    <Col sm={3}>
                                        <Input
                                        type='number'
                                        value={this.state.form.MealAllowanceTotal}
                                        onChange={(value) => {
                                            var {form} = this.state;
                                            form["MealAllowanceTotal"] = value.target.value;
                                            this.setState({ form: form });
                                            if(this.state.selectedAreaOfDuty!= null && (this.state.form.MealAllowanceTotal != 0||this.state.form.MealAllowanceTotal != undefined))
                                            {
                                                this.calculateUangMakan();
                                            }
                                        }} />
                                    </Col>
                                    <Col sm={2} className={'text-left'}>
                                        <FormLabel>Kali</FormLabel>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Uang Tugas</FormLabel>
                                    </Col>
                                    <Col sm={5}>
                                        <Input
                                        type='number'
                                        value={this.state.form.DutyAllowanceCash}
                                        onChange={(value) => {
                                            var {form} = this.state;
                                            form["DutyAllowanceCash"] = value.target.value;
                                            this.setState({ form: form });
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Uang Makan</FormLabel>
                                    </Col>
                                    <Col sm={5}>
                                        <Input
                                        type='number'
                                        value={this.state.form.MealAllowanceCash}
                                        onChange={(value) => {
                                            var {form} = this.state;
                                            form["MealAllowanceCash"] = value.target.value;
                                            this.setState({ form: form });
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Total Uang Tugas</FormLabel>
                                    </Col>
                                    <Col sm={5}>
                                        <Input
                                        type='number'
                                        value={Number(this.state.form.MealAllowanceCash?this.state.form.MealAllowanceCash:0) + Number(this.state.form.DutyAllowanceCash?this.state.form.DutyAllowanceCash:0)}
                                        onChange={(value) => {
                                            var {form} = this.state;
                                            // form["TotalDriverAllowance"] = value.target.value;
                                            this.setState({ form: {TotalDriverAllowance: value.target.value} });
                                        }} 
                                        disabled
                                        />
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                            {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                <div>
                                <Button className="btn btn-success" name="create-driver-allowance" onClick={this.handleCreateDriverAllowance}>Submit</Button>
                                </div>
                            )}
                            </Modal.Footer>
                        </Modal>

                        {/* modal View */}
                        <Modal dialogClassName="modal-90w" aria-labelledby="modal-view-driver-allowance" show={this.state.isShowViewDriverAllowanceModal} onHide={() => this.showViewDriverAllowanceModal(false)} animation={true}>
                            <Modal.Header>
                                <Modal.Title id="modal-view-driver-allowance">View Uang Tugas Supir</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                    <Form.Label>Unit/Bagian</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                    
                                    <Form.Label>{this.state.selectedDriverAllowance.Unit?.Name}</Form.Label>
                                    
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                    <Form.Label>NIK</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                    <Form.Label>{this.state.selectedDriverAllowance.Employee?.EmployeeIdentity}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                    <Form.Label>Nama</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                    <Form.Label>{this.state.selectedDriverAllowance.Employee?.Firstname +' '+this.state.selectedDriverAllowance.Employee?.Lastname}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Hari Kerja</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>
                                        
                                        {this.state.selectedDayOfDuty?.value}
                                         
                                         </Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Tanggal Bertugas</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label >
                                            {this.state.selectedDriverAllowance?.DateOfDuty}
                                        </Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Total Waktu Kerja</FormLabel>
                                    </Col>
                                    <Col sm={1}>
                                        <Form.Label>
                                        {this.state.selectedDriverAllowance?.TotalHours}
                                        </Form.Label>
                                    </Col>
                                    <Col sm={2} className={'text-left'}>
                                        <FormLabel>Jam</FormLabel>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Daerah Tugas</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>
                                        {this.state.selectedAreaOfDuty?.value}
                                        </Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Keperluan</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Form.Label>{this.state.selectedDriverAllowance?.Task}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Makan Ditanggung</FormLabel>
                                    </Col>
                                    <Col sm={1}>
                                        <Form.Label>{this.state.selectedDriverAllowance?.MealAllowanceTotal}</Form.Label>
                                    </Col>
                                    <Col sm={2} className={'text-left'}>
                                        <Form.Label>Kali</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Uang Tugas</FormLabel>
                                    </Col>
                                    <Col sm={5}>
                                        <Form.Label>
                                        {this.state.selectedDriverAllowance?.DutyAllowanceCash}
                                        </Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Uang Makan</FormLabel>
                                    </Col>
                                    <Col sm={5}>
                                        <Form.Label>
                                        {this.state.selectedDriverAllowance?.MealAllowanceCash}
                                        </Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Total Uang Tugas</FormLabel>
                                    </Col>
                                    <Col sm={5}>
                                        <Form.Label>
                                            {Number(this.state.selectedDriverAllowance.MealAllowanceCash?this.state.selectedDriverAllowance.MealAllowanceCash:0) + Number(this.state.selectedDriverAllowance.DutyAllowanceCash?this.state.selectedDriverAllowance.DutyAllowanceCash:0)}
                                        </Form.Label>
                                    </Col>
                                </Row>
                            </Modal.Body>
                            {/* <Modal.Footer>
                            {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                <div>
                                <Button className="btn btn-success" name="view-driver-allowance" onClick={this.setState({isShowViewDriverAllowanceModal:false})}>Close</Button>
                                </div>
                            )}
                            </Modal.Footer> */}
                        </Modal>

                        {/* modal edit */}
                        <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-driver-allowance" show={this.state.isShowEditDriverAllowanceModal} onHide={() => this.showEditDriverAllowanceModal(false)} animation={true}>
                            <Modal.Header>
                                <Modal.Title id="modal-edit-driver-allowance">Edit Uang Tugas Supir</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                    <Form.Label>Unit/Bagian</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                    
                                    <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedDriverAllowance.Unit?.Name}</Form.Label>
                                    
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                    <Form.Label>NIK</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                    <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedDriverAllowance.Employee?.EmployeeIdentity}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4}>
                                    <Form.Label>Nama</Form.Label>
                                    </Col>
                                    <Col sm={8}>
                                    <Form.Label>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.selectedDriverAllowance.Employee?.Firstname +' '+this.state.selectedDriverAllowance.Employee?.Lastname}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Hari Kerja</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Select
                                        placeholder={'pilih hari kerja'}
                                        isClearable={true}
                                        options={this.state.dayOfDuty}
                                        value={this.state.selectedDayOfDuty}
                                        onChange={(value) => {
                                            // console.log(value);
                                            // console.log(this.state.form?.TotalHours);
                                            this.setState({ selectedDayOfDuty: value });
                                            // var {selectedDayOfDuty} = this.state;
                                            // var {form} = this.state;
                                            if(this.state.selectedDayOfDuty!= null && (this.state.selectedDriverAllowance.TotalHours != 0||this.state.selectedDriverAllowance.TotalHours != undefined))
                                            {
                                                this.calculateUangTugas();
                                            }
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Tanggal Bertugas</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Input
                                        type='date'
                                        value={this.state.selectedDriverAllowance.DateOfDuty}
                                        onChange={(event) => {
                                            var { form } = this.state;
                                            var { selectedDriverAllowance } = this.state;
                                            form["DateOfDuty"] = event.target.value;
                                            selectedDriverAllowance["DateOfDuty"] = event.target.value;
                                            this.setState({form : form, DateOfDuty: event.target.value,selectedDriverAllowance:selectedDriverAllowance});
                                            // this.setState({ form: {DateOfDuty : event.target.value} });
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Total Waktu Kerja</FormLabel>
                                    </Col>
                                    <Col sm={3}>
                                        <Input
                                        type='number'
                                        value={this.state.selectedDriverAllowance.TotalHours}
                                        onChange={(value) => {
                                            var {form} = this.state;
                                            var { selectedDriverAllowance } = this.state;
                                            form["TotalHours"] = value.target.value;
                                            selectedDriverAllowance["TotalHours"] = value.target.value;
                                            // this.setState({ form: {TotalHours: value.target.value} });
                                            this.setState({form: form,TotalHours:  value.target.value,selectedDriverAllowance:selectedDriverAllowance});
                                            if(this.state.selectedDayOfDuty!= null && (this.state.selectedDriverAllowance.TotalHours != 0||this.state.selectedDriverAllowance.TotalHours != undefined))
                                            {
                                                this.calculateUangTugas();
                                            }
                                        }} />
                                    </Col>
                                    <Col sm={2} className={'text-left'}>
                                        <FormLabel>Jam</FormLabel>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Daerah Tugas</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Select
                                        placeholder={'pilih daerah'}
                                        isClearable={true}
                                        options={this.state.areaOfDuty}
                                        value={this.state.selectedAreaOfDuty}
                                        onChange={(value) => {
                                            this.setState({form: {}, selectedAreaOfDuty: value });
                                            if(this.state.selectedAreaOfDuty!= null && (this.state.selectedDriverAllowance.MealAllowanceTotal != 0||this.state.selectedDriverAllowance.MealAllowanceTotal != undefined))
                                            {
                                                this.calculateUangMakan();
                                            }
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Keperluan</FormLabel>
                                    </Col>
                                    <Col sm={8}>
                                        <Input
                                        type='text'
                                        value={this.state.selectedDriverAllowance.Task}
                                        onChange={(event) => {
                                            var {form} = this.state;
                                            var { selectedDriverAllowance } = this.state;
                                            form["Task"] = event.target.value;
                                            selectedDriverAllowance["Task"] = event.target.value;
                                            this.setState({ form: form,selectedDriverAllowance:selectedDriverAllowance });
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Makan Ditanggung</FormLabel>
                                    </Col>
                                    <Col sm={3}>
                                        <Input
                                        type='number'
                                        value={this.state.selectedDriverAllowance.MealAllowanceTotal}
                                        onChange={(value) => {
                                            var {form} = this.state;
                                            var { selectedDriverAllowance } = this.state;
                                            form["MealAllowanceTotal"] = value.target.value;
                                            selectedDriverAllowance["MealAllowanceTotal"] = value.target.value;
                                            this.setState({ form: form ,selectedDriverAllowance:selectedDriverAllowance});
                                            if(this.state.selectedAreaOfDuty!= null && (this.state.selectedDriverAllowance.MealAllowanceTotal != 0||this.state.selectedDriverAllowance.MealAllowanceTotal != undefined))
                                            {
                                                this.calculateUangMakan();
                                            }
                                        }} />
                                    </Col>
                                    <Col sm={2} className={'text-left'}>
                                        <FormLabel>Kali</FormLabel>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Uang Tugas</FormLabel>
                                    </Col>
                                    <Col sm={5}>
                                        <Input
                                        type='number'
                                        value={this.state.selectedDriverAllowance.DutyAllowanceCash}
                                        onChange={(value) => {
                                            var {form} = this.state;
                                            var { selectedDriverAllowance } = this.state;
                                            form["DutyAllowanceCash"] = value.target.value;
                                            selectedDriverAllowance["DutyAllowanceCash"] = value.target.value;
                                            this.setState({ form: form , selectedDriverAllowance: selectedDriverAllowance});
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Uang Makan</FormLabel>
                                    </Col>
                                    <Col sm={5}>
                                        <Input
                                        type='number'
                                        value={this.state.selectedDriverAllowance.MealAllowanceCash}
                                        onChange={(value) => {
                                            var {form} = this.state;
                                            var { selectedDriverAllowance } = this.state;
                                            form["MealAllowanceCash"] = value.target.value;
                                            selectedDriverAllowance["MealAllowanceCash"] = value.target.value;
                                            this.setState({ form: form ,selectedDriverAllowance:selectedDriverAllowance});
                                        }} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={4} className={'text-left'}>
                                        <FormLabel>Total Uang Tugas</FormLabel>
                                    </Col>
                                    <Col sm={5}>
                                        <Input
                                        type='number'
                                        value={Number(this.state.selectedDriverAllowance.MealAllowanceCash?this.state.selectedDriverAllowance.MealAllowanceCash:0) + Number(this.state.selectedDriverAllowance.DutyAllowanceCash?this.state.selectedDriverAllowance.DutyAllowanceCash:0)}
                                        onChange={(value) => {
                                            var {form} = this.state;
                                            var { selectedDriverAllowance } = this.state;
                                            // form["TotalDriverAllowance"] = value.target.value;
                                            this.setState({ form: {TotalDriverAllowance: value.target.value} });
                                        }} 
                                        disabled
                                        />
                                    </Col>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                            {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                <div>
                                <Button className="btn btn-success" name="edit-driver-allowance" onClick={this.handleEditDriverAllowance}>Submit</Button>
                                </div>
                            )}
                            </Modal.Footer>
                        </Modal>

                        {/* modal delete */}

                        <Modal aria-labelledby="modal-delete-driver-allowance" show={this.state.isShowDeleteDriverAllowanceModal} onHide={() => this.showDeleteDriverAllowanceModal(false)} animation={true}>
                        <Modal.Header closeButton>
                            <Modal.Title id="modal-delete-data">Hapus Uang Tugas Supir</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            Apakah anda yakin ingin menghapus data {this.state.selectedDriverAllowance.Employee?.Firstname +' '+this.state.selectedDriverAllowance.Employee?.Lastname}?
                                            </Modal.Body>
                        <Modal.Footer>
                            {this.state.deleteDriverAllowanceLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                            <div>
                                <Button className="btn btn-danger" name="delete-driver-allowance" onClick={this.deleteDriverAllowanceClickHandler}>Hapus</Button>
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
export default DriverAllowance;
