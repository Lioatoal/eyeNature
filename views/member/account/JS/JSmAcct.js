/*
 * Init First!
*/
var table;
initialize();

/*
 * Create Account
 */
$('#add').on('click', function () {
    $.get('/mAcctCreate', function (res) {
        $('#acctCreateModal .modal-content').html(res);
        //確認按鈕進行checkBlack
        $("#createCheck").on('click', function () {
            //檢驗required 加上has-error css or has-success
            checkBlack();
        })
        rolePersonnalSelectOption('#txtCreateAcctPersonnel', 1, null);
        $('#txtCreateAcctRole').change(function () {
            rolePersonnalSelectOption('#txtCreateAcctPersonnel', this.value, null);
        })
        $('#acctCreate').on('submit', function (event) {
            var postData = {
                head: 'create',
                txtCreateAcctEmail: $('#txtCreateAcctEmail').val(),
                txtCreateAcctName: $('#txtCreateAcctName').val(),
                txtCreateAcctRole: $('#txtCreateAcctRole').val(),
                txtCreateAcctPwd: $('#txtCreateAcctPwd').val(),
                txtCreateAcctActive: $("input[name='txtCreateAcctActive']:checked").val(),
                txtCreateAcctRemark: $('#txtCreateAcctRemark').val(),
                txtCreateAcctPersonnel: $('#txtCreateAcctPersonnel').val()
            };
            // console.log('PostData: ' + JSON.stringify(postData));
            $.post('/mAcctModify', { postData: JSON.stringify(postData) }, function (error) {
                if (error.msg) {
                    $('#creatMsgArea').removeClass('text-success').addClass('text-danger').text('帳號新增失敗:' + error.msg)
                } else {
                    $('#creatMsgArea').removeClass('text-danger').addClass('text-success').text('帳號新增成功')
                    table.draw();
                    setTimeout(function () {
                        $('#creatMsgArea').empty()
                        $('#acctCreateModal').modal("hide")
                    }, 1500);
                }
            });
            event.preventDefault();
        })
    })
})

//Delete Acct
$('#delete').on('click', function () {
    if ($.fn.DataTable.isDataTable('#acctDelTable'))
        $('#acctDelTable').DataTable().destroy();
    $('#delMsgArea').text('');

    let datas = [];
    let nodes = table.column(0).nodes();
    $.each(nodes, (i, d) => {
        if ($(d).find('input').prop('checked')) {
            // console.log(i)
            datas.push(table.row(i).data());
        }
    })

    let tbConfig = getDataTableConfig();
    tbConfig.serverSide = false;

    $('#acctDelTable').DataTable(
        $.extend(tbConfig, {
            paging: false,
            ordering: false,
            data: datas,
            columnDefs: [
                {
                    'targets': 3,
                    "orderable": false,
                    render: function (data, type, row) {
                        var htmlEle = ''
                        if (data.enable === 1) {
                            htmlEle += '<span class="label label-primary"><i class="glyphicon glyphicon-ok-circle"></i> 啟　用</span>'
                        } else {
                            htmlEle += '<span class="label label-danger"><i class="glyphicon glyphicon-ban-circle"></i> 未啟用</span>'
                        }
                        return htmlEle;
                    }
                }
            ],
            columns: [
                {
                    data: "email"
                },
                {
                    data: "name"
                },
                {
                    data: "r_descr"
                },
                {
                    data: null
                }
            ]
        })
    );
})
$('#delSubmit').on('click', function () {
    var delData = $('#acctDelTable').DataTable().data();
    // var delData = $('#acctDelTable tbody tr');
    var postData = [];

    for (var i = 0; i < delData.length; i++) {
        postData.push(delData[i].email);
        // console.log(delData[i].email);
    }

    $.post('/mAcctDelete', { postData: JSON.stringify(postData) }, function (error) {
        if (error.msg) {
            $('#delMsgArea').removeClass('text-success').addClass('text-danger').text('帳號刪除失敗:' + error.msg)
        } else {
            $('#delMsgArea').removeClass('text-danger').addClass('text-success').text('帳號刪除成功')
            table.draw();
            setTimeout(function () {
                $('#delMsgArea').empty()
                $('#acctDelModal').modal("hide")
            }, 1500);
        }
    });
})

$('#inquiry').submit(function (e) {
    e.preventDefault();
    table.draw() //refresh table
})

