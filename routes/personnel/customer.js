// Require Header file
var menus = require('../../config/menus');
// var userInfo = require('../../config/userInfo');
var sidebar = require('../../config/sidebar');
var utility = require("../../libs/utility");
// Require Modules
var express = require('express');
var url = require('url');
var async = require('async');
var fs = require('fs');
var xlsx = require('xlsx');
var dateformat = require('dateformat');

//Require Libs
var libPersonnel = require("../../libs/libPersonnel");

var router = express.Router();
var relationTableMap = {
    1: "父親",
    2: "母親",
    3: "爺爺",
    4: "奶奶",
    5: "叔叔",
    6: "阿姨",
    7: "其他",
}
var revRelationTableMap = {
    "父親":1,
    "母親":2,
    "爺爺":3,
    "奶奶":4,
    "叔叔":5,
    "阿姨":6,
    "其他":7,
}

router.get('/customer',function(req,res){
    var userInfo = req.session.user;

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-3']) {
        return res.redirect('/logout');
    }

    res.render('./personnel/customer/static/customer.html',{
        target: 'customer',
        menus:menus,
        userInfo:userInfo,
        sidebar:sidebar,
        permission: rolePermit['3-3']
    });
});

router.get('/customerRowData', function (req, res) {
    var customerList = "";
    var rowCount = 0;
    var page = 1;
    
    async.parallel([
        function(finish){
            libPersonnel.getCustomerByPage({
                offset: parseInt(req.query.start),
                limit: req.query.length
            },function(result){
                if (result.data.length != 0) {
                    customerList = result.data;
                }
                // console.log(customerList);
                rowCount = result.rowCount
                page = result.page
                finish();
            })
        }
    ],function(errs, results){
        var data = {
            "draw": page,
            "recordsTotal": rowCount,
            "recordsFiltered": rowCount,
            "data": customerList
        }
        res.json(data);
    });
    
})
router.get('/customerChildRowData', function (req,res) {
    var customerChildList = "";
    var rowCount = 0;
    var page = 1;
    var year = parseInt(dateformat(new Date().toJSON(), "yyyy"));
    var age; 
    
    async.parallel([
        function(finish){
            libPersonnel.getCustomerChildByPage({
                id: req.query.id,
                offset: parseInt(req.query.start),
                limit: req.query.length
            },function(result){
                if (result.data.length != 0) {
                    customerChildList = result.data;
                    for (const i in result.data) {
                        age = parseInt(dateformat(result.data[i].birthday, "yyyy"));
                        customerChildList[i].age = year-age + "歲";
                    }
                }
                rowCount = result.rowCount
                page = result.page
                finish();
            })
        }
    ],function(errs, results){
        var data = {
            "draw": page,
            "recordsTotal": rowCount,
            "recordsFiltered": rowCount,
            "data": customerChildList
        }
        
        res.json(data);
    });
})

/*
 * 待壓測寫法 >>
 */
router.get('/customerCreate', function (req, res) {
    // var ejsFile = fs.readFileSync('views/personnel/customer/ejs/customerModalCreate.ejs', 'utf8');
    // console.log(ejsFile);
    // res.json(ejsFile);
    res.render('./personnel/customer/ejs/customerModalCreate.ejs');
})
router.get('/customerEdit', function (req, res) {
    var params = url.parse(req.url, true);
    var idcardno = params.query.id;
    var customerEdit = [], customerChildEdit = [];

    var ejsFile = fs.readFileSync('views/personnel/customer/ejs/customerModalEdit.ejs', 'utf8');

    async.parallel([
        function(next){
            libPersonnel.getCustomer(idcardno, function (result) {
                if(result.length !=0){
                    result[0].birthday = dateformat(result[0].birthday, "yyyy-mm-dd");
                    customerEdit = result[0];
                }
                next();
            })
        },
    ], function(errs, results){
        // res.render('./personnel/customer/ejs/customerModalEdit.ejs', {
        //     data: customerEdit
        // });
        res.json({
            ejsFile: ejsFile,
            customerEdit: customerEdit
        });
    });
})

router.get('/customerChildEdit', function (req, res) {
    var params = url.parse(req.url, true);
    var idcardno = params.query.id;
    var childEdit = [];

    async.parallel([
        function(next){
            libPersonnel.getCustomerChild(idcardno, function (result) {
                if(result.length !=0){
                    result[0].birthday = dateformat(result[0].birthday, "yyyy-mm-dd");
                    childEdit = result[0];
                    console.log(childEdit);
                }
                next();
            })
        },
    ], function(errs, results){
        res.render('./personnel/customer/ejs/customerChildModalEdit.ejs', {
            childEdit: childEdit
        });
    });
})


