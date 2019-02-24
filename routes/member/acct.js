// Require Header file
var menus = require('../../config/menus');
// var userInfo = require('../../config/userInfo');
var sidebar = require('../../config/sidebar');
var utility = require("../../libs/utility");
// Require Modules
var express = require('express');
var url = require('url');
var async = require('async');
var bcrypt = require('bcryptjs');
var xlsx = require('xlsx');
//Require Libs
var libMember = require("../../libs/libMember");
var libPersonnel = require("../../libs/libPersonnel");

var router = express.Router();

router.get('/acct', function (req, res) {
    var userInfo = req.session.user;
    var acct = "", getAll = 0;

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    // console.log(rolePermit)
    if (!rolePermit['8-3']) {
        return res.redirect('/logout');
    }

    async.parallel([
        function (finish) {
            libMember.getAllRole(function (result) {
                if (result.length != 0) {
                    role = result;
                }
                finish();
            })
        }
    ], function (errs, results) {
        res.render('./member/account/static/mAcct.html', {
            target: 'mAcct',
            menus: menus,
            userInfo: userInfo,
            sidebar: sidebar,
            permission: rolePermit['8-3'],
            role: role
        });
    });
});
router.get('/mAcctRowData', function (req, res) {
    var userInfo = req.session.user;
    var acct = "";
    var rowCount = 0;
    var page = 1;
    async.parallel([
        function (finish) {
            libMember.getAcctByPage({
                email: req.query.email,
                name: req.query.name,
                roleID: req.query.roleID,
                enable: req.query.enable,
                offset: parseInt(req.query.start),
                limit: req.query.length,
                order: req.query.order || []
            }, function (result) {
                if (result.data.length != 0) {
                    acct = result.data;
                }
                // console.log(result)
                rowCount = result.rowCount
                page = result.page
                finish();
            })
        },
    ], function (errs, results) {
        var data = {
            "draw": page,
            "recordsTotal": rowCount,
            "recordsFiltered": rowCount,
            "data": acct
        }
        res.json(data)
        // res.render('./member/account/ejs/mAcctRowData.ejs', {
        //     acct: acct
        // });
    });
});
router.get('/mAcctCreate', function (req, res) {
    var userInfo = req.session.user;
    var role = [];

    async.parallel([
        function (finish) {
            libMember.getAllRole(function (result) {
                if (result.length != 0) {
                    role = result;
                }
                finish();
            })
        }
    ], function (errs, results) {
        res.render('./member/account/ejs/mAcctModalCreate.ejs', {
            role: role
        });
    });
});

router.get('/mAcctModify', function (req, res) {
    var userInfo = req.session.user;
    var email = req.query.email;
    var role = "", acct = "";

    async.parallel([
        function (finish) {
            libMember.getAllRole(function (result) {
                if (result.length != 0) {
                    role = result;
                }
                finish();
            })
        },
        function (finish) {
            libMember.getAcct(email, function (result) {
                if (result.length != 0) {
                    acct = result[0];
                }
                // console.log(result)
                finish();
            })
        },
    ], function (errs, results) {
        res.render('./member/account/ejs/mAcctModalEdit.ejs', {
            acct: acct,
            role: role
        });
    });
});

//CREATE & EDIT
router.post('/mAcctModify', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    // var params = url.parse(req.url, true);
    console.log(params);
    var acct = params;
    var error = { msg: "" }

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['8-3']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (acct.head == 'create') {
            if (!rolePermit['8-3'].CREATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        } else if (acct.head == 'edit') {
            if (!rolePermit['8-3'].UPDATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        }
    }

    async.series([
        function (next) {
            libMember.setAcct(acct, function (result) {
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
router.post('/mAcctDelete', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    var acctEmailArray = params;
    var error = { msg: "" }
    console.log(acctEmailArray);

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['8-3']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit['8-3'].DELETE) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }

    async.series([
        function (next) {
            libMember.deleteAcct(acctEmailArray, function (result) {
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

router.get('/mAcctPersonnel', function (req, res) {
    var acctPersonnelList = [];
    var roleID = req.query.roleID;
    if (roleID == '5' || roleID == '6') {
        async.parallel([
            function (finish) {
                libPersonnel.getAllVendorID(
                    function (result) {
                        if (result.length != 0) {
                            acctPersonnelList = result;
                        }
                        finish();
                    })
            }
        ], function (errs, results) {
            console.log(acctPersonnelList)
            res.json(acctPersonnelList);
        });
    }else{
        async.parallel([
            function (finish) {
                libPersonnel.getAllEmployeeID(
                    function (result) {
                        if (result.length != 0) {
                            acctPersonnelList = result;
                        }
                        finish();
                    })
            }
        ], function (errs, results) {
            console.log(acctPersonnelList)
            res.json(acctPersonnelList);
        });
    }
})
module.exports = router;
