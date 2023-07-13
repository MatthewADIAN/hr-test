import axios from 'axios';
import swal from 'sweetalert';
import * as CONST from './../../../Constant';

const moment = require('moment');
const HEADERS = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 };

class Service {

    search = (params) => {

        const url = `${CONST.URI_ATTENDANCE}leave-types?size=10&page=${params.page}&keyword=${params.keyword}`;

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
        let url = `${CONST.URI_ATTENDANCE}leave-types/${id}`;
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
        const url = `${CONST.URI_ATTENDANCE}leave-types`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    delete = (id) => {
        const url = `${CONST.URI_ATTENDANCE}leave-types/${id}`;
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
        const url = `${CONST.URI_ATTENDANCE}leave-types/${id}`;
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
