var prompt = require('prompt'),
    optimist = require('optimist')

/*
 set the overrides
*/
prompt.override = optimist.argv;


/*
 set the message and delimiter
*/
prompt.message = "";
prompt.delimiter = "";

var installOptions = {
    properties: {
        configPath: {
            description: "What is your path :",
            required: true,
            default: "/etc/aas/config"
        },
        logPath: {
            description: "What is your path :",
            required: true,
            default: "/var/log/aas"
        },
        certificatePath: {
            description: "What is your path :",
            required: true,
            default: "/etc/aas/certificates"
        },
        certificateCreate: {
            description: "What is your path :",
            required: true,
            default: "Y"
        },
        name: {
            description: "What is your path :",
            required: true,
            default: "/etc/aas"
        }
    }
}

/*
 Start the prompt
*/
prompt.start();

console.log('Welcome to the AAS installation script.');
console.log('This script is made to easaly install AAS on a Linux/POSIX compatible system with default filesystem structure.');
console.log('Sane defaults are used, but you can modify them if you prefer different locations.');
console.log('');

prompt.get(installOptions, function (err, result) {
    console.log("You said your name is: ".cyan + result.name.cyan);
});