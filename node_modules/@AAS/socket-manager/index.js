/*
 * Socket manager for angular server
 *
 * Description:  A socket connection manager based on redis
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {},
    redis = require('redis'),
    log = {},
    redisClient = redis.createClient(),
    activeSockets = {};

// Do the redis connect and error stuff
redisClient.on('error', function (err) {
    console.log('Redis Error ' + err);
});

redisClient.on('connect', function(){
    console.log('Redis connected');
});

module.exports = function(server) {
    config = server.config;
    log = server.log;

    return {
        addSocket : function(socket, sessionID, workerID) {
            activeSockets[sessionID] = {workerID:workerID, sessionID:sessionID};
            //console.log(activeSockets);
            return;
        },
        deleteSocket : function(socket) {
            // Test for bla bla here
            return true;
        },
        getSockets : function() {
            // Test for bla bla here
            return true;
        }
    }
}