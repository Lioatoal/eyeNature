/*
 * Init First!
 */
var table;
initialize();

/*
 * Create Employee
 */
$('#add').on('click', function () {
    $.get('/mEmployeeCreate', function (res) {
        $('#employeeCreateModal .modal-content').html(res);
        bindCreateEvent();
    });
})

/*
 * Delete Employee
 */
$('#delete').on('click', function () {
    if ($.fn.DataTable.isDataTable('#employeeDelTable'))
        $('#employeeDelTable').DataTable().destroy();

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
    $('#employeeDelTable').DataTable(
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
                            htmlEle += '<span class="label label-primary"><i class="glyphicon glyphicon-ok-circle"></i> 在職中</span>'
                        } else {
                            htmlEle += '<span class="label label-danger"><i class="glyphicon glyphicon-ban-circle"></i> 已離職</span>'
                        }
                        return htmlEle;
                    }
                }
            ],
            columns: [
                {
                    data: "name"
                },
                {
                    data: "nickname"
                },
                {
                    data: "title"
                },
                {
                    data: "mainphone"
                },
                {
                    data: "secondaryphone"
                },
                {
                    data: "edulevel"
                },
                {
                    data: "school"
                },
                {
                    data: null
                }
            ]
        })
    );
})

$('#inquiry').submit(function (e) {
    e.preventDefault();
    table.draw() //refresh table
})