router.post('/customerModify', function (req, res) {
    var userInfo = req.session.user; 
    var params = JSON.parse(req.body.postData);
    // var params = url.parse(req.url, true);
    console.log(params);
    var customer = params;
    var error = {msg:""}
    
    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-3']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (customer.head == 'create') {
            if (!rolePermit['3-3'].CREATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        } else if(customer.head == 'edit') {
            if (!rolePermit['3-3'].UPDATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        }
    }

    async.waterfall([
        function(next){
            libPersonnel.getAllCustomerID(function (result) {
                next();
            });
        },
        function(next){
            libPersonnel.setCustomer(customer, function (result) {
                if (result.length != 0) {
                    error.msg = result[0];
                }
                next();
            });
        }
    ], function(errs, results){
        res.json(error);
    });
})

router.post('/customerDelete', function (req, res) {
    var userInfo = req.session.user; 
    var params = JSON.parse(req.body.postData);
    var customerIDArray = params;
    var error = {msg:""}
    console.log(customerIDArray);

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-3']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit['3-3'].DELETE) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }

    async.series([
        function (next) {
            libPersonnel.deleteCustomer(customerIDArray, function (result) {
                if (result.length != 0) {
                    error.msg += result[0] + "\r\n";
                }
                next();
            });
        }
    ],function(errs, results){
        res.json(error);
    });
})

router.post('/customerImport', function(req, res){
    var userInfo = req.session.user; 
    var xlsxData = req.body;
    var worksheet = xlsx.read(xlsxData, {type:"buffer"});
    var diffCustomerTable = {}, diffCustomerChildTable = {},
        queue = [];
    var error = {msg:""}; 

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-3']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit['3-3'].IMPORT) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }
    
    // for (const key in worksheet.Sheets) {
        // console.log(key);
    var sheet = xlsx.utils.sheet_to_json(worksheet.Sheets["客戶管理"]);
    var customerChild = sheet.map(element => {
        var foodtype;
        if(element['學員葷素食'] === '葷食'){
            foodtype = 0;
        }else if(element['學員葷素食']=== '素食'){
            foodtype = 1;
        }else{
            foodtype = 2;
        }

        return {
            'idcardno': element['學員身份證字號'],
            'customer_id': element['客戶身份證字號'],
            'reln_id': element['關係'] = revRelationTableMap[element['關係']],
            'name': element['學員姓名'],
            'gender': element['學員性別'] ==='男' ? 1:0,
            'passportno': element['學員護照號碼'],
            'bloodtype': element['學員血型'],
            'birthday': dateformat(element['學員生日'], 'yyyy-mm-dd'),
            'school': element['學員學校'],
            'foodtype': element['學員葷素食'],
            'stature': element['學員身高'],
            'weight': element['學員體重'],
            'special': element['學員特別照護'],
            'nextofkin': element['學員緊急聯絡人'],
            'nextofkin_phone': element['學員緊急聯絡人電話'],
            'remark': element['學員備註']
        }
    });
    var customer = sheet.map(element => {
        var foodtype;
        if(element['學員葷素食'] === '葷食'){
            foodtype = 0;
        }else if(element['學員葷素食']=== '素食'){
            foodtype = 1;
        }else{
            foodtype = 2;
        }
        // element['reln_id'] = relationTableMap[element['reln_id']]
        // for(var i in relationTableMap){
        //     console.log(i)
        //     // console.log(relationTable[i])
        //     if(element['reln_id']===i)
        //         element['reln_id']=relationTable[i]
        // } 
        return {
            'idcardno': element['客戶身份證字號'],
            'name': element['客戶姓名'],
            'gender': element['客戶性別'] ==='男' ? 1:0,
            'phone': element['客戶電話'],
            'cellphone': element['客戶手機'],
            'addr': element['客戶國內地址'],
            'intladdr': element['客戶國外地址'],
            'email': element['客戶e-Mail'],
            'contactname': element['客戶連絡人'],
            'contactphone': element['客戶連絡人電話'],
            'iswork': element['是否為會員'] === '會員' ? 1:0,
            'remark': element['客戶備註'],
            'birthday': dateformat(element['客戶生日'], 'yyyy-mm-dd')
        }
    });
    // console.log(customerChild);
    var hashTable = {};
	customer = customer.filter(function (el) {
		var key = JSON.stringify(el);
		var match = Boolean(hashTable[key]);
		return (match ? false : hashTable[key] = true);
	});

    for (const i in customer) {
        queue.push(
            function ( i, j ,next) {
                // console.log(i);
                // console.log(j);
                libPersonnel.setCustomer(customer[i], function (result) {
                    if (result.length != 0) {
                        error.msg += result[0] + '\r\n';
                    }
                    i++;
                    next('', i, j);
                });
            }
        ); 
    }

    for (const i in customerChild) {
        queue.push(
            function (i, j ,next) {
                libPersonnel.setCustomerChild(customerChild[j], function (result) {
                    if (result.length != 0) {
                        error.msg += result[0] + '\r\n';
                    }
                    j++;
                    next('', i, j);
                });
            }
        );
    }

    async.waterfall([
        function (next) {
            libPersonnel.getAllCustomerID(function (results) {
                console.log("getAllCustomerID");
                console.log(results);
                for (const i in results) {
                    diffCustomerTable[results[i].idcardno] = true;
                }
                next();
            })
        },
        function (next) {
            libPersonnel.getAllCustomerChildID(function (results) {
                console.log("getAllCustomerChildID");
                console.log(results);
                for (const i in results) {
                    diffCustomerChildTable[results[i].idcardno] = true;
                }
                next();
            })
        },
        function (next) {

            for (const i in customer) {
                (diffCustomerTable[customer[i].idcardno]) ? customer[i].head = 'edit' : customer[i].head = 'create';
            }
            for (const i in customerChild) {
                (diffCustomerChildTable[customerChild[i].idcardno]) ? customerChild[i].head = 'edit' : customerChild[i].head = 'create';
            }
            
            var i = 0, j = 0;
            next('', i, j);
        }
    ].concat(queue), function (errs, results) {
        res.json(error);
    });
    // console.log(worksheet.SheetNames);
});

