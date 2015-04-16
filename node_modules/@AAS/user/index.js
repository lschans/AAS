/*
 * user validator for angular-server-with-sockets
 *
 * Description:  Validate users
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

module.exports = function(config) {
    return {
        validateUser : function(username, password) {
            // Test for valid user here
            return true;
        }
    }
}