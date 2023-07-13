import axios from 'axios';
import swal from 'sweetalert';
import * as CONST from './../../Constant';

const moment = require('moment');
const HEADERS = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 };

class Service {

    //API searching
    getAllUnits = () => {

        const url = `${CONST.URI_ATTENDANCE}units?size=1000000`;

        return axios.get(url, { headers: HEADERS })
            .then(data => {
               
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
    getAllGroupsBySection = (sectionId) => {

        const url = `${CONST.URI_ATTENDANCE}groups/by-section?size=1000000&sectionId=${sectionId}`;

        return axios.get(url, { headers: HEADERS })
            .then(data => {
               
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
    getAllSectionsByUnit = (unitId) => {

        const url = `${CONST.URI_ATTENDANCE}sections/by-unit?size=1000000&unitId=${unitId}`;

        return axios.get(url, { headers: HEADERS })
            .then(data => {
                
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
        let unitId = params?.unitId;
        let keyword = params?.keyword;
        let url = `${CONST.URI_ATTENDANCE}employees?keyword=${keyword}`;

        if (unitId) {
            url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${keyword}&unitId=${unitId}`;
        }

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

    searchEmployeeSearch = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let employeeId = params.employeeId || 0;
        let keywords = params.keyword;
        let adminEmployeeId = params.adminEmployeeId;
        let url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${keywords}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&employeeId=${employeeId}&adminEmployeeId=${adminEmployeeId}`;

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


//API Service RequestWFH

getRecapWfh=(query)=>{
    let url = `${CONST.URI_ATTENDANCE}wfh/recap-wfh/${query}`;
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

getIndexWfh = (params) => {
    let unitId = params.unitId || 0;
    let groupId = params.groupId || 0;
    let sectionId = params.sectionId || 0;
    let employeeId = params.employeeId || 0;
    let startDate = params.startDate || 0;
    let endDate = params.endDate || 0;
    let page = params.page || 1;
    let size = params.size || 10;
    let adminEmployeeId = params.adminEmployeeId;

    let url = `${CONST.URI_ATTENDANCE}wfh/index?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}&employeeId=${employeeId}&adminEmployeeId=${adminEmployeeId}`;

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


  approveRequest = (payload) => {
    let url = `${CONST.URI_ATTENDANCE}wfh/approve/`;

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


rejectRequest = (payload) => {
    let url = `${CONST.URI_ATTENDANCE}wfh/reject/`;

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

resetRequest = (payload) => {
    let url = `${CONST.URI_ATTENDANCE}wfh/reset/`;

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


    
}

export default Service;
