var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
// var model = require('../models/user');
var model = require('../models/dbMember.js');


// var test1 = bcrypt.hashSync('12345678', 10);
//
// new model.member({email:'test1@gmail.com'}).save({
//     passcode:test1
// },{patch:true}).then(function () {
//     console.log("success edit");
// });

// passport config
passport.use(new LocalStrategy(function(email, passcode, done) {
    new model.member({email: email}).fetch({
       columns:['email', 'name', 'passcode', 'role_id', 'imgr','related_id']
    })
    .then(function(data) {
        var user = data;
        if(user === null) {
            return done(null, false, {message: 'Invalid username or password'});
        } else {
            user = data.toJSON();
            // console.log(user);
            if(!bcrypt.compareSync(passcode, user.passcode)) {
                return done(null, false, {message: 'Invalid username or password'});
            } else {
                return done(null, user);
            }
        }
    });
}));

// passport needs ability to serialize and unserialize users out of session
passport.serializeUser(function(user, done) {
    done(null, user.email);
});

passport.deserializeUser(function(email, done) {
    new model.member({email: email})
    .fetch({
        columns:['email', 'name', 'passcode']
    })
    .then(function(user) {
        done(null, user);
    });
});

module.exports = passport;
