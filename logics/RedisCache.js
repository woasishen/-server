/**
 * Created by Administrator on 2017/10/5.
 */
require('./RedisKeys');
require('extensions');

function TrySave(finishDel) {
    var self = this;
    if(finishDel){
        self.SaveDele.unshift(finishDel);
    }
    if(self.saving){
        self.tosave = true;
        return;
    }
    self.tosave = false;
    self.saving = true;
    self.Save();
}

function Save() {
    var self = this;
    Client.llen(self.key, function (err, len) {
        if (err) {
            logcfy(RedisError + err);
            self.SaveFinished();
            return;
        }
        //same
        if(len == self.stop + 1){
            self.SaveFinished();
            return;
        }
        //del
        if(len > self.stop + 1){
            Client.ltrim(self.key, len - self.stop - 1, len, function (err, data) {
                if (err) {
                    logcfy(RedisError + err);
                }
                self.SaveFinished();
            });
            return
        }
        //push
        var pushData = [];
        for(var i = len - self.start; i < self.length; i++){
            pushData.push(JSON.stringify(self[i]));
        }
        Client.lpush(self.key, pushData, function (err, data) {
            if (err) {
                logcfy(RedisError + err);
            }
            self.SaveFinished();
        });
    });
}

function SaveFinished() {
    var self = this;
    self.saving = false;
    if(self.tosave){
        self.TrySave();
    }else{
        while(self.SaveDele.length > 0) {
            self.SaveDele.pop()();
        }
    }
}

function TryGet(finishDel) {
    var self = this;
    if(finishDel){
        self.GetDele.unshift(finishDel);
    }
    if(self.getting){
        self.toget = true;
        return;
    }
    self.toget = false;
    self.getting = true;
    if(self.init){
        self.Save(self.Get());
    }else{
        self.Get();
    }
}

function Get() {
    var self = this;
    Client.llen(self.key, function (err, len) {
        if (err) {
            logcfy(RedisError + err);
            self.GetFinished();
            return;
        }
        Client.lrange(self.key, len - self.DefaultLength, len - 1, function (err, data) {
            if (err) {
                logcfy(RedisError + err);
            }
            self.clear();
            self.start = 0;
            self.stop = -1;
            for(var i = 0; i < data.length; i++){
                self.push(JSON.parse(data[i]));
                self.stop++;
            }
            if(!self.init){
                self.init = true;
            }
            self.GetFinished();
        });

    });
}

function GetFinished() {
    var self = this;
    self.getting = false;
    if(self.toget){
        self.TryGet();
    }else{
        while(self.GetDele.length > 0){
            self.GetDele.pop()();
        }
    }
}

function InitCache(key) {
    var cache = [];
    cache.key = key;
    cache.init = false;

    cache.TrySave = TrySave;
    cache.Save = Save;
    cache.SaveFinished = SaveFinished;
    cache.SaveDele = [];

    cache.TryGet = TryGet;
    cache.Get = Get;
    cache.GetFinished = GetFinished;
    cache.GetDele = [];

    cache.MaxLength = 50;
    cache.DefaultLength = 45;
    cache.MinLength = 40;
    cache.start = 0;
    cache.stop = -1;

    cache.TryGet();

    setInterval(function(){
        cache.TrySave();
    }, 6000);
    return cache;
}

EatsCache = InitCache(EatKey);
DiapersCache = InitCache(DiaperKey);
