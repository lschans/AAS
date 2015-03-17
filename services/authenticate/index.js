
module.exports = function () { 
   var seneca = this;

   seneca.add({domain:'auth',cmd:'authenticate'},function(args,done){
       if(args.username == args.password) {
           done(null,{authenticated:true});
       } else {
           done(null,{authenticated:false});
       }
   })
}
