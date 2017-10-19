require('./log');

var redisReady = false;
var portReady = false;

HeadLength = 4;//Max Support 4
Client = null;
require('extensions');

function CheckStartFinished() {
    if (redisReady && portReady) {
        console.log("start successed");
    }    
}

//****************redis****************//
var redis = require('redis');
Client = redis.createClient();
Client.on("error", function (err) {
    logcfy("Error " + err);
});
Client.on("ready", function () {
    logcfy("redis ready");
    redisReady = true;
    CheckStartFinished();
});


//****************net****************//
var net = require('net');
var data_buffer = require('data_buffer');
var logics = require('./logics');
var io = require('game_socket');


var PORT = 18000;

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

}).listen(PORT,function(){
    logcfy('Server listening on' +':'+ PORT);
    portReady = true;
    CheckStartFinished();
});