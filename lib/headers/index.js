/*
 * Template module
 *
 * Description:  ---bla---
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {},
    log = {};

module.exports = function(server) {
    config = server.config,
    log = server.log;

    return {
        addResponseHeader : function(request, response, header, callback) {
            // Add response headers
            response.headers.push(header);
            if(typeof (callback) == 'function') callback(request, response);
            else return;
        },
        getResponseHeaders : function(request, response, callback) {
            // Get response headers
            callback(request,response);
        }
    }
}