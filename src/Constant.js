//export const URI_ATTENDANCE = "http://localhost:52062/v1/";
// export const URI_ATTENDANCE = "https://danliris-hr-portal-attendance-service-dev-jkt.azurewebsites.net/v1/";
export const URI_ATTENDANCE = "https://danliris-hr-portal-attendance-service-dev.azurewebsites.net/v1/";
// export const NEW_URI_ATTENDANCE = "https://danliris-hr-portal-attendance-service-dev.azurewebsites.net/v1/";

export const GET_ATTENDANCE_REPORT = "attendances/report"
export const SET_SCHEDULE = "schedules";
export const SET_SCHEDULE_PERIODE_SPLIT = "schedules/periode-split";
export const GET_SCHEDULE = "schedules/employee-schedule-info";
export const GET_SCHEDULE_COMPRESS_PERIODE = "schedules/employee-schedule-info-periode";

export const GET_EMPLOYEES = "schedules/employee-by-filter"
export const GET_SCHEDULE_BY_MONTHYEAR = "schedules/by-month-year"
export const GET_UNITS = "units"
export const GET_SECTIONS = "sections"
export const GET_GROUPS = "groups"

export const urlAbsen = "https://danliris-hr-portal-attendance-service-dev.azurewebsites.net/v1/Absensis";

export const urlBlob = "https://eworkmoonlay-absen-dev.azurewebsites.net/api/BlobStorage/InsertFile";

export const urlUser = "https://danliris-hr-portal-auth-service-dev.azurewebsites.net/v1/accounts";

// export const urlLogin = 'https://danliris-hr-portal-auth-service-dev-jkt.azurewebsites.net/v1/authenticate';
 export const urlLogin = 'https://danliris-hr-portal-auth-service-dev.azurewebsites.net/v1/authenticate';

export const urlRole = 'https://danliris-hr-portal-auth-service-dev.azurewebsites.net/roles';

// export const urlMe = 'https://danliris-hr-portal-auth-service-dev-jkt.azurewebsites.net/v1/me'
 export const urlMe = 'https://danliris-hr-portal-auth-service-dev.azurewebsites.net/v1/me'

export const urlDivision = 'https://eworkmoonlay-core-dev.azurewebsites.net/v1/divisions'
export const urlJobtitle = 'https://eworkmoonlay-core-dev.azurewebsites.net/v1/job-titles';

export const urlFaceId = 'https://jquw0rn71i.execute-api.ap-southeast-1.amazonaws.com/qa/face';

export const appovedList = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Declined', label: 'Declined' },
];

export const stateList = [
  { value: 'Work at Office', label: 'At Office' },
  { value: 'Work from home', label: 'Work from home' },
  { value: 'Sick Leave', label: 'Sick' },
  { value: 'Work at client', label: 'Work At Client' }
];

export const stateHeadDivision = [
  { value: 'A', label: 'AAAAAA' },
  { value: 'B', label: 'BBBBBB' },
  { value: 'C', label: 'CCCCCCC' },
  { value: 'D', label: 'DDDDDD' }
];

export const divisionList = [
  { value: 'A', label: 'AAAAAA' },
  { value: 'B', label: 'BBBBBB' },
  { value: 'C', label: 'CCCCCCC' },
  { value: 'D', label: 'DDDDDD' }
];


export const jobtitleList = [
  { value: 'E', label: 'EEEEE' },
  { value: 'F', label: 'FDDDD' },
  { value: 'G', label: 'GFFFFF' },
  { value: 'H', label: 'HGGGG' }
];

export const permisionRoleIdList = [
  { value: '1', label: 'Can Appove' },
  { value: '2', label: 'Cannot Approve' }
];


export const HR_CODE = [
  "6251",
  "6252",
  "6254",
  "2021",
  "9999"
];

export const OFFSET = 7;
export const DATETIMEOFFSETMINVALUE = '0001-01-01T00:00:00Z';

export const urlAccessUnit = `${URI_ATTENDANCE}employees/access-rights/access-unit/{employeeIdentity}`

export const URI_AUTH = URI_ATTENDANCE.includes('dev-jkt') ? "https://danliris-hr-portal-auth-service-dev-jkt.azurewebsites.net/v1/"
:
"https://danliris-hr-portal-auth-service-dev.azurewebsites.net/v1/";
