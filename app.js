var express = require('express');
var path = require('path');
var expressSession = require('express-session');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var fs = require('fs');
var useragent = require('express-useragent');
var bcrypt = require('bcryptjs');
var expressSessionStore = new expressSession.MemoryStore;
var compression = require('compression');

/**
 * custom include
 */
var routes = require('./routes/index');
var passport = require('./libs/passport');
var utility = require("./libs/utility");

/**
 * application declaration
 */
var apiConfig = JSON.parse(fs.readFileSync("./config.json")).api;
var app = express();

/**
 * node compression
 */
app.use(compression());

/**
 * view engine setup
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(favicon(__dirname + '/public/nature.jpg'));
app.use(logger('dev'));

/**
 * body-parser
 */
app.use(bodyParser.json(apiConfig.bodyParser.json));
app.use(bodyParser.urlencoded(apiConfig.bodyParser.urlencoded));
app.use(bodyParser.raw(apiConfig.bodyParser.raw));

/**
 * express session
 */
app.use(expressSession({
  store: expressSessionStore,
  secret: 'RoyAndMattP@ssw0rd',
  resave: true,
  saveUninitialized: true,
  // cookie: {maxAge:600*1000}
}));

/**
 * passport Init
 */
app.use(passport.initialize());
app.use(passport.session());
app.use(useragent.express());


app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// app.use(flash());

/**
 * security configuration
 */
app.disable('x-powered-by');

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/**
 * error handlers
 * development error handler will print stacktrace
 * production error handler, no stacktraces leaked to user
 */
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.html', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error.html', {
    message: err.message,
    error: {}
  });
});

module.exports = app;