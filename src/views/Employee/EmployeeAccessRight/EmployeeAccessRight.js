import React, { Component } from "react";
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import {
  Form,
  Spinner,
  FormGroup,
  Row,
  Col,
  Table,
  Button,
  Modal,
} from "react-bootstrap";
import Select from "react-select";
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from "./../../../react-components/RowButtonComponent";

import Service from "./Service";
import MasterService from "../../Master/Service";
import AttendanceService from "../../Attendance/Service";
import swal from "sweetalert";

import "./style.css";

class EmployeeAccesRight extends Component {
  typeaheadEmployee = {};

  state = {
    loading: false,

    activePage: 1,
    total: 0,
    loadingData: false,
    tableData: [],
    selectedItem: null,

    form: {},
    isCreateLoading: false,
    isShowAddEmployeeAccessRightModal: false,

    isShowDeleteEmployeeAccessRightModal: false,

    isShowEditEmployeeAccessRightModal: false,
    isShowViewEmployeeAccessRightModal: false,
    isEditLoading: false,

    isShowUploadModal: false,
    selectedFile: null,

    validationCreateForm: {},

    types: [
      { name: "Bulanan", label: "Bulanan", value: "Bulanan" },
      { name: "Tahunan", label: "Tahunan", value: "Tahunan" },
    ],
    annualLeaveOptions: [
      { name: "YA", label: "YA", value: true },
      { name: "TIDAK", label: "TIDAK", value: false },
    ],

    selectedUnitFilter: null,
    units: [],
    selectedGroupFilter: null,
    groups: [],
    selectedSectionFilter: null,
    sections: [],
    selectedEmployeeFilter: null,
    isAutoCompleteLoading: false,
    employees: [],
    roles: [
      { name: "Pimpinan", label: "Pimpinan", value: "Pimpinan" },
      {
        name: "Personalia Pusat",
        label: "Personalia Pusat",
        value: "Personalia Pusat",
      },
      {
        name: "Personalia Bagian",
        label: "Personalia Bagian",
        value: "Personalia Bagian",
      },
      { name: "Upah", label: "Upah", value: "Upah" },
      { name: "HRD", label: "HRD", value: "HRD" },
    ],
    selectedRoleFilter: null,
    allUnits: [],
  };

  resetFilter = () => {
    this.setState({
      selectedEmployeeFilter: null,
      selectedRoleFilter: null,
    });
    this.typeaheadEmployee.clear();
  };

