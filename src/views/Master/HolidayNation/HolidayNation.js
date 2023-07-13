import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';

import Service from './Service';
import swal from 'sweetalert';

import './style.css';

const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);

class HolidayNation extends Component{

    typeaheadEmployee = {};

    state = {
        loading: false,

        activePage: 1,
        total: 0,
        loadingData: false,
        tableData: [],
        selectedItem: null,
        selectedStartDate: null,
        selectedEndDate : null,


        form: {},
        isCreateLoading: false,
        isShowAddHolidayModal: false,

        isShowDeleteHolidayModal: false,

        isShowEditHolidayModal: false,
        isEditLoading: false,

        selectedFile: null,

        selectedHolidayNationFilter:"",

        validationCreateForm: {}
    }

    resetModalValue = () => {
        this.setState({
            validationCreateForm: {},
            form: {},
        })
    }

    resetPagingConfiguration = () => {
        this.setState({
            activePage: 1
        })
    }

    constructor(props) {
        super(props);
        this.service = new Service();
    }

    componentDidMount() {
        this.setData();
    }

    setData = () => {
        const params = {
            page: this.state.activePage,
            startDate : this.state.selectedStartDate,
            endDate : this.state.selectedEndDate
        };

        this.setState({ loadingData: true })
        this.service
            .search(params)
            .then((result) => {
                this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
            });
    }

  setDataByKeyword = () => {
    const params = {
      page: this.state.activePage,
      keyword:this.state.selectedHolidayNationFilter,
    };

    this.setState({ loadingData: true })
    this.service
      .getHolidayNation(params)
      .then((result) => {
        this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
      });
  }

    search = (keyword) => {
      this.setState({selectedHolidayNationFilter:keyword, page:1},()=>this.setDataByKeyword())

    }

    create = () => {
        this.showAddHolidayModal(true);
    }

    upload = () => {
        this.showUploadModal(true);
    }

    showUploadModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowUploadModal: value });
    }

    showAddHolidayModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddHolidayModal: value, validationCreateForm: {} });
    }

    showDeleteHolidayModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeleteHolidayModal: value });
    }

    showEditHolidayModal = (value) => {
        this.setState({ isShowEditHolidayModal: value });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreateHoliday = () => {
        const payload = {
            StartDate: this.state.form?.StartDate,
            EndDate: this.state.form?.EndDate,
            HolidayName:this.state.form?.HolidayName
        }

        this.setState({ isCreateLoading: true });
        this.service.create(payload)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil disimpan!'
                })
                this.setState({ isCreateLoading: false }, () => {

                    this.resetModalValue();
                    this.resetPagingConfiguration();
                    this.setData();
                    this.showAddHolidayModal(false);
                });
            })
            .catch((error) => {
                if (error.response) {
                    this.setState({ validationCreateForm: error.response.data.error, isCreateLoading: false });
                    // console.log(this.state);
                }
                // console.log(error)
            });
        // console.log(payload);
    }

    handleEditHoliday = () => {
        const payload = {
            Id: this.state.form?.Id,
            StartDate: this.state.form?.StartDate,
            EndDate: this.state.form?.EndDate,
            HolidayName : this.state.form?.HolidayName,
        }

        this.setState({ isEditLoading: true });
        this.service.edit(this.state.selectedItem?.Id, payload)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil diubah!'
                })
                this.setState({ isEditLoading: false }, () => {

                    this.resetModalValue();
                    this.resetPagingConfiguration();
                    this.setData();
                    this.showEditHolidayModal(false);
                });
            })
            .catch((error) => {
                this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
            });
    }

    handleEditHolidayClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getById(item.Id)
            .then((Holiday) => {
                this.setState({ form: Holiday }, () => {
                    this.showEditHolidayModal(true);
                })
            })
    }

    handleDeleteHolidayClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeleteHolidayModal(true);
        })
    }

    deleteHolidayClickHandler = () => {
        this.setState({ isDeleteHolidayLoading: true })
        this.service.delete(this.state.selectedItem?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteHolidayLoading: false, selectedItem: null }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteHolidayModal(false);
                });
            })
    }

    onInputFileHandler = (event) => {
        this.setFile(event.target.files[0]);
    }

    setFile = (file) => {
        this.setState({ selectedFile: file });
    }

    handleUploadHoliday = () => {
        this.service.uploadHoliday(this.state.selectedFile)
            .then((data) => {
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil diubah!'
                });
                this.resetModalValue();
                this.resetPagingConfiguration();
                this.setData();
                this.showUploadModal(false);
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Gagal Upload!',
                    text: 'Pastikan Format Excel sudah benar!\nHubungi IT support.'
                })
            })
    }

    render() {
        const { tableData } = this.state;

        const items = tableData.map((item, index) => {

            return (
                <tr key={item.Id} data-category={item.Id}>
                    <td>{moment(item.HolidayDate).utcOffset("+0700").format('YYYY-MM-DD')}</td>
                    <td>{item.HolidayName}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-primary" name="edit-holiday" onClick={this.handleEditHolidayClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-holiday" onClick={this.handleDeleteHolidayClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
                            </FormGroup>
                        </Form>
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
                                    <Col sm={4}>
                                        <Button className="btn btn-success mr-5" style={{'margin-bottom': '10px'}} name="add_holiday" onClick={this.create}>Tambah Libur</Button>
                                    </Col>
                                  <Col sm={4}></Col>

                                </Row>



                            <Row>
                                <Col md={1} className="control-label">
                                    Periode :
                                </Col>
                                <Col md={2}>
                                    <Form.Control
                                        type="date"
                                        name="StartDate"
                                        value={this.state.selectedStartDate}
                                        onChange={(e) => {
                                        var { selectedStartDate } = this.state;
                                        selectedStartDate = e.target.value;
                                        return this.setState({ selectedStartDate: selectedStartDate });
                                        }}
                                    />
                                </Col>
                                <Col md={1}>
                                s/d
                                </Col>
                                <Col md={2}>
                                <Form.Control
                                        type="date"
                                        name="EndDate"
                                        value={this.state.selectedEndDate}
                                        onChange={(e) => {
                                        var { selectedEndDate } = this.state;
                                        selectedEndDate = e.target.value;
                                        return this.setState({ selectedEndDate: selectedEndDate });
                                        }}
                                    />
                                </Col>
                                <Col md={6}>

                                </Col>
                            </Row>
                            <Row>
                                <Col sm={2}>

                                    <RowButtonComponent className="btn btn-info" name="search-holiday" onClick={this.setData}  label="Cari"></RowButtonComponent>

                                </Col>
                              <Col sm={6}></Col>

                              <Col sm={4}>
                                <Form.Control
                                  className="float-right"
                                  type="text"
                                  name="keyword"
                                  value={this.state.selectedHolidayNationFilter}
                                  onChange={(e) => {
                                    return this.search(e.target.value);
                                  }}
                                  placeholder="Cari hari libur"
                                />
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
                                                        <th>Tanggal</th>
                                                        <th>Keterangan</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>{items}</tbody>
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

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal_add_holiday" show={this.state.isShowAddHolidayModal} onHide={() => this.showAddHolidayModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal_add_holiday">Tambah Libur</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row>
                                        <Col sm={3}>
                                            <Form.Label>Tanggal</Form.Label>
                                        </Col>
                                        <Col md={4} className="no-padding"  style={{paddingLeft:'15px'}}>
                                            <Form.Control
                                                type="date"
                                                name="StartDate"
                                                value={this.state.form.StartDate?moment(this.state.form.StartDate).format('YYYY-MM-DD'):""}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.StartDate||this.state.validationCreateForm.DifferenceDate}

                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.StartDate||this.state.validationCreateForm.DifferenceDate}</Form.Control.Feedback>
                                        </Col>
                                        <Col sm={1} className="no-padding text-center">
                                            s/d
                                        </Col>
                                        <Col md={4} className="no-padding" style={{paddingRight:'15px'}}>
                                            <Form.Control
                                                type="date"
                                                name="EndDate"
                                                value={this.state.form.EndDate?moment(this.state.form.EndDate).format('YYYY-MM-DD'):""}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.EndDate||this.state.validationCreateForm.DifferenceDate}

                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.EndDate||this.state.validationCreateForm.DifferenceDate}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={3}>
                                            <Form.Label>Keterangan</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="HolidayName"
                                                value={this.state.form.HolidayName}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.HolidayName}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.HolidayName }</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="create-holiday" onClick={this.handleCreateHoliday}>Save</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal aria-labelledby="modal-delete-holiday" show={this.state.isShowDeleteHolidayModal} onHide={() => this.showDeleteHolidayModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-delete-holiday">Hapus Libur</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isDeleteHolidayLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-danger" name="delete-holiday" onClick={this.deleteHolidayClickHandler}>Hapus</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-holiday" show={this.state.isShowEditHolidayModal} onHide={() => this.showEditHolidayModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-edit-Holiday">Edit Libur</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                <Row>
                                        <Col sm={3}>
                                            <Form.Label>Tanggal</Form.Label>
                                        </Col>
                                        <Col md={4} className="no-padding"  style={{paddingLeft:'15px'}}>
                                            <Form.Control
                                                type="date"
                                                name="StartDate"
                                                value={this.state.form.StartDate?moment(this.state.form.StartDate).format('YYYY-MM-DD'):""}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.StartDate||this.state.validationCreateForm.DifferenceDate}

                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.StartDate||this.state.validationCreateForm.DifferenceDate}</Form.Control.Feedback>
                                        </Col>
                                        <Col sm={1} className="no-padding">
                                            s/d
                                        </Col>
                                        <Col md={4} className="no-padding" style={{paddingRight:'15px'}}>
                                            <Form.Control
                                                type="date"
                                                name="EndDate"
                                                value={this.state.form.EndDate?moment(this.state.form.EndDate).format('YYYY-MM-DD'):""}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.EndDate||this.state.validationCreateForm.DifferenceDate}

                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.EndDate||this.state.validationCreateForm.DifferenceDate}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={3}>
                                            <Form.Label>Keterangan</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="HolidayName"
                                                value={this.state.form.HolidayName}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.HolidayName}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.HolidayName }</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="edit-Holiday" onClick={this.handleEditHoliday}>Submit</Button>
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
export default HolidayNation;
