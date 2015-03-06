/*
 * angular-server-with-sockets
 *
 * Description:  The perfect angular server with sockets
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

// Pretty the console output so eyes won't be hurt
global.console.logDefault = global.console.log;
global.console.log = require('eyes').inspector({maxLength: (1024 * 16)});

var config = require('./config/config.js'),
    server = {},
    cluster = require('cluster'),
    processType;

// Populate server object
server.config = config;
server.helpers = require('@dyflexis/server-helpers')(server);
server.config.network = server.helpers.serverNICs();
server.log = require('@dyflexis/logger')(server);
server.user = require('@dyflexis/user')(server);
server.session = require('@dyflexis/session')(server);
server.cluster = {};

// Require socket.io 2x both for ssl and plain and distribute them over redis
server.httpSocket = require('socket.io');
server.httpsSocket = require('socket.io');

// Add redis transport to the server
server.redis = require('socket.io-redis');

//server.helpers.testFiles();

// Cluster the webserver over all CPU cores to be multi threaded
if (cluster.isMaster) {
    processType = require('@dyflexis/master-proc')(server, cluster).execute();
} else {
    processType = require('@dyflexis/worker-proc')(server, cluster).execute();
}

