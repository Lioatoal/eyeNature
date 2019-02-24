var model = require('../models/dbMaterial.js');
var utility = require("../libs/utility");
var bcrypt = require('bcryptjs');
var dateFormat = require('dateformat');

var inventoryDB = new model.inventory();
var inventoryComb = new model.inventory_comb();
var inventoryType = new model.inventory_type();
var inventoryLocation = new model.inventory_location();
var vendor = new model.vendor();
var employee = new model.employee();
var materialrecords = new model.materialrecords();
// var roleTable = [];
// var acctRole = [];

function material() {}

/*
    Get Data From DB
*/
//Inventory

material.prototype.getRowInventoryByPage = function (permit, callback) {
    new model.inventory()
        .query(function (qb) {
            qb.leftJoin('inventory_comb', 'comb_id', 'inventory_comb.id');
            qb.innerJoin('inventory_type', 'type_id', 'inventory_type.id');
            qb.leftJoin('inventory_location', 'location_id', 'inventory_location.id');
            qb.leftJoin('vendor', 'vendor_id', 'vendor.id');

            if (permit.t_name) {
                qb.andWhere('inventory_type.id', 'in', permit.t_name)
            }
            if (permit.name !== '') {
                qb.andWhere('inventory.name', permit.name)
            }
            if (permit.company !== '') {
                qb.andWhere('vendor.company', permit.company)
            }
            if (permit.l_name) {
                qb.andWhere('inventory_location.id', 'in', permit.l_name)
            }
            if (permit.c_name) {
                qb.andWhere('inventory_comb.id', 'in', permit.c_name)
            }

            //order by
            permit.order.forEach(element => {
                // var orderCol = 'role.r_name'
                var orderDir = element.dir || 'ASC'
                console.log(orderDir)
                if (element.column === '1') {
                    // orderCol = 'role.r_name';
                    qb.orderBy('t_name', orderDir);
                } else if (element.column === '2') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('inventory.name', orderDir);
                } else if (element.column === '3') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('price', orderDir);
                } else if (element.column === '4') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('vendor.company', orderDir);
                } else if (element.column === '5') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('quantity', orderDir);
                } else if (element.column === '6') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('reqquantity', orderDir);
                } else if (element.column === '7') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('l_name', orderDir);
                } else if (element.column === '8') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('c_name', orderDir);
                }
            });
        })
        // .orderBy('inventory.id')
        .fetchPage({
            limit: permit.limit, // Defaults to 10 if not specified
            offset: permit.offset, // Defaults to 1 if not specified
            columns: ['inventory.id', 'inventory_type.name as t_name', 'inventory.name', 'price', 'vendor.company', 'vendor.name as v_name',
                'quantity', 'reqquantity', 'inventory_location.name as l_name', 'inventory_comb.name as c_name'
            ],
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
            console.log("getRowInventoryByPage error log :");
            console.log(error.message);
            callback([]);
        });
}
material.prototype.getAllInventory = function (callback) {
    new model.inventory()
        .query(function (qb) {
            qb.leftJoin('inventory_comb', 'comb_id', 'inventory_comb.id');
            qb.innerJoin('inventory_type', 'type_id', 'inventory_type.id');
            qb.leftJoin('inventory_location', 'location_id', 'inventory_location.id');
            qb.leftJoin('vendor', 'vendor_id', 'vendor.id');
            qb.leftJoin('employee', 'custodian_id', 'employee.id');
        })
        .orderBy('inventory.id')
        .fetchAll({
            columns: [
                'inventory.id', 'inventory.name', 'price', 'quantity', 'reqquantity',
                'location_id', 'vendor_id', 'custodian_id',
                'inventory_type.name as t_name', 'vendor.company',
                'inventory_location.name as l_name', 'inventory_comb.name as c_name', 'employee.name as custodian_name'
            ],
        })
        .then(function (dbData) {
            var result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getRowInventoryByPage error log :");
            console.log(error.message);
            callback([]);
        });
}
material.prototype.getEditInventory = function (inventoryID, callback) {
    new model.inventory()
        .query(function (qb) {
            qb.where({
                id: inventoryID
            });
        })
        .orderBy('inventory.id')
        .fetchAll({
            columns: ['id', 'type_id', 'name',
                'location_id', 'comb_id', 'quantity',
                'img', 'price', 'custodian_id', 'vendor_id'
            ],
        })
        .then(function (dbData) {
            // console.log(dbData)
            var result = dbData.toJSON();
            console.log(result);
            callback(result);
        })
        .catch(function (error) {
            console.log("getEditInventory error log :");
            console.log(error.message);
            callback([]);
        });
}
material.prototype.getAllInventoryType = function (callback) {
    new model.inventory_type()
        .query(function (qb) {

        })
        .fetchAll({
            columns: ['id', 'name']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getAllInventoryType error log :");
            console.log(error.message);
            callback([]);
        })
}
material.prototype.getAllInventoryLocation = function (callback) {
    new model.inventory_location()
        .query(function (qb) {

        })
        .fetchAll({
            columns: ['id', 'name', 'address']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getAllInventoryLocation error log :");
            console.log(error.message);
            callback([]);
        })
}
material.prototype.getAllInventoryComb = function (callback) {
    new model.inventory_comb()
        .query(function (qb) {

        })
        .fetchAll({
            columns: ['id', 'name', 'img']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getAllInventoryComb error log :");
            console.log(error.message);
            callback([]);
        })
}

