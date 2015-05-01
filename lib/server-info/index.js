/*
 * Add some debug info to the end of the body
 *
 * Description:  Awesome debug adder
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {};

module.exports = function(server) {
    config = server.config;
    // Add foreach function to config so we can iterate over like it was an array
    config.each = function(iterateFunc) {
        var counter = 0,
            keys = Object.keys(this),
            currentKey,
            len = keys.length;
        var that = this;
        var next = function() {
            if (counter < len) {
                currentKey = keys[counter++];
                iterateFunc(currentKey, that[currentKey]);

                next();
            } else {
                // Unset all and clean up
                that = counter = keys = currentKey = len = next = undefined;
            }
        };
        next();
    };

    return {
        requestInfo : function(request, response, callback) {
            // Test for session data
            if (typeof(request.session.data) !== 'undefined') {
                if (typeof(request.session.data.testValue) == 'undefined')
                    response.setSessionData(request, response, {key: "testValue", value: "My server info data test"});

                if (typeof(request.session.data.testObject) == 'undefined')
                    response.setSessionData(request, response, {
                        key: "testObject",
                        value: {test: "My server info object data test", 1: 'a', 'a': 1}
                    });

                if (typeof(request.session.data.testArray) == 'undefined')
                    response.setSessionData(request, response, {
                        key: "testArray",
                        value: ["My server info array data test", 1, 2, 3]
                    });
            }
            response.body += '<head><title>' + config.network[0].address + ' - ' + request.headers.host + request.url + '</title><style>html{background-color:#000; color:#00FF00}fieldset{border-color:#FF0000}</style></head>';
            response.body += '<fieldset><legend>Header information:</legend><pre>';
            response.body += 'FULL-URL: ' + request.headers.host + request.url + '\n';
            response.body += 'REQ-URL: ' + request.url + '\n';
            response.body += 'METHOD: ' + request.method + '\n';
            response.body += JSON.stringify(request.headers, true, 2) ;
            response.body += '</pre></fieldset>';
            if(typeof (request.cookies) !== 'undefined'){
                response.body += '<fieldset><legend>Cookies:</legend><pre>';
                response.body += JSON.stringify(request.cookies, true, 2) ;
                response.body += '</pre></fieldset>';
            }
            if(typeof (request.session) !== 'undefined'){
                response.body += '<fieldset><legend>Session:</legend><pre>';
                response.body += JSON.stringify(request.session, true, 2) ;
                response.body += '</pre></fieldset>';
            }
            callback(request, response);
        },
        clientInfo : function(request, response, callback) {
            if(typeof(request.clientInfo) !== 'undefined'){
                response.body += '<fieldset><legend>Client information:</legend><pre>';
                response.body += JSON.stringify(request.clientInfo, true, 2);
                response.body += '</pre></fieldset>';
            }
            callback(request, response);
        },
        addConfig : function(request, response, callback) {
            config.each(function(key, value){
                if(typeof(value) !== 'function' && value !== undefined) {
                    response.body += '<fieldset><legend>' + key + ' config:</legend><pre>';
                    response.body += JSON.stringify(value, true, 2);
                    response.body += '</pre></fieldset>';
                }
            });
            callback(request, response);
        },
        addForm : function (request, response, callback) {
            response.body = '<head>' +
            '<script src="/socket.io/socket.io.js"></script>' +
            '</head>' +
            '<form action="/" id="myForm">' +
            '<fieldset>' +
            '<legend>Personal information:</legend>' +
            'First name:<br>' +
            '<input type="text" name="firstname" value="Mickey">' +
            '<br>' +
            'Last name:<br>' +
            '<input type="text" name="lastname" value="Mouse">' +
            '<input id="command" type="hidden" name="command" value="">' +
            '<br><br>' +
            '<button onclick=\'myform = document.getElementById("myForm"); myform.method = "post"; myform.submit();\'>POST</button>' +
            '<button onclick=\'myform = document.getElementById("myForm"); myform.method = "get"; myform.submit();\'>GET</button>' +
            '<button onclick=\'myform = document.getElementById("myForm"); command=document.getElementById("command"); myform.method = "post"; command.value="RELOAD"; myform.submit();\'>RELOAD</button>' +
            '</fieldset>' +
            '</form><hr>';
            callback(request, response);
        }
    }
}