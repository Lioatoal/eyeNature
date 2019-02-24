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
var libMember = require("../../libs/libMember");

var router = express.Router();

router.get('/role', function (req, res) {
    var userInfo = req.session.user;
    var role = "",
        getAll = 0,
        permTable = {};

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    console.log(rolePermit)
    if (!rolePermit['8-2']) {
        return res.redirect('/logout');
    }

    res.render('./member/role/static/mRole.html', {
        target: 'mRole',
        menus: menus,
        userInfo: userInfo,
        sidebar: sidebar,
        // role:role,
        permission: rolePermit['8-2']
    });

    // async.parallel([
    //     function(finish){
    //         libMember.getAllRole(function (result) {
    //             if(result.length != 0){
    //                 role = result;
    //             }
    //             finish();
    //         })
    //     },
    // ], function(errs, results){
    //     res.render('./member/role/static/mRole.html', {
    //         target: 'mRole',
    //         menus: menus,
    //         userInfo: userInfo,
    //         sidebar: sidebar,
    //         role:role,
    //         permission: rolePermit['8-2']
    //     });
    // });
});

//如果資料量太大 一定要用額外get的方式存取EJS 否則長HTML會起笑 
router.get('/mRoleRowData', function (req, res) {
    var userInfo = req.session.user;
    var role = "";
    var rowCount = 0;
    var page = 1;

    async.parallel([
        function (finish) {
            libMember.getAllRoleByPage({
                offset: parseInt(req.query.start),
                limit: req.query.length,
                order: req.query.order || []
            }, function (result) {
                if (result.data.length != 0) {
                    role = result.data;
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
            "data": role
        }
        res.json(data)
        // res.render('./member/role/ejs/mRoleRowData.ejs', {
        //     role:role
        // });
    });
});

router.get('/mRoleModify', function (req, res) {
    var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var roleID = [params.query.id];
    var role = "";
    async.parallel([
        function (finish) {
            libMember.getRole(roleID, function (result) {
                if (result.length != 0) {
                    role = result[0];
                }
                finish();
            })
        },
    ], function (errs, results) {
        console.log(role)
        res.render('./member/role/ejs/mRoleModalEdit.ejs', {
            role: role
        });
    });
});

//CREATE & EDIT
router.post('/mRoleModify', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    // var params = url.parse(req.url, true);
    var role = params;
    var error = {
        msg: ""
    }

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['8-2']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (role.head == 'create') {
            if (!rolePermit['8-2'].CREATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        } else if (role.head == 'edit') {
            if (!rolePermit['8-2'].UPDATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        }
    }

    async.waterfall([
        function (next) {
            libMember.getAllRole(function (result) {
                next();
            });
        },
        function (next) {
            libMember.setRole(role, function (result) {
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
router.post('/mRoleDelete', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    var roleIDArray = params;
    var error = {
        msg: ""
    };
    console.log(roleIDArray);

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['8-2']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit['8-2'].DELETE) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }

    async.series([
        function (next) {
            libMember.deleteRole(roleIDArray, function (result) {
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

module.exports = router;