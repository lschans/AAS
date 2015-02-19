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
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    helpers = require('@dyflexis/server_helpers')(config),
    session = require('@dyflexis/session')(config),
    mobileDetect = require('mobile-detect');

// Disable verbose mode for threaded processes
if (cluster.isWorker) config.global.verbose = false;


// Cluster the webserver over all CPU cores to be multi threaded
if (cluster.isMaster) {
    config.cluster.isMaster = true;

    // Master code, all this code will be executed once
    if (config.global.verbose === true) console.log(numCPUs + ' CPU\'s detected.');

    //config.reload();
    //console.log(config);
    //console.log(helpers.dateCookieString(255255255255));

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        if (config.global.verbose === true) console.log('Forking worker process.');
        config.cluster.workers[i] = cluster.fork();
    }

    // Exit function for the master process
    cluster.on('exit', function(worker, code, signal) {
        if (config.global.verbose === true) console.log('Worker ' + worker.process.pid + ' died');
    });
} else {
    // Threaded code, all this code will be executed for each thread

    // Process shutdown for
    process.on('message', function(msg) {
        if(msg === 'shutdown') {
            // initiate graceful close of any connections to server
        }
    });
}


