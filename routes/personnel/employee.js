// Require Header file
var menus = require('../../config/menus');
// var userInfo = require('../../config/userInfo');
var sidebar = require('../../config/sidebar');
var utility = require("../../libs/utility");
// Require Modules
var express = require('express');
var url = require('url');
var async = require('async');
var dateformat = require('dateformat');
var xlsx = require('xlsx');
//Require Libs
var libPersonnel = require("../../libs/libPersonnel");

var router = express.Router();

router.get('/employee', function (req, res) {
    var userInfo = req.session.user;
    var titles = [],
        edulevels = []

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-2']) {
        return res.redirect('/logout');
    }

    async.parallel([
        function (finish) {
            libPersonnel.getAllEmployeeTitle(function (result) {
                if (result.length != 0) {
                    employeeTitle = result;
                    // console.log(employeeTitle);
                }
                finish();
            })
        },
        function (finish) {
            libPersonnel.getAllEmployeeEdu(function (result) {
                if (result.length != 0) {
                    employeeEdu = result;
                    // console.log(employeeEdu);
                }
                finish();
            })
        }
    ], function (errs, results) {
        res.render('./personnel/employee/static/mEmployee.html', {
            target: 'mEmployee',
            menus: menus,
            userInfo: userInfo,
            sidebar: sidebar,
            permission: rolePermit['3-2'],
            titles: employeeTitle,
            edulevels: employeeEdu
        });
    });

});

router.get('/mEmployeeRowData', function (req, res) {
    var employeeList = "";
    var rowCount = 0;
    var page = 1;

    async.parallel([
        function (finish) {
            libPersonnel.getEmployeeByPage({
                name: req.query.name,
                nickname: req.query.nickname,
                title: req.query.title,
                cellphone: req.query.cellphone,
                school: req.query.school,
                edulevel: req.query.edulevel,
                iswork: req.query.iswork,
                offset: parseInt(req.query.start),
                limit: req.query.length,
                order: req.query.order || []
            }, function (result) {
                if (result.data.length != 0) {
                    employeeList = result.data;
                }
                rowCount = result.rowCount
                page = result.page
                finish();
            })
        }
    ], function (errs, results) {
        // res.render('./personnel/employee/ejs/mEmployeeRowData.ejs',{
        //     employeeList:employeeList,
        // });
        var data = {
            "draw": page,
            "recordsTotal": rowCount,
            "recordsFiltered": rowCount,
            "data": employeeList
        }
        res.json(data);
    });
});

//CREATE & EDIT
router.get('/mEmployeeEdit', function (req, res) {
    var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var id = params.query.id;
    var employeeEdit = [],
        employeeTitle = [],
        employeeEdu = [];
    async.parallel([
        function (finish) {
            libPersonnel.getEditEmployee(id, function (result) {
                if (result.length != 0) {
                    result[0].birthday = dateformat(result[0].birthday, "yyyy-mm-dd");
                    employeeEdit = result[0];
                    console.log(employeeEdit)
                }
                finish();
            })
        },
        function (finish) {
            libPersonnel.getAllEmployeeTitle(function (result) {
                if (result.length != 0) {
                    employeeTitle = result;
                    console.log(employeeTitle);
                }
                finish();
            })
        },
        function (finish) {
            libPersonnel.getAllEmployeeEdu(function (result) {
                if (result.length != 0) {
                    employeeEdu = result;
                    console.log(employeeEdu);
                }
                finish();
            })
        }
    ], function (errs, results) {
        res.render('./personnel/employee/ejs/mEmpModalEdit.ejs', {
            employeeEdit: employeeEdit,
            employeeTitle: employeeTitle,
            employeeEdu: employeeEdu
        });
    });
});

router.get('/mEmployeeCreate', function (req, res) {
    var userInfo = req.session.user;
    var employeeTitle = [],
        employeeEdu = [];
    // console.log("test");
    async.parallel([
        function (finish) {
            libPersonnel.getAllEmployeeTitle(function (result) {
                if (result.length != 0) {
                    employeeTitle = result;
                    console.log(employeeTitle);
                }
                finish();
            })
        },
        function (finish) {
            libPersonnel.getAllEmployeeEdu(function (result) {
                if (result.length != 0) {
                    employeeEdu = result;
                    console.log(employeeEdu);
                }
                finish();
            })
        }
    ], function (errs, results) {
        res.render('./personnel/employee/ejs/mEmpModalCreate.ejs', {
            employeeTitle: employeeTitle,
            employeeEdu: employeeEdu
        });
    });
});

//CREATE & EDIT
router.post('/mEmployeeModify', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    // var params = url.parse(req.url, true);
    console.log(params);
    var employee = params;
    var error = {
        msg: ""
    }

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-2']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (employee.head == 'create') {
            if (!rolePermit['3-2'].CREATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        } else if (employee.head == 'edit') {
            if (!rolePermit['3-2'].UPDATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        }
    }

    async.waterfall([
        function (next) {
            libPersonnel.getAllEmployeeID(function (result) {
                next();
            });
        },
        function (next) {
            libPersonnel.setEmployee(employee, function (result) {
                if (result.length != 0) {
                    error.msg = result[0];
                }
                next();
            });
        }
    ], function (errs, results) {
        console.log(error);
        res.json(error);
    });
});


//DELETE
router.post('/mEmployeeDelete', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    var employeeIDArray = params;
    var error = {
        msg: ""
    }
    console.log(employeeIDArray);

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-2']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit['3-2'].DELETE) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }

    async.series([
        function (next) {
            libPersonnel.deleteEmployee(employeeIDArray, function (result) {
                if (result.length != 0) {
                    error.msg += result[0] + "\r\n";
                }
                next();
            });
        }
    ], function (errs, results) {
        res.json(error);
    });
});

