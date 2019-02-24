/*
 * Init First!
 */
var table;
initialize();

/*
 * Add Inventory
 */
//確認按鈕進行checkBlack
$("#add").on('click', function () {
    $.get('/mInventoryCreate', function (res) {
        $('#inventoryCreateModal .modal-content').html(res);
        $('#itemImg').hide();

        $("#inventoryCreate").on('submit', function (event) {
            // var result = $(this).serializeArray();
            // console.log(result);
            var postData = {
                head: 'create',
                name: $('#txtCreateInventoryName').val(),
                type_id: $('#txtCreateInventoryType').val(),
                location_id: $('#txtCreateInventoryLocation').val(),
                comb_id: $('#txtCreateInventoryComb').val(),
                price: $('#txtCreateInventoryPrice').val(),
                vendor_id: $('#txtCreateInventoryVendor').val(),
                custodian_id: $('#txtCreateInventoryCustodian').val(),
                img: $('#itemImg').attr('src'),
            };
            $.post('/mInventoryModify', {
                postData: JSON.stringify(postData)
            }, function (error) {
                if (error.msg) {
                    alert(error.msg);
                    return;
                } else {
                    window.location.href = "/inventory";
                }
            });
            event.preventDefault();
        });


    })
    //檢驗required 加上has-error css or has-success 
    checkBlack();
})

/*
 * Delete Inventory
 */
$('#delete').on('click', function () {
    if ($.fn.DataTable.isDataTable('#inventoryDelTable'))
        $('#inventoryDelTable').DataTable().destroy();

    let datas = [];
    let nodes = table.column(0).nodes();
    $.each(nodes, (i, d) => {
        if ($(d).find('input').prop('checked')) {
            console.log(i)
            datas.push(table.row(i).data());
        }
    })

    let tbConfig = getDataTableConfig();
    tbConfig.serverSide = false;
    $('#inventoryDelTable').DataTable(
        $.extend(tbConfig, {
            paging: false,
            ordering: false,
            data: datas,
            columns: [
                {
                    data: "t_name"
                }, 
                {
                    data: "name"
                }, 
                {
                    data: "quantity"
                }, 
                {
                    data: "reqquantity"
                }, 
                {
                    data: "l_name"
                }, 
                {
                    data: "c_name"
                }
            ]
        })
    );
})
$('#delSubmit').on('click', function () {
    // var delData = $('#inventoryDelTable tbody tr');
    var delData = $('#inventoryDelTable').DataTable().data();
    // console.log(delData[0].id);
    var postData = [];

    for (var i = 0; i < delData.length; i++) {
        postData.push(parseInt(delData[i].id));
    }
    console.log(postData);
    $.post('/mInventoryDelete', {
        postData: JSON.stringify(postData)
    }, function (error) {
        if (error.msg) {
            alert(error.msg);
            return;
        } else {
            window.location.href = "/inventory";
        }
    });


});

$('#inquiry').submit(function (e) {
    e.preventDefault();
    table.draw() //refresh table
})

/*
 * Import Function
 */
$('#import').on('change', function () {
    var xlsxFile = this;
    xlsxParser(xlsxFile, function (res) {
        xlsxFile = res;
        $.ajax({
            url: '/mInventoryImport',
            method: 'POST',
            data: xlsxFile,
            contentType: "application/octet-stream",
            processData: false,
            cache: false,
            success: function (error) {
                if (error.msg) {
                    if (confirm(error.msg)) {
                        window.location.href = "/inventory";
                    } else {
                        return;
                    }
                } else {
                    window.location.href = "/inventory";
                }
            }
        })
    });
})

/*
 * Export Function
 */
$('#export').on('click', function () {
    window.open('/mInventoryExport', '_self')
})

/**
 * Add Inventory Type
 */
