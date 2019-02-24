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
    $.get('/mCampCreate', function (res) {
        $('#campCreateModal .modal-content').html(res);
        

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
            console.log(postData);
            $.post('/mCampModify', {
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

    var datas = [];
    var nodes = table.column(0).nodes();
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
    $.post('/mCampDelete', {
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
        console.log(res);
        xlsxFile = res;
        $.ajax({
            url: '/mCampImport',
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
    window.open('/mCampExport', '_self')
})

function initialize() {
    let tbConfig = getDataTableConfig();
    table = $('#campTable').DataTable(
        $.extend(tbConfig, {
            ajax: {
                url: "/mCampRowData",
                data: function (data) {
                    let customData = {
                        name: $('#txtSearchCampName').val(),
                        typeId: $('#txtSearchCampTypeId').val(),
                        dayNumber: $('#txtSearchCampDayNumber').val(),
                        outbound: $('#txtSearchCampOutbound').val(),
                        iswork: $('#txtSearchCampIswork').val(),
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
                        return '<input id="' + data.camp_id + '" type="checkbox">';
                    }
                },
                {
                    "class": "text-center",
                    'targets': 3,
                    "orderable": true,
                    render: function (data, type, row) {
                        var htmlEle = ''
                        if (data === 1) {
                            htmlEle += '<span class="label label-primary"> 外　出</span>'
                        } else {
                            htmlEle += '<span class="label label-danger"> 室內課</span>'
                        }
                        return htmlEle;
                    }
                },{
                    "class": "text-center",
                    'targets': 7,
                    "orderable": true,
                    render: function (data, type, row) {
                        var htmlEle = ''
                        if (data === 1) {
                            htmlEle += '<span class="label label-primary"><i class="glyphicon glyphicon-ok-circle"></i> 營運中</span>'
                        } else {
                            htmlEle += '<span class="label label-danger"><i class="glyphicon glyphicon-ban-circle"></i> 未營運</span>'
                        }
                        return htmlEle;
                    }
                },{
                    "class": "text-center",
                    'targets': 8,
                    "orderable": true,
                    render: function (data, type, row) {
                        var htmlEle = ''
                        if (data === 1) {
                            htmlEle += '<span class="label label-primary"> 夏令營</span>'
                        } else if(data === 2){
                            htmlEle += '<span class="label label-danger"> 冬令營</span>'
                        } else {
                            htmlEle += '<span class="label label-success"> 平日課</span>'
                        }
                        return htmlEle;
                    }
                },{
                    "class": "text-center",
                    'targets': 9,
                    "orderable": false,
                    render: function (data, type, row) {
                        // console.log(row)
                        return `<button id="${data.camp_id}" class="btn btn-success campInvbtn" role="button"
                        data-toggle="modal" data-target="#campInvModal">物料</button>`
                    }
                },{
                    "class": "text-center",
                    'targets': 10,
                    "orderable": false,
                    render: function (data, type, row) {
                        // console.log(row)
                        return `<button id="${data.camp_id}" class="btn btn-warning campIntro" role="button"
                        data-toggle="modal" data-target="#campIntroModal">簡介</button>`
                    }
                },{
                    "class": "text-center",
                    'targets': 11,
                    "orderable": false,
                    render: function (data, type, row) {
                        // console.log(row)
                        return `<button id="${data.camp_id}" class="btn btn-info campSchedulebtn" role="button"
                        data-toggle="modal" data-target="#campScheduleModal">行程</button>`
                    }
                },{
                    "class": "text-center",
                    'targets': 12,
                    "orderable": false,
                    render: function (data, type, row) {
                        return `<button id="${data.camp_id}" class="btn btn-primary editbtn btn-circle" role="button"
                        data-toggle="modal" data-target="#campEditModal">
                        <i class="glyphicon glyphicon-edit"></i></button>`
                    }
                }
            ],
            columns: [
                {
                    data: null
                }, 
                {
                    data: "camp_name"
                }, 
                {
                    data: "camp_dayNumber"
                }, 
                {
                    data: "camp_outbound"
                }, 
                {
                    data: "camp_grade"
                }, 
                {
                    data: "camp_peopleNumber"
                }, 
                {
                    data: "camp_price"
                }, 
                {
                    data: "camp_iswork"
                }, 
                {
                    data: "camp_typeId"
                }, 
                {
                    data: null
                }, 
                {
                    data: null
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

        $.get('/mCampEdit', {
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
                $.post('/mCampModify', {
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

    $(".modalfar").on("hidden.bs.modal", function () {
        $('input').val('');
    })
}

// function readURL(input) {
//     if (input.files && input.files[0]) {
//         var reader = new FileReader();

//         reader.onload = function (e) {
//             $('#itemImg').attr('src', e.target.result);
//             $('#txtEditImg').attr('src', e.target.result);
//         };

//         reader.readAsDataURL(input.files[0]);
//     }
//     $('#itemImg').show();
//     $('#txtEditImg').show();
// }