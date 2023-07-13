/* eslint-disable eqeqeq */
import React, { Component } from "react";
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
import RowButtonComponent from "./../../../react-components/RowButtonComponent";
import Service from "./../Service";
import swal from "sweetalert";
import "./style.css";
import TimeField from "react-simple-timefield";
import "react-datepicker/dist/react-datepicker.css";

import IconAdd from "../../../assets/img/add.png";

const moment = require("moment");
const minimumDate = new Date(1945, 8, 17);
let newCharArray = [];

class BreakTime extends Component {
  state = {
    loading: false,

    activePage: 1,
    total: 0,
    size: 10,
    loadingData: false,
    tableData: [],
    allData: { items: [], ids: [] },
    selectedItem: null,
    Items: [],
    form: {},
    isCreateLoading: false,
    isShowAddModal: false,
    isShowDeleteModal: false,

    isDeleteLoading: false,
    isShowViewModal: false,
    isShowEditModal: false,
    isEditLoading: false,

    selectedFile: null,
    validationCreateForm: {},
    keyword: "",
    isShowAddShiftModal: false,
    formShift: {},
    validationCreateFormShift: {},
  };

  resetFilter = () => {
    this.typeaheadBPJS.clear();
  };

  resetModalValue = () => {
    this.setState({
      validationCreateForm: {},
      form: {},
      Items: [],
      selectedFile: null,
      validationCreateFormShift: {},
      formShift: {},
    });
  };

  resetPagingConfiguration = () => {
    this.setState({
      activePage: 1,
      size: 10,
    });
  };

  constructor(props) {
    super(props);
    this.service = new Service();
  }

  componentDidMount() {
    this.getAllShiftSchedules();
    this.getShiftSchedules();
  }

  getAllShiftSchedules = () => {
    this.service.getShiftSchedules(1, 100).then((result) => {
      let items = [];
      let ids = [];
      for (let i = 0; i < result.Data.length; i++) {
        if (result.Data[i].isDayOff == false) {
          const d = result.Data[i];
          items.push({
            value: d.Id,
            payload: d,
            label: `${d.Name} (${d.StartHour.toString().padStart(
              2,
              "0"
            )}.${d.StartMinute.toString().padStart(
              2,
              "0"
            )} - ${d.EndHour.toString().padStart(
              2,
              "0"
            )}.${d.EndMinute.toString().padStart(2, "0")})`,
          });

          if (
            (result.Data[i].isDayOff == false) !== "00:00:00" &&
            result.Data[i].TimeOffEnd !== "00:00:00"
          )
            ids.push(d.Id);
        }
      }

      this.setState({
        allData: { items, ids },
      });
    });
  };

  getShiftSchedules = () => {
    const { activePage, size, keyword } = this.state;

    this.setState({ loadingData: true });
    this.service.getShiftSchedules(activePage, size, keyword).then((result) => {
      let data = [];
      for (let i = 0; i < result.Data.length; i++) {
        if (
          result.Data[i].TimeOffStart !== "00:00:00" ||
          result.Data[i].TimeOffEnd !== "00:00:00"
        ) {
          data.push(result.Data[i]);
        }
      }

      this.setState({
        activePage: result.Page,
        total: result.Total,
        tableData: data,
        loadingData: false,
      });
    });
  };

  setData = () => {
    const params = {
      page: this.state.activePage,
      size: this.state.size,
      keyword: this.state.keyword,
    };

    this.setState({ loadingData: true });
    this.service.getRankings(params).then((result) => {
      this.setState({
        activePage: result.Page,
        total: result.Total,
        tableData: result.Data,
        loadingData: false,
      });
    });
  };

  showAddModal = (value) => {
    this.resetModalValue();
    this.setState({ isShowAddModal: value, validationCreateForm: {} });
  };

  showDeleteModal = (value) => {
    this.resetModalValue();
    this.setState({ isShowDeleteModal: value });
  };

  showViewModal = (value) => {
    if (!value) this.resetModalValue();
    this.setState({ isShowViewModal: value, validationCreateForm: {} });
  };

