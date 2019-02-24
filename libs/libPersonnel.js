var model = require('../models/dbPersonnel.js');
// var model = require('../lib/uikity');

var vendorDB = new model.vendor();
var vendorTypeDB = new model.vendor_type();

var employeeDB = new model.employee();
var employeeEduDB = new model.employee_edu();
var employeeTitleDB = new model.employee_title();

var customerDB = new model.customer();
var customerChildDb = new model.customer_child();

//暫存用來比對重複資料
var vendorTable = [],
    employeeTable = [],
    customerTable = [];

function personnel() { }

/*

    get Vendor

*/

//Get Vendor Type List
personnel.prototype.getAllVendorType = function (callback) {
    vendorTypeDB
        .fetchAll()
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log('getAllVendorType error log :');
            console.log(error.message);
            callback([]);
        })
}

//Get Vendor List
personnel.prototype.getAllVendor = function (callback) {
    new model.vendor()
        .query(function (qb) {
            qb.innerJoin('vendor_type', 'type_id', 'vendor_type.id');
        })
        .fetchAll({
            columns: ['vendor.id', 'vendor_type.type', 'company', 'name', 'phone', 'extension', 'cellphone', 'fax', 'iswork', 'title', 'jobagent', 'facebook', 'line', 'email', 'wechat', 'address', 'bankcode', 'bankname', 'bankaccount', 'remark']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            vendorTable = result;
            // console.log(result);
            callback(result);
        })
        .catch(function (error) {
            console.log('getAllVendor error log :');
            console.log(error.message);
            callback([]);
        })
}

//Get Vendor List
personnel.prototype.getAllVendorID = function (callback) {
    new model.vendor()
        .query(function (qb) {
        })
        .fetchAll({
            columns: ['id', 'email', 'company', 'name']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            vendorTable = result;
            // console.log(result);
            callback(result);
        })
        .catch(function (error) {
            console.log('getAllVendorID error log :');
            console.log(error.message);
            callback([]);
        })
}

personnel.prototype.getAllVendorByPage = function (vendor, callback) {
    new model.vendor()
        .query(function (qb) {
            qb.innerJoin('vendor_type', 'type_id', 'vendor_type.id');

            if (vendor.type) {
                qb.andWhere('vendor_type.id', 'in', vendor.type)
            }
            if (vendor.company !== '') {
                qb.andWhere('company', 'like','%'+vendor.company+'%')
            }
            if (vendor.name !== '') {
                qb.andWhere('name', 'like','%'+ vendor.name+'%')
            }
            if (vendor.phone !== '') {
                qb.andWhere('phone', vendor.phone)
            }
            if (vendor.cellphone !== '') {
                qb.andWhere('cellphone', vendor.cellphone)
            }
            if (vendor.iswork) {
                qb.andWhere('iswork', 'in', vendor.iswork)
            }

            //order by
            vendor.order.forEach(element => {
                // var orderCol = 'role.r_name'
                var orderDir = element.dir || 'ASC'
                console.log(orderDir)
                if (element.column === '1') {
                    // orderCol = 'role.r_name';
                    qb.orderBy('vendor_type.type', orderDir);
                } else if (element.column === '2') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('company', orderDir);
                } else if (element.column === '3') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('name', orderDir);
                } else if (element.column === '4') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('phone', orderDir);
                } else if (element.column === '6') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('cellphone', orderDir);
                }
            });
        })
        .fetchPage({
            limit: vendor.limit,
            offset: vendor.offset,
            columns: ['vendor.id', 'vendor_type.type', 'company', 'name', 'phone', 'extension', 'cellphone', 'fax', 'iswork']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback({
                'data': result,
                'rowCount': dbData.pagination.rowCount,
                'page': dbData.pagination.page
            });
        })
        .catch(function (error) {
            console.log('getAllVendorByPage error log :');
            console.log(error.message);
            callback([]);
        })
}

