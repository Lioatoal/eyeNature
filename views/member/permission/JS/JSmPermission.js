/*
 * Init First!
 */
var table;
initialize();

/*
 * Search permission
 */

$('#permInquiry').submit(function (e) {
    e.preventDefault();
    table.draw() //refresh table
})

/*
 * Create permission
 */
$('#add').on('click', function () {
    $.get('/mPermissionCreate', function (res) {
        $('#permCreateModal .modal-content').html(res);
        $('#createSubmit').on('click', function (event) {
            var postData = {
                head: 'create',
                txtCreateRoleID: parseInt($('#txtCreateRoleID').val()),
                // txtCreateModuleID: parseInt($('#txtCreateModuleName').val()),
                txtCreateModuleID: $('#txtCreateModuleName').val(),
                txtCreateCREATE: $('#txtCreateCREATE')[0].checked,
                txtCreateUPDATE: $('#txtCreateUPDATE')[0].checked,
                txtCreateDELETE: $('#txtCreateDELETE')[0].checked,
                txtCreateIMPORT: $('#txtCreateIMPORT')[0].checked,
                txtCreateEXPORT: $('#txtCreateEXPORT')[0].checked
            };
            $.post('/mPermissionModify', {
                postData: JSON.stringify(postData)
            }, function (error) {
                if (error.msg) {
                    $('#createMsgArea').removeClass('text-success').addClass('text-danger').text('權限新增失敗:' + error.msg)
                } else {
                    $('#createMsgArea').removeClass('text-danger').addClass('text-success').text('權限新增成功')
                    table.draw();
                    setTimeout(function () {
                        $('#createMsgArea').empty()
                        $('#permCreateModal').modal("hide")
                    }, 1500);
                }
            });
            event.preventDefault();
        })
        bindModuleOption();
    })
})

/*
 * Delete permission
 */
$('#delete').on('click', function () {
    if ($.fn.DataTable.isDataTable('#permDelTable'))
        $('#permDelTable').DataTable().destroy();
    $('#delMsgArea').text('');

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
    $('#permDelTable').DataTable(
        $.extend(tbConfig, {
            paging: false,
            ordering: false,
            data: datas,
            columnDefs: [{
                'targets': 2,
                "orderable": false,
                render: function (data, type, row) {
                    htmlEle = ''
                    if (data.permQUERY === '1') {
                        htmlEle += '<span class="label label-primary"><i class="glyphicon glyphicon-eye-open"></i> 查詢</span>&nbsp;'
                    }
                    if (data.permCREATE === '1') {
                        htmlEle += '<span class="label label-success"><i class="glyphicon glyphicon-plus"></i> 新增</span>&nbsp;'
                    }
                    if (data.permUPDATE === '1') {
                        htmlEle += '<span class="label label-warning"><i class="glyphicon glyphicon-pencil"></i> 編輯</span>&nbsp;'
                    }
                    if (data.permDELETE === '1') {
                        htmlEle += '<span class="label label-danger"><i class="glyphicon glyphicon-trash"></i> 刪除</span>&nbsp;'
                    }
                    if (data.permIMPORT === '1') {
                        htmlEle += '<span class="label label-info"><i class="glyphicon glyphicon-trash"></i> 匯入</span>&nbsp;'
                    }
                    if (data.permEXPORT === '1') {
                        htmlEle += '<span class="label label-info"><i class="glyphicon glyphicon-trash"></i> 匯出</span>&nbsp;'
                    }
                    // console.log(row)
                    return htmlEle
                }
            }],
            columns: [{
                    data: "r_descr"
                },
                {
                    data: "m_descr"
                },
                {
                    data: null
                }
            ]
        })
    );
})
$('#delSubmit').on('click', function () {
    // var delData = $('#permDelTable tbody tr');
    var delData = $('#permDelTable').DataTable().data();
    var postData = [];

    for (var i = 0; i < delData.length; i++) {
        postData.push(parseInt(delData[i].id));
    }

    $.post('/mPermissionDel', {
        postData: JSON.stringify(postData)
    }, function (error) {
        if (error.msg) {
            $('#delMsgArea').removeClass('text-success').addClass('text-danger').text('權限刪除失敗:' + error.msg)
        } else {
            $('#delMsgArea').removeClass('text-danger').addClass('text-success').text('權限刪除成功')
            table.draw();
            setTimeout(function () {
                $('#delMsgArea').empty()
                $('#permDelModal').modal("hide")
            }, 1500);
        }
    });
})