router.get('/mCustomerExport', function (req, res) {
    var userInfo = req.session.user;
    var customer = "";

    async.parallel([
        function (finish) {
            libPersonnel.getAllCustomer(
                function (result) {
                    // console.log(result)
                    if (result.length != 0) {
                        customer = result;
                    }
                    finish();
                })
        },
    ], function (errs, results) {
        // console.log(inventory)
        var output = customer.map(element => {
            if(element['foodtype']===0){
                element['foodtype']='葷食'
            }else if(element['foodtype']===1){
                element['foodtype']='素食'
            }else{
                element['foodtype']='蛋奶素'
            }
            // element['reln_id'] = relationTableMap[element['reln_id']]
            // for(var i in relationTableMap){
            //     console.log(i)
            //     // console.log(relationTable[i])
            //     if(element['reln_id']===i)
            //         element['reln_id']=relationTable[i]
            // } 
            
            return {
                '學員身份證字號': element['idcardno'],
                '關係': element['reln_id'] = relationTableMap[element['reln_id']],
                '學員姓名': element['name'],
                '學員性別': element['gender'] ===1 ? '男':'女',
                '學員護照號碼': element['passportno'],
                '學員血型': element['bloodtype'],
                '學員生日': element['birthday'],
                '學員學校': element['school'],
                '學員葷素食': element['foodtype'],
                '學員身高': element['stature'],
                '學員體重': element['weight'],
                '學員特別照護': element['special'],
                '學員緊急聯絡人': element['nextofkin'],
                '學員緊急聯絡人電話': element['nextofkin_phone'],
                '學員備註': element['remark'],
                '客戶身份證字號': element['c_idcardno'],
                '客戶姓名': element['c_name'],
                '客戶性別': element['c_gender'] ===1 ? '男':'女',
                '客戶電話': element['c_phone'],
                '客戶手機': element['c_cellphone'],
                '客戶國內地址': element['c_addr'],
                '客戶國外地址': element['c_intladdr'],
                '客戶e-Mail': element['c_email'],
                '客戶連絡人': element['c_contactname'],
                '客戶連絡人電話': element['c_contactphone'],
                '是否為會員': element['c_iswork'] ===1 ? '會員':'非會員',
                '客戶備註': element['c_remark'],
                '客戶生日': element['c_birthday']
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
        xlsx.utils.book_append_sheet(wb, ws, "客戶管理");

        /* generate buffer */
        var buf = xlsx.write(wb, {
            type: 'buffer',
            bookType: "xlsx"
        });

        /* send to client */
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent("客戶管理.xlsx"));
        res.status(200).send(buf);
    });
});

router.post('/customerChildModify', function (req, res) {
    var userInfo = req.session.user; 
    var params = JSON.parse(req.body.postData);
    // var params = url.parse(req.url, true);
    console.log(params);
    var customerChild = params;
    var error = {msg:""}
    
    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-3']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (customerChild.head == 'create') {
            if (!rolePermit['3-3'].CREATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        } else if(customerChild.head == 'edit') {
            if (!rolePermit['3-3'].UPDATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        }
    }

    async.waterfall([
        // function(next){
        //     libPersonnel.getAllCustomerChild(function (result) {
        //         next();
        //     });
        // },
        function(next){
            libPersonnel.setCustomerChild(customerChild, function (result) {
                if (result.length != 0) {
                    error.msg = result[0];
                }
                next();
            });
        }
    ], function(errs, results){
        res.json(error);
    });
})

router.post('/customerChildDelete', function (req, res) {
    var userInfo = req.session.user; 
    var params = JSON.parse(req.body.postData);
    var childIDArray = params;
    var error = {msg:""}
    console.log(childIDArray);

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['3-3']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit['3-3'].DELETE) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }

    async.series([
        function (next) {
            libPersonnel.deleteCustomerChild(childIDArray, function (result) {
                if (result.length != 0) {
                    error.msg += result[0] + "\r\n";
                }
                next();
            });
        }
    ],function(errs, results){
        res.json(error);
    });
})

module.exports = router;