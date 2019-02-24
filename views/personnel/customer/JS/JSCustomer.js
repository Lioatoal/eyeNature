/*
 * Init First!
*/
var relationTable = {
    1: "父親",
    2: "母親",
    3: "爺爺",
    4: "奶奶",
    5: "叔叔",
    6: "阿姨",
    7: "其他",
}
var table, subTable;
var fatherID;

initialize();

/*
 * Create Customer
 */
$('#add').on('click', function () {
    $.get('/customerCreate', function (res) {
        // var data = {data:"1234"};
        // var result = ejs.render(data);
        $('#customerCreateModal .modal-content').html(res);
        bindCreateEvent();
    });
})

/*
 * Delete Customer
 */
$('#delete').on('click', function () {
    if ($.fn.DataTable.isDataTable('#customerDelTable'))
        $('#customerDelTable').DataTable().destroy();

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

    $('#customerDelTable').DataTable(
        $.extend(tbConfig, {
            paging: false,
            ordering: false,
            data: datas,
            columnDefs: [
                {
                    'targets': 5,
                    "orderable": false,
                    render: function (data, type, row) {
                        var htmlEle = ''
                        if (data.iswork === 1) {
                            htmlEle += '<span class="label label-primary"><i class="glyphicon glyphicon-ok-circle"></i> 會員</span>'
                        } else {
                            htmlEle += '<span class="label label-danger"><i class="glyphicon glyphicon-ban-circle"></i> 非會員</span>'
                        }
                        return htmlEle;
                    }
                }
            ],
            columns: [
                {
                    data: "idcardno"
                }, 
                {
                    data: "name"
                },
                {
                    data: "cellphone"
                },
                {
                    data: "addr"
                }, 
                {
                    data: "remark"
                },
                {
                    data: null
                }
            ]
        })
    );
})

$('#delSubmit').on('click', function () {
    var delData = $('#customerDelTable').DataTable().data();
    var postData = [];

    for (var i = 0; i < delData.length; i++) {
        postData.push(delData[i].idcardno);
    }

    $.post('/customerDelete', {
        postData: JSON.stringify(postData)
    }, function (error) {
        if (error.msg) {
            $('#delMsgArea').removeClass('text-success').addClass('text-danger').text('員工刪除失敗:' + error.msg)
        } else {
            $('#delMsgArea').removeClass('text-danger').addClass('text-success').text('員工刪除成功')
            table.draw();
            setTimeout(function () {
                $('#delMsgArea').empty()
                $('#customerDelModal').modal("hide");
            }, 1500);
        }
    });
})

/*
 * Import Function
 */
$('#import').on('change', function () {
    var xlsxFile = this;
    xlsxParser(xlsxFile, function(res){
        console.log(res);
        xlsxFile = res;
        $.ajax({
            url: '/customerImport',
            method: 'POST',
            data: xlsxFile,
            contentType: "application/octet-stream",
            processData: false,
            cache: false,
            success: function(error){
                if (error.msg) {
                    if(confirm(error.msg)){
                        window.location.href = "/customer";
                    } else {
                        return;
                    }
                } else {
                    window.location.href = "/customer";
                }
            }
        })
    });  
})

/*
 * Export Function
 */
$('#export').on('click', function () {
    window.open('/mCustomerExport', '_self')
})

