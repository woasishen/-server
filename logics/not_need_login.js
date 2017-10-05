require('./ConsoleLogErrorKeys');

function Add(cache, socket, msg, msgId){
    msg.time = Date.now();
    cache.add(msg);
    cache.stop++;

    if(cache.length > CacheMaxLength){
        var tempDelCount = CacheMaxLength - CacheDefaultLength;
        cache.splice(0, tempDelCount);
        cache.start = cache.start + tempDelCount;
    }

    var result = {
        succeed: true,
        stop: cache.stop,
        data: msg
    };
    socket.broadcast(msgId, result);
}

function Delete(cache, socket, msg, msgId){
    if(cache.length == 0){
        socket.send(msgId, {error: "no msg to delete"});
        return;
    }
    if(cache.length != msg.length){
        socket.send(msgId, {error: "cur length not accordance"});
        return;
    }
    var dataJson = json.parse(cache.last());
    if (Date.now() - dataJson.time > DeleteLimitTime * 1000){
        socket.send(msgId, {error: "delete can only execute in " + DeleteLimitTime + " seconds"});
        return;
    }
    cache.pop();
    cache.stop--;
    socket.broadcast(msgId, cache.stop);
}

function Get(cache, socket, msg, msgId){
    if(msg.start < 0 || msg.stop < 0 || msg.stop < msg.start){
        socket.send(msgId, {error: "msg start or stop err:" + msg.start + "," + msg.stop});
        return;
    }

    if(msg.start >= cache.start){
        var tempSliceStart = msg.start - cache.start;
        var tempSliceLength = msg.stop - msg.start + 1;
        socket.send(msgId, cache.slice(tempSliceStart, tempSliceStart + tempSliceLength));
        return;
    }
    //无需缓存
    if(cache.start - msg.start + cache.length > CacheMaxLength){
        Client.lrange(cache.key, msg.start, msg.stop, function (err, data) {
            if (err) {
                console.log(RedisError + err);
                socket.send(msgId, {err: err});
                return;
            }
            socket.send(msgId, {
                succeed: true,
                data: json.parse(data)
            });
        });
        return;
    }

    Client.lrange(cache.key, msg.start, Math.max(msg.stop, cache.start - 1), function (err, data) {
        if (err) {
            console.log(RedisError + err);
            socket.send(msgId, {err: err});
            return;
        }
        var tempData = json.parse(data);
        socket.send(msgId, {
            succeed: true,
            data: tempData.slice(0, msg.stop - msg.start + 1)
        });
        if(tempData.length + msg.start < cache.start){
            console.log(NeedFixError + "get cache no suitable");
            return;
        }
        var newStart = Math.max(msg.start, cache.stop - CacheMaxLength + 1);
        Array.prototype.unshift.apply(cache, tempData.slice(newStart - msg.start, cache.start - newStart));
    });

}
function Save() {
    var result = {
        succeed: true,
        data: json.parse(data)
    }
    socket.send(msgId, result);
}

module.exports = {
    get_eats: function (socket, msg, msgId) {
        Get(EatsCache ,socket, msg, msgId);
    },
    get_diapers: function (socket, msg, msgId) {
        Get(DiapersCache ,socket, msg, msgId);
    },
    add_eat: function (socket, msg, msgId) {
        Add(EatsCache, socket, msg, msgId);
    },
    add_diaper: function (socket, msg, msgId) {
        Add(DiapersCache, socket, msg, msgId);
    },
    del_eat: function (socket, msg, msgId) {
        Delete(EatsCache, socket, msg, msgId);
    },
    del_diaper: function (socket, msg, msgId) {
        Delete(DiapersCache, socket, msg, msgId);
    },
};