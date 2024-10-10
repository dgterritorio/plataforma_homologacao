const redis = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const redisClient = redis.createClient({
    enable_offline_queue: false,
});
const storeLimiters = {};

module.exports = {
    createLimiter: function (key, points, duration, blockDuration) {
        let success = true;
        let limiter = new RateLimiterRedis({
            redis: redisClient,
            keyPrefix: key,
            points: points,
            duration: duration,
            blockDuration: blockDuration
        });
        storeLimiters[key] = limiter;

        return success;
    },
    testApiRetry: async function (limiterKey, key) {
        let retry = -1;
        if (storeLimiters.hasOwnProperty(limiterKey)) {
            let limiter = storeLimiters[limiterKey];
            const limiterRes = await limiter.get(key);

            if (limiterRes !== null && limiterRes.remainingPoints == 0) {
                retry = Math.round(limiterRes.msBeforeNext / 1000) || 1;
            } else {
                retry = 0;
            }
        } else {
            retry = 0;
        }

        return retry;
    },
    consume: async function (limiterKey, key) {
        let res = null;
        if (storeLimiters.hasOwnProperty(limiterKey)) {
            let limiter = storeLimiters[limiterKey];
            try {
                res = await limiter.consume(key);
            } catch (err) {
                console.log('api limiter consume error');
                console.log(err);
            }
        }

        return res;
    },
    delete: async function (limiterKey, key) {
        let res = null;
        if (storeLimiters.hasOwnProperty(limiterKey)) {
            let limiter = storeLimiters[limiterKey];
            try {
                res = await limiter.delete(key);
            } catch (err) {
                console.log('api limiter delete error');
                console.log(err);
            }
        }

        return res;
    }
};
