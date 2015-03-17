var seneca = require('seneca')().use('redis-transport');

seneca.add({domain:'auth',cmd:'authenticate'},function(args,done){
    if(args.username == args.password) {
        done(null,{authenticated:true});
    } else {
        done(null,{authenticated:false});
    }

}).listen({type:'redis'});