HeadLength = 4;//Max Support 4
Client = null;
require('extensions')();

//****************redis****************//
if(true){
    var redis = require('redis');
    Client = redis.createClient();
    Client.on("error", function (err) {
        console.log("Error " + err);
    });
    Client.on("ready", function () {
        console.log("redis ready");
    });
}
else{
    var redis = require('redis');
    /*数据库连接信息host,port,user,pwd,dbname(可查询数据库详情页)*/
    var username = 'RUocTh2KMShQuaEpAppFG5o1';  //用户AK
    var password = '4X6DMGL9SKmON1ruraTCYQ2GMvz7d3OP';  //用户SK
    var db_host = 'redis.duapp.com';
    var db_port = 80;
    var db_name = 'AGYYNAwqJkqXvitjrrop';   //数据库名称

    var options = {"no_ready_check": true};


    Client = redis.createClient(db_port, db_host, options);
    Client.on("error", function (err) {
        console.log("Error " + err);
    });
    // 建立连接后，在进行集合操作前，需要先进行auth验证
    Client.auth(username + '-' + password + '-' + db_name);
}

//****************net****************//
var net = require('net');
var data_buffer = require('data_buffer');
var logics = require('./logics');
var io = require('game_socket');


var PORT = 18080;
for(var i=1000;i>0;i--){
    (function() {
        var index = i;
        Client.lpush("cfy", index, function (err, data) {

        });
    })();

}
for(var i=0;i<1000;i++){
    Client.lpush("cfy", -i);
}
Client.lrange("cfy", 0, 2000, function (err, data) {
   for(var i = 0; i < data.length; i ++){
       if(data[i] != -999 + i){
           console.log(data[i]);
       }
   }
   Client.del("cfy", function (err, data) {
      console.log("finish");
   });
});

return;
net.createServer(function(socket) {
    //server 开始必须和client约定head长度
    socket.write(HeadLength.toString());

    io.init_socket(socket);
    var bufferEmitter = new data_buffer(socket);
    bufferEmitter.BindEvent(logics);

    socket.on('data', function(data) {
        bufferEmitter.addBuffer(data);
    });

    socket.on('close', function () {
        bufferEmitter.emit('disconnect');
    });

}).listen(PORT);

console.log('Server listening on' +':'+ PORT);