/*
    Inventory
*/

//Inventory Create & EDIT
material.prototype.setInventory = function (inventory, callback) {
    var data, setMethod = 'insert';
    if (inventory.head == 'edit') {
        setMethod = 'update';
        console.log('lib' + inventory.txtEditID);
        data = {
            id: inventory.txtEditID,
            name: inventory.name,
            type_id: inventory.type_id,
            location_id: inventory.location_id,
            comb_id: inventory.comb_id,
            price: inventory.price,
            vendor_id: inventory.vendor_id,
            custodian_id: inventory.custodian_id,
            img: inventory.img
        }
    } else if (inventory.head == 'create') {
        data = {
            name: inventory.name,
            type_id: inventory.type_id,
            location_id: inventory.location_id,
            comb_id: inventory.comb_id,
            price: inventory.price,
            vendor_id: inventory.vendor_id,
            custodian_id: inventory.custodian_id,
            img: inventory.img
        }

        // var diff = checkRoleDiff(data.r_name);
        // if (diff) {
        //     console.log("This set of role is existed");
        //     var errLog = "This Role is existed! name:" + data.r_name + "-r_descr:" + data.r_descr;
        //     callback([errLog]);
        //     return;
        // }

    }
    new model.inventory()
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
            console.log("set Inventory error log :");
            console.log(error.message);
            callback(["set Inventory fail!"]);
        });
}
//Inventory Delete
material.prototype.deleteInventory = function (inventoryID, callback) {
    console.log("inventoryID: " + inventoryID);
    new model.inventory()
        .query(function (qb) {
            qb.whereIn('id', inventoryID);
            qb.leftJoin('inventory_comb', 'comb_id', 'inventory_comb.id');
            qb.innerJoin('inventory_type', 'type_id', 'inventory_type.id');
            qb.leftJoin('inventory_location', 'location_id', 'inventory_location.id');
        })
        .destroy()
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("deleteInventory query error log :");
            console.log(error.message);
            callback(["query deleteInventory delete info fail!"]);
        })
}
//Inventory Add/Subtract quantity
material.prototype.InventoryQuantityModify = function (inventoryID, sumQuantity, callback) {
    console.log("inventoryID: " + inventoryID + " |Quantity: " + sumQuantity);
    new model.inventory()
        .query(function (qb) {
            qb.where('id', inventoryID);
        })
        .save({
            quantity: sumQuantity
        }, {
            method: 'update'
        })
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("InventoryQuantityModify error log :");
            console.log(error.message);
            callback(["Inventory Quantity Modify fail!"]);
        });
}
//Inventory Purchase 
material.prototype.getPurchaseInfo = function (inventoryID, callback) {
    console.log("getPurchaseInfoin")
    new model.inventory()
        .query(function (qb) {
            qb.where({
                'inventory.id': inventoryID
            });
            qb.leftJoin('inventory_location', 'location_id', 'inventory_location.id');
            qb.leftJoin('vendor', 'vendor_id', 'vendor.id');
        })
        .fetchAll({
            columns: ['inventory.name', 'quantity', 'location_id', 'inventory_location.name as l_name', 'price', 'vendor.company']
        })
        .then(function (dbData) {
            result = dbData.toJSON();
            callback(result);
        })
        .catch(function (error) {
            console.log("getPurchaseInfo error log :");
            console.log(error.message);
            callback([]);
        })
}
//Inventory Create & EDIT
material.prototype.setInventoryOthr = function (inventoryData, callback) {
    var data;
    var inventoryDB;
    data = {
        name: inventoryData.name,
    }
    console.log("data: " + data);
    if (inventoryData.head == 'Type') {
        inventoryDB = new model.inventory_type();
    } else if (inventoryData.head == 'Comb') {
        inventoryDB = new model.inventory_comb();
    } else {
        inventoryDB = new model.inventory_location();
    }
    inventoryDB
        .query(function (qb) {})
        .save(data, {
            method: 'insert'
        })
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("set Inventory Othr error log :");
            console.log(error.message);
            callback(["set Inventory Othr fail!"]);
        });
}