function initialize() {
    let tbConfig = getDataTableConfig();
    table = $('#acctTable').DataTable(
        $.extend(tbConfig, {
            ajax: {
                url: "/mAcctRowData",
                data: function (data) {
                    let customData = {
                        email: $("#txtSearchAcctEmail").val(),
                        name: $("#txtSearchAcctName").val(),
                        roleID: $("#txtSearchAcctRole").val(),
                        enable: $("#txtSearchAcctEnable").val(),
                        order: data.order,
                        start: data.start,
                        length: data.length
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
                    'targets': 4,
                    "orderable": false,
                    render: function (data, type, row) {
                        var htmlEle = ''
                        if (data.enable === 1) {
                            htmlEle += '<span class="label label-primary"><i class="glyphicon glyphicon-ok-circle"></i> 啟　用</span>'
                        } else {
                            htmlEle += '<span class="label label-danger"><i class="glyphicon glyphicon-ban-circle"></i> 未啟用</span>'
                        }
                        return htmlEle;
                    }
                },
                {
                    "class": "text-center",
                    'targets': 5,
                    "orderable": false,
                    render: function (data, type, row) {
                        return `<button id="${data.email}" class="btn btn-primary editbtn btn-circle" role="button"
                        data-toggle="modal" data-target="#acctEditModal">
                        <i class="glyphicon glyphicon-edit"></i></button>`
                    }
                }
            ],
            columns: [
                {
                    data: null
                },
                {
                    data: "email"
                },
                {
                    data: "name"
                },
                {
                    data: "r_descr"
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
        var email = this.id
        $.get('/mAcctModify', { email: email }, function (res) {
            $('#acctEditModal .modal-content').html(res);
            //確認按鈕進行checkBlack
            $("#editCheck").on('click', function () {
                //檢驗required 加上has-error css or has-success
                checkBlack();
            })
            //get txtEditAcctPersonnel option value from ejs
            let acctPersonnelID = $('#txtEditAcctPersonnel').val();
            let roleID = $('#txtEditAcctRole').val();
            // rolePersonnalSelectOption(roleID, '#txtEditAcctPersonnel',acctPersonnelID);
            rolePersonnalSelectOption('#txtEditAcctPersonnel', roleID, acctPersonnelID);

            $('#txtEditAcctRole').change(function () {
                rolePersonnalSelectOption('#txtEditAcctPersonnel', this.value, null);
            });


            $('#acctEdit').on('submit', function (event) {
                var postData = {
                    head: 'edit',
                    txtEditAcctEmail: email,
                    txtEditAcctName: $('#txtEditAcctName').val(),
                    txtEditAcctRole: $('#txtEditAcctRole').val(),
                    txtEditAcctPwd: $('#txtEditAcctPwd').val(),
                    txtEditAcctRemark: $('#txtEditAcctRemark').val(),
                    txtEditAcctActive: $('#txtEditAcctActive')[0].checked,
                    txtEditAcctPersonnel: $('#txtEditAcctPersonnel').val()
                }
                $.post('/mAcctModify', {
                    postData: JSON.stringify(postData)
                }, function (error) {
                    if (error.msg) {
                        $('#editMsgArea').removeClass('text-success').addClass('text-danger').text('帳號修改失敗:' + error.msg)
                    } else {
                        $('#editMsgArea').removeClass('text-danger').addClass('text-success').text('帳號修改成功')
                        table.draw();
                        setTimeout(function () {
                            $('#editMsgArea').empty()
                            $('#acctEditModal').modal("hide")
                        }, 1500);
                    }
                })
                event.preventDefault();
            })
        })
    });
}
/*
@param:
    htmlSelectID : 要bind option select 的id
    roleID : 所選擇的腳色ID
    acctPersonnelID: 要預設selected的option value ,若沒有則傳入空字串 ''
*/
function rolePersonnalSelectOption(htmlSelectID, roleID, acctPersonnelID) {
    $.get('/mAcctPersonnel', { roleID: roleID }, function (res) {
        let acctPersonnelList = res;
        let text = '';
        if (roleID === '5' || roleID === '6') {
            for (var i in acctPersonnelList) {
                if(acctPersonnelID == acctPersonnelList[i].id){
                    text += `<option value='${acctPersonnelList[i].id}' selected>${acctPersonnelList[i].company}-${acctPersonnelList[i].name}</option>`;
                } else {
                    text += `<option value='${acctPersonnelList[i].id}'>${acctPersonnelList[i].company}-${acctPersonnelList[i].name}</option>`;
                }
            }
        } else {
            for (var i in acctPersonnelList) {
                if(acctPersonnelID == acctPersonnelList[i].id){
                    text += `<option value='${acctPersonnelList[i].id}' selected>${acctPersonnelList[i].name}-${acctPersonnelList[i].nickname}</option>`;
                } else {
                    text += `<option value='${acctPersonnelList[i].id}'>${acctPersonnelList[i].name}-${acctPersonnelList[i].nickname}</option>`;
                }
            }
        }
        $(htmlSelectID).html(text);
    });
}