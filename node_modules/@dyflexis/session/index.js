/*
 * session manager for angular-server-with-sockets
 *
 * Description:  Session manager for 'angular server with sockets'
 *
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {},
    log = {},
    url = '',
    MongoClient = require('mongodb').MongoClient,
    collection;

module.exports = function(server) {
    config = server.config;
    log = server.log;
    url = 'mongodb://' + config.session.mongoHost + ':'  + config.session.mongoPort + '/' + config.session.database;

    // Define collection once to prevent luguber connection drops.
    MongoClient.connect(url, function(err, db) {
        collection = db.collection(config.session.collection);
    });

    sessions =  {
        setSession : function(request, response, callback) {
            var d = new Date(),
                r = response.randomString(32),
                sessionID = new Buffer(r + d).toString('base64').replace(/\=/g, '');

            request.session = {};
            request.session.data = {};

            // Set guest user
            response.setSessionData(request, response, {key:'user', value:config.users.guest});

            collection.update({"sessionID": sessionID}, {
                $set: {
                    "sessionID": sessionID,
                    "ip": request.connection.remoteAddress,
                    "dateTime": response.dateCookieString(d),
                    "data": request.session.data
                }
            }, {upsert: true}, function (err, docs) {
                response.setCookie(request, response, ['X-Session-ID', sessionID]);
                callback(request, response);
            });

        },
        getSession : function(request, response, callback) {
            // Set session code here
            collection.findOne({"sessionID":request.cookies["X-Session-ID"]}, function (err, doc) {
                request.session = doc;
                if(request.session === null) sessions.setSession(request, response, callback);
                else callback(request, response);
            });

        },
        setData : function (request, response, data, callback) {
            // Set data in session
            // data should be in the format of {'key':'myDataName', 'value':'my epic data'}
            request.session.data[data.key] = data.value;
            sessions.save(request, response, function(request, response){
                if(typeof(callback) == 'function') callback(request, response);
                else return;
            });
        },
        save : function (request, response, callback) {
            collection.update({"sessionID": request.session.sessionID}, {
                $set: {
                    "sessionID": request.session.sessionID,
                    "ip": request.connection.remoteAddress,
                    "data": request.session.data
                }
            }, {upsert: true}, function (err, docs) {
                callback(request, response);
            });
        },
        clearSession : function (request, response, callback) {
            // Clear a session
            collection.remove({"sessionID":request.cookies["X-Session-ID"]}, function (err, docs) {
                request.session = {};
                callback(request, response);
            });
        },
        initSession : function (request, response, callback) {
            // Initialize session
            request.session = {};
            if(typeof(request.cookies["X-Session-ID"]) !== 'undefined'){
                sessions.getSession(request, response, function(request, response){
                    callback(request, response);
                })
            } else {
                // set session
                sessions.setSession(request,response, function(request, response){
                    callback(request, response);
                })
            }

        }
    }
    return sessions;
}