$('#addInventoryType').on('click', function () {
    var postData;

    $('#addInventoryType').on('submit', function (event) {
        postData = {
            head: 'Type',
            name: $('#txtAddInventoryType').val()
        }
        $.post('/mInventoryAddOthr', {
            postData: JSON.stringify(postData)
        }, function (error) {
            if (error.msg) {
                $('#addTypeMsgArea').removeClass('text-success').addClass('text-danger').text('類別新增失敗:' + error.msg)
            } else {
                $('#addTypeMsgArea').removeClass('text-danger').addClass('text-success').text('類別新增成功')
                setTimeout(function () {
                    $('#addTypeMsgArea').empty()
                    $('#addInventoryTypeModal').modal("hide")
                }, 1500);
            }
        });
        event.preventDefault();
    })


})
/**
 * Add Inventory Comb
 */
$('#addInventoryComb').on('click', function () {
    var postData;

    $('#addInventoryComb').on('submit', function (event) {
        postData = {
            head: 'Comb',
            name: $('#txtAddInventoryComb').val()
        }
        $.post('/mInventoryAddOthr', {
            postData: JSON.stringify(postData)
        }, function (error) {
            if (error.msg) {
                $('#addCombMsgArea').removeClass('text-success').addClass('text-danger').text('成品新增失敗:' + error.msg)
            } else {
                $('#addCombMsgArea').removeClass('text-danger').addClass('text-success').text('成品新增成功')
                setTimeout(function () {
                    $('#addCombMsgArea').empty()
                    $('#addInventoryCombModal').modal("hide")
                }, 1500);
            }
        });
        event.preventDefault();
    })

})

/**
 * Add Inventory Location
 */
$('#addInventoryLocation').on('click', function () {
    var postData;

    $('#addInventoryLocation').on('submit', function (event) {
        postData = {
            head: 'Location',
            name: $('#txtAddInventoryLocation').val()
        }
        $.post('/mInventoryAddOthr', {
            postData: JSON.stringify(postData)
        }, function (error) {
            if (error.msg) {
                $('#addLocationMsgArea').removeClass('text-success').addClass('text-danger').text('庫存地新增失敗:' + error.msg)
            } else {
                $('#addLocationMsgArea').removeClass('text-danger').addClass('text-success').text('庫存地新增成功')
                setTimeout(function () {
                    $('#addLocationMsgArea').empty()
                    $('#addInventoryLocationModal').modal("hide")
                }, 1500);
            }
        });
        event.preventDefault();
    })

})

function initialize() {
    let tbConfig = getDataTableConfig();
    table = $('#inventoryTable').DataTable(
        $.extend(tbConfig, {
            ajax: {
                url: "/mInventoryRowData",
                data: function (data) {
                    let customData = {
                        t_name: $('#txtSearchTypeName').val(),
                        name: $('#txtSearchName').val(),
                        company: $('#txtSearchCompany').val(),
                        l_name: $('#txtSearchLocationName').val(),
                        c_name: $('#txtSearchCombName').val(),
                        order: data.order,
                        start: data.start,
                        length: data.length,

                    }
                    return customData
                }
            },
            columnDefs: [
                {
                    'targets': 0,
                    "orderable": false,
                    "class": "text-center",
                    render: function (data, type, row) {
                        return '<input id="' + data.id + '" type="checkbox">';
                    }
                }, 
                {
                    "class": "text-center",
                    'targets': 10,
                    "orderable": false,
                    render: function (data, type, row) {
                        // console.log(row)
                        return `<button id="${data.id}" class="btn btn-default purchasebtn" role="button"
                        data-toggle="modal" data-target="#inventoryPurchaseModal" title="進貨">
                        <i class="glyphicon glyphicon-log-in"></i></button>
                        <button id="${data.id}" class="btn btn-default salesbtn" role="button"
                        data-toggle="modal" data-target="#inventorySalesModal" title="銷貨">
                        <i class="	glyphicon glyphicon-log-out"></i></button>`
                    }
                },
                {
                    "class": "text-center",
                    'targets': 11,
                    "orderable": false,
                    render: function (data, type, row) {
                        // console.log(row)
                        return `<button id="${data.id}" class="btn btn-primary editbtn btn-circle" role="button"
                        data-toggle="modal" data-target="#inventoryEditModal">
                        <i class="glyphicon glyphicon-edit"></i></button>`
                    }
                }
            ],
            columns: [
                {
                    data: null
                }, 
                {
                    data: "t_name"
                }, 
                {
                    data: "name"
                }, 
                {
                    data: "price"
                }, 
                {
                    data: "company"
                }, 
                {
                    data: "v_name"
                }, 
                {
                    data: "quantity"
                }, 
                {
                    data: "reqquantity"
                }, 
                {
                    data: "l_name"
                }, 
                {
                    data: "c_name"
                }, 
                {
                    data: null
                }, 
                {
                    data: null
                }
            ],
        })
    );

    // table.buttons().container().prependTo( $('.col-sm-6:eq(0)', table.table().container()));
    $('.dt-button').hide();
    table.on('draw.dt', function () {
        bindTableEvent();
    });

    $('#select-all').on('click', function () {
        // Get all rows with search applied
        var rows = table.rows({
            'search': 'applied'
        }).nodes();
        // Check/uncheck checkboxes for all rows in the table
        $('input[type="checkbox"]', rows).prop('checked', this.checked);
    });
}

