import axios from 'axios';
import swal from 'sweetalert';
import * as CONST from './../../../Constant';
import fileSaver from 'file-saver';
import { param } from 'jquery';

const moment = require('moment');
const HEADERS = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 };

class Service {

    search = (params) => {

        console.log(params);
        const url = `${CONST.URI_ATTENDANCE}employee-trainings?size=10&page=${params.page}&keyword=${params.keyword}&startDate=${params.startDate}&endDate=${params.endDate}&employeeId=${params.employeeId}&unitId=${params.unitId}&sectionId=${params.sectionId}&groupId=${params.groupId}`;

        return axios.get(url, { headers: HEADERS })
            .then(result => {
                return result.data;
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }

    getById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}employee-trainings/${id}`;
        return axios.get(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // console.log(err.response.data.error);
                const error = err.response.data.error

                throw error;
            });
    }

    create = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}employee-trainings`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {

             //const error = err.response.data.error
                throw err;
            });
    }

    delete = (id) => {
        const url = `${CONST.URI_ATTENDANCE}employee-trainings/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    edit = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}employee-trainings/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    upload = (file) => {
        var data = new FormData();
        data.append('file', file);

        const url = `${CONST.URI_ATTENDANCE}employee-trainings/upload`;
        const headers = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 }
        return axios.post(url, data, { headers: headers })
            .then(data => {
                return data;
            }).catch(err => {
                throw err;
            });
    }

    download = (params) => {
        const url = `${CONST.URI_ATTENDANCE}employee-trainings/download?keyword=${params.keyword}&startDate=${params.startDate}&endDate=${params.endDate}&employeeId=${params.employeeId}&unitId=${params.unitId}&sectionId=${params.sectionId}&groupId=${params.groupId}&adminEmployeeId=${params.adminEmployeeId}`;
        return axios.get(url, { headers: HEADERS, responseType: "blob" })
            .then((result) => {
                // console.log();
                let filename = result.headers["content-disposition"].split(";")[1].replace("filename=", "").replace(/"/, "").replace(/"/, "");
                const url = window.URL.createObjectURL(new Blob([result.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }


}

export default Service;
