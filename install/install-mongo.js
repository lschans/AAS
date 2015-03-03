var Server = require("mongo-sync").Server;
var server = new Server('127.0.0.1');
var result = server.db("test").getCollection("posts").find().toArray();
console.log(result);
server.close();