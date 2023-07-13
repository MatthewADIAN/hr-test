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

  getAllShiftSchedule = () => {

    const url = `${CONST.URI_ATTENDANCE}schedules/mapping-shift-schedules`;

    return axios.get(url, { headers: HEADERS })
      .then(data => {

        var shiftSchedules = data.data.map((datum) => {
          datum.value = datum.Id;
          datum.label = datum.Name;
          return datum;
        });

        return shiftSchedules;
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

    getAllLeaveTypes = () => {

        const url = `${CONST.URI_ATTENDANCE}leave-types?size=1000000`;

        return axios.get(url, { headers: HEADERS })
            .then(data => {
                // this.setState({ loading: false, activePage: 1, page: 1, employeeKeyword: "", selectedEmployee: data.data }, () => {
                //     this.showViewEmployeeModal(true);
                // });


                var leaveTypes = data.data.data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });

                return leaveTypes;
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
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));

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
            query = `?${query}&adminEmployeeId=${adminEmployeeId}`
        }

        if (query === '') {
            query = `?adminEmployeeId=${adminEmployeeId}`
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

    getOvertime = (params) => {
        let unitId = params.unitId || 0;
        let employeeId = params.employeeId || 0;
        let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().add(-30, 'day').format("YYYY-MM-DD");
        let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().add(1, 'day').format("YYYY-MM-DD");
        let page = params.page || 1;
        let size = params.size || 10;
        let url = `${CONST.URI_ATTENDANCE}overtimes?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&employeeId=${employeeId}&page=${page}&size=${size}`;

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

    getAttendanceByEmployeeAndDate = (params) => {
        let employeeId = params.employeeId || 0;
        let date = params.date || moment().format('YYYY-MM-DD');

        let url = `${CONST.URI_ATTENDANCE}attendances/by-date-and-employee?employeeId=${employeeId}&date=${date}`;
        return axios.get(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
    }

    getOvertimeById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}overtimes/${id}`;
        return axios.get(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {

                const error = err.response.data.error

                throw error;
            });
    }

    createOvertime = (payload) => {
        let url = `${CONST.URI_ATTENDANCE}overtimes`;

        return axios.post(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // console.log(err.response.data.error);
                const error = err.response.data.error

                throw error;
            });
    }

    postEditAllAttendanceReport = (payload) => {

        let url = `${CONST.URI_ATTENDANCE}attendances/edit-all`;


        return axios.post(url, payload, { headers: HEADERS })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                // console.log(err.response.data.error);
                const error = err.response.data;

                throw error;
            });
    }

    createManyLeave = (payload) => {
        let url = `${CONST.URI_ATTENDANCE}leaves/create-many`;

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

    deleteOvertime = (id) => {
        let url = `${CONST.URI_ATTENDANCE}overtimes/${id}`;
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

    editOvertime = (id, payload) => {
        let url = `${CONST.URI_ATTENDANCE}overtimes/${id}`;
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

    getLeave = (params) => {
        let unitId = params.unitId || 0;
        let employeeId = params.employeeId || 0;
        let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().add(-10, 'day').format("YYYY-MM-DD");
        // let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().add(10, 'year').format("YYYY-MM-DD");
        let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : moment().add(10, 'day').format("YYYY-MM-DD");

        let page = params.page || 1;
        let size = params.size || 10;
        let url = `${CONST.URI_ATTENDANCE}leaves?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&employeeId=${employeeId}&page=${page}&size=${size}`;

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
    
    getLeaveReport = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        // let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        // let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : null;
        let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : null;
        let page = params.page || 1;
        let size = params.size || 10;
        let adminEmployeeId = params.adminEmployeeId;

        let url = `${CONST.URI_ATTENDANCE}report-leave?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}&adminEmployeeId=${adminEmployeeId}`;

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

    //ExitPermit API
    createExitPermit = (payload) => {
        let url = `${CONST.URI_ATTENDANCE}exit-permit`;
        return axios.post(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error

                throw error;
            });
    }

    createManyExitPermit = (payload) => {
        let url = `${CONST.URI_ATTENDANCE}exit-permit/create-many`;

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

    editExitPermit = (id, payload) => {
        let url = `${CONST.URI_ATTENDANCE}exit-permit/${id}`;
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
    getExitPermitById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}exit-permit/${id}`;
        return axios.get(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error

                throw error;
            });
    }


    getExitPermit = (params) => {
        let unitId = params.unitId || 0;
        let employeeId = params.employeeId || 0;
        let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().add(-10, 'day').format("YYYY-MM-DD");
        let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : moment().add(10, 'day').format("YYYY-MM-DD");

        let page = params.page || 1;
        let size = params.size || 10;
        let url = `${CONST.URI_ATTENDANCE}exit-permit?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&employeeId=${employeeId}&page=${page}&size=${size}`;

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

    getMasterExitPermit = (params) => {
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let unitId = params.unitId || 0;
        let startDate = params.startDate;
        let endDate = params.endDate;


        let url = `${CONST.URI_ATTENDANCE}exit-permit/master-exitpermit?unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&startDate=${startDate}&endDate=${endDate}`;
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

    deleteExitPermit = (id) => {
        let url = `${CONST.URI_ATTENDANCE}exit-permit/${id}`;
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

    //Overtime API
    getOvertimeReport = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        // let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        // let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : null;
        let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : null;
        let page = params.page || 1;
        let size = params.size || 10;
        let adminEmployeeId = params.adminEmployeeId;

        let url = `${CONST.URI_ATTENDANCE}report-overtime?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}&adminEmployeeId=${adminEmployeeId}`;

        return axios.get(url, { headers: HEADERS })
            .then((result) => {
                console.log("getOverTime ", result.data)
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

    getNotAttendReport = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let date = params.date && params.date != "Invalid date" ? moment(params.date).format("YYYY-MM-DD") : null;
        let page = params.page || 1;
        let size = params.size || 10;
        let flag = params.flag || 0;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));
        
        let url = `${CONST.URI_ATTENDANCE}report-not-attend?date=${date}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&flag=${flag}&page=${page}&size=${size}&adminEmployeeId=${adminEmployeeId}`;

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

    getEditAllAbsensiReport = (params) => {
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let unitId = params.unitId || 0;
        let date = params.date && params.date != "Invalid date" ? moment(params.date).format("YYYY-MM-DD") : null;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));
        let url = `${CONST.URI_ATTENDANCE}attendances/report/edit-all?date=${date}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&adminEmployeeId=${adminEmployeeId}`;

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

    getMasterLeave = (params) => {
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let unitId = params.unitId || 0;
        let leaveTypeId = params.leaveTypeId || 0;
        let startDate = params.startDate;
        let endDate = params.endDate;


        let url = `${CONST.URI_ATTENDANCE}leaves/master-leave?unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&leaveTypeId=${leaveTypeId}&startDate=${startDate}&endDate=${endDate}`;
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

    createLeave = (payload) => {
        let url = `${CONST.URI_ATTENDANCE}leaves`;
        return axios.post(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // console.log(err.response.data.error);
                const error = err.response.data.error

                throw error;
            });
    }

    deleteLeave = (id) => {
        let url = `${CONST.URI_ATTENDANCE}leaves/${id}`;
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

    editLeave = (id, payload) => {
        let url = `${CONST.URI_ATTENDANCE}leaves/${id}`;
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

    getLeaveById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}leaves/${id}`;
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

   
    postAttedance = (payload) => {
        console.log("payload",payload)
        let url = `${CONST.URI_ATTENDANCE}attendances/manual-checkin`;
        return axios.post(url, payload, { headers: HEADERS })
          .then((result) => {
            return result.data;
          })
          .catch((err) => {
            // console.log(err.response.data.error);
            const error = err.response.data.error
    
            throw error;
          });
      }

      getAttendance = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let employeeId = params.employeeId || 0;
        let startDate = params.startDate || 0;
        let endDate = params.endDate || 0;
        let page = params.page || 1;
        let size = params.size || 10;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    
        let url = `${CONST.URI_ATTENDANCE}attendances/?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}
        &employeeId=${employeeId}&adminEmployeeId=${adminEmployeeId}`;
    
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


      searchEmployeeSearch = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let employeeId = params.employeeId || 0;
        let keywords = params.keyword;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));

        let url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${keywords}&unitId=${unitId}
        &sectionId=${sectionId}&groupId=${groupId}&employeeId=${employeeId}&adminEmployeeId=${adminEmployeeId}&statusEmployee=AKTIF`;

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
