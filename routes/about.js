/* MTI CONFIDENTIAL INFORMATION */

var express = require('express');
// var menus = require('../config/menus');
// var userInfo = require('../config/userInfo');
// var url = require('url');
var async = require('async');
var dateformat = require('dateformat');
//Require Libs
var libMember = require("../libs/libMember");
var libPersonnel = require("../libs/libPersonnel");

var router = express.Router();

router.get('/about', function (req, res) {
    // var userInfo = req.session.user;
    var email = req.query.id;
    var roleID = req.query.roleID;
    var role = "", acct = "";
    var employeeEdit = [], employeeTitle = [], employeeEdu = [];
    var vendorType = [], vendor = [];

    console.log('roleID: ' + roleID);
    console.log('email: ' + email);
    if (roleID == '5' || roleID == '6') {
        libMember.getAcct(email, function (result) {
            if (result.length != 0) {
                acct = result[0];
            }
            console.log('1')
            async.parallel([
                function (finish) {
                    libPersonnel.getVendor(acct.related_id, function (result) {
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
                res.render('./partials/ejs/vendorPersonalModal.ejs', {
                    acct: acct,
                    vendor: vendor,
                    vendorType: vendorType
                });
            });
        })

    } else {
        console.log('not 5');

        libMember.getAcct(email, function (result) {
            if (result.length != 0) {
                acct = result[0];
            }
            console.log('1')
            async.parallel([
                function (finish) {
                    libPersonnel.getEditEmployee(acct.related_id, function (result) {
                        if (result.length != 0) {
                            result[0].birthday = dateformat(result[0].birthday, "yyyy-mm-dd");
                            employeeEdit = result[0];
                            console.log('2')
                        }
                        finish();
                    })
                },
                function (finish) {
                    libPersonnel.getAllEmployeeEdu(function (result) {
                        if (result.length != 0) {
                            employeeEdu = result;
                            console.log('4');
                        }
                        finish();
                    })
                }
            ], function (errs, results) {
                res.render('./partials/ejs/employeePersonalModal.ejs', {
                    acct: acct,
                    employeeEdit: employeeEdit,
                    employeeEdu: employeeEdu
                });
            });
        })
    }
});

router.post('/mPersonalEmployeeModify', function (req, res) {
    // var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    // var params = url.parse(req.url, true);
    var employee = params;
    var error = { msg: "" }

    async.waterfall([
        function (next) {
            libPersonnel.getAllEmployee(function (result) {
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

router.post('/mPersonalVendorModify', function (req, res) {
    // var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    // var params = url.parse(req.url, true);
    var vendor = params;
    var error = { msg: "" }

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


module.exports = router;
