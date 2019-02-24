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

router.get('/permission', function (req, res) {
    var userInfo = req.session.user;
    var permission = "",
        getAll = 0;
    var role = [],
        modules = [];

    var rolePermit = utility.getPermissonBit(userInfo.roleID);

    console.log(rolePermit)
    if (!rolePermit['8-1']) {
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
        },
        function (finish) {
            libMember.getAllModules(function (result) {
                if (result.length) {
                    modules = result;
                }
                finish();
            });
        },
    ], function (errs, results) {
        res.render('./member/permission/static/mPermission.html', {
            target: 'mPermission',
            menus: menus,
            userInfo: userInfo,
            sidebar: sidebar,
            permission: rolePermit['8-1'],
            role: role,
            modules: modules,
        });
    });


    // res.render('./member/permission/static/mPermission.html', {
    //     target: 'mPermission',
    //     menus: menus,
    //     userInfo: userInfo,
    //     sidebar: sidebar,
    //     permission: rolePermit['8-1']
    // });

    // async.parallel([
    //     function(finish){
    //         libMember.getRolePermission({id:getAll},function (result) {
    //             if(result.length != 0){
    //                 // for (var i = 0; i < result.length; i++) {
    //                 //     utility.splitPermission(result[i]);
    //                 // }
    //                 permission = result;
    //             }
    //             finish();
    //         })
    //     },
    // ], function(errs, results){
    //     res.render('./member/permission/static/mPermission.html', {
    //         target: 'mPermission',
    //         menus: menus,
    //         userInfo: userInfo,
    //         sidebar: sidebar,
    //         permit: permission,
    //         permission: rolePermit['8-1']
    //     });
    // });
});
router.get('/mPermRoleData', function (req, res) {
    var userInfo = req.session.user;
    var permission = "";
    var rowCount = 0;
    var page = 1;
    // console.log(req.query.order.column, req.query.order.dir)

    async.parallel([
        function (finish) {
            // console.log(req.query.search)
            // console.log(req.query.start)
            // console.log(req.query.length)
            libMember.getRolePermissionByPage({
                role: req.query.roleSelect,
                module: req.query.moduleSelect,
                permission: req.query.txtSearchPermission,
                // page: parseInt(req.query.start) / parseInt(req.query.length) + 1,
                offset: parseInt(req.query.start),
                limit: req.query.length,
                order: req.query.order || []
                // page: 10,
                // pageSize: 10
            }, function (result) {
                // console.log(result)
                // var json = result.toJSON();
                if (result.data.length != 0) {
                    permission = result.data;
                }
                // console.log('permission')
                // console.log(result)
                rowCount = result.rowCount
                page = result.page
                finish();
            })
        },
    ], function (errs, results) {
        // console.log(permission)
        var data = {
            "draw": page,
            "recordsTotal": rowCount,
            "recordsFiltered": rowCount,
            "data": permission
        }
        res.json(data)
        // res.render('./member/permission/ejs/mPermRowData.ejs', {
        //     permit: permission,
        // });
    });
});
router.get('/mPermissionCreate', function (req, res) {
    var userInfo = req.session.user;
    var role = [],
        modules = [];

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
            libMember.getAllModules(function (result) {
                if (result.length) {
                    modules = result;
                }
                finish();
            });
        },
    ], function (errs, results) {
        res.render('./member/permission/ejs/mPermModalCreate.ejs', {
            role: role,
            modules: modules
        });
    });


    // var response = function () {
    //     res.json({
    //         role: role,
    //         modules: modules,
    //     });
    // }
});

router.get('/mPermissionModify', function (req, res) {
    var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var permID = params.query.id;
    var permission = "";
    async.parallel([
        function (finish) {
            libMember.getRolePermission({
                id: permID
            }, function (result) {
                if (result.length != 0) {
                    permission = result[0];
                }
                finish();
            })
        },
    ], function (errs, results) {
        res.render('./member/permission/ejs/mPermModalEdit.ejs', {
            permit: permission
        });
    });
});


router.post('/mPermissionModify', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    // var params = url.parse(req.url, true);
    var permit = params;
    var error = {
        msg: ""
    }

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['8-1']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (permit.head == 'create') {
            if (!rolePermit['8-1'].CREATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        } else if (permit.head == 'edit') {
            if (!rolePermit['8-1'].UPDATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        }
    }

    async.series([
        function (next) {
            libMember.setRolePermission(permit, function (result) {
                if (result.length != 0) {
                    error.msg = result[0];
                }
                utility.updatePermission();
                next();
            });
        }
    ], function (errs, results) {
        res.json(error);
    });
});
router.post('/mPermissionDel', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    var permitIDArray = params;
    var error = {
        msg: ""
    }
    console.log(permitIDArray);

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit['8-1']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit['8-1'].DELETE) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }

    async.series([
        function (next) {
            libMember.deleteRolePermission(permitIDArray, function (result) {
                if (result.length != 0) {
                    error.msg += result[0] + "\r\n";
                }
                next();
            });
        }
    ], function (errs, results) {
        utility.updatePermission();
        res.json(error);
    });
});


module.exports = router;