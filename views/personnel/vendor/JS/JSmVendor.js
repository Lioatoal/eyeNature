/*
 * Init First!
 */
var table;
initialize();

/*
 * Create Vendor
 */
$('#add').on('click', function () {
    $.get('/mVendorCreate', function (res) {
        $("#vendorCreateModal .modal-content").html(res);
        //確認按鈕進行checkBlack
        bindCreateEvent();
    })
})


/*
 * Delete Vendor
 */
$('#delete').on('click', function () {
    if ($.fn.DataTable.isDataTable('#vendorDelTable'))
        $('#vendorDelTable').DataTable().destroy();

    var datas = [];
    var nodes = table.column(0).nodes();
    $.each(nodes, (i, d) => {
        if ($(d).find('input').prop('checked')) {
            // console.log(i)
            datas.push(table.row(i).data());
        }
    })

    let tbConfig = getDataTableConfig();
    tbConfig.serverSide = false;
    $('#vendorDelTable').DataTable(
        $.extend(tbConfig, {
            paging: false,
            ordering: false,
            data: datas,
            columnDefs: [
                {
                    'targets': 7,
                    "orderable": false,
                    render: function (data, type, row) {
                        var htmlEle = ''
                        if (data.iswork === 1) {
                            htmlEle += '<span class="label label-primary"><i class="glyphicon glyphicon-ok-circle"></i> 合作中</span>'
                        } else {
                            htmlEle += '<span class="label label-danger"><i class="glyphicon glyphicon-ban-circle"></i> 未合作</span>'
                        }
                        return htmlEle;
                    }
                }
            ],
            columns: [{
                    data: "type"
                },
                {
                    data: "company"
                },
                {
                    data: "name"
                },
                {
                    data: "phone"
                },
                {
                    data: "extension"
                },
                {
                    data: "cellphone"
                },
                {
                    data: "fax"
                },
                {
                    data: null
                }
            ]
        })
    );
})

$('#delSubmit').on('click', function () {
    var delData = $('#vendorDelTable').DataTable().data();
    var postData = [];

    for (var i = 0; i < delData.length; i++) {
        postData.push(delData[i].id);
        console.log(delData[i].id);
    }

    $.post('/mVendorDelete', {
        postData: JSON.stringify(postData)
    }, function (error) {
        if (error.msg) {
            $('#delMsgArea').removeClass('text-success').addClass('text-danger').text('廠商刪除失敗:' + error.msg)
        } else {
            $('#delMsgArea').removeClass('text-danger').addClass('text-success').text('廠商刪除成功')
            table.draw();
            setTimeout(function () {
                $('#delMsgArea').empty()
                $('#vendorDelModal').modal("hide")
            }, 1500);
        }
    });
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
            url: '/mVendorImport',
            method: 'POST',
            data: xlsxFile,
            contentType: "application/octet-stream",
            processData: false,
            cache: false,
            success: function (error) {
                if (error.msg) {
                    if (confirm(error.msg)) {
                        window.location.href = "/vendor";
                    } else {
                        return;
                    }
                } else {
                    window.location.href = "/vendor";
                }
            }
        })
    });
})

$('#export').on('click', function () {
    window.open('/mVendorExport', '_self')
})

$('#inquiry').submit(function (e) {
    e.preventDefault();
    table.draw() //refresh table
})

function initialize() {
    let tbConfig = getDataTableConfig();
    table = $('#vendorTable').DataTable(
        $.extend(tbConfig, {
            ajax: {
                url: "/mVendorRowData",
                data: function (data) {
                    let customData = {
                        type: $('#type').val(),
                        company: $('#company').val(),
                        name: $('#name').val(),
                        phone: $('#phone').val(),
                        cellphone: $('#cellphone').val(),
                        iswork: $('#iswork').val(),
                        start: data.start,
                        length: data.length,
                        order: data.order
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
                        return '<input type="checkbox">';
                    }
                },
                {
                    "class": "text-center",
                    'targets': 8,
                    "orderable": false,
                    render: function (data, type, row) {
                        var htmlEle = ''
                        if (data.iswork === 1) {
                            htmlEle += '<span class="label label-primary"><i class="glyphicon glyphicon-ok-circle"></i> 合作中</span>'
                        } else {
                            htmlEle += '<span class="label label-danger"><i class="glyphicon glyphicon-ban-circle"></i> 未合作</span>'
                        }
                        return htmlEle;
                    }
                },
                {
                    "class": "text-center",
                    'targets': 9,
                    "orderable": false,
                    render: function (data, type, row) {
                        return `<button id="${data.id}" class="btn btn-primary editbtn btn-circle" role="button"
                    data-toggle="modal" data-target="#vendorEditModal">
                    <i class="glyphicon glyphicon-edit"></i></button>`
                    }
                }
            ],
            columns: [
                {
                    data: null
                },
                {
                    data: "type"
                },
                {
                    data: "company"
                },
                {
                    data: "name"
                },
                {
                    data: "phone"
                },
                {
                    data: "extension"
                },
                {
                    data: "cellphone"
                },
                {
                    data: "fax"
                },
                {
                    data: null
                },
                {
                    data: null
                }
            ]
        })
    );

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
    //Edit vendor
    $('.editbtn').on('click', function () {
        console.log(this.id);
        var id = this.id;
        // bindEditData(this.id);
        $.get('/mVendorEdit', {
            id: id
        }, function (res) {
            $('#vendorEditModal .modal-content').html(res);
            bindEditEvent(id);
        });
    });
}

