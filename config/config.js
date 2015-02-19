/*
 * config script for 'angular-server-with-sockets'
 *
 * Description:  Build the configuration object
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {};

config.auth = require('./auth.json');
config.errors = require('./errors.json');
config.global = require('./global.json');
config.methods = require('./methods.json');
config.users = require('./users.json');

module.exports = config;
