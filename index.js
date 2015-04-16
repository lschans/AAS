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
    events = require('events'),
    execSync = require('exec-sync'),
    posix = require('posix'),
    server = {},
    cluster = require('cluster'),
    net = require('net'),
    processType;

// Limit max listeners to 500 per thread, must be from config but for now its nice
events.EventEmitter.prototype._maxListeners = 500;

// raise maximum number of open file descriptors to 10k,
// hard limit is left unchanged
if(typeof(posix.setrlimit)  == 'function') posix.setrlimit('nofile', { soft: 10000, hard: 10000 });

// Schedule round robin, this breaks the socket.io so don't use it anymore but keep the line here as reminder not to use it.
cluster.schedulingPolicy = cluster.SCHED_RR;

// Populate server object
config.appRoot = __dirname;
server.config = config;
server.helpers = require('@AAS/server-helpers')(server);
server.config.network = server.helpers.serverNICs();
server.log = require('@AAS/logger')(server);
server.cluster = {};

// Require socket.io 2x both for ssl and plain and distribute them over redis
server.httpSocket = require('socket.io');
server.httpsSocket = require('socket.io');

// Add redis transport to the server
server.redis = require('socket.io-redis');

// Cluster the webserver over all CPU cores to be multi threaded
if (cluster.isMaster) {
    processType = require('@AAS/master-proc')(server, cluster, net).execute();
} else {
    server.user = require('@AAS/user')(server);
    server.session = require('@AAS/session')(server);
    server.socketServer = require('@AAS/socket-server')(server);
    server.socketManager = require('@AAS/socket-manager')(server);

    server.config.git = {};
    server.config.git.commit = '';//execSync('git show --summary | grep commit');
    server.config.git.date =  '';//execSync('git show --summary | grep Date');
    server.config.git.author =  '';//execSync('git show --summary | grep Author');
    processType = require('@AAS/worker-proc')(server, cluster).execute();
}

// Catch process errors

process.on('uncaughtException', function (err) {
    switch(err.code) {
        case "ECONNRESET":
            console.log('Error ECONNRESET, a client disconnected dirty');
            break;

        case "ECONNREFUSED":
            console.log('Error ECONNREFUSED, could not open a port for listening');
            break;

        default:
            console.error(JSON.stringify(err));
            console.log("Unknown error, my PID:" + process.pid);
    }
});

