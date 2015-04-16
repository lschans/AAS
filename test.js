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
    Q = require('q'),
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    http,
    parseRequest;

// Populate server object
server.config = config;
server.helpers = require('@AAS/server_helpers')(server);
server.log = require('@AAS/logger')(server);
server.user = require('@AAS/user')(server);
server.session = require('@AAS/session')(server);
server.cluster = {};

var request = {},
    response = {};

request.test = 'lol';
response.bla = 'ookLOL';

var getHeaders = function (request, response, callback) {
    console.log('Headers');
    request.headers = 'Location: redirect';
    callback(request, response);
}

var getBody = function (request, response, callback) {
    console.log('Body');
    response.body = 'Hi body data';
    callback(request, response);
}

var sendNow = function (request, response) {
    console.log('Send');
    console.log(request, response);
}

var funcArray = [
    sendNow,
    getBody,
    getHeaders
].reverse();

/*
var syncItter = function(request, response){
    var myFunction = response.funcArray.shift();
    if(response.funcArray.length > 0) {
        myFunction(request, response, syncItter);
    } else {
        response.funcArray = undefined;
        myFunction(request, response);
    }
}

var syncIt = function(request, response, funcArray) {
    response.funcArray = funcArray;
    syncItter(request, response);
}
*/

server.helpers.syncIt(request, response, funcArray);