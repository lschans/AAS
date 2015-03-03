var server = require("mongo-sync").Server;
var server = new Server('127.0.0.1');

var collections = server.db("angularServer");
//var collections = server.db('*').collectionNames();

/*
 db.sample_coll.update( { _id:"Joe" }, { $set: { info1: "abc", info2:
 "def" }, $inc: { x: 1 } }, true );
 - and -
 db.sample_coll.update( { _id:"Joe" }, { $set: { info1: "abc", info2:
 "def" }, $push: { item_list: { data1: "aaa", data2: "bbb" } } },
 true );
 */

//var sessions = server.db("angularServer");

if(collections.collectionNames().length > 0) {
    // Table exists
    console.log('Database is already set up, we are fine');
} else {
    // Table doesn't exist
    collections.getCollection("sessions").update({ sessionID:"dummy" }, { $set: { sessionID: "dummy", ip: "0.0.0.0" }}, {upsert:true});

}

var upserted = collections.getCollection("sessions").update({ sessionID:"dummy" }, { $set: { sessionID: "dummy", ip: "0.0.0.0" }}, {upsert:true});

console.log(upserted);
server.close();