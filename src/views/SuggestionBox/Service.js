import axios from 'axios';
import swal from 'sweetalert';
import * as CONST from './../../Constant';

const moment = require('moment');
const HEADERS = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 };

class Service {

    getAllUnits = () => {

        const url = `${CONST.URI_ATTENDANCE}units?size=1000000`;

        return axios.get(url, { headers: HEADERS })
            .then(data => {
                // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
                //     this.showViewEmployeeModal(true);
                // });

                var units = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });

                return units;
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }

    getAllGroups = () => {
        const url = `${CONST.URI_ATTENDANCE}groups?size=1000000`;
        return axios.get(url, { headers: HEADERS })
            .then(data => {
                // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
                //     this.showViewEmployeeModal(true);
                // });

                var units = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });

                return units;
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }

    getAllGroupsBySectionId = (sectionId) => {

        const url = `${CONST.URI_ATTENDANCE}groups/by-section?sectionId=${sectionId}&size=1000000`;

        return axios.get(url, { headers: HEADERS })
            .then(data => {
                // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
                //     this.showViewEmployeeModal(true);
                // });

                var units = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });

                return units;
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }
    getAllSections = () => {

        const url = `${CONST.URI_ATTENDANCE}sections?size=1000000`;

        return axios.get(url, { headers: HEADERS })
            .then(data => {
                // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
                //     this.showViewEmployeeModal(true);
                // });

                var units = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });

                return units;
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }



    getAllSectionsByUnitId = (unitId) => {

        const url = `${CONST.URI_ATTENDANCE}sections/by-unit?unitId=${unitId}&size=1000000`;

        return axios.get(url, { headers: HEADERS })
            .then(data => {
                // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
                //     this.showViewEmployeeModal(true);
                // });

                var units = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });

                return units;
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }


    searchEmployee = (params) => {
        let unitId = params.unitId;
        let keyword = params.keyword;
        let statusEmployee = params.statusEmployee;
        let sectionId = params.sectionId;
        let groupId = params.groupId;
        let url = `${CONST.URI_ATTENDANCE}employees/filter`;

        // if (unitId) {
        //     url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${keyword}&unitId=${unitId}&statusEmployee=${statusEmployee}`;
        // }

        let query = '';


        if (unitId) {
            if (query === '') {
                query = `unitId=${unitId}`
            } else {
                query = `${query}&unitId=${unitId}`
            }
        }

        if (sectionId) {
            if (query === '') {
                query = `sectionId=${sectionId}`
            } else {
                query = `${query}&sectionId=${sectionId}`
            }
        }

        if (groupId) {
            if (query === '') {
                query = `groupId=${groupId}`
            } else {
                query = `${query}&groupId=${groupId}`
            }
        }

        if (statusEmployee) {
            if (query === '') {
                query = `statusEmployee=${statusEmployee}`
            } else {
                query = `${query}&statusEmployee=${statusEmployee}`
            }
        }

        if (keyword) {
            if (query === '') {
                query = `keyword=${keyword}`
            } else {
                query = `${query}&keyword=${keyword}`
            }
        }

        if (query !== '') {
            query = `?${query}`
        }

        url = url + query;

        return axios.get(url, { headers: HEADERS })
            .then((result) => {
                let items = [];
                result.data.data.map(datum => {
                    items.push(datum)
                });

                return items;
            }).catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }



    //Suggestion Box API
    createSuggestionBoxRecap = (payload) => {
        let url = `${CONST.URI_ATTENDANCE}suggestionbox/`;

        return axios.post(url, payload, { headers: HEADERS })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                console.log(err.response);
                const error = err.response.data.error;

                throw error;
            });
    }

    editSuggestionBoxRecap = (id, payload) => {
        let url = `${CONST.URI_ATTENDANCE}suggestionbox/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // console.log(err.response.data.error);
                const error = err.response.data.error

                throw error;
            });
    }

    getSuggestionBoxRecapById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}suggestionbox/${id}`;
        return axios.get(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error

                throw error;
            });
    }


    getSuggestionBoxRecap = (params) => {
        let unitId = params.unitId || 0;
        let employeeId = params.employeeId || 0;
        let startDate = params.startDate;
        let endDate = params.endDate;
        let type = params.type || 0;
        let page = params.page || 1;
        let size = params.size || 10;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));

        let url = `${CONST.URI_ATTENDANCE}suggestionbox/index?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&employeeId=${employeeId}&type=${type}&page=${page}&size=${size}&adminEmployeeId=${adminEmployeeId}`;

        return axios.get(url, { headers: HEADERS })
            .then((result) => {
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

    getRecapPdf=(query)=>{
        let url = `${CONST.URI_ATTENDANCE}suggestionbox/recap-pdf/${query}`;
      return  axios({
            method: 'get',
            url: url,
            responseType: 'blob',
            headers: HEADERS,
          }).then(data => {
              return data
          }).catch(err => {
              throw err
            
          });
    }

    getRecapXls=(query)=>{
        let url = `${CONST.URI_ATTENDANCE}suggestionbox/recap-xls/${query}`;
      return  axios({
            method: 'get',
            url: url,
            responseType: 'blob',
            headers: HEADERS,
          }).then(data => {
              return data
          }).catch(err => {
              throw err
            
          });
    }

    deleteSuggestionBox = (id) => {
        let url = `${CONST.URI_ATTENDANCE}suggestionbox/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // console.log(err.response.data.error);
                const error = err.response.data.error

                throw error;
            });
    }

    searchEmployeeSearch = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let employeeId = params.employeeId || 0;
        let keywords = params.keyword;
        let url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${keywords}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&employeeId=${employeeId}`;

        return axios.get(url, { headers: HEADERS })
            .then((result) => {
                let items = [];

                result.data.data.map(datum => {
                    items.push(datum)
                });

                return items;
            }).catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }
}

export default Service;
