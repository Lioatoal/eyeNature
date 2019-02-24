//For bltn row data
var selectData = {
    moduleID:0,
    pageIndex:1
};
var currentPage;
var txtContent, txtComment;
//For bltn Modify
var contentVal = [];
//For bltn View, 
var bltnViewID, commentID, commState =[], commentTemp=[];

initialize();

//ckeditor 補丁
$.fn.modal.Constructor.prototype.enforceFocus = function() {
    modal_this = this;
    $(document).on('focusin.modal', function (e) {
      if (modal_this.$element[0] !== e.target && !modal_this.$element.has(e.target).length
      && !$(e.target.parentNode).hasClass('cke_dialog_ui_input_select')
      && !$(e.target.parentNode).hasClass('cke_dialog_ui_input_text')) {
        modal_this.$element.focus()
      }
    })
};

function initialize() {
    $(".nav-item").on('click', function () {
        $(".nav-item.active").attr('class', 'nav-item');
        this.className = "nav-item active";
        selectData.pageIndex = 1;
        selectData.moduleID = this.id;
        currentPage = 1;
        getBulletinRowData();
    });
    getBulletinRowData();
}

/*
 *  Get Bulletin Data via page information(selectData).
 */
function getBulletinRowData() {
    $.get('/bltnRowData', selectData, function (res) {
        $("#Main").html(res);
        pagination();
        tagEventInit();
    });
}

/*
 *  Plug in pagenation module.
 */
function pagination() {
    $("#pagination").twbsPagination('destroy');
    if (total < 2) {
        total = 1;
    }
    var pageInfo = {
        totalPages: total,
        startPage: currentPage,
        first: '|<',
        prev: '<',
        next: '>',
        last: '>|',
        initiateStartPageClick: false,
        onPageClick: function (event, page) {
            selectData.pageIndex = page;
            currentPage = $("#pagination").twbsPagination('getCurrentPage');
            getBulletinRowData();
        }
    };
    $("#pagination").twbsPagination(pageInfo);
}

/*
 *  Initialize tag event for every row data getting.
 */
function tagEventInit() {
    $('#add').off('click');
    $('.edit').off('click');
    $('.view').off('click');
    //Create bltn
    bindAddEvent();
    //Edit bltn
    bindEditEvent();
    //View bltn
    bindViewEvent();
    //Delete bltn
    bindDeleteEvent();
}

/*
 *  Get Info. for create Add and edit event.
 */
function bindAddEvent() {
    $('#add').on('click', function () {
        $.get('/bltnCreate', function (res) {
            $('#bltnCreateModal .modal-content').html(res);

            bindDatePicker();
            
            CKEDITOR.replace("txtCreateBltnContent");

            var initModuleID = $('#txtCreateBltnModuleName').val();
            willlook(initModuleID, 'create', '#bltnCreateModal');
            
            $('#txtCreateBltnModuleName').on('change', function () {
                var id = this.value;
                willlook(id, 'create', 'bltnCreateModal');
            });
            
            $('#bltnCreate').on('submit', function(event){
                var bltnCreate = {
                    theme: $('#txtCreateBltnTheme').val(),
                    content: CKEDITOR.instances["txtCreateBltnContent"].getData(),
                    module_id:  $('#txtCreateBltnModuleName').val(),
                    impt_id: $("input[name=txtCreateBltnImportant]:checked").val(),
                    timecount: $("#txtCreateBltnCount").val(),
                    active: $("input[name=txtCreateBltnPublish]:checked").val(),
                    deadline: $("#txtCreateBltnDeadline").val()
                }

                var bltnWilllook = [];
                var willLook = $("#bltnCreateModal .lookright img[style='']");
                for (let i = 0; i < willLook.length; i++) {
                    bltnWilllook.push({
                        member_email:willLook[i].id
                    });
                }

                $.post('/bulletinModify', {
                    head: 'create',
                    bltnData: JSON.stringify(bltnCreate),
                    bltnWilllook: JSON.stringify(bltnWilllook)
                }, function (error) {
                    if (error.msg) {
                        $('#creatMsgArea').removeClass('text-success').addClass('text-danger').text('公告新增失敗:' + error.msg)
                    } else {
                        $('#creatMsgArea').removeClass('text-danger').addClass('text-success').text('公告新增成功')
                        setTimeout(function () {
                            $('#creatMsgArea').empty()
                            $('#bltnCreateModal').modal("hide");
                            getBulletinRowData();
                        }, 1500);
                    }
                });
                
                event.preventDefault();
            });
        });
    })
}

