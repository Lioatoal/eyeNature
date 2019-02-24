
var socketSubcriber = {};
var devSubcriber;


exports.init = function(io, passportSocketIo, expressSessionStore) {
    io.use(passportSocketIo.authorize({
        // key:          'express.sid',       // the name of the cookie where express/connect stores its session_id
        secret: 'keyboard cat', // the session_secret to parse the cookie
        store: expressSessionStore, // we NEED to use a sessionstore. no memorystore please
        success: onAuthorizeSuccess, // *optional* callback on success - read more below
        fail: onAuthorizeFail, // *optional* callback on fail/error - read more below
    }));

    io.on('connection', function(socket) {
        socketSubcriber[socket.id] = socket;
        socket.on('disconnect', function() {
            delete socketSubcriber[socket.id]
        });

        socket.on("SUBCRIBER_STATE", function(ack){
            // devSubcriber = mqtt.getSubcriber();
            ack(devSubcriber);
        });
    });

    /**
     *  Socket Authorize
    */
    function onAuthorizeSuccess(data, accept) {
        console.log('successful connection to socket.io');
        accept();
    }

    function onAuthorizeFail(data, message, error, accept) {
        console.log('failed connection to socket.io:', message);
        console.log('data:', data.socket._peername);
        if (error)
            accept(new Error(message));
        // this error will be sent to the user as a special error-package
        // see: http://socket.io/docs/client-api/#socket > error-object
    }
}
