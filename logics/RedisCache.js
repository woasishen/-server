/**
 * Created by Administrator on 2017/10/5.
 */
require('./RedisKeys');

module.exports = function () {
    CacheMaxLength = 50;
    CacheDefaultLength = 45;
    CacheMinLength = 40;

    EatsCache = [];
    EatsCache.key = EatKey;
    DiapersCache = [];
    DiapersCache.key = DiaperKey;
};
