const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      res.sendResponse = res.json;
      res.json = async (body) => {
        await redis.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      next();
    } catch (error) {
      next(error);
    }
  };
};

const clearCache = async (pattern) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(keys);
  }
};

module.exports = { cacheMiddleware, clearCache, redis };