function bindEditEvent() {
    $('.edit').on('click', function () {
        var bltnID = this.id;
        $.get('/bulletinModify', {id:bltnID}, function (res) {
            $("#bltnEditModal .modal-content").html(res);
            $('#bltnID').val(bltnID);

            bindDatePicker();

            CKEDITOR.replace("txtEditBltnContent");
            let txtContent = CKEDITOR.instances['txtEditBltnContent'];
            txtContent.setData(contentVal[0]);

            var initModuleID = $('#txtEditBltnModuleName').val();
            willlook(initModuleID, 'edit', '#bltnEditModal', bltnID);
            $('#txtEditBltnModuleName').on('change', function () {
                var id = this.value;
                willlook(id, 'edit', 'bltnEditModal', bltnID);
            });

            $('#bltnEdit').on('submit', function(event){
                var bltnEdit = {
                    id: bltnID,
                    theme: $('#txtEditBltnTheme').val(),
                    content: txtContent.getData(),
                    module_id:  $('#txtEditBltnModuleName').val(),
                    impt_id: $("input[name=txtEditBltnImportant]:checked").val(),
                    timecount: $("#txtEditBltnCount").val(),
                    active: $("input[name=txtEditBltnPublish]:checked").val(),
                    deadline: $("#txtEditBltnDeadline").val()
                }

                var bltnWilllook = [];
                var willLook = $("#bltnEditModal .lookright img[style='']");
                for (let i = 0; i < willLook.length; i++) {
                    bltnWilllook.push({
                        member_email:willLook[i].id
                    });
                }

                $.post('/bulletinModify', 
                    {
                        head: 'edit',
                        bltnData: JSON.stringify(bltnEdit),
                        bltnWilllook: JSON.stringify(bltnWilllook)
                    },
                function (error) {
                    if (error.msg) {
                        $('#editMsgArea').removeClass('text-success').addClass('text-danger').text('公告編輯失敗:' + error.msg)
                    } else {
                        $('#editMsgArea').removeClass('text-danger').addClass('text-success').text('公告編輯成功')
                        setTimeout(function () {
                            $('#editMsgArea').empty()
                            $('#bltnEditModal').modal("hide");
                        }, 1500);
                        getBulletinRowData();
                    }
                });
                event.preventDefault();
            });
        })
    });
}

/*
 *  Get Info. for create view event.
 */
function bindViewEvent() {
    $('.view').on('click', function () {
        bltnViewID = this.id;
        $.get('/bulletinView', {bltnID:bltnViewID}, function (res) {
            $('#bltnViewModal .modal-content').html(res);
            
            CKEDITOR.replace('commentText', 
            { 
                // toolbarCanCollapse: true, 
                // toolbarStartupExpanded: false, 
                toolbar: [['Smiley']]
            });

            let txtComment = CKEDITOR.instances['commentText'];

            looked(bltnViewID);

            // for Force Reader to read it
            $("#viewProgress").show();
            $("#viewCheckLook").hide();
            $('#viewProgress').stop(true).css({width: 0});
            $('#viewProgress').animate({width:"110%"}, timecount*1000, function () {
                $(".progress").hide();
                $("#viewCheckLook").show();
                $("#viewCheckLook").parent().addClass("lookedBtn");
            });

            // for looked feature
            $("#viewCheckLook").on('click', function () {
                var postData = {
                    bltnID: bltnViewID,
                    user: $("#userinfo")[0].title
                }
                $.post('/bulletinView/looked', {postData:JSON.stringify(postData)}, function (error) {
                    if (error.msg) {
                        $('#viewMsgArea').removeClass('text-success').addClass('text-danger').text(error.msg)
                    } else {
                        $('#viewMsgArea').empty();
                        looked(bltnViewID);
                    }
                });
            })

            $("#viewSubmit").on('click', function () {
                var postData = {
                    bltnID: bltnViewID,
                    newComment: txtComment.getData(),
                }
                $.post('/bulletinView/commentModify', {postData:JSON.stringify(postData)}, function (error) {
                    if (error.msg) {
                        $('#viewMsgArea').removeClass('text-success').addClass('text-danger').text('留言新增失敗:' + error.msg)
                    } else {
                        $('#viewMsgArea').removeClass('text-danger').addClass('text-success').text('')
                        $.get('/bulletinView/comment', {bltnID:bltnViewID}, function (res) {
                            $('#txtBltnComment').html(res);
                        });
                        txtComment.setData('<p>');
                    }
                });
            })

            bltnViewCommentEvent(bltnViewID);
        });
    })
}
function bltnViewCommentEvent(bltnID) {

    // for view's comment
    commentID = $(".editComment").parent().parent();
    for (let i = 0; i < commentID.length; i++) {
        let id = commentID[i].id;
        commState[id] = false;
    }

    $(".editComment").on('click', function () {
        let id = this.parentNode.parentNode.id;

        if(!commentTemp[id]){
            CKEDITOR.replace(id + '_textarea', {
                // toolbarCanCollapse: true, 
                // toolbarStartupExpanded: false, 
                toolbar: [['Smiley']]
            });
            
            commentTemp[id] = CKEDITOR.instances[id + '_textarea'];

            if(owner[id].content){
                commentTemp[id].setData(owner[id].content);
            }
        }

        if (commState[id]) {
            commState[id] = false;
            $("#" + id + " .C4").show();
            $("#" + id + " .C5").hide();
        } else {
            commState[id] = true;
            $("#" + id + " .C4").hide();
            $("#" + id + " .C5").show();
        }
    })
    $(".deleteComment").on('click', function () {
        if (confirm("確定要刪除這裡留言?")) {
            var id = this.parentNode.parentNode.id;
            var postData = {
                owner: owner[id].author,
                commentID: parseInt(id.split('_')[1])
            }
            $.post('/bulletinView/commentDel', {postData:JSON.stringify(postData)}, function (error) {
                if (error.msg) {
                    $('#viewMsgArea').removeClass('text-success').addClass('text-danger').text('留言刪除失敗:' + error.msg)
                } else {
                    $('#viewMsgArea').removeClass('text-danger').addClass('text-success').text('留言刪除成功')
                    $.get('/bulletinView/comment', {bltnID:bltnID}, function (res) {
                        $('#txtBltnComment').html(res);
                        $('#viewMsgArea').empty();
                        commentTemp = [];
                    });
                }
            });
        }
    })
    $(".updatelComment").on('click', function () {
        var id = this.parentNode.parentNode.id;
        var postData = {
            owner: owner[id].author,
            commentID: parseInt(id.split('_')[1]),
            newComment: commentTemp[id].getData()
        }
        $.post('/bulletinView/commentModify', {postData:JSON.stringify(postData)}, function (error) {
            if (error.msg) {
                $('#viewMsgArea').removeClass('text-success').addClass('text-danger').text('留言編輯失敗:' + error.msg)
            } else {
                $('#viewMsgArea').removeClass('text-danger').addClass('text-success').text('留言編輯成功')
                $.get('/bulletinView/comment', {bltnID:bltnID}, function (res) {
                    $('#txtBltnComment').html(res);
                    $('#viewMsgArea').empty();
                    commentTemp = [];
                });
            }
        });
    })
    $(".cancelComment").on('click', function () {
        var id = this.parentNode.parentNode.id;
        $("#" + id + " .C4").show();
        $("#" + id + " .C5").hide();
        commState[id] = false;
    })
}

