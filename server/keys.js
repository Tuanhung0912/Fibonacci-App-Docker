module.exports = {
  // Redis - Support Both REDIS_URL (cloud) and REDIS_HOST+PORT (local Docker)
  redisUrl: process.env.REDIS_URL,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,

  // PostgreSQL - Support Both DATABASE_URL (cloud) and for each difference variable (local Docker)
  databaseUrl: process.env.DATABASE_URL,
  pgUser: process.env.PGUSER,
  pgHost: process.env.PGHOST,
  pgDatabase: process.env.PGDATABASE,
  pgPassword: process.env.PGPASSWORD,
  pgPort: process.env.PGPORT,
};
