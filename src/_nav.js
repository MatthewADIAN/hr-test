export default {
  items: [
    {
      title: true,
      name: 'Menu',
      wrapper: {
        element: '',
        attributes: {},
      },
    },
    {
      name: 'Absensi',
      icon: 'icon-star',
      children: [
        {
          name: 'Input Absensi Karyawan',
          url: '/attendance/attendance-manual',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat', 'Personalia Bagian']
        },
        {
          name: 'Laporan Absensi',
          url: '/attendance/attendance-report',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat', 'Personalia Bagian','Upah']
        },
        {
          name: 'Rekap Karyawan Tidak Absen',
          url: '/attendance/report-not-attend',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat', 'Personalia Bagian','Upah']
        },
        {
          name: 'Lembur Karyawan',
          url: '/attendance/overtime',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat', 'Personalia Bagian']
        },
        {
          name: 'Input Ijin Karyawan',
          url: '/attendance/leave',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat', 'Personalia Bagian']
        },
        // {
        //   name: 'Input Ijin Keluar',
        //   url: '/attendance/exit-permit',
        //   icon: 'icon-arrow-right',
        //   role: ['Personalia Pusat', 'Personalia Bagian']
        // }
      ]
    },
    {
      name: 'Approval',
      icon: 'icon-star',
      // badge: {
      //   variant: 'danger',
      //   text: '7',
      // },
      children: [
        {
          name: 'Approval Request Cuti',
          url: '/approval/request-leave',
          icon: 'icon-arrow-right',
          role: ['Pimpinan'],

        }

      ]
    },
    {
      name: 'Jadwal',
      url: '#',
      icon: 'icon-star',
      children: [
        {
          name: 'Jadwal Karyawan',
          url: '/schedule/employee-schedules',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat', 'Personalia Bagian','Upah']
        },
        {
          name: 'Atur Jadwal Karyawan',
          url: '/schedule/set-schedules',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Personalia Bagian','Upah']
        }
      ]
    },
    {
      name: 'Karyawan',
      url: '/employee',
      icon: 'icon-star',
      children: [{
        name: 'Daftar Karyawan',
        url: '/employee',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','Personalia Bagian']
      }, {
        name: 'Training Karyawan',
        url: '/employee/training',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat', 'Personalia Bagian']
      }, {
        name: 'Laporan Standar Kompetensi',
        url: '/employee/report-standard-competency',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat', 'Personalia Bagian']
      }, {
        name: 'Hak Akses Karyawan',
        url: '/employee/access-rights',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      }]
    },
    {
      name: 'Master',
      url: '/master',
      icon: 'icon-star',
      children: [{
        name: 'Unit',
        url: '/master/unit',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      }, {
        name: 'Seksi',
        url: '/master/section',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      }, {
        name: 'Grup',
        url: '/master/group',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      }, {
        name: 'Lokasi',
        url: '/master/location',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      }, {
        name: 'Jenis Cuti',
        url: '/master/leave-type',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      }, {
        name: 'Master Libur Resmi',
        url: '/master/holiday-nation',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      },
      {
        name: 'Master BPJS Ketenagakerjaan',
        url: '/master/bpjs-tk',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      },
      {
        name: 'Master Pelatihan',
        url: '/master/competencies',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      },
      // {
      //   name: 'Master Pendidikan',
      //   url: '/master/education',
      //   icon: 'icon-arrow-right',
      //   role: ['Personalia Pusat','HRD']
      // },
      {
        name: 'Master Standar Kompetensi',
        url: '/master/standard-competencies',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      },
      {
        name: 'Master Ranking',
        url: '/master/ranking',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      },
      {
        name: 'Master Standar Kenaikan Gaji',
        url: '/master/standard-pay-rises',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD']
      },
      {
        name: 'Master Jadwal',
        url: '/master/break-time',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat','HRD','Personalia Bagian']
      },
      {
        name: 'Master Jabatan',
        url: '/master/position',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat', 'HRD', 'Personalia Bagian']
      },
      {
        name: 'Master Golongan',
        url: '/master/employee-class',
        icon: 'icon-arrow-right',
        role: ['Personalia Pusat', 'HRD', 'Personalia Bagian']
      }
      ]
    },
    {
      name: 'Payroll',
      url: '#',
      icon: 'icon-star',
      children: [
        {
          name: 'Bonus',
          url: '/payroll/bonus',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Upah']
        },
        {
          name: 'Koreksi Upah',
          url: '/payroll/payroll-correction',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Upah']
        },
        {
          name: 'Kenaikan Gaji',
          url: '/payroll/pay-rises',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Upah']
        },
        {
          name: 'Status PPH',
          url: '/payroll/status-pph',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Upah']
        },
        {
          name: 'Uang Tugas Supir',
          url: '/payroll/driver-allowance',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Upah']
        },
        {
          name: 'Rekap Absensi/Cuti Harian',
          url: '/attendance/report-leave',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat', 'Upah', 'Personalia Bagian']
        },
        {
          name: 'Laporan Lembur Karyawan',
          url: '/attendance/report-overtime',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Upah', 'Personalia Bagian']
        },
        {
          name: 'Potongan Koperasi',
          url: '/payroll/credit-union-cut',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Upah']
        },
        {
          name: 'Rekap Upah Karyawan Harian',
          url: '/payroll/daily-pay-employee',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Upah']
        },
        {
          name: 'Sumbangan',
          url: '/payroll/donation',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Upah']
        },
        {
          name: 'THR',
          url: '/payroll/thr',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Upah']
        },
        {
          name: 'Transfer Upah',
          url: '/payroll/transfer-salary',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Upah']
        },

      ]
    },
    {
      name: 'WFH',
      url: '/wfh',
      icon: 'icon-star',
      children: [
        {
          name: 'Rekap WFH',
          url: '/wfh/wfh-recap',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Personalia Bagian']
        },
      ]
    },

    {
      name: 'Request Cuti',
      url: '/request-leave',
      icon: 'icon-star',
      children: [
        {
          name: 'Input Request Cuti',
          url: '/request-leave/input-request-leave',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Personalia Bagian','Pimpinan','User Biasa']
        },
      ]
    },
    {
      name: 'Pengumuman',
      url: '#',
      icon: 'icon-star',
      children: [
        {
          name: 'Input Pengumuman',
          url: '/announcement/announcement',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat']
        },
      ]
    },
    {
      name: 'Kotak Saran',
      url: '#',
      icon: 'icon-star',
      children: [
        {
          name: 'Rekap Kotak Saran',
          url: '/suggestionbox/suggestion-box-recap',
          icon: 'icon-arrow-right',
          role: ['Personalia Pusat','Personalia Bagian']
        },


      ]
    }
    // {
    //   name: 'Approval',
    //   url: '/absensi/approval',
    //   icon: 'icon-drop',
    // },
    // {
    //   name: 'Not Present Yet',
    //   url: '/absensi/belumabsen',
    //   icon: 'icon-bell',
    // },
    // {
    //   name: 'Charts',
    //   url: '/charts',
    //   icon: 'icon-pie-chart',
    // },
    // {
    //   name: 'Account',
    //   url: '#',
    //   icon: 'icon-star',
    //   children: [
    //     {
    //       name: 'Add Account',
    //       url: '/account/addaccount',
    //       icon: 'icon-star',
    //     },
    //     {
    //       name: 'List Account',
    //       url: '/account/listaccount',
    //       icon: 'icon-star',
    //     },
    //   ],
    // },
    // {
    //   name: 'Team',
    //   url: '#',
    //   icon: 'icon-layers',
    //   children: [
    //     {
    //       name: 'Division',
    //       url: '/division/listdivision',
    //       icon: 'icon-layers',
    //     },
    //     {
    //       name: 'Job Title',
    //       url: '/jobtitle/listjobtitle',
    //       icon: 'icon-layers',
    //     },
    //   ],
    // },
    // {
    //   name: 'Role',
    //   url: '/role/listrole',
    //   icon: 'icon-calculator',
    //   badge: {
    //     variant: 'info',
    //     text: 'NEW',
    //   },
    // },
    // {
    //   divider: true,
    // },
    // {
    //   title: true,
    //   name: 'Extras',
    // },
    // {
    //   name: 'Pages',
    //   url: '/pages',
    //   icon: 'icon-star',
    //   children: [
    //     {
    //       name: 'Login',
    //       url: '/login',
    //       icon: 'icon-star',
    //     },
    //     {
    //       name: 'Register',
    //       url: '/register',
    //       icon: 'icon-star',
    //     },
    //     {
    //       name: 'Error 404',
    //       url: '/404',
    //       icon: 'icon-star',
    //     },
    //     {
    //       name: 'Error 500',
    //       url: '/500',
    //       icon: 'icon-star',
    //     },
    //   ],
    // },
    // {
    //   name: 'Disabled',
    //   url: '/dashboard',
    //   icon: 'icon-ban',
    //   attributes: { disabled: true },
    // },
    // {
    //   name: 'Download CoreUI',
    //   url: 'https://coreui.io/react/',
    //   icon: 'icon-cloud-download',
    //   class: 'mt-auto',
    //   variant: 'success',
    //   attributes: { target: '_blank', rel: "noopener" },
    // },
    // {
    //   name: 'Try CoreUI PRO',
    //   url: 'https://coreui.io/pro/react/',
    //   icon: 'icon-layers',
    //   variant: 'danger',
    //   attributes: { target: '_blank', rel: "noopener" },
    // },
  ],
};
