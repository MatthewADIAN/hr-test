import axios from "axios";
import swal from "sweetalert";
import * as CONST from "./../../../Constant";

const moment = require("moment");
const HEADERS = {
  "Content-Type": "application/json",
  accept: "application/json",
  Authorization: `Bearer ` + localStorage.getItem("token"),
  "x-timezone-offset": moment().utcOffset() / 60,
};

class Service {
  getPdfEmployeeRecap = (params) => {
    const url = `${CONST.URI_ATTENDANCE}employees/reports/download-pdf-employee-recap?UnitId=${params.unitId}&SectionId=${params.sectionId}&GroupId=${params.groupId}&EmploymentClass=${params.employmentClass}&adminEmployeeId=${params.adminEmployeeId}`;

    return axios
      .get(url, { headers: HEADERS, responseType: "blob" })
      .then((result) => {
        let disposition = result.headers["content-disposition"];
        let filename = decodeURI(disposition.match(/filename="(.*)"/)[1]);
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => {
        // const error = err.response.data.error
        throw err;
      });
  };

  download = (params, page) => {
    // const url = `${CONST.URI_ATTENDANCE}employees/reports/download?employeeId=${params.employeeId}&unitId=${params.unitId}&sectionId=${params.sectionId}&groupId=${params.groupId}`;
    const url = `${CONST.URI_ATTENDANCE}employees/reports/download?EmployeeId=${params.employeeId}&UnitId=${params.unitId}&SectionId=${params.sectionId}&GroupId=${params.groupId}&EmployeeStatus=${params.employeeStatus}&RoleEmployeeId=${params.roleEmployeeId}&EmploymentClass=${params.employmentClass}&EmploymentStatus${params.employmentStatus}&WorkDays=${params.workday}&IsWorkerUnion=${params.isWorkerUnion}&adminEmployeeId=${params.adminEmployeeId}&page=${page}`;

    return axios
      .get(url, { headers: HEADERS, responseType: "blob" })
      .then((result) => {
        let filename = result.headers["content-disposition"]
          .split(";")[1]
          .replace("filename=", "")
          .replace(/"/, "")
          .replace(/"/, "");
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => {
        // const error = err.response.data.error
        throw err;
      });
  };

  updateNIK = (oldNik, newNik) => {
    const url = `${CONST.URI_AUTH}accounts/update-employeeIdentity/${oldNik}`;

    return axios
      .put(url, { EmployeeIdentity: newNik }, { headers: HEADERS })
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        const error = err.response.data.error;
        throw error;
      });
  };

  getMutationLog = (citizenshipIdentity) => {
    const url = `${CONST.URI_ATTENDANCE}employees/mutation-log?citizenshipIdentity=${citizenshipIdentity}`;

    return axios
      .get(url, { headers: HEADERS })
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        swal({
          icon: "error",
          title: "Oops...",
          text: "Data tidak ditemukan!",
        });
      });
  };
}

export default Service;
