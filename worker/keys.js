module.exports = {
  // Support Both REDIS_URL (Upstash cloud) and REDIS_HOST+PORT (Docker local)
  redisUrl: process.env.REDIS_URL,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
};
