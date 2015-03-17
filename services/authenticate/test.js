var test = require('tap').test;


test('does it work', function (t) {

   t.plan(4);
   
   var seneca = require('seneca')()
      .use('./index.js')
   ;

   seneca.act({domain:'auth',cmd:'authenticate',username:'admin',password:'test'}, function (err, result) {
      t.ok(!err, 'No error should eb returned');
      t.equal(result.authenticated, false, 'You should not be authenticated');
   });

   seneca.act({domain:'auth',cmd:'authenticate',username:'admin',password:'admin'}, function (err, result) {
      t.ok(!err, 'No error should eb returned');
      t.equal(result.authenticated, true, 'You should be authenticatied.');
   });

})

/* 
var seneca = require('seneca')().use('redis-transport').client({type:'redis'});

seneca.act( , function(err,data) {
    console.log(data.authenticated);
});

seneca.act( {domain:'auth',cmd:'authenticate',username:'admin',password:'admin'}, function(err,data) {
    console.log(data.authenticated);
});
*/