import axios from 'axios';
import swal from 'sweetalert';
import * as CONST from './../../Constant';

const moment = require('moment');
const HEADERS = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 };

class Service {

    getAllEmploymentClasses = () => {
        const url = `${CONST.URI_ATTENDANCE}employee-class?size=10000`;
        
        return axios
            .get(url, { headers: HEADERS })
            .then((data) => {
                var allEmployementClasses = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.NameClass;
                    return datum;
                });

                return allEmployementClasses;

            })
            .catch(() => {
                swal({
                    icon: "error",
                    title: "Oops...",
                    text: "Terjadi kesalahan!",
                });
            });
    }

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
    getAllGroupsBySection = (sectionId) => {

        const url = `${CONST.URI_ATTENDANCE}groups/by-section?size=1000000&sectionId=${sectionId}`;

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
    getAllSectionsByUnit = (unitId) => {

        const url = `${CONST.URI_ATTENDANCE}sections/by-unit?size=1000000&unitId=${unitId}`;

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

                // console.log(data);
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
        let unitId = params?.unitId;
        let keyword = params?.keyword;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));
        let url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${keyword}&unitId=${0}&adminEmployeeId=${adminEmployeeId}`;

        if (unitId) {
            url = `${CONST.URI_ATTENDANCE}employees/filter?keyword=${keyword}&unitId=${unitId}&adminEmployeeId=${adminEmployeeId}`;
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

    searchEmployeeAndTransferSalary = (params) => {
        let unitId = params?.unitId;
        let keyword = params?.keyword;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));
        let url = `${CONST.URI_ATTENDANCE}employees/filter-transfer-salary?keyword=${keyword}&adminEmployeeId=${adminEmployeeId}&statusEmployee=AKTIF`;

        if (unitId) {
            url = `${CONST.URI_ATTENDANCE}employees/filter-transfer-salary?keyword=${keyword}&unitId=${unitId}&adminEmployeeId=${adminEmployeeId}&statusEmployee=AKTIF`;
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

    getOvertime = (params) => {
        let unitId = params.unitId || 0;
        let employeeId = params.employeeId || 0;
        let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().add(-10, 'year').format("YYYY-MM-DD");
        let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().add(10, 'year').format("YYYY-MM-DD");
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
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Tidak ada kehadiran atau belum checkout pada tanggal yang dipilih!'
                });
            });
    }

    getOvertimeById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}overtimes/${id}`;
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
        let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().add(-10, 'year').format("YYYY-MM-DD");
        let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().add(10, 'year').format("YYYY-MM-DD");
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
        let url = `${CONST.URI_ATTENDANCE}report-leave?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}`;

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


    getDriverAllowance = (params) => {
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

        let url = `${CONST.URI_ATTENDANCE}driver-allowances?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}&adminEmployeeId=${adminEmployeeId}`;

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
    createDriverAllowance = (payload) => {
        let url = `${CONST.URI_ATTENDANCE}driver-allowances`;
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

    deleteDriverAllowance = (id) => {
        let url = `${CONST.URI_ATTENDANCE}driver-allowances/${id}`;
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

    editDriverAllowance = (id, payload) => {
        let url = `${CONST.URI_ATTENDANCE}driver-allowances/${id}`;
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

    getDriverAllowanceById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}driver-allowances/${id}`;
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
    searchEmployeeSearch = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let employeeId = params.employeeId || 0;
        let keywords = params.keyword;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));

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

    getCreditUnionCut = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let employeeId = params.employeeId || 0;
        // let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        // let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : null;
        let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : null;
        let page = params.page || 1;
        let size = params.size || 10;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));
        // let url = `${CONST.URI_ATTENDANCE}credit-union-cut?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}`;
        let url = `${CONST.URI_ATTENDANCE}credit-union-cut?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}&employeeId=${employeeId}&adminEmployeeId=${adminEmployeeId}`;

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
    createCreditUnionCut = (payload) => {
        let url = `${CONST.URI_ATTENDANCE}credit-union-cut`;
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

    postThr = (payload) => {
        let url = `${CONST.URI_ATTENDANCE}thr`;
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

    postBonus = (payload) => {
        let url = `${CONST.URI_ATTENDANCE}bonus`;
        console.log("payload", payload)
        return axios.post(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                console.log("err", err.response);
                const error = err.response.data.error

                throw error;
            });
    }

    createDonation = (payload) => {
        let url = `${CONST.URI_ATTENDANCE}donation`;
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

    getBonus = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let employeeId = params.employeeId || 0;
        let startDate = params.startDate || 0;
        let endDate = params.endDate || 0;
        let page = params.page || 1;
        let size = params.size || 10;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));

        let url = `${CONST.URI_ATTENDANCE}bonus/index?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}&employeeId=${employeeId}&adminEmployeeId=${adminEmployeeId}`;

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

    getThr = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let employeeId = params.employeeId || 0;
        let startDate = params.startDate || 0;
        let endDate = params.endDate || 0;
        let page = params.page || 1;
        let size = params.size || 10;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));
        let url = `${CONST.URI_ATTENDANCE}thr/index?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}&employeeId=${employeeId}&adminEmployeeId=${adminEmployeeId}`;

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

    getDonation = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let employeeId = params.employeeId || 0;
        let startDate = params.startDate || '';
        let endDate = params.endDate || '';
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));
        let page = params.page || 1;
        let size = params.size || 10;

        let url = `${CONST.URI_ATTENDANCE}donation/index?unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}&employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}&adminEmployeeId=${adminEmployeeId}`;

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

    deleteCreditUnionCut = (id) => {
        let url = `${CONST.URI_ATTENDANCE}credit-union-cut/${id}`;
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

    editCreditUnionCut = (id, payload) => {
        let url = `${CONST.URI_ATTENDANCE}credit-union-cut/${id}`;
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

    getCreditUnionCutById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}credit-union-cut/${id}`;
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

    getDailyPayEmployeeReport = (params) => {
        let unitId = params.unitId || 0;
        let groupId = params.groupId || 0;
        let sectionId = params.sectionId || 0;
        let employeeId = params.employeeId || 0;
        // let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        // let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");
        let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : null;
        let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : null;
        let page = params.page || 1;
        let size = params.size || 10;
        let bpjsFlag = params.bpjsFlag || false;
        let bpjstkFlag = params.bpjstkFlag || false;
        let spriFlag = params.spriFlag || false;
        let pphFlag = params.pphFlag || false;
        let koperasiFlag = params.koperasiFlag || false;
        let adminEmployeeId = Number(localStorage.getItem("employeeId"));

        let url = `${CONST.URI_ATTENDANCE}report-daily-pay-employee?startDate=${startDate}&endDate=${endDate}&unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}&bpjsFlag=${bpjsFlag}&bpjstkFlag=${bpjstkFlag}&spriFlag=${spriFlag}&pphFlag=${pphFlag}&koperasiFlag=${koperasiFlag}&adminEmployeeId=${adminEmployeeId}`;
        // let url = `${CONST.URI_ATTENDANCE}report-daily-pay-employee?unitId=${unitId}&sectionId=${sectionId}&groupId=${groupId}&page=${page}&size=${size}&employeeId=${employeeId}`;

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
}

export default Service;