/*
 *  Get Info. for create delete event.
 */
function bindDeleteEvent() {
    $('.delete').on('click', function () {
        var bltnID = this.id;
        var postData = {delete:bltnID}
        $.get('/bltnViewDelete', {bltnID:bltnID}, function (res) {
            $('#bltnDeleteModal .modal-content').html(res);
            $('#delSubmit').on('click', function () {
                $.post('/bulletinDelete', {postData:JSON.stringify(postData)}, function (error) {
                    if (error.msg) {
                        $('#delMsgArea').removeClass('text-success').addClass('text-danger').text('公告刪除失敗:' + error.msg)
                    } else {
                        $('#delMsgArea').removeClass('text-danger').addClass('text-success').text('公告刪除成功')
                        setTimeout(function () {
                            $('#delMsgArea').empty()
                            $('#bltnDeleteModal').modal("hide");
                        }, 1500);
                        getBulletinRowData();  
                    }
                });
                event.preventDefault();
            });
        });
    })
}
/* 
 * Bulletin API
 */
function willlook(moduleID, head, modal, bltnID) {

    $.get('/bulletinView/willlook',
        {
            head: head,
            moduleID: moduleID,
            bltnID: bltnID
        },
        function (res) {
        $(modal + ' #txtBltnWilllook').html(res);

        var showRole = $(modal + ' #txtBltnRoleSelect').val();
        $(modal + " #role_"+showRole).show();
        $(modal + ' #txtBltnRoleSelect').on('change', function () {
            showRole = this.value;
            $(modal + " div[style='']").hide();
            $(modal + " #role_" + showRole).show();
        });

        $(modal + ' .lookleft img').on('click', function () {
            var roleID = this.parentNode.parentNode.id;
            var index = this.name;
            $(modal + ' #'+ roleID + ' .lookleft img[name='+index+']').hide();
            $(modal + ' #'+ roleID + ' .lookright img[name='+index+']').show();
        });
        
        $(modal + ' .lookright img').on('click', function () {
            var roleID = this.parentNode.parentNode.id;
            var index = this.name;
            $(modal + ' #'+ roleID + ' .lookleft img[name='+index+']').show();
            $(modal + ' #'+ roleID + ' .lookright img[name='+index+']').hide();
        });

        $(modal + ' .chosenBtn').on('click', function () {
            var roleID = this.parentNode.parentNode.id;
            $(modal + ' #'+ roleID + ' .lookleft img').hide();
            $(modal + ' #'+ roleID + ' .lookright img').show();
        })

        $(modal + ' .unchosenBtn').on('click', function () {
            var roleID = this.parentNode.parentNode.id;
            $(modal + ' #'+ roleID + ' .lookleft img').show();
            $(modal + ' #'+ roleID + ' .lookright img').hide();
        })
    });
}

function looked(bltnID) {
    $.get('/bulletinView/looked', {bltnID:bltnID}, function (res) {
        $('#txtBltnlooked').html(res);
    });
}

