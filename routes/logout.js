var express = require('express');
var passport = require('passport');
var utility = require("../libs/utility");
var router = express.Router();

router.get('/login', function(req, res) {
    res.render('login.html');
});

router.post('/login', function(req, res, next) {

    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('Client IP:', ip);

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }, function(err, user, info) {
        if (err) {
            return res.render('login.html', {
                title: 'Sign In',
                errorMessage: err.message
            });
        }

        if (!user) {
            return res.render('login.html', {
                title: 'Sign In',
                errorMessage: info.message
            });
        }
        return req.logIn(user, function(err) {
            if (err) {
                return res.render('login.html', {
                    title: 'Sign In',
                    errorMessage: err.message
                });
            } else {
                utility.updatePermission();
                var permission = utility.getPermissonBit(user.role_id);
                var permHead = {};
                for (const i in permission) {
                    var head = i;
                    permHead[head[0]] = true;
                }
                req.session.user = {
                    name : user.name,
                    email: user.email,
                    imgr : user.imgr,
                    roleID: user.role_id,
                    relatedID: user.related_id,
                    permHead: permHead,
                    permission: permission
                }
                return res.redirect('/');
            }
        });
    })(req, res, next);
});

router.get('/logout', function(req, res, next) {

    req.session.destroy();

    if (!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        req.logout();
        res.redirect('/login');
    }
});

module.exports = router;
