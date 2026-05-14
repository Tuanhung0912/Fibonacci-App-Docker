const keys = require("./keys");
const redis = require("redis");
const express = require("express");

// Health check HTTP server (cần thiết cho Render free tier Web Service)
const app = express();
const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("Worker is running");
});

app.listen(PORT, () => {
  console.log(`Worker health check on port ${PORT}`);
});

// Redis Client Setup - hỗ trợ cả cloud (REDIS_URL) và local (host+port)
const redisConfig = keys.redisUrl
  ? { url: keys.redisUrl }
  : {
      socket: {
        host: keys.redisHost,
        port: keys.redisPort,
        reconnectStrategy: () => 1000,
      },
    };

const redisClient = redis.createClient(redisConfig);
const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

// Connect and subscribe
(async () => {
  await redisClient.connect();
  await sub.connect();
  console.log("Worker Redis connected");

  await sub.subscribe("insert", (message) => {
    console.log(`Calculating fib(${message})`);
    redisClient.hSet("values", message, fib(parseInt(message)));
  });
})();
