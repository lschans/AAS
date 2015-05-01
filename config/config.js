/*
 * config script for 'angular-server-with-sockets'
 *
 * Description:  Build the configuration object
 * This file differs a bit in 'module-style' from the other modules.
 * This is because we want to export an object and not a nested object
 *-----------------------------------------------------
 * Author: Lars van der Schans
 * Email:  lars@wodanbrothers.com
 *-----------------------------------------------------
 */

var config = {},
    fs = require('fs'),
    path = require('path');

config.reload = function() {
    if (config.global.verbose === true) console.log('Reloading configurations.');
    loadConfig();
};

function loadConfig() {
    // Load global config first
    config.global = require('./global.json');
    if (config.global.verbose === true) console.log('Loading configurations:');
    if (config.global.verbose === true) console.log('    *   Global config loaded.');

    // Load directory contents and remove the files we don't want to include
    config.files = fs.readdirSync(__dirname);
    config.files.splice(config.files.indexOf('config.js'), 1);
    config.files.splice(config.files.indexOf('global.json'), 1);
    config.files.splice(config.files.indexOf('readme.MD'), 1);

    // Load all config files
    config.files.forEach(function (value) {
        // Iterate over all json's and append them to the config object
        var file = value.split('.');
        config[file[0]] = require('./' + value);
        if (config.global.verbose === true) console.log('    *   ' + file[0] + ' loaded.');
    });

    // Load app specific config

    var appPath = config.global.app;
    if (appPath.charAt(0) !== '/') {
        // relative path.
        appPath = path.join(process.cwd(), appPath);
    }

    appFile = require.resolve(appPath);

    if (!appFile) {
        throw new Error(process.cwd() + '/config/global.js key `app` ' + config.global.app + ' could not  be found.');
    }

    appPath = path.dirname(appFile);

    config.global.app = require(appFile);

    // Succesfully loaded app, create a require.
    config.global.require = function (module) {
        return require(config.global.require.resolve(module));
    };

    config.global.require.resolve = function (module) {
        if (module.charAt(0) !== '/') {
            // relative path.
            return path.join(appPath, module);
        } else {
            return module;
        }
    }
}

// Initial load config
loadConfig();

// Export config
module.exports = config;