  showEditModal = (value) => {
    if (!value) this.resetModalValue();
    this.setState({ isShowEditModal: value, validationCreateForm: {} });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ activePage: pageNumber }, () => {
      this.getShiftSchedules();
    });
  };

  handleCreate = () => {
    const { allData, form } = this.state;
    let validationCreateForm = {};
    let isValid = true;

    if (!form.Shift?.value) {
      validationCreateForm.Shift = "Jadwal harus diisi";
      isValid = false;
    }
    if (form.Shift?.value && allData.ids.includes(form.Shift.value)) {
      validationCreateForm.Shift = "Jadwal ini sudah memiliki jam istirahat";
      isValid = false;
    }
    if (
      form.JamMasuk &&
      form.JamKeluar &&
      form.JamMasuk.substring(0, 5) == form.JamKeluar.substring(0, 5)
    ) {
      validationCreateForm.JamMasuk = "Jam tidak boleh sama";
      validationCreateForm.JamKeluar = "Jam tidak boleh sama";
      isValid = false;
    }

    if (form.JamMasuk == undefined && form.JamKeluar == undefined) {
      validationCreateForm.JamMasuk = "Jam tidak boleh sama";
      validationCreateForm.JamKeluar = "Jam tidak boleh sama";
      isValid = false;
    }

    if (!form.Description) {
      validationCreateForm.Description = "Deskripsi harus diisi";
      isValid = false;
    }

    if (isValid) {
      const payload = {
        Id: form.Shift.value,
        TimeOffStart: form.JamKeluar,
        TimeOffEnd: form.JamMasuk,
        TimeOffDescription: form.Description,
      };

      this.setState({ isCreateLoading: true });

      this.service
        .updateShiftSchedules(payload)
        .then((res) => {
          swal({
            icon: "success",
            title: "Good...",
            text: "Data berhasil disimpan!",
          });

          this.setState(
            { isCreateLoading: false, isShowAddModal: false },
            () => {
              this.getShiftSchedules();
            }
          );
        })
        .catch((error) => {
          if (error.response) {
            let message =
              "Error " +
              error.response.status +
              "\n" +
              error.response.statusText;

            swal({
              icon: "error",
              title: "Data Invalid",
              text: message,
            });

            this.setState({ isCreateLoading: false, isShowAddModal: false });
          }
        });
    } else {
      this.setState({ validationCreateForm });
    }
  };

  nextLetter = (char) => {
    return char === "Z" ? "A" : String.fromCharCode(char.charCodeAt(0) + 1);
  };

  incrementChar = (l) => {
    const lastChar = l[l.length - 1];
    const remString = l.slice(0, l.length - 1);
    const newChar = lastChar === undefined ? "A" : this.nextLetter(lastChar);
    newCharArray.unshift(newChar);

    if (lastChar === "Z") {
      return this.incrementChar(remString);
    }
    const batchString = remString + [...newCharArray].join("");
    newCharArray = [];
    return batchString;
  };

  handleCreateShift = () => {
    const { allData, formShift } = this.state;
    let validationCreateFormShift = {};
    let isValid = true;

    let tempTimeList = allData.items.map((d) => {
      let startIdx = d.label.indexOf("(") + 1;
      let endIdx = d.label.indexOf(")");
      let timeStr = d.label.substring(startIdx, endIdx);
      let timeStrArr = timeStr.split("-");

      return {
        jamMasuk: timeStrArr[0].replace(".", ":").trim(),
        jamKeluar: timeStrArr[1].replace(".", ":").trim(),
      };
    });

    let latestName = allData.items.length > 0 ? allData.items[allData.items.length - 1].payload.Name : '';

    if (
      formShift.JamMasuk &&
      formShift.JamKeluar &&
      formShift.JamMasuk.substring(0, 5) == formShift.JamKeluar.substring(0, 5)
    ) {
      validationCreateFormShift.JamMasuk = "Jam tidak boleh sama";
      validationCreateFormShift.JamKeluar = "Jam tidak boleh sama";
      isValid = false;
    }

    if (formShift.JamMasuk == undefined && formShift.JamKeluar == undefined) {
      validationCreateFormShift.JamMasuk = "Jam tidak boleh sama";
      validationCreateFormShift.JamKeluar = "Jam tidak boleh sama";
      isValid = false;
    }

    if (formShift.JamMasuk && formShift.JamKeluar) {
      for (let i = 0; i < tempTimeList.length; i++) {
        if (
          tempTimeList[i].jamMasuk === formShift.JamMasuk &&
          tempTimeList[i].jamKeluar === formShift.JamKeluar
        ) {
          validationCreateFormShift.JamMasuk = "Jadwal Shift Sudah Terdaftar";
          validationCreateFormShift.JamKeluar = "Jadwal Shift Sudah Terdaftar";
          isValid = false;

          break;
        }
      }
    }

    if (isValid) {
      this.setState({ isCreateLoading: true });
      console.log(latestName);
      console.log(latestName.substring(4));
      const shiftName = latestName === '' ? 'JAM A' : `JAM ${this.incrementChar(latestName.substring(4))}`;
      console.log(shiftName);
      const payload = {
        Name: shiftName,
        StartHour: Number(formShift.JamMasuk.split(":")[0]),
        StartMinute: Number(formShift.JamMasuk.split(":")[1]),
        EndHour: Number(formShift.JamKeluar.split(":")[0]),
        EndMinute: Number(formShift.JamKeluar.split(":")[1]),
      };

      this.service
        .createShiftSchedules(payload)
        .then((res) => {
          swal({
            icon: "success",
            title: "Good...",
            text: "Data berhasil disimpan!",
          });

          this.setState(
            {
              isCreateLoading: false,
              isShowAddShiftModal: false,
              isShowAddModal: true,
              formShift: {},
              validationCreateFormShift: {},
            },
            () => {
              this.getAllShiftSchedules();
            }
          );
        })
        .catch((error) => {
          if (error.response) {
            let message =
              "Error " +
              error.response.status +
              "\n" +
              error.response.data.error[
                Object.keys(error.response.data.error)[0]
              ];

            swal({
              icon: "error",
              title: "Data Invalid",
              text: message,
            });

            this.setState({
              isCreateLoading: false,
              isShowAddShiftModal: false,
              isShowAddModal: true,
              formShift: {},
              validationCreateFormShift: {},
            });
          }
        });
    } else {
      this.setState({ validationCreateFormShift });
    }
  };

  handleEdit = () => {
    const { form } = this.state;
    let validationCreateForm = {};
    let isValid = true;

    if (
      form.JamMasuk &&
      form.JamKeluar &&
      form.JamMasuk.substring(0, 5) == form.JamKeluar.substring(0, 5)
    ) {
      validationCreateForm.JamMasuk = "Jam tidak boleh sama";
      validationCreateForm.JamKeluar = "Jam tidak boleh sama";
      isValid = false;
    }
    if (!form.Description) {
      validationCreateForm.Description = "Deskripsi harus diisi";
      isValid = false;
    }

    if (isValid) {
      const payload = {
        Id: form.Shift.value,
        TimeOffStart: form.JamKeluar,
        TimeOffEnd: form.JamMasuk,
        TimeOffDescription: form.Description,
      };

      this.setState({ isCreateLoading: true });

      this.service
        .updateShiftSchedules(payload)
        .then((res) => {
          swal({
            icon: "success",
            title: "Good...",
            text: "Data berhasil disimpan!",
          });

          this.setState(
            { isCreateLoading: false, isShowEditModal: false },
            () => {
              this.getShiftSchedules();
            }
          );
        })
        .catch((error) => {
          if (error.response) {
            let message =
              "Error " +
              error.response.status +
              "\n" +
              error.response.statusText;

            swal({
              icon: "error",
              title: "Data Invalid",
              text: message,
            });

            this.setState({ isCreateLoading: false, isShowEditModal: false });
          }
        });
    } else {
      this.setState({ validationCreateForm });
    }
  };

  search = (keyword) => {
    this.setState({ activePage: 1, keyword: keyword }, () => {
      this.getShiftSchedules();
    });
  };

  handleViewClick = (item) => {
    this.setState({ selectedItem: item }, () => {
      this.showViewModal(true);
    });
  };

  handleEditClick = (d) => {
    const obj = {
      value: d.Id,
      payload: d,
      label: `${d.Name} (${d.StartHour.toString().padStart(
        2,
        "0"
      )}.${d.StartMinute.toString().padStart(
        2,
        "0"
      )} - ${d.EndHour.toString().padStart(
        2,
        "0"
      )}.${d.EndMinute.toString().padStart(2, "0")})`,
    };

    const form = {
      Shift: obj,
      JamMasuk: d.TimeOffEnd,
      JamKeluar: d.TimeOffStart,
      Description: d?.TimeOffDescription,
    };

    this.setState({ selectedItem: d, form: form }, () => {
      console.log("selectedItem", this.state.selectedItem);
      this.showEditModal(true);
    });
  };

  handleDeleteClick = (item) => {
    this.setState({ selectedItem: item }, () => {
      this.showDeleteModal(true);
    });
  };

  deleteClickHandler = () => {
    this.setState({ isDeleteLoading: true });
    const payload = {
      Id: this.state.selectedItem.Id,
      TimeOffStart: "00:00:00",
      TimeOffEnd: "00:00:00",
      TimeOffDescription: "",
    };

    this.service.updateShiftSchedules(payload).then((result) => {
      swal({
        icon: "success",
        title: "Good...",
        text: "Data berhasil dihapus!",
      });
      this.setState({ isDeleteLoading: false, selectedItem: null }, () => {
        this.resetPagingConfiguration();
        this.getShiftSchedules();
        this.getAllShiftSchedules();
        this.showDeleteModal(false);
      });
    }).catch(error => {
      this.setState({ isDeleteLoading: false, selectedItem: null, isShowDeleteModal: false });
      if (error) {
          swal({
              icon: 'error',
              title: 'Tidak bisa menghapus jadwal',
              text: 'Jadwal sudah digunakan'
          })
      }
    });
  };

  isInvalid = (index) => {
    return (
      this.state.validationCreateForm?.RankingItems &&
      this.state.validationCreateForm?.RankingItems[index].RankingName
    );
  };

  getTimeOff = (data) => {
    const arr = data.split(":");
    return `${arr[0]}:${arr[1]}`;
  };

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item, index) => {
      if (item.TimeOffStart !== "00:00:00" || item.TimeOffEnd !== "00:00:00") {
        return (
          <tr key={item.Id} data-category={item.Id}>
            <td className="text-center">
              {item.Name} ({item.StartHour.toString().padStart(2, "0")}.
              {item.StartMinute.toString().padStart(2, "0")} -{" "}
              {item.EndHour.toString().padStart(2, "0")}.
              {item.EndMinute.toString().padStart(2, "0")})
            </td>
            <td className="text-center">
              {this.getTimeOff(item.TimeOffStart)}
            </td>
            <td className="text-center">{this.getTimeOff(item.TimeOffEnd)}</td>
            <td>
              <Form>
                <FormGroup>
                  <RowButtonComponent
                    className="btn btn-success"
                    name="view-ranking"
                    onClick={this.handleViewClick}
                    data={item}
                    iconClassName="fa fa-eye"
                    label=""
                  ></RowButtonComponent>
                  <RowButtonComponent
                    className="btn btn-primary"
                    name="edit-ranking"
                    onClick={this.handleEditClick}
                    data={item}
                    iconClassName="fa fa-pencil-square"
                    label=""
                  ></RowButtonComponent>
                  <RowButtonComponent
                    className="btn btn-danger"
                    name="delete-ranking"
                    onClick={this.handleDeleteClick}
                    data={item}
                    iconClassName="fa fa-trash"
                    label=""
                  ></RowButtonComponent>
                </FormGroup>
              </Form>
            </td>
          </tr>
        );
      }
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
                <Col sm={4}>
                  <Button
                    className="btn btn-success mr-5"
                    name="add"
                    onClick={() => this.showAddModal(true)}
                  >
                    Tambah
                  </Button>
                </Col>
                <Col sm={4}></Col>

                <Col sm={4}>
                  <Form.Control
                    className="float-right"
                    placeholder="Cari"
                    type="text"
                    value={this.state.keyword}
                    onChange={(e) => {
                      return this.search(e.target.value);
                    }}
                  />
                </Col>
              </Row>
            </FormGroup>
            <br></br>
            <br></br>
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
                        <th>Jadwal</th>
                        <th>Istirahat Shift Keluar</th>
                        <th>Istirahat Shift Masuk</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length > 0 ? (
                        items
                      ) : (
                        <tr className={"text-center"}>
                          <td
                            colSpan="6"
                            className={"align-middle text-center"}
                          >
                            Data Kosong
                          </td>
                        </tr>
                      )}
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
            <Modal
              dialogClassName="modal-90w"
              aria-labelledby="modal-add-ranking"
              show={this.state.isShowAddModal}
              onHide={() => this.showAddModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-add-ranking">
                  Tambah Jam Istirahat
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={10}>
                    <Row>
                      <Col sm={3}>
                        <Form.Label>Jadwal Shift</Form.Label>
                      </Col>
                      <Col>
                        <Select
                          className={
                            this.state.validationCreateForm?.Shift
                              ? "invalid-select"
                              : ""
                          }
                          options={this.state.allData.items}
                          value={this.state.form.Shift}
                          onChange={(e) => {
                            let { form } = this.state;
                            form["Shift"] = e;
                            this.setState({ form: form });
                            this.setState({
                              validationCreateForm: {
                                ...this.state.validationCreateForm,
                                Shift: null,
                              },
                            });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.Shift ? true : null
                          }
                        ></Select>
                        {this.state.validationCreateForm.Shift && (
                          <span style={{ color: "#dc3545", fontSize: 10 }}>
                            {this.state.validationCreateForm.Shift}
                          </span>
                        )}
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 15 }}>
                      <Col sm={3}>
                        <Form.Label>Jam Istirahat Keluar</Form.Label>
                      </Col>
                      <Col>
                        <TimeField
                          name="startHours"
                          id="startHours"
                          value={this.state.form.JamKeluar}
                          onChange={(event) => {
                            let { form } = this.state;
                            form["JamKeluar"] = event.target.value;
                            this.setState({ form: form });
                          }}
                          style={{
                            border: this.state.validationCreateForm?.JamKeluar
                              ? "1px solid #dc3545"
                              : "1px solid #cccccc",
                            fontSize: 14,
                            width: "100%",
                            padding: "2px 8px",
                            borderRadius: 4,
                            minHeight: "38px",
                          }}
                        />
                        {this.state.validationCreateForm.JamKeluar && (
                          <span style={{ color: "#dc3545", fontSize: 10 }}>
                            {this.state.validationCreateForm.JamKeluar}
                          </span>
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={3}>
                        <Form.Label>Jam Istirahat Masuk</Form.Label>
                      </Col>
                      <Col>
                        <TimeField
                          name="endHours"
                          id="endHours"
                          value={this.state.form.JamMasuk}
                          onChange={(event) => {
                            let { form } = this.state;
                            form["JamMasuk"] = event.target.value;
                            this.setState({ form: form });
                          }}
                          style={{
                            border: this.state.validationCreateForm?.JamMasuk
                              ? "1px solid #dc3545"
                              : "1px solid #cccccc",
                            fontSize: 14,
                            width: "100%",
                            padding: "2px 8px",
                            borderRadius: 4,
                            minHeight: "38px",
                          }}
                        />
                        {this.state.validationCreateForm.JamMasuk && (
                          <span style={{ color: "#dc3545", fontSize: 10 }}>
                            {this.state.validationCreateForm.JamMasuk}
                          </span>
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col sm={3}>
                        <Form.Label>Deskripsi</Form.Label>
                      </Col>
                      <Col>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={this.state.form.Description}
                          onChange={(event) => {
                            let { form } = this.state;
                            form["Description"] = event.target.value;
                            this.setState({ form: form });
                          }}
                          isInvalid={
                            this.state.validationCreateForm.Description
                          }
                        />
                        {this.state.validationCreateForm.Description && (
                          <span style={{ color: "#dc3545", fontSize: 10 }}>
                            {this.state.validationCreateForm.Description}
                          </span>
                        )}
                      </Col>
                    </Row>
                  </Col>
                  <Col>
                    <Row>
                      <Col sm={3}>
                        <img
                          src={IconAdd}
                          style={{ width: 33, height: 33 }}
                          alt=""
                          onClick={() => {
                            this.setState({
                              isShowAddShiftModal: true,
                              isShowAddModal: false,
                            });
                          }}
                        />
                      </Col>
                    </Row>
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
                      name="create-ranking"
                      onClick={this.handleCreate}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            <Modal
              aria-labelledby="modal-delete-ranking"
              show={this.state.isShowDeleteModal}
              onHide={() => this.showDeleteModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-delete-ranking">
                  Hapus Jam Istirahat
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Apakah anda yakin ingin menghapus data ini?
              </Modal.Body>
              <Modal.Footer>
                {this.state.isDeleteLoading ? (
                  <span>
                    <Spinner size="sm" color="primary" /> Mohon tunggu...
                  </span>
                ) : (
                  <div>
                    <Button
                      className="btn btn-danger"
                      name="delete-ranking"
                      onClick={this.deleteClickHandler}
                    >
                      Hapus
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Modal>

            {this.state.isShowEditModal && (
              <Modal
                dialogClassName="modal-90w"
                aria-labelledby="modal-edit-ranking"
                show={this.state.isShowEditModal}
                onHide={() => this.showEditModal(false)}
                animation={true}
              >
                <Modal.Header closeButton>
                  <Modal.Title id="modal-edit-ranking">
                    Edit Jam Istirahat
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Jadwal Shift</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>
                        {this.state.selectedItem.Name} (
                        {this.state.selectedItem.StartHour.toString().padStart(
                          2,
                          "0"
                        )}
                        .
                        {this.state.selectedItem.StartMinute.toString().padStart(
                          2,
                          "0"
                        )}{" "}
                        -{" "}
                        {this.state.selectedItem.EndHour.toString().padStart(
                          2,
                          "0"
                        )}
                        .
                        {this.state.selectedItem.EndMinute.toString().padStart(
                          2,
                          "0"
                        )}
                        )
                      </Form.Label>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 15 }}>
                    <Col sm={3}>
                      <Form.Label>Jam Istirahat Keluar</Form.Label>
                    </Col>
                    <Col>
                      <TimeField
                        name="startHours"
                        id="startHours"
                        value={this.state.form.JamKeluar}
                        onChange={(event) => {
                          let { form } = this.state;
                          form["JamKeluar"] = event.target.value;
                          this.setState({ form: form });
                        }}
                        style={{
                          border: this.state.validationCreateForm?.JamKeluar
                            ? "1px solid #dc3545"
                            : "1px solid #cccccc",
                          fontSize: 14,
                          width: "100%",
                          padding: "2px 8px",
                          borderRadius: 4,
                          minHeight: "38px",
                        }}
                      />
                      {this.state.validationCreateForm.JamKeluar && (
                        <span style={{ color: "#dc3545", fontSize: 10 }}>
                          {this.state.validationCreateForm.JamKeluar}
                        </span>
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Jam Istirahat Masuk</Form.Label>
                    </Col>
                    <Col>
                      <TimeField
                        name="endHours"
                        id="endHours"
                        value={this.state.form.JamMasuk}
                        onChange={(event) => {
                          let { form } = this.state;
                          form["JamMasuk"] = event.target.value;
                          this.setState({ form: form });
                        }}
                        style={{
                          border: this.state.validationCreateForm?.JamMasuk
                            ? "1px solid #dc3545"
                            : "1px solid #cccccc",
                          fontSize: 14,
                          width: "100%",
                          padding: "2px 8px",
                          borderRadius: 4,
                          minHeight: "38px",
                        }}
                      />
                      {this.state.validationCreateForm.JamMasuk && (
                        <span style={{ color: "#dc3545", fontSize: 10 }}>
                          {this.state.validationCreateForm.JamMasuk}
                        </span>
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Deskripsi</Form.Label>
                    </Col>
                    <Col>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={this.state.form.Description}
                        onChange={(event) => {
                          let { form } = this.state;
                          form["Description"] = event.target.value;
                          this.setState({ form: form });
                        }}
                        isInvalid={this.state.validationCreateForm.Description}
                      />
                      {this.state.validationCreateForm.Description && (
                        <span style={{ color: "#dc3545", fontSize: 10 }}>
                          {this.state.validationCreateForm.Description}
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
                        name="edit-standard-ranking"
                        onClick={this.handleEdit}
                      >
                        Submit
                      </Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>
            )}

            {this.state.isShowViewModal && (
              <Modal
                dialogClassName="modal-90w"
                aria-labelledby="modal-view-ranking"
                show={this.state.isShowViewModal}
                onHide={() => this.showViewModal(false)}
                animation={true}
              >
                <Modal.Header closeButton>
                  <Modal.Title id="modal-view-rankings">
                    Lihat Jam Istirahat
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Jadwal Shift</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>
                        {this.state.selectedItem.Name} (
                        {this.state.selectedItem.StartHour.toString().padStart(
                          2,
                          "0"
                        )}
                        .
                        {this.state.selectedItem.StartMinute.toString().padStart(
                          2,
                          "0"
                        )}{" "}
                        -{" "}
                        {this.state.selectedItem.EndHour.toString().padStart(
                          2,
                          "0"
                        )}
                        .
                        {this.state.selectedItem.EndMinute.toString().padStart(
                          2,
                          "0"
                        )}
                        )
                      </Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Jam Istirahat Keluar</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>
                        {this.getTimeOff(this.state.selectedItem.TimeOffStart)}
                      </Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Jam Istirahat Masuk</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>
                        {this.getTimeOff(this.state.selectedItem.TimeOffEnd)}
                      </Form.Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Deskripsi</Form.Label>
                    </Col>
                    <Col>
                      <Form.Label>
                        {this.state.selectedItem.TimeOffDescription}
                      </Form.Label>
                    </Col>
                  </Row>
                </Modal.Body>
                <Modal.Footer></Modal.Footer>
              </Modal>
            )}

            {this.state.isShowAddShiftModal && (
              <Modal
                dialogClassName="modal-90w"
                aria-labelledby="modal-add-ranking"
                show={this.state.isShowAddShiftModal}
                onHide={() => {
                  this.setState({
                    isShowAddShiftModal: false,
                    isShowAddModal: true,
                    formShift: {},
                    validationCreateFormShift: {},
                  });
                }}
                animation={true}
              >
                <Modal.Header closeButton>
                  <Modal.Title id="modal-add-ranking">
                    Tambah Jadwal Shift
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {/*
                  <Row>
                    <Col sm={3}>
                      <Form.Label>Nama Shift</Form.Label>
                    </Col>
                    <Col>
                      <Form.Control
                        type="text"
                        value={this.state.formShift.Shift}
                        onChange={(event) => {
                          let { formShift } = this.state;
                          formShift["Shift"] = event.target.value;
                          this.setState({ formShift: formShift });
                        }}
                      />
                      {this.state.validationCreateFormShift.Shift && (
                        <span style={{ color: "#dc3545", fontSize: 10 }}>
                          {this.state.validationCreateFormShift.Shift}
                        </span>
                      )}
                    </Col>
                  </Row>
                      */}
                  <Row style={{ marginTop: 15 }}>
                    <Col sm={3}>
                      <Form.Label>Jam Masuk</Form.Label>
                    </Col>
                    <Col>
                      <TimeField
                        name="endHours"
                        id="endHours"
                        value={this.state.formShift.JamMasuk}
                        onChange={(event) => {
                          let { formShift } = this.state;
                          formShift["JamMasuk"] = event.target.value;
                          this.setState({ formShift: formShift });
                        }}
                        style={{
                          border: this.state.validationCreateFormShift?.JamMasuk
                            ? "1px solid #dc3545"
                            : "1px solid #cccccc",
                          fontSize: 14,
                          width: "100%",
                          padding: "2px 8px",
                          borderRadius: 4,
                          minHeight: "38px",
                        }}
                      />
                      {this.state.validationCreateFormShift.JamMasuk && (
                        <span style={{ color: "#dc3545", fontSize: 10 }}>
                          {this.state.validationCreateFormShift.JamMasuk}
                        </span>
                      )}
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 15 }}>
                    <Col sm={3}>
                      <Form.Label>Jam Keluar</Form.Label>
                    </Col>
                    <Col>
                      <TimeField
                        name="startHours"
                        id="startHours"
                        value={this.state.formShift.JamKeluar}
                        onChange={(event) => {
                          let { formShift } = this.state;
                          formShift["JamKeluar"] = event.target.value;
                          this.setState({ formShift: formShift });
                        }}
                        style={{
                          border: this.state.validationCreateFormShift
                            ?.JamKeluar
                            ? "1px solid #dc3545"
                            : "1px solid #cccccc",
                          fontSize: 14,
                          width: "100%",
                          padding: "2px 8px",
                          borderRadius: 4,
                          minHeight: "38px",
                        }}
                      />
                      {this.state.validationCreateFormShift.JamKeluar && (
                        <span style={{ color: "#dc3545", fontSize: 10 }}>
                          {this.state.validationCreateFormShift.JamKeluar}
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
                        name="create-ranking"
                        onClick={this.handleCreateShift}
                      >
                        Submit
                      </Button>
                    </div>
                  )}
                </Modal.Footer>
              </Modal>
            )}
          </Form>
        )}
      </div>
    );
  }
}

export default BreakTime;
