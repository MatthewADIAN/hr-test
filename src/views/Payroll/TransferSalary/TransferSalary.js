import React, { Component } from 'react';
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
const moment = require('moment');

const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";
const UPAH = "Upah";

class TransferSalary extends Component {

    state = {
        loading: false,
        activePage: 1,
        total: 0,
        size: 10,
        loadingData: false,
        tableData: [],
        selectedUnit: null,
        selectedPeriod: null,
        selectedItem: null,
        transferUpahs: [
            { value: "Transfer Upah Baru", label: "Transfer Upah Baru" },
            { value: "Transfer Upah Lama", label: "Transfer Upah Lama" }
        ],
        form: {},
        isShowAddModal: false,
        isAddLoading: false,
        validationSearch: {},
        validationCreateForm: {},
        units: [],
        isAutoCompleteLoading: false,
        userUnitId: localStorage.getItem("unitId"),
        userAccessRole: localStorage.getItem("accessRole"),
        otherUnitId: JSON.parse(localStorage.getItem("otherUnitId"))
    }

    resetModalValueCreate = () => {

    }

    resetPagingConfiguration = () => {
        this.setState({
            activePage: 1,
            size: 10,
            selectedUnit: null,
            selectedPeriod: null,
        });
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
                    } else if (this.state.userAccessRole == PERSONALIA_PUSAT ) {
                      units.push(s);
                    }
                  });
                this.setState({ units: units, loadingData: false })

            });
    }


    setData = () => {
        let unitId = this.state.selectedUnit ? this.state.selectedUnit.Id : 0;
        // if (this.state.userAccessRole == PERSONALIA_BAGIAN || this.state.userAccessRole == PIMPINAN || this.state.userAccessRole == UPAH) {
        //     unitId = this.state.userUnitId
        // } else {
        //     unitId = this.state.selectedUnit ? this.state.selectedUnit.Id : 0
        // }
        const params = {
            page: this.state.activePage,
            size: this.state.size,
            unitId: unitId,
            period: this.state.selectedPeriod ? moment.utc(this.state.selectedPeriod).format() : null
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

    resetModalValue = () => {
        this.setState({
            form: {},
            validationCreateForm: {}
        })
    }

    showAddModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddModal: value, validationCreateForm: {} });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreate = () => {
        const payload = {
            Period: this.state.form?.Period,
            Unit: this.state.form?.Unit,
            TransferUpah: this.state.form?.TransferUpah
        };

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
                });
                this.showAddModal(false);
                this.search();
            })
            .catch((error) => {

                if (error) {
                    let message = "Pastikan data sudah terisi dengan benar!";

                    swal({
                        icon: 'error',
                        title: 'Gagal...',
                        text: message
                    });

                    this.setState({ validationCreateForm: error, isCreateLoading: false });
                }
            });
    }


    transferUpahClick = (data) => {

        console.log(data);
        // alert('is clicked ');
        var { form } = this.state;
        form["Period"] = new Date(data.Period);
        form["Unit"] = data.Unit;
        this.showAddModal(true);

    }
    search = () => {
        this.setState({ activePage: 1 }, () => {
            this.setData();
        })
    }

    setFile = (file) => {
        this.setState({ selectedFile: file });
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

    numberFormat = (value) => {
        return new Intl.NumberFormat('id-ID').format(value);
    }

    render() {
        const { tableData } = this.state;

        const items = tableData.map((item, index) => {

            return (
                <tr key={item.Id} data-category={item.Id}>
                    <td>{item.Unit.Name}</td>
                    <td>{moment(item.Period).format('MMMM YYYY')}</td>
                    <td>{item.ProsesUpah}</td>
                    {/* <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-success" name="view-compentencies" onClick={this.transferUpahClick} data={item} label="Transfer Upah"></RowButtonComponent>
                            </FormGroup>
                        </Form>
                    </td> */}
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
                                <Col sm={1}>
                                    <FormLabel>Unit</FormLabel>
                                </Col>
                                <Col sm={4}>
                                    <Select
                                        placeholder={'pilih unit'}
                                        isClearable={true}
                                        options={this.state.units}
                                        value={this.state.selectedUnit}
                                        onChange={(value) => {
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
                                <Col sm={1} >
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

                            <br>
                            </br>

                            <Row>
                                <Col sm={1}>
                                </Col>
                                <Col sm={5}>
                                    <Button className="btn btn-secondary mr-3" name="reset" onClick={this.resetPagingConfiguration}>Reset</Button>
                                    <Button className="btn btn-info mr-3" name="search" onClick={this.search}>Cari</Button>
                                    <Button className="btn btn-success mr-3" name="create" onClick={this.create}>Transfer Upah</Button>
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
                                                <th>Transfer Upah</th>
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

                        <Modal dialogClassName="modal-90w" aria-labelledby="modal_add" show={this.state.isShowAddModal} onHide={() => this.showAddModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal_add">Transfer Upah</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Proses Upah</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm?.TransferUpah ? 'invalid-select' : ''}
                                            options={this.state.transferUpahs}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.TransferUpah}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["TransferUpah"] = value;

                                                let errors = this.state.validationCreateForm;
                                                if (errors?.NotSetTransferUpah) {
                                                    errors['NotSetTransferUpah'] = ""
                                                }

                                                this.setState({ form: form, validationCreateForm: errors });
                                            }}
                                            isInvalid={this.state.validationCreateForm?.NotSetTransferUpah ? true : null}>
                                        </Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm?.NotSetTransferUpah}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Unit</Form.Label>
                                    </Col>
                                    <Col>
                                        <Select
                                            className={this.state.validationCreateForm?.UnitId ? 'invalid-select' : ''}
                                            options={this.state.units}
                                            isClearable={true}
                                            backspaceRemovesValue={true}
                                            value={this.state.form?.Unit}
                                            onChange={(value) => {
                                                var { form } = this.state;
                                                form["Unit"] = value;

                                                let errors = this.state.validationCreateForm;
                                                if (errors?.NotSetUnit) {
                                                    errors['NotSetUnit'] = ""
                                                }

                                                this.setState({ form: form, validationCreateForm: errors });
                                            }}
                                            isInvalid={this.state.validationCreateForm?.NotSetUnit ? true : null}>
                                        </Select>
                                        <span className="text-danger">
                                            <small>
                                                {this.state.validationCreateForm?.NotSetUnit}
                                            </small>
                                        </span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={4}>
                                        <Form.Label>Periode</Form.Label>
                                    </Col>
                                    <Col>
                                        <div className="customDatePickerWidth">
                                            <DatePicker
                                                className={this.state.validationCreateForm?.Period ? 'form-control is-invalid' : 'form-control'}
                                                name="Period"
                                                id="Period"
                                                selected={this.state.form?.Period}
                                                onChange={val => {
                                                    var { form } = this.state;
                                                    form["Period"] = val;

                                                    let errors = this.state.validationCreateForm;
                                                    if (errors?.NotSetPeriod) {
                                                        errors['NotSetPeriod'] = ""
                                                    }

                                                    if (errors?.NotSetPayRiseSalary) {
                                                        errors['NotSetPayRiseSalary'] = ""
                                                    }

                                                    return this.setState({ form: form, validationCreateForm: errors });
                                                }}
                                                dateFormat="MMMM yyyy"
                                                showMonthYearPicker
                                                isInvalid={this.state.validationCreateForm?.NotSetPeriod ? true : null}
                                            />
                                            <span className="text-danger">
                                                <small>
                                                    {this.state.validationCreateForm?.NotSetPeriod} <br />
                                                    {this.state.validationCreateForm?.NotSetPayRiseSalary}
                                                </small>
                                            </span>
                                        </div>
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
                    </Form>
                )
                }

            </div>
        );
    }
}

export default TransferSalary;
