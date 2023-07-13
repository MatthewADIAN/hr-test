import React, { Component } from "react";
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
import Service from "./../Service";
import swal from "sweetalert";
import axios from "axios";
import "./style.css";
import DatePicker from "react-datepicker";
import NumberFormat from "react-number-format";
import CurrencyInput from 'react-currency-input-field';
import "react-datepicker/dist/react-datepicker.css";

const moment = require("moment");
const minimumDate = new Date(1945, 8, 17);

class Ranking extends Component {
  state = {
    loading: false,

    activePage: 1,
    total: 0,
    size: 10,
    loadingData: false,
    tableData: [],
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
    units: [],
    rankings: [],
    isAutoCompleteLoading: false,

    baseSalaries: [],
    performanceAllowances: [],
    mealAllowances: [],
    positionalAllowances: [],
    nominalIncrease: [],
    allEmployementClasses: [],
    employementClasses: [],

    oldEmploymentClasses: [
      { name: "A", label: "A", value: "A" },
      { name: "B", label: "B", value: "B" },
      { name: "C", label: "C", value: "C" },
      { name: "D", label: "D", value: "D" },
      { name: "E", label: "E", value: "E" },
      { name: "IA", label: "IA", value: "IA" },
      { name: "IB", label: "IB", value: "IB" },
      { name: "IIA", label: "IIA", value: "IIA" },
      { name: "IIB", label: "IIB", value: "IIB" },
      { name: "IIIA", label: "IIIA", value: "IIIA" },
      { name: "IIIB", label: "IIIB", value: "IIIB" },
      { name: "IVA", label: "IVA", value: "IVA" },
      { name: "IVB", label: "IVB", value: "IVB" },
      { name: "VA", label: "VA", value: "VA" },
      { name: "VB", label: "VB", value: "VB" },
    ],
  };

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
            datum.name = datum.NameClass;
            datum.grade = datum.Grade;
            datum.unit = datum.UnitId;
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

  resetFilter = () => {
    this.typeaheadBPJS.clear();
  };

  resetModalValue = () => {
    this.setState({
      validationCreateForm: {},
      form: {},
      Items: [],
      selectedFile: null,
      baseSalaries: [0],
      performanceAllowances: [0],
      mealAllowances: [0],
      positionalAllowances: [0],
      nominalIncrease: [0],
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
    this.setData();
    this.setUnit();
    this.setRanking();
    this.getAllEmploymentClasses();
  }

  getEmploymentClassesByUnit = (unitId) => {
    let res = this.state.allEmployementClasses.filter(d => d.unit === unitId);
    this.setState({ employementClasses: res })

  }

  // setNewFormItem() {
  //   let baseSalaries = [0, 0, 0, 0, 0]
  //   let mealAllowances = [0, 0, 0, 0, 0]
  //   let performanceAllowances = [0, 0, 0, 0, 0]
  //   let positionalAllowances = [0, 0, 0, 0, 0]
  //   let nominalIncrease = [0, 0, 0, 0, 0]
  //   this.setState({
  //     Items: [{RankingName: "Ranking 1"}, {RankingName: "Ranking 2"}, {RankingName: "Ranking 3"}, {RankingName: "Ranking 4"}, {RankingName: "Ranking 5"}],
  //     baseSalaries: baseSalaries,
  //     mealAllowances: mealAllowances,
  //     performanceAllowances: performanceAllowances,
  //     positionalAllowances: positionalAllowances,
  //     nominalIncrease: nominalIncrease
  //   })
  // }

  setUnit = () => {
    const params = {
      page: 1,
      size: 2147483647,
    };

    this.setState({ loadingData: true });
    this.service.getAllUnits().then((result) => {
      this.setState({ units: result, loadingData: false });
    });
  };

  setRanking = () => {
    const params = {
      page: this.state.activePage,
    };

    this.setState({ loadingData: true });
    this.service.getAllRankings(params).then((result) => {
      this.setState({ rankings: result, loadingData: false });
    });
  };

  setRankinByUnitId = (unitId) => {
    const params = {
      page: 1,
      unitId: unitId,
    };

    this.setState({ loadingData: true });
    this.service.getAllRankings(params).then((result) => {
      this.setState({ rankings: result, loadingData: false });
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
      console.log("tableData result", result);
      this.setState({
        activePage: result.Page,
        total: result.Total,
        tableData: result.Data,
        loadingData: false,
      });
    });
  };

  create = () => {
    this.showAddModal(true);
  };

  showAddModal = (value) => {
    this.resetModalValue();
    // this.setState({isShowAddModal: value, validationCreateForm: {}}, () => {
    //   this.setNewFormItem()
    // });
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
      this.setData();
    });
  };

  calculateIncrease = (index) => {
    let items = this.state.Items;
    let thisItem = items[index];

    let total =
      Number(thisItem.BaseSalary) +
      Number(thisItem.MealAllowance) +
      Number(thisItem.PerformanceAllowance) +
      Number(thisItem.PositionalAllowance);

    thisItem.NominalIncrease = total;

    console.log(thisItem);

    this.setState({ Items: items });
  };