  resetModalValue = () => {
    this.setState({
      validationCreateForm: {},
      form: {},
    });
  };

  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
    });
  };

  constructor(props) {
    super(props);
    this.service = new Service();
    this.masterService = new MasterService();
    this.attendanceService = new AttendanceService();
  }

  componentDidMount() {
    this.setData();
    this.getAllUnit();
  }

  setData = () => {
    const params = {
      page: this.state.activePage,
      accessRole: this.state.selectedRoleFilter?.value,
      employeeId: this.state.selectedEmployeeFilter?.Id,
      hasAccessRight: true,
      status: "AKTIF",
    };

    this.setState({ loadingData: true });
    this.service.search(params).then((result) => {
      if (result) {
        this.setState({
          activePage: result.page,
          total: result.total,
          tableData: result.data,
          loadingData: false,
        });
      }
    });
  };

  getAllUnit = () => {
    this.setState({ loadingData: true });
    this.masterService.getAllUnits().then((result) => {
      if (result.length > 0) {
        let allUnits = result.map((d) => {
          return {
            value: d.Id,
            name: d.Name,
            label: d.Name,
          };
        });
        this.setState({ allUnits });
      }
    });
  };

  search = () => {
    this.setData();
  };

  create = () => {
    this.showAddEmployeeAccessRightModal(true);
  };

  showAddEmployeeAccessRightModal = (value) => {
    this.resetModalValue();
    this.setState({
      isShowAddEmployeeAccessRightModal: value,
      validationCreateForm: {},
    });
  };

  showDeleteEmployeeAccessRightModal = (value) => {
    this.resetModalValue();
    this.setState({ isShowDeleteEmployeeAccessRightModal: value });
  };

  showEditEmployeeAccessRightModal = (value) => {
    this.setState({ isShowEditEmployeeAccessRightModal: value });
  };

  showViewEmployeeAccessRightModal = (value) => {
    this.setState({ isShowViewEmployeeAccessRightModal: value });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.setData();
    });
  };

  handleCreateEmployeeAccessRight = () => {
    if (!this.state.form?.AccessRole) {
      this.setState({
        validationCreateForm: { AccessRole: "Hak Akses harus diisi" },
      });
    } else if (
      this.state.form?.AccessRole != "Personalia Pusat" &&
      (!this.state.form.AccessUnits ||
        this.state.form?.AccessUnits.length === 0)
    ) {
      this.setState({
        validationCreateForm: { AccessUnits: "Akses unit harus diisi" },
      });
    } else {
      const payload = {
        EmployeeId: this.state.form?.EmployeeId,
        AccessRole: this.state.form?.AccessRole,
        UnitIds: this.state.form?.AccessUnits
          ? this.state.form?.AccessUnits.map((d) => {
              return {
                EmployeeId: this.state.form?.EmployeeId,
                UnitId: d.value,
                UnitName: d.label,
              };
            })
          : [],
      };

      this.setState({ isCreateLoading: true });
      this.service
        .create(payload)
        .then(() => {
          swal({
            icon: "success",
            title: "Good...",
            text: "Data berhasil disimpan!",
          });
          this.setState({ isCreateLoading: false }, () => {
            this.resetModalValue();
            this.resetPagingConfiguration();
            this.setData();
            this.showAddEmployeeAccessRightModal(false);
          });
        })
        .catch((error) => {
          if (error.response) {
            this.setState({
              validationCreateForm: error.response.data.error,
              isCreateLoading: false,
            });
          }
        });
    }
  };

  handleEditEmployeeAccessRight = () => {
    if (!this.state.form?.AccessRole) {
      this.setState({
        validationCreateForm: { AccessRole: "Hak Akses harus diisi" },
      });
    } else if (
      this.state.form?.AccessRole != "Personalia Pusat" &&
      (!this.state.form.AccessUnits ||
        this.state.form?.AccessUnits.length === 0)
    ) {
      this.setState({
        validationCreateForm: { AccessUnits: "Akses unit harus diisi" },
      });
    } else {
      const payload = {
        EmployeeId: this.state.form?.EmployeeId,
        AccessRole: this.state.form?.AccessRole,
        UnitIds: this.state.form?.AccessUnits
          ? this.state.form?.AccessUnits.map((d) => {
              return {
                EmployeeId: this.state.form?.EmployeeId,
                UnitId: d.value,
                UnitName: d.label,
              };
            })
          : [],
      };

      this.setState({ isEditLoading: true });
      this.service
        .edit(this.state.selectedItem?.Id, payload)
        .then(() => {
          swal({
            icon: "success",
            title: "Good...",
            text: "Data berhasil diubah!",
          });
          this.setState({ isEditLoading: false }, () => {
            this.resetModalValue();
            this.resetPagingConfiguration();
            this.setData();
            this.showEditEmployeeAccessRightModal(false);
          });
        })
        .catch((error) => {
          this.setState({
            validationCreateForm: error.response.data.error,
            isEditLoading: false,
          });
        });
    }
  };

  getAccessUnits = (EmployeeUnitAccessItems) => {
    let res = EmployeeUnitAccessItems.map((d) => {
      return {
        value: d.UnitId,
        label: d.UnitName,
        name: d.UnitName,
      };
    });
    return res;
  };

  handleEditEmployeeAccessRightClick = (item) => {
    this.setState({ selectedItem: item });
    this.service.getById(item.Id).then((employee) => {
      const { types, roles } = this.state;
      let type = types.find((element) => element.value === employee.Type);
      let isDeductedFromAnnualLeave = types.find(
        (element) => element.value === employee.IsDeductedFromAnnualLeave
      );
      let accessRole = roles.find(
        (element) => element.value === employee.AccessRole
      );
      employee["type"] = type;
      employee["EmployeeId"] = employee.Id;
      employee["isDeductedFromAnnualLeave"] = isDeductedFromAnnualLeave;
      employee["selectedAccessRole"] = accessRole;
      employee["AccessUnits"] = this.getAccessUnits(
        employee.EmployeeUnitAccessItems
      );
      this.setState({ form: employee }, () => {
        this.showEditEmployeeAccessRightModal(true);
      });
    });
  };

  getAccessUnitsString = (EmployeeUnitAccessItems) => {
    let res = EmployeeUnitAccessItems.reduce(
      (acc, curr, i) =>
        acc +
        curr.UnitName +
        (i == EmployeeUnitAccessItems.length - 1 ? " " : ", "),
      ""
    );

    if (res == "") res = "-";
    return res;
  };

  handleViewEmployeeAccessRightClick = (item) => {
    this.setState({ selectedItem: item });
    this.service.getById(item.Id).then((employee) => {
      let new_item = this.getAccessUnitsString(
        employee.EmployeeUnitAccessItems
      );
      employee.EmployeeUnitAccessItems = new_item;
      this.setState({ form: employee }, () => {
        this.showViewEmployeeAccessRightModal(true);
      });
    });
  };

  handleEmployeeSearch = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const params = {
      unitId: this.selectedUnit ? this.selectedUnit.Id : 0,
      keyword: query,
    };

    this.attendanceService.searchEmployee(params).then((result) => {
      result = result.map((employee) => {
        employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} - ${employee.Name}`;
        return employee;
      });
      this.setState({ employees: result }, () => {
        this.setState({ isAutoCompleteLoading: false });
      });
    });
  };

  handleEmployeeSearchModal = (query) => {
    this.setState({ isAutoCompleteLoading: true });

    const params = {
      hasAccessRight: false,
      keyword: query,
      status: "AKTIF",
    };

    this.service.search(params).then((result) => {
      result = result.data.map((employee) => {
        employee.NameAndEmployeeIdentity = `${employee.EmployeeIdentity} - ${employee.Name}`;
        return employee;
      });
      this.setState({ employees: result }, () => {
        this.setState({ isAutoCompleteLoading: false });
      });
    });
  };

  handleDeleteEmployeeAccessRightClick = (item) => {
    this.setState({ selectedItem: item }, () => {
      this.showDeleteEmployeeAccessRightModal(true);
    });
  };

  deleteEmployeeAccessRightClickHandler = () => {
    this.setState({ isDeleteEmployeeAccessRightLoading: true });
    this.service.delete(this.state.selectedItem?.Id).then(() => {
      swal({
        icon: "success",
        title: "Good...",
        text: "Data berhasil dihapus!",
      });
      this.setState(
        { isDeleteEmployeeAccessRightLoading: false, selectedItem: null },
        () => {
          this.resetPagingConfiguration();
          this.setData();
          this.showDeleteEmployeeAccessRightModal(false);
        }
      );
    });
  };

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item) => {
      return (
        <tr key={item.Id} data-category={item.Id}>
          <td>{item.EmployeeIdentity}</td>
          <td>{item.Name}</td>
          <td>{item.Unit}</td>
          <td>{item.Section}</td>
          <td>{item.Group}</td>
          <td>{item.AccessRole}</td>
          <td>
            <FormGroup>
              <RowButtonComponent
                className="btn btn-success"
                name="view-employeeAccessRight"
                onClick={this.handleViewEmployeeAccessRightClick}
                data={item}
                iconClassName="fa fa-eye"
                label=""
              ></RowButtonComponent>
              <RowButtonComponent
                className="btn btn-primary"
                name="edit-employeeAccessRight"
                onClick={this.handleEditEmployeeAccessRightClick}
                data={item}
                iconClassName="fa fa-pencil-square"
                label=""
              ></RowButtonComponent>
              <RowButtonComponent
                className="btn btn-danger"
                name="delete-employeeAccessRight"
                onClick={this.handleDeleteEmployeeAccessRightClick}
                data={item}
                iconClassName="fa fa-trash"
                label=""
              ></RowButtonComponent>
            </FormGroup>
          </td>
        </tr>
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
              <Row className="headerRow">
                <Col sm={6}>
                  <Button
                    className="btn btn-success mr-5"
                    name="create"
                    onClick={this.create}
                  >
                    Tambah Data
                  </Button>
                </Col>
              </Row>
              <Row className="headerRow">
                <Col sm={4}>
                  <Select
                    placeholder={"pilih hak akses..."}
                    isClearable={true}
                    options={this.state.roles}
                    value={this.state.selectedRoleFilter}
                    onChange={(value) => {
                      this.setState({ selectedRoleFilter: value });
                    }}
                  ></Select>
                </Col>
              </Row>
              <Row className="headerRow">
                <Col sm={4}>
                  <AsyncTypeahead
                    id="loader-employee"
                    ref={(typeahead) => {
                      this.typeaheadEmployee = typeahead;
                    }}
                    isLoading={this.state.isAutoCompleteLoading}
                    onChange={(selected) => {
                      this.setState({ selectedEmployeeFilter: selected[0] });
                    }}
                    labelKey="NameAndEmployeeIdentity"
                    minLength={1}
                    onSearch={this.handleEmployeeSearch}
                    options={this.state.employees}
                    placeholder="Cari karyawan..."
                  />
                </Col>
              </Row>
              <Row className="headerRow">
                <Col sm={6}>
                  <Button
                    className="btn btn-light mr-2"
                    name="reset"
                    onClick={this.resetFilter}
                  >
                    Reset
                  </Button>
                  <Button
                    className="btn btn-primary mr-2"
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
                        <th>Hak Akses</th>
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

            <Modal
              dialogClassName="modal-90w"
              aria-labelledby="modal_add_employeeAccessRight"
              show={this.state.isShowAddEmployeeAccessRightModal}
              onHide={() => this.showAddEmployeeAccessRightModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal_add_employeeAccessRight">
                  Tambah Role Karyawan
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col>
                    <AsyncTypeahead
                      id="loader-employee-create-form"
                      className={
                        this.state.validationCreateForm.Employee
                          ? "invalid-select"
                          : ""
                      }
                      ref={(typeahead) => {
                        this.typeaheadEmployeeCreateForm = typeahead;
                      }}
                      isLoading={this.state.isAutoCompleteLoading}
                      onChange={(selected) => {
                        const { form } = this.state;
                        form["employee"] = selected[0];
                        form["EmployeeId"] = selected[0]?.Id;
                        this.setState({ form: form }, () => {});
                      }}
                      labelKey="NameAndEmployeeIdentity"
                      minLength={1}
                      onSearch={this.handleEmployeeSearchModal}
                      options={this.state.employees}
                      placeholder="Cari karyawan..."
                      isInvalid={
                        this.state.validationCreateForm.Employee ? true : false
                      }
                    />
                    {this.state.validationCreateForm.Employee && (
                      <span style={{ color: "#dc3545", fontSize: 10 }}>
                        {this.state.validationCreateForm.Employee}
                      </span>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.employee?.Name}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.employee?.Unit}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>
                      {this.state.form?.employee?.Section}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Grup</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.employee?.Group}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Hak Akses</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      className={
                        this.state.validationCreateForm.AccessRole
                          ? "invalid-select"
                          : ""
                      }
                      options={this.state.roles}
                      value={this.state.form.selectedAccessRole}
                      onChange={(e) => {
                        var { form } = this.state;
                        form["AccessRole"] = e.value;
                        return this.setState({
                          form: form,
                          validationCreateForm: {
                            ...this.state.validationCreateForm,
                            AccessRole: null,
                            AccessUnits: null,
                          },
                        });
                      }}
                      isInvalid={this.state.validationCreateForm.AccessRole}
                    />
                    {this.state.validationCreateForm.AccessRole && (
                      <span style={{ color: "#dc3545", fontSize: 10 }}>
                        {this.state.validationCreateForm.AccessRole}
                      </span>
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Akses Unit</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      isMulti
                      className={
                        this.state.validationCreateForm.AccessUnits
                          ? "invalid-select"
                          : ""
                      }
                      options={this.state.allUnits}
                      value={this.state.form.AccessUnits}
                      onChange={(e) => {
                        var { form } = this.state;
                        form["AccessUnits"] = e;
                        return this.setState({
                          form: form,
                          validationCreateForm: {
                            ...this.state.validationCreateForm,
                            AccessUnits: null,
                          },
                        });
                      }}
                      isInvalid={
                        this.state.validationCreateForm.AccessUnits
                          ? true
                          : null
                      }
                    />
                    {this.state.validationCreateForm.AccessUnits && (
                      <span style={{ color: "#dc3545", fontSize: 10 }}>
                        {this.state.validationCreateForm.AccessUnits}
                      </span>
                    )}
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
                      name="create-employeeAccessRight"
                      onClick={this.handleCreateEmployeeAccessRight}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal
              aria-labelledby="modal-delete-employeeAccessRight"
              show={this.state.isShowDeleteEmployeeAccessRightModal}
              onHide={() => this.showDeleteEmployeeAccessRightModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-delete-employeeAccessRight">
                  Hapus Role Karyawan
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Apakah anda yakin ingin menghapus data ini?
              </Modal.Body>
              <Modal.Footer>
                {this.state.isDeleteEmployeeAccessRightLoading ? (
                  <span>
                    <Spinner size="sm" color="primary" /> Mohon tunggu...
                  </span>
                ) : (
                  <div>
                    <Button
                      className="btn btn-danger"
                      name="delete-employeeAccessRight"
                      onClick={this.deleteEmployeeAccessRightClickHandler}
                    >
                      Hapus
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal
              dialogClassName="modal-90w"
              aria-labelledby="modal-edit-employeeAccessRight"
              show={this.state.isShowEditEmployeeAccessRightModal}
              onHide={() => this.showEditEmployeeAccessRightModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-edit-employeeAccessRight">
                  Edit Role Karyawan
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>
                      {this.state.selectedItem?.EmployeeIdentity}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.selectedItem?.Name}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.selectedItem?.Unit}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.selectedItem?.Section}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Grup</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.selectedItem?.Group}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Hak Akses</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      className={
                        this.state.validationCreateForm.AccessRole
                          ? "invalid-select"
                          : ""
                      }
                      options={this.state.roles}
                      value={this.state.form.selectedAccessRole}
                      onChange={(e) => {
                        var { form } = this.state;
                        form["AccessRole"] = e.value;
                        form["selectedAccessRole"] = e;
                        return this.setState({
                          form: form,
                          validationCreateForm: {
                            ...this.state.validationCreateForm,
                            AccessRole: null,
                            AccessUnits: null,
                          },
                        });
                      }}
                      isInvalid={this.state.validationCreateForm.AccessRole}
                    />
                    {this.state.validationCreateForm.AccessRole && (
                      <span style={{ color: "#dc3545", fontSize: 10 }}>
                        {this.state.validationCreateForm.AccessRole}
                      </span>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Akses Unit</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      isMulti
                      className={
                        this.state.validationCreateForm.AccessUnits
                          ? "invalid-select"
                          : ""
                      }
                      options={this.state.allUnits}
                      value={this.state.form.AccessUnits}
                      onChange={(e) => {
                        var { form } = this.state;
                        form["AccessUnits"] = e;
                        return this.setState({
                          form: form,
                          validationCreateForm: {
                            ...this.state.validationCreateForm,
                            AccessUnits: null,
                          },
                        });
                      }}
                      isInvalid={this.state.validationCreateForm.AccessUnits}
                    />
                    {this.state.validationCreateForm.AccessUnits && (
                      <span style={{ color: "#dc3545", fontSize: 10 }}>
                        {this.state.validationCreateForm.AccessUnits}
                      </span>
                    )}
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
                      name="edit-employeeAccessRight"
                      onClick={this.handleEditEmployeeAccessRight}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal
              dialogClassName="modal-90w"
              aria-labelledby="modal-view-employeeAccessRight"
              show={this.state.isShowViewEmployeeAccessRightModal}
              onHide={() => this.showViewEmployeeAccessRightModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-view-employeeAccessRight">
                  Lihat Role Karyawan
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>NIK</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>
                      {this.state.selectedItem?.EmployeeIdentity}
                    </Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Nama</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.selectedItem?.Name}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.selectedItem?.Unit}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Seksi</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.selectedItem?.Section}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Grup</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.selectedItem?.Group}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Hak Akses</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>
                      {this.state.selectedItem?.AccessRole}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Akses Unit</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>
                      {this.state.form?.EmployeeUnitAccessItems}
                    </Form.Label>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer></Modal.Footer>
            </Modal>
          </Form>
        )}
      </div>
    );
  }
}

export default EmployeeAccesRight;