function initialize() {
    let tbConfig = getDataTableConfig();
    table = $('#customerTable').DataTable(
        $.extend(tbConfig, {
            ajax: {
                url: "/customerRowData",
                data: function (data) {
                    let customData = {
                        start: data.start,
                        length: data.length,
                    }
                    return customData
                }
            },
            columnDefs: [{
                'targets': 0,
                "orderable": false,
                "class": "text-center",
                render: function(data, type, row) {
                    return '<input type="checkbox">';
                }
            },
            {
                'targets': 6,
                "orderable": false,
                render: function (data, type, row) {
                    var htmlEle = ''
                    if (data.iswork === 1) {
                        htmlEle += '<span class="label label-primary"><i class="glyphicon glyphicon-ok-circle"></i> 會員</span>'
                    } else {
                        htmlEle += '<span class="label label-danger"><i class="glyphicon glyphicon-ban-circle"></i> 非會員</span>'
                    }
                    return htmlEle;
                }
            },
            {
                "class": "text-center",
                'targets': 7,
                "orderable": false,
                render: function (data, type, row) {
                    return `<button id="${data.idcardno}" class="btn btn-primary editbtn btn-circle" role="button"
                    data-toggle="modal" data-target="#customerEditModal">
                    <i class="glyphicon glyphicon-edit"></i></button>`
                }
            }],
            columns: [
                {
                    data: null
                },
                {
                    data: "idcardno"
                }, 
                {
                    data: "name"
                },
                {
                    data: "cellphone"
                },
                {
                    data: "addr"
                }, 
                {
                    data: "remark"
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
        bindEditEvent();
    });
    
    $('#select-all').on('click', function () {
        // Get all rows with search applied
        var rows = table.rows({
            'search': 'applied'
        }).nodes();
        // Check/uncheck checkboxes for all rows in the table
        $('input[type="checkbox"]', rows).prop('checked', this.checked);
    });

    $('#selectSub-all').on('click', function () {
        // Get all rows with search applied
        var rows = subTable.rows().nodes();
        // Check/uncheck checkboxes for all rows in the table
        $('input[type="checkbox"]', rows).prop('checked', this.checked);
    });

    $(".secondModal").on("hidden.bs.modal", function () {
        $('.secondModal input').val('');
        $('.secondModal textarea').val('');
    })

    bindChildCreateEvent();
}

function bindEditEvent() {
    //Edit Customer
    $('.editbtn').on('click', function () {
        fatherID = this.id;
        var id = this.id;
        $.get('/customerEdit', { id: id }, function (res) {
            if(res.ejsFile && res.customerEdit){
                var str = ejs.render(res.ejsFile, {customerEdit: res.customerEdit});
            }
            $('#customerEditModal .modal-content').html(str);
            $('#txtEditCustomerBirth').datetimepicker({
                weekStart: 7,
                maxViewMode: 3,
                language: "zh-TW",
                daysOfWeekHighlighted: [0, 6],
                startView: 2,
                autoclose: 1,
                minView: 2,
            });
            //確認按鈕進行checkBlack
            $("#editCheck").on('click', function () {
                //檢驗required 加上has-error css or has-success
                checkBlack();
            })
            $('#customerEdit').on('submit', function (event) {
                var postData = {
                    head: 'edit',
                    email: $("#txtEditCustomerEmail").val(),
                    idcardno: $('#txtEditCustomerIdcardno').val(),
                    name: $('#txtEditCustomerName').val(),
                    gender: $('input[name=txtEditCustomerGender]:checked').val(),
                    birthday: $("#txtEditCustomerBirth").val(),
                    addrIO: $("input[name=txtEditCustomerAddrIO]:checked").val(),
                    addr: $("#txtEditCustomerAddr").val(),
                    phone: $("#txtEditCustomerPhone").val(),
                    cellphone: $("#txtEditCustomerCellphone").val(),
                    contactname: $("#txtEditCustomerChildNextofkin").val(),
                    contactphone: $("#txtEditCustomerContactPhone").val(),
                    iswork: $("input[name=txtEditCustomerIswork]:checked").val(),
                    remark: $("#txtEditCustomerRemark").val()
                };
                console.log('postData: ' + JSON.stringify(postData));
                $.post('/customerModify', {
                    postData: JSON.stringify(postData)
                }, function (error) {
                    if (error.msg) {
                        $('#editMsgArea').removeClass('text-success').addClass('text-danger').text('客戶新增失敗:' + error.msg)
                    } else {
                        $('#editMsgArea').removeClass('text-danger').addClass('text-success').text('客戶新增成功')
                        table.draw();
                        setTimeout(function () {
                            $('#editMsgArea').empty();
                            $('#customerEditModal').modal("hide");
                        }, 1500);
                    }
                });
                event.preventDefault();
            })
            bindChildEvent();
        });
    });
}

function bindCreateEvent() {
    $('.form_date input').datetimepicker({
        weekStart: 7,
        maxViewMode: 3,
        language: "zh-TW",
        daysOfWeekHighlighted: [0, 6],
        startView: 2,
        autoclose: 1,
        minView: 2,
    });
    //確認按鈕進行checkBlack
    $("#createCheck").on('click', function () {
        checkBlack();
    })

    $("#customerCreate").on('submit', function (event) {
        // var result = $(this).serializeArray();
        // console.log(result);
        var postData = {
            head: 'create',
            email: $("#txtCreateCustomerEmail").val(),
            idcardno: $('#txtCreateCustomerIdcardno').val(),
            name: $('#txtCreateCustomerName').val(),
            gender: $('input[name=txtCreateCustomerGender]:checked').val(),
            birthday: $("#txtCreateCustomerBirth").val(),
            addrIO: $("input[name=txtCreateCustomerAddrIO]:checked").val(),
            addr: $("#txtCreateCustomerAddr").val(),
            phone: $("#txtCreateCustomerPhone").val(),
            cellphone: $("#txtCreateCustomerCellphone").val(),
            contactname: $("#txtCreateCustomerContactName").val(),
            contactphone: $("#txtCreateCustomerContactPhone").val(),
            iswork: $("input[name=txtCreateCustomerIswork]:checked").val(),
            remark: $("#txtCreateCustomerRemark").val()
        };
        console.log('postData: ' + JSON.stringify(postData));
        $.post('/customerModify', {
            postData: JSON.stringify(postData)
        }, function (error) {
            if (error.msg) {
                $('#createMsgArea').removeClass('text-success').addClass('text-danger').text('客戶新增失敗:' + error.msg)
            } else {
                $('#createMsgArea').removeClass('text-danger').addClass('text-success').text('客戶新增成功')
                table.draw();
                setTimeout(function () {
                    $('#createMsgArea').empty();
                    $('#customerCreateModal').modal("hide");
                }, 1500);
            }
        });
        event.preventDefault();
    });
}

function bindChildEvent() {
    var config = getDataTableConfig();
    config.ajax = {
        url: "/customerChildRowData",
        data: function (data) {
            let customData = {
                id: fatherID,
                start: data.start,
                length: data.length,
            }
            return customData
        }
    }
    config.columnDefs = [{
            'targets': 0,
            "orderable": false,
            "class": "text-center",
            render: function(data, type, row) {
                return '<input type="checkbox">';
            }
        },{
            'targets': 5,
            "orderable": false,
            render: function (data, type, row) {
                return relationTable[data.reln_id];
            }
        },{
            "class": "text-center",
            'targets': 6,
            "orderable": false,
            render: function (data, type, row) {
                return `<button id="${data.idcardno}" class="btn btn-primary editbtnChild btn-circle" role="button" type="button"
                data-toggle="modal" data-target="#customerChildEditModal">
                <i class="glyphicon glyphicon-edit"></i></button>`
            }
        }],
    config.columns = [{
            data: null
        },{
            data: "name"
        },{
            data: "idcardno"
        },{
            data: "passportno"
        },{
            data: "age"
        },{
            data: null
        },{
            data: null
        }];
    subTable = $("#customerChildTable").DataTable(config);

    subTable.on('draw.dt', function () {
        bindChildEditEvent();
    });
    bindChildDeleteEvent();
}

function bindChildCreateEvent() {
    var str = relationTable2option()
    $("#txtCreateCustomerChildReln").html(str);

    bindDatePicker();

    //確認按鈕進行checkBlack
    $("#createChildCheck").on('click', function () {
        checkBlack();
    })

    $("#customerChildCreate").on('submit', function (event) {
        // var result = $(this).serializeArray();
        // console.log(result);
        var postData = {
            head: 'create',
            idcardno: $("#txtCreateCustomerChildIdcardno").val(),
            customer_id: fatherID,
            name: $("#txtCreateCustomerChildName").val(),
            passportno: $("#txtCreateCustomerChildPassportno").val(),
            gender: $("input[name=txtCreateCustomerChildGender]:checked").val(),
            reln_id: $("#txtCreateCustomerChildReln").val(),
            birthday: $("#txtCreateCustomerChildBirth").val(),
            bloodtype: $("#txtCreateCustomerChildBloodtype").val(),
            school: $("#txtCreateCustomerChildSchool").val(),
            foodtype: $("input[name=txtCreateCustomerChildFoodtype]:checked").val(),
            stature: $("#txtCreateCustomerChildStature").val(),
            weight: $("#txtCreateCustomerChildWeight").val(),
            special: $("#txtCreateCustomerChildSpacial").val(),
            nextofkin: $("#txtCreateCustomerNextofkin").val(),
            nextofkin_phone: $("#txtCreateCustomerNextofkinPhone").val(),
            remark: $("#txtCreateCustomerChildRemark").val()
        };
        console.log('postData: ' + JSON.stringify(postData));
        $.post('/customerChildModify', {
            postData: JSON.stringify(postData)
        }, function (error) {
            if (error.msg) {
                $('#creatChildMsgArea').removeClass('text-success').addClass('text-danger').text('學員新增失敗:' + error.msg)
            } else {
                $('#creatChildMsgArea').removeClass('text-danger').addClass('text-success').text('學員新增成功')
                subTable.draw();
                setTimeout(function () {
                    $('#creatChildMsgArea').empty();
                    $('#customerChildCreateModal').modal("hide");
                }, 1500);
            }
        });
        event.preventDefault();
    });
}

function bindChildDeleteEvent(){
    $('#childDelete').on('click', function () {
        if ($.fn.DataTable.isDataTable('#customerChildDelTable'))
            $('#customerChildDelTable').DataTable().destroy();
    
        var datas = [];
        var nodes = subTable.column(0).nodes();
        $.each(nodes, (i,d) => {
            if($(d).find('input').prop('checked')){
                // console.log(i)
                datas.push(subTable.row(i).data());
            }
        })
    
        $('#customerChildDelTable').DataTable({
            responsive: true,
            // 改變顯示列數功能
            lengthChange: false,
            // 搜尋功能
            searching: false,
            // 是否要剖析圖示
            processing: false,
            paging: false,
            // 分頁、排序等計算是否由server決定
            serverSide: false,
            ordering: false,
            language: language,
            data: datas,
            columns: [
                {
                    data: "name"
                }, 
                {
                    data: "idcardno"
                },
                {
                    data: "passportno"
                },
                {
                    data: "age"
                }, 
                {
                    data: "reln_id"
                }
            ],
        });
    })
    
    $('#delChildSubmit').on('click', function () {
        var delData = $('#customerChildDelTable').DataTable().data();
        var postData = [];
    
        for (var i = 0; i < delData.length; i++) {
            postData.push(delData[i].idcardno);
        }
    
        $.post('/customerChildDelete', {
            postData: JSON.stringify(postData)
        }, function (error) {
            if (error.msg) {
                $('#delChildMsgArea').removeClass('text-success').addClass('text-danger').text('學員刪除失敗:' + error.msg)
            } else {
                $('#delChildMsgArea').removeClass('text-danger').addClass('text-success').text('學員刪除成功')
                subTable.draw();
                setTimeout(function () {
                    $('#delChildMsgArea').empty()
                    $('#customerChildDelModal').modal("hide");
                }, 1500);
            }
        });
    })
    
}

function bindChildEditEvent() {
    //Edit Customer
    $('.editbtnChild').on('click', function () {
        var idcardno = this.id;
        $.get('/customerChildEdit', { id: idcardno }, function (res) {
            $('#customerChildEditModal .modal-content').html(res);
            $("#txtEditCustomerChildIdcardno").val(idcardno);
            
            bindDatePicker();

            //確認按鈕進行checkBlack
            $("#editChildCheck").on('click', function () {
                //檢驗required 加上has-error css or has-success
                checkBlack();
            });
            $('#customerChildEdit').on('submit', function (event) {
                var postData = {
                    head: 'edit',
                    idcardno: $("#txtEditCustomerChildIdcardno").val(),
                    name: $("#txtEditCustomerChildName").val(),
                    passportno: $("#txtEditCustomerChildPassportno").val(),
                    gender: $("input[name=txtEditCustomerChildGender]:checked").val(),
                    reln_id: $("#txtEditCustomerChildReln").val(),
                    birthday: $("#txtEditCustomerChildBirth").val(),
                    bloodtype: $("#txtEditCustomerChildBloodtype").val(),
                    school: $("#txtEditCustomerChildSchool").val(),
                    foodtype: $("input[name=txtEditCustomerChildFoodtype]:checked").val(),
                    stature: $("#txtEditCustomerChildStature").val(),
                    weight: $("#txtEditCustomerChildWeight").val(),
                    special: $("#txtEditCustomerChildSpacial").val(),
                    nextofkin: $("#txtEditCustomerChildNextofkin").val(),
                    nextofkin_phone: $("#txtEditCustomerChildNextofkinPhone").val(),
                    remark: $("#txtEditCustomerChildRemark").val()
                };
                console.log('postData: ' + JSON.stringify(postData));
                $.post('/customerChildModify', {
                    postData: JSON.stringify(postData)
                }, function (error) {
                    if (error.msg) {
                        $('#editChildMsgArea').removeClass('text-success').addClass('text-danger').text('學員編輯失敗:' + error.msg)
                    } else {
                        $('#editChildMsgArea').removeClass('text-danger').addClass('text-success').text('學員編輯成功')
                        subTable.draw();
                        setTimeout(function () {
                            $('#editChildMsgArea').empty();
                            $('#customerChildEditModal').modal("hide");
                        }, 1500);
                    }
                });
                event.preventDefault();
            })
        });
    });
}

function relationTable2option() {
    var htmlstr = '';
    for(var i in relationTable){
        htmlstr += '<option value='+ i +'>' + relationTable[i] + '</option>'
    }
    return htmlstr;
}