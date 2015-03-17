var seneca = require('seneca')().use('redis-transport').client({type:'redis'});

    seneca.act( {domain:'auth',cmd:'authenticate',username:'admin',password:'test'}, function(err,data) {
            console.log(data.authenticated);
        });

    seneca.act( {domain:'auth',cmd:'authenticate',username:'admin',password:'admin'}, function(err,data) {
            console.log(data.authenticated);
        });