//Vendor Get EDIT Data
personnel.prototype.getVendor = function (id, callback) {
    console.log('id: ' + id)
    vendorDB
        .query(function (qb) {
            qb.innerJoin('vendor_type', 'type_id', 'vendor_type.id');
            qb.where('vendor.id', id);
        })
        .fetchAll({
            columns: ['vendor.id', 'type_id', 'vendor_type.type', 'company', 'name', 'title', 'jobagent', 'phone', 'extension', 'cellphone', 'fax', 'facebook', 'email', 'line', 'wechat', 'address', 'bankaccount', 'bankname', 'iswork', 'remark', 'bankcode']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log('getVendor error log :');
            console.log(error.message);
            callback([]);
        })
}

/*

    get Employee

*/
personnel.prototype.getAllEmployee = function (callback) {
    employeeDB
        .query(function (qb) {
            qb.innerJoin('employee_edu', 'edu_id', 'employee_edu.id');
            qb.innerJoin('employee_title', 'title_id', 'employee_title.id');
        })
        .fetchAll({
            columns: ['employee.id', 'name', 'nickname', 'employee_title.title', 'mainphone', 'secondaryphone', 'employee_edu.edulevel', 'school', 'iswork', 'facebook', 'email', 'line', 'wechat', 'birthday', 'bloodtype', 'telephone', 'address', 'registaddr', 'idcardno', 'gender', 'stature', 'weight', 'department', 'grade', 'secondaryedu', 'nextofkin', 'nextofkin_phone', 'bankcode', 'bankaccount', 'bankname', 'remark', 'degreestatus']
            // columns: ['idcardno']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log('getAllEmployee error log :');
            console.log(error.message);
            callback([]);
        })
}

personnel.prototype.getAllEmployeeID = function (callback) {
    employeeDB
        .query(function (qb) {
            // qb.innerJoin('employee_edu','edu_id','employee_edu.id');
            // qb.innerJoin('employee_title','title_id','employee_title.id');
        })
        .fetchAll({
            // columns: ['employee.id', 'name', 'nickname','employee_title.title','mainphone','secondaryphone','employee_edu.edulevel','school','iswork']
            columns: ['id', 'idcardno','name','nickname']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            employeeTable = result;
            callback(result);
        })
        .catch(function (error) {
            console.log('getAllEmployee error log :');
            console.log(error.message);
            callback([]);
        })
}

personnel.prototype.getEmployeeByPage = function (employee, callback) {
    new model.employee()
        .query(function (qb) {
            qb.innerJoin('employee_edu', 'edu_id', 'employee_edu.id');
            qb.innerJoin('employee_title', 'title_id', 'employee_title.id');
            if (employee.name !== '') {
                qb.andWhere('name','like', '%'+employee.name+'%')
            }
            if (employee.nickname !== '') {
                qb.andWhere('nickname','like', '%'+employee.nickname+'%')
            }
            if (employee.title) {
                qb.andWhere('employee_title.id', 'in', employee.title)
            }
            if (employee.cellphone !== '') {
                qb.andWhere(function () {
                    console.log(employee.cellphone)
                    this.where('mainphone', employee.cellphone)
                    this.orWhere('secondaryphone', employee.cellphone)
                })
            }
            if (employee.school !== '') {
                qb.andWhere('school','like', '%'+employee.school+'%')
            }
            if (employee.edulevel) {
                qb.andWhere('employee_edu.id', 'in', employee.edulevel)
            }
            if (employee.iswork) {
                qb.andWhere('iswork', 'in', employee.iswork)
            }
            //order by
            employee.order.forEach(element => {
                // var orderCol = 'role.r_name'
                var orderDir = element.dir || 'ASC'
                console.log(orderDir)
                if (element.column === '1') {
                    // orderCol = 'role.r_name';
                    qb.orderBy('name', orderDir);
                } else if (element.column === '2') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('nickname', orderDir);
                } else if (element.column === '3') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('employee_title.title', orderDir);
                } else if (element.column === '4') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('mainphone', orderDir);
                } else if (element.column === '5') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('secondaryphone', orderDir);
                } else if (element.column === '6') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('employee_edu.edulevel', orderDir);
                } else if (element.column === '7') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('school', orderDir);
                }
            });
        })
        .fetchPage({
            limit: employee.limit,
            offset: employee.offset,
            columns: ['employee.id', 'name', 'nickname', 'employee_title.title', 'mainphone', 'secondaryphone', 'employee_edu.edulevel', 'school', 'iswork']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback({
                'data': result,
                'rowCount': dbData.pagination.rowCount,
                'page': dbData.pagination.page
            });
        })
        .catch(function (error) {
            console.log('getEmployeeByPage error log :');
            console.log(error.message);
            callback([]);
        })
}