$('#delSubmit').on('click', function () {
    var delData = $('#employeeDelTable').DataTable().data();
    var postData = [];

    for (var i = 0; i < delData.length; i++) {
        postData.push(delData[i].id);
        console.log(delData[i].id);
    }

    $.post('/mEmployeeDelete', {
        postData: JSON.stringify(postData)
    }, function (error) {
        if (error.msg) {
            $('#delMsgArea').removeClass('text-success').addClass('text-danger').text('員工刪除失敗:' + error.msg)
        } else {
            $('#delMsgArea').removeClass('text-danger').addClass('text-success').text('員工刪除成功')
            table.draw();
            setTimeout(function () {
                $('#delMsgArea').empty()
                $('#employeeDelModal').modal("hide")
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
            url: '/mEmployeeImport',
            method: 'POST',
            data: xlsxFile,
            contentType: "application/octet-stream",
            processData: false,
            cache: false,
            success: function (error) {
                if (error.msg) {
                    if (confirm(error.msg)) {
                        window.location.href = "/employee";
                    } else {
                        return;
                    }
                } else {
                    window.location.href = "/employee";
                }
            }
        })
    });
})

$('#export').on('click', function () {
    window.open('/mEmployeeExport', '_self')
})

function initialize() {
    let tbConfig = getDataTableConfig();
    table = $('#employeeTable').DataTable(
        $.extend(tbConfig, {
            ajax: {
                url: "/mEmployeeRowData",
                data: function (data) {
                    let customData = {
                        name: $('#name').val(),
                        nickname: $('#nickname').val(),
                        cellphone: $('#cellphone').val(),
                        title: $('#title').val(),
                        edulevel: $('#edulevel').val(),
                        school: $('#school').val(),
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
                            htmlEle += '<span class="label label-primary"><i class="glyphicon glyphicon-ok-circle"></i> 在職中</span>'
                        } else {
                            htmlEle += '<span class="label label-danger"><i class="glyphicon glyphicon-ban-circle"></i> 已離職</span>'
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
                        data-toggle="modal" data-target="#employeeEditModal">
                        <i class="glyphicon glyphicon-edit"></i></button>`
                    }
                }
            ],
            columns: [
                {
                    data: null
                },
                {
                    data: "name"
                },
                {
                    data: "nickname"
                },
                {
                    data: "title"
                },
                {
                    data: "mainphone"
                },
                {
                    data: "secondaryphone"
                },
                {
                    data: "edulevel"
                },
                {
                    data: "school"
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
}

function bindEditEvent() {
    //Edit employee
    $('.editbtn').on('click', function () {
        var id = this.id;
        $.get('/mEmployeeEdit', {
            id: id
        }, function (res) {
            $('#employeeEditModal .modal-content').html(res);
            $('#txtEditEmployeeBirth').datetimepicker({
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
            $('#employeeEdit').on('submit', function (event) {
                var postData = {
                    head: 'edit',
                    txtEditID: id,
                    name: $('#txtEditEmployeeName').val(),
                    nickname: $('#txtEditEmployeeNickname').val(),
                    title_id: $('#txtEditEmployeeTitle').val(),
                    facebook: $('#txtEditEmployeeFacebook').val(),
                    email: $('#txtEditEmployeeEmail').val(),
                    line: $('#txtEditEmployeeLine').val(),
                    wechat: $('#txtEditEmployeeWechat').val(),
                    birthday: $('#txtEditEmployeeBirth').val(),
                    bloodtype: $('#txtEditEmployeeBloodtype').val(),
                    mainphone: $('#txtEditEmployeeMainPhone').val(),
                    secondaryphone: $('#txtEditEmployeeSecondaryPhone').val(),
                    address: $('#txtEditEmployeeAddr').val(),
                    idcardno: $('#txtEditEmployeeIdcardno').val(),
                    gender: $("input[name=txtEditEmployeeGender]:checked").val(),
                    stature: $('#txtEditEmployeeStature').val(),
                    weight: $('#txtEditEmployeeWeight').val(),
                    edu_id: $('#txtEditEmployeeEdu').val(),
                    school: $('#txtEditEmployeeSchool').val(),
                    nextofkin: $('#txtEditEmployeeNextofkin').val(),
                    nextofkin_phone: $('#txtEditEmployeeNextofkinPhone').val(),
                    bankcode: $('#txtEditEmployeeBankcode').val(),
                    bankaccount: $('#txtEditEmployeeBankacct').val(),
                    bankname: $('#txtEditEmployeeBankname').val(),
                    iswork: $("#txtEditEmployeeIswork")[0].checked,
                    remark: $('#txtEditEmployeeRemark').val(),
                    telephone: $('#txtEditEmployeeTelePhone').val(),
                    registaddr: $('#txtEditEmployeeRegistAddr').val(),
                    department: $('#txtEditEmployeeDepartment').val(),
                    grade: $('#txtEditEmployeeGrade').val(),
                    degreestatus: $('input[name=txtEditEmployeeDegreeStatus]:checked').val(),
                    secondaryedu: $('#txtEditEmployeeSecondaryEdu').val()
                }
                console.log("ISWORK: " + $("input[name='txtEditEmployeeIswork']:checked").val());
                $.post('/mEmployeeModify', {
                    postData: JSON.stringify(postData)
                }, function (error) {
                    if (error.msg) {
                        $('#editMsgArea').removeClass('text-success').addClass('text-danger').text('員工編輯失敗:' + error.msg)
                    } else {
                        $('#editMsgArea').removeClass('text-danger').addClass('text-success').text('員工編輯成功')
                        table.draw();
                        setTimeout(function () {
                            $('#editMsgArea').empty()
                            $('#employeeEditModal').modal("hide")
                        }, 1500);
                    }
                })
                event.preventDefault();
            })
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
        //檢驗Cellphone格式
        var txtCreateEmployeeMainPhone = document.getElementById('txtCreateEmployeeMainPhone');
        if (checkCellphone(txtCreateEmployeeMainPhone.value)) {
            txtCreateEmployeeMainPhone.setCustomValidity('');
            setSuccess(txtCreateEmployeeMainPhone);
        } else {
            txtCreateEmployeeMainPhone.setCustomValidity('請依照格式輸入: 0911-111-111');
            setError(txtCreateEmployeeMainPhone);
        }
        //檢驗required 加上has-error css or has-success 
        checkBlack();
    })

    $("#employeeCreate").on('submit', function (event) {
        // var result = $(this).serializeArray();
        // console.log(result);
        var postData = {
            head: 'create',
            name: $('#txtCreateEmployeeName').val(),
            nickname: $('#txtCreateEmployeeNickname').val(),
            title_id: $('#txtCreateEmployeeTitle').val(),
            facebook: $('#txtCreateEmployeeFacebook').val(),
            email: $('#txtCreateEmployeeEmail').val(),
            line: $('#txtCreateEmployeeLine').val(),
            wechat: $('#txtCreateEmployeeWechat').val(),
            birthday: $('#txtCreateEmployeeBirth').val(),
            bloodtype: $('#txtCreateEmployeeBloodtype').val(),
            mainphone: $('#txtCreateEmployeeMainPhone').val(),
            secondaryphone: $('#txtCreateEmployeeSecondaryPhone').val(),
            address: $('#txtCreateEmployeeAddr').val(),
            idcardno: $('#txtCreateEmployeeIdcardno').val(),
            gender: $("input[name=txtCreateEmployeeGender]:checked").val(),
            stature: $('#txtCreateEmployeeStature').val(),
            weight: $('#txtCreateEmployeeWeight').val(),
            edu_id: $('#txtCreateEmployeeEdu').val(),
            school: $('#txtCreateEmployeeSchool').val(),
            nextofkin: $('#txtCreateEmployeeNextofkin').val(),
            nextofkin_phone: $('#txtCreateEmployeeNextofkinPhone').val(),
            bankcode: $('#txtCreateEmployeeBankcode').val(),
            bankaccount: $('#txtCreateEmployeeBankacct').val(),
            bankname: $('#txtCreateEmployeeBankname').val(),
            iswork: $("#txtCreateEmployeeIswork")[0].checked,
            remark: $('#txtCreateEmployeeRemark').val(),
            telephone: $('#txtCreateEmployeeTelePhone').val(),
            registaddr: $('#txtCreateEmployeeRegistAddr').val(),
            department: $('#txtCreateEmployeeDepartment').val(),
            grade: $('#txtCreateEmployeeGrade').val(),
            degreestatus: $('input[name=txtCreateEmployeeDegreeStatus]:checked').val(),
            secondaryedu: $('#txtCreateEmployeeSecondaryEdu').val()
        };
        console.log('postData: ' + JSON.stringify(postData));
        $.post('/mEmployeeModify', {
            postData: JSON.stringify(postData)
        }, function (error) {
            if (error.msg) {
                $('#creatMsgArea').removeClass('text-success').addClass('text-danger').text('員工新增失敗:' + error.msg)
            } else {
                $('#creatMsgArea').removeClass('text-danger').addClass('text-success').text('員工新增成功')
                table.draw();
                setTimeout(function () {
                    $('#creatMsgArea').empty()
                    $('#employeeCreateModal').modal("hide")
                }, 1500);
            }
        });
        event.preventDefault();
    });
}