function bindTableEvent() {
    $('.editbtn').on('click', function () {
        let inventoryID = this.id;

        $.get('/mInventoryEdit', {
            id: inventoryID
        }, function (res) {
            $('#inventoryEditModal .modal-content').html(res);
            //確認按鈕進行checkBlack
            $("#editCheck").on('click', function () {
                //檢驗required 加上has-error css or has-success
                checkBlack();
            })
            $('#inventoryEdit').on('submit', function (event) {
                console.log(inventoryID);
                let vendorId = $('#txtEditInventoryVendor').val(),
                    custodianId = $('#txtEditInventoryCustodian').val(),
                    combId = $('#txtEditInventoryComb').val();
                if (vendorId === '')
                    vendorId = null;
                if (custodianId === '')
                    custodianId = null;
                if (combId === '')
                    combId = null;
                var postData = {
                    head: 'edit',
                    txtEditID: inventoryID,
                    name: $('#txtEditInventoryName').val(),
                    type_id: $('#txtEditInventoryType').val(),
                    location_id: $('#txtEditInventoryLocation').val(),
                    comb_id: combId,
                    price: $('#txtEditInventoryPrice').val(),
                    vendor_id: vendorId,
                    custodian_id: custodianId,
                    img: $('#txtEditImg').attr('src'),
                };
                $.post('/mInventoryModify', {
                    postData: JSON.stringify(postData)
                }, function (error) {
                    if (error.msg) {
                        alert(error.msg);
                        return;
                    } else {
                        window.location.href = "/inventory";
                    }
                })
                event.preventDefault();
            });
            $('#addQuantity').on('submit', function (event) {
                let sumQuantity = +$('#txtEditInventoryQuantity').val() + +$('#txtAddQuantity').val();
                var postData = {
                    id: inventoryID,
                    sumQuantity: sumQuantity
                };
                console.log(postData);
                $.post('/mInvrntoryQuantityModify', {
                    postData: JSON.stringify(postData)
                }, function (error) {
                    if (error.msg) {
                        alert(error.msg);
                        return;
                    } else {
                        var recorddata = {
                            timestamp: $.now(),
                            inventoryname: $('#txtEditInventoryName').val(),
                            operation: 'AddQuantity',
                            quantity: $('#txtAddQuantity').val(),
                            campname: '',
                            price: '',
                            vendorname: '',
                            operator: $('#userinfo').attr("title"),
                            remark: $('#txtAddRemark').val()
                        }
                        writeRecord(recorddata);
                        $('#txtEditInventoryQuantity').val(sumQuantity);
                        $('#inventoryAddQuantityModal').modal('hide');
                    }
                })
                event.preventDefault();
            });
            $('#subtractQuantity').on('submit', function () {
                let sumQuantity = +$('#txtEditInventoryQuantity').val() - +$('#txtSubtractQuantity').val();
                var postData = {
                    id: inventoryID,
                    sumQuantity: sumQuantity
                };
                console.log(postData);
                $.post('/mInvrntoryQuantityModify', {
                    postData: JSON.stringify(postData)
                }, function (error) {
                    if (error.msg) {
                        alert(error.msg);
                        return;
                    } else {
                        var recorddata = {
                            timestamp: $.now(),
                            inventoryname: $('#txtEditInventoryName').val(),
                            operation: 'SubtractQuantity',
                            quantity: $('#txtSubtractQuantity').val(),
                            campname: '',
                            price: '',
                            vendorname: '',
                            operator: $('#userinfo').attr("title"),
                            remark: $('#txtSubtractRemark').val()
                        }
                        writeRecord(recorddata);
                        $('#txtEditInventoryQuantity').val(sumQuantity);
                        $('#inventorySubtractQuantityModal').modal('hide');
                    }
                })
                event.preventDefault();
            })
        });
    });
    //Purchase
    $('.purchasebtn').on('click', function () {
        let inventoryID = this.id
        console.log(inventoryID);
        $.get('/mInventoryPurchaseSalesInfo', {
            id: inventoryID,
            type: 'purchase'
        }, function (res) {
            console.log('res: ' + res);
            $('#inventoryPurchaseModal .modal-content').html(res);
            $('#purchaseMaterial').on('submit', function () {
                var postData = {
                    id: inventoryID,
                    sumQuantity: +$('#txtPurchaseOriQuantity').val() + +$('#txtPurchaseQuantity').val(),
                };
                console.log(postData);
                $.post('/mInvrntoryQuantityModify', {
                    postData: JSON.stringify(postData)
                }, function (error) {
                    if (error.msg) {
                        alert(error.msg);
                        return;
                    } else {
                        var recorddata = {
                            timestamp: $.now(),
                            inventoryname: $('#txtPurchaseName').val(),
                            operation: 'Purchase',
                            quantity: $('#txtPurchaseQuantity').val(),
                            campname: '',
                            price: $('#txtPurchasePrice').val(),
                            vendorname: $('#txtPurchaseVendor').val(),
                            operator: $('#userinfo').attr("title"),
                            remark: $('#txtPurchaseRemark').val()
                        }
                        writeRecord(recorddata);
                        window.location.href = "/inventory";
                    }
                })
                event.preventDefault();
            })
        })
    })
    //Sales
    $('.salesbtn').on('click', function () {
        let inventoryID = this.id
        console.log(inventoryID);
        $.get('/mInventoryPurchaseSalesInfo', {
            id: inventoryID,
            type: 'sales'
        }, function (res) {
            console.log('res: ' + res);
            $('#inventorySalesModal .modal-content').html(res);
            $('#salesMaterial').on('submit', function () {
                var postData = {
                    id: inventoryID,
                    sumQuantity: +$('#txtSalesOriQuantity').val() - +$('#txtSalesQuantity').val(),
                };
                console.log(postData);
                $.post('/mInvrntoryQuantityModify', {
                    postData: JSON.stringify(postData)
                }, function (error) {
                    if (error.msg) {
                        alert(error.msg);
                        return;
                    } else {
                        var recorddata = {
                            timestamp: $.now(),
                            inventoryname: $('#txtSalesName').val(),
                            operation: 'Sales',
                            quantity: $('#txtSalesQuantity').val(),
                            campname: '',
                            price: '',
                            vendorname: '',
                            operator: $('#userinfo').attr("title"),
                            remark: $('#txtSalesRemark').val()
                        }
                        writeRecord(recorddata);
                        window.location.href = "/inventory";
                    }
                })
                event.preventDefault();
            })
        })
    })

    $(".modalfar").on("hidden.bs.modal", function () {
        $('input').val('');
    })
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#itemImg').attr('src', e.target.result);
            $('#txtEditImg').attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
    }
    $('#itemImg').show();
    $('#txtEditImg').show();
}

function writeRecord(data) {
    let postData = data;
    console.log('record: ' + postData);
    $.post('/mModifyRecord', {
        postData: JSON.stringify(postData)
    }, function (error) {
        if (error.msg) {
            alert(error.msg);
            return;
        } else {
            // window.location.href = "/inventory";
        }
    })

    /*
                        var recorddata = {
                            timestamp: $.now(),
                            inventoryname: postData.name,
                            operation: 'ModifyInfo',
                            quantity: '',
                            campname: '',
                            price: postData.price,
                            vendorname

                        }
    */

}