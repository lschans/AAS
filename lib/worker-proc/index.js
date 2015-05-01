/*
 * Worker process module
 *
 * Description:  This module will be included and executed when a worker starts
 *
 * TODO:
 *   * Fix serve to real serve
 *   * Add sessions
 *   * Fix login
 *   * Add basic auth headers and stuff
 *
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {},
    log = {},
    worker = {},
    httpSocket,
    httpsSocket;

module.exports = function(server, cluster) {
    config = server.config,
    log = server.log;
    httpSocket = server.httpSocket;
    httpsSocket = server.httpsSocket;

    server.send = function (message) {
        process.send({msgFromWorker: 'PRC:' + process.pid + ';' + message})
    }

    worker.parseRequest = require('@AAS/parse-request')(server);
    worker.serverInfo = require('@AAS/server-info')(server);
    worker.clientInfo = require('@AAS/client-info')(server);
    worker.headers = require('@AAS/headers')(server);
    worker.cookies = require('@AAS/cookies')(server);
    worker.session = require('@AAS/session')(server);
    worker.authenticate = require('@AAS/authenticate')(server);
    worker.serve = require('@AAS/serve')(server);

    // Load app modules

    config.global.app.middleWare.map(function(ware){
        console.log(ware);
        worker[ware.name] = require(ware.path)(server);
    });

    return {
        execute : function () {
            // Threaded code, all this code will be executed for each thread
            server.cluster.isMaster = true;
            server.cluster.isWorker = false;

            var write = function (request, response) {
                worker.headers.addResponseHeader(request, response, ['Content-Type', 'text/html; charset=' + response.charset]);
                worker.headers.addResponseHeader(request, response, ['X-Powered-By', config.global['X-Powered-By']]);

                // Prepare the response and send to client
                worker.cookies.prepareCookies(request, response, function () {
                    response.headers
                    response.writeHead(response.status, response.headers);
                    response.write(response.body, response.encoding);
                    response.end();
                });
            }

            var forceHTTPS = function (request, response) {
                response.writeHead(302, {'Location': 'https://' + request.headers.host + request.url});
                response.end();
            }

            var respond = function (request, response) {
                response.authenticated = false;

                response.headers = [];
                response.body = '';
                response.cookies = {};
                response.cookieArray = {};

                // Set empty session object and populate with guest user id
                request.session = {};
                request.session.data = {};
                request.session.data.user = {};
                request.session.data.user.uid = 0;


                // Populate response object with shared functions
                response.addResponseHeader = worker.headers.addResponseHeader;
                response.setCookie = worker.cookies.setCookie;
                response.prepareCookies = worker.cookies.prepareCookies;
                response.dateCookieString = server.helpers.dateCookieString;
                response.randomString = server.helpers.randomString;
                response.setSessionData = worker.session.setData;

                // Set default response and encoding
                response.status = 200;
                response.encoding = 'utf8';
                response.charset = 'utf-8';

                // Clone array because we don't want to rommel with the master object
                // Get the right sequence for the requested domain or default
                if(typeof(sequences[request.headers.host]) !== 'undefined') {
                    if(typeof(sequences[request.headers.host][request.method.toUpperCase()]) !== 'undefined') {
                        var seqArr = sequences[request.headers.host][request.method.toUpperCase()].slice(0);
                    } else {
                        var seqArr = sequences[request.headers.host]['UNDEFINED'].slice(0)
                    }
                } else {
                    if(typeof(sequences[config.global.app.defaultDomain][request.method.toUpperCase()]) !== 'undefined') {
                        var seqArr = sequences[config.global.app.defaultDomain][request.method.toUpperCase()].slice(0);
                    } else {
                        var seqArr = sequences[config.global.app.defaultDomain]['UNDEFINED'].slice(0);
                    }
                }

                server.helpers.syncIt(
                    request,
                    response,
                    seqArr
                );
            }

            // Parse domain sequences and other info
            var sequences = {};
            config.global.app.AAS.map(function(app){
                sequences[app.domain] = {};
                // Map replace strings with functions in config.global.app
                for (var m in app.modules) {
                    if (app.modules.hasOwnProperty(m)) {
                        sequences[app.domain][m] = [];
                        app.modules[m].map(function (module) {
                            var moduleArr = module.split('.');
                            if (typeof(worker[moduleArr[0]][moduleArr[1]]) === "function") {
                                sequences[app.domain][m].push(worker[moduleArr[0]][moduleArr[1]]);
                            }
                        });
                    }
                }

                // Set app specific config
                config.global.app[app.domain] = {};
                config.global.app[app.domain].roots = app.roots;
                config.global.app[app.domain].forceHTTPS = app.forceHTTPS;
                config.global.app[app.domain].index = app.index;
                config.global.app[app.domain].error = app.error;
            });

            var x = 0;

            // Worker process messages
            process.on('message', function(key, value) {
                var switchKey = key.split('||');
                switch(switchKey[0]) {
                    case 'http-sticky-session:connection':
                        if(config.global.verbose === true) console.log('send ' + ++x + '  -> ' + value.remoteAddress);
                        httpServer.emit('connection', value);
                    break;

                    case 'https-sticky-session:connection':
                        if(config.global.verbose === true) console.log('send ' + ++x + '  -> ' + value.remoteAddress);
                        httpsServer.emit('connection', value);
                        break;

                    case 'start-server:info':
                        var startObj = JSON.parse(switchKey[1])
                        server.config.global.httpPort = startObj.httpPort;
                        server.config.global.httpsPort = startObj.httpsPort;

                        worker.http = require('@AAS/http-server')(server);
                        if (config.global.useSPDY == true) worker.https = require('@AAS/spdy-server')(server);
                        else worker.https = require('@AAS/https-server')(server);

                        // Start the servers
                        if (server.config.global.forceHTTPS == true) {
                            var httpServer = worker.http.server(forceHTTPS);
                        } else {
                            var httpServer = worker.http.server(respond);
                        }
                        var httpsServer = worker.https.server(respond);
                        if(config.global.verbose === true) console.log('Worker: ' + startObj.id + ' received http port: ' + startObj.httpPort + ', received https port: ' + startObj.httpsPort);
                    break;

                    default:
                    return;
                }
            });
        }
    }
}