  // calculateIncrease = (index) => {
  //
  //   let total = Number(this.state.baseSalaries[index]) + Number(this.state.mealAllowances[index]) + Number(this.state.performanceAllowances[index]) + Number(this.state.positionalAllowances[index])
  //
  //   let nominalIncrease = this.state.nominalIncrease;
  //
  //   nominalIncrease[index] = total
  //
  //   let items = this.state.Items;
  //   let thisItem = items[index];
  //
  //   let total2 = Number(this.state.baseSalaries[index]) + Number(this.state.mealAllowances[index]) + Number(this.state.performanceAllowances[index]) + Number(this.state.positionalAllowances[index])
  //   thisItem.NominalIncrease = nominalIncrease[index];
  //
  //   this.setState({Items: items, nominalIncrease: nominalIncrease});
  //
  //
  // }

  handleCreate = () => {
    const payload = {
      Period: this.state.form?.Period,
      UnitId: this.state.form?.UnitId,
      UnitName: this.state.form?.UnitName,
      EmploymentClass: this.state.form?.EmploymentClass,
      EmployeeClassId: this.state.form?.EmployeeClassId,
      EmployeeGrade: this.state.form?.EmployeeGrade,
      RankingItems: this.state.Items,
    };

    this.setState({ isCreateLoading: true });
    this.service
      .createRanking(payload)
      .then((result) => {
        // console.log(result);
        swal({
          icon: "success",
          title: "Good...",
          text: "Data berhasil disimpan!",
        });
        this.setState({ isCreateLoading: false }, () => {
          this.resetModalValue();
          this.resetPagingConfiguration();
          this.setData();
          this.showAddModal(false);
        });
      })
      .catch((error) => {
        if (error.response) {
          // let message = "Cek Form Isian, Isian Mandatory tidak boleh kosong\n";
          let message = "";

          const errorMessage = error.response.data.error;
          // console.log(Object.keys(error).forEach(e => console.log(`key=${e}  value=${error[e]}`)));
          Object.keys(errorMessage).forEach((e) => {
            if (e && typeof errorMessage[e] == "string") {
              message += `- ${errorMessage[e]}\n`;
            }
          });

          swal({
            icon: "error",
            title: "Data Invalid",
            text: message,
          });

          console.log(error.response.data.error);

          this.setState({
            validationCreateForm: error.response.data.error,
            isCreateLoading: false,
          });
        }
      });
  };

  handleEdit = () => {
    const payload = {
      Id: this.state.form?.Id,
      Period: this.state.form?.Period,
      UnitId: this.state.form?.UnitId,
      UnitName: this.state.form?.UnitName,
      EmploymentClass: this.state.form?.EmploymentClass,
      EmployeeClassId: this.state.form?.EmployeeClassId,
      EmployeeGrade: this.state.form?.EmployeeGrade,
      RankingItems: this.state.Items,
    };

    this.setState({ isEditLoading: true });
    this.service
      .editRanking(this.state.selectedItem?.Id, payload)
      .then((result) => {
        // console.log(result);
        swal({
          icon: "success",
          title: "Good...",
          text: "Data berhasil diubah!",
        });
        this.setState({ isEditLoading: false }, () => {
          this.resetModalValue();
          this.resetPagingConfiguration();
          this.setData();
          this.showEditModal(false);
        });
      })
      .catch((error) => {
        if (error.response) {
          let message = "";

          const errorMessage = error.response.data.error;
          Object.keys(errorMessage).forEach((e) => {
            if (e && typeof errorMessage[e] == "string") {
              message += `- ${errorMessage[e]}\n`;
            }
          });

          swal({
            icon: "error",
            title: "Data Invalid",
            text: message,
          });

          this.setState({
            validationCreateForm: error.response.data.error,
            isEditLoading: false,
          });
        }
      });
  };

  search = (keyword) => {
    this.setState({ page: 1, keyword: keyword }, () => {
      this.setData();
    });
  };

  handleViewClick = (item) => {
    this.setState({ selectedItem: item });
    this.service.getRankingById(item.Id).then((ranking) => {
      var { allEmployementClasses, oldEmploymentClasses } = this.state;

      ranking.Unit = {
        Id: ranking.UnitId,
        Name: ranking.UnitName,
        value: ranking.UnitId,
        label: ranking.UnitName,
      };

      let emClassOld = oldEmploymentClasses.find(
        (element) => element.value === ranking.EmploymentClass
      );

      let emClass = allEmployementClasses.find(
        (element) => element.NameClass === ranking.EmploymentClass
      );

      ranking["selectedEmploymentClass"] = emClassOld ? emClassOld : emClass;
      ranking["EmploymentClass"] = emClassOld ? emClassOld.value : emClass.NameClass;

      this.getEmploymentClassesByUnit(ranking.Unit.Id);

      // for (var item of ranking.RankingItems) {
      //   // item.Competency = {
      //   //   Id: item.CompetencyId,
      //   //   Type: item.CompetencyType,
      //   //   Name: item.CompetencyName,
      //   //   value: item.CompetencyId,
      //   //   label: item.CompetencyName
      //   // };
      //   // item.selectedEmploymentClass = emClass;
      // }

      this.setState({ form: ranking, Items: ranking.RankingItems }, () => {
        this.showViewModal(true);
      });
    });
  };

