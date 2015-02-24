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

var spdy = require('spdy'),
    fs = require('fs'),
    config = {},
    log = {},
    options = {};

module.exports = function(server) {
    config = server.config;
    log = server.log;
    options = {
        key: fs.readFileSync(config.ssl.key),
        cert: fs.readFileSync(config.ssl.cert),

        // **optional** SPDY-specific options
        windowSize: config.spdy.windowSize, // Server's window size

        // **optional** if true - server will send 3.1 frames on 3.0 *plain* spdy
        autoSpdy31: config.spdy.autoSpdy31
    };

    return {
        server : function(callback) {
            spdy.createServer(options, function (request, response) {
                log.writeLog({domain:'request', request:request});
                callback(request, response);
            }).listen(config.global.httpsPort);
            log.writeLog({message:'SPDY Server online', domain:'server', port:config.global.httpsPort});
            if (config.global.verbose === true) console.log('SPDY-Server started on port ' + config.global.httpsPort);
        }
    }
}
