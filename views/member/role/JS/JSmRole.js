/*
 * Init First!
*/
var table;
initialize();

/*
 * Add Role
 */
//確認按鈕進行checkBlack
$("#createCheck").on('click',function(){
    //檢驗required 加上has-error css or has-success 
    checkBlack();
})
$("#roleCreate").on('submit',function(event) {
    var postData = {
        head: 'create',
        txtRoleName: $('#txtRoleName').val(),
        txtRoleDescr: $('#txtRoleDescr').val(),
    };
    // console.log(postData);
    $.post('/mRoleModify', {
        postData: JSON.stringify(postData)
    }, function(error) {
        // if (error.msg) {
        //     alert(error.msg);
        //     return;
        // } else {
        //     window.location.href = "/mRole";
        // }
        if (error.msg) {
            $('#creatMsgArea').removeClass('text-success').addClass('text-danger').text('角色新增失敗:' + error.msg)
        } else {
            $('#creatMsgArea').removeClass('text-danger').addClass('text-success').text('角色新增成功')
            table.draw();
            setTimeout(function () {
                $('#creatMsgArea').empty()
                $('#roleCreateModal').modal("hide")
            }, 1500);
        }
    });
    event.preventDefault();
});

/*
 * Delete Role
 */
$('#delete').on('click',function () {
    if ($.fn.DataTable.isDataTable('#roleDelTable'))
        $('#roleDelTable').DataTable().destroy();
    $('#delMsgArea').text('');
    
    var datas = [];
    var nodes = table.column(0).nodes();
    $.each(nodes, (i,d) => {
        if($(d).find('input').prop('checked')){
            // console.log(i)
            datas.push(table.row(i).data());
        }
    })

    let tbConfig = getDataTableConfig();
    tbConfig.serverSide = false;
    $('#roleDelTable').DataTable(
        $.extend(tbConfig, {
            paging: false,
            ordering: false,
            data:datas,
            columns: [
                {
                    data: "r_name"
                },
                {
                    data: "r_descr"
                }, 
            ]
        })
    );
})
$('#delSubmit').on('click',function () {
    // var delData = $('#roleDelTable tbody tr');
    var delData = $('#roleDelTable').DataTable().data();
    // console.log(delData[0].id);
    var postData = [];

    for (var i = 0; i < delData.length; i++) {
        postData.push(parseInt(delData[i].id));
    }
    // console.log(postData);
    $.post('/mRoleDelete', { postData: JSON.stringify(postData) }, function (error) {
        if (error.msg) {
            $('#delMsgArea').removeClass('text-success').addClass('text-danger').text('角色刪除失敗:' + error.msg)
        } else {
            $('#delMsgArea').removeClass('text-danger').addClass('text-success').text('角色刪除成功')
            table.draw();
            setTimeout(function () {
                $('#delMsgArea').empty()
                $('#roleDelModal').modal("hide")
            }, 1500);
        }
    });


});

function initialize(){
    let tbConfig = getDataTableConfig();
    table = $('#roleTable').DataTable(
        $.extend(tbConfig, {
            ajax: {
                url: "/mRoleRowData",
                data: function (data) {
                    let customData = {
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
                    render: function(data, type, row) {
                        return '<input id="'+ data.id + '" type="checkbox">';
                    }
                },
                {
                    "class": "text-center",
                    'targets': 3,
                    "orderable": false,
                    render: function (data, type, row) {
                        // console.log(row)
                        return `<button id="${data.id}" class="btn btn-primary editbtn btn-circle" role="button"
                        data-toggle="modal" data-target="#roleEditModal">
                        <i class="glyphicon glyphicon-edit"></i></button>`
                    }
                }
            ],
            columns: [
                {
                    data: null
                },
                {
                    data: "r_name"
                },
                {
                    data: "r_descr"
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
    
    $(".modal").on("hidden.bs.modal", function () {
        $('input').val('');
    })
}

function bindTableEvent(){
    $('.editbtn').on('click',function() {
        roleID = this.id;
        //todo 改成非EJS QUERY! 只QUERY JSON
        $.get('/mRoleModify', {id: roleID}, function (res) {
            $('#roleEditModal .modal-content').html(res);
             //確認按鈕進行checkBlack
            $("#editCheck").on('click',function(){
                //檢驗required 加上has-error css or has-success
                checkBlack();
            })
            $('#roleEdit').on('submit',function (event) {
                var postData = {
                    head: 'edit',
                    txtEditID: roleID,
                    txtEditRoleName: $('#txtEditRoleName').val(),
                    txtEditRoleDescr: $('#txtEditRoleDescr').val(),
                };
                $.post('/mRoleModify', {
                    postData: JSON.stringify(postData)
                }, function (error) {
                    if (error.msg) {
                        $('#editMsgArea').removeClass('text-success').addClass('text-danger').text('角色修改失敗:' + error.msg)
                    } else {
                        $('#editMsgArea').removeClass('text-danger').addClass('text-success').text('角色修改成功')
                        table.draw();
                        setTimeout(function () {
                            $('#editMsgArea').empty()
                            $('#roleEditModal').modal("hide")
                        }, 1500);
                    }
                })
                event.preventDefault();
            });
        })
    });
}