  handleEditClick = (item) => {
    this.setState({ selectedItem: item });
    this.service.getRankingById(item.Id).then((ranking) => {
      var { allEmployementClasses, oldEmploymentClasses } = this.state;

      ranking.Unit = {
        Id: ranking.UnitId,
        Name: ranking.UnitName,
        value: ranking.UnitId,
        label: ranking.UnitName,
      };

      let baseSalaries = [];
      let mealAllowances = [];
      let performanceAllowances = [];
      let positionalAllowances = [];
      let nominalIncrease = [];

      for (var item of ranking.RankingItems) {
        baseSalaries.push(item.BaseSalary);
        mealAllowances.push(item.MealAllowance);
        performanceAllowances.push(item.PerformanceAllowance);
        positionalAllowances.push(item.PositionalAllowance);
        nominalIncrease.push(item.NominalIncrease);
      }

      let emClassOld = oldEmploymentClasses.find(
        (element) => element.value === ranking.EmploymentClass
      );

      let emClass = allEmployementClasses.find(
        (element) => element.NameClass === ranking.EmploymentClass
      );

      console.log("findOld", emClassOld);
      console.log("findNew", emClass);

      ranking["selectedEmploymentClass"] = emClassOld ? emClassOld : emClass;
      ranking["EmploymentClass"] = emClassOld ? emClassOld.value : emClass.NameClass;

      this.getEmploymentClassesByUnit(ranking.Unit.Id);

      this.setRankinByUnitId(ranking.UnitId);
      this.setState(
        {
          form: ranking,
          Items: ranking.RankingItems,
          baseSalaries: baseSalaries,
          mealAllowances: mealAllowances,
          performanceAllowances: performanceAllowances,
          positionalAllowances: positionalAllowances,
          nominalIncrease: nominalIncrease,
        },
        () => {
          this.showEditModal(true);
        }
      );
    });
  };

  handleDeleteClick = (item) => {
    this.setState({ selectedItem: item }, () => {
      this.showDeleteModal(true);
    });
  };

  deleteClickHandler = () => {
    this.setState({ isDeleteLoading: true });
    this.service.deleteRanking(this.state.selectedItem?.Id).then((result) => {
      swal({
        icon: "success",
        title: "Good...",
        text: "Data berhasil dihapus!",
      });
      this.setState({ isDeleteLoading: false, selectedItem: null }, () => {
        this.resetPagingConfiguration();
        this.setData();
        this.showDeleteModal(false);
      });
    }).catch((error) => {
      this.setState({ isDeleteLoading: false, isShowDeleteModal: false });
      if (error) {
          swal({
              icon: 'error',
              title: 'Tidak bisa menghapus ranking',
              text: error[Object.keys(error)[0]]
          })
      }
  });
  };

  onInputFileHandler = (event) => {
    this.setFile(event.target.files[0]);
  };

  setFile = (file) => {
    this.setState({ selectedFile: file });
  };

  addItems = () => {
    var { Items } = this.state;
    Items.push({
      BaseSalary: 0,
      MealAllowance: 0,
      PerformanceAllowance: 0,
      PositionalAllowance: 0,
      NominalIncrease: 0,
    });
    console.log(Items);
    this.setState({ Items: Items });
  };

  clearItems = () => {
    var { Items } = this.state;
    Items.splice(0, Items.length);
    this.setState({ Items: Items });
  };

  deleteItems = (item) => {
    var items = this.state.Items;
    var itemIndex = items.indexOf(item);
    items.splice(itemIndex, 1);

    this.setState({ Items: items });
  };

