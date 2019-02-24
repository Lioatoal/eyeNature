/*
 * Init First!
 */
initialize();
/*
 * Export Function
 */
$('#export').on('click', function () {
    window.open('/mRecordExport', '_self')
})

$('#inquiry').submit(function (e) {
    e.preventDefault();
    table.draw() //refresh table
})

function initialize() {
    language = {
        "processing": "處理中...",
        "loadingRecords": "載入中...",
        "lengthMenu": "顯示 _MENU_ 項結果",
        "zeroRecords": "沒有符合的結果",
        "info": "顯示第 _START_ 至 _END_ 項結果，共 _TOTAL_ 項",
        "infoEmpty": "顯示第 0 至 0 項結果，共 0 項",
        "infoFiltered": "(從 _MAX_ 項結果中過濾)",
        "infoPostFix": "",
        "search": "搜尋:",
        "paginate": {
            "first": "第一頁",
            "previous": "上一頁",
            "next": "下一頁",
            "last": "最後一頁"
        },
        "aria": {
            "sortAscending": ": 升冪排列",
            "sortDescending": ": 降冪排列"
        }
    }
    table = $('#recordTable').DataTable({
        searching: false,
        ajax: {
            url: "/mRecordRowData",
            data: function (data) { 
                let customData = {
                    inventoryname: $('#txtSearchInvNname').val(),
                    operation: $('#txtSearchOperation').val(),
                    operator: $('#txtSearchOperator').val(),
                    campname: $('#txtSearchCampname').val(),
                    timestamp: $('#txtSearchTimestamp').val(),
                    vendorname: $('#txtSearchVendorname').val(),
                    beginDate: $('#txtSearchBeginDate').val(),
                    endDate: $('#txtSearchEndDate').val(),
                    order: data.order,
                    start: data.start,
                    length: data.length,
                }
                return customData
            }
        },
        serverSide: true,
        columnDefs: [{
            "class": "text-center",
            'targets': 8,
            "orderable": false,
            render: function (data, type, row) {
                // console.log(row)
                return `<button id="${data.id}" class="btn btn-primary detailbtn btn-circle" role="button"
                data-toggle="modal" data-target="#recordDetailModal" value=${data.remark}>
                <i class="glyphicon glyphicon-list"></i></button>`
            }
        }],
        columns: [{
            data: "timestamp"
        }, {
            data: "inventoryname"
        }, {
            data: "operation"
        }, {
            data: "quantity"
        }, {
            data: "campname"
        }, {
            data: "price"
        }, {
            data: "vendorname"
        }, {
            data: "operator"
        }, {
            data: null
        }],
        order: [],
        language: language,
    });

    // table.buttons().container().prependTo( $('.col-sm-6:eq(0)', table.table().container()));
    $('.dt-button').hide();
    table.on('draw.dt', function () {
        bindTableEvent();
    });
}

function bindTableEvent() {
    $('.detailbtn').on('click', function () {
        let remark = this.value;
        $("#txtRecordDetail").text(remark);
        // let recordID = this.id;
        // $.get('/mRecordDetail', { id: recordID }, function (res) {
        //     $('#recordDetailModal .modal-content').html(res);
        // })
    });
}