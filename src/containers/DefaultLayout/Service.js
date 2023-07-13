import axios from "axios";
import swal from "sweetalert";
import * as CONST from "./../../Constant";

const moment = require("moment");
const HEADERS = {
  "Content-Type": "application/json",
  accept: "application/json",
  Authorization: `Bearer ` + localStorage.getItem("token"),
  "x-timezone-offset": moment().utcOffset() / 60,
};

class Service {
  getNotif = (id) => {
    let url = `${CONST.URI_ATTENDANCE}request-leave/notif?id=${id}`;
    return axios
      .get(url, { headers: HEADERS })
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        const error = err.response?.data.error;

        throw error;
      });
  };

  getNotifDataRevision = () => {
    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let url = `${CONST.URI_ATTENDANCE}suggestionbox/notif-data-revision?adminEmployeeId=${adminEmployeeId}`;
    return axios
      .get(url, { headers: HEADERS })
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        const error = err.response?.data.error;

        throw error;
      });
  };

  getNotifSuggestionForCompany = (id) => {
    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let url = `${CONST.URI_ATTENDANCE}suggestionbox/notif-suggestion-for-company?adminEmployeeId=${adminEmployeeId}`;
    return axios
      .get(url, { headers: HEADERS })
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        const error = err.response?.data.error;

        throw error;
      });
  };

  updateStatus = (type) => {
    let adminEmployeeId = Number(localStorage.getItem("employeeId"));
    let url = `${CONST.URI_ATTENDANCE}suggestionbox/update-status/${type}?adminEmployeeId=${adminEmployeeId}`;
    return axios
      .put(url, {}, { headers: HEADERS })
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        const error = err.response?.data.error;

        throw error;
      });
  };
}

export default Service;
