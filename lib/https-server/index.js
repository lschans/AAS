/*
 * HTTPS server for angular-server-with-sockets
 *
 * Description:  Serves content over ssl
 *
 * SSL tutorial -> http://superuser.com/questions/73979/how-to-easily-create-a-ssl-certificate-and-configure-it-in-apache2-in-mac-os-x
 *
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var https = require('https'),
    fs = require('fs'),
    config = {},
    log = {},
    options = {},
    socketio;

module.exports = function(server) {
    config = server.config;
    log = server.log,
    socketio = server.httpsSocket,
    https,
    httpsServer = {};

    options = {
        key: fs.readFileSync(config.ssl.key),
        cert: fs.readFileSync(config.ssl.cert)
    };

    return {
        server : function(callback) {
            httpsServer = https.createServer(options, function (request, response) {
                log.writeLog({domain:'request', request:request});
                callback(request, response);
            });

            httpsServer.timeout = 0;
            httpsServer.listen(config.global.httpsPort, 'localhost');


            log.writeLog({message:'HTTPS Server online', domain:'server', port:config.global.httpsPort});
            console.log('HTTPS-Server started on port ' + config.global.httpsPort + ' pid: ' + process.pid);

            // Some socket test stuff
            var socketServer = socketio.listen(httpsServer);
            // Connect the sockets to redis
            socketServer.adapter(server.redis({ host: config.global.redisServer, port: config.global.redisPort }));

            socketServer.on('connection', function (socket) {
                console.log('https socket connected to worker ' + process.pid);
                socket.on('message', function (msg) {
                    console.log('Message Received: ' + msg);
                    socket.broadcast.emit('message', msg);
                });
            });

            return httpsServer;
        }
    }
}