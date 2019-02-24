
/*Require Modules*/
var express = require('express');
var menus = require('../../config/menus');
var sidebar = require('../../config/sidebar');

var router = express.Router();

/*--test data--*/
var date = new Date();
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();

var dayList =
[
	{
        title: '北大-野外求生 小明 商管-30'+"\n"+"小管、透抽、小烏龜、樹樹",
        start: new Date(y, m, 1),
        end: new Date(y, m, 3),
        color: "#ff8700",
        allDay: true,
    },
    {
        title: '師大-六足 小犀牛 理院C211' +"\n"+"芝芝、甄甄、LuLu、小管",
        start: new Date(y, m, 1),
        end: new Date(y, m, 3),
        color: "#7587e3",
        allDay: true,
    },
    {
        title: '師大-兜蟲營1 小明 理院C007'+"\n"+'沛沛、小孟、薇薇、ㄙㄙ',
        start: new Date(y, m, 16),
        end: new Date(y, m, 19),
        color: "#75d7e3",
        allDay: true,
    },
    {
        title: '北大-野外求生 小明 商管-30'+"\n"+"小管、透抽、小烏龜、樹樹",
        start: new Date(y, m, 12),
        end: new Date(y, m, 14),
        color: "#C0C0C0",
        allDay: true,
    },
    {
        title: '師大-兜蟲營 小明 理院C007'+"\n"+'沛沛、小孟、薇薇、ㄙㄙ',
        start: new Date(y, m, d+13),
        end: new Date(y, m, d+18),
        color: "#bb21cd",
        allDay: true
    },
    {
        title: '師大-六足 小犀牛 理院C211' +"\n"+"芝芝、甄甄、LuLu、小管",
        start: new Date(y, m, 20),
        end: new Date(y, m, 23),
        color: "#11d7e3",
        allDay: true
    },
    {
        title: '師大-兜蟲營 小明 理院C007'+"\n"+'沛沛、小孟、薇薇、ㄙㄙ',
        start: new Date(y, m, d+4),
        end: new Date(y, m, d+6),
        color: "#ee11d3",
        allDay: true
    }
]


router.get('/calendar', function(req, res) {
	var user = req.session.user;
    res.render('./calendar/calendar.html', {
        target: 'calendar',
        menus: menus,
		userInfo: userInfo[user],
        sidebar: sidebar,
        dayList : JSON.stringify(dayList)
    });
});

module.exports = router;
