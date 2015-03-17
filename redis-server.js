console.log('Loader called for: ' + process.argv[2]);
var seneca = require('seneca')()
   .use('redis-transport')
   .use(process.argv[2])
   .listen({type:'redis'})
;
