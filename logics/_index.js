var notLoginFiles = [
    './not_need_login.js'
]

var needLoginFiles = [
    './need_login.js'
];

var needInRoomFiles = [
    './need_in_room.js'
]

for (var i = 0; i < notLoginFiles.length; i++) {
    Object.assign(exports, require(notLoginFiles[i]));
}

for (var i = 0; i < needLoginFiles.length; i++) {
    (function () {
        var tempMsgs = require(needLoginFiles[i]);
        for (var key in tempMsgs){
            (function () {
                var k = key;
                exports[k] = function (socket, msg, msgId) {
                    if (!socket.__userName){
                        console.log('**no_user_err_c**' + msgId, msg);
                        socket.send(msgId, {error: '**no_user_err_c**'});
                        return;
                    }
                    tempMsgs[k](socket, msg, msgId);
                }
            })();
        }
    })();
}

for (var i = 0; i < needInRoomFiles.length; i++) {
    (function () {
        var tempMsgs = require(needInRoomFiles[i]);
        for (var key in tempMsgs){
            (function () {
                var k = key;
                exports[k] = function (socket, msg, msgId) {
                    if (!socket.__userName){
                        console.log("**no_user_err_c**" + msgId, msg);
                        socket.send(msgId, {error: '**no_user_err_c**'});
                        return;
                    }
                    if (!socket.__roomId){
                        console.log("**not_in_room_err_c**" + msgId, msg);
                        socket.send(msgId, {error: '**no_user_err_c**'});
                        return;
                    }
                    tempMsgs[k](socket, msg, msgId, Rooms[socket.__roomId]);
                }
            })();
        }
    })();
}
