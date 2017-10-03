var encrypt = require('./encrypt');

module.exports = {
    regist: function (socket, msg, msgId) {
        Client.hsetnx(RedisAccounts, msg.name, encrypt.md5(msg.name + msg.pwd), function (err, data) {
            if (err){
                console.log("--err:" + err);
                socket.send(msgId, {err: err});
                return;
            }
            if (data == 0){
                socket.send(msgId, {error: "username is already exist!!"});
                return
            }
            socket.__userName = msg.name;
            socket.send(msgId, {
                succeed: true,
                userName: msg.name
            });
        });
    },
    login: function (socket, msg, msgId) {
        Client.hget(RedisAccounts, msg.name, function (err, data) {
            if (err){
                console.log("--err:" + err);
                socket.send(msgId, {err: err});
                return;
            }
            if (!data){
                socket.send(msgId, {error: "username not exist!!"});
                return
            }
            if (data != encrypt.md5(msg.name + msg.pwd)) {
                socket.send(msgId, {error: "password not match!!"});
                return
            }
            socket.__userName = msg.name;
            socket.send(msgId, {
                succeed: true,
                userName: msg.name
            });
        })
    },
    getrooms: function (socket, msg, msgId) {
        Client.hgetall(RedisRooms, function (err, data) {
            if (err){
                console.log("--err:" + err);
                socket.send(msgId, {err: err});
                return;
            }

            var resultData = {};
            for (var k in data){
                var pwd = data[k];
                resultData[k] = {
                    pwd: pwd,
                    num: socket.sockets.roomDict[k] ? socket.sockets.roomDict[k].length : 0
                };
            }

            socket.send(msgId, {
                succeed: true,
                data: resultData
            });
        });
    },
};