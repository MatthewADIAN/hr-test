import axios from 'axios';
import swal from 'sweetalert';
import * as CONST from './../../Constant';

const moment = require('moment');
const HEADERS = { 'Content-Type': 'application/json', accept: 'application/json', Authorization: `Bearer ` + localStorage.getItem('token'), 'x-timezone-offset': moment().utcOffset() / 60 };

class Service {

    //Announcement API
    createAnnouncement =  (payload, file, pdfFile) => {
        try {
            if (file?.size > 0) {
                
                var data = new FormData();
                    data.append('formFile', file);
                    let url = `${CONST.URI_ATTENDANCE}announcement/upload-announcement-image`;
                    return axios.post(url, data, { headers: HEADERS }).then((result) => {
                        return result.data;
                    }).then((result)=>{

                        let url = `${CONST.URI_ATTENDANCE}announcement`;
                        payload.AnnouncementImageUri = result.imageUri
                       return axios.post(url,payload, { headers: HEADERS }).then((result) => {

                            return result.data;
                        }).catch((err)=>{
                            const error = err.response.data.error
                            throw error
                        })
                    }).catch((err) => {
                        const error = err.response.data.error
                        throw error
                    })

            } else {
                let url = `${CONST.URI_ATTENDANCE}announcement`;
                return axios.post(url,payload, { headers: HEADERS }).then((result) => {
                    return result.data;
                }).catch((err)=>{
                    const error = err.response.data.error
                    throw error
                })
            }
        } catch (error) {
            throw error
        }

    }

    uploadAttachment =  (payload, file) => {
        var data = new FormData();
        data.append('formFile', file);

        let url = `${CONST.URI_ATTENDANCE}announcement/upload-attachment-pdf`;
        return axios.post(url, data, { headers: HEADERS }).then((result) => {
            return result.data;
        }).then((result)=>{
            console.log("result.AnnouncementPdfUri update uploadAttachment ",result.AnnouncementPdfUri)
            console.log("payload uploadAttachment ",payload)
            console.log("result ",result)
            
            let url= `${CONST.URI_ATTENDANCE}announcement/${payload.Id}`;
            payload.AnnouncementPdfUri  = result.pdfUri 
           return axios.put(url,payload, { headers: HEADERS }).then((result) => {
                return result.data;
            }).catch((err)=>{
                const error = err.response.data.error
                throw error
            })
        }).catch((err) => {
            const error = err.response.data.error
            throw error
        })
    }

    updateAnnouncement =  (id, payload, file) => {
        try {
            if (file?.size > 0) {
                
                var data = new FormData();
                    data.append('formFile', file);

                    let url = `${CONST.URI_ATTENDANCE}announcement/upload-announcement-image`;
                    return axios.post(url, data, { headers: HEADERS }).then((result) => {
                        return result.data;
                    }).then((result)=>{
                        console.log("payload update",payload)
                        
                        let url= `${CONST.URI_ATTENDANCE}announcement/${id}`;
                        payload.AnnouncementImageUri = result.imageUri
                       return axios.put(url,payload, { headers: HEADERS }).then((result) => {
                            return result.data;
                        }).catch((err)=>{
                            const error = err.response.data.error
                            throw error
                        })
                    }).catch((err) => {
                        const error = err.response.data.error
                        throw error
                    })

               
            } else {
                
                let url = `${CONST.URI_ATTENDANCE}announcement/${id}`;
                return axios.put(url,payload, { headers: HEADERS }).then((result) => {
                    return result.data;
                }).catch((err)=>{
                    const error = err.response.data.error
                    throw error
                })
            }
        } catch (error) {
            throw error
        }

    }

    

    editAnnoucement = (id, payload) => {
        let url = `${CONST.URI_ATTENDANCE}announcement/${id}`;
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

    

    getAnnouncement = (params) => {
       console.log('params.startDate', params.startDate, params.endDate);
        let keyword = params.employeeId;
        let startDate = params.startDate && params.startDate != "Invalid date" ? moment(params.startDate).format("YYYY-MM-DD") : null;
        let endDate = params.endDate && params.endDate != "Invalid date" ? moment(params.endDate).format("YYYY-MM-DD") : null;

        let page = params.page || 1;
        let size = params.size || 10;
        let url = `${CONST.URI_ATTENDANCE}announcement/index?startDate=${startDate}&endDate=${endDate}&keyword=${keyword}&page=${page}&size=${size}`;

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

    getAnnouncementById = (id) => {
        let url = `${CONST.URI_ATTENDANCE}announcement/${id}`;
        return axios.get(url, { headers: HEADERS })
            .then((result) => {
                return result.data;
            })
            .catch((err) => {
                const error = err.response.data.error

                throw error;
            });
    }

    deleteAnnouncement = (id) => {
        let url = `${CONST.URI_ATTENDANCE}announcement/${id}`;
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

   
}

export default Service;