//Employee Get EDIT Data
personnel.prototype.getEditEmployee = function (id, callback) {
    // console.log('id: '+id)
    employeeDB
        .query(function (qb) {
            qb.innerJoin('employee_edu', 'edu_id', 'employee_edu.id');
            qb.innerJoin('employee_title', 'title_id', 'employee_title.id');
            qb.where('employee.id', id);
        })
        .fetchAll({
            columns: ['employee.id', 'name', 'nickname',
                'title_id', 'employee_title.title', 'birthday',
                'bloodtype', 'mainphone', 'secondaryphone', 'address',
                'idcardno', 'stature', 'weight', 'edu_id', 'employee_edu.edulevel',
                'school', 'nextofkin', 'nextofkin_phone', 'bankaccount', 'bankname',
                'line', 'email', 'wechat', 'facebook', 'iswork', 'remark', 'bankcode',
                'gender', 'telephone', 'registaddr', 'department', 'grade', 'degreestatus', 'secondaryedu'
            ]
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            // console.log("result :"+JSON.stringify(result));
            callback(result);
        })
        .catch(function (error) {
            console.log('getEditEmployee error log :');
            console.log(error.message);
            callback([]);
        })
}

personnel.prototype.getAdEmployee = function (callback) {
    new model.employee()
        .query(function (qb) {
            qb.where('title_id', 2);
            //職稱為行政人員 或講師
            qb.innerJoin('employee_edu', 'edu_id', 'employee_edu.id');
            qb.innerJoin('employee_title', 'title_id', 'employee_title.id');
        })
        .fetchAll({
            columns: ['employee.id', 'name', 'nickname', 'employee_title.title', 'mainphone', 'secondaryphone', 'employee_edu.edulevel', 'school', 'iswork']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            employTable = result;
            console.log(result);
            callback(result);
        })
        .catch(function (error) {
            console.log('getAdEmployee error log :');
            console.log(error.message);
            callback([]);
        })
}

//Get Employee Edu List
personnel.prototype.getAllEmployeeEdu = function (callback) {
    new model.employee_edu()
        .query(function (qb) {

        })
        .fetchAll({

        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log('getAllEmployeeEdu error log :');
            console.log(error.message);
            callback([]);
        })
}

//Get Employee Title List
personnel.prototype.getAllEmployeeTitle = function (callback) {
    new model.employee_title()
        .query(function (qb) {

        })
        .fetchAll({

        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log('getAllEmployeeTitle error log :');
            console.log(error.message);
            callback([]);
        })
}

/*

    get Customer

*/
personnel.prototype.getAllCustomer = function (callback) {
    new model.customer_child()
        .query(function (qb) {
            qb.innerJoin('customer', 'customer_id', 'customer.idcardno');
        })
        .fetchAll({
            columns: ['customer_child.idcardno', 'reln_id', 'customer_child.name', 'customer_child.gender', 'customer_child.passportno', 'customer_child.bloodtype', 'customer_child.birthday'
                , 'customer_child.school', 'customer_child.foodtype', 'customer_child.stature', 'customer_child.weight', 'customer_child.special', 'customer_child.nextofkin', 'customer_child.nextofkin_phone'
                , 'customer_child.remark', 'customer.idcardno as c_idcardno', 'customer.name as c_name'
                , 'customer.gender as c_gender', 'customer.phone as c_phone', 'customer.cellphone as c_cellphone'
                , 'customer.addr as c_addr', 'customer.intladdr as c_intladdr', 'customer.email as c_email'
                , 'customer.contactname as c_contactname', 'customer.contactphone as c_contactphone'
                , 'customer.iswork as c_iswork', 'customer.remark as c_remark', 'customer.birthday as c_birthday'
            ]
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log('getAllCustomer error log :');
            console.log(error.message);
            callback([]);
        })
}
personnel.prototype.getAllCustomerID = function (callback) {
    new model.customer()
        .fetchAll({
            columns: ['idcardno']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            customerTable = result;
            callback(result);
        })
        .catch(function (error) {
            console.log('getAllCustomerID error log :');
            console.log(error.message);
            callback([]);
        })
}

