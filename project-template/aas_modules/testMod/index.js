/*
 * Smarty replace
 *
 * Description:  This module will replace smarties in text files
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {},
    log = {},
    modObject = {};

module.exports = function(server) {
    config = server.config;
    log = server.log;

    console.log("Test mod loaded");

    modObject.test = function (request, response, callback) {

        console.log("Test function done: "  + request.headers.host);

        if(typeof (callback) == 'function') callback(request, response);
        else return;
    };

    return modObject;
}