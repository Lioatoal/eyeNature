
function checkBlack() {
    var test = $("[required='true']");
    $.each(test, function (i, j) {
        // console.log("index: "+i + "\n value: "+j.value);
        if (j.value == "") {
            setError(this,i);
        }
        else {
            setSuccess(this,i);
        }
    })
}

function checkCellphone(cellphone) {
    var regex = new RegExp('^[0-9]{4}-[0-9]{3}-[0-9]{3}$');
    return (regex.test(cellphone));
}

function setError(div,i) {
    div.closest('.form-group').classList.add("has-error")
    $('.form-control-feedback')[i].classList.add('glyphicon-remove');
}
function setSuccess(div,i) {
    // div.closest('.form-group').classList.remove("has-error");
    // $('.form-control-feedback')[i].classList.remove('glyphicon-remove');
    // div.closest('.form-group').classList.add("has-success");
    // $('.form-control-feedback')[i].classList.add('glyphicon-ok');
}

function xlsxParser(data, callback){
    if (data.files && data.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function (e) {
            callback(e.target.result);
        }

        reader.readAsArrayBuffer(data.files[0]);
    }
}

function getDataTableConfig(){
    var config = {
        language: {
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
        },
        serverSide: true,
        searching: false,
        processing: true,
        responsive: true,
        order: []
    }
    return config
}

function bindDatePicker() {
    $('.form_date input').datetimepicker({
        weekStart: 7,
        maxViewMode: 3,
        language: "zh-TW",
        daysOfWeekHighlighted: [0, 6],
        startView: 2,
        autoclose: 1,
        minView: 2,
    });
}
