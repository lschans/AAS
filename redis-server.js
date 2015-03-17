console.log('Loader called for: ' + process.argv[2]);
require('seneca')()
   .use('redis-transport')
   .use(__dirname + process.argv[2])
   .listen({type:'redis'})
;