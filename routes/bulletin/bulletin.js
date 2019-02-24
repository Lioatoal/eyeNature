// Require Header file
var menus = require('../../config/menus');
var sidebar = require('../../config/sidebar');
// Require Modules
var express = require('express');
var url = require('url');
var async = require('async');
var dateformat = require('dateformat');
const uuidv4 = require('uuid/v4');
//Require Libs
var libBulletin = require("../../libs/libBulletin");
var libMember = require("../../libs/libMember");
var utility = require("../../libs/utility");

var router = express.Router();

router.get('/bulletin', function(req, res) {
    
    var userInfo = req.session.user;
    var modules = [];

    var permIndex = ['1-2','1-3','1-4','1-5','1-6'];
    var bltnCREATE = false;
    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    
    for (var i in permIndex) {
        var index = permIndex[i];
        bltnCREATE = bltnCREATE || rolePermit[index].CREATE;
    }

    async.parallel([
        function(finish){
            libMember.getAllModules(function (result) {
                if (result.length) {
                    modules = result;
                }
                finish();
            });
        },
    ], function(errs, results){
        res.render('./bulletin/static/bulletin.html', {
            target: 'bulletin',
            menus: menus,
            userInfo: userInfo,
            sidebar: sidebar,
            bltnCREATE: bltnCREATE,
            modules: modules,
            permission: rolePermit,
        });
    });
});

router.get('/bltnRowData', function (req, res) {
    var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var selectData = params.query;
    var bulletinRowData = [], totalPage = 0;
    //get this role's all permission
    var rolePermit = utility.getPermissonBit(userInfo.roleID);

    async.series([
        function(next){
            libBulletin.getBulletinPageData(selectData, userInfo.email, rolePermit, function (result) {
                if (result.length != 0) {
                    totalPage = Math.ceil(result/10);
                }
                next();
            })
        },
        function (next){
            libBulletin.getBulletinRowData(selectData, userInfo.email, rolePermit, function (result) {
                if (result.length != 0) {
                    for (var i = 0; i < result.length; i++) {
                        utility.getDeadlineCount(result[i]);
                        result[i].postdate = dateformat(result[i].postdate, "yyyy-mm-dd H:MM");
                        utility.getContentHead(result[i]);
                        result[i].permission = rolePermit[result[i].module_id];
                    }
                }
                bulletinRowData = result;
                next();
            });
        },
    ], function(errs, results){
        res.render('./bulletin/ejs/bltnRowData.ejs', {
            target: 'bulletinRow',
            rowData: bulletinRowData,
            totalPage: totalPage,
            userInfo: userInfo
        });
    });
});

router.get('/bltnCreate', function (req, res) {
    var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var bltnModules = [], role = [];
    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    
    async.waterfall([
        function (next) {
            libMember.getAllModules(function (result) {
                if (result.length) {
                    var modules = [];
                    for (var i = 0; i < result.length; i++) {
                        modules[result[i].id] = result[i].m_display;
                    }
                    for (var moduleID in rolePermit) {
                        if (moduleID[0] != '1') {
                            break;
                        }
                        if (rolePermit[moduleID].CREATE) {
                            bltnModules.push({
                                module_id: moduleID,
                                m_display: modules[moduleID]
                            })
                        }
                    }
                }
                next();
            });
        },
        function (next) {
            libMember.getAllRole(function (result) {
                if (result.length) {
                    role = result;
                }
                next();
            });
        }
    ],function () {
        res.render('./bulletin/ejs/bltnModalCreate.ejs', {
            bltnModules: bltnModules,
            role: role
        });
    })
});

router.get('/bulletinModify', function (req, res) {
    var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var bulletinID = params.query.id;
    var bulletinEditData = [], bltnModules = [];

    var rolePermit = utility.getPermissonBit(userInfo.roleID);

    async.parallel([
        function (finish) {
            libMember.getAllModules(function (result) {
                if (result.length) {
                    var modules = [];
                    for (var i = 0; i < result.length; i++) {
                        modules[result[i].id] = result[i].m_display;
                    }
                    for (var moduleID in rolePermit) {
                        if (moduleID[0] != '1') {
                            break;
                        }
                        if((rolePermit[moduleID].UPDATE)){
                            bltnModules.push({
                                module_id: moduleID,
                                m_display: modules[moduleID]
                            })
                        }
                    }
                }
                finish();
            });
        },
        function (finish) {
            libBulletin.getBulletinEditData(bulletinID, function (result) {
                if (result.length != 0) {
                    result[0].deadline = dateformat(result[0].deadline, "yyyy-mm-dd H");
                    bulletinEditData = result[0];
                }
                finish();
            });
        }
    ],function () {
        res.render('./bulletin/ejs/bltnModalEdit.ejs', {
            bltnEdit: bulletinEditData,
            bltnModules: bltnModules
        });
    })
});

