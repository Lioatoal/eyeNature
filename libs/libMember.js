var model = require('../models/dbMember.js');
var utility = require("../libs/utility");
var bcrypt = require('bcryptjs');
var dateFormat = require('dateformat');

var roleDB = new model.role();
var modulesDB = new model.modules();
var permissionDB = new model.permission();
var acctDB = new model.member();
var roleTable = [];

function member() {}

/*
    Get Data From DB
*/
//Role
member.prototype.getAllRole = function (callback) {
    new model.role()
        .orderBy('id')
        .fetchAll({
            columns: ['id', 'r_name', 'r_descr']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            roleTable = result;
            callback(result);
        })
        .catch(function (error) {
            console.log("getAllRole error log :");
            console.log(error.message);
            callback([]);
        })
}
member.prototype.getAllRoleByPage = function (role, callback) {
    new model.role()
        .query(function (qb) {
            //order by
            role.order.forEach(element => {
                // var orderCol = 'role.r_name'
                var orderDir = element.dir || 'ASC'
                if (element.column === '1') {
                    // orderCol = 'role.r_name';
                    qb.orderBy('r_name', orderDir);
                } else if (element.column === '2') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('r_descr', orderDir);
                }
            });
        })
        // .orderBy('id')
        .fetchPage({
            limit: role.limit, // Defaults to 10 if not specified
            offset: role.offset, // Defaults to 1 if not specified
            columns: ['id', 'r_name', 'r_descr']
        })
        .then(function (dbData) {
            // console.log(dbData)
            var result = dbData.toJSON();
            callback({
                'data': result,
                'rowCount': dbData.pagination.rowCount,
                'page': dbData.pagination.page
            });
        })
        .catch(function (error) {
            console.log("getAllRoleByPage error log :");
            console.log(error.message);
            callback([]);
        });
}
member.prototype.getRole = function (roleID, callback) {
    roleDB
        .query(function (qb) {
            qb.whereIn("id", roleID)
        })
        .fetchAll({
            columns: ['id', 'r_name', 'r_descr']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getRole error log :");
            console.log(error.message);
            callback([]);
        })
}
//Account
member.prototype.getAllAcct = function (callback) {
    acctDB
        .query(function (qb) {
            qb.innerJoin('role', 'role_id', 'role.id');
        })
        .fetchAll({
            columns: ['email', 'name', 'role_id', 'role.r_descr', 'enable', 'remark', 'imgr']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getAllAcct error log :");
            console.log(error.message);
            callback([]);
        })
}
member.prototype.getAcct = function (email, callback) {
    acctDB
        .query(function (qb) {
            qb.where({
                email: email
            });
            qb.innerJoin('role', 'role_id', 'role.id');
        })
        .fetchAll({
            columns: ['email', 'name', 'role_id', 'role.r_descr', 'enable', 'remark', 'imgr','related_id']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getAllAcct error log :");
            console.log(error.message);
            callback([]);
        })
}
member.prototype.getAcctByPage = function (acct, callback) {
    new model.member()
        .query(function (qb) {
            qb.innerJoin('role', 'role_id', 'role.id');
            
            if (acct.email) {
                qb.andWhere('email', 'like', `%${acct.email}%` );
            }
            if (acct.name) {
                qb.andWhere('name', 'like', `%${acct.name}%`);
            }
            if (acct.roleID) {
                qb.andWhere('role_id','in', acct.roleID);
            }
            if (acct.enable) {
                qb.andWhere('enable', 'in', acct.enable);
            }
            //order by
            acct.order.forEach(element => {
                // var orderCol = 'role.r_name'
                var orderDir = element.dir || 'ASC'
                if (element.column === '1') {
                    // orderCol = 'role.r_name';
                    qb.orderBy('email', orderDir);
                } else if (element.column === '2') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('name', orderDir);
                } else if (element.column === '3') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('role.r_descr', orderDir);
                }
            });
        })
        .fetchPage({
            limit: acct.limit, // Defaults to 10 if not specified
            offset: acct.offset, // Defaults to 1 if not specified
            columns: ['email', 'name', 'role_id', 'role.r_descr', 'enable', 'remark', 'imgr']
        })
        .then(function (dbData) {
            var result = dbData.toJSON();
            callback({
                'data': result,
                'rowCount': dbData.pagination.rowCount,
                'page': dbData.pagination.page
            });
        })
        .catch(function (error) {
            console.log("getAcctByPage error log :");
            console.log(error.message);
            callback([]);
        })
}
member.prototype.getAcctByRole = function (roleID, callback) {
    new model.member()
        .query(function (qb) {
            qb.whereIn('role_id', roleID);
        })
        .fetchAll({
            columns: ['email', 'name', 'enable', 'imgr', 'role_id']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getAcctByRole error log :");
            console.log(error.message);
            callback([]);
        })
}


//Modules
member.prototype.getAllModules = function (callback) {
    modulesDB
        .query(function (qb) {

        })
        .fetchAll({
            columns: ['id', 'm_name', 'm_descr', 'm_display']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getAllModules error log :");
            console.log(error.message);
            callback([]);
        });
}
//Permission
member.prototype.getRolePermission = function (permit, callback) {
    permissionDB
        .query(function (qb) {
            qb.innerJoin('role', 'role_id', 'role.id');
            qb.innerJoin('module', 'module_id', 'module.id');
            qb.orderBy('role_id', 'ASC');
            if (permit.id > 0) {
                qb.andWhere('permission.id', permit.id);
                qb.orderBy('permission.id', 'ASC');
            }
        })
        .orderBy('permission.id')
        .fetchAll({
            columns: ['permission.id', 'role_id', 'module_id',
                'permQUERY', 'permCREATE', 'permUPDATE',
                'permDELETE', 'permIMPORT', 'permEXPORT',
                'role.r_name', 'role.r_descr', 'module.m_name', 'module.m_descr'
            ]
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getRolePermission error log :");
            console.log(error.message);
            callback([]);
        });
}
member.prototype.getRolePermissionToExcel = function (permit, callback) {
    permissionDB
        .query(function (qb) {
            qb.innerJoin('role', 'role_id', 'role.id');
            qb.innerJoin('module', 'module_id', 'module.id');
            qb.orderBy('role_id', 'ASC');
        })
        .orderBy('permission.id')
        .fetchAll({
            columns: [
                'permQUERY', 'permCREATE', 'permUPDATE',
                'permDELETE', 'permIMPORT', 'permEXPORT',
                'role.r_descr', 'module.m_descr'
            ]
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getRolePermission error log :");
            console.log(error.message);
            callback([]);
        });
}
member.prototype.getRolePermissionByPage = function (permit, callback) {
    new model.permission()
        .query(function (qb) {
            qb.innerJoin('role', 'role_id', 'role.id');
            qb.innerJoin('module', 'module_id', 'module.id');

            if (permit.role) {
                qb.andWhere('role_id', 'in', permit.role)
            }
            if (permit.module) {
                qb.andWhere('module_id', 'in', permit.module)
            }
            if (permit.permission) {
                if (permit.permission.indexOf("QUERY") !== -1) {
                    qb.andWhere('permQUERY', '=', '1')
                }
                if (permit.permission.indexOf("CREATE") !== -1) {
                    qb.andWhere('permCREATE', '=', '1')
                }
                if (permit.permission.indexOf("UPDATE") !== -1) {
                    qb.andWhere('permUPDATE', '=', '1')
                }
                if (permit.permission.indexOf("DELETE") !== -1) {
                    qb.andWhere('permDELETE', '=', '1')
                }
                if (permit.permission.indexOf("EXPORT") !== -1) {
                    qb.andWhere('permEXPORT', '=', '1')
                }
                if (permit.permission.indexOf("IMPORT") !== -1) {
                    qb.andWhere('permIMPORT', '=', '1')
                }
            }

            //order by
            permit.order.forEach(element => {
                // var orderCol = 'role.r_name'
                var orderDir = element.dir || 'ASC'
                if (element.column === '1') {
                    // orderCol = 'role.r_name';
                    qb.orderBy('role.r_descr', orderDir);
                } else if (element.column === '2') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('module.m_descr', orderDir);
                }
            });
            
        })
        .fetchPage({
            limit: permit.limit, // Defaults to 10 if not specified
            offset: permit.offset, // Defaults to 1 if not specified
            columns: ['permission.id', 'role_id', 'module_id',
                'permQUERY', 'permCREATE', 'permUPDATE',
                'permDELETE', 'permIMPORT', 'permEXPORT',
                'role.r_name', 'role.r_descr', 'module.m_name', 'module.m_descr'
            ],
        })
        .then(function (dbData) {
            // console.log(dbData)
            var result = dbData.toJSON();
            callback({
                'data': result,
                'rowCount': dbData.pagination.rowCount,
                'page': dbData.pagination.page
            });
        })
        .catch(function (error) {
            console.log("getRolePermissionByPage error log :");
            console.log(error.message);
            callback([]);
        });
}
member.prototype.getPermissionRoleByModule = function (moduleID, callback) {
    permissionDB
        .query(function (qb) {
            qb.where('permission.module_id', moduleID);
        })
        .fetchAll({
            columns: ['role_id']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getPermissionByModule error log :");
            console.log(error.message);
            callback([]);
        });
}

/*
    Permission
*/
//Permission Create & Edit
member.prototype.setRolePermission = function (permit, callback) {
    var data, setMethod = 'insert';
    if (permit.head == 'edit') {
        setMethod = 'update';
        data = {
            id: permit.txtEditRoleID,
            permCREATE: permit.txtEditCREATE,
            permUPDATE: permit.txtEditUPDATE,
            permDELETE: permit.txtEditDELETE,
            permIMPORT: permit.txtEditIMPORT,
            permEXPORT: permit.txtEditEXPORT
        }
    } else if (permit.head == 'create') {
        data = {
            role_id: permit.txtCreateRoleID,
            module_id: permit.txtCreateModuleID,
            permQUERY: 1,
            permCREATE: permit.txtCreateCREATE,
            permUPDATE: permit.txtCreateUPDATE,
            permDELETE: permit.txtCreateDELETE,
            permIMPORT: permit.txtCreateIMPORT,
            permEXPORT: permit.txtCreateIMPORT,
        }
        var diff = utility.checkPermissionDiff(data.role_id, data.module_id);
        if (diff) {
            console.log("This set of role permission is existed");
            var errorlog = "This permission is existed!" + "role:" + data.role_id + "-module:" + data.module_id
            callback([errorlog]);
            return;
        }
    }

    new model.permission()
        .query(function (qb) {
            if (setMethod == 'update') {
                qb.where('id', data.id);
            }
        })
        .save(data, {
            method: setMethod
        })
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("setRolePermission error log :");
            console.log(error.message);
            callback(["set Role Permission fail!"]);
        });
}
//Permission Delete
member.prototype.deleteRolePermission = function (permitID, callback) {
    console.log("permitID");
    console.log(permitID);
    new model.permission()
        .query(function (qb) {
            qb.whereIn('id', permitID);
        })
        .destroy()
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("deleteRolePermission query error log :");
            console.log(error.message);
            callback(["query Role Permission delete info fail!"]);
        })
}

/*
    Role
*/
//Role Create & EDIT
member.prototype.setRole = function (role, callback) {
    var data, setMethod = 'insert';
    if (role.head == 'edit') {
        setMethod = 'update';
        console.log('lib' + role.txtEditID);
        data = {
            id: role.txtEditID,
            r_name: role.txtEditRoleName,
            r_descr: role.txtEditRoleDescr
        }
    } else if (role.head == 'create') {
        data = {
            r_name: role.txtRoleName,
            r_descr: role.txtRoleDescr
        }
        // console.log("data: "+ data.r_name + "-" + data.r_descr);

        var diff = checkRoleDiff(data.r_name);
        if (diff) {
            console.log("This set of role is existed");
            var errLog = "This Role is existed! name:" + data.r_name + "-r_descr:" + data.r_descr;
            callback([errLog]);
            return;
        }

    }
    new model.role()
        .query(function (qb) {
            if (setMethod == 'update') {
                qb.where('id', data.id);
            }
        })
        .save(data, {
            method: setMethod
        })
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("setRole error log :");
            console.log(error.message);
            callback(["set Role fail!"]);
        });
}
//Role Delete
member.prototype.deleteRole = function (roleID, callback) {
    console.log("roleID");
    console.log(roleID);
    new model.role()
        .query(function (qb) {
            qb.whereIn('id', roleID);
        })
        .destroy()
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("deleteRole query error log :");
            console.log(error.message);
            callback(["query Role delete info fail!"]);
        })
}
//Role Check Diff
function checkRoleDiff(roleName) {
    for (var i in roleTable) {
        if (roleTable[i].r_name == roleName) {
            return true;
        }
    }
    return false;
}
/*
    Account
*/

//account Create & EDIT
member.prototype.setAcct = function (acct, callback) {
    var data, hashPwd, setMethod = 'insert';
    var currtDate = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
    // console.log(currtDate)
    var salt = bcrypt.genSaltSync(10);

    // console.log("hashPWD:" + hashPwd);
    if (acct.head == 'edit') {
        setMethod = 'update';
        // console.log('lib' + acct.txtEditAcctEmail);
        if (acct.txtEditAcctPwd != "")
            hashPwd = bcrypt.hashSync(acct.txtEditAcctPwd, salt)
        //hashPwd 在undefined的情況下 passcode不會帶值更新密碼
        data = {
            email: acct.txtEditAcctEmail,
            name: acct.txtEditAcctName,
            remark: acct.txtEditAcctRemark,
            passcode: hashPwd,
            role_id: acct.txtEditAcctRole,
            enable: acct.txtEditAcctActive,
            related_id: acct.txtEditAcctPersonnel
        }
    } else if (acct.head == 'create') {
        hashPwd = bcrypt.hashSync(acct.txtCreateAcctPwd, salt);
        data = {
            email: acct.txtCreateAcctEmail,
            name: acct.txtCreateAcctName,
            passcode: hashPwd,
            remark: acct.txtCreateAcctRemark,
            role_id: acct.txtCreateAcctRole,
            enable: acct.txtCreateAcctActive,
            registereddate: currtDate,
            related_id: acct.txtCreateAcctPersonnel
        }
    }
    // console.log(data.passcode);
    new model.member()
        .query(function (qb) {
            if (setMethod == 'update') {
                qb.where('email', data.email);
            }
        })
        .save(data, {
            method: setMethod
        })
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("Acct error log :");
            console.log(error.message);
            callback(["set Acct fail!"]);
        });
}
//Account Delete
member.prototype.deleteAcct = function (acctEmail, callback) {
    console.log("acctEmail");
    console.log(acctEmail);
    new model.member()
        .query(function (qb) {
            qb.whereIn('email', acctEmail);
        })
        .destroy()
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("deleteAcct query error log :");
            console.log(error.message);
            callback(["query Acct delete info fail!"]);
        })
}

module.exports = new member();