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
global.console.log = require('eyes').inspector({maxLength: (1024 * 8)});

var config = require('./config/config.js'),
    server = {},
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    http;

// Populate server object
server.config = config;
server.helpers = require('@dyflexis/server_helpers')(server);
server.log = require('@dyflexis/logger')(server);
server.user = require('@dyflexis/user')(server);
server.session = require('@dyflexis/session')(server);
server.cluster = {};


// Disable verbose mode for threaded processes
//if (cluster.isWorker) config.global.verbose = false;


// Cluster the webserver over all CPU cores to be multi threaded
if (cluster.isMaster) {

    server.cluster.workers = [];
    server.cluster.isMaster = true;
    server.cluster.isWorker = false;

    // Master code, all this code will be executed once
    if (config.global.verbose === true) console.log(numCPUs + ' CPU\'s detected.');

    //config.reload();
    //console.log(config);
    console.log(server.helpers.dateCookieString(new Date().getTime()));

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        if (config.global.verbose === true) console.log('Forking worker process.');
        server.cluster.workers[i] = cluster.fork();
        server.cluster.workers[i].workerID = i;
    }

    cluster.on('online', function (worker) {
        // Do stuff when a worker comes online
        server.log.writeLog({message:'online', domain:'worker', pid:worker.process.pid});
        if (config.global.verbose === true) console.log("Worker " + worker.process.pid + " responded and is online");
    });

    cluster.on('exit', function (worker, code, signal) {
        // Do stuff when a worker exits or dies
        // TODO: Log exit code and message
        server.log.writeLog({message:'died', domain:'worker', pid:worker.process.pid});
        if (config.global.verbose === true) console.log('Worker ' + worker.process.pid + ' died');
        // Restart the worker
        server.cluster.workers[worker.workerID] = cluster.fork();
    });

} else {
    // Threaded code, all this code will be executed for each thread
    server.cluster.isMaster = true;
    server.cluster.isWorker = false;

    http = require('@dyflexis/http-server')(server);
    http.server(function(request, response){
        // Dummy response for now
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write('request successfully proxied to: ' + request.url + '\n' + JSON.stringify(request.headers, true, 2));
        response.end();
    });

    // Process shutdown for
    process.on('message', function(msg) {
        if(msg === 'shutdown') {
            // initiate graceful close of any connections to server
        }
    });
}


