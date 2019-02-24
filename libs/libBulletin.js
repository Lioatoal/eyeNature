var model = require('../models/dbBulletin');

var bulletinDB = new model.bulletin();
var bltnCommentDB = new model.bltnComment();
var bltnLooked = new model.bltnLooked();
var bltnWilllook = new model.bltnWilllook();

function bltn() {}
/*
 * GET Bulletin
*/
bltn.prototype.getBulletinPageData = function(select, authorID, permTable, callback) {
    var queue = {};
    // check it's get all module or not
    if (select.moduleID != 0) {
        if (!permTable[select.moduleID]) {
            console.log("this role can't read the module, ID:" + select.moduleID);
            return callback([]);
        }
        queue[select.moduleID] = permTable[select.moduleID];
    } else {
        queue = permTable;
    }

    bulletinDB
        .query(function (qb) {
            for (var moduleID in queue) {
                var permitKey = 1;
                permitKey += (queue[moduleID].CREATE * 2);
                permitKey += (queue[moduleID].UPDATE * 4);
                permitKey += (queue[moduleID].DELETE * 8);
                // console.log(permitKey);
                // [QUERY CREATE UPDATE DELETE]
                // qb.orWhere('module_id', queue[i].module_id);
                qb.orWhere('module_id', moduleID);

                switch (permitKey) {
                    case 1: // [1 0 0 0]
                        qb.andWhere({active:1});
                        break;
                    case 3: // [1 1 0 0]
                        qb.andWhere(function () {
                            this.where({active:1})
                            this.orWhere({author_id:authorID});
                        })
                        break;
                }
            }
            // console.log(qb.toSQL());
        })
        .count()
        .then(function(count) {
            // console.log('total count ' + count);
            callback(count);
        }).catch(function(error) {
            console.log("getBulletinPageData error log:");
            console.error(error.message);
            callback([]);
        });
}
bltn.prototype.getBulletinRowData = function(select, authorID, permTable, callback) {
    var queue = {};
    // check it's get all module or not
    if (select.moduleID != 0) {
        if (!permTable[select.moduleID]) {
            console.log("this role can't read the module, ID:" + select.moduleID);
            return callback([]);
        }
        queue[select.moduleID] = permTable[select.moduleID];
    } else {
        queue = permTable;
    }

    bulletinDB
        .query(function (qb) {
            for (var moduleID in queue) {
                var permitKey = 1;
                permitKey += (queue[moduleID].CREATE * 2);
                permitKey += (queue[moduleID].UPDATE * 4);
                permitKey += (queue[moduleID].DELETE * 8);
                // console.log(permitKey);
                // [QUERY CREATE UPDATE DELETE]
                // qb.orWhere('module_id', queue[i].module_id);
                qb.orWhere('module_id', moduleID);

                switch (permitKey) {
                    case 1: // [1 0 0 0]
                        qb.andWhere({active:1});
                        break;
                    case 3: // [1 1 0 0]
                        qb.andWhere(function () {
                            this.where({active:1})
                            this.orWhere({author_id:authorID});
                        })
                        break;
                }
            }
            qb.innerJoin('module', 'module_id', 'module.id');
            qb.innerJoin('bltn_impt', 'impt_id', 'bltn_impt.id');
            qb.innerJoin('member','author_id','member.email');
            qb.offset((select.pageIndex - 1) * 10);
            qb.limit(10);

            // console.log(qb.toSQL());
        })
        .orderBy('postdate', 'desc')
        .fetchAll({
            columns: ['bulletin.id', 'theme', 'content', 'active', 'author_id',
            'postdate', 'deadline', 'module_id', 'module.m_display',
            'bltn_impt.imptance', 'member.name', 'member.imgr']
        })
        .then(function(dbData) {
            var result = dbData.toJSON();
            callback(result);
        }).catch(function(error) {
            console.log("getBulletinRowData error log:");
            console.error(error.message);
            callback([]);
        });
};
/*
 * GET Bulletin Edit
*/
bltn.prototype.getBulletinEditData = function(id, callback) {
    bulletinDB
        .query(function(qb) {
            qb.where('bulletin.id', id);
            qb.innerJoin('module', 'module_id', 'module.id');
        })
        .fetchAll({
            columns: ['bulletin.id', 'theme', 'content', 'active',
            'timecount', 'deadline', 'impt_id', 'module_id', 'module.m_display']
        })
        .then(function(dbData) {
            var result = dbData.toJSON();
            callback(result);
        })
        .catch(function(error) {
            console.log("getBulletinViewData error log:");
            console.log(error.message);
            callback([]);
        });
};
/*
 * GET Bulletin View
*/
bltn.prototype.getBulletinViewData = function(id, callback) {
    bulletinDB
        .query(function(qb) {
            qb.where('bulletin.id', id);
            qb.innerJoin('module', 'module_id', 'module.id');
            qb.innerJoin('bltn_impt', 'impt_id', 'bltn_impt.id');
            qb.innerJoin('member','author_id','member.email');
        })
        .fetchAll({
            columns: ['bulletin.id','theme', 'content', 'postdate',
             'author_id', 'timecount', 'module_id',
             'module.m_display', 'bltn_impt.imptance',
             'member.name', 'member.imgr']
        })
        .then(function(dbData) {
            var result = dbData.toJSON();
            callback(result);
        })
        .catch(function(error) {
            console.log("getBulletinViewData error log:");
            console.log(error.message);
            callback([]);
        });
};

