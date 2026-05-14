const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// CORS - cho phép client từ domain khác gọi API
const corsOptions = {
  origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST"],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require("pg");

// Hỗ trợ cả DATABASE_URL (Render) và từng biến riêng (Docker local)
const pgClient = keys.databaseUrl
  ? new Pool({
      connectionString: keys.databaseUrl,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: keys.pgUser,
      host: keys.pgHost,
      database: keys.pgDatabase,
      password: keys.pgPassword,
      port: keys.pgPort,
    });

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});

// Redis Client Setup
const redis = require("redis");

// Hỗ trợ cả REDIS_URL (Upstash) và REDIS_HOST+PORT (Docker local)
const redisConfig = keys.redisUrl
  ? { url: keys.redisUrl }
  : {
      url: `redis://${keys.redisHost}:${keys.redisPort}`,
      socket: { reconnectStrategy: () => 1000 },
    };

const redisClient = redis.createClient(redisConfig);
const redisPublisher = redisClient.duplicate();

(async () => {
  await redisClient.connect();
  await redisPublisher.connect();
  console.log("Redis connected");
})();

// Express route handlers
app.get("/", (req, res) => {
  res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  const values = await redisClient.hGetAll("values");
  res.send(values);
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }

  await redisClient.hSet("values", index, "Nothing yet!");
  await redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
