/*
 * Logger module for angular-server-with-sockets
 *
 * Description:  Writes log to log files
 *
 * Depends on: config.log object
 * {
 *   "logType"     : "file",
 *   "logDir"      : "logs/",
 *   "format"      : "@@_DATETIME_@@ @@_RESPONSECODE_@@ @@_IP_@@ @@_URL_@@ @@_MESSAGE_@@"
 * }
 *
 * Log format options ( extendable )
 *  - @@_DATE_@@            -> The date of the log entry ( NOT USER SETTABLE )
 *  - @@_TIME_@@            -> The time of the log entry ( NOT USER SETTABLE )
 *  - @@_DATETIME_@@        -> The date/time of the log entry ( NOT USER SETTABLE )
 *  - @@_MESSAGE_@@         -> Optional message that will be logged
 *  - @@_URL_@@             -> The request url of the log message
 *  - @@_IP_@@              -> The IP address of
 *  - @@_RESPONSECODE_@@    -> The server response code
 *  - @@_SESSIONID_@@       -> The session id of the caller
 *  - @@_ID_@@              -> And id you can asign to whatever
 *  - @@_PID_@@             -> PID of the process calling
 *  - @@_USER_@@            -> The user name of the caller
 *  - @@_UA_@@              -> The user-agent of the request
 *  - @@_UID_@@             -> The user id of the caller
 *  - @@_DOMAIN_@@          -> Log domain e.g. server, error, request ( Will be saved as /logdir/@@_DOMAIN_@@.log
 *
 * Default format: @@_DATETIME_@@ @@_RESPONSECODE_@@ @@_IP_@@ @@_URL_@@ @@_MESSAGE_@@
 *
 * Formats that aren't passed logger function will be replaced by ''
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var fs = require('fs'),
    config = {},
    helpers = {};

module.exports = function(server) {
    config = server.config;
    helpers = server.helpers;

    return {
        writeLog : function(msgObj, request) {
            // TODO: Parse request if defined and auto fill more log formats

            // Add foreach function to msgObj so we can iterate over like it was an array
            msgObj.each = function(iterateFunc) {
                var counter = 0,
                    keys = Object.keys(this),
                    currentKey,
                    len = keys.length;
                var that = this;
                var next = function() {
                    if (counter < len) {
                        currentKey = keys[counter++];
                        iterateFunc(currentKey, that[currentKey]);

                        next();
                    } else {
                        // Unset all and clean up
                        that = counter = keys = currentKey = len = next = undefined;
                    }
                };
                next();
            };

            var msgStr = config.log.definedFormats[msgObj.domain] || config.log.default;

            // Replace dates
            msgStr = msgStr.replace('@@_DATE_@@', helpers.getDate());
            msgStr = msgStr.replace('@@_TIME_@@', helpers.getTime());
            msgStr = msgStr.replace('@@_DATETIME_@@', helpers.getDateTime());

           if(typeof(msgObj.request) !== 'undefined') {
               msgStr = msgStr.replace('@@_IP_@@', msgObj.request.connection.remoteAddress);
               msgStr = msgStr.replace('@@_URL_@@', msgObj.request.url);
               msgStr = msgStr.replace('@@_UA_@@', msgObj.request.headers['user-agent']);
           }
            msgObj.each(function (key, value) {
                msgStr = msgStr.replace('@@_' + key.toUpperCase() + '_@@', value);
            });

            // Clear what we couldn't replace, fix whitespace and add newline
            msgStr = msgStr.replace(/@@_(.*?)_@@/g, '').replace(/\s\s+/g, ' ') + "\n";

            var file = config.log.logDir + msgObj.domain + '.log';

            fs.appendFile(file, msgStr, function(err) {
                if(err) {
                    console.log(err);
                }
            });
            return true;
        }
    }
}