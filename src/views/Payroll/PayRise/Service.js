import axios from 'axios';
import swal from 'sweetalert';
import * as CONST from './../../../Constant';

const moment = require('moment');
const HEADERS = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 };

class Service {

    search = (params) => {

        var url = `${CONST.URI_ATTENDANCE}pay-rises?size=${params.size}&page=${params.page}&adminEmployeeId=${params.adminEmployeeId}`;

        if (params.unitId) {
            url = url + `&unitId=${params.unitId}`
        }

        if (params.sectionId) {
            url = url + `&sectionId=${params.sectionId}`
        }

        if (params.groupId) {
            url = url + `&groupId=${params.groupId}`
        }

        if (params.employmentClass) {
            url = url + `&employmentClass=${params.employmentClass}`
        }

        if (params.period) {
            url = url + `&period=${params.period}`
        }

        if (params.employeeId) {
            url = url + `&employeeId=${params.employeeId}`
        }

        if (params.keyword) {
            url = url + `&keyword=${params.keyword}`
        }

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
        let url = `${CONST.URI_ATTENDANCE}pay-rises/${id}`;
        return axios.get(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {

                const error = err.response.data.error

                throw error;
            });
    }

    create = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}pay-rises`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    delete = (id) => {
        const url = `${CONST.URI_ATTENDANCE}pay-rises/${id}`;
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
        const url = `${CONST.URI_ATTENDANCE}pay-rises/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

}

export default Service;