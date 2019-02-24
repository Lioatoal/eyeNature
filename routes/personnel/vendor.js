// Require Header file
var menus = require('../../config/menus');
// var userInfo = require('../../config/userInfo');
var sidebar = require('../../config/sidebar');
var utility = require("../../libs/utility");
// Require Modules
var express = require('express');
var url = require('url');
var async = require('async');
var xlsx = require('xlsx');
//Require Libs
var libPersonnel = require("../../libs/libPersonnel");

var router = express.Router();

router.get('/vendor', function (req, res) {
    var userInfo = req.session.user;
    var vendorList = "",
        getAll = 0;
    var vendorType = []

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    // console.log(rolePermit)
    if (!rolePermit['3-1']) {
        return res.redirect('/logout');
    }

    async.parallel([
        function (finish) {
            libPersonnel.getAllVendorType(function (result) {
                if (result.length != 0) {
                    vendorType = result;
                    // console.log(vendorType)
                }
                finish();
            })
        }
    ], function (errs, results) {
        res.render('./personnel/vendor/static/mVendor.html', {
            target: 'mVendor',
            menus: menus,
            userInfo: userInfo,
            sidebar: sidebar,
            permission: rolePermit['3-1'],
            types: vendorType
        });
    });

});
router.get('/mVendorRowData', function (req, res) {
    var userInfo = req.session.user;
    var vendorList = "";
    var rowCount = 0;
    var page = 1;

    async.parallel([
        function (finish) {
            libPersonnel.getAllVendorByPage({
                type: req.query.type,
                company: req.query.company,
                name: req.query.name,
                phone: req.query.phone,
                cellphone: req.query.cellphone,
                iswork: req.query.iswork,
                offset: parseInt(req.query.start),
                limit: req.query.length,
                order: req.query.order || []
            }, function (result) {
                if (result.data.length != 0) {
                    vendorList = result.data;
                }
                rowCount = result.rowCount
                page = result.page
                finish();
            })
        }
    ], function (errs, results) {
        var data = {
            "draw": page,
            "recordsTotal": rowCount,
            "recordsFiltered": rowCount,
            "data": vendorList
        }
        res.json(data);
    });
});

router.get('/mVendorCreate', function (req, res) {
    var userInfo = req.session.user;
    var vendorType = [];
    async.parallel([
        function (finish) {
            libPersonnel.getAllVendorType(function (result) {
                if (result.length != 0) {
                    vendorType = result;
                }
                finish();
            })
        }
    ], function (errs, results) {
        res.render('./personnel/vendor/ejs/mVendorModalCreate.ejs', {
            vendorType: vendorType
        });
    });
});
//this is get Edit value
router.get('/mVendorEdit', function (req, res) {
    var userInfo = req.session.user;
    var id = req.query.id;
    var vendor = "",
        vendorType = "";

    async.parallel([
        function (finish) {
            libPersonnel.getVendor(id, function (result) {
                if (result.length != 0) {
                    vendor = result[0];
                }
                finish();
            })
        },
        function (finish) {
            libPersonnel.getAllVendorType(function (result) {
                if (result.length != 0) {
                    vendorType = result;
                }
                finish();
            })
        }
    ], function (errs, results) {
        console.log(vendor)
        res.render('./personnel/vendor/ejs/mVendorModalEdit.ejs', {
            vendor: vendor,
            vendorType: vendorType
        });
    });
});