router.post('/mEmployeeImport', function (req, res) {
    var userInfo = req.session.user;
    var xlsxData = req.body;
    var worksheet = xlsx.read(xlsxData, {
        type: "buffer"
    });
    var employee = [], employeeEdu = {}, employeeTitle = {},
        diffTable = {}, queue = [];
    var error = {
        msg: ""
    };

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-2']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit['3-2'].IMPORT) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }

    // for (const key in worksheet.Sheets) {
    // console.log(key);
    var sheet = xlsx.utils.sheet_to_json(worksheet.Sheets["員工管理"]);
    
    for (const i in sheet) {
        queue.push(
            function (index, next) {
                libPersonnel.setEmployee(employee[index], function (result) {
                    if (result.length != 0) {
                        error.msg += result[0] + '\r\n';
                    }
                    index++;
                    next('', index);
                });
            }
        )
    }

    async.waterfall([
        function (next) {
            libPersonnel.getAllEmployeeEdu(function(results){
                if (results.length != 0) {
                    for (const i in results) {
                        employeeEdu[results[i].edulevel] = results[i].id;
                    }
                }
                next();
            })
        },
        function (next) {
            libPersonnel.getAllEmployeeTitle(function(results){
                if (results.length != 0) {
                    for (const i in results) {
                        employeeTitle[results[i].title] = results[i].id;
                    }
                }
                next();
            })
        },
        function (next) {
            libPersonnel.getAllEmployeeID(function(results){
                if (results.length != 0) {
                    for (const i in results) {
                        diffTable[results[i].idcardno] = results[i].id;
                    }
                }
                next();
            })
        },
        function (next) {

            employee = sheet.map(element => {
                return {
                    'name': element['姓名'],
                    'nickname': element['綽號'],
                    'title_id': employeeTitle[element['職稱']],
                    'mainphone': element['手機1'],
                    'secondaryphone': element['手機2'],
                    'edu_id': employeeEdu[element['學歷']],
                    'school': element['學校'],
                    'iswork': element['在職中'] === '在職中' ? 1 : 0,
                    'facebook': element['Facebook'],
                    'email': element['E-Mail'],
                    'line': element['Line'],
                    'wechat': element['WeChat'],
                    'birthday': dateformat(element['出生年月日'], 'yyyy-mm-dd'),
                    'bloodtype': element['血型'],
                    'telephone': element['市內電話'],
                    'address': element['居住地址'],
                    'registaddr': element['戶籍地址'],
                    'idcardno': element['身分證字號'],
                    'gender': element['性別'],
                    'stature': element['身高'],
                    'weight': element['體重'],
                    'department': element['科系所'],
                    'grade': element['年級'],
                    'secondaryedu': element['次高學歷'],
                    'nextofkin': element['緊急連絡人'],
                    'nextofkin_phone': element['緊急連絡人電話'],
                    'bankcode': element['銀行代碼'],
                    'bankaccount': element['銀行帳戶'],
                    'bankname': element['銀行帳戶戶名'],
                    'remark': element['備註'],
                    'degreestatus': element['就學狀態'],
                }
            });
            
            for (const i in employee) {
                if(diffTable[employee[i].idcardno]){
                    employee[i].head = "edit";
                    employee[i].txtEditID = diffTable[employee[i].idcardno];
                } else {
                    employee[i].head = "create";
                }
            }
            var index = 0;
            next('', index);
        }
    ].concat(queue), function (errs, results) {
        res.json(error);
    });
});

router.get('/mEmployeeExport', function (req, res) {
    var userInfo = req.session.user;
    var employee = "";

    async.parallel([
        function (finish) {
            libPersonnel.getAllEmployee(
                function (result) {
                    console.log(result)
                    if (result.length != 0) {
                        employee = result;
                    }
                    finish();
                })
        },
    ], function (errs, results) {
        console.log(employee)
        var output = employee.map(element => {
            return {
                '姓名': element['name'],
                '綽號': element['nickname'],
                '職稱': element['title'],
                '手機1': element['mainphone'],
                '手機2': element['secondaryphone'],
                '學歷': element['edulevel'],
                '學校': element['school'],
                '在職中': element['iswork'] === 1 ? '在職中' : '已離職',
                'Facebook': element['facebook'],
                'E-Mail': element['email'],
                'Line': element['line'],
                'WeChat': element['wechat'],
                '出生年月日': element['birthday'],
                '血型': element['bloodtype'],
                '市內電話': element['telephone'],
                '居住地址': element['address'],
                '戶籍地址': element['registaddr'],
                '身分證字號': element['idcardno'],
                '性別': element['gender'],
                '身高': element['stature'],
                '體重': element['weight'],
                '科系所': element['department'],
                '年級': element['grade'],
                '次高學歷': element['secondaryedu'],
                '緊急連絡人': element['nextofkin'],
                '緊急連絡人電話': element['nextofkin_phone'],
                '銀行代碼': element['bankcode'],
                '銀行帳戶': element['bankaccount'],
                '銀行帳戶戶名': element['bankname'],
                '備註': element['remark'],
                '就學狀態': element['degreestatus'],
            }
        });
        /* generate workbook */
        var ws = xlsx.utils.json_to_sheet(output);
        var wb = xlsx.utils.book_new();
        var wscols = [{
                wch: 10
            },
            {
                wch: 20
            }
        ];
        ws['!cols'] = wscols;
        xlsx.utils.book_append_sheet(wb, ws, "員工管理");

        /* generate buffer */
        var buf = xlsx.write(wb, {
            type: 'buffer',
            bookType: "xlsx"
        });

        /* send to client */
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent("員工管理.xlsx"));
        res.status(200).send(buf);
    });
});


module.exports = router;