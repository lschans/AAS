var seneca = require('seneca')()
   .use('redis-transport')
   .use('./index.js')
   .listen({type:'redis'})
;
