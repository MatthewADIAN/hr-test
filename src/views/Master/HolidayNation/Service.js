import axios from 'axios';
import swal from 'sweetalert';
import * as CONST from './../../../Constant';

const moment = require('moment');
const HEADERS = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 };
const DEFAULT_ROUTEAPI = `${CONST.URI_ATTENDANCE}holiday-nation`;
class Service {

    search = (params) => {

        let url = `${DEFAULT_ROUTEAPI}?size=10&page=${params.page}`;

        if(params.startDate){
            url += `&startDate=${params.startDate}`;
        }

        if(params.endDate){
            url += `&endDate=${params.endDate}`;
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

  getHolidayNation = (params) => {

    let url = `${DEFAULT_ROUTEAPI}/search?size=10&page=${params.page}&=${params.keyword}`;


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
        let url = `${DEFAULT_ROUTEAPI}/${id}`;
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
        const url = `${DEFAULT_ROUTEAPI}`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    delete = (id) => {
        const url = `${DEFAULT_ROUTEAPI}/${id}`;
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
        const url = `${DEFAULT_ROUTEAPI}/${id}`;
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
