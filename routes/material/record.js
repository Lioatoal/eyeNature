// Require Header file
var menus = require('../../config/menus');
var sidebar = require('../../config/sidebar');
var utility = require("../../libs/utility");
// Require Modules
var express = require('express');
var dateformat = require('dateformat');
var url = require('url');
var async = require('async');
var xlsx = require('xlsx');
//Require Libs
var libMaterial = require("../../libs/libMaterial");

var router = express.Router();

router.get('/record', function (req, res) {
    var userInfo = req.session.user;
    var record = "",
        getAll = 0,
        permTable = {};

    var recordPermit = utility.getPermissonBit(userInfo.roleID);

    if (!recordPermit['4-2']) {
        return res.redirect('/logout');
    }

    res.render('./material/record/static/mRecord.html', {
        target: 'mRecord',
        menus: menus,
        userInfo: userInfo,
        sidebar: sidebar,
        permission: recordPermit['4-2']
    });
});

router.get('/mRecordRowData', function (req, res) {
    let userInfo = req.session.user;
    let record = "";
    let rowCount = 0;
    let page = 1;
    console.log(req.query);
    
    async.parallel([
        function (finish) {
            libMaterial.getRowRecordByPage({
                inventoryname: req.query.inventoryname,
                operation: req.query.operation,
                operator: req.query.operator,
                campname: req.query.campname,
                // timestamp: req.query.timestamp,
                vendorname: req.query.vendorname,
                beginDate: req.query.beginDate,
                endDate: req.query.endDate,
                offset: parseInt(req.query.start),
                limit: req.query.length,
                order: req.query.order || []
            }, function (result) {
                if (result.data.length != 0) {
                    for (let i in result.data) {
                        // console.log('timestamp: ')
                        // console.log(result.data[i].timestamp)
                        result.data[i].timestamp = dateformat(parseInt(result.data[i].timestamp), "yyyy-mm-dd H:MM")
                    }
                    record = result.data;
                }
                // console.log(result)
                rowCount = result.rowCount
                page = result.page
                finish();
            })
        },
    ], function (errs, results) {
        let data = {
            "draw": page,
            "recordsTotal": rowCount,
            "recordsFiltered": rowCount,
            "data": record
        }
        res.json(data)
    });
});

router.get('/mRecordDetail', function (req, res) {
    // var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var id = params.query.id;
    var record = [];

    async.parallel([
        function (finish) {
            libMaterial.getRecordRemark(function (result) {
                if (result.length != 0) {
                    record = result;
                }
                finish();
            });
        },
    ], function (errs, results) {
        var data = {
            record: record
        }
        res.json(data)
    });
});

router.post('/recordImport', function(req, res){
    var userInfo = req.session.user; 
    var xlsxData = req.body;
    var worksheet = xlsx.read(xlsxData, {type:"buffer"});
    var index = 0, queue = [];
    var error = {msg:""}; 

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['4-2']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit['4-2'].IMPORT) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }
    
    // for (const key in worksheet.Sheets) {
        // console.log(key);
    var sheet = xlsx.utils.sheet_to_json(worksheet.Sheets["進銷日誌"]);
    var record = sheet.map(element => {
        return {
            'timestamp': element['時戳'],
            'inventoryname': element['物料名稱'],
            'operation': element['操作'],
            'quantity': element['異動數量'],
            'campname': element['營隊名稱'],
            'price': element['價格'],
            'vendorname': element['供應廠商'],
            'operator': element['操作者'],
            'remark': element['備註內容'],
        }
    });

    // for (const i in sheet) {
    //     queue.push(
    //         function (index ,next) {
    //             var customer = sheet[index];
    //             var data = {
    //                 head: 'create',
    //                 email: customer.email,
    //                 idcardno: customer.idcardno,
    //                 name: customer.name,
    //                 gender: customer.gender,
    //                 birthday: customer.birthday,
    //                 addr: customer.addr,
    //                 intladdr: customer.intladdr,
    //                 phone: customer.phone,
    //                 cellphone: customer.cellphone,
    //                 contactname: customer.contactname,
    //                 contactphone: customer.contactphone,
    //                 iswork: customer.iswork,
    //                 remark: customer.remark,
    //             };
    //             console.log(data);
    //             libPersonnel.setCustomer(data, function (result) {
    //                 if (result.length != 0) {
    //                     error.msg += result[0] + '\r\n';
    //                 }
    //                 index++;
    //                 next('', index);
    //             });
                
    //         }
    //     )
    // }

    async.waterfall([
        function (next) {
            next('', index);
        }
    ].concat(queue), function (errs, results) {
        res.json(error);
    });
    // console.log(worksheet.SheetNames);
});

router.get('/mRecordExport', function (req, res) {
    // var userInfo = req.session.user;
    var record = "";

    async.parallel([
        function (finish) {
            libMaterial.getAllRecord(
                function (result) {
                    console.log(result)
                    if (result.length != 0) {
                        record = result;
                    }
                    finish();
                })
        },
    ], function (errs, results) {
        console.log(record)
        var output = record.map(element => {
            return {
                '時戳': element['timestamp'],
                '物料名稱': element['inventoryname'],
                '操作': element['operation'],
                '異動數量': element['quantity'],
                '營隊名稱': element['campname'],
                '價格': element['price'],
                '供應廠商': element['vendorname'],
                '操作者': element['operator'],
                '備註內容': element['remark'],
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
        xlsx.utils.book_append_sheet(wb, ws, "進銷日誌");

        /* generate buffer */
        var buf = xlsx.write(wb, {
            type: 'buffer',
            bookType: "xlsx"
        });

        /* send to client */
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent("進銷日誌.xlsx"));
        res.status(200).send(buf);
    });
});

module.exports = router;