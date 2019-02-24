// Require Header file
var menus = require('../../config/menus');
var sidebar = require('../../config/sidebar');
var utility = require("../../libs/utility");
// Require Modules
var express = require('express');
var url = require('url');
var async = require('async');
var xlsx = require('xlsx');
//Require Libs
var libCamp = require("../../libs/libCamp");

var router = express.Router();

router.get('/camp', function (req, res) {
    let userInfo = req.session.user;

    let rolePermit = utility.getPermissonBit(userInfo.roleID);
    // console.log(inventoryPermit)
    if (!rolePermit['5-1']) {
        return res.redirect('/logout');
    }

    res.render('./camp/static/mCamp.html', {
        target: 'mCamp',
        menus: menus,
        userInfo: userInfo,
        sidebar: sidebar,
        permission: rolePermit['5-1'],
    });
});

router.get('/mCampRowData', function (req, res) {
    let camp = "";
    let rowCount = 0;
    let page = 1;

    async.parallel([
        function (finish) {
            libCamp.getRowCampByPage({
                camp_name: req.query.name,
                camp_typeId: req.query.typeId,
                camp_dayNumber: req.query.dayNumber,
                camp_outbound: req.query.outbound,
                camp_iswork: req.query.iswork,
                offset: parseInt(req.query.start),
                limit: req.query.length,
                order: req.query.order || []
            }, function (result) {
                if (result.data.length != 0) {
                    camp = result.data;
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
            "data": camp
        }
        res.json(data)
    });
});

router.get('/mCampCreate', function (req, res) {
    // var user = req.session.user;

    async.parallel([
    ], function (errs, results) {
        res.render('./camp/ejs/mCampModalCreate.ejs', {
        });
    });
})

//CREATE & EDIT
router.get('/mCampEdit', function (req, res) {
    // var user = req.session.user;
    var params = url.parse(req.url, true);
    var id = params.query.id;
    var inventoryEdit = [];

    async.parallel([
        function (finish) {
            libCamp.getAllInventoryType(function (result) {
                if (result.length != 0) {
                    inventoryType = result;
                }
                finish();
            });
        },
        function (finish) {
            libCamp.getAllInventoryLocation(function (result) {
                if (result.length) {
                    inventoryLocation = result;
                }
                finish();
            });
        },
        function (finish) {
            libCamp.getAllInventoryComb(function (result) {
                if (result.length) {
                    inventoryComb = result;
                }
                finish();
            });
        },
        function (finish) {
            libPersonnel.getAllVendor(function (result) {
                if (result.length) {
                    inventoryVendor = result;
                }
                finish();
            });
        },
        function (finish) {
            libPersonnel.getAdEmployee(function (result) {
                if (result.length) {
                    inventoryCustodian = result;
                }
                finish();
            });
        },
        function (finish) {
            libCamp.getEditInventory(id, function (result) {
                if (result.length != 0) {
                    inventoryEdit = result[0];
                    // console.log(inventoryEdit)
                }
                finish();
            })
        }
    ], function (errs, results) {
        res.render('./material/inventory/ejs/mCampModalUpdate.ejs', {
            inventoryEdit: inventoryEdit
        });
    });
});

router.post('/mCampModify', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    // var params = url.parse(req.url, true);
    var inventory = params;
    var error = {
        msg: ""
    }

    var inventoryPermit = utility.getPermissonBit(userInfo.roleID);
    if (!inventoryPermit['4-1']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (inventory.head == 'create') {
            if (!inventoryPermit['4-1'].CREATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        } else if (inventory.head == 'edit') {
            if (!inventoryPermit['4-1'].UPDATE) {
                error.msg = "你沒有此權限!";
                res.json(error);
                return;
            }
        }
    }

    async.series([
        function (next) {
            libCamp.setInventory(inventory, function (result) {
                if (result.length != 0) {
                    error.msg = result[0];
                }
                next();
            });
        }
    ], function (errs, results) {
        res.json(error);
    });
});

//DELETE
router.post('/mCampDelete', function (req, res) {
    var userInfo = req.session.user;
    var params = JSON.parse(req.body.postData);
    var inventoryIDArray = params;
    var error = {
        msg: ""
    };
    // console.log(inventoryIDArray);

    var inventoryPermit = utility.getPermissonBit(userInfo.roleID);
    if (!inventoryPermit['4-1']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!inventoryPermit['4-1'].DELETE) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }

    async.series([
        function (next) {
            libCamp.deleteInventory(inventoryIDArray, function (result) {
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

router.post('/mCampImport', function (req, res) {
    var userInfo = req.session.user;
    var xlsxData = req.body;
    var worksheet = xlsx.read(xlsxData, {
        type: "buffer"
    });
    var index = 0, invType = {}, invComb = {}, invLocation = {}, vendorCompany = {}, custodian = {},
        inventory = [], diffTable = {}, 
        queue = [];
    var error = {msg: ""};

    var inventoryPermit = utility.getPermissonBit(userInfo.roleID);
    if (!inventoryPermit['4-1']) {
        error.msg = "你沒有此權限!";
        res.json(error);
        return;
    } else {
        if (!inventoryPermit['4-1'].IMPORT) {
            error.msg = "你沒有此權限!";
            res.json(error);
            return;
        }
    }

    var sheet = xlsx.utils.sheet_to_json(worksheet.Sheets["庫存管理"]);
    /**
     * define how much times of Inventory have to set.
     */
    for (const i in sheet) {
        queue.push(
            function (index, next) {
                // console.log(index);
                libCamp.setInventory(inventory[index], function (result) {
                    if (result.length != 0) {
                        error.msg += result[0] + '\r\n';
                    }
                    index++;
                    next('', index);
                });
            }
        )
    }

    async.waterfall([
        function (next) {
            libCamp.getAllInventoryType(function (result) {
                if (result.length != 0) {
                    for (const i in result) {
                        invType[result[i].name] = result[i].id;
                    }
                    next();
                }
            });
        },
        function (next) {
            libCamp.getAllInventoryLocation(function (result) {
                if (result.length != 0) {
                    for (const i in result) {
                        invLocation[result[i].name] = result[i].id;
                    }
                    next();
                }
            });
        },
        function (next) {
            libCamp.getAllInventoryComb(function (result) {
                if (result.length != 0) {
                    for (const i in result) {
                        invComb[result[i].name] = result[i].id;
                    }
                    next();
                }
            });
        },
        function (next) {
            libPersonnel.getAllVendor(function (result) {
                if (result.length != 0) {
                    for (const i in result) {
                        vendorCompany[result[i].company] = result[i].id;
                    }
                    next();
                }
            });
        },
        function (next) {
            libPersonnel.getAllEmployee(function (result) {
                if (result.length != 0) {
                    for (const i in result) {
                        custodian[result[i].name] = result[i].id;
                    }
                    next();
                }
            });
        },
        function (next) {
            libCamp.getAllInventory(function (result) {
                // console.log(result)
                if (result.length != 0) {
                    var invDiffHead = "";
                    for (const i in result) {
                        invDiffHead += result[i].name;
                        invDiffHead += result[i].price;
                        invDiffHead += result[i].location_id;
                        invDiffHead += result[i].vendor_id;
                        invDiffHead += result[i].custodian_id;
                        diffTable[invDiffHead] = result[i].id;
                        invDiffHead = "";
                    }
                }   
                next();
            })
        },
        function (next) {
            
            inventory = sheet.map(element => {
                return {
                    'type_id': invType[element['類別']],
                    'name': element['名稱'],
                    'price': element['單價'],
                    'vendor_id': vendorCompany[element['廠商']],
                    'quantity': element['庫存數量'],
                    'reqquantity': element['所需數量'],
                    'location_id': invLocation[element['庫存地']],
                    'comb_id': invComb[element['成品']],
                    'custodian_id': custodian[element['保管人']]
                }
            });

            var invDataHead = "";
            for (const i in inventory) {
                invDataHead += inventory[i].name;
                invDataHead += inventory[i].price;
                invDataHead += inventory[i].location_id;
                invDataHead += inventory[i].vendor_id;
                invDataHead += inventory[i].custodian_id;
                
                if(diffTable[invDataHead]){
                    inventory[i].head = "edit";
                    inventory[i].txtEditID = diffTable[invDataHead];
                } else {
                    inventory[i].head = "create";
                }
                invDataHead = "";
            }
            next('', index);
        },
    ].concat(queue), function (errs, results) {
        res.json(error);
    });
    // console.log(worksheet.SheetNames);
});

router.get('/mCampExport', function (req, res) {
    var userInfo = req.session.user;
    var inventory = "";

    async.parallel([
        function (finish) {
            libCamp.getAllInventory(
                function (result) {
                    // console.log(result)
                    if (result.length != 0) {
                        inventory = result;
                    }
                    finish();
                })
        },
    ], function (errs, results) {
        // console.log(inventory)
        var output = inventory.map(element => {
            return {
                '類別': element['t_name'],
                '名稱': element['name'],
                '單價': element['price'],
                '廠商': element['company'],
                '庫存數量': element['quantity'],
                '所需數量': element['reqquantity'],
                '庫存地': element['l_name'],
                '成品': element['c_name'],
                '保管人': element['custodian_name']
            }
        });
        /* generate workbook */
        var ws = xlsx.utils.json_to_sheet(output);
        var wb = xlsx.utils.book_new();
        var wscols = [{
                wch: 10
            },
            {
                wch: 20
            }
        ];
        ws['!cols'] = wscols;
        xlsx.utils.book_append_sheet(wb, ws, "庫存管理");

        /* generate buffer */
        var buf = xlsx.write(wb, {
            type: 'buffer',
            bookType: "xlsx"
        });

        /* send to client */
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + encodeURIComponent("庫存管理.xlsx"));
        res.status(200).send(buf);
    });
});

module.exports = router;