personnel.prototype.getCustomerByPage = function (customer, callback) {
    new model.customer()
        .fetchPage({
            limit: customer.limit,
            offset: customer.offset,
            columns: ['idcardno', 'name', 'cellphone', 'addr', 'remark', 'iswork']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback({
                'data': result,
                'rowCount': dbData.pagination.rowCount,
                'page': dbData.pagination.page
            });
        })
        .catch(function (error) {
            console.log('getCustomerByPage error log :');
            console.log(error.message);
            callback([]);
        })
}

personnel.prototype.getCustomer = function (idcardno, callback) {
    new model.customer()
        .query(function (qb) {
            qb.where('idcardno', idcardno);
        })
        .fetchAll({
            columns: ['email', 'idcardno', 'name', 'gender',
                'birthday', 'addr', 'intladdr', 'phone', 'cellphone',
                'contactname', 'contactphone', 'iswork', 'remark'
            ]
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log('getCustomer error log :');
            console.log(error.message);
            callback([]);
        })
}
/*

    get Customer Child

*/
personnel.prototype.getAllCustomerChildID = function (callback) {
    new model.customer_child()
        .fetchAll({
            columns: ['idcardno']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log('getAllCustomerID error log :');
            console.log(error.message);
            callback([]);
        })
}

personnel.prototype.getCustomerChildByPage = function (customerChild, callback) {
    new model.customer_child()
        .query(function (qb) {
            qb.where('customer_id', customerChild.id);
        })
        .fetchPage({
            limit: customerChild.limit,
            offset: customerChild.offset,
            columns: ['idcardno', 'name', 'passportno', 'birthday', 'reln_id']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback({
                'data': result,
                'rowCount': dbData.pagination.rowCount,
                'page': dbData.pagination.page
            });
        })
        .catch(function (error) {
            console.log('getCustomerChildByPage error log :');
            console.log(error.message);
            callback([]);
        })
}

personnel.prototype.getCustomerChild = function (idcardno, callback) {
    new model.customer_child()
        .query(function (qb) {
            qb.where('idcardno', idcardno);
        })
        .fetchAll({
            columns: ['reln_id', 'name', 'gender', 'passportno',
                'bloodtype', 'birthday', 'school', 'foodtype', 'stature',
                'weight', 'special', 'nextofkin', 'nextofkin_phone', 'remark'
            ]
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log('getCustomerChild error log :');
            console.log(error.message);
            callback([]);
        })
}

/*

    set Vendor

*/
//Vendor Create & EDIT
personnel.prototype.setVendor = function (vendor, callback) {
    var data, setMethod = 'insert';
    if (vendor.head == 'edit') {
        setMethod = 'update';
        data = {
            id: vendor.txtEditID,
            company: vendor.company,
            name: vendor.name,
            type_id: vendor.type_id,
            title: vendor.title,
            jobagent: vendor.jobagent,
            phone: vendor.phone,
            extension: vendor.extension,
            cellphone: vendor.cellphone,
            fax: vendor.fax,
            facebook: vendor.facebook,
            email: vendor.email,
            line: vendor.line,
            wechat: vendor.wechat,
            address: vendor.address,
            bankcode: vendor.bankcode,
            bankaccount: vendor.bankaccount,
            bankname: vendor.bankname,
            iswork: vendor.iswork,
            remark: vendor.remark,
        }
        console.log("Edit id: " + data.id);
    } else if (vendor.head == 'create') {
        data = {
            company: vendor.company,
            name: vendor.name,
            type_id: vendor.type_id,
            title: vendor.title,
            jobagent: vendor.jobagent,
            phone: vendor.phone,
            extension: vendor.extension,
            cellphone: vendor.cellphone,
            fax: vendor.fax,
            facebook: vendor.facebook,
            email: vendor.email,
            line: vendor.line,
            wechat: vendor.wechat,
            address: vendor.address,
            bankcode: vendor.bankcodebankcode,
            bankaccount: vendor.bankaccount,
            bankname: vendor.bankname,
            iswork: vendor.iswork,
            remark: vendor.remark,
        }
        console.log("Create : " + data.company + " " + data.name);
        var diff = checkVendorDiff(data.company, data.name);
        if (diff) {
            console.log("This set of Vendor company and name are existed");
            callback(["This set of Vendor company and name are existed"]);
            return;
        }

    }
    new model.vendor()
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
            console.log("setVendor error log :");
            console.log(error.message);
            callback(["set Vendor fail!"]);
        });
}

