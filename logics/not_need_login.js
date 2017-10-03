function Add(key, socket, msg, msgId){
    msg.time = Date.now();
    Client.lpush(key, JSON.stringify(msg),
        function (err, data) {
            if(err){
                return;
            }
            socket.broadcast(msgId, msg);
        }
    );
}

function Delete(key, socket, msg, msgId){
    Client.lindex(key, 0, function (err, data) {
        if(data){
            var eatMsg = json.parse(data);
            if (Date.now() - eatMsg.time > DeleteLimitTime * 1000){
                socket.send(msgId, {error: "delete can only execute in " + DeleteLimitTime + " seconds!!"});
                return;
            }
            Client.lpop(EatKey, function (err, data) {
                if(err){
                    return;
                }
                socket.broadcast(msgId);
            });
        }
    });
}

module.exports = {
    add_eat: function (socket, msg, msgId) {
        Add(EatKey, socket, msg, msgId);
    },
    add_diaper: function (socket, msg, msgId) {
        Add(DiaperKey, socket, msg, msgId);
    },
    del_eat: function (socket, msg, msgId) {
        Delete(EatKey, socket, msg, msgId);
    },
    del_diaper: function (socket, msg, msgId) {
        Delete(DiaperKey, socket, msg, msgId);
    },
};