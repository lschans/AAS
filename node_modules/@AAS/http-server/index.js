/*
 * HTTP Server for angular-server-with-sockets
 *
 * Description:  http server
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var http = require('http'),
    config = {},
    log = {},
    socketio,
    http,
    httpServer = {},
    socketListener,
    socketServer,
    socketManager;



module.exports = function(server) {
    config = server.config;
    log = server.log,
    socketio = server.httpSocket;
    socketServer = server.socketServer;
    socketManager = server.socketManager;

    return {
        server : function(callback) {
            var x = 0;
            httpServer = http.createServer(function (request, response) {
                request.on('error',function(err){
                    console.log('Request error: ' + JSON.stringify(err));
                })
                if(config.global.verbose == true) console.log('http -> ' + ++x);
                log.writeLog({domain: 'request', request: request});
                callback(request, response);
            });

            httpServer.timeout = (90 * 1000);

            httpServer.on('error', function(err){
                console.log('HTTP server error: ' + JSON.stringify(err));
            });

            httpServer.listen(config.global.httpPort, 'localhost');

            log.writeLog({message: 'HTTP Server online', domain: 'server', port: config.global.httpPort});
            console.log('HTTP-Server started on port ' + config.global.httpPort + ' pid: ' + process.pid);

            // Some socket test stuff
            socketListener = socketio.listen(httpServer);

            socketListener.on('error', function(err){
                console.log('HTTP Socket server error: ' + JSON.stringify(err));
            });

            // Connect the sockets to redis
            socketListener.adapter(server.redis({host: config.global.redisServer, port: config.global.redisPort}));

            socketListener.on('connection', function (socket) {
                if(config.global.verbose == true) console.log('http socket connected to worker ' + process.pid);
                socketManager.addSocket(socket, 'blabla', process.pid);
                socket.on('message', function (msg) {
                    if(config.global.verbose == true) console.log('Message Received: ' + msg);
                    socket.broadcast.emit('message', process.pid + ' - ' + msg);
                });
                socket.on('admin', function (message) {
                    socketServer.socketReqRes(message, 'admin', socket);
                });
                socket.on('disconnect', function() {
                    console.log('Socket disconnected');
                });
                socket.on('error', function() {
                    if (typeof console !== "undefined" && console !== null) {
                        console.log("Socket.io reported a generic error");
                    }
                });
            });

            return httpServer;
        }
    }
}