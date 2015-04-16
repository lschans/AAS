/*
 * Live reload for angular-server-with-sockets
 *
 * Description:  Reloads the site live in dev mode
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

    return {
        testFunction : function(username, password) {
            // Test for bla bla here
            return true;
        }
    }
}