  render() {
    const { tableData } = this.state;

    const items = tableData.map((item, index) => {
      return (
        <tr key={item.Id} data-category={item.Id}>
          <td>{moment(item.Period).format("MM/YYYY")} </td>
          <td>{item.UnitName}</td>
          <td>{item.EmploymentClass}</td>
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
    });

    var { Items } = this.state;

    var masterItems = Items.map((item, index) => {
      return (
        <tr key={index} data-category={item.Id}>
          <td>
            <Form.Control
              type="text"
              name="RankingName"
              value={item.RankingName}
              readOnly={false}
              placeholder={"Ranking"}
              onChange={(event) => {
                var items = this.state.Items;
                var thisItem = items[index];

                thisItem.RankingName = event.target.value;

                this.setState({ Items: items });
              }}
              isInvalid={
                this.state.validationCreateForm?.RankingItems &&
                this.state.validationCreateForm?.RankingItems[index].RankingName
              }
            />
            <Form.Control.Feedback type="invalid">
              {this.state.validationCreateForm?.RankingItems &&
              this.state.validationCreateForm?.RankingItems[index].RankingName
                ? this.state.validationCreateForm?.RankingItems[index]
                    .RankingName
                : null}
            </Form.Control.Feedback>
          </td>
          <td>
            <CurrencyInput
              className={'form-control'}
              id="BaseSalary"
              name="BaseSalary"
              value={item.BaseSalary}
              onValueChange={(val) => {
                var items = this.state.Items;
                var thisItem = items[index];

                var value = val ? parseFloat(val) : 0;
                thisItem.BaseSalary = value

                let salaries = this.state.baseSalaries;
                salaries[index] = value
                this.setState({ Items: items, baseSalaries: salaries }, () => {
                  this.calculateIncrease(index);
                });
              }}
            />
            {/* <NumberFormat
              customInput={Form.Control}
              defaultValue={"000000000000000"}
              name="BaseSalary"
              isNumericString={true}
              value={item.BaseSalary}
             
              onValueChange={(val) => {
                var items = this.state.Items;
                var thisItem = items[index];

                thisItem.BaseSalary = val.value;

                let salaries = this.state.baseSalaries;
                salaries[index] = val.value;
                this.setState({ Items: items, baseSalaries: salaries }, () => {
                  this.calculateIncrease(index);
                });
              }}
              isInvalid={
                this.state.validationCreateForm?.RankingItems &&
                this.state.validationCreateForm?.RankingItems[index].BaseSalary
              }
              thousandSeparator={true}
            /> */}
            <Form.Control.Feedback type="invalid">
              {this.state.validationCreateForm?.RankingItems &&
              this.state.validationCreateForm?.RankingItems[index].BaseSalary
                ? this.state.validationCreateForm?.RankingItems[index]
                    .BaseSalary
                : null}
            </Form.Control.Feedback>
            {/*{item.CompetencyType}*/}
          </td>
          <td>
            <CurrencyInput
              className={'form-control'}
              id="MealAllowance"
              name="MealAllowance"
              value={item.MealAllowance}
              onValueChange={(val) => {
                var items = this.state.Items;
                var thisItem = items[index];

                var value = val ? parseFloat(val) : 0;
                thisItem.MealAllowance = value;

                this.setState({ Items: items }, () => {
                  this.calculateIncrease(index);
                });
              }}
            />
            {/* <NumberFormat
              customInput={Form.Control}
              defaultValue={"000000000000000"}
              name="MealAllowance"
              isNumericString={true}
              value={item.MealAllowance}
              onValueChange={(val) => {
                var items = this.state.Items;
                var thisItem = items[index];

                let value = val.value;
                thisItem.MealAllowance = value;

                this.setState({ Items: items }, () => {
                  this.calculateIncrease(index);
                });
              }}
              isInvalid={
                this.state.validationCreateForm?.RankingItems &&
                this.state.validationCreateForm?.RankingItems[index]
                  .MealAllowance
              }
              thousandSeparator={true}
            /> */}
            <Form.Control.Feedback type="invalid">
              {this.state.validationCreateForm?.RankingItems &&
              this.state.validationCreateForm?.RankingItems[index].MealAllowance
                ? this.state.validationCreateForm?.RankingItems[index]
                    .MealAllowance
                : null}
            </Form.Control.Feedback>
          </td>
          <td>
            <CurrencyInput
              className={'form-control'}
              id="PerformanceAllowance"
              name="PerformanceAllowance"
              value={item.PerformanceAllowance}
              onValueChange={(val) => {
                var items = this.state.Items;
                var thisItem = items[index];

                var value = val ? parseFloat(val) : 0;
                thisItem.PerformanceAllowance = value

                this.setState({ Items: items }, () => {
                  this.calculateIncrease(index);
                });
              }}
            />
            {/* <NumberFormat
              customInput={Form.Control}
              defaultValue={"000000000000000"}
              name="PerformanceAllowance"
              isNumericString={true}
              value={item.PerformanceAllowance}
              onValueChange={(val) => {
                var items = this.state.Items;
                var thisItem = items[index];

                let value = val.value;
                thisItem.PerformanceAllowance = value;

                this.setState({ Items: items }, () => {
                  this.calculateIncrease(index);
                });
              }}
              isInvalid={
                this.state.validationCreateForm?.RankingItems &&
                this.state.validationCreateForm?.RankingItems[index]
                  .PerformanceAllowance
              }
              thousandSeparator={true}
            /> */}
            <Form.Control.Feedback type="invalid">
              {this.state.validationCreateForm?.RankingItems &&
              this.state.validationCreateForm?.RankingItems[index]
                .PerformanceAllowance
                ? this.state.validationCreateForm?.RankingItems[index]
                    .PerformanceAllowance
                : null}
            </Form.Control.Feedback>
          </td>
          <td>
            <CurrencyInput
              className={'form-control'}
              id="PositionalAllowance"
              name="PositionalAllowance"
              value={item.PositionalAllowance}
              onValueChange={(val) => {
                var items = this.state.Items;
                var thisItem = items[index];

                var value = val ? parseFloat(val) : 0;
                thisItem.PositionalAllowance = value;

                this.setState({ Items: items }, () => {
                  this.calculateIncrease(index);
                });
              }}
            />
            {/* <NumberFormat
              customInput={Form.Control}
              defaultValue={"000000000000000"}
              name="PositionalAllowance"
              isNumericString={true}
              value={item.PositionalAllowance}
              onValueChange={(val) => {
                var items = this.state.Items;
                var thisItem = items[index];
                let value = val.value;

                thisItem.PositionalAllowance = value;

                this.setState({ Items: items }, () => {
                  this.calculateIncrease(index);
                });
              }}
              isInvalid={
                this.state.validationCreateForm?.RankingItems &&
                this.state.validationCreateForm?.RankingItems[index]
                  .PositionalAllowance
              }
              thousandSeparator={true}
            /> */}
            <Form.Control.Feedback type="invalid">
              {this.state.validationCreateForm?.RankingItems &&
              this.state.validationCreateForm?.RankingItems[index]
                .PositionalAllowance
                ? this.state.validationCreateForm?.RankingItems[index]
                    .PositionalAllowance
                : null}
            </Form.Control.Feedback>
          </td>
          <td>
            <NumberFormat
              customInput={Form.Control}
              defaultValue={"000000000000000"}
              name="NominalIncrease"
              isNumericString={true}
              value={item.NominalIncrease}
              isInvalid={
                this.state.validationCreateForm?.RankingItems &&
                this.state.validationCreateForm?.RankingItems[index]
                  .NominalIncrease
              }
              thousandSeparator={true}
              readOnly={true}
            />
          </td>
          <td className={"text-center"}>
            <Button
              className="btn btn-danger"
              name="delete-items"
              onClick={() => this.deleteItems(item)}
            >
              -
            </Button>
          </td>
        </tr>
      );
    });

    // var masterItems = Items.map((item, index) => {
    //   return (
    //     <tr key={index} data-category={item.Id}>
    //       <td>
    //         <Form.Control
    //           type="text"
    //           name="RankingName"
    //           value={item.RankingName}
    //           readOnly={false}
    //           isInvalid={this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].RankingName}
    //         />
    //         <Form.Control.Feedback
    //           type="invalid">{this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].RankingName ? this.state.validationCreateForm?.RankingItems[index].RankingName : null}</Form.Control.Feedback>
    //
    //       </td>
    //       <td>
    //         <td>
    //           <Form.Control
    //             type="number"
    //             name="BaseSalary"
    //             value={item.BaseSalary}
    //             min={0}
    //             onChange={(e) => {
    //               var items = this.state.Items;
    //               var thisItem = items[index];
    //
    //               let value = e.target.value;
    //               thisItem.BaseSalary = value;
    //               let salaries = this.state.baseSalaries
    //               salaries[index] = value
    //               this.setState({Items: items, baseSalaries: salaries}, () => {
    //                 this.calculateIncrease(index)
    //               });
    //             }}
    //             isInvalid={this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].BaseSalary}
    //           />
    //           <Form.Control.Feedback
    //             type="invalid">{this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].BaseSalary ? this.state.validationCreateForm?.RankingItems[index].BaseSalary : null}</Form.Control.Feedback>
    //         </td>
    //         {/*{item.CompetencyType}*/}
    //       </td>
    //       <td>
    //         <Form.Control
    //           type="number"
    //           name="MealAllowance"
    //           value={item.MealAllowance}
    //           min={0}
    //           onChange={(e) => {
    //             var items = this.state.Items;
    //             var thisItem = items[index];
    //
    //             let value = e.target.value;
    //             thisItem.MealAllowance = value;
    //
    //             let mealAllowances = this.state.mealAllowances;
    //             mealAllowances[index] = value
    //
    //             this.setState({Items: items, mealAllowances: mealAllowances}, () => {
    //               this.calculateIncrease(index)
    //             });
    //           }}
    //           isInvalid={this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].MealAllowance}
    //         />
    //         <Form.Control.Feedback
    //           type="invalid">{this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].MealAllowance ? this.state.validationCreateForm?.RankingItems[index].MealAllowance : null}</Form.Control.Feedback>
    //       </td>
    //       <td>
    //         <Form.Control
    //           type="number"
    //           name="PerformanceAllowance"
    //           value={item.PerformanceAllowance}
    //           min={0}
    //           onChange={(e) => {
    //             var items = this.state.Items;
    //             var thisItem = items[index];
    //
    //             let value = e.target.value
    //             thisItem.PerformanceAllowance = value;
    //
    //             let performanceAllowances = this.state.performanceAllowances;
    //             performanceAllowances[index] = value
    //
    //             this.setState({Items: items, performanceAllowances: performanceAllowances}, () => {
    //               this.calculateIncrease(index)
    //             });
    //           }}
    //           isInvalid={this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].PerformanceAllowance}
    //         />
    //         <Form.Control.Feedback
    //           type="invalid">{this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].PerformanceAllowance ? this.state.validationCreateForm?.RankingItems[index].PerformanceAllowance : null}</Form.Control.Feedback>
    //       </td>
    //       <td>
    //         <Form.Control
    //           type="number"
    //           name="PositionalAllowance"
    //           value={item.PositionalAllowance}
    //           min={0}
    //           onChange={(e) => {
    //             var items = this.state.Items;
    //             var thisItem = items[index];
    //             let value = e.target.value
    //
    //             thisItem.PositionalAllowance = value;
    //             let positionalAllowances = this.state.positionalAllowances
    //             positionalAllowances[index] = value
    //
    //             this.setState({Items: items, positionalAllowances: positionalAllowances}, () => {
    //               this.calculateIncrease(index)
    //             });
    //           }}
    //           isInvalid={this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].PositionalAllowance}
    //         />
    //         <Form.Control.Feedback
    //           type="invalid">{this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].PositionalAllowance ? this.state.validationCreateForm?.RankingItems[index].PositionalAllowance : null}</Form.Control.Feedback>
    //
    //       </td>
    //       <td>
    //         <Form.Control
    //           type="number"
    //           name="NominalIncrease"
    //           value={item.NominalIncrease}
    //           // value={this.state.nominalIncrease[index]}
    //           readOnly={true}
    //           isInvalid={this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].NominalIncrease}
    //         />
    //         <Form.Control.Feedback
    //           type="invalid">{this.state.validationCreateForm?.RankingItems && this.state.validationCreateForm?.RankingItems[index].NominalIncrease ? this.state.validationCreateForm?.RankingItems[index].NominalIncrease : null}</Form.Control.Feedback>
    //       </td>
    //       <td className={'text-center'}>
    //         <Button className="btn btn-danger" name="delete-items" onClick={() => this.deleteItems(item)}>-</Button>
    //       </td>
    //
    //     </tr>
    //   );
    // });

    var viewMasterItems = Items.map((item, index) => {
      return (
        <tr key={index} data-category={item.Id}>
          <td>{item.RankingName}</td>
          <td>
            <NumberFormat
              displayType={"text"}
              thousandSeparator={true}
              value={item.BaseSalary}
            />
          </td>
          <td>
            <NumberFormat
              displayType={"text"}
              thousandSeparator={true}
              value={item.MealAllowance}
            />
          </td>
          <td>
            <NumberFormat
              displayType={"text"}
              thousandSeparator={true}
              value={item.PerformanceAllowance}
            />
          </td>
          <td>
            <NumberFormat
              displayType={"text"}
              thousandSeparator={true}
              value={item.PositionalAllowance}
            />
          </td>
          <td>
            <NumberFormat
              displayType={"text"}
              thousandSeparator={true}
              value={item.NominalIncrease}
            />
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
              <Row>
                <Col sm={4}>
                  <Button
                    className="btn btn-success mr-5"
                    name="add"
                    onClick={this.create}
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
            <FormGroup></FormGroup>

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
                        <th>Periode</th>
                        <th>Unit</th>
                        <th>Golongan</th>
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
              dialogClassName="custom-dialog"
              aria-labelledby="modal-add-ranking"
              show={this.state.isShowAddModal}
              onHide={() => this.showAddModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-add-ranking">Tambah Ranking</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Periode</Form.Label>
                  </Col>
                  <Col>
                    <DatePicker
                      className="datePickerMonthYearOnly"
                      name="Period"
                      id="Period"
                      dateFormat="MMMM yyyy"
                      showMonthYearPicker
                      value={
                        this.state.form.Period
                          ? moment(this.state.form.Period).format("MMMM yyyy")
                          : ""
                      }
                      onChange={(val) => {
                        console.log(val);
                        var { form } = this.state;
                        form["Period"] = val;
                        return this.setState({ form: form });
                      }}
                    />
                    <br />
                    <span style={{ color: "red" }}>
                      {this.state.validationCreateForm?.Period}
                    </span>
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
                      options={this.state.units}
                      value={this.state.form.Unit}
                      onChange={(e) => {
                        var { form } = this.state;
                        form["Unit"] = e;
                        form["UnitId"] = e.Id;
                        form["UnitName"] = e.Name;
                        form["selectedEmploymentClass"] = {};
                        // //  this.setRankinByUnitId(value.Id);
                        // //  this.clearItems();
                        // this.setState({ form: form });
                        return this.setState({ form: form }, () => this.getEmploymentClassesByUnit(e?.Id));
                      }}
                      isInvalid={
                        this.state.validationCreateForm.Unit ? true : null
                      }
                    ></Select>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Golongan</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      className={
                        this.state.validationCreateForm?.EmploymentClass &&
                        this.state.validationCreateForm?.EmploymentClass
                          ? "invalid-select"
                          : ""
                      }
                      options={this.state.employementClasses}
                      value={this.state.form.selectedEmploymentClass}
                      name="EmploymentClass"
                      onChange={(e) => {
                        var { form } = this.state;
                        form["selectedEmploymentClass"] = e;
                        form["EmploymentClass"] = e.name;
                        form["EmployeeClassId"] = e.value;
                        form["EmployeeGrade"] = e.grade;
                        
                        return this.setState({ form: form });
                      }}
                      isInvalid={
                        this.state.validationCreateForm?.EmploymentClass &&
                        this.state.validationCreateForm?.EmploymentClass
                          ? true
                          : null
                      }
                    ></Select>
                    <Form.Control.Feedback type="invalid">
                      {this.state.validationCreateForm.EmploymentClass}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Label></Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Table bordered striped>
                      <thead>
                        <tr className={"text-center"}>
                          <th>Ranking</th>
                          <th>Upah Pokok</th>
                          <th>Upah Makan</th>
                          <th>Tunjangan Prestasi</th>
                          <th>Tunjangan Jabatan</th>
                          <th>Nominal Kenaikian</th>
                          <th>
                            <Button
                              className="btn btn-primary"
                              name="add-items"
                              onClick={this.addItems}
                            >
                              +
                            </Button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {masterItems.length > 0 ? (
                          masterItems
                        ) : (
                          <tr className={"text-center"}>
                            <td
                              colSpan="7"
                              className={"align-middle text-center"}
                            >
                              Data Kosong
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
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

            {/*<Modal dialogClassName='custom-dialog' aria-labelledby="modal-add-ranking" show={this.state.isShowAddModal}*/}
            {/*       onHide={() => this.showAddModal(false)} animation={true}>*/}
            {/*  <Modal.Header closeButton>*/}
            {/*    <Modal.Title id="modal-add-ranking">Tambah Ranking</Modal.Title>*/}
            {/*  </Modal.Header>*/}
            {/*  <Modal.Body>*/}
            {/*    <Row>*/}
            {/*      <Col sm={4}>*/}
            {/*        <Form.Label>Periode</Form.Label>*/}
            {/*      </Col>*/}
            {/*      <Col>*/}
            {/*        <DatePicker*/}
            {/*          name="Period"*/}
            {/*          id="Period"*/}
            {/*          dateFormat="MM/yyyy"*/}
            {/*          showMonthYearPicker*/}
            {/*          value={this.state.form.Period ? moment(this.state.form.Period).format('MM/YYYY') : ""}*/}
            {/*          onChange={(val) => {*/}

            {/*            var {form} = this.state;*/}
            {/*            form["Period"] = val;*/}
            {/*            return this.setState({form: form});*/}
            {/*          }}*/}
            {/*        />*/}
            {/*        <br/>*/}
            {/*      <span style={{color:"red"}}>{this.state.validationCreateForm?.Period}</span>*/}
            {/*      </Col>*/}
            {/*    </Row>*/}
            {/*    <Row>*/}
            {/*      <Col sm={4}>*/}
            {/*        <Form.Label>Unit</Form.Label>*/}
            {/*      </Col>*/}
            {/*      <Col>*/}
            {/*        <Select*/}
            {/*          className={this.state.validationCreateForm.UnitId ? 'invalid-select' : ''}*/}
            {/*          options={this.state.units}*/}
            {/*          value={this.state.form.Unit}*/}
            {/*          onChange={(e) => {*/}

            {/*            var {form} = this.state;*/}
            {/*            form["Unit"] = e;*/}
            {/*            form["UnitId"] = e.Id;*/}
            {/*            form["UnitName"] = e.Name;*/}
            {/*            //  this.setRankinByUnitId(value.Id);*/}
            {/*            //   this.clearItems();*/}
            {/*            this.setState({form: form});*/}
            {/*          }}*/}
            {/*          isInvalid={this.state.validationCreateForm.Unit ? true : null}>*/}
            {/*        </Select>*/}
            {/*      </Col>*/}
            {/*    </Row>*/}
            {/*    <Row>*/}
            {/*      <Col sm={4}>*/}
            {/*        <Form.Label>Golongan</Form.Label>*/}
            {/*      </Col>*/}
            {/*      <Col>*/}
            {/*        <Select*/}
            {/*          className={this.state.validationCreateForm?.EmploymentClass && this.state.validationCreateForm?.EmploymentClass ? 'invalid-select' : ''}*/}
            {/*          options={this.state.employmentClasses}*/}
            {/*          value={this.state.form.selectedEmploymentClass}*/}
            {/*          name="EmploymentClass"*/}
            {/*          onChange={(e) => {*/}

            {/*            var {form} = this.state;*/}
            {/*            form["selectedEmploymentClass"] = e;*/}
            {/*            form["EmploymentClass"] = e.value;*/}
            {/*            return this.setState({form: form});*/}

            {/*          }}*/}
            {/*          isInvalid={this.state.validationCreateForm?.EmploymentClass && this.state.validationCreateForm?.EmploymentClass ? true : null}>*/}
            {/*        </Select>*/}
            {/*        <Form.Control.Feedback*/}
            {/*          type="invalid">{this.state.validationCreateForm.EmploymentClass}</Form.Control.Feedback>*/}
            {/*      </Col>*/}
            {/*    </Row>*/}
            {/*    <Row>*/}
            {/*      <Col>*/}
            {/*        <Form.Label></Form.Label>*/}
            {/*      </Col>*/}
            {/*    </Row>*/}
            {/*    <Row>*/}
            {/*      <Col>*/}
            {/*        <Table bordered striped>*/}
            {/*          <thead>*/}
            {/*          <tr className={'text-center'}>*/}
            {/*            <th>Ranking</th>*/}
            {/*            <th>Upah Pokok</th>*/}
            {/*            <th>Upah Makan</th>*/}
            {/*            <th>Tunjangan Prestasi</th>*/}
            {/*            <th>Tunjangan Jabatan</th>*/}
            {/*            <th>Nominal Kenaikian</th>*/}
            {/*          </tr>*/}
            {/*          </thead>*/}
            {/*          <tbody>*/}
            {/*          {*/}
            {/*            masterItems*/}
            {/*          }*/}
            {/*          </tbody>*/}
            {/*        </Table>*/}
            {/*      </Col>*/}
            {/*    </Row>*/}
            {/*  </Modal.Body>*/}
            {/*  <Modal.Footer>*/}
            {/*    {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary"/> Mohon tunggu...</span>) : (*/}
            {/*      <div>*/}
            {/*        <Button className="btn btn-success" name="create-ranking"*/}
            {/*                onClick={this.handleCreate}>Submit</Button>*/}
            {/*      </div>*/}
            {/*    )}*/}
            {/*  </Modal.Footer>*/}
            {/*</Modal>*/}

            <Modal
              aria-labelledby="modal-delete-ranking"
              show={this.state.isShowDeleteModal}
              onHide={() => this.showDeleteModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-delete-ranking">
                  Hapus Master Ranking
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

            <Modal
              dialogClassName="custom-dialog"
              aria-labelledby="modal-edit-ranking"
              show={this.state.isShowEditModal}
              onHide={() => this.showEditModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-edit-ranking">Edit Ranking</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Periode</Form.Label>
                  </Col>
                  <Col>
                    <DatePicker
                      className="datePickerMonthYearOnly"
                      name="Period"
                      id="Period"
                      dateFormat="MMMM yyyy"
                      showMonthYearPicker
                      value={
                        this.state.form.Period
                          ? moment(this.state.form.Period).format("MMMM YYYY")
                          : ""
                      }
                      onChange={(val) => {
                        var { form } = this.state;
                        form["Period"] = val;
                        return this.setState({ form: form });
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Unit</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label> 
                        {this.state.form?.UnitName}
                    </Form.Label>
                  </Col>
                </Row>

                <Row>
                  <Col sm={4}>
                    <Form.Label>Golongan</Form.Label>
                  </Col>
                  <Col>
                    <Select
                      className={
                        this.state.validationCreateForm?.EmploymentClass &&
                        this.state.validationCreateForm?.EmploymentClass
                          ? "invalid-select"
                          : ""
                      }
                      options={this.state.employementClasses}
                      value={this.state.form.selectedEmploymentClass}
                      name="EmploymentClass"
                      onChange={(e) => {
                        var { form } = this.state;
                        form["selectedEmploymentClass"] = e;
                        form["EmploymentClass"] = e.name;
                        form["EmployeeClassId"] = e.value;
                        form["EmployeeGrade"] = e.grade;
                        return this.setState({ form: form });
                      }}
                      isInvalid={
                        this.state.validationCreateForm?.EmploymentClass &&
                        this.state.validationCreateForm?.EmploymentClass
                          ? true
                          : null
                      }
                    ></Select>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Label></Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Table bordered striped>
                      <thead>
                        <tr className={"text-center"}>
                          <th>Nama Ranking</th>
                          <th>Upah Pokok</th>
                          <th>Upah Makan</th>
                          <th>Tunjangan Kinerja</th>
                          <th>Tunjangan Jabatan</th>
                          <th>Nominal Kenaikan</th>
                          <th>
                            <Button
                              className="btn btn-primary"
                              name="add-items"
                              onClick={this.addItems}
                            >
                              +
                            </Button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {masterItems.length > 0 ? (
                          masterItems
                        ) : (
                          <tr className={"text-center"}>
                            <td
                              colSpan="7"
                              className={"align-middle text-center"}
                            >
                              Data Kosong
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
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

            <Modal
              dialogClassName="custom-dialog"
              aria-labelledby="modal-view-ranking"
              show={this.state.isShowViewModal}
              onHide={() => this.showViewModal(false)}
              animation={true}
            >
              <Modal.Header closeButton>
                <Modal.Title id="modal-view-rankings">
                  Lihat Ranking
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Row>
                  <Col sm={4}>
                    <Form.Label>Periode</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>
                      {this.state.form?.Period
                        ? moment(this.state.form?.Period).format("MM-YYYY")
                        : ""}
                    </Form.Label>
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
                    <Form.Label>Golongan</Form.Label>
                  </Col>
                  <Col>
                    <Form.Label>{this.state.form?.EmploymentClass}</Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Label></Form.Label>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Table bordered striped>
                      <thead>
                        <tr className={"text-center"}>
                          <th>Rangking</th>
                          <th>Upah Pokok</th>
                          <th>Upah Makan</th>
                          <th>Tunjangan Kinerja</th>
                          <th>Tunjangan Jabatan</th>
                          <th>Jumlah Kenaikan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewMasterItems.length > 0 ? (
                          viewMasterItems
                        ) : (
                          <tr className={"text-center"}>
                            <td
                              colSpan="7"
                              className={"align-middle text-center"}
                            >
                              Data Kosong
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
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

export default Ranking;