bltn.prototype.getBulletinViewComment = function(id, callback) {
    bltnCommentDB
        .query(function(qb) {
            qb.andWhere('bltn_id', id);
            qb.innerJoin('member','author_id','member.email');
        })
        .fetchAll({
            columns: ['bltn_comment.id', 'message', 'author_id', 'postdate', 'member.name', 'member.imgr']
        })
        .then(function(dbData) {
            var result = dbData.toJSON();
            callback(result);

        })
        .catch(function(error) {
            console.log("getBulletinViewComment error log:");
            console.log(result.error);
            callback([]);
        });
};

bltn.prototype.getBltnWillLook = function (id, callback) {
    bltnWilllook
        .query(function (qb) {
            qb.where({bltn_id: id});
            qb.innerJoin('member','member_email','member.email');
        })
        .fetchAll({
            columns: ['member_email', 'member.imgr', 'member.name']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getBltnWillLook error log :");
            console.log(error.message);
            callback([]);
        })
}

bltn.prototype.getBltnLooked = function (id, callback) {
    bltnLooked
        .query(function (qb) {
            qb.where({bltn_id:id});
            qb.innerJoin('member','member_email','member.email');
        })
        .fetchAll({
            columns: ['id', 'bltn_id', 'member_email', 'member.imgr', 'member.name']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getBltnLooked error log :");
            console.log(error.message);
            callback([]);
        })
}


bltn.prototype.setBulletin = function (bltn, user, head, callback) {
    var data, setMethod = 'insert';
    if (head == 'edit') {
        setMethod = 'update';
        data = bltn;
    } else if (head == 'create') {
        // console.log("create!!!")
        data = bltn;
        data.author_id = user;

        // var diff = checkEmployeeDiff(data.idcardno);
        // if (diff) {
        //     console.log("This set of Employee IDCardNo is existed");
        //     callback(["This set of Employee IDCardNo is existed"]);
        //     return;
        // }
    }

    new model.bulletin()
        .query(function (qb) {
            if (setMethod == "update") {
                qb.andWhere({id:data.id});
                // delete bulletin.author_id;
                // delete bulletin.deadline;
            } else {
                data.postdate = new Date();
            }
            // console.log(data);
        })
        .save(data, {method:setMethod})
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("setBulletin error log :");
            console.log(error.message);
            callback(["set Bulletin Data fail!"]);
        })
}

bltn.prototype.setBltnWilllook = function (willlook, callback) {
    var data = willlook;
    
    new model.bltnWilllook()
        .save(data, {method:'insert'})
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("setBltnWilllook error log :");
            console.log(error.message);
            callback(["set Bulletin View will look fail!"]);
        })
}

bltn.prototype.setBulletinViewLooked = function (data, callback) {
    var looked = {
        bltn_id: data.bltnID,
        member_email: data.user
    }
    new model.bltnLooked()
        .query(function (qb) {

        })
        .save(looked, {method:'insert'})
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("setBulletinViewLooked error log :");
            console.log(error.message);
            callback(["set Bulletin View Looked fail!"]);
        })
}

bltn.prototype.setBulletinViewComment = function (data, user, callback) {
    var diff = false;
    var comment = {
        id: data.commentID,
        bltn_id: data.bltnID,
        author_id: user,
        message: data.newComment,
        postdate: new Date()
    }
    console.log(comment);
    new model.bltnComment()
        .query(function (qb) {
            console.log(comment.id);
            if (comment.id) {
                qb.andWhere({id:comment.id});
                diff = true;
            }
        })
        .save(comment,{patch:diff})
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("setBulletinViewComment error log :");
            console.log(error.message);
            callback(["set Bulletin View Comment fail!"]);
        })
}

bltn.prototype.deleteBulletinData = function (id, callback) {
    new model.bulletin()
        .query(function (qb) {
            qb.where({id:id});
        })
        .destroy()
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("deleteBulletinData error log :");
            console.log(error.message);
            callback(["delete Bulletin Data fail!"]);
        })
}

bltn.prototype.deletetBltnWilllook = function (bltnID, callback) {
    new model.bltnWilllook()
        .query(function (qb) {
            qb.where({bltn_id:bltnID});
        })
        .destroy()
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("deletetBltnWilllook error log :");
            console.log(error.message);
            callback(["delete Bulletin View will look fail!"]);
        })
}

bltn.prototype.deleteBulletinViewComment = function (id, callback) {
    console.log(id);
    new model.bltnComment()
        .query(function (qb) {
            qb.where({id:id});
        })
        .destroy()
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("setBulletinViewComment error log :");
            console.log(error.message);
            callback(["delete Bulletin View Comment fail!"]);
        })
}

module.exports = new bltn();