router.get('/bltnViewDelete', function (req, res) {
    var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var bulletinID = params.query.bltnID;
    var bulletinViewData = [];

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    

    async.parallel([
        function (finish) {
            libBulletin.getBulletinViewData(bulletinID, function (result) {
                if (result.length != 0) {
                    // permission = permTable[result[0].module_id];
                    bulletinViewData = result[0];
                    bulletinViewData.postdate = dateformat(result[0].postdate, "yyyy-mm-dd H:MM");
                }
                finish();
            });
        },
    ], function (errs, result) {

        if (!rolePermit[bulletinViewData.module_id]) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        } else {
            if (!rolePermit[bulletinViewData.module_id].DELETE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        }

        res.render('./bulletin/ejs/bltnModalDelete.ejs', {
            viewData: bulletinViewData,
        });
    });
})

router.get('/bulletinView', function (req, res) {
    var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var bulletinID = params.query.bltnID;
    var viewData = [], viewComment = [];
    var memberData = [], looked = [];

    // var rolePermit = utility.getPermissonBit(userInfo[user].roleID);

    async.parallel([
        function (finish) {
            libBulletin.getBulletinViewData(bulletinID, function (result) {
                if (result.length != 0) {
                    viewData = result[0];
                    viewData.postdate = dateformat(result[0].postdate, "yyyy-mm-dd H:MM");
                }
                finish();
            });
        },
        function (finish) {
            libBulletin.getBulletinViewComment(bulletinID, function (result) {
                if (result.length != 0) {
                    for (var i = 0; i < result.length; i++) {
                        result[i].postdate = dateformat(result[i].postdate, "yyyy-mm-dd H:MM");
                    }
                    viewComment = result;
                }
                finish();
            });
        },
    ], function (errs, result) {
        res.render('./bulletin/ejs/bltnModalView.ejs', {
            userInfo: userInfo,
            viewData: viewData,
            viewComment: viewComment
        });
    });
})

router.get('/bulletinView/comment', function (req, res) {
    var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var bulletinID = params.query.bltnID;
    var viewComment = [];

    // var rolePermit = utility.getPermissonBit(userInfo[user].roleID);

    async.parallel([
        function (finish) {
            libBulletin.getBulletinViewComment(bulletinID, function (result) {
                if (result.length != 0) {
                    for (var i = 0; i < result.length; i++) {
                        result[i].postdate = dateformat(result[i].postdate, "yyyy-mm-dd H:MM");
                    }
                    viewComment = result;
                }
                finish();
            });
        },
    ], function (errs, result) {
        res.render('./bulletin/ejs/bltnViewSubFunc/comment.ejs', {
            userInfo: userInfo,
            viewComment: viewComment,
        });
    });
})

router.get('/bulletinView/willlook', function (req, res) {
    var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var moduleID = params.query.moduleID;
    var acct = [], roleID = [], role = [], willlook = {};
    var queue = [];

    if(params.query.head == "edit"){
        var bltnID = params.query.bltnID;
        queue.push(
            function (next) {
                libBulletin.getBltnWillLook(bltnID, function (result) {
                    if (result.length) {
                        for (const i in result) {
                            willlook[result[i].member_email] = true;
                        }
                    }
                    next();
                });
            }
        );
    }

    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    
    async.waterfall([
        function (next) {
            libMember.getPermissionRoleByModule(moduleID, function (result) {
                if (result.length) {
                    for (const i in result) {
                        roleID.push(result[i].role_id);
                    }
                }
                // console.log(roleID);
                next('', roleID);
            });
        },
        function (roleID, next) {
            libMember.getAcctByRole(roleID, function (result) {
                if (result.length != 0) {                    
                    acct = result;
                }
                next('', roleID);
            });
        },
        function (roleID, next) {
            libMember.getRole(roleID, function (result) {
                if (result.length != 0) {                    
                    role = result;
                    // console.log(role)
                }
                next();
            });
        },
    ].concat(queue), function () {
        console.log(willlook);
        res.render('./bulletin/ejs/bltnViewSubFunc/willlook.ejs', {
            acct: acct,
            roleID: roleID,
            role: role,
            willlook: willlook
        });
    })
})

router.get('/bulletinView/looked', function (req, res) {
    // var userInfo = req.session.user;
    var params = url.parse(req.url, true);
    var bltnID = params.query.bltnID;
    var looked = [], willlook = [];

    async.series([
        function (next) {
            libBulletin.getBltnWillLook(bltnID, function (result) {
                if (result.length != 0) {
                    willlook = result;
                }
                next();
            });
        },
        function (next) {
            libBulletin.getBltnLooked(bltnID, function (result) {
                if (result.length != 0) {
                    looked = result;
                }
                next();
            })
        }
    ], function (errs, result) {
        console.log(looked);
        res.render('./bulletin/ejs/bltnViewSubFunc/looked.ejs', {
            willlook: willlook,
            looked: looked
        });
    });
})


