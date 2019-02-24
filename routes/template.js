// Require Header file
var menus = require('../config/menus');
var sidebar = require('../config/sidebar');
var utility = require("../libs/utility");
// Require Modules
var express = require('express');
var url = require('url');
var async = require('async');
//Require Libs
var libMember = require("../libs/libMember");

var router = express.Router();

router.get('/template', function(req, res) {
    var userInfo = req.session.user;

    async.parallel([
        function(finish){
          finish();
        },
    ], function(errs, results){
        res.render('./partials/template.html', {
            target: 'template',
            menus: menus,
            userInfo: userInfo,
            sidebar: sidebar,
        });
    });
});

module.exports = router;