function bindCreateEvent() {
    $("#createCheck").on('click', function () {
        //檢驗required 加上has-error css or has-success 
        checkBlack();
    })

    $("#vendorCreate").on('submit', function (event) {
        var postData = {
            head: 'create',
            company: $('#txtCreateVendorCompany').val(),
            type_id: $('#txtCreateVendorType').val(),
            name: $('#txtCreateVendorName').val(),
            title: $('#txtCreateVendorTitle').val(),
            jobagent: $('#txtCreateEditVendorAgent').val(),
            phone: $('#txtCreateVendorPhone').val(),
            extension: $('#txtCreateVendorExtension').val(),
            cellphone: $('#txtCreateVendorCellphone').val(),
            fax: $('#txtCreateVendorFax').val(),
            facebook: $('#txtCreateVendorFacebook').val(),
            email: $('#txtCreateVendorEmail').val(),
            line: $('#txtCreateVendorLine').val(),
            wechat: $('#txtCreateVendorWechat').val(),
            address: $('#txtCreateVendorAddr').val(),
            bankcode: $('#txtCreateVendorBankcode').val(),
            bankaccount: $('#txtCreateVendorBankacct').val(),
            bankname: $('#txtCreateVendorBankname').val(),
            iswork: $("input[name='txtCreateVendorIswork']:checked").val(),
            remark: $('#txtCreateVendorRemark').val(),
        };

        $.post('/mVendorModify', {
            postData: JSON.stringify(postData)
        }, function (error) {
            if (error.msg) {
                $('#createMsgArea').removeClass('text-success').addClass('text-danger').text('廠商新增失敗:' + error.msg)
            } else {
                $('#createMsgArea').removeClass('text-danger').addClass('text-success').text('廠商新增成功')
                table.draw();
                setTimeout(function () {
                    $('#createMsgArea').empty()
                    $('#vendorCreateModal').modal("hide")
                }, 1500);
            }
        });
        event.preventDefault();
    });
}

function bindEditEvent(id) {
    //確認按鈕進行checkBlack
    $("#editCheck").on('click', function () {
        //檢驗required 加上has-error css or has-success
        checkBlack();
    })

    $('#vendorEdit').on('submit', function (event) {
        var postData = {
            head: 'edit',
            txtEditID: id,
            company: $('#txtEditVendorCompany').val(),
            type_id: $('#txtEditVendorType').val(),
            name: $('#txtEditVendorName').val(),
            title: $('#txtEditVendorTitle').val(),
            jobagent: $('#txtEditEditVendorAgent').val(),
            phone: $('#txtEditVendorPhone').val(),
            extension: $('#txtEditVendorExtension').val(),
            cellphone: $('#txtEditVendorCellphone').val(),
            fax: $('#txtEditVendorFax').val(),
            facebook: $('#txtEditVendorFacebook').val(),
            email: $('#txtEditVendorEmail').val(),
            line: $('#txtEditVendorLine').val(),
            wechat: $('#txtEditVendorWechat').val(),
            address: $('#txtEditVendorAddr').val(),
            bankcode: $('#txtEditVendorBankcode').val(),
            bankaccount: $('#txtEditVendorBankacct').val(),
            bankname: $('#txtEditVendorBankname').val(),
            iswork: $('#txtEditVendorIswork')[0].checked,
            remark: $('#txtEditVendorRemark').val(),
        }
        console.log("ISWORK: " + $("input[name='txtEditVendorIswork']:checked").val());
        $.post('/mVendorModify', {
            postData: JSON.stringify(postData)
        }, function (error) {
            if (error.msg) {
                $('#editMsgArea').removeClass('text-success').addClass('text-danger').text('廠商修改失敗:' + error.msg)
            } else {
                $('#editMsgArea').removeClass('text-danger').addClass('text-success').text('廠商修改成功')
                table.draw();
                setTimeout(function () {
                    $('#editMsgArea').empty()
                    $('#vendorEditModal').modal("hide")
                }, 1500);
            }
        })
        event.preventDefault();
    })

}