//CREATE & EDIT
router.post('/mVendorModify', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    // var params = url.parse(req.url, true);
    console.log(params);
    var vendor = params;
    var error = {
        msg: ""
    }

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-1']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (vendor.head == 'create') {
            if (!rolePermit['3-1'].CREATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        } else if (vendor.head == 'edit') {
            if (!rolePermit['3-1'].UPDATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        }
    }

    async.waterfall([
        function (next) {
            libPersonnel.getAllVendor(function (result) {
                next();
            });
        },
        function (next) {
            libPersonnel.setVendor(vendor, function (result) {
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
router.post('/mVendorDelete', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    var vendorIDArray = params;
    var error = {
        msg: ""
    }
    console.log(vendorIDArray);

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-1']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit['3-1'].DELETE) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }

    async.series([
        function (next) {
            libPersonnel.deleteVendor(vendorIDArray, function (result) {
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

router.post('/mVendorImport', function (req, res) {
    var userInfo = req.session.user;
    var xlsxData = req.body;
    var worksheet = xlsx.read(xlsxData, {
        type: "buffer"
    });
    var index = 0, vendor = [], vendorType = {},
        diffTable = {}, queue = [];
    var error = {
        msg: ""
    };

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-1']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit['3-1'].IMPORT) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }

    var sheet = xlsx.utils.sheet_to_json(worksheet.Sheets["廠商管理"]);

    for (const i in sheet) {
        queue.push(
            function (index, next) {
                libPersonnel.setVendor(vendor[index], function (result) {
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
            libPersonnel.getAllVendorType(function (results) {
                if (results.length != 0) {
                    for (const i in results) {
                        vendorType[results[i].type] = results[i].id;
                    }
                }
                next();
            })
        },
        function (next) {
            libPersonnel.getAllVendorID(function (results) {
                if (results.length != 0) {
                    for (const i in results) {
                        diffTable[results[i].email] = results[i].id;
                    }
                }
                next();
            })
            
        },
        function (next) {
            vendor = sheet.map(element => {
                var res = {
                    'type_id': vendorType[element['種類']],
                    'company': element['名稱'],
                    'name': element['聯絡人'],
                    'phone': element['市內電話'],
                    'extension': element['分機'],
                    'cellphone': element['手機號碼'],
                    'fax': element['傳真'],
                    'iswork': element['合作中'] === '合作中' ? 0 : 1,
                    'title': element['連絡人職稱'],
                    'jobagent': element['代理人姓名'],
                    'facebook': element['Facebook'],
                    'email': element['E-Mail'],
                    'line': element['Line'],
                    'wechat': element['WeChat'],
                    'address': element['地址'],
                    'bankcode': element['銀行代碼'],
                    'bankaccount': element['銀行帳戶'],
                    'bankname': element['銀行帳戶戶名'],
                    'remark': element['備註']
                }
                if(diffTable[res.email]){
                    res.head = "edit";
                    res.txtEditID = diffTable[res.email];
                } else {
                    res.head = "create";
                }
                return res;
            });

            console.log(vendor);

            var index = 0;
            next('', index);
        }
    ].concat(queue), function (errs, results) {
        res.json(error);
    });
    // console.log(worksheet.SheetNames);
});

router.get('/mVendorExport', function (req, res) {
    var userInfo = req.session.user;
    var vendor = "";

    async.parallel([
        function (finish) {
            libPersonnel.getAllVendor(
                function (result) {
                    console.log(result)
                    if (result.length != 0) {
                        vendor = result;
                    }
                    finish();
                })
        },
    ], function (errs, results) {
        console.log(vendor)
        var output = vendor.map(element => {
            return {
                '種類': element['type'],
                '名稱': element['company'],
                '聯絡人': element['name'],
                '市內電話': element['phone'],
                '分機': element['extension'],
                '手機號碼': element['cellphone'],
                '傳真': element['fax'],
                '合作中': element['iswork'] === 1 ? '合作中' : '未合作',
                '連絡人職稱': element['title'],
                '代理人姓名': element['jobagent'],
                'Facebook': element['facebook'],
                'E-Mail': element['email'],
                'Line': element['line'],
                'WeChat': element['wechat'],
                '地址': element['address'],
                '銀行代碼': element['bankcode'],
                '銀行帳戶': element['bankaccount'],
                '銀行帳戶戶名': element['bankname'],
                '備註': element['remark'],
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
        xlsx.utils.book_append_sheet(wb, ws, "廠商管理");

        /* generate buffer */
        var buf = xlsx.write(wb, {
            type: 'buffer',
            bookType: "xlsx"
        });

        /* send to client */
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent("廠商管理.xlsx"));
        res.status(200).send(buf);
    });
});


module.exports = router;