function initialize() {
    let tbConfig = getDataTableConfig();
    table = $('#permTable').DataTable(
        $.extend(tbConfig, {
            ajax: {
                url: "/mPermRoleData",
                data: function (data) {
                    let customData = {
                        order: data.order,
                        start: data.start,
                        length: data.length,
                        roleSelect: $('#roleSelect').val(),
                        moduleSelect: $('#moduleSelect').val(),
                        txtSearchPermission: $('#txtSearchPermission').val()
                    }
                    return customData
                }
            },
            columnDefs: [{
                    targets: 0,
                    visible: true,
                    orderable: false,
                    class: "text-center",
                    // defaultContent: '<div class="checkbox"><input type="checkbox"></div>',
                    render: function (data, type, row) {
                        return '<input type="checkbox">';
                    }
                },
                {
                    'targets': 3,
                    "orderable": false,
                    render: function (data, type, row) {
                        var htmlEle = ''
                        if (data.permQUERY === '1') {
                            htmlEle += '<span class="label label-primary"><i class="glyphicon glyphicon-eye-open"></i> 查詢</span>&nbsp;'
                        }
                        if (data.permCREATE === '1') {
                            htmlEle += '<span class="label label-success"><i class="glyphicon glyphicon-plus"></i> 新增</span>&nbsp;'
                        }
                        if (data.permUPDATE === '1') {
                            htmlEle += '<span class="label label-warning"><i class="glyphicon glyphicon-pencil"></i> 編輯</span>&nbsp;'
                        }
                        if (data.permDELETE === '1') {
                            htmlEle += '<span class="label label-danger"><i class="glyphicon glyphicon-trash"></i> 刪除</span>&nbsp;'
                        }
                        if (data.permIMPORT === '1') {
                            htmlEle += '<span class="label label-info"><i class="glyphicon glyphicon-trash"></i> 匯入</span>&nbsp;'
                        }
                        if (data.permEXPORT === '1') {
                            htmlEle += '<span class="label label-info"><i class="glyphicon glyphicon-trash"></i> 匯出</span>&nbsp;'
                        }
                        // console.log(row)
                        return htmlEle
                    }
                },
                {
                    "class": "text-center",
                    'targets': 4,
                    "orderable": false,
                    render: function (data, type, row) {
                        // console.log(row)
                        return `<button id="${data.id}" class="btn btn-primary editbtn btn-circle" role="button"
                        data-toggle="modal" data-target="#permEditModal">
                        <i class="glyphicon glyphicon-edit"></i></button>`
                    }
                },

            ],
            columns: [{
                    data: null
                },
                {
                    data: "r_descr"
                },
                {
                    data: "m_descr"
                }, {
                    data: null
                }, {
                    data: null
                },
            ],
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
    //Edit permission
    $('.editbtn').on('click', function () {
        permId = this.id
        $.get('/mPermissionModify', {
            id: permId
        }, function (res) {
            console.log(res)
            $('#permEditModal .modal-content').html(res);
            $('#editSubmit').on('click', function (event) {
                var postData = {
                    head: 'edit',
                    txtEditRoleID: permId,
                    txtEditCREATE: $('#txtEditCREATE')[0].checked,
                    txtEditUPDATE: $('#txtEditUPDATE')[0].checked,
                    txtEditDELETE: $('#txtEditDELETE')[0].checked,
                    txtEditIMPORT: $('#txtEditIMPORT')[0].checked,
                    txtEditEXPORT: $('#txtEditEXPORT')[0].checked
                };
                $.post('/mPermissionModify', {
                    postData: JSON.stringify(postData)
                }, function (error) {
                    if (error.msg) {
                        $('#editMsgArea').removeClass('text-success').addClass('text-danger').text('權限修改失敗:' + error.msg)
                    } else {
                        $('#editMsgArea').removeClass('text-danger').addClass('text-success').text('權限修改成功')
                        table.draw();
                        setTimeout(function () {
                            $('#editMsgArea').empty()
                            $('#permEditModal').modal("hide")
                        }, 1500);
                    }
                })
                event.preventDefault();
            })
        })
    });
}

function bindModuleOption() {
    let option = {},
        temp = '',
        headName;
    for (const i in modules) {
        option[modules[i].head] = [];
    }
    for (const i in modules) {
        option[modules[i].head].push(modules[i])
    }

    for (const i in option) {
        temp += '<option value="' + i + '">' + i + '</option>';
    }
    $('#txtCreateModuleHead').html(temp);
    headName = $('#txtCreateModuleHead').val();
    temp = '';
    for (const i in option[headName]) {
        temp += '<option value="' + option[headName][i].id + '">' + option[headName][i].body + '</option>';
    }
    $('#txtCreateModuleName').html(temp);

    $('#txtCreateModuleHead').on('change', function () {
        let headName = this.value;
        if (headName == "人員管理" || headName == "物料管理") {
            $('.createIMPORT').show();
            $('.createEXPORT').show();
        } else {
            $('.createIMPORT').hide();
            $('.createEXPORT').hide();
        }
        temp = '';
        for (const i in option[headName]) {
            temp += '<option value="' + option[headName][i].id + '">' + option[headName][i].body + '</option>';
        }
        $('#txtCreateModuleName').html(temp);
    })

    $('#txtCreateModuleName').on('change', function () {
        let headName = this.value;
        if (headName == "3-1" || headName == "3-2" || headName == "3-3" || headName == "4-1") {
            $('.createIMPORT').show();
            $('.createEXPORT').show();
        } else {
            $('.createIMPORT').hide();
            $('.createEXPORT').hide();
        }
    })

    $('.createIMPORT').hide();
    $('.createEXPORT').hide();
}