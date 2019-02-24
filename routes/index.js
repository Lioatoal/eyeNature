/* MTI CONFIDENTIAL INFORMATION */

var express = require('express');
var menus = require('../config/menus');
var sidebar = require('../config/sidebar');
var url = require('url');
var router = express.Router();

router.use(function(req, res, next) {
    urlobj = url.parse(req.url, true);
    if (urlobj.pathname === '/login' || req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
});

// Add router path from menus.js
for (var i = 0; i < menus.links.length; i++) {
    router.use('/', require('./'+ menus.links[i].href));
}

for (var i = 0; i < sidebar.length; i++) {
    if (sidebar[i].href == "#") {
        for (var j = 0; j < sidebar[i].second.length; j++) {
            // console.log(sidebar[i].second[j].href);
            // console.log(sidebar[i].second[j].path);
            router.use('/', require('./'+ sidebar[i].second[j].path));
        }
    } else {
        // console.log(sidebar[i].href);
        // console.log(sidebar[i].path);
        router.use('/', require('./'+ sidebar[i].path));
    }
}

// index page.
router.get('/', function(req, res) {
    res.redirect('/bulletin');
});

module.exports = router;
