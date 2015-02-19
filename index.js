/*
 * angular-server-with-sockets
 *
 * Description:  The perfect angular server with sockets
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = require('./config/config.js'),
    helpers = require('@dyflexis/server_helpers')(config);

//console.log(config);
console.log(helpers.randomString(255));

