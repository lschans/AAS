/*
 * Serve module
 *
 * Description:  This module actually serves the file to client after all other operations are done
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var fs = require('fs'),
    url     = require('url'),
    path    = require('path'),
    replaceStream = require('replacestream'),
    config = {},
    log = {};

module.exports = function(server) {
    config = server.config;
    log = server.log;

    var serve = {
        serveFile : function(request, response, callback) {
            // Add server ID to headers
            /*
                TODO:
                 *  Read request url
                 *  Read request host
                 *  Split for port? ':'
                 *  Test if we are logged on and change root dirs
                 *  Test if we are mobile and change root dirs
                 *  See if file exists
                 *  See if we are allowed to serve the file
                 *  Send error if we cannot
                 *  See if file is binary and change the type to that
                 *  If plain text render @@ template vars
                 *  Serve file if we can
            */

            // TODO: Respond to *.domain.com and aliasses

            /*

                authentication and directory swapping

                remove leading /

                add forbidden to serve

                add 500 and 404 and more

             */

            // Cache hack
            // TODO: Remove hack and make sane
            response.addResponseHeader(request, response, ['Cache-Control', 'no-cache, no-store, must-revalidate']);
            response.addResponseHeader(request, response, ['Pragma', 'no-cache']);
            response.addResponseHeader(request, response, ['Expires', '0']);
            response.addResponseHeader(request, response, ['Access-Control-Allow-Origin', '*']);


            // Clean the url
            var cleanUrl = request.url.split('?')[0].split(':')[0];

            if(typeof(config.global.app[request.headers.host]) !== 'undefined') {
                var configDomain = request.headers.host;
            } else {
                var configDomain = config.global.app.defaultDomain;
            }

            // Switch between real root and login root ( mind string )
            if(request.session.data.user.uid !== "0") {
                var path = config.global.app[configDomain].roots.authenticated;
            } else {
                var path = config.global.app[configDomain].roots.unauthenticated;
            }

            // If request.url is a directory add config.global.index to the end.
            if(cleanUrl.slice(-1) == '/') {
                cleanUrl += config.global.app[configDomain].index;
            }

            if(fs.existsSync(path + cleanUrl)) {
                // Do nothing now the file exists
                if(config.global.verbose == true) console.log('NORMAL serve ' + process.pid);
            } else if(fs.existsSync(config.global.app[configDomain].roots.common + cleanUrl)){
                // Change path to public
                if(config.global.verbose == true) console.log('PUBLIC serve ' + process.pid);
                path = config.global.app[configDomain].roots.common;
            } else {
                // We don't have the file
                if(config.global.verbose == true) console.log('404 serve ' + process.pid);
                response.status = 404;
                response.fileName = config.global.app[configDomain].roots.common + '/error.html';
                response.extention = 'html';
                contentTypeHeader = "text/html; " + response.charset;
                response.addResponseHeader(request, response, ['Content-Type', contentTypeHeader]);
                serve.write(request,response);
                return 1;
            }

            // Break request url to pieces and make all ready be served
            if(response.status === 200) {
                var urlParts = cleanUrl.split('/'),
                    requestFile = urlParts[urlParts.length -1],
                    fileParts = requestFile.split('.'),
                    extention = fileParts[fileParts.length -1],
                    contentTypeHeader = config.fileTypes[extention] || '';

                contentTypeHeader = contentTypeHeader.replace('@@_CHARSET_@@', response.charset);
                response.addResponseHeader(request, response, ['Content-Type', contentTypeHeader]);

                // Serve the file
                response.fileName = path + cleanUrl;
                response.extention = extention;
            }

            if(config.global.verbose == true) console.logDefault(cleanUrl, response.status, contentTypeHeader);

            serve.write(request,response);

            if(typeof (callback) == 'function') callback(request, response);
            else return;
        },
        write : function (request, response) {
            // Add server name
            response.addResponseHeader(request, response, ['X-Powered-By', config.global['X-Powered-By']]);
            // Prepare the response and send to client
            response.prepareCookies(request, response, function(){
                response.headers
                response.writeHead(response.status, response.headers);
                if(typeof(response.fileName) !== 'string') {
                    response.end();
                    return;
                }

                var stream = fs.createReadStream(response.fileName);

                // Nice smarty plugin here if file is text, but for now to make it work
                if((response.extention == 'html' || response.extention == 'css' || response.extention == 'js') && response.status === 200) {
                    stream.
                        pipe(replaceStream('@@_SERVER_IP_@@', config.network[0].address, {limit: 2})).
                        pipe(replaceStream('@@_LOGIN_MESSAGE_@@', config.auth.message, {limit: 2})).
                        pipe(replaceStream('@@_SERVER_IP_@@', config.network[0].address, {limit: 2})).
                        pipe(replaceStream('@@_VERSION_@@', config.global.version, {limit: 2})).
                        pipe(replaceStream('@@_UPTIME_@@', process.uptime(), {limit: 2})).
                        pipe(replaceStream('@@_DATE_@@', config.git.date, {limit: 2})).
                        pipe(response);
                } else if ((response.extention == 'html' || response.extention == 'css' || response.extention == 'js') && response.status !== 200) {
                    stream.
                        pipe(replaceStream('@@_ERROR_MESSAGE_@@', config.statusCodes[response.status].message, {limit: 2})).
                        pipe(replaceStream('@@_STATUS_@@', response.status, {limit: 2})).
                        pipe(response);
                } else {
                    stream.pipe(response);
                }
            });
        }
    }
    return serve;
}