/*
    Record
*/
material.prototype.getRowRecordByPage = function (record, callback) {
    new model.materialrecords()
        .query(function (qb) {
            if (record.inventoryname !== '') {
                qb.andWhere('inventoryname', 'like', `%${record.inventoryname}%`)
            }
            if (record.operation !== '') {
                qb.andWhere('operation', 'like', `%${record.operation}%`)
            }
            if (record.operator !== '') {
                qb.andWhere('operator', 'like', `%${record.operator}%`)
            }
            if (record.campname !== '') {
                qb.andWhere('campname', 'like', `%${record.campname}%`)
            }
            // let timeOffset = 8 * 60 * 60 * 1000
            // if (permit.beginDate !== '' && permit.endDate !== '') {
            //     qb.andWhereBetween('timestamp', [new Date(permit.beginDate).getTime() + timeOffset, new Date(permit.endDate).getTime() + timeOffset])
            if (record.beginDate !== '') {
                // console.log(new Date(permit.beginDate).getTime() + timeOffset)
                qb.andWhere('timestamp', '>=', new Date(record.beginDate).getTime())
            }
            if (record.endDate !== '') {
                // console.log(new Date(new Date(permit.endDate).getTime() + timeOffset))
                qb.andWhere('timestamp', '<=', new Date(record.endDate).getTime())
            }
            if (record.vendorname !== '') {
                qb.andWhere('vendorname', 'like', `%${record.vendorname}%`)
            }
            //order by
            record.order.forEach(element => {
                // var orderCol = 'role.r_name'
                var orderDir = element.dir || 'ASC'
                // console.log(orderDir)
                if (element.column === '0') {
                    // orderCol = 'role.r_name';
                    qb.orderBy('timestamp', orderDir);
                } else if (element.column === '1') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('inventoryname', orderDir);
                } else if (element.column === '2') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('operation', orderDir);
                } else if (element.column === '3') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('quantity', orderDir);
                } else if (element.column === '4') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('campname', orderDir);
                } else if (element.column === '5') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('price', orderDir);
                } else if (element.column === '6') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('vendorname', orderDir);
                } else if (element.column === '7') {
                    // orderCol = 'module.m_name';
                    qb.orderBy('operator', orderDir);
                }
            });
        })
        // .orderBy('materialrecords.id')
        .fetchPage({
            limit: record.limit, // Defaults to 10 if not specified
            offset: record.offset, // Defaults to 1 if not specified
            columns: ['id', 'inventoryname', 'operation',
                'quantity', 'campname', 'price', 'vendorname', 'timestamp', 'operator', 'remark'
            ],
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
            console.log("getRowRecordByPage error log :");
            console.log(error.message);
            callback([]);
        });
}
material.prototype.getRecordRemark = function (recordID, callback) {
    new model.materialrecords()
        .query(function (qb) {
            qb.where({
                id: recordID
            });
        })
        .orderBy('id')
        .fetchAll({
            columns: ['id', 'remark'],
        })
        .then(function (dbData) {
            // console.log(dbData)
            var result = dbData.toJSON();
            console.log(result);
            callback(result);
        })
        .catch(function (error) {
            console.log("getRecordRemark error log :");
            console.log(error.message);
            callback([]);
        });
}
material.prototype.getAllRecord = function (callback) {
    new model.materialrecords()
        .query(function (qb) {
            // qb.where({
            //     id: recordID
            // });
        })
        .orderBy('id')
        .fetchAll({
            columns: ['id', 'inventoryname', 'operation',
                'quantity', 'campname', 'price', 'vendorname', 'timestamp', 'operator', 'remark'
            ],
        })
        .then(function (dbData) {
            // console.log(dbData)
            var result = dbData.toJSON();
            console.log(result);
            callback(result);
        })
        .catch(function (error) {
            console.log("getRecordRemark error log :");
            console.log(error.message);
            callback([]);
        });
}
material.prototype.setRecord = function (record, callback) {
    var data, setMethod = 'insert';
    data = {
        inventoryname: record.inventoryname,
        operation: record.operation,
        quantity: record.quantity,
        campname: record.campname,
        price: record.price,
        vendorname: record.vendorname,
        timestamp: record.timestamp,
        operator: record.operator,
        remark: record.remark
    }
    console.log("data: " + data);

    new model.materialrecords()
        .query(function (qb) {})
        .save(data, {
            method: setMethod
        })
        .then(function () {
            callback([]);
        })
        .catch(function (error) {
            console.log("set Record error log :");
            console.log(error.message);
            callback(["set Record fail!"]);
        });
}

module.exports = new material();