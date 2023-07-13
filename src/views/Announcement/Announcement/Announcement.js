import React, { Component } from 'react';
import { Input, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { Card, Form, Spinner, FormGroup, FormLabel, Image, Row, Col, Table, Button, Modal, ModalBody, ModalFooter } from "react-bootstrap";
import Select from 'react-select';
import Pagination from "react-js-pagination";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import RowButtonComponent from './../../../react-components/RowButtonComponent';
import { SketchPicker } from 'react-color';

import Service from './../Service';
import swal from 'sweetalert';
import reactCSS from 'reactcss'
import './style.css';
import { roundToNearestMinutes } from 'date-fns/fp';
import * as CONST from '../../../Constant';
import axios from 'axios';

const moment = require('moment');
const minimumDate = new Date(1945, 8, 17);
const days = ["Minggu,", "Senin,", "Selasa,", "Rabu,", "Kamis,", "Jum'at,", "Sabtu,"];
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
class Announcement extends Component {

    typeaheadEmployee = {};

    state = {
        loading: false,
        isAutoCompleteLoading: false,
        //   selectedUnitToCreate: null,
        announcementPdfUriToCreate: null,
        externalUriToCreate: null,
        startDateToCreate: null,

        endDateToCreate: null,
        isCreateLoading: false,
        isShowAddAnnouncementModal: false,
        isShowDeleteAnnouncementModal: false,
        isDeleteAnnouncementLoading: false,

        attachmentType: 0,

        selectedUnit: null,
        units: [],

        // minimum date value js
        startDate: null,
        endDate: null,

        activePage: 1,
        total: 0,
        loadingData: false,
        tableData: [],
        //selectedItem: {},

        announcement: {},
        isShowViewAnnouncementModal: false,

        isShowEditAnnouncementModal: false,
        isEditLoading: false,
        startDateToEdit: null,
        endDateToEdit: null,
        displayTextColorPicker: false,
        fileImageURL: null,
        dimensionImage: {},
        selectedFile: null,
        selectedPdfFile: null,
        displayBgColorPicker: false,
        bgColor: '#16F507',
        textColor: '#ff0808',
        title: "",
        description: "",
        positionOrder: 0,
        announcementImageUri: "",
        announcementImageUriToEdit: "",
        externalUriToEdit: "",
        announcementPdfUriToEdit: null,

        bgColorToEdit: '#16F507',
        textColorToEdit: '#ff0808',
        descriptionToEdit: "",
        positionOrderToEdit: 0,
        titleToEdit: "",
        pdfUri :"", 
        imageUri :"",
        userUnitId: localStorage.getItem("unitId"),
        userAccessRole: localStorage.getItem("accessRole"),
        validationCreateForm: {},
        validationEditForm: {},
        validationSearch: {}
    }


    resetCreateModalValue = () => {
        this.setState({
            selectedFile: null,
            selectedPdfFile: null,
            fileImageURL: null,
            announcement: {},
            startDate: null,
            endDate: null,
            description: "",
            startDateToCreate: null,
            endDateToCreate: null,
            validationCreateForm: {},
            validationEditForm: {},
            validationSearch: {},
            bgColor: '#16F507',
            textColor: '#ff0808',
            tite: "",
            dimensionImage: {},
            attachmentType: 0,
        })
    }

    resetEditModalValue = () => {
        this.setState({
            selectedFile: null,
            selectedPdfFile: null,
            fileImageURL: null,
            validationEditForm: {},
            dimensionImage: {},

        })
    }



    resetPagingConfiguration = () => {
        this.setState({
            activePage: 1,
            validationSearch: {},
            startDate: null,
            endDate: null,

        })
    }

    constructor(props) {
        super(props);
        this.service = new Service();
        this.typeaheadEmployeeCreateForm = null;
        this.chooseImage = this.chooseImage.bind(this)
        this.choosePdf = this.choosePdf.bind(this)
        // Create reference of DOM object 
        this.imgRef = React.createRef()
    }



    componentDidMount() {
        //  this.setUnits();
        this.setData();

    }

    //Change radio buton type attachment type
    onTypeChange(event) {

        let value = parseInt(event.target.value);
        if (value == 1) {
            this.setState({
                attachmentType: value,
                externalUriToCreate: null,
                externalUriToEdit: null

            });
        } else if (value = 2) {
            this.setState({
                attachmentType: value,
                selectedPdfFile: null
            });

        }


    }

    chooseImage(event) {

        this.setState({
            fileImageURL: URL.createObjectURL(event.target.files[0]),
            selectedFile: event.target.files[0],
            validationCreateForm: {...this.state.validationCreateForm, DimensionImage: null}
        }, () => {

            //Loading Image 
            setTimeout(() => {

                let height = this.imgRef.current.naturalHeight
                let width = this.imgRef.current.naturalWidth
                let dimension = {
                    height: height,
                    width: width
                }

                if (height > 512 || width > 512) {
                    if (this.state.isShowAddAnnouncementModal === true) {
                        let errors = this.state.validationCreateForm;
                        errors.DimensionImage = "Gambar terlalu besar, gunakan dimensi 512px x 512px"
                        this.setState({ validationCreateForm: errors, dimensionImage: dimension })
                    } else if (this.state.isShowEditAnnouncementModal === true) {
                        let errors = this.state.validationEditForm;
                        errors.DimensionImage = "Gambar terlalu besar, gunakan dimensi 512px x 512px"
                        this.setState({ validationEditForm: errors, dimensionImage: dimension })
                    }

                }

            }, 100);

        })


    }

    choosePdf(event) {

        let file = event.target.files[0]
        if (file.type === "application/pdf") {

            if (this.state.isShowAddAnnouncementModal === true) {
                let errors = this.state.validationCreateForm;
                errors.InvalidFileType = ""
                this.setState({ selectedPdfFile: file, validationCreateForm: errors })
            } else if (this.state.isShowEditAnnouncementModal === true) {
                let errors = this.state.validationEditForm;
                errors.InvalidFileType = ""
                this.setState({ selectedPdfFile: file, validationEditForm: errors })
            }

        } else {
            if (this.state.isShowAddAnnouncementModal === true) {
                let errors = this.state.validationCreateForm;
                errors.InvalidFileType = "File harus pdf"
                this.setState({ selectedPdfFile: file, validationCreateForm: errors })
            } else if (this.state.isShowEditAnnouncementModal === true) {
                let errors = this.state.validationEditForm;
                errors.InvalidFileType = "File harus pdf"
                this.setState({ selectedPdfFile: file, validationEditForm: errors })
            }
        }


    }
    //Pagination
    handlePageChange = (pageNumber) => {
        this.setState({ activePage: pageNumber }, () => {
            this.setData();
        });
    }

    //Color Picker
    handleClickTextColor = () => {
        this.setState({ displayTextColorPicker: !this.state.displayTextColorPicker })
    };
    handleClickBgColor = () => {
        this.setState({ displayBgColorPicker: !this.state.displayBgColorPicker })
    };

    handleCloseBgColor = () => {
        this.setState({ displayBgColorPicker: false })
    };

    handleCloseTextColor = () => {
        this.setState({ displayTextColorPicker: false })
    };

    handleTextColorChange = (color) => {
        this.setState({ textColor: color?.hex })
    };
    handleBgColorChange = (color) => {
        this.setState({ bgColor: color?.hex })
    };


    search = () => {
        this.setState({ validationSearch: {} });
        if (moment(this.state.startDate) > moment(this.state.endDate)) {
            this.setState({ validationSearch: { EndDate: "Tanggal Akhir Harus lebih Dari Tanggal Awal" } })
        } else if (this.state.startDate == null || this.state.startDate == "") {
            this.setState({ validationSearch: { StartDate: "Tanggal mulai harus diisi" } })
        } else if (this.state.endDate == null || this.state.endDate == "") {
            this.setState({ validationSearch: { EndDate: "Tanggal akhir harus diisi" } })
        } else {
            this.setData();
        }


    }

    setData = () => {
        console.log('startDate',this.state.startDate, this.state.endDate);
        const params = {
            unitId: this.state.userAccessRole == PERSONALIA_BAGIAN ? this.state.userUnitId : this.state.selectedUnit ? this.state.selectedUnit.Id : 0,
            page: this.state.activePage,
            startDate: moment(this.state.startDate).format('YYYY-MM-DD'),
            endDate: moment(this.state.endDate).format('YYYY-MM-DD')
        };

        this.setState({ loadingData: true })
        this.service
            .getAnnouncement(params)
            .then((result) => {
                console.log(result);
                this.setState({ activePage: result.page, total: result.total, tableData: result.data, loadingData: false })
            });
    }


    //Handle Click
    handleViewAnnouncementClick = (item) => {
        let startDate = moment(item.StartDate).format('YYYY-MM-DD');
        let endDate = moment(item.EndDate).format('YYYY-MM-DD');

        item.StartDate = startDate;
        item.EndDate = endDate;

        this.setState({ announcement: item }, () => {
            this.showViewAnnouncementModal(true);
        })

    }

    handleEditAnnouncementClick = (item) => {
        console.log('item',item);
        this.setState({
            announcement: item,
            startDateToEdit: moment(item.StartDate).format("YYYY-MM-DD"),
            endDateToEdit: moment(item.EndDate).format("YYYY-MM-DD"),
            externalUriToEdit: item.ExternalUri,
            bgColorToEdit: item.BgColor,
            bgColor: item.BgColor,
            textColor: item.TextColor,
            textColorToEdit: item.TextColor,
            descriptionToEdit: item.Description,
            titleToEdit: item.Title,
            positionOrderToEdit: item.PositionOrder,
            announcementImageUriToEdit: item.AnnouncementImageUri,
            attachmentType: item.AnnouncementPdfUri !== null && item.AnnouncementPdfUri !== "" ? 1 : 2
        });

        this.showEditAnnouncementModal(true);

    }

    handleDeleteAnnouncementClick = (item) => {
        this.setState({ announcement: item }, () => {
            this.showDeleteAnnouncementModal(true);
        })
    }


    //Modal Show
    showAddAnnouncementModal = (value) => {
        this.resetCreateModalValue();
        this.setState({ isShowAddAnnouncementModal: value });
    }

    showDeleteAnnouncementModal = (value) => {
        this.setState({ isShowDeleteAnnouncementModal: value });
    }

    showViewAnnouncementModal = (value) => {
        this.setState({ isShowViewAnnouncementModal: value });
    }

    showEditAnnouncementModal = (value) => {
        this.resetEditModalValue();
        this.setState({
            isShowEditAnnouncementModal: value,
        });
    }


    //Create
    create = () => {
        this.showAddAnnouncementModal(true);
    }

    checkErrorDataCreate = () => {
        let errors = {}

        if (this.state.positionOrder == 0) {
            errors.PositionOrder = "Posisi harus diisi"
        }

        if (moment(this.state.startDateToCreate) > moment(this.state.endDateToCreate)) {
            errors.EndDate = "Tanggal Akhir Harus lebih Dari Tanggal Awal"
        }

        if (this.state.startDateToCreate == null || this.state.startDateToCreate == "") {
            errors.StartDate = "Tanggal mulai harus diisi"
        }

        if (this.state.endDateToCreate == null || this.state.endDateToCreate == "") {
            errors.EndDate = "Tanggal akhir harus diisi"
        }

        if (this.state.description == null || this.state.description == "") {
            errors.Description = "Deskripsi harus diisi"
        }

        if ((this.state.description.length > 225)) {
            errors.MaxLengthDescription = "Deskripsi terlalu panjang, Maksimum 225 Karakter"
        }

        if (this.state.title == null || this.state.title == "") {
            errors.Title = "Judul mulai harus diisi"
        }

        if (this.state.dimensionImage?.height > 512 || this.state.dimensionImage?.width > 512) {
            errors.DimensionImage = "Gambar terlalu besar, gunakan dimensi 512px x 512px"
        }

        if (this.state.selectedPdfFile && this.state.selectedPdfFile?.type !== "application/pdf") {
            errors.InvalidFileType = "File harus pdf"
        }

        if (this.state.selectedFile &&
            (this.state.selectedFile?.type !== "image/jpeg" &&
                this.state.selectedFile?.type !== "image/jpg" &&
                this.state.selectedFile?.type !== "image/png" &&
                this.state.selectedFile?.type !== "image/gif"
            )) {

            errors.InvalidFileImageType = "File image harus .jpg, .png , .gif, .jpeg"
            console.log(errors.InvalidFileImageType)
        }


        return errors
    }

    isEmptyObject(obj) {
        return JSON.stringify(obj) === '{}';
    }

    handleCreateAnnouncement = () => {
        this.setState({ validationCreateForm: {} })
        let errors = this.checkErrorDataCreate()
        this.setState({ validationCreateForm: errors })

        if (this.isEmptyObject(errors)) {

            this.postAnnouncement()
        }

    }

    postAnnouncement = () => {
        const payload = {
            ExternalUri: this.state.externalUriToCreate,
            PositionOrder: this.state.positionOrder,
            StartDate: this.state.startDateToCreate && this.state.startDateToCreate != "Invalid date" ? moment(this.state.startDateToCreate).format("YYYY-MM-DD") : null,
            EndDate: this.state.endDateToCreate && this.state.endDateToCreate != "Invalid date" ? moment(this.state.endDateToCreate).format("YYYY-MM-DD") : null,
            Description: this.state.description,
            Title: this.state.title,
            TextColor: this.state.textColor,
            BgColor: this.state.bgColor,
            AnnouncementImageUri: ""
        }
        let file = this.state.selectedFile;
        let pdfFile = this.state.selectedPdfFile;

        this.setState({ isCreateLoading: true });
        this.service.createAnnouncement(payload, file, pdfFile)
            .then((result) => {
                let payload = result;
                if (pdfFile?.size > 0) {
                    console.log("prosess uploading")
                    this.service.uploadAttachment(payload, pdfFile)
                        .then((result) => {
                            this.setState({ isCreateLoading: false }, () => {

                                this.resetPagingConfiguration();
                                this.setData();
                                this.showAddAnnouncementModal(false);
                            });
                            swal({
                                icon: 'success',
                                title: 'Good...',
                                text: 'Data berhasil Menyimpan pdf!'
                            })
                        }).catch((error) => {
                            swal({
                                icon: 'error',
                                title: 'Oops...',
                                text: "Gagal Upload Lampiran"
                            })
                            this.setState({ isCreateLoading: false, validationCreateForm: error })
                        });
                } else {
                    this.setState({ isCreateLoading: false }, () => {

                        this.resetPagingConfiguration();
                        this.setData();
                        this.showAddAnnouncementModal(false);
                    });
                    swal({
                        icon: 'success',
                        title: 'Good...',
                        text: 'Data berhasil disimpan!'
                    })
                }




            })
            .catch((error) => {
                if (error) {
                    let message = ""
                    this.setState({ isCreateLoading: false, validationCreateForm: error });
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: message
                    });
                }
            });
    }



    checkErrorDataEdit = () => {
        let errors = {}

        if (this.state.positionOrderToEdit == 0) {
            errors.PositionOrder = "Posisi harus diisi"
        }

        if (moment(this.state.startDateToEdit) > moment(this.state.endDateToEdit)) {
            errors.EndDate = "Tanggal Akhir Harus lebih Dari Tanggal Awal"
        }

        if (this.state.startDateToEdit == null || this.state.startDateToEdit == "") {
            errors.StartDate = "Tanggal mulai harus diisi"
        }

        if (this.state.endDateToEdit == null || this.state.endDateToEdit == "") {
            errors.EndDate = "Tanggal akhir harus diisi"
        }

        if (this.state.titleToEdit == null || this.state.titleToEdit == "") {
            errors.Title = "Judul mulai harus diisi"
        }

        if (this.state.descriptionToEdit == null || this.state.descriptionToEdit == "") {
            errors.Description = "Deskripsi harus diisi"
        }

        if ((this.state.descriptionToEdit.length > 225)) {
            errors.MaxLengthDescription = "Deskripsi terlalu panjang,Maksimum 225 Karakter"
        }

        if (this.state.dimensionImage?.height > 512 || this.state.dimensionImage?.width > 512) {
            errors.DimensionImage = "Gambar terlalu besar, gunakan dimensi 512px x 512px"
        }

        if (this.state.selectedPdfFile && this.state.selectedPdfFile?.type !== "application/pdf") {
            errors.InvalidFileType = "File harus pdf"
        }

        if (this.state.selectedFile &&
            (this.state.selectedFile?.type !== "image/jpeg" &&
                this.state.selectedFile?.type !== "image/jpg" &&
                this.state.selectedFile?.type !== "image/png" &&
                this.state.selectedFile?.type !== "image/gif"
            )) {

            errors.InvalidFileImageType = "File image harus .jpg, .png , .gif, .jpeg"
            console.log(errors.InvalidFileImageType)
        }

        return errors
    }

    handleEditAnnouncement = () => {
        this.setState({ validationEditForm: {} })
        let errors = this.checkErrorDataEdit()
        this.setState({ validationEditForm: errors })

        if (this.isEmptyObject(errors)) {
            this.putAnnouncement()
        }


    }

    putAnnouncement = () => {
        
        let id = this.state.announcement?.Id;
        let file = this.state.selectedFile;
        let pdfFile = this.state.selectedPdfFile;

        const payload = {
            Id: this.state.announcement?.Id,
            EndDate: moment(this.state.endDateToEdit).format("YYYY-MM-DD"),
            AnnouncementImageUri: this.state.announcement?.AnnouncementImageUri,
            ExternalUri: pdfFile?.size > 0 ? null: this.state.externalUriToEdit,
            Description: this.state.descriptionToEdit,
            PositionOrder: this.state.positionOrderToEdit,
            StartDate: moment(this.state.startDateToEdit).format("YYYY-MM-DD"),
            Title: this.state.titleToEdit,
            BgColor: this.state.bgColor,
            TextColor: this.state.textColor,
            AnnouncementPdfUri:pdfFile?.size ==0 ?null :this.state.announcement?.AnnouncementPdfUri,
        }

        this.service.updateAnnouncement(id, payload, file)
            .then((result) => {
               // let payload = result;

                if (pdfFile?.size > 0) {
                    this.service.uploadAttachment(payload, pdfFile)
                        .then((result) => {
                            swal({
                                icon: 'success',
                                title: 'Good...',
                                text: 'Data berhasil diubah!'
                            })
                        }).catch((error) => {
                            this.setState({ validationEditForm: error });
                            swal({
                                icon: 'error',
                                title: 'Oops...',
                                text: "Gagal Upload Lampiran"
                            })
                        });
                } else {
                    swal({
                        icon: 'success',
                        title: 'Good...',
                        text: 'Data berhasil diubah!'
                    })
                }


                this.setState({ isEditLoading: false }, () => {

                    this.resetPagingConfiguration();
                    this.setData();
                    this.showEditAnnouncementModal(false);
                });
            })
            .catch((error) => {
                if (error) {
                    let message = "";
                    if (error.PositionOrder)
                        message += `- ${error.PositionOrder}\n`;

                    if (error.StartDate)
                        message += `- ${error.StartDate}\n`;

                    if (error.EndDate)
                        message += `- ${error.EndDate}\n`;

                    if (error.Title)
                        message += `- ${error.Title}\n`;

                    if (error.InvalidDateRange)
                        message += `- ${error.InvalidDateRange}\n`;

                    this.setState({ isCreateLoading: false, validationEditForm: error });
                    swal({
                        icon: 'error',
                        title: 'Oops...',
                        text: message
                    });
                }
            });
    }

    deleteAnnoucementClickHandler = () => {
        this.setState({ isDeleteAnnouncementLoading: true })
        this.service.deleteAnnouncement(this.state.announcement?.Id)
            .then((result) => {
                // console.log(result);
                swal({
                    icon: 'success',
                    title: 'Good...',
                    text: 'Data berhasil dihapus!'
                })
                this.setState({ isDeleteAnnouncementLoading: false, announcement: null }, () => {
                    this.resetPagingConfiguration();
                    this.setData();
                    this.showDeleteAnnouncementModal(false);
                });
            })
    }


    render() {

        //Syle for popup color
        const styles = reactCSS({
            'default': {
                bgColor: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: this.state.bgColor,

                },
                textColor: {
                    width: '36px',
                    height: '14px',
                    borderRadius: '2px',
                    background: this.state.textColor,

                },
                swatch: {
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                },
                cover: {
                    position: 'fixed',
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
            },
        });

        const { tableData } = this.state;


        const items = tableData.map((item, index) => {

            return (
                <tr key={item.Id} data-category={item.Id}>

                    <td>{++index}</td>
                    <td>{days[moment(item.StartDate).day()]} {moment(item.StartDate).format('DD/MM/YYYY')}</td>
                    <td>{moment(item.StartDate).format('DD/MM/YYYY')} -{moment(item.EndDate).format('DD/MM/YYYY')}</td>
                    <td>{item.Title}</td>
                    <td>{item.Description}</td>
                    <td>{item.PositionOrder}</td>

                    <td>
                        <Form>
                            <FormGroup>
                                <RowButtonComponent className="btn btn-success" name="view-announcement" onClick={this.handleViewAnnouncementClick} data={item} iconClassName="fa fa-eye" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-primary" name="edit-announcement" onClick={this.handleEditAnnouncementClick} data={item} iconClassName="fa fa-pencil-square" label=""></RowButtonComponent>
                                <RowButtonComponent className="btn btn-danger" name="delete-announcement" onClick={this.handleDeleteAnnouncementClick} data={item} iconClassName="fa fa-trash" label=""></RowButtonComponent>
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
                                <Col sm={1} className={'text-left'}>
                                    <FormLabel>Periode</FormLabel>
                                </Col>
                                <Col sm={4}>
                                    <Row>
                                        <Col sm={5}>
                                            <Input
                                                type="date"
                                                value={this.state.startDate}
                                                onChange={((event) => {
                                                    let errors = this.state.validationSearch
                                                    if (errors?.StartDate) {
                                                        errors['StartDate'] = ""
                                                    }

                                                    this.setState({ startDate: event.target.value, validationSearch: errors });
                                                })}
                                                isInvalid={this.state.validationSearch.StartDate ? true : null}
                                            />
                                            <span className="text-danger">{this.state.validationSearch?.StartDate}</span>
                                        </Col>
                                        <Col sm={2} className={'text-center'}>s/d</Col>
                                        <Col sm={5}>
                                            <Input
                                                type="date"
                                                value={this.state.endDate}
                                                onChange={((event) => {

                                                    let errors = this.state.validationSearch
                                                    if (errors?.EndDate) {
                                                        errors['EndDate'] = ""
                                                    }

                                                    if (errors?.InvalidDateRange) {
                                                        errors['InvalidDateRange'] = ""
                                                    }

                                                    this.setState({ endDate: event.target.value, validationSearch: errors });
                                                })}

                                            />
                                            <span className="text-danger">{this.state.validationSearch?.EndDate}</span>
                                            <span className="text-danger">{this.state.validationSearch?.InvalidDateRange}</span>

                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </FormGroup>



                        <FormGroup>
                            <Row>
                                <Col sm={1}>
                                </Col>
                                <Col sm={11}>

                                    <Button className="btn btn-primary btn-sm mr-3" name="btn-search" onClick={this.search}>Cari</Button>
                                    <Button className="btn btn-success btn-sm mr-3" name="btn-input" onClick={this.create}>Input Pengumuman</Button>

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
                                                <th>No</th>
                                                <th>Tanggal</th>
                                                <th>Periode Pengumuman</th>
                                                <th>Judul</th>
                                                <th>Deskripsi</th>
                                                <th>Posisi</th>
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

                        <Modal dialogClassName="modal-100w" size="lg" aria-labelledby="modal-add-announcement" show={this.state.isShowAddAnnouncementModal} onHide={() => this.showAddAnnouncementModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-add-announcement">Tambah Pengumuman</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Periode Pengumuman</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Row>
                                            <Col sm={5}>
                                                <Input
                                                    type="date"
                                                    value={this.state.startDateToCreate}
                                                    onChange={((event) => {
                                                        let errors = this.state.validationCreateForm;
                                                        if (errors?.StartDate) {
                                                            errors['StartDate'] = ""
                                                        }

                                                        this.setState({ startDateToCreate: event.target.value, validationCreateForm: errors });
                                                    })} />
                                                <span className="text-danger" >{this.state.validationCreateForm?.StartDate}</span>
                                            </Col>

                                            <Col sm={2}>-</Col>
                                            <Col sm={5}>
                                                <Input
                                                    type="date"
                                                    value={this.state.endDateToCreate}
                                                    onChange={((event) => {
                                                        let errors = this.state.validationCreateForm;
                                                        if (errors?.EndDate) {
                                                            errors['EndDate'] = ""
                                                        }

                                                        if (errors?.InvalidDateRange) {
                                                            errors['InvalidDateRange'] = ""
                                                        }

                                                        this.setState({ endDateToCreate: event.target.value, validationCreateForm: errors });
                                                    })}
                                                    IsInvalid={roundToNearestMinutes}
                                                />
                                                <span className="text-danger" >{this.state.validationCreateForm?.EndDate}</span><br />
                                                <span className="text-danger" >{this.state.validationCreateForm?.InvalidDateRange}</span>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Posisi</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Input
                                            type="number"
                                            value={this.state.positionOrder}
                                            onChange={((event) => {
                                                let errors = this.state.validationCreateForm;
                                                if (errors?.PositionOrder) {
                                                    errors['PositionOrder'] = ""
                                                }

                                                this.setState({ positionOrder: event.target.value, validationCreateForm: errors });
                                            })}
                                            IsInvalid={this.state.validationCreateForm?.PositionOrder}
                                        />
                                        <span className="text-danger" >{this.state.validationCreateForm?.PositionOrder}</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Judul</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Input
                                            type="text"
                                            value={this.state.title}
                                            onChange={((event) => {
                                                let errors = this.state.validationCreateForm;
                                                if (errors?.Title) {
                                                    errors['Title'] = ""
                                                }

                                                this.setState({ title: event.target.value, validationCreateForm: errors });
                                            })}
                                            IsInvalid={this.state.validationCreateForm?.Title}
                                        />
                                        <span className="text-danger" >{this.state.validationCreateForm?.Title}</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Deskripsi</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Form.Control
                                            type="text"
                                            as="textarea"
                                            name="description"
                                            value={this.state.description}
                                            maxLength={225}
                                            onChange={(e) => {
                                                let errors = this.state.validationCreateForm;
                                                if (errors?.Description) {
                                                    errors['Description'] = ""
                                                }

                                                if (errors?.MaxLengthDescription) {
                                                    errors['MaxLengthDescription'] = ""
                                                }

                                                return this.setState({ description: e.target.value, validationCreateForm: errors });
                                            }}
                                        />
                                        <span className="text-danger">{this.state.validationCreateForm?.Description}</span>
                                        <span className="text-danger">{this.state.validationCreateForm?.MaxLengthDescription}</span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Lampiran</Form.Label>

                                    </Col>

                                    <Col sm={9}>
                                        <Row>
                                            <Col sm={2}>
                                                <Input
                                                    type="radio"
                                                    name="attachmentType"
                                                    value={1}
                                                    checked={this.state.attachmentType === 1}
                                                    onChange={(event) => {
                                                        this.onTypeChange(event)
                                                    }}
                                                />   <Form.Label>Pdf</Form.Label>
                                            </Col>
                                            <Col sm={4}>
                                                <Input
                                                    type="radio"
                                                    name="attachmentType"
                                                    value={2}
                                                    checked={this.state.attachmentType === 2}
                                                    onChange={(event) => {
                                                        this.onTypeChange(event)
                                                    }}
                                                /> <Form.Label>Alamat URL</Form.Label>
                                            </Col>
                                        </Row>

                                    </Col>


                                </Row>

                                <Row>

                                    <Col sm={3}>

                                    </Col>
                                    {this.state.attachmentType == 1 ? (<>
                                        <Col sm={9}>
                                            <input type="file" name="file" onChange={this.choosePdf} />
                                            <br />
                                            <span className="text-danger">{this.state.validationCreateForm?.InvalidFileType}</span>

                                        </Col>

                                    </>) : this.state.attachmentType == 2 ? (<>
                                        <Col sm={9}>
                                            <Form.Control
                                                type="url"
                                                as="textarea"
                                                name="ExternalUri"
                                                value={this.state.externalUriToCreate}

                                                onChange={(e) => {
                                                    let errors = this.state.validationCreateForm;
                                                    if (errors?.Description) {
                                                        errors['ExternalUri'] = ""
                                                    }

                                                    return this.setState({ externalUriToCreate: e.target.value, validationCreateForm: errors });
                                                }}
                                            />
                                            <span className="text-danger">{this.state.validationCreateForm?.ExternalUri}</span>

                                        </Col>
                                    </>) : (<></>)}

                                </Row>
                                <br></br>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Image</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <input type="file" name="file" onChange={this.chooseImage} />
                                        <br />
                                        <span className="text-danger">{this.state.validationCreateForm?.InvalidFileImageType}</span>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={3}>

                                    </Col>
                                    <Col sm={9}>
                                        {this.state.fileImageURL ? <Image ref={this.imgRef} className="photo" src={this.state.fileImageURL} thumbnail /> : null}
                                        <br />
                                        <span className="text-danger">{this.state.validationCreateForm?.DimensionImage}</span>
                                    </Col>
                                </Row>



                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Warna Tulisan</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <div>
                                            <div style={styles.swatch} onClick={this.handleClickTextColor}>
                                                <div style={styles.textColor} />
                                            </div>
                                            {this.state.displayTextColorPicker ? <div style={styles.popover}>
                                                <div style={styles.cover} onClick={this.handleCloseTextColor} />
                                                <SketchPicker color={this.state.textColor} onChange={this.handleTextColorChange} />
                                            </div> : null}

                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Warna Latar Belakang</Form.Label>
                                    </Col>
                                    <Col sm={9}>

                                        <div>
                                            <div style={styles.swatch} onClick={this.handleClickBgColor}>
                                                <div style={styles.bgColor} />
                                            </div>
                                            {this.state.displayBgColorPicker ? <div style={styles.popover}>
                                                <div style={styles.cover} onClick={this.handleCloseBgColor} />
                                                <SketchPicker color={this.state.bgColor} onChange={this.handleBgColorChange} />
                                            </div> : null}

                                        </div>

                                    </Col>
                                </Row>

                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isCreateLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="create-announcement" onClick={this.handleCreateAnnouncement}>Submit</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName="modal-100w" size="lg" aria-labelledby="modal-view-announcement" show={this.state.isShowViewAnnouncementModal} onHide={() => this.showViewAnnouncementModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-view-announcement">Lihat Detail Pengumuman</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Periode pengumuman</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Row>
                                            <Col className={'col-md-5'}>
                                                <Form.Label>{days[moment(this.state.announcement?.StartDate).day()]} {moment(this.state.announcement?.StartDate).format('DD/MM/YYYY')}</Form.Label>
                                            </Col>
                                            <Col className={'col-md-2 text-center'}>-</Col>
                                            <Col className={'col-md-5'}>
                                                <Form.Label>{days[moment(this.state.announcement?.EndDate).day()]} {moment(this.state.announcement?.EndDate).format('DD/MM/YYYY')}</Form.Label>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Judul</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Form.Label>{this.state.announcement?.Title}</Form.Label>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Deskripsi</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Form.Label>{this.state.announcement?.Description}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Posisi</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Form.Label>{this.state.announcement?.PositionOrder}</Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Image</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        {this.state.announcement?.AnnouncementImageUri != "" ? <Image className="photo" src={this.state.announcement?.AnnouncementImageUri} thumbnail /> : null}

                                    </Col>
                                </Row>


                                <Row>
                                    <Col sm={3}>
                                        {this.state.announcement?.ExternalUri !== "" && this.state.announcement?.ExternalUri !== null
                                            ? (<><Form.Label>Lampiran Link</Form.Label></>)
                                            : (<><Form.Label> Lampiran PDF</Form.Label></>)}
                                    </Col>
                                    <Col sm={9}>
                                        {this.state.announcement?.ExternalUri !== "" && this.state.announcement?.ExternalUri !== null
                                            ? (<><Form.Label>{this.state.announcement?.ExternalUri}</Form.Label></>)
                                            : (<><Form.Label>{this.state.announcement?.AnnouncementPdfFilename}</Form.Label></>)}


                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Warna Tulisan</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Card
                                            style={
                                                {
                                                    width: '18rem',
                                                    color: `${this.state.announcement?.TextColor}`
                                                }}
                                            className="mb-2"
                                        >
                                            <Card.Body>
                                                <Card.Title> Text </Card.Title>
                                                <Card.Text>
                                                    "The quick brown fox jumps over the lazy dog"
                                                    </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Warna Latar Belakang</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Card
                                            style={{
                                                width: '18rem',
                                                backgroundColor: `${this.state.announcement?.BgColor}`,
                                                //   color: `${this.state.announcement?.TextColor}`
                                            }}
                                            className="mb-2"
                                        >
                                            <Card.Body>
                                                <Card.Title> BackgroundColor </Card.Title>
                                                <Card.Text>
                                                    "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit..."
                                                    </Card.Text>
                                            </Card.Body>
                                        </Card>

                                    </Col>
                                </Row>

                            </Modal.Body>
                        </Modal>

                        <Modal aria-labelledby="modal-delete-announcement" show={this.state.isShowDeleteAnnouncementModal} onHide={() => this.showDeleteAnnouncementModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-delete-announcement">Hapus Data Pengumuman</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                Apakah anda yakin ingin menghapus data ini?
                                    </Modal.Body>
                            <Modal.Footer>
                                {this.state.isDeleteAnnouncementLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-danger" name="delete-announcement" onClick={this.deleteAnnoucementClickHandler}>Hapus</Button>
                                    </div>
                                )}
                            </Modal.Footer>
                        </Modal>

                        <Modal dialogClassName="modal-100w" size={'lg'} aria-labelledby="modal-edit-announcement" show={this.state.isShowEditAnnouncementModal} onHide={() => this.showEditAnnouncementModal(false)} animation={true}>
                            <Modal.Header closeButton>
                                <Modal.Title id="modal-edit-announcement">Ubah Pengumuman</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Periode Pengumuman</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Row >
                                            <Col sm={5}>
                                                <Input
                                                    type="date"
                                                    value={this.state.startDateToEdit}
                                                    onChange={((event) => {

                                                        let errors = this.state.validationEditForm;
                                                        if (errors?.StartDate) {
                                                            errors['StartDate'] = ""
                                                        }

                                                        this.setState({ startDateToEdit: event.target.value, validationCreateForm: errors });
                                                    })} />
                                                <span style={{ color: "red" }}>{this.state.validationEditForm?.StartDate}</span>
                                            </Col>
                                            <Col sm={2} className={'text-center'}>-</Col>
                                            <Col sm={5}>
                                                <Input
                                                    type="date"
                                                    value={this.state.endDateToEdit}
                                                    onChange={((event) => {
                                                        let errors = this.state.validationEditForm;
                                                        if (errors?.EndDate) {
                                                            errors['EndDate'] = ""
                                                        }
                                                        if (errors?.InvalidDateRange) {
                                                            errors['InvalidDateRange'] = ""
                                                        }

                                                        this.setState({ endDateToEdit: event.target.value, validationEditForm: errors });
                                                    })} />
                                                <span className="text-danger">{this.state.validationEditForm?.EndDate}</span>
                                                <span className="text-danger">{this.state.validationEditForm?.InvalidDateRange}</span>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>


                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Posisi</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Input
                                            type="number"
                                            value={this.state.positionOrderToEdit}
                                            onChange={((event) => {
                                                let errors = this.state.validationEditForm;
                                                if (errors?.PositionOrder) {
                                                    errors['PositionOrder'] = ""
                                                }

                                                this.setState({ positionOrderToEdit: event.target.value, validationCreateForm: errors });
                                            })}
                                            IsInvalid={this.state.validationEditForm?.PositionOrder}

                                        />
                                        <span className="text-danger">{this.state.validationEditForm?.PositionOrder}</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Judul</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Input
                                            type="text"
                                            value={this.state.titleToEdit}
                                            onChange={((event) => {
                                                let errors = this.state.validationEditForm;
                                                if (errors?.Title) {
                                                    errors['Title'] = ""
                                                }

                                                this.setState({ titleToEdit: event.target.value, validationEditForm: errors });
                                            })}
                                            IsInvalid={this.state.validationEditForm?.Title}
                                        />
                                        <span className="text-danger">{this.state.validationEditForm?.Title}</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Deskripsi</Form.Label>
                                    </Col>
                                    <Col sm={9}>
                                        <Form.Control
                                            type="text"
                                            as="textarea"
                                            name="Description"
                                            maxLength={225}
                                            value={this.state.descriptionToEdit}
                                            onChange={(e) => {
                                                let errors = this.state.validationEditForm;
                                                if (errors?.Description) {
                                                    errors['Description'] = ""
                                                }

                                                if (errors?.MaxLengthDescription) {
                                                    errors['MaxLengthDescription'] = ""
                                                }

                                                return this.setState({ descriptionToEdit: e.target.value, validationEditForm: errors });
                                            }}
                                        />
                                        <span className="text-danger">{this.state.validationEditForm?.Description}</span>
                                        <span className="text-danger">{this.state.validationEditForm?.MaxLengthDescription}</span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Image</Form.Label>
                                    </Col>
                                    <Col sm={9}>

                                        <input type="file" name="file" onChange={this.chooseImage} />
                                        <br />
                                        <span className="text-danger">{this.state.validationEditForm?.InvalidFileImageType}</span>

                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={3}>

                                    </Col>
                                    <Col sm={9}>
                                        {this.state.selectedFile ? <Image ref={this.imgRef} className="photo" src={this.state.fileImageURL} thumbnail />
                                            : this.state.announcementImageUriToEdit ? <Image ref={this.imgRef} className="photo" src={this.state.announcementImageUriToEdit} thumbnail />
                                                : null}
                                        <br />
                                        <span className="text-danger">{this.state.validationEditForm?.DimensionImage}</span>

                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={3}>
                                        Lampiran
                                    </Col>

                                    <Col sm={2}>
                                        <Input
                                            type="radio"
                                            name="attachmentType"
                                            value={1}
                                            checked={this.state.attachmentType === 1}
                                            onChange={(event) => {
                                                this.onTypeChange(event)
                                            }}
                                        />Pdf
                                </Col>
                                    <Col sm={2}>
                                        <Input
                                            type="radio"
                                            name="attachmentType"
                                            value={2}
                                            checked={this.state.attachmentType === 2}
                                            onChange={(event) => {
                                                this.onTypeChange(event)
                                            }}
                                        /> Alamat URL
                                 </Col>
                                </Row>

                                <Row>

                                    <Col sm={3}>

                                    </Col>
                                    {this.state.attachmentType == 1 ? (<>
                                        <Col sm={9}>
                                            <Form.Label>{this.state.announcement?.AnnouncementPdfFilename}</Form.Label>
                                            <br />
                                            <input type="file" name="file" onChange={this.choosePdf} />
                                            <br />
                                            <span className="text-danger">{this.state.validationEditForm?.InvalidFileType}</span>

                                        </Col>
                                    </>) : this.state.attachmentType == 2 ? (<>
                                        <Col sm={9}>


                                            <Form.Control
                                                type="url"
                                                as="textarea"
                                                name="ExternalUri"
                                                value={this.state.externalUriToEdit}
                                                onChange={(e) => {
                                                    let errors = this.state.validationEditForm;
                                                    if (errors?.Description) {
                                                        errors['ExternalUri'] = ""
                                                    }

                                                    return this.setState({ externalUriToEdit: e.target.value, selectedPdfFile:null, validationEditForm: errors });
                                                }}
                                            />
                                            <span className="text-danger">{this.state.validationEditForm?.ExternalUri}</span>

                                        </Col>

                                    </>) : (<></>)}

                                </Row>



                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Warna Tulisan</Form.Label>
                                    </Col>
                                    <Col sm={9}>

                                        <div>
                                            <div style={styles.swatch} onClick={this.handleClickTextColor}>
                                                <div style={styles.textColor} />
                                            </div>
                                            {this.state.displayTextColorPicker ? <div style={styles.popover}>
                                                <div style={styles.cover} onClick={this.handleCloseTextColor} />
                                                <SketchPicker color={this.state.textColor} onChange={this.handleTextColorChange} />
                                            </div> : null}

                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm={3}>
                                        <Form.Label>Warna Latar Belakang</Form.Label>
                                    </Col>
                                    <Col sm={9}>

                                        <div>
                                            <div style={styles.swatch} onClick={this.handleClickBgColor}>
                                                <div style={styles.bgColor} />
                                            </div>
                                            {this.state.displayBgColorPicker ? <div style={styles.popover}>
                                                <div style={styles.cover} onClick={this.handleCloseBgColor} />
                                                <SketchPicker color={this.state.bgColor} onChange={this.handleBgColorChange} />
                                            </div> : null}

                                        </div>

                                    </Col>
                                </Row>

                            </Modal.Body>
                            <Modal.Footer>
                                {this.state.isEditLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                                    <div>
                                        <Button className="btn btn-success" name="btn-submit-edit" onClick={this.handleEditAnnouncement}>Submit</Button>
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

export default Announcement;
