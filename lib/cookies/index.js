/*
 * Cookie module
 *
 * Description:  This module gets and sets cookies
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {},
    server ={};

var cookieFunctions = {
    parseTheCookies : function (cookieString) {
        // Parse a cookie string
        var cookies = {};
        if(cookieString !== '') {
            cookieString.split(';').forEach(function (cookie) {
                var parts = cookie.match(/(.*?)=(.*)$/);
                cookies[parts[1].trim()] = (parts[2] || '').trim();
            });
        }
        return cookies;
    },
    parseCookies : function(request, response, callback) {
        // Parse all request cookies
        if(typeof (request.headers.cookie) !== 'undefined') {
            request.cookies = cookieFunctions.parseTheCookies(request.headers && request.headers.cookie);
        } else {
            request.cookies = {};
        }
        callback(request, response);
    },
    setCookie : function(request, response, cookie, callback) {
        // Set-Cookie: value[; expires=date][; domain=domain][; path=path][; secure]
        // Set-Cookie: name=Test; expires=Sat, 02 May 2015 23:38:25 GMT
        // Set-Cookie: name=Test; domain=test.net
        // Set-Cookie: name=Test; path=/login ---> anything that begins with /login is valid. Note that this comparison is only done once the domain option has been verified.
        // Set-Cookie: name=Test; secure
        // Set-Cookie: name=Test; HttpOnly

        response.headers.push(['Set-Cookie', cookie[0] + '=' + cookie[1]]);

        if(typeof (callback) == 'function') callback(request, response);
        else return;
    },
    prepareCookies : function(request, response, callback) {
        cookieString = '';
        if(typeof (callback) == 'function') callback(request, response);
        else return;
    },
    deleteCookie : function(request, response, cookie, callback) {
        // Delete a cookie
        // Set date in the past
        if(typeof (callback) == 'function') callback(request, response);
        else return;
    }
}

module.exports = function(globalServer) {
    server = globalServer;
    config = server.config;
    return cookieFunctions;
}