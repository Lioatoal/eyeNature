
module.exports = [
    { head: '1', text: '1 公佈欄', href:'bulletin', path: './bulletin/bulletin', css: "glyphicon glyphicon-tasks", second: [] },
    { head: '2', text: '2 行事曆', href:'calendar', path: './calendar/calendar', css: "glyphicon glyphicon-tasks", second: [] },
    {
        head: '3', text: '3 人員管理', href: '#', css: "glyphicon glyphicon-tasks", second: [
            {
                head: '3-1',
                text: '3-1 廠商管理',
                href: 'vendor',
                path: './personnel/vendor',
                css: 'glyphicon glyphicon-tasks',
            },
            {
                head: '3-2',
                text: '3-2 員工管理',
                href: 'employee',
                path: './personnel/employee',
                css: 'glyphicon glyphicon-tasks',
            },
            {
                head: '3-3',
                text: '3-3 客戶管理',
                href: 'customer',
                path: './personnel/customer',
                css: 'glyphicon glyphicon-tasks',
            },
        ]
    },
    { head: '4', text: '4 物料管理', href: '#', css: "glyphicon glyphicon-tasks", second: [
        {
            head: '4-1',
            text: '4-1 庫存物料',
            href: 'inventory',
            path: './material/inventory',
            css: 'glyphicon glyphicon-tasks',
        },
        // {
        //     head: '4-2',
        //     text: '4-2 物料採購',
        //     href: 'template',
        //     path: '',
        //     css: 'glyphicon glyphicon-tasks',
        // },
        {
            head: '4-2',
            text: '4-2 進銷記錄',
            href: 'record',
            path: './material/record',
            css: 'glyphicon glyphicon-tasks',
        },

    ] },
    {
        head: '5', text: '5 營隊管理', href: '#', css: "glyphicon glyphicon-tasks", second: [
            {
                head: '5-1',
                text: '5-1 營隊管理',
                href: 'camp',
                path: './camp/camp',
                css: 'glyphicon glyphicon-tasks',
            }
        ]
    },
    // {
    //     head: '6', text: '6 專案管理', path: '#', css: "glyphicon glyphicon-tasks", second: [
    //         {
    //             head: '6-1',
    //             text: '6-1 夏令營',
    //             href: 'template',
    //             path: '',
    //             css: 'glyphicon glyphicon-tasks',
    //         },
    //         {
    //             head: '6-2',
    //             text: '6-2 冬令營',
    //             href: 'template',
    //             path: '',
    //             css: 'glyphicon glyphicon-tasks',
    //         },
    //         {
    //             head: '6-3',
    //             text: '6-3 平日課',
    //             href: 'template',
    //             path: '',
    //             css: 'glyphicon glyphicon-tasks',
    //         },
    //     ]
    // },
    // {
    //     head: '7', text: '7 帳務管理', path: '#', css: "glyphicon glyphicon-tasks", second: [
    //         {
    //             head: '7-1',
    //             text: '7-1 薪資試算',
    //             href: 'template',
    //             path: '',
    //             css: 'glyphicon glyphicon-tasks',
    //         },
    //         {
    //             head: '7-2',
    //             text: '7-2 支出紀錄',
    //             href: 'template',
    //             path: '',
    //             css: 'glyphicon glyphicon-tasks',
    //         },
    //     ]
    // },
    {
        head: '8', text: '8 會員管理', href: '#', css: "glyphicon glyphicon-tasks", second: [
            {
                head: '8-1',
                text: '8-1 權限管理',
                href: 'permission',
                path: './member/permission',
                css: 'glyphicon glyphicon-tasks',
            },
            {
                head: '8-2',
                text: '8-2 角色管理',
                href: 'role',
                path: './member/role',
                css: 'glyphicon glyphicon-tasks',
            },
            {
                head: '8-3',
                text: '8-3 帳號管理',
                href: 'acct',
                path: './member/acct',
                css: 'glyphicon glyphicon-tasks',
            },
        ]
    },
];
