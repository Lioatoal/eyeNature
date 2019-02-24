var model = require('../models/dbCamp.js');
var utility = require("./utility.js");
var bcrypt = require('bcryptjs');
var dateFormat = require('dateformat');

var campDB = new model.camp();
var campInvDB = new model.camp_inv();

// var roleTable = [];
// var acctRole = [];

function camp() {}

/*
    Get Data From DB
*/
//Camp

camp.prototype.getRowCampByPage = function (camp, callback) {
    new model.camp()
        .query(function (qb) {
            if (camp.camp_name && camp.camp_name !== '') {
                qb.andWhere('camp.camp_name', 'like',`%${camp.camp_name}%`);
            }
            if (camp.camp_typeId) {
                qb.andWhere('camp.camp_typeId', 'in', camp.camp_typeId)
            }
            if (camp.camp_dayNumber) {
                qb.andWhere('camp.camp_dayNumber', 'in', camp.camp_dayNumber)
            }
            if (camp.camp_outbound) {
                qb.andWhere('camp.camp_outbound', 'in', camp.camp_outbound)
            }
            if (camp.camp_iswork) {
                qb.andWhere('camp.camp_iswork', 'in', camp.camp_iswork)
            }

            //order by
            camp.order.forEach(element => {
                var orderDir = element.dir || 'ASC'
                if (element.column === '1') {
                    qb.orderBy('camp_name', orderDir);
                } else if (element.column === '2') {
                    qb.orderBy('camp_dayNumber', orderDir);
                } else if (element.column === '3') {
                    qb.orderBy('camp_outbound', orderDir);
                } else if (element.column === '4') {
                    qb.orderBy('camp_grade', orderDir);
                } else if (element.column === '5') {
                    qb.orderBy('camp_peopleNumber', orderDir);
                } else if (element.column === '6') {
                    qb.orderBy('camp_price', orderDir);
                } else if (element.column === '7') {
                    qb.orderBy('camp_iswork', orderDir);
                } else if (element.column === '8') {
                    qb.orderBy('camp_typeId', orderDir);
                }
            });
        })
        .fetchPage({
            limit: camp.limit, // Defaults to 10 if not specified
            offset: camp.offset, // Defaults to 1 if not specified
            columns: ['camp_id', 'camp_name', 'camp_dayNumber', 'camp_outbound', 'camp_grade','camp_peopleNumber'
                , 'camp_price', 'camp_iswork', 'camp_typeId'
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
            console.log("getRowCampByPage error log :");
            console.log(error.message);
            callback([]);
        });
}
// camp.prototype.getAllCamp = function (callback) {
//     new model.inventory()
//         .query(function (qb) {
//             qb.leftJoin('inventory_comb', 'comb_id', 'inventory_comb.id');
//             qb.innerJoin('inventory_type', 'type_id', 'inventory_type.id');
//             qb.leftJoin('inventory_location', 'location_id', 'inventory_location.id');
//             qb.leftJoin('vendor', 'vendor_id', 'vendor.id');
//             qb.leftJoin('employee', 'custodian_id', 'employee.id');
//         })
//         .orderBy('inventory.id')
//         .fetchAll({
//             columns: [
//                 'inventory.id', 'inventory.name', 'price', 'quantity', 'reqquantity',
//                 'location_id', 'vendor_id', 'custodian_id',
//                 'inventory_type.name as t_name', 'vendor.company',
//                 'inventory_location.name as l_name', 'inventory_comb.name as c_name', 'employee.name as custodian_name'
//             ],
//         })
//         .then(function (dbData) {
//             var result = dbData.toJSON();
//             callback(result);
//         })
//         .catch(function (error) {
//             console.log("getRowInventoryByPage error log :");
//             console.log(error.message);
//             callback([]);
//         });
// }
// camp.prototype.getEditCamp = function (campID, callback) {
//     new model.inventory()
//         .query(function (qb) {
//             qb.where({
//                 id: inventoryID
//             });
//         })
//         .orderBy('inventory.id')
//         .fetchAll({
//             columns: ['id', 'type_id', 'name',
//                 'location_id', 'comb_id', 'quantity',
//                 'img', 'price', 'custodian_id', 'vendor_id'
//             ],
//         })
//         .then(function (dbData) {
//             // console.log(dbData)
//             var result = dbData.toJSON();
//             console.log(result);
//             callback(result);
//         })
//         .catch(function (error) {
//             console.log("getEditInventory error log :");
//             console.log(error.message);
//             callback([]);
//         });
// }
/*
    Inventory
*/

//Inventory Create & EDIT
// camp.prototype.setCamp = function (camp, callback) {
//     var data, setMethod = 'insert';
//     if (inventory.head == 'edit') {
//         setMethod = 'update';
//         console.log('lib' + inventory.txtEditID);
//         data = {
//             id: inventory.txtEditID,
//             name: inventory.name,
//             type_id: inventory.type_id,
//             location_id: inventory.location_id,
//             comb_id: inventory.comb_id,
//             price: inventory.price,
//             vendor_id: inventory.vendor_id,
//             custodian_id: inventory.custodian_id,
//             img: inventory.img
//         }
//     } else if (inventory.head == 'create') {
//         data = {
//             name: inventory.name,
//             type_id: inventory.type_id,
//             location_id: inventory.location_id,
//             comb_id: inventory.comb_id,
//             price: inventory.price,
//             vendor_id: inventory.vendor_id,
//             custodian_id: inventory.custodian_id,
//             img: inventory.img
//         }

//     }
//     new model.inventory()
//         .query(function (qb) {
//             if (setMethod == 'update') {
//                 qb.where('id', data.id);
//             }
//         })
//         .save(data, {
//             method: setMethod
//         })
//         .then(function () {
//             callback([]);
//         })
//         .catch(function (error) {
//             console.log("set Inventory error log :");
//             console.log(error.message);
//             callback(["set Inventory fail!"]);
//         });
// }
//Inventory Delete
// camp.prototype.deleteCamp = function (campID, callback) {
//     console.log("inventoryID: " + inventoryID);
//     new model.inventory()
//         .query(function (qb) {
//             qb.whereIn('id', inventoryID);
//             qb.leftJoin('inventory_comb', 'comb_id', 'inventory_comb.id');
//             qb.innerJoin('inventory_type', 'type_id', 'inventory_type.id');
//             qb.leftJoin('inventory_location', 'location_id', 'inventory_location.id');
//         })
//         .destroy()
//         .then(function () {
//             callback([]);
//         })
//         .catch(function (error) {
//             console.log("deleteInventory query error log :");
//             console.log(error.message);
//             callback(["query deleteInventory delete info fail!"]);
//         })
// }

module.exports = new camp();