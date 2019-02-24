var http = require('http');
var https = require('https');
var fs = require('fs');
var debug = require('debug')('eyenature');

var app = require('../app');

var options = {
  key: fs.readFileSync(__dirname + '/ssl/file.pem'),
  cert: fs.readFileSync(__dirname + '/ssl/file.crt')
};

var port = normalizePort(process.env.PORT || '3000');
var httpsPort = normalizePort(process.env.HTTPSPORT || '5443');
app.set('port', port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Create HTTPS server
 */
var serverHttps = https.createServer(options, app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

serverHttps.listen(httpsPort);
serverHttps.on('error', onError);
serverHttps.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
  
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
        case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
        default:
        throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

console.log('app started on port %d', port);
  