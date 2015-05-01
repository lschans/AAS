/*
 * Helper functions for angular-server-with-sockets
 *
 * Description:  A bundle with helper functions
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var fs = require('fs'),
    os = require('os'),
    config = {};

module.exports = function(server) {
    config = server.config;

    var helpers = {
        randomString : function (bits) {
            var rand,i,ret;
            ret='';
            // Round bits to 6 char multiply
            if(bits < 6) {
                bits = 6;
            } else {
                bits -= bits%6;
            }

            // in v8, Math.random() yields 32 pseudo-random bits
            while(bits > 0) {
                rand = Math.floor(Math.random() * 0x100000000); // 32-bit integer
                // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
                for (i = 26; i > 0 && bits > 0; i -= 6, bits -= 6) {
                    ret += config.helpers.randomChars[0x3F & rand >>> i];
                }
            }
            return ret;
        },
        pad : function (n){
            return n > 9 ? '' + n : '0' + n;
        },
        dateCookieString : function (ms){
            // from milliseconds since the epoch to Cookie 'expires' format which is Wdy, DD-Mon-YYYY HH:MM:SS GMT
            var d,wdy,mon;
            d = new Date(ms);
            wdy = config.helpers.weekdays;
            mon = config.helpers.months;
            return  wdy[d.getUTCDay()] + ', ' +
                helpers.pad(d.getUTCDate()) + '-' +
                mon[d.getUTCMonth()] + '-' +
                d.getUTCFullYear() + ' ' +
                helpers.pad(d.getUTCHours()) + ':' +
                helpers.pad(d.getUTCMinutes()) + ':' +
                helpers.pad(d.getUTCSeconds())+' GMT';
        },
        getDateTime : function(date) {
            date = date || new Date();

            var hour = date.getHours();
            hour = (hour < 10 ? "0" : "") + hour;

            var min = date.getMinutes();
            min = (min < 10 ? "0" : "") + min;

            var sec = date.getSeconds();
            sec = (sec < 10 ? "0" : "") + sec;

            var year = date.getFullYear();

            var month = date.getMonth() + 1;
            month = (month < 10 ? "0" : "") + month;

            var day = date.getDate();
            day = (day < 10 ? "0" : "") + day;

            return day + "-" + month + "-" + year + " " + hour + ":" + min + ":" + sec;
        },
        getDate : function(date) {
            date = date || new Date();

            var hour = date.getHours();
            hour = (hour < 10 ? "0" : "") + hour;

            var min = date.getMinutes();
            min = (min < 10 ? "0" : "") + min;

            var sec = date.getSeconds();
            sec = (sec < 10 ? "0" : "") + sec;

            var year = date.getFullYear();

            var month = date.getMonth() + 1;
            month = (month < 10 ? "0" : "") + month;

            var day = date.getDate();
            day = (day < 10 ? "0" : "") + day;

            return day + "-" + month + "-" + year;
        },
        getTime : function(date) {
            date = date || new Date();

            var hour = date.getHours();
            hour = (hour < 10 ? "0" : "") + hour;

            var min = date.getMinutes();
            min = (min < 10 ? "0" : "") + min;

            var sec = date.getSeconds();
            sec = (sec < 10 ? "0" : "") + sec;

            var year = date.getFullYear();

            var month = date.getMonth() + 1;
            month = (month < 10 ? "0" : "") + month;

            var day = date.getDate();
            day = (day < 10 ? "0" : "") + day;

            return hour + ":" + min + ":" + sec;
        },
        syncItter : function(request, response){
            // Function that iterates over a given array with callback functions
            var myFunction = response.funcArray.shift();
            if(response.funcArray.length > 0) {
                // It is a bit nasty referencing back to server, but 'this' doesn't work, good enough for this moment
                if(typeof (myFunction) === 'function') myFunction(request, response, server.helpers.syncItter);
            } else {
                delete response.funcArray;
                myFunction(request, response);
            }
        },
        syncIt : function(request, response, functionArray) {
            // Function that iterates over all callback functions in the function array
            response.funcArray = functionArray;
            this.syncItter(request, response);
        },
        objExtend : function(destination,source) {
            for (var property in source) destination[property] = source[property];
            return destination;
        },
        processMessage : function (msg) {
            //console.log('Master ' + process.pid + ' received message from worker ' + this.pid + '.', msg);
            //console.log(msg.msgFromWorker);
            var message = {};
            console.log(msg);
            if(typeof (msg.msgFromWorker) !== 'undefined') {
                msg.msgFromWorker.split(';').forEach(function(value, key){
                    var tmpMsg = value.split(':');
                    message[tmpMsg[0]] = tmpMsg[1];
                });

                if(message.MSG == 'RELOAD') {
                    for (var id in server.cluster.workers) {
                        console.log('Kill worker -> ', id);
                        // Reload gracefull, can be nicer in the future
                        helpers.blockSleep(1000, function(){
                            server.cluster.workers[id].kill('SIGUSR2')
                        });
                    }
                }
            }
        },
        blockSleep : function (time, callback) {
            //Block sleep, but async, the main process doesn't block
            var stop = new Date().getTime();
            while (new Date().getTime() < stop + time) {
                ;
            }
            callback();
        },
        fileIsAscii : function (fileName, callback) {
            // Read the file with no encoding for raw buffer access.
            fs.readFile(fileName, function(err, buf) {
                if (err) throw err;
                var isAscii = true;
                for (var i=0, len=buf.length; i<len; i++) {
                    if (buf[i] > 127) { isAscii=false; break; }
                }
                callback(isAscii, fileName); // true iff all octets are in [0, 127].
            });
        },
        testFiles : function () {
            var testDir = './development/webroot/test/';
            var testFiles = fs.readdirSync(testDir);
            testFiles.forEach(function (value) {
               helpers.fileIsAscii(testDir + value, function(x, file){
                   console.log(file + " -> " + x);
               });
            });
        },
        serverNICs : function () {
            var nics = [];
            var ifaces=os.networkInterfaces();
            for (var dev in ifaces) {
                var alias=0;
                ifaces[dev].forEach(function(details){
                    if (details.family=='IPv4') {
                        if(details.internal == false) {
                            nics.push(details);
                        }
                    }
                });
            }
            return nics;
        }
    };
    return helpers;
}

