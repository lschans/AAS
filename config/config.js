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

config.global = require('./global.json');
if(config.global.verbose === true) console.log('Loading configurations:');
if(config.global.verbose === true) console.log('    *   Global config loaded.');

config.auth = require('./auth.json');
if(config.global.verbose === true) console.log('    *   Auth config loaded.');

config.statusCodes = require('./statusCodes.json');
if(config.global.verbose === true) console.log('    *   Status codes config loaded.');

config.httpMethods = require('./httpMethods.json');
if(config.global.verbose === true) console.log('    *   Methods config loaded.');

config.contentTypes = require('./contentTypes.json');
if(config.global.verbose === true) console.log('    *   Content types loaded.');

config.restrictedFiles = require('./restrictedFiles.json');
if(config.global.verbose === true) console.log('    *   Restricted file config loaded.');

config.restrictedTypes = require('./restrictedTypes.json');
if(config.global.verbose === true) console.log('    *   Restricted type config loaded.');

config.helpers = require('./helpers.json');
if(config.global.verbose === true) console.log('    *   Helpers loaded.');

config.spdy = require('./spdy.json');
if(config.global.verbose === true) console.log('    *   SPDY config loaded.');

// Users are stored in an 'in memory database'
config.users = require('./users.json');
if(config.global.verbose === true) console.log('    *   Users config loaded.');
if(config.global.verbose === true) console.log(' ');

// Export config
module.exports = config;
