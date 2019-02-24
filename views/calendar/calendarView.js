/*
 * task.html
 */
/*Data Define*/
var date = new Date();
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();

/*FullCalendar*/
var config =
{
    themeSystem: "jquery-ui",
    header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,agendaDay,listMonth'
    },
    defaultDate: new Date(y, m, d),
    navLinks: true,
    editable: true,
    eventLimit: true,
    dayClick: dayClick,
    events: [
    ]
}

config.events = dayList;

/*Function excution*/

$('#calendar').fullCalendar(config);

tagEvent();



/*function define*/
function dayClick(date, allDay, jsEvent, view)
{
    $("body").attr("style",'overflow: hidden;');
    $('.pop-layer1').show();
}

function tagEvent() {

    $("#addTask").click(function() {
        $('.pop-layer1').show();
    });

    $("#closePop").click(function(){
        $("body").attr("style",'overflow: auto;');
        $('.pop-layer1').hide();
    })
}



/*
 * dayList.html
 */
/*Data Define*/
var i = 0;


/*Function excution*/

addFunction();
addDatePicker(0,0);

$("#addteamL").click(function(){
   i++;
   $("#teamLeader").append(
       "<div id=\"teamLbody\"class='row'>\
               <div class='col-md-1 text-center'>\
                   <input id='teamLcheck_"+ i +"' type='checkbox' style=\"zoom: 160%;\">\
               </div>\
               <div class='col-md-5' style='padding-left:29px;'>\
                   <div id='teamLDate_"+ i +"' class='row'>\
                   <input id='datepicker_" + i +"0' type='text'  style='height:23px;'>\
                   <button id='addteamLDate_"+ i +"' class='btn btn-default' type='button' style='height:23px;padding:0px;width:10%;'> <i class='glyphicon glyphicon-plus'></i></button>\
                   <button id='delteamLDate_"+ i +"' class='btn btn-default' type='button' style='height:23px;padding:0px;width:10%;'> <i class='glyphicon glyphicon-minus'></i></button>\
                   </div>\
               </div>\
               <div class='col-md-3 text-center'>\
                   <input id='teamLName_"+ i +"' class='input-sm' type='text' style='padding:0px;padding-right:0px;padding-left:0px;width:100%;'>\
               </div>\
               <div class='col-md-3 text-center'>\
                   <input id='teamLPhone_"+ i +"' class='input-sm' type='text' style='padding:0px;padding-right:0px;padding-left:0px;width:100%;'>\
               </div>\
           </div>"
   );

   addFunction();
   addDatePicker(i,0);

});

$("#delteamL").click(function(){
   if(i>0){
      $("#teamLeader #teamLbody:last-child").remove();
       i--;
   }
});

$("#campTStart").datepicker({
       showOn: "button",
       buttonImage: "public/date.png",
       buttonImageOnly: true,
       buttonText: "Select date"
   });

$("#campTEnd").datepicker({
       showOn: "button",
       buttonImage: "public/date.png",
       buttonImageOnly: true,
       buttonText: "Select date"
   });


/*function define*/
function addFunction() {

   $("#teamLcheck_"+i).change(function() {
       var index = this.id.split("_")[1];
       if ($(this)[0].checked) {
           $("#teamLDate_"+index).hide();
       } else {
           $("#teamLDate_"+index).show();
       }
   });

   $("#addteamLDate_"+i).click(function() {

       var index1 = this.id.split("_")[1];
       var index2 = ($("#teamLDate_"+index1).children().length-2)/2;
       $("#teamLDate_"+index1).append(
           "<input id=\"datepicker_" + index1 + index2 +"\" type=\"text\"  style='height:23px'>"
       );
       addDatePicker(index1,index2);
   });

   $("#delteamLDate_"+i).click(function () {
       var index1 = this.id.split("_")[1];
       var index2 = ($("#teamLDate_"+index1).children().length-2)/2-1;
       if (index2>0) {
           $("#datepicker_"+index1+index2).next().remove();
           $("#datepicker_"+index1+index2).remove();
       }
   })
}

function addDatePicker(i,j) {
   $('#datepicker_'+i+j).datepicker({
       showOn: "button",
       buttonImage: "public/date.png",
       buttonImageOnly: true,
       buttonText: "Select date"
   });
}