//Vendor Delete
personnel.prototype.deleteVendor = function (vendorID, callback) {
    console.log("vendorID");
    console.log(vendorID);
    new model.vendor()
        .query(function (qb) {
            qb.whereIn('id', vendorID);
        })
        .destroy()
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("deleteVendor query error log :");
            console.log(error.message);
            callback(["query Vendor delete info fail!"]);
        })
}

//Vendor Check Diff
function checkVendorDiff(company, name) {
    for (var i in vendorTable) {
        if (vendorTable[i].company == company && vendorTable[i].name == name) {
            return true;
        }
    }
    return false;
}

/*

    set Employee

*/
//Employee Create & EDIT
personnel.prototype.setEmployee = function (employee, callback) {
    var data, setMethod = 'insert';
    if (employee.head == 'edit') {
        setMethod = 'update';
        data = {
            id: employee.txtEditID,
            name: employee.name,
            nickname: employee.nickname,
            title_id: employee.title_id,
            facebook: employee.facebook,
            email: employee.email,
            line: employee.line,
            wechat: employee.wechat,
            birthday: employee.birthday,
            bloodtype: employee.bloodtype,
            mainphone: employee.mainphone,
            secondaryphone: employee.secondaryphone,
            address: employee.address,
            idcardno: employee.idcardno,
            gender: employee.gender,
            stature: employee.txtEditEmployeeStature,
            weight: employee.weight,
            edu_id: employee.edu_id,
            school: employee.school,
            nextofkin: employee.nextofkin,
            nextofkin_phone: employee.nextofkin_phone,
            bankcode: employee.bankcode,
            bankaccount: employee.bankaccount,
            bankname: employee.bankname,
            iswork: employee.iswork,
            remark: employee.remark,
            telephone: employee.telephone,
            registaddr: employee.registaddr,
            department: employee.department,
            grade: employee.grade,
            degreestatus: employee.degreestatus,
            secondaryedu: employee.secondaryedu
        }
    } else if (employee.head == 'create') {
        data = {
            name: employee.name,
            nickname: employee.nickname,
            title_id: employee.title_id,
            facebook: employee.facebook,
            email: employee.email,
            line: employee.line,
            wechat: employee.wechat,
            birthday: employee.birthday,
            bloodtype: employee.bloodtype,
            mainphone: employee.mainphone,
            secondaryphone: employee.secondaryphone,
            address: employee.address,
            idcardno: employee.idcardno,
            gender: employee.gender,
            stature: employee.stature,
            weight: employee.weight,
            edu_id: employee.edu_id,
            school: employee.school,
            nextofkin: employee.nextofkin,
            nextofkin_phone: employee.nextofkin_phone,
            bankcode: employee.bankcode,
            bankaccount: employee.bankaccount,
            bankname: employee.bankname,
            iswork: employee.iswork,
            remark: employee.remark,
            telephone: employee.telephone,
            registaddr: employee.registaddr,
            department: employee.department,
            grade: employee.grade,
            degreestatus: employee.degreestatus,
            secondaryedu: employee.secondaryedu
        }

        // var diff = checkEmployeeDiff(data.idcardno);
        // if (diff) {
        //     console.log("This set of Employee IDCardNo is existed");
        //     callback(["This set of Employee IDCardNo is existed"]);
        //     return;
        // }

    }

    new model.employee()
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
            console.log("set Employee error log :");
            console.log(error.message);
            callback(["set Employee fail!"]);
        });
}

//Employee Delete
personnel.prototype.deleteEmployee = function (employeeID, callback) {
    console.log("employeeID");
    console.log(employeeID);
    new model.employee()
        .query(function (qb) {
            qb.whereIn('id', employeeID);
        })
        .destroy()
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("deleteEmployee query error log :");
            console.log(error.message);
            callback(["query Employee delete info fail!"]);
        })
}

