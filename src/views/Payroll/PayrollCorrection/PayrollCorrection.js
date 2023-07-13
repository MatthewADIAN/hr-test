import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Form, Spinner, FormGroup, Row, Col, Table, Button, Modal } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';

import Service from './Service';
import MasterService from '../../Master/Service';
import AttendanceService from '../../Attendance/Service';
import swal from 'sweetalert';

import './style.css';
const moment = require('moment');


class PayrollCorrection extends Component {

  typeaheadEmployee = {};

  state = {
    loading: false,
    size: 10,
    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],
    selectedItem: null,
    keyword: "",
    form: {},
    isCreateLoading: false,
    isShowAddPayrollCorrectionModal: false,
    selectedEmployee: [],
    isShowDeletePayrollCorrectionModal: false,

    isShowEditPayrollCorrectionModal: false,
    isShowViewPayrollCorrectionModal: false,
    isEditLoading: false,

    validationCreateForm: {},

    corrections: [
      { name: "Koreksi Tambah", label: "Koreksi Tambah", value: "Koreksi Tambah" },
      { name: "Koreksi Kurang", label: "Koreksi Kurang", value: "Koreksi Kurang" },
    ],


    isAutoCompleteLoading: false,
    payrollCorrections: []
  }

  resetModalValue = (isCreate) => {
    if (isCreate) {
      this.setState({
        validationCreateForm: {},
        form: {
          StartDate: this.state.form?.StartDate,
          EndDate: this.state.form?.EndDate,
        },
        selectedEmployee: [],
      })
    } else {
      this.setState({
        validationCreateForm: {},
        form: {},
        selectedEmployee: [],
      })
    }
  }

  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1
    })
  }

  constructor(props) {
    super(props);
    this.service = new Service();
    this.masterService = new MasterService();
    this.attendanceService = new AttendanceService();
  }

  componentDidMount() {
    this.setData();
  }

  setData = () => {
    const params = {
      page: this.state.activePage,
      size: this.state.size,
      keyword: this.state.keyword,
      adminEmployeeId: Number(localStorage.getItem("employeeId"))
    };

    this.setState({ loadingData: true })
    this.service
      .search(params)
      .then((result) => {
        if (result) {
          this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
        }

      });
  }

  search = (keyword) => {
    this.setState({ page: 1, keyword: keyword }, () => {
      this.setData();
    })
  }

  create = () => {
    this.showAddPayrollCorrectionModal(true);
  }

  showAddPayrollCorrectionModal = (value) => {
    this.resetModalValue(true);
    this.setState({ isShowAddPayrollCorrectionModal: value, validationCreateForm: {} });
  }

  showDeletePayrollCorrectionModal = (value) => {
    this.resetModalValue(false);
    this.setState({ isShowDeletePayrollCorrectionModal: value });
  }

  showEditPayrollCorrectionModal = (value) => {
    this.setState({ isShowEditPayrollCorrectionModal: value });
  }

  showViewPayrollCorrectionModal = (value) => {
    this.setState({ isShowViewPayrollCorrectionModal: value });
  }

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  }

  handleCreatePayrollCorrection = () => {
    const payload = {
      CorrectionType: this.state.form?.CorrectionType,
      StartDate: this.state.form?.StartDate,
      EndDate: this.state.form?.EndDate,
      EmployeeId: this.state.form?.EmployeeId,
      EmployeeIdentity: this.state.form?.EmployeeIdentity,
      EmployeeName: this.state.form?.EmployeeName,
      UnitName: this.state.form?.UnitName,
      UnitId: this.state.form?.UnitId,
      SectionName: this.state.form?.SectionName,
      SectionId: this.state.form?.SectionId,
      GroupName: this.state.form?.GroupName,
      GroupId: this.state.form?.GroupId,
      Remark: this.state.form?.Remark,
      TotalCorrection: this.state.form?.TotalCorrection,
    }

    this.setState({ isCreateLoading: true });
    this.service.create(payload)
      .then(() => {

        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil disimpan!'
        })
        this.setState({ isCreateLoading: false }, () => {

          this.resetModalValue(true);
          this.resetPagingConfiguration();
          this.setData();
          this.showAddPayrollCorrectionModal(true);
        });
      })
      .catch((error) => {
        if (error.response) {
          let message = "Cek Form Isian, Isian Mandatory tidak boleh kosong\n";

          const errorMessage = error.response.data.error
          // console.log(Object.keys(error).forEach(e => console.log(`key=${e}  value=${error[e]}`)));
          Object.keys(errorMessage).forEach(e => {
            if (e) {
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

  handleEditPayrollCorrection = () => {
    const payload = {
      Id: this.state.form?.Id,
      CorrectionType: this.state.form?.CorrectionType,
      StartDate: this.state.form?.StartDate,
      EndDate: this.state.form?.EndDate,
      EmployeeId: this.state.form?.EmployeeId,
      EmployeeIdentity: this.state.form?.EmployeeIdentity,
      EmployeeName: this.state.form?.EmployeeName,
      UnitName: this.state.form?.UnitName,
      UnitId: this.state.form?.UnitId,
      SectionName: this.state.form?.SectionName,
      SectionId: this.state.form?.SectionId,
      GroupName: this.state.form?.GroupName,
      GroupId: this.state.form?.GroupId,
      Remark: this.state.form?.Remark,
      TotalCorrection: this.state.form?.TotalCorrection,
    }

    this.setState({ isEditLoading: true });
    this.service.edit(this.state.selectedItem?.Id, payload)
      .then(() => {

        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil diubah!'
        })
        this.setState({ isEditLoading: false }, () => {

          this.resetModalValue(false);
          this.resetPagingConfiguration();
          this.setData();
          this.showEditPayrollCorrectionModal(false);
        });
      })
      .catch((error) => {
        this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
      });
  }

  handleEditPayrollCorrectionClick = (item) => {
    this.setState({ selectedItem: item });
    this.service.getById(item.Id)
      .then((payrollCorrection) => {
        var { corrections, selectedEmployee } = this.state;
        let correction = corrections.find((element) => element.value === payrollCorrection.CorrectionType);

        payrollCorrection["selectedCorrectionType"] = correction;
        var employee = {
          Id: payrollCorrection.EmployeeId,
          EmployeeIdentity: payrollCorrection.EmployeeIdentity,
          Name: payrollCorrection.EmployeeName,
          NameAndEmployeeIdentity: `${payrollCorrection.EmployeeIdentity} - ${payrollCorrection.EmployeeName}`,
          UnitId: payrollCorrection.UnitId,
          Unit: payrollCorrection.UnitName,
          SectionId: payrollCorrection.SectionId,
          Section: payrollCorrection.SectionName,
          GroupId: payrollCorrection.GroupId,
          Group: payrollCorrection.GroupName
        }
        selectedEmployee.push(employee);
        this.setState({ form: payrollCorrection, selectedEmployee: selectedEmployee }, () => {
          this.showEditPayrollCorrectionModal(true);
        })
      })
  }

  handleViewPayrollCorrectionClick = (item) => {
    this.setState({ selectedItem: item });
    this.service.getById(item.Id)
      .then((employee) => {
        this.setState({ form: employee }, () => {
          this.showViewPayrollCorrectionModal(true);
        })
      })
  }

  handleEmployeeSearchModal = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const params = {
      keyword: query,
      statusEmployee: "AKTIF"
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

  handleDeletePayrollCorrectionClick = (item) => {
    this.setState({ selectedItem: item }, () => {
      this.showDeletePayrollCorrectionModal(true);
    })
  }

  deletePayrollCorrectionClickHandler = () => {
    this.setState({ isDeletePayrollCorrectionLoading: true })
    this.service.delete(this.state.selectedItem?.Id)
      .then(() => {

        swal({
          icon: 'success',
          title: 'Good...',
          text: 'Data berhasil dihapus!'
        })
        this.setState({ isDeletePayrollCorrectionLoading: false, selectedItem: null }, () => {

          this.resetPagingConfiguration();
          this.setData();
          this.showDeletePayrollCorrectionModal(false);
        });
      })
  }

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item) => {

      return (
        <tr key={item.Id} data-category={item.Id}>
          <td>{item.CorrectionType}</td>
          <td>{item.EmployeeIdentity}</td>
          <td>{item.EmployeeName}</td>
          <td>
            <FormGroup>
              <RowButtonComponent className="btn btn-success" name="view-payrollCorrection" onClick={this.handleViewPayrollCorrectionClick} data={item} iconClassName="fa fa-eye" label=""></RowButtonComponent>
              <RowButtonComponent className="btn btn-primary" name="edit-payrollCorrection" onClick={this.handleEditPayrollCorrectionClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
              <RowButtonComponent className="btn btn-danger" name="delete-payrollCorrection" onClick={this.handleDeletePayrollCorrectionClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
            </FormGroup>
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
              <Row className="headerRow">
                <Col sm={4}>
                  <Button className="btn btn-success mr-5" name="create" onClick={this.create}>Tambah Data</Button>
                </Col>
                <Col sm={4}></Col>
                <Col sm={4}>
                  <Form.Control
                    className="float-right"
                    type="text"
                    name="Code"
                    value={this.state.keyword}
                    onChange={(e) => {
                      return this.search(e.target.value);
                    }}
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
                        <th>Jenis Koreksi</th>
                        <th>NIK</th>
                        <th>Nama</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>{items}</tbody>
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

            <Modal size={'lg'} aria-labelledby="modal_add_payrollCorrection" show={this.state.isShowAddPayrollCorrectionModal} onHide={() => this.showAddPayrollCorrectionModal(false)} animation={true}>
              <Modal.Header closeButton>
                <Modal.Title id="modal_add_payrollCorrection">Tambah Koreksi Upah</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Jenis Koreksi</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      className={this.state.validationCreateForm.CorrectionType ? 'invalid-select' : ''}
                      options={this.state.corrections}
                      value={this.state.form.selectedCorrectionType}
                      onChange={(e) => {
                        var { form } = this.state;
                        form["CorrectionType"] = e.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={!!this.state.validationCreateForm.CorrectionType}
                    />
                    <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.CorrectionType}</Form.Control.Feedback>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Periode Upah</Form.Label>
                  </Col>
                  <Col>
                    <Row>
                      <Col sm={5}>
                        <Form.Control
                          type="date"
                          name="StartDate"
                          id="StartDate"
                          value={this.state.form.StartDate ? moment(this.state.form.StartDate).format('YYYY-MM-DD') : ""}
                          onChange={(val) => {
                            var { form } = this.state;
                            form["StartDate"] = val.target.value;
                            return this.setState({ form: form });
                          }}
                          isInvalid={this.state.validationCreateForm.StartDate ? true : null}>
                        </Form.Control>
                      </Col>
                      <Col sm={2} className={'text-center'}>s/d</Col>
                      <Col sm={5}>
                        <Form.Control
                          type="date"
                          name="EndDate"
                          id="EndDate"
                          value={this.state.form.EndDate ? moment(this.state.form.EndDate).format('YYYY-MM-DD') : ""}
                          onChange={(val) => {
                            console.log(val.target.value);
                            var { form } = this.state;
                            form["EndDate"] = val.target.value;
                            return this.setState({ form: form });
                          }}
                          isInvalid={this.state.validationCreateForm.EndDate ? true : null}>
                        </Form.Control>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col>
                    <AsyncTypeahead
                      id="loader-employee-create-form"
                      className={this.state.validationCreateForm.Employee ? 'invalid-select' : ''}
                      ref={(typeahead) => { this.typeaheadEmployeeCreateForm = typeahead }}
                      isLoading={this.state.isAutoCompleteLoading}
                      onChange={(selected) => {
                        var { form, selectedEmployee } = this.state;
                        form["EmployeeId"] = selected[0]?.Id;
                        form["EmployeeIdentity"] = selected[0]?.EmployeeIdentity;
                        form["EmployeeName"] = selected[0]?.Name;
                        form["UnitId"] = selected[0]?.UnitId;
                        form["UnitName"] = selected[0]?.Unit;
                        form["SectionId"] = selected[0]?.SectionId;
                        form["SectionName"] = selected[0]?.Section;
                        form["GroupId"] = selected[0]?.GroupId;
                        form["GroupName"] = selected[0]?.Group;
                        selectedEmployee = selected;
                        this.setState({ form: form, selectedEmployee: selectedEmployee });
                      }}
                      selected={this.state.selectedEmployee}
                      labelKey="NameAndEmployeeIdentity"
                      minLength={1}
                      onSearch={this.handleEmployeeSearchModal}
                      options={this.state.employees}
                      placeholder="Cari karyawan..."
                      isInvalid={!!this.state.validationCreateForm.EmployeeId ? true : false}
                    />
                    <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.EmployeeId}</Form.Control.Feedback>
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
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.UnitName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.SectionName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Grup</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.GroupName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Keterangan</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      as="textarea"
                      name="Remark"
                      value={this.state.form.Remark}
                      onChange={(e) => {
                        var { form } = this.state;
                        form[e.target.name] = e.target.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={this.state.validationCreateForm.Remark}
                    />
                    <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Remark}</Form.Control.Feedback>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nominal</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      name="TotalCorrection"
                      value={this.state.form.TotalCorrection}
                      onChange={(e) => {
                        var { form } = this.state;
                        form[e.target.name] = e.target.value;

                        return this.setState({ form: form });
                      }}
                      isInvalid={this.state.validationCreateForm.TotalCorrection ? true : null}
                    />
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                  <div>
                    <Button className="btn btn-success" name="create-payrollCorrection" onClick={this.handleCreatePayrollCorrection}>Submit</Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal aria-labelledby="modal-delete-payrollCorrection" show={this.state.isShowDeletePayrollCorrectionModal} onHide={() => this.showDeletePayrollCorrectionModal(false)} animation={true}>
              <Modal.Header closeButton>
                <Modal.Title id="modal-delete-payrollCorrection">Hapus Koreksi Upah</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Apakah anda yakin ingin menghapus data ini?
              </Modal.Body>
              <Modal.Footer>
                {this.state.isDeletePayrollCorrectionLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                  <div>
                    <Button className="btn btn-danger" name="delete-payrollCorrection" onClick={this.deletePayrollCorrectionClickHandler}>Hapus</Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal size={'lg'} aria-labelledby="modal-edit-payrollCorrection" show={this.state.isShowEditPayrollCorrectionModal} onHide={() => this.showEditPayrollCorrectionModal(false)} animation={true}>
              <Modal.Header closeButton>
                <Modal.Title id="modal-edit-payrollCorrection">Edit Koreksi Upah</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Jenis Koreksi</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      className={this.state.validationCreateForm.CorrectionType ? 'invalid-select' : ''}
                      options={this.state.corrections}
                      value={this.state.form.selectedCorrectionType}
                      onChange={(e) => {
                        var { form } = this.state;
                        form["CorrectionType"] = e.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={!!this.state.validationCreateForm.CorrectionType}
                    />
                    <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.CorrectionType}</Form.Control.Feedback>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Periode Upah</Form.Label>
                  </Col>
                  <Col>
                    <Row>
                      <Col sm={5}>
                        <Form.Control
                          type="date"
                          name="StartDate"
                          id="StartDate"
                          value={this.state.form.StartDate ? moment(this.state.form.StartDate).format('YYYY-MM-DD') : ""}
                          onChange={(val) => {
                            var { form } = this.state;
                            form["StartDate"] = val.target.value;
                            return this.setState({ form: form });
                          }}
                          isInvalid={this.state.validationCreateForm.StartDate ? true : null}>
                        </Form.Control>
                      </Col>
                      <Col sm={2} className={'text-center'}>s/d</Col>
                      <Col sm={5}>
                        <Form.Control
                          type="date"
                          name="EndDate"
                          id="EndDate"
                          value={this.state.form.EndDate ? moment(this.state.form.EndDate).format('YYYY-MM-DD') : ""}
                          onChange={(val) => {
                            console.log(val.target.value);
                            var { form } = this.state;
                            form["EndDate"] = val.target.value;
                            return this.setState({ form: form });
                          }}
                          isInvalid={this.state.validationCreateForm.EndDate ? true : null}>
                        </Form.Control>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col>
                    <AsyncTypeahead
                      id="loader-employee-create-form"
                      className={this.state.validationCreateForm.Employee ? 'invalid-select' : ''}
                      ref={(typeahead) => { this.typeaheadEmployeeCreateForm = typeahead }}
                      isLoading={this.state.isAutoCompleteLoading}
                      onChange={(selected) => {
                        var { form, selectedEmployee } = this.state;
                        form["EmployeeId"] = selected[0]?.Id;
                        form["EmployeeIdentity"] = selected[0]?.EmployeeIdentity;
                        form["EmployeeName"] = selected[0]?.Name;
                        form["UnitId"] = selected[0]?.UnitId;
                        form["UnitName"] = selected[0]?.Unit;
                        form["SectionId"] = selected[0]?.SectionId;
                        form["SectionName"] = selected[0]?.Section;
                        form["GroupId"] = selected[0]?.GroupId;
                        form["GroupName"] = selected[0]?.Group;
                        selectedEmployee = selected;
                        this.setState({ form: form, selectedEmployee: selectedEmployee });
                      }}
                      selected={this.state.selectedEmployee}
                      labelKey="NameAndEmployeeIdentity"
                      minLength={1}
                      onSearch={this.handleEmployeeSearchModal}
                      options={this.state.employees}
                      placeholder="Cari karyawan..."
                      isInvalid={!!this.state.validationCreateForm.EmployeeId ? true : false}
                    />
                    <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.EmployeeId}</Form.Control.Feedback>
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
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.UnitName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.SectionName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Grup</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.GroupName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Keterangan</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      as="textarea"
                      name="Remark"
                      value={this.state.form.Remark}
                      onChange={(e) => {
                        var { form } = this.state;
                        form[e.target.name] = e.target.value;
                        return this.setState({ form: form });
                      }}
                      isInvalid={this.state.validationCreateForm.Remark}
                    />
                    <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Remark}</Form.Control.Feedback>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nominal</Form.Label>
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      name="TotalCorrection"
                      value={this.state.form.TotalCorrection}
                      onChange={(e) => {
                        var { form } = this.state;
                        form[e.target.name] = e.target.value;

                        return this.setState({ form: form });
                      }}
                      isInvalid={this.state.validationCreateForm.TotalCorrection ? true : null}
                    />
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                  <div>
                    <Button className="btn btn-success" name="edit-payrollCorrection" onClick={this.handleEditPayrollCorrection}>Submit</Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal size={'lg'} aria-labelledby="modal-view-payrollCorrection" show={this.state.isShowViewPayrollCorrectionModal} onHide={() => this.showViewPayrollCorrectionModal(false)} animation={true}>
              <Modal.Header closeButton>
                <Modal.Title id="modal-view-payrollCorrection">Lihat Koreksi Upah</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Jenis Koreksi</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.CorrectionType}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Periode Upah</Form.Label>
                  </Col>
                  <Col>
                    <Row>
                      <Col sm={5}>
                        <Form.Label>{this.state.form?.StartDate ? moment(this.state.form?.StartDate).format('DD-MM-YYYY') : ""}</Form.Label>
                      </Col>
                      <Col sm={2} className={'text-center'}>s/d</Col>
                      <Col sm={5}>
                        <Form.Label>{this.state.form?.EndDate ? moment(this.state.form?.EndDate).format('DD-MM-YYYY') : ""}</Form.Label>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.EmployeeIdentity + " - " + this.state.form?.EmployeeName}</Form.Label>
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
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.UnitName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.SectionName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Grup</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.GroupName}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Keterangan</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.Remark}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nominal</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.TotalCorrection}</Form.Label>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
              </Modal.Footer>
            </Modal>

          </Form>
        )}

      </div>
    );
  }
}

export default PayrollCorrection;
