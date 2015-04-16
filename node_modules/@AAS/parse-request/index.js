/*
 * Module that processes POST for angular-server-with-sockets
 *
 * Description: Module processes POST data and adds it to the request object
 *              request.headers.post will be set by this module
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var qs  = require('querystring'),
    url = require('url');

module.exports = function(server) {
    config = server.config,
    log = server.log;

    return {
        getPost : function(request, response, callback) {
            if (request.method == 'POST') {  // Catch POST methods
                var post = '';
                request.on('data', function (data) {
                    post += data;
                    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                    if (post.length > 1e6) {
                        // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                        request.connection.destroy();
                    }
                });

                request.on('end', function () {
                    request.headers.post = qs.parse(post);
                    // use POST
                    callback(request, response);
                });
            } else { // Continue normal operation
               request.headers.post = {};
               callback(request, response);
            }
        },
        getGet : function(request, response, callback) {
            if (request.method == 'GET') {  // Catch GET methods
                request.headers.get = url.parse(request.url, true).query;
                callback(request, response);
            } else { // Continue normal operation
                request.headers.get = {};
                callback(request, response);
            }
        },
        getCommand : function(request, response, callback) {
            // This function is for development purposes for now, needs permission and authentication and such
            if (typeof (request.headers.post['command']) !== 'undefined') {  // Catch GET methods
                if(request.headers.post['command'] == 'RELOAD') {
                    server.send('MSG:RELOAD');
                }
                callback(request, response);
            }
        }
    }
}