//Employ Check Diff
function checkEmployeeDiff(idcardno) {
    for (var i in employeeTable) {
        if (employeetable[i].idcardno == idcardno) {
            return true;
        }
    }
    return false;
}

/*

    set Customer

*/
//Customer Create & EDIT
personnel.prototype.setCustomer = function (customer, callback) {
    var data, setMethod = 'insert';
    if (customer.head == 'edit') {
        setMethod = 'update';
        data = {
            email: customer.email,
            name: customer.name,
            gender: customer.gender,
            birthday: customer.birthday,
            phone: customer.phone,
            cellphone: customer.cellphone,
            contactname: customer.contactname,
            contactphone: customer.contactphone,
            iswork: customer.iswork,
            remark: customer.remark,
        }
        if (customer.addrIO == 0) {
            data.addr = customer.addr;
        } else {
            data.intladdr = customer.addr;
        }
    } else if (customer.head == 'create') {

        data = {
            email: customer.email,
            idcardno: customer.idcardno,
            name: customer.name,
            gender: customer.gender,
            birthday: customer.birthday,
            phone: customer.phone,
            cellphone: customer.cellphone,
            contactname: customer.contactname,
            contactphone: customer.contactphone,
            iswork: customer.iswork,
            remark: customer.remark,
        }
        if (customer.addrIO == '0') {
            data.addr = customer.addr;
        } else {
            data.intladdr = customer.addr;
        }
        // var diff = checkCustomerDiff(data.idcardno);
        // if (diff) {
        //     console.log("This set of Customer IDCardNo is existed");
        //     callback(["This set of Customer IDCardNo is existed"]);
        //     return;
        // }
    }
    console.log(data);

    new model.customer()
        .query(function (qb) {
            if (setMethod == 'update') {
                qb.where('idcardno', customer.idcardno);
            }
        })
        .save(data, {
            method: setMethod
        })
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("set Customer error log :");
            console.log(error.message);
            callback(["set Customer fail!"]);
        });
}

//Customer Delete
personnel.prototype.deleteCustomer = function (customerID, callback) {
    console.log("customerID");
    console.log(customerID);
    new model.customer()
        .query(function (qb) {
            qb.whereIn('idcardno', customerID);
        })
        .destroy()
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("deleteCustomer query error log :");
            console.log(error.message);
            callback(["delete Customer fail!"]);
        })
}

//Employ Check Diff
function checkCustomerDiff(idcardno) {
    for (var i in customerTable) {
        if (customerTable[i].idcardno == idcardno) {
            return true;
        }
    }
    return false;
}

/*

    set Customer Child

*/
personnel.prototype.setCustomerChild = function (customerChild, callback) {
    var data, setMethod = 'insert';
    if (customerChild.head == 'edit') {
        setMethod = 'update';
        data = customerChild;
        // data = {
        //     email: customerChild.email,
        //     name: customerChild.name,
        //     gender: customerChild.gender,
        //     birthday: customerChild.birthday,
        //     phone: customerChild.phone,
        //     cellphone: customerChild.cellphone,
        //     contactname: customerChild.contactname,
        //     contactphone: customerChild.contactphone,
        //     iswork: customerChild.iswork,
        //     remark: customerChild.remark,
        // }
    } else if (customerChild.head == 'create') {
        console.log(customerChild);
        
        data = customerChild;

        // var diff = checkCustomerChildDiff(data.idcardno);
        // if (diff) {
        //     console.log("This set of CustomerChild IDCardNo is existed");
        //     callback(["This set of CustomerChild IDCardNo is existed"]);
        //     return;
        // }
    }

    delete data.head;

    new model.customer_child()
        .query(function (qb) {
            if (setMethod == 'update') {
                qb.where('idcardno', customerChild.idcardno);
            }
        })
        .save(data, {
            method: setMethod
        })
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("set CustomerChild error log :");
            console.log(error.message);
            callback(["set CustomerChild fail!"]);
        });
}

personnel.prototype.deleteCustomerChild = function (childID, callback) {
    console.log("childID");
    console.log(childID);
    new model.customer_child()
        .query(function (qb) {
            qb.whereIn('idcardno', childID);
        })
        .destroy()
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("deleteCustomer query error log :");
            console.log(error.message);
            callback(["delete Customer fail!"]);
        })
}

module.exports = new personnel();