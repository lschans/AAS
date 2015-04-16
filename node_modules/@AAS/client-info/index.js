/*
 * Client info module
 *
 * Description:  Gather as much info as we can about the client
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {},
    UAParser = require('ua-parser-js'),
    parser = new UAParser();

module.exports = function(server) {
    config = server.config;

    return {
        getInfo : function(request, response, callback) {
            // Gather client info to work with
            request.clientInfo = parser.setUA(request.headers['user-agent']).getResult();
            callback(request, response);
        }
    }
}

