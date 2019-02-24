var fs = require('fs');
var multer  = require('multer');

var model = require('../models/dbMember');
var permissionDB = new model.permission();
var permissionTable = [];

function utility() {}

//bulletin subfunctions
utility.prototype.getContentHead = function (data) {
    var string = "";
    if (data.content.match('<p>')) {
        var head = data.content.match('<p>').index + 3;
        var end = data.content.match('</').index;
        if ((end - head)>20) {
            string = data.content.substring(head, head+20);
        } else {
            string = data.content.substring(head, end);
        }
        string += "...";
    }
    data.content = string;
}
utility.prototype.getDeadlineCount = function (data) {
    end = new Date(data.deadline);
    current = new Date();
    time = (end-current)/1000;
    if (time > 0) {
        day = Math.floor(time/86400);
        time -= (day*86400);
        hour = Math.floor(time/3600);
        time -= (hour*3600);
        // min = Math.floor(time/60);
        // time -= min/60;
        // timeString = day + "天" + hour + "小時" + min + "分";
        timeString = day + "天" + hour + "小時";
        data.deadline = timeString;
    } else {
        data.deadline = "已過期";
    }
}
// utility.prototype.getDateformat = function (data, format) {
//     temp = new Date(data);
//     data = dateformat(temp, format);
//     return data;
// }

//Member subfunctions
utility.prototype.getPermissonBit = function (roleID) {
    var rolePermit = {};
    for (var i = 0; i < permissionTable.length; i++) {
        if(permissionTable[i].role_id == roleID){
            var permit = Object.assign({}, permissionTable[i]);
            // var permitBit = {QUERY:false,CREATE:false,UPDATE:false,DELETE:false}
            // var temp = permit.permission.split(',');
            // for (var j in temp) {
            //     switch (temp[j]) {
            //         case "QUERY":
            //             permitBit.QUERY = true;
            //             break;
            //         case "CREATE":
            //             permitBit.CREATE = true;
            //             break;
            //         case "UPDATE":
            //             permitBit.UPDATE = true;
            //             break;
            //         case "DELETE":
            //             permitBit.DELETE = true;
            //             break;
            //     }
            // }
            // permit.permission = permitBit;
            rolePermit[permit.module_id] = {
                QUERY: parseInt(permit.permQUERY),
                CREATE: parseInt(permit.permCREATE),
                UPDATE: parseInt(permit.permUPDATE),
                DELETE: parseInt(permit.permDELETE),
                IMPORT: parseInt(permit.permIMPORT),
                EXPORT: parseInt(permit.permEXPORT)
            }
            // rolePermit.push({
            //     role_id: permit.role_id,
            //     module_id: permit.module_id,
            //     QUERY: parseInt(permit.permQUERY),
            //     CREATE: parseInt(permit.permCREATE),
            //     UPDATE: parseInt(permit.permUPDATE),
            //     DELETE: parseInt(permit.permDELETE),
            // });
        }
    }
    // console.log(rolePermit);
    // console.log("---------------------");
    // console.log(permissionTable);

    return rolePermit;
}
// utility.prototype.getAllPermission = function () {
//     if (permissionTable.length) {
//         return permissionTable;
//     } else {
//         console.log("permissionTable is empty");
//         return [];
//     }
// }
utility.prototype.splitPermission = function (data) {
    var string = data.permission.split(',');
    data.permission = string;
}
utility.prototype.updatePermission = function() {
    permissionDB
        .query(function (qb) {
	    qb.orderBy('role_id');
            qb.orderBy('module_id');
        })
        .fetchAll({
            columns:['role_id', 'module_id',
            'permQUERY', 'permCREATE',
            'permUPDATE', 'permDELETE',
            'permIMPORT', 'permEXPORT']
        })
        .then(function(dbData) {
            permissionTable = dbData.toJSON();
            // console.log(permissionTable);
        })
        .catch(function(error) {
            console.log(error.message);
            console.log("update permission list failed!");
        });
}
utility.prototype.checkPermissionDiff = function (roleID, moduleID) {
    for (var i in permissionTable) {
        if (permissionTable[i].role_id == roleID && permissionTable[i].module_id == moduleID) {
            return true;
        }
    }
    return false;
}

//initail function
utility.prototype.updatePermission();

//upload xlsx file function
utility.prototype.initUpload = function(uploadPath){
    var createFolder = function(folder){
        try{
            fs.accessSync(folder); 
        }catch(e){
            fs.mkdirSync(folder);
        }
    };
    
    var uploadFolder = uploadPath;
    
    createFolder(uploadFolder);

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
        },
        filename: function (req, file, cb) {
            // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
            cb(null, file.fieldname + '-' + Date.now());  
        }
    });

    var upload = multer({ storage: storage });

    return upload;
}

module.exports = new utility();
