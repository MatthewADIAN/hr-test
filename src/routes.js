import React from 'react';

const Breadcrumbs = React.lazy(() => import('./views/Base/Breadcrumbs'));
const Cards = React.lazy(() => import('./views/Base/Cards'));
const Carousels = React.lazy(() => import('./views/Base/Carousels'));
const Collapses = React.lazy(() => import('./views/Base/Collapses'));
const Dropdowns = React.lazy(() => import('./views/Base/Dropdowns'));
const Forms = React.lazy(() => import('./views/Base/Forms'));
const Jumbotrons = React.lazy(() => import('./views/Base/Jumbotrons'));
const ListGroups = React.lazy(() => import('./views/Base/ListGroups'));
const Navbars = React.lazy(() => import('./views/Base/Navbars'));
const Navs = React.lazy(() => import('./views/Base/Navs'));
const Paginations = React.lazy(() => import('./views/Base/Paginations'));
const Popovers = React.lazy(() => import('./views/Base/Popovers'));
const ProgressBar = React.lazy(() => import('./views/Base/ProgressBar'));
const Switches = React.lazy(() => import('./views/Base/Switches'));
const Tables = React.lazy(() => import('./views/Base/Tables'));
const Tabs = React.lazy(() => import('./views/Base/Tabs'));
const Tooltips = React.lazy(() => import('./views/Base/Tooltips'));
const BrandButtons = React.lazy(() => import('./views/Buttons/BrandButtons'));
const ButtonDropdowns = React.lazy(() => import('./views/Buttons/ButtonDropdowns'));
const ButtonGroups = React.lazy(() => import('./views/Buttons/ButtonGroups'));
const Buttons = React.lazy(() => import('./views/Buttons/Buttons'));
const Charts = React.lazy(() => import('./views/Charts'));
//const Dashboard = React.lazy(() => import('./views/Dashboard'));
const CoreUIIcons = React.lazy(() => import('./views/Icons/CoreUIIcons'));
const Flags = React.lazy(() => import('./views/Icons/Flags'));
const FontAwesome = React.lazy(() => import('./views/Icons/FontAwesome'));
const SimpleLineIcons = React.lazy(() => import('./views/Icons/SimpleLineIcons'));
const Alerts = React.lazy(() => import('./views/Notifications/Alerts'));
const Badges = React.lazy(() => import('./views/Notifications/Badges'));
const Modals = React.lazy(() => import('./views/Notifications/Modals'));
const Colors = React.lazy(() => import('./views/Theme/Colors'));
const Typography = React.lazy(() => import('./views/Theme/Typography'));
const Widgets = React.lazy(() => import('./views/Widgets/Widgets'));
const Users = React.lazy(() => import('./views/Users/Users'));
const User = React.lazy(() => import('./views/Users/User'));
const listUser = React.lazy(() => import('./views/Pages/Account/ListAccount'));

//Attandance
const ExitPermit = React.lazy(() => import('./views/Attendance/ExitPermit'));
const EditAllAttendanceReport = React.lazy(() => import('./views/Attendance/EditAllAttendanceReport'));
const InputManyExitPermit = React.lazy(() => import('./views/Attendance/InputManyExitPermit'))
const InputManyLeave = React.lazy(() => import('./views/Attendance/Leave/MultipleInputLeave'))
const Leave = React.lazy(() => import('./views/Attendance/Leave'));
const Overtime = React.lazy(() => import('./views/Attendance/Overtime'));
const ReportLeave = React.lazy(() => import('./views/Attendance/ReportLeave'));
const ReportOvertime = React.lazy(() => import('./views/Attendance/ReportOvertime'));
const ReportNotAttend = React.lazy(() => import('./views/Attendance/ReportNotAttend'));
const AttendanceManual = React.lazy(() => import('./views/Attendance/AttendanceManual'));

//Approval
const RequestLeave = React.lazy(() => import('./views/Approval/RequestLeave'));

//Employee
const EmployeeTraining = React.lazy(() => import('./views/Employee/EmployeeTraining'));
const EmployeeAccessRight = React.lazy(() => import('./views/Employee/EmployeeAccessRight'));
const ReportStandardCompetency = React.lazy(() => import('./views/Employee/ReportStandardCompetency'));

//Master
const BPJSKetenagakerjaan = React.lazy(() => import('./views/Master/BPJSKetenagakerjaan'))
const Competency = React.lazy(() => import('./views/Master/Competency'));
const Group = React.lazy(() => import('./views/Master/Group'));
const Education = React.lazy(() => import('./views/Master/Education'));
const HolidayNation = React.lazy(() => import('./views/Master/HolidayNation'));
const Location = React.lazy(() => import('./views/Master/Location'));
const LeaveType = React.lazy(() => import('./views/Master/LeaveType'));
const Ranking = React.lazy(() => import('./views/Master/Ranking'));
const StandardCompetency = React.lazy(() => import('./views/Master/StandardCompetency'));
const StandardPayRise = React.lazy(() => import('./views/Master/StandardPayRise'));
const StatusPph = React.lazy(() => import('./views/Master/StatusPph'));
const Section = React.lazy(() => import('./views/Master/Section'));
const Unit = React.lazy(() => import('./views/Master/Unit'));
const BreakTime = React.lazy(() => import('./views/Master/BreakTime'));
const Position = React.lazy(() => import('./views/Master/Position'));
const EmployeeClass = React.lazy(() => import('./views/Master/EmployeeClass'));

//Payroll
const Bonus = React.lazy(() => import('./views/Payroll/Bonus'));
const CreditUnionCut = React.lazy(() => import('./views/Payroll/CreditUnionCut'));
const Donation = React.lazy(() => import('./views/Payroll/Donation'));
const DriverAllowance = React.lazy(() => import('./views/Payroll/DriverAllowance'));
const DailyPayEmployee = React.lazy(() => import('./views/Payroll/DailyPayEmployee'));
const PayRise = React.lazy(() => import('./views/Payroll/PayRise'));
const PayrollCorrection = React.lazy(() => import('./views/Payroll/PayrollCorrection'));
const Thr = React.lazy(() => import('./views/Payroll/Thr'));
const TransferSalary = React.lazy(() => import('./views/Payroll/TransferSalary'));

//RequestLeave
const InputRequestLeave = React.lazy(() => import('./views/RequestLeave/InputRequestLeave'));

//Wfh
const WfhRecap = React.lazy(() => import('./views/Wfh/WfhRecap'));

//Suggestion Box
const SuggestionBoxRecap = React.lazy(() => import('./views/SuggestionBox/SuggestionBoxRecap'));
const SuggestionBoxRecapCompanySuggestion = React.lazy(() => import('./views/SuggestionBox/SuggestionBoxRecapCompanySuggestion'));

//Announcement
const Announcement = React.lazy(() => import('./views/Announcement/Announcement'));

//Pages
const AddAccount = React.lazy(() => import('./views/Pages/Account/AddAccount'));
const Employee = React.lazy(() => import('./views/Pages/Employee/List'));
const JadwalKaryawan = React.lazy(() => import('./views/Pages/Absensi/JadwalKaryawan/Tables'));
const ListAllAbsen = React.lazy(() => import('./views/Pages/Absensi/ListAllAbsensi/Tables'));
const ListWorkFromHome = React.lazy(() => import('./views/Pages/Absensi/WorkFromHome/Tables'));
const ListWorkAtClient = React.lazy(() => import('./views/Pages/Absensi/WorkAtClient/Tables'));
const ListAccount = React.lazy(() => import('./views/Pages/Account/Tables'));
const ListSick = React.lazy(() => import('./views/Pages/Absensi/Sick/Tables'));
const ListRole = React.lazy(() => import('./views/Pages/Role/Tables'));
const ListBelomAbsen = React.lazy(() => import('./views/Pages/Absensi/BelomAbsen/Tables'));
const ListAtOffice = React.lazy(() => import('./views/Pages/Absensi/AtOffice/Tables'));
const ListApproval = React.lazy(() => import('./views/Pages/Absensi/Approval/Tables'));
const ListDivision = React.lazy(() => import('./views/Pages/Division/Tables'));
const ListJobtitle = React.lazy(() => import('./views/Pages/Jobtitle/Tables'))
const SetSchedule = React.lazy(() => import('./views/Pages/Absensi/SetSchedule/List'));
const TestLur = React.lazy(() => import('./views/Pages/Test/index'));



// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/absensi/workatclient', name: 'Edit Account Page', component: ListWorkAtClient, role: ['Personalia Pusat'] },
  { path: '/absensi/workfromhome', name: 'Edit Account Page', component: ListWorkFromHome, role: ['Personalia Pusat'] },
  { path: '/absensi/testlur', name: 'Test Page', component: TestLur, role: ['Personalia Pusat'] },
  { path: '/absensi/sick', name: 'Edit Account Page', component: ListSick, role: ['Personalia Pusat'] },
  { path: '/absensi/belumabsen', name: 'Edit Account Page', component: ListBelomAbsen, role: ['Personalia Pusat'] },
  { path: '/absensi/atoffice', name: 'Edit Account Page', component: ListAtOffice, role: ['Personalia Pusat'] },
  { path: '/absensi/approval', name: 'Edit Account Page', component: ListApproval, role: ['Personalia Pusat'] },

  { path: '/attendance', exact: true, name: 'Kehadiran', role: ['Personalia Pusat', 'Personalia Bagian'] },
  { path: '/attendance/attendance-report', name: 'Laporan Kehadiran', component: ListAllAbsen, role: ['Personalia Pusat', 'Personalia Bagian','Upah'] },
  { path: '/attendance/attendance-manual', name: 'Absensi Manual', component: AttendanceManual, role: ['Personalia Pusat', 'Personalia Bagian'] },
  { path: '/attendance/overtime', name: 'Lembur Karyawan', component: Overtime, role: ['Personalia Pusat', 'Personalia Bagian'] },
  { path: '/attendance/exit-permit', name: 'Ijin Karyawan', component: ExitPermit, role: ['Personalia Pusat', 'Personalia Bagian'] },
  { path: '/attendance/many-exitpermit', name: 'Input Banyak Ijin', component: InputManyExitPermit, role: ['Personalia Pusat', 'Personalia Bagian'] },
  { path: '/attendance/leave', name: 'Cuti Karyawan', component: Leave, role: ['Personalia Pusat', 'Personalia Bagian'] },
  { path: '/attendance/multiple-input-leave', name: 'Input Banyak Cuti', component: InputManyLeave, role: ['Personalia Pusat', 'Personalia Bagian'] },
  { path: '/attendance/report-leave', name: 'Laporan Cuti', component: ReportLeave, role: ['Personalia Pusat', 'Upah', 'Personalia Bagian'] },
  { path: '/attendance/report-not-attend', name: 'Rekap Karyawan Tidak Absen', component: ReportNotAttend, role: ['Personalia Pusat', 'Personalia Bagian','Upah'] },
  { path: '/attendance/attendance-report-edit-all', name: 'Laporan Kehadiran / Edit All', component: EditAllAttendanceReport, role: ['Personalia Pusat', 'Personalia Bagian'] },
  { path: '/attendance/report-overtime', name: 'Laporan Lembur Karyawan', component: ReportOvertime, role: ['Personalia Pusat', 'Upah', 'Personalia Bagian'] },

  { path: '/approval/request-leave', name: 'Approval Request Cuti', component: RequestLeave, role: ['Pimpinan'] },

  { path: '/schedule', exact: true, name: 'Jadwal', role: ['Personalia Pusat', 'Personalia Bagian'] },
  { path: '/schedule/employee-schedules', name: 'Jadwal Karyawan', component: JadwalKaryawan, role: ['Personalia Pusat', 'Personalia Bagian','Upah'] },
  { path: '/schedule/set-schedules', name: 'Atur Jadwal Karyawan', component: SetSchedule, role: ['Personalia Pusat','Personalia Bagian','Upah'] },

  { path: '/employee', exact: true, name: 'Karyawan', component: Employee, role: ['Personalia Pusat','Personalia Bagian'] },
  { path: '/employee/training', name: 'Training', component: EmployeeTraining, role: ['Personalia Pusat', 'Personalia Bagian'] },
  { path: '/employee/report-standard-competency', name: 'Report Standard Competency', component: ReportStandardCompetency, role: ['Personalia Pusat', 'Personalia Bagian'] },
  { path: '/employee/access-rights', name: 'Hak Akses', component: EmployeeAccessRight, role: ['Personalia Pusat','HRD'] },

  { path: '/master', exact: true, name: 'Master', role: ['Personalia Pusat','HRD'] },
  { path: '/master/unit', name: 'Unit', component: Unit, role: ['Personalia Pusat','HRD'] },
  { path: '/master/section', name: 'Seksi', component: Section, role: ['Personalia Pusat','HRD'] },
  { path: '/master/group', name: 'Grup', component: Group, role: ['Personalia Pusat','HRD'] },
  { path: '/master/location', name: 'Lokasi', component: Location, role: ['Personalia Pusat','HRD'] },
  { path: '/master/bpjs-tk', name: 'BPJS Ketenagakerjaan', component: BPJSKetenagakerjaan, role: ['Personalia Pusat','HRD'] },
  { path: '/master/competencies', name: 'Pelatihan', component: Competency, role: ['Personalia Pusat','HRD'] },
  { path: '/master/standard-competencies', name: 'Standar Kompetensi', component: StandardCompetency, role: ['Personalia Pusat','HRD'] },
  { path: '/master/education', name: 'Pendidikan', component: Education, role: ['Personalia Pusat','HRD'] },
  { path: '/master/leave-type', name: 'Jenis Cuti', component: LeaveType, role: ['Personalia Pusat','HRD'] },
  { path: '/master/holiday-nation', name: 'Master Libur Resmi', component: HolidayNation, role: ['Personalia Pusat','HRD'] },
  { path: '/master/break-time', name: 'Master Jadwal', component: BreakTime, role: ['Personalia Pusat','HRD', 'Personalia Bagian'] },
  { path: '/master/position', name: 'Master Jabatan', component: Position, role: ['Personalia Pusat','HRD', 'Personalia Bagian'] },
  { path: '/master/employee-class', name: 'Master Golongan', component: EmployeeClass, role: ['Personalia Pusat', 'HRD', 'Personalia Bagian'] },

  { path: '/master/ranking', name: "Ranking", component: Ranking, role: ['Personalia Pusat','HRD'] },
  { path: '/master/standard-pay-rises', name: "Standar Kenaikan Gaji", component: StandardPayRise, role: ['Personalia Pusat','HRD'] },
  { path: '/division/listdivision', name: "List Division Page", component: ListDivision, role: ['Personalia Pusat'] },
  { path: '/jobtitle/listjobtitle', name: "List Division Page", component: ListJobtitle, role: ['Personalia Pusat'] },
  { path: '/role/listrole', name: "List Division Page", component: ListRole, role: ['Personalia Pusat'] },

  { path: '/payroll/driver-allowance', name: "Uang Tugas Supir", component: DriverAllowance, role: ['Personalia Pusat','Upah'] },
  { path: '/payroll/credit-union-cut', name: "Potongan Koperasi", component: CreditUnionCut, role: ['Personalia Pusat','Upah'] },
  { path: '/payroll/daily-pay-employee', name: "Rekap Upah Karyawan Harian", component: DailyPayEmployee, role: ['Personalia Pusat','Upah'] },
  { path: '/payroll/payroll-correction', name: "Koreksi Upah", component: PayrollCorrection, role: ['Personalia Pusat','Upah'] },
  { path: '/payroll/status-pph', name: "Status PPH", component: StatusPph, role: ['Personalia Pusat','Upah'] },
  { path: '/payroll/donation', name: "Sumbangan", component: Donation, role: ['Personalia Pusat','Upah'] },
  { path: '/payroll/pay-rises', name: "Kenaikan Gaji", component: PayRise, role: ['Personalia Pusat','Upah'] },
  { path: '/payroll/thr', name: "THR", component: Thr, role: ['Personalia Pusat','Upah'] },
  { path: '/payroll/transfer-salary', name: "Transfer Upah", component: TransferSalary, role: ['Personalia Pusat','Upah'] },
  { path: '/payroll/bonus', name: "Bonus Karyawan", component: Bonus, role: ['Personalia Pusat','Upah'] },

  { path: '/request-leave',exact: true, name: 'Request Cuti', role: ['Personalia Pusat','Personalia Bagian'] },
  { path: '/request-leave/input-request-leave', name: 'Input Request Cuti', component: InputRequestLeave, role: ['Personalia Pusat','Personalia Bagian','Pimpinan','User Biasa'] },

  { path: '/wfh',exact: true, name: 'WFH', role: ['Personalia Pusat','Personalia Bagian'] },
  { path: '/wfh/wfh-recap', name: 'Rekap WFH', component: WfhRecap, role: ['Personalia Pusat','Personalia Bagian'] },

  { path: '/announcement',exact: true, name: 'Pengumuman', role: ['Personalia Pusat'] },
  { path: '/announcement/announcement', name: 'Input Pengumuman', component: Announcement, role: ['Personalia Pusat'] },

  { path: '/suggestionbox', exact: true, name: 'Kotak Saran', role: ['Personalia Pusat','Personalia Bagian'] },
  { path: '/suggestionbox/suggestion-box-recap', name: 'Rekap Kotak Saran', component: SuggestionBoxRecap, role: ['Personalia Pusat','Personalia Bagian'] },
  { path: '/suggestionbox/suggestion-box-recap-company-suggestion', name: 'Rekap Kotak Saran', component: SuggestionBoxRecapCompanySuggestion, role: ['Personalia Pusat','Personalia Bagian'] },

  // { path: '/account/lis', name: 'Home',  component : listUser},
  // { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/theme', exact: true, name: 'Theme', component: Colors },
  { path: '/theme/colors', name: 'Colors', component: Colors },
  { path: '/theme/typography', name: 'Typography', component: Typography },
  { path: '/base', exact: true, name: 'Base', component: Cards },
  { path: '/base/cards', name: 'Cards', component: Cards },
  { path: '/base/forms', name: 'Forms', component: Forms },
  { path: '/base/switches', name: 'Switches', component: Switches },
  { path: '/base/tables', name: 'Tables', component: Tables },
  { path: '/base/tabs', name: 'Tabs', component: Tabs },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', component: Breadcrumbs },
  { path: '/base/carousels', name: 'Carousel', component: Carousels },
  { path: '/base/collapses', name: 'Collapse', component: Collapses },
  { path: '/base/dropdowns', name: 'Dropdowns', component: Dropdowns },
  { path: '/base/jumbotrons', name: 'Jumbotrons', component: Jumbotrons },
  { path: '/base/list-groups', name: 'List Groups', component: ListGroups },
  { path: '/base/navbars', name: 'Navbars', component: Navbars },
  { path: '/base/navs', name: 'Navs', component: Navs },
  { path: '/base/paginations', name: 'Paginations', component: Paginations },
  { path: '/base/popovers', name: 'Popovers', component: Popovers },
  { path: '/base/progress-bar', name: 'Progress Bar', component: ProgressBar },
  { path: '/base/tooltips', name: 'Tooltips', component: Tooltips },
  { path: '/buttons', exact: true, name: 'Buttons', component: Buttons },
  { path: '/buttons/buttons', name: 'Buttons', component: Buttons },
  { path: '/buttons/button-dropdowns', name: 'Button Dropdowns', component: ButtonDropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', component: ButtonGroups },
  { path: '/buttons/brand-buttons', name: 'Brand Buttons', component: BrandButtons },
  { path: '/icons', exact: true, name: 'Icons', component: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', component: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', component: Flags },
  { path: '/icons/font-awesome', name: 'Font Awesome', component: FontAwesome },
  { path: '/icons/simple-line-icons', name: 'Simple Line Icons', component: SimpleLineIcons },
  { path: '/notifications', exact: true, name: 'Notifications', component: Alerts },
  { path: '/notifications/alerts', name: 'Alerts', component: Alerts },
  { path: '/notifications/badges', name: 'Badges', component: Badges },
  { path: '/notifications/modals', name: 'Modals', component: Modals },
  { path: '/widgets', name: 'Widgets', component: Widgets },
  { path: '/charts', name: 'Charts', component: Charts },
  { path: '/users', exact: true, name: 'Users', component: Users },
  { path: '/users/:id', exact: true, name: 'User Details', component: User },
];

export default routes;
