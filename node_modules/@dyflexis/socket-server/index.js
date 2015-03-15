/*
 * Socket server for angular-server-with-sockets
 *
 * Description:  Connects socket to the http server
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {},
    log = {};

module.exports = function(server) {
    config = server.config;
    log = server.log;

    var socketServer = {
        socketTestData : function (request, response, callback) {
            if(typeof(request.data.command) !== 'undefined') {
                switch(request.data.command) {
                    case 'config':
                        if(typeof(request.data.subcommand) !== 'undefined'){
                            if(config.global.verbose == true) console.log('Sending data');
                            response.message.command = request.data.command;
                            response.message.subcommand = request.data.subcommand;
                            response.message.data = config[request.data.subcommand];
                        }
                        break;

                    default :
                        break;
                }
            }

            callback(request, response);
        },
        socketReqRes : function(message, method, socket) {
            var request = {},
                response = {},
                reqTime = new Date();

            request.method = method;
            request.socket = socket;
            request.time = reqTime;


            response.message = {};
            response.end = function (request, response) {
                request.socket.emit(request.method, response.message);
            }

            // TODO: Exeption is parsing fails
            request.data = message;

            if(config.global.verbose == true) console.log(message);

            if(typeof(request.data.sessionID) !== 'undefined') {
                // Build request object
                // Call some middle ware
                socketServer.socketTestData(request, response, function(request, response) {
                    response.end(request, response);
                });
            } else {
                // Reject conenction
                // TODO: Disconnect here
            }
        }
    }
    return socketServer;
}