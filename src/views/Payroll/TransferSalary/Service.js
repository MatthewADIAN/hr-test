import axios from 'axios';
import swal from 'sweetalert';
import * as CONST from './../../../Constant';

const moment = require('moment');
const HEADERS = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 };

class Service {

    search = (params) => {
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));
        let url = `${CONST.URI_ATTENDANCE}transfer-salary?size=${params.size}&page=${params.page}&unitId=${0}&adminEmployeeId=${adminEmployeeId}`;

        if (params.unitId) {
            url = `${CONST.URI_ATTENDANCE}transfer-salary?size=${params.size}&page=${params.page}&unitId=${params.unitId}&adminEmployeeId=${adminEmployeeId}`;
        }

        if (params.period) {
            url = url + `&period=${params.period}`
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

    create = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}transfer-salary`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }
}

export default Service;