import axios from 'axios';
import swal from 'sweetalert';
import * as CONST from './../../Constant';

const moment = require('moment');
const HEADERS = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 };

class Service {

    getAllUnits = () => {

        const url = `${CONST.URI_ATTENDANCE}units?size=1000000`;

        return axios.get(url, { headers: HEADERS })
            .then(result => {

                var units = result.data.Data.map((datum) => {
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

    getAllRoleEmployees = () => {
        const url = `${CONST.URI_ATTENDANCE}positions?size=1000000`;

        return axios.get(url, { headers: HEADERS })
            .then(result => {

                var roleEmployees = result.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });

                return roleEmployees;
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }

    getRoleEmployeesByUnitId = (unitId) => {
        const url = `${CONST.URI_ATTENDANCE}employee-class/get-position-byunit?unitId=${unitId}`;

        return axios.get(url, { headers: HEADERS })
            .then(result => {

                var roleEmployees = result.data.Data.map((datum) => {
                    datum.value = datum.PositionId;
                    datum.label = datum.NamePosition;
                    return datum;
                });

                return roleEmployees;
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }

    getAllEmploymentClasses = () => {
        const url = `${CONST.URI_ATTENDANCE}employee-class?size=1000000`;

        return axios.get(url, { headers: HEADERS })
            .then(result => {

                var allEmploymentClasses = result.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.NameClass;
                    return datum;
                });

                return allEmploymentClasses;
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });

    }

    getAllPositions = () => {

        const url = `${CONST.URI_ATTENDANCE}positions?size=1000000`;

        return axios.get(url, { headers: HEADERS })
            .then(result => {

                var positions = result.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });

                return positions;
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }

    getAllEmployeeClasss = () => {

        const url = `${CONST.URI_ATTENDANCE}employee-class?size=1000000`;

        return axios.get(url, { headers: HEADERS })
            .then(result => {

                var positions = result.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });

                return positions;
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
        const url = `${CONST.URI_ATTENDANCE}sections?size=10000`;
        return axios.get(url, { headers: HEADERS })
            .then(data => {

                var sections = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });
                return sections
            }).catch(err => {
                alert("Terjadi kesalahan!");
            });
    }

    getSectionsByUnit = unitId => {
        const url = `${CONST.URI_ATTENDANCE}sections/by-unit?size=10000&unitId=${unitId}`;
        return axios.get(url, { headers: HEADERS })
            .then(data => {

                var sections = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });
                return sections
            }).catch(err => {
                alert("Terjadi kesalahan!");
            });
    }

    getAllGroups = () => {
        const url = `${CONST.URI_ATTENDANCE}groups?size=10000`;
        return axios.get(url, { headers: HEADERS })
            .then(data => {

                var groups = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Name;
                    return datum;
                });
                return groups
            }).catch(err => {
                alert("Terjadi kesalahan!");
            });
    }

    getAllStatusPph = () => {
        const url = `${CONST.URI_ATTENDANCE}status-pph?size=10000`;
        return axios.get(url, { headers: HEADERS })
            .then(data => {

                var groups = data.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.Status;
                    return datum;
                });
                return groups
            }).catch(err => {
                alert("Terjadi kesalahan!");
            });
    }

    getAllRankings = (param) => {

        var url = `${CONST.URI_ATTENDANCE}ranking?size=1000000`;

        if (param.Type) {
            url = url + `&type=${param.Type}`;
        }

        if (param.unitId) {
            url = url + `&unitId=${param.unitId}`;
        }

        return axios.get(url, { headers: HEADERS })
            .then(result => {

                var units = result.data.Data.map((datum) => {
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

    getAllCompetencies = (param) => {

        var url = `${CONST.URI_ATTENDANCE}competencies?size=1000000`;

        if (param.Type) {
            url = url + `&type=${param.Type}`;
        }

        if (param.unitId) {
            url = url + `&unitId=${param.unitId}`;
        }

        return axios.get(url, { headers: HEADERS })
            .then(result => {
                if (result.data.Data.length > 0) {
                    var competencyItems = result.data.Data[0].CompetencyItems;
                    var units = competencyItems.map((datum) => {
                        datum.value = datum.Id;
                        datum.label = datum.Name;
                        return datum;
                    });
                    return units;
                } else {
                    return [];
                }
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }

    getAllCompetenciesByType = (param) => {

        var url = `${CONST.URI_ATTENDANCE}competencies/by-type?type=${param.Type}`;

        return axios.get(url, { headers: HEADERS })
            .then(result => {

                var units = result.data.Data.map((datum) => {
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

    getUnits = (params) => {

        const url = `${CONST.URI_ATTENDANCE}units?size=10&page=${params.page}&keyword=${params.keyword}`;

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

    getPositions = (params) => {

        let url = `${CONST.URI_ATTENDANCE}positions?size=10&page=${params.page}&keyword=${params.keyword}`;

        if (Object.keys(params.order)[0]) {
            const orderParam = JSON.stringify(params.order);
            url = `${CONST.URI_ATTENDANCE}positions?size=10&page=${params.page}&keyword=${params.keyword}&order=${orderParam}`;
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

    getEmployeeClass = (params) => {

        let url = `${CONST.URI_ATTENDANCE}employee-class?size=10&page=${params.page}&keyword=${params.keyword}`;

        if (Object.keys(params.order)[0]) {
            const orderParam = JSON.stringify(params.order);
            url = `${CONST.URI_ATTENDANCE}employee-class?size=10&page=${params.page}&keyword=${params.keyword}&order=${orderParam}`;
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

    getUnitById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}units/${id}`;
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

    getPositionById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}positions/${id}`;
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

    getEmployeeClassById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}employee-class/${id}`;
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

    createUnit = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}units`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    createPosition = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}positions`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {
                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    createEmployeeClass = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}employee-class`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {
                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    deleteUnit = (id) => {
        const url = `${CONST.URI_ATTENDANCE}units/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    deletePosition = (id) => {
        const url = `${CONST.URI_ATTENDANCE}positions/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    deleteEmployeeClass = (id) => {
        const url = `${CONST.URI_ATTENDANCE}employee-class/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    editUnit = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}units/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    editPosition = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}positions/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    editEmployeeClass = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}employee-class/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    uploadUnit = (file) => {
        var data = new FormData();
        data.append('file', file);

        const url = `${CONST.URI_ATTENDANCE}units/upload`;
        const headers = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 }
        return axios.post(url, data, { headers: headers })
            .then(data => {
                return data;
            }).catch(err => {
                throw err;
            });
    }

    uploadPosition = (file) => {
        var data = new FormData();
        data.append('file', file);

        const url = `${CONST.URI_ATTENDANCE}positions/upload`;
        const headers = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 }
        return axios.post(url, data, { headers: headers })
            .then(data => {
                return data;
            }).catch(err => {
                throw err;
            });
    }

    uploadEmployeeClass = (file) => {
        var data = new FormData();
        data.append('file', file);

        const url = `${CONST.URI_ATTENDANCE}employee-class/upload`;
        const headers = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 }
        return axios.post(url, data, { headers: headers })
            .then(data => {
                return data;
            }).catch(err => {
                throw err;
            });
    }

    getSections = (params) => {

        const url = `${CONST.URI_ATTENDANCE}sections/new?size=10&page=${params.page}&keyword=${params.keyword}`;

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

    getSectionById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}sections/${id}`;
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

    createSection = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}sections`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    deleteSection = (id) => {
        const url = `${CONST.URI_ATTENDANCE}sections/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    editSection = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}sections/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    getGroups = (params) => {

        const url = `${CONST.URI_ATTENDANCE}groups/new?size=10&page=${params.page}&keyword=${params.keyword}`;

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

    getGroupById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}groups/${id}`;
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

    createGroup = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}groups`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    deleteGroup = (id) => {
        const url = `${CONST.URI_ATTENDANCE}groups/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    editGroup = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}groups/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    getLocations = (params) => {

        const url = `${CONST.URI_ATTENDANCE}locations?size=10&page=${params.page}&keyword=${params.keyword}`;

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

    getLocationById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}locations/${id}`;
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

    createLocation = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}locations`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    deleteLocation = (id) => {
        const url = `${CONST.URI_ATTENDANCE}locations/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    editLocation = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}locations/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    //Education
    createEducation = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}education`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    editEducation = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}education/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    deleteEducation = (id) => {
        const url = `${CONST.URI_ATTENDANCE}education/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    getEducationById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}education/${id}`;
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

    getEducations = (params) => {

        const url = `${CONST.URI_ATTENDANCE}education?size=10&page=${params.page}&keyword=${params.keyword}`;
        console.log(url)
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

    //Status PPH
    getStatusPph = (params) => {
        const url = `${CONST.URI_ATTENDANCE}status-pph/?size=10&page=${params.page}`;

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

    getStatusPphById = (id) => {
        const url = `${CONST.URI_ATTENDANCE}status-pph/${id}`;

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

    createStatusPph = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}status-pph`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    editStatusPph = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}status-pph`;

        return axios.put(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    deleteStatusPph = (id) => {
        const url = `${CONST.URI_ATTENDANCE}status-pph/${id}`;

        return axios.delete(url, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    getBPJSTKs = (params) => {

        let url = `${CONST.URI_ATTENDANCE}bpjs-tk?size=${params.size}&page=${params.page}`;

        if (params.keyword) {
            url = `${CONST.URI_ATTENDANCE}bpjs-tk?size=${params.size}&page=${params.page}&keyword=${params.keyword}`;
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

    getBPJSTKById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}bpjs-tk/${id}`;
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

    createBPJSTK = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}bpjs-tk`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    deleteBPJSTK = (id) => {
        const url = `${CONST.URI_ATTENDANCE}bpjs-tk/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    editBPJSTK = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}bpjs-tk/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    uploadBPJSTK = (file) => {
        var data = new FormData();
        data.append('file', file);

        const url = `${CONST.URI_ATTENDANCE}bpjs-tk/upload`;
        const headers = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 }
        return axios.post(url, data, { headers: headers })
            .then(data => {
                return data;
            }).catch(err => {
                throw err;
            });
    }

    getCompetencies = (params) => {

        let url = `${CONST.URI_ATTENDANCE}competencies?size=${params.size}&page=${params.page}`;

        if (params.keyword) {
            url = `${CONST.URI_ATTENDANCE}competencies?size=${params.size}&page=${params.page}&keyword=${params.keyword}`;
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

    getCompetenciesById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}competencies/${id}`;
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

    createCompetencies = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}competencies`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    deleteCompetencies = (id) => {
        const url = `${CONST.URI_ATTENDANCE}competencies/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    editCompetencies = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}competencies/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    uploadCompetencies = (file) => {
        var data = new FormData();
        data.append('file', file);

        const url = `${CONST.URI_ATTENDANCE}competencies/upload`;
        const headers = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 }
        return axios.post(url, data, { headers: headers })
            .then(data => {
                return data;
            }).catch(err => {
                throw err;
            });
    }

    getRankings = (params) => {

        let url = `${CONST.URI_ATTENDANCE}ranking?size=${params.size}&page=${params.page}`;

        if (params.keyword) {
            url = `${CONST.URI_ATTENDANCE}ranking?size=${params.size}&page=${params.page}&keyword=${params.keyword}`;
        }
        return axios.get(url, { headers: HEADERS })
            .then(result => {
                console.log("result ranking", result)
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

    getRankingItems = (params) => {

        let url = `${CONST.URI_ATTENDANCE}ranking/ranking-items`;
        let query = '';

        if (params.period) {
            if (query === '') {
                query = `period=${params.period}`
            } else {
                query = `${query}&period=${params.period}`
            }
        }

        if (params.unitId) {
            if (query === '') {
                query = `unitId=${params.unitId}`
            } else {
                query = `${query}&unitId=${params.unitId}`
            }
        }

        if (params.employmentClass) {
            if (query === '') {
                query = `employmentClass=${params.employmentClass}`
            } else {
                query = `${query}&employmentClass=${params.employmentClass}`
            }
        }

        if (query !== '') {
            url = `${url}?${query}`
        }

        return axios.get(url, { headers: HEADERS })
            .then(result => {
                var rankingItems = result.data.Data.map((datum) => {
                    datum.value = datum.Id;
                    datum.label = datum.RankingName;
                    return datum;
                });
                return rankingItems;
            })
            .catch((err) => {
                swal({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Data tidak ditemukan!'
                });
            });
    }

    getStandardCompetencies = (params) => {

        let url = `${CONST.URI_ATTENDANCE}standard-competencies?size=${params.size}&page=${params.page}`;

        if (params.keyword) {
            url = `${CONST.URI_ATTENDANCE}standard-competencies?size=${params.size}&page=${params.page}&keyword=${params.keyword}`;
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

    getStandardCompetenciesById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}standard-competencies/${id}`;
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

    getRankingById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}ranking/${id}`;
        return axios.get(url, { headers: HEADERS })
            .then((result) => {
                console.log("result", result)
                return result.data;
            })
            .catch((err) => {
                // console.log(err.response.data.error);
                const error = err.response.data.error

                throw error;
            });
    }

    createRanking = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}ranking`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    createStandardCompetencies = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}standard-competencies`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    deleteStandardCompetencies = (id) => {
        const url = `${CONST.URI_ATTENDANCE}standard-competencies/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    deleteRanking = (id) => {
        const url = `${CONST.URI_ATTENDANCE}ranking/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    editRanking = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}ranking/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    editStandardCompetencies = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}standard-competencies/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    uploadStandardCompetencies = (file) => {
        var data = new FormData();
        data.append('file', file);

        const url = `${CONST.URI_ATTENDANCE}standard-competencies/upload`;
        const headers = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 }
        return axios.post(url, data, { headers: headers })
            .then(data => {
                return data;
            }).catch(err => {
                throw err;
            });
    }

    getStandardPayRises = (params) => {

        let url = `${CONST.URI_ATTENDANCE}standard-pay-rises?size=${params.size}&page=${params.page}`;

        if (params.keyword) {
            url = `${CONST.URI_ATTENDANCE}standard-pay-rises?size=${params.size}&page=${params.page}&keyword=${params.keyword}`;
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

    getStandardPayRisesById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}standard-pay-rises/${id}`;
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

    createStandardPayRises = (payload) => {
        const url = `${CONST.URI_ATTENDANCE}standard-pay-rises`;

        return axios.post(url, payload, { headers: HEADERS })
            .then(data => {

                return data;
            })
            .catch((err) => {
                throw err;
            });
    }

    deleteStandardPayRises = (id) => {
        const url = `${CONST.URI_ATTENDANCE}standard-pay-rises/${id}`;
        return axios.delete(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error
                throw error;
            });
    }

    editStandardPayRises = (id, payload) => {
        const url = `${CONST.URI_ATTENDANCE}standard-pay-rises/${id}`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    getShiftSchedules = (page, size = 10, keyword) => {
        let url = `${CONST.URI_ATTENDANCE}schedules/shift-schedules?page=${page}&size=${size}`;

        if (keyword) {
            url = `${CONST.URI_ATTENDANCE}schedules/shift-schedules?keyword=${keyword}&page=${page}&size=${size}`;
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

    updateShiftSchedules = payload => {
        let url = `${CONST.URI_ATTENDANCE}schedules/update-shift-schedule`;
        return axios.put(url, payload, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                // const error = err.response.data.error
                throw err;
            });
    }

    createShiftSchedules = payload => {
        let url = `${CONST.URI_ATTENDANCE}schedules/create-shift-schedule`;
        return axios.post(url, payload, { headers: HEADERS })
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
