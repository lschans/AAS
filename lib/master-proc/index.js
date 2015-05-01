/*
 * Master process module
 *
 * Description:  This module will be included and executed when the master starts
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {},
    log = {},
    services = {},
    redis = require('redis'),
    numCPUs = require('os').cpus().length,
    httpProxy = require('http-proxy'),
    httpsProxy = httpProxy,
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    spawn = require('child_process').spawn,
    redisClient = redis.createClient();


// Do the redis connect and error stuff
redisClient.on('error', function (err) {
    redisError(err);
});

redisClient.on('connect', function(){
    console.log('Redis connected');
});

function redisError(err) {
    if( err ) {

        if( 'ECONNREFUSED' === err.code || 'notConnected' === err.message || 'Error: no open connections' === err ) {
            console.log('Redis Error ' + err);
            redisClient = redis.createClient();
        }
        return true;
    }
    return false;
}

// Should be nice configurable also split stuff for ssl and non-ssl number of threads
// Hacked to 2 cores for dev purposes
//var num_processes = numCPUs;
var num_processes = 8;

var rrWorkerCount = 0;

// Very basic aproach to redis load balancing. Should watch load and stuff does the RR now
var worker_index = function(ip, len, callback) {
    redisClient.get(ip, function (err, reply) {
        if(err) {
            redisError(err);
        }
        if(reply) {
            // Expire in 900 seconds ( 15 minutes )
            redisClient.expire(ip, 300);
            var workerID = Number(reply.toString());
            callback(workerID);
        } else {
            // Set a value with an expiration
            redisClient.set(ip, rrWorkerCount++);
            // Expire in 900 seconds ( 15 minutes )
            redisClient.expire(ip, 300);
            if(rrWorkerCount >= len) rrWorkerCount = 0;
            callback(rrWorkerCount);
        }
    });
};


module.exports = function(server, cluster, net) {
    config = server.config;
    log = server.log;

    return {
        execute : function () {
            server.cluster.workers = [];
            server.cluster.isMaster = true;
            server.cluster.isWorker = false;

            // Master code, all this code will be executed once
            if (config.global.verbose === true) console.log(numCPUs + ' CPU\'s detected.');

            if(config.global.verbose == true) console.log(server.helpers.dateCookieString(new Date().getTime()));

            // Fork workers.
            for (var i = 0; i < num_processes; i++) {
                if (config.global.verbose === true) console.log('Forking worker process.');
                server.cluster.workers[i] = cluster.fork();
                server.cluster.workers[i].httpPort = config.global.httpStartPort + i;
                server.cluster.workers[i].httpsPort = config.global.httpsStartPort + i;
                server.cluster.workers[i].workerID = i;

                server.cluster.workers[i].httpProxy = new httpProxy.createProxyServer({
                    target: {
                        host: 'localhost',
                        port: config.global.httpStartPort + i
                    }
                });

                server.cluster.workers[i].httpsProxy = new httpsProxy.createProxyServer({
                    target: {
                        host: 'localhost',
                        port: config.global.httpsStartPort + i
                    },
                    ssl: {
                        key: fs.readFileSync(config.ssl.key, 'utf8'),
                        cert: fs.readFileSync(config.ssl.cert, 'utf8')
                    },
                    secure: true // Depends on your needs, could be false.
                });

                // Receive messages from this worker and handle them in the master process.
                server.cluster.workers[i].on('message', function(msg) {
                    server.helpers.processMessage(msg);
                });
            }

            // ########## KICK OFF SENECA SERVICES #########################################

            /*
            services.files = fs.readdirSync(config.services.servicePath);
            services.files.splice(services.files.indexOf('readme.MD'), 1);
            services.service = {};

            // Start all services
            services.files.forEach(function (value) {
                services.service[value] = spawn('node', [config.appRoot + '/redis-server.js', config.appRoot + '/' + config.services.servicePath + value + '/index.js']);

                services.service[value].stdout.on('data', function (data) {
                    console.log('stdout: ' + data);
                });

                services.service[value].stderr.on('data', function (data) {
                    console.log('stderr: ' + data);
                });

                services.service[value].on('close', function (code) {
                    console.log('child process exited with code ' + code);
                });
            });
            */
            // #####################################################################################

            var x = 0;

            // HTTP
            var httpProxyServer = http.createServer(function (req, res) {
                worker_index(req.remoteAddress, num_processes, function(num) {
                    server.cluster.workers[num].httpProxy.web(req, res);
                });
            });


            httpProxyServer.on('upgrade', function (req, socket, head) {
                worker_index(req.remoteAddress, num_processes, function(num) {
                    server.cluster.workers[num].httpProxy.ws(req, socket, head);
                });
            });

            httpProxyServer.on('clientError', function (exception, socket) {
                console.log('Socket client error');
            });

            httpProxyServer.on('error', function (exception, socket) {
                console.log('Socket server error');
            });


            // HTTPS
            options = {
                key: fs.readFileSync(config.ssl.key),
                cert: fs.readFileSync(config.ssl.cert)
            };

            var httpsProxyServer = https.createServer(options, function (req, res) {
                worker_index(req.remoteAddress, num_processes, function(num) {
                    server.cluster.workers[num].httpsProxy.web(req, res);
                });
            });

            httpsProxyServer.on('upgrade', function (req, socket, head) {
                console.log('Upgrade request from: ' +  req.remoteAddress);
                worker_index(req.remoteAddress, num_processes, function(num) {
                    server.cluster.workers[num].httpsProxy.ws(req, socket, head);
                });
            });

            // TODO: Don't proxy untill all workers started

            cluster.on('online', function (worker) {
                // Do stuff when a worker comes online
                //worker.send('start-server:info', { id: worker.workerID,port: worker.port});
                server.log.writeLog({message:'online', domain:'worker', pid:worker.process.pid})
                if (config.global.verbose === true) console.log("Worker " + worker.process.pid + " responded and is online");
                worker.send('start-server:info||' + JSON.stringify({id:worker.id, httpPort:worker.httpPort, httpsPort:worker.httpsPort }));
                httpProxyServer.listen(config.global.httpPort);
                httpsProxyServer.listen(config.global.httpsPort);
            });

            cluster.on('exit', function (worker, code, signal) {
                // Do stuff when a worker exits or dies
                // TODO: Log exit code and message
                server.log.writeLog({message:'died', domain:'worker', pid:worker.process.pid});
                if (config.global.verbose === true) console.log('Worker ' + worker.process.pid + ' died');
                // Restart the worker
                server.cluster.workers[worker.workerID] = cluster.fork();
                server.cluster.workers[worker.workerID].workerID = worker.workerID;
                // Receive messages from this worker and handle them in the master process.
                server.cluster.workers[worker.workerID].on('message', function(msg) {
                    server.helpers.processMessage(msg);
                });
            });

            console.log('Master process started. PID: ' + process.pid);
        }
    }
}