router.post('/bulletinModify', function (req, res) {
    var userInfo = req.session.user;
    var index = 0, queue = [];
    var head = req.body.head;
    var bltnData = JSON.parse(req.body.bltnData);
    var bltnWilllook = JSON.parse(req.body.bltnWilllook);
    if(head == 'create'){
        var bltnID = uuidv4();
    } else if(head == 'edit'){
        var bltnID = bltnData.id;
    }
    var error = {msg:""};
    
    var rolePermit = utility.getPermissonBit(userInfo.roleID);
    if (!rolePermit[bltnData.module_id]) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!rolePermit[bltnData.module_id].CREATE || !rolePermit[bltnData.module_id].UPDATE) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }
    
    //deletetBltnWilllook
    if(head == 'edit'){
        queue.push(
            function (index ,next) {
                libBulletin.deletetBltnWilllook(bltnID, function (result) {
                    if (result.length != 0) {
                        error.msg += result[0];
                    }
                    next('', index);
                });
            }
        )
    }
    //setBltnWilllook
    for (var i = 0; i < bltnWilllook.length; i++) {
        queue.push(
            function (index ,next) {
                bltnWilllook[index].bltn_id = bltnID;
                libBulletin.setBltnWilllook(bltnWilllook[index], function (result) {
                    if (result.length != 0) {
                        error.msg += result[0];
                    }
                    index++;
                    next('', index);
                })
            }
        );
    }
    async.waterfall([
        function(next){
            bltnData.id = bltnID;
            libBulletin.setBulletin(bltnData, userInfo.email, head, function (result) {
                console.log(result);
                if (result.length != 0) {
                    error.msg += result[0];
                }
                var index = 0;
                next('', index);
            })
        }
    ].concat(queue), function(errs, results){
        res.json(error);
    });
});

router.post('/bulletinDelete', function (req, res) {
    var params = JSON.parse(req.body.postData);
    var deleteID = params.delete;
    console.log(deleteID);
    
    var error = {msg:""};
    
    async.series([
        function(next){
            libBulletin.deleteBulletinData(deleteID, function (result) {
                if (result.length != 0) {
                    error.msg += result[0];
                }
                next();
            })
        }
    ], function(errs, results){
        res.json(error);
    });
});

router.post('/bulletinView/willlook', function (req, res) {
    // var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    var lookedData = params;
    var error = {msg:""};

    async.parallel([
        function(next){
            if (lookedTable[lookedData.user]) {
                error.msg = "You already looked!";
                next();
            }
            libBulletin.setBltnViewWilllook(lookedData, function (result) {
                if (result.length != 0) {
                    error.msg = result[0];
                }
                next();
            })
        }
    ], function(errs, results){
        res.json(error);
    });
})

router.post('/bulletinView/looked', function (req, res) {
    // var userInfo = req.session.user;
    var lookedData = JSON.parse(req.body.postData);
    var error = {msg:""};

    async.waterfall([
        function (next) {
            var lookedTable = {};
            libBulletin.getBltnLooked(lookedData.bltnID, function (result) {
                for (let i = 0; i < result.length; i++) {
                    lookedTable[result[i].member_email] = result[i].imgr;
                }
                next('', lookedTable);
            })
        },
        function(lookedTable, next){
            if (lookedTable[lookedData.user]) {
                error.msg = "你已經看過了!";
                next();
            } else {
                libBulletin.setBulletinViewLooked(lookedData, function (result) {
                    if (result.length != 0) {
                        error.msg = result[0];
                    }
                    next();
                })
            }
        }
    ], function(errs, results){
        res.json(error);
    });
})

router.post('/bulletinView/commentModify', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    console.log(params);
    var comment = params;
    var error = {msg:""};

    if (comment.onwer && comment.onwer != userInfo.email) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    }

    async.series([
        function(next){
            libBulletin.setBulletinViewComment(comment, userInfo.email, function (result) {
                if (result.length != 0) {
                    error.msg = result[0];
                }
                next();
            })
        }
    ], function(errs, results){
        res.json(error);
    });
})

router.post('/bulletinView/commentDel', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    var commentID = params.commentID;
    var commentOwner = params.owner;
    var error = {msg:""};
    if (commentOwner != userInfo.email) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    }

    async.series([
        function(next){
            libBulletin.deleteBulletinViewComment(commentID, function (result) {
                if (result.length != 0) {
                    error.msg = result[0];
                }
                next();
            })
        }
    ], function(errs, results){
        res.json(error);
    });
})

module.exports = router;
