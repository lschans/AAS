/*
 * Authentication module
 *
 * Description:  Module that does authentication by posting username and password and login command
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {},
    log = {};
    //seneca = seneca = require('seneca')().use('redis-transport').client({type:'redis'});

module.exports = function(server) {
    config = server.config;
    log = server.log;
    return {
        authenticate : function(request, response, callback) {
            // Authenticate user
            if(request.headers.post['command'] == 'login') {
                // Do the login using the seneca auth module
                if(request.headers.post['password'] === config.users[request.headers.post['name']].pass) {
                    var user = {key:"user", value:config.users[request.headers.post['name']]};
                    response.setSessionData(request, response, user, function(request, response){
                        callback(request, response);
                    });
                }
            } else {
                // No auth request.. continue
            }
        },
        unauthenticate : function(request, response, callback) {
            // Remove authentication
            response.setSessionData(request, response, {key:"user", value:config.users.guest}, function(request, response){
                callback(request, response);
            });
        }
    }
}