import React, { Component } from 'react';
// import { Card, CardBody, CardHeader, Col, Row, Table, FormGroup, Form } from 'reactstrap';
import { Input, Card, CardBody } from 'reactstrap';
import { Form, Spinner, FormGroup, FormLabel, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';

import Service from './../Service';
import swal from 'sweetalert';

import './style.css';

const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);

class Group extends Component {

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
        isShowAddGroupModal: false,

        isShowDeleteGroupModal: false,

        isShowEditGroupModal: false,
        isEditLoading: false,

        isShowUploadModal: false,
        selectedFile: null,

        validationCreateForm: {},
        selectedGroupFilter :"",

        units: [],
        sections: [],
        sectionsByUnit: []
    }

    resetModalValue = () => {
        this.setState({
            validationCreateForm: {},
            form: {},
            selectedFile: null
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
        this.setUnit();
        this.setSection();
    }

    setData = () => {
        const params = {
            page: this.state.activePage,
            keyword:this.state.selectedGroupFilter
        };

        this.setState({ loadingData: true })
        this.service
            .getGroups(params)
            .then((result) => {
                this.setState({ activePage: result.Page, total: result.Total, tableData: result.Data, loadingData: false })
            });
    }

    setUnit = () => {
        this.setState({ loadingData: true })
        this.service
            .getAllUnits()
            .then((result) => {
                this.setState({ units: result, loadingData: false })
            });
    }

    setSection = () => {
        this.setState({ loadingData: true })
        this.service
            .getAllSections()
            .then((result) => {
                this.setState({ sections: result, loadingData: false })
            });
    }

    getSectionsByUnit = (unitId) => {
        let results = this.state.sections.filter(d => d.UnitId === unitId);
        this.setState({sectionsByUnit: results});
    }

    search = (keyword) => {
      this.setState({page:1, selectedGroupFilter:keyword},()=>this.setData())

    }

    create = () => {
        this.showAddGroupModal(true);
    }

    upload = () => {
        this.showUploadModal(true);
    }

    showUploadModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowUploadModal: value });
    }

    showAddGroupModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowAddGroupModal: value, validationCreateForm: {} });
    }

    showDeleteGroupModal = (value) => {
        this.resetModalValue();
        this.setState({ isShowDeleteGroupModal: value });
    }

    showEditGroupModal = (value) => {
        this.setState({ isShowEditGroupModal: value });
    }

    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    handleCreateGroup = () => {
        const payload = {
            UnitId: this.state.form?.unitId,
            SectionId: this.state.form?.sectionId,
            Name: this.state.form?.Name
        }

        this.setState({ isCreateLoading: true });
        this.service.createGroup(payload)
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
                    this.showAddGroupModal(false);
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

    handleEditGroup = () => {
        const payload = {
            UnitId: this.state.form?.unitId,
            SectionId: this.state.form?.sectionId,
            Name: this.state.form?.Name
        }

        // console.log(payload);

        this.setState({ isEditLoading: true });
        this.service.editGroup(this.state.selectedItem?.Id, payload)
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
                    this.showEditGroupModal(false);
                });
            })
            .catch((error) => {
                // console.log(error)
                this.setState({ validationCreateForm: error.response.data.error, isEditLoading: false });
            });
    }

    handleEditGroupClick = (item) => {
        this.setState({ selectedItem: item });
        this.service.getGroupById(item.Id)
            .then((group) => {
                const { form, units, sections } = this.state;
                let unit = units.find((element) => element.Id == group.UnitId);
                let section = sections.find((element) => element.Id == group.SectionId);
                group["unit"] = unit;
                group["unitId"] = unit?.Id;
                group["section"] = section;
                group["sectionId"] = section?.Id;
                // console.log(group);
                this.setState({ form: group }, () => {
                    this.showEditGroupModal(true);
                })
            })
    }

    handleDeleteGroupClick = (item) => {
        this.setState({ selectedItem: item }, () => {
            this.showDeleteGroupModal(true);
        })
    }

    deleteGroupClickHandler = () => {
        this.setState({ isDeleteGroupLoading: true })
        this.service.deleteGroup(this.state.selectedItem?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteGroupLoading: false, selectedItem: null }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteGroupModal(false);
                });
            }).catch((error) => {
                this.setState({ isDeleteGroupLoading: false, isShowDeleteGroupModal: false });
                if (error) {
                    swal({
                        icon: 'error',
                        title: 'Tidak bisa menghapus group',
                        text: error[Object.keys(error)[0]]
                    })
                }
            });
    }

    onInputFileHandler = (event) => {
        this.setFile(event.target.files[0]);
    }

    setFile = (file) => {
        this.setState({ selectedFile: file });
    }

    handleUploadGroup = () => {
        this.service.uploadGroup(this.state.selectedFile)
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
                    <td>{item.UnitName}</td>
                    <td>{item.SectionName}</td>
                    <td>{item.Name}</td>
                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-primary" name="edit-group" onClick={this.handleEditGroupClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-group" onClick={this.handleDeleteGroupClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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
                                        <Button className="btn btn-success mr-5" name="add_group" onClick={this.create}>Tambah Grup</Button>
                                    </Col>
                                  <Col sm={4}></Col>
                                  <Col sm={4}>
                                    <Form.Control
                                      className="float-right"
                                      type="text"
                                      name="keyword"
                                      value={this.state.selectedGroupFilter}
                                      onChange={(e) => {
                                        return this.search(e.target.value);
                                      }}
                                      placeholder="Cari group"
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
                                                        <th>Unit</th>
                                                        <th>Seksi</th>
                                                        <th>Grup</th>
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

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal_add_group" show={this.state.isShowAddGroupModal} onHide={() => this.showAddGroupModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal_add_group">Tambah Grup</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Unit</Form.Label>
                                        </Col>
                                        <Col>
                                            <Select
                                                className={this.state.validationCreateForm.Unit ? 'invalid-select' : ''}
                                                options={this.state.units}
                                                value={this.state.form.unit}
                                                onChange={(value) => {
                                                    var { form } = this.state;
                                                    form["unit"] = value;
                                                    form["unitId"] = value.Id;
                                                    this.setState({ form: form }, () => {
                                                        this.setState({ form: {...form, section: null , sectionId: null} })
                                                        this.getSectionsByUnit(value.Id)
                                                    });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Unit ? true : null}>
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Seksi</Form.Label>
                                        </Col>
                                        <Col>
                                            <Select
                                                className={this.state.validationCreateForm.Section ? 'invalid-select' : ''}
                                                options={this.state.sectionsByUnit}
                                                value={this.state.form.section}
                                                onChange={(value) => {
                                                    var { form } = this.state;
                                                    form["section"] = value;
                                                    form["sectionId"] = value.Id;
                                                    this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Section ? true : null}>
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Nama</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="Name"
                                                value={this.state.form.Name}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Name || this.state.validationCreateForm.Duplicate}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Name ? this.state.validationCreateForm.Name : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="create-group" onClick={this.handleCreateGroup}>Submit</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal aria-labelledby="modal-delete-group" show={this.state.isShowDeleteGroupModal} onHide={() => this.showDeleteGroupModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-delete-group">Hapus Group</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isDeleteGroupLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-danger" name="delete-group" onClick={this.deleteGroupClickHandler}>Hapus</Button>
                                        </div>
                                    )}
                                </Modal.Footer>
                            </Modal>

                            <Modal dialogClassName="modal-90w" aria-labelledby="modal-edit-group" show={this.state.isShowEditGroupModal} onHide={() => this.showEditGroupModal(false)} animation={true}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal-edit-group">Edit Group</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Unit</Form.Label>
                                        </Col>
                                        <Col>
                                            <Select
                                                className={this.state.validationCreateForm.Unit ? 'invalid-select' : ''}
                                                options={this.state.units}
                                                value={this.state.form.unit}
                                                onChange={(value) => {
                                                    var { form } = this.state;
                                                    form["unit"] = value;
                                                    form["unitId"] = value.Id;
                                                    this.setState({ form: form }, () => {
                                                        this.setState({ form: {...form, section: null , sectionId: null} })
                                                        this.getSectionsByUnit(value.Id)
                                                    });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Unit ? true : null}>
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Seksi</Form.Label>
                                        </Col>
                                        <Col>
                                            <Select
                                                className={this.state.validationCreateForm.Section ? 'invalid-select' : ''}
                                                options={this.state.sectionsByUnit}
                                                value={this.state.form.section}
                                                onChange={(value) => {
                                                    var { form } = this.state;
                                                    form["section"] = value;
                                                    form["sectionId"] = value.Id;
                                                    this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Section ? true : null}>
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={4}>
                                            <Form.Label>Nama</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                name="Name"
                                                value={this.state.form.Name}
                                                onChange={(e) => {
                                                    var { form } = this.state;
                                                    form[e.target.name] = e.target.value;
                                                    return this.setState({ form: form });
                                                }}
                                                isInvalid={this.state.validationCreateForm.Name || this.state.validationCreateForm.Duplicate}
                                            />
                                            <Form.Control.Feedback type="invalid">{this.state.validationCreateForm.Name ? this.state.validationCreateForm.Name : this.state.validationCreateForm.Duplicate}</Form.Control.Feedback>
                                        </Col>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                        <div>
                                            <Button className="btn btn-success" name="edit-group" onClick={this.handleEditGroup}>Submit</Button>
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

export default Group;
