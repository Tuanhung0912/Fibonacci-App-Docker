# Fibonacci Calculator - Multi-Container Docker Application

A multi-container web application that calculates Fibonacci values using a React frontend, Express.js API server, and a background worker — orchestrated with Docker.

## 📋 Overview

Users enter an index through the web interface, and the application calculates the corresponding Fibonacci value. The system uses a microservices architecture with the following flow:

1. **Client** sends the index to the **Server** via API
2. **Server** stores the index in **PostgreSQL** and publishes it to **Redis**
3. **Worker** listens for new indices via Redis Pub/Sub, calculates the Fibonacci value, and stores the result back in **Redis**
4. **Client** fetches and displays both the submitted indices and calculated values

## 🏗️ Architecture

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Client    │──────▶│   Server    │──────▶│  PostgreSQL  │
│  (React)    │  API  │ (Express.js)│       │ (All Indices)│
└─────────────┘       └──────┬──────┘       └─────────────┘
                             │
                      Publish│Subscribe
                             │
                      ┌──────▼──────┐
                      │    Redis    │
                      │  (Pub/Sub   │
                      │  + Cache)   │
                      └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │   Worker    │
                      │ (Fibonacci  │
                      │  Calculator)│
                      └─────────────┘
```

## 📁 Project Structure

```
complex/
├── client/              # React frontend application
│   ├── src/
│   │   ├── App.js       # Main app with routing
│   │   ├── Fib.js       # Fibonacci input/display component
│   │   ├── OtherPage.js # Secondary page
│   │   └── index.js     # Entry point (React 19 createRoot)
│   └── package.json
├── server/              # Express.js API server
│   ├── index.js         # API routes & DB/Redis connections
│   ├── keys.js          # Environment variables config
│   └── package.json
├── worker/              # Background Fibonacci calculator
│   ├── index.js         # Redis subscriber & Fibonacci logic
│   ├── keys.js          # Environment variables config
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

| Component  | Technology                | Version  |
|------------|---------------------------|----------|
| Frontend   | React                     | 19.2.6   |
| Routing    | React Router DOM          | 7.15.0   |
| HTTP Client| Axios                     | 1.16.0   |
| Backend    | Express.js                | 5.2.1    |
| Database   | PostgreSQL (node-postgres) | 8.20.0   |
| Cache/PubSub| Redis (node-redis)       | 5.12.1   |
| Dev Tool   | Nodemon                   | 3.1.14   |

## 🔧 Environment Variables

The server and worker require the following environment variables:

### Server

| Variable     | Description               |
|-------------|---------------------------|
| `REDIS_HOST` | Redis server hostname     |
| `REDIS_PORT` | Redis server port         |
| `PGUSER`     | PostgreSQL username       |
| `PGHOST`     | PostgreSQL hostname       |
| `PGDATABASE` | PostgreSQL database name  |
| `PGPASSWORD` | PostgreSQL password       |
| `PGPORT`     | PostgreSQL port           |

### Worker

| Variable     | Description               |
|-------------|---------------------------|
| `REDIS_HOST` | Redis server hostname     |
| `REDIS_PORT` | Redis server port         |

## 🚀 API Endpoints

| Method | Endpoint           | Description                              |
|--------|--------------------|------------------------------------------|
| GET    | `/`                | Health check — returns `"Hi"`            |
| GET    | `/values/all`      | Get all submitted indices from PostgreSQL |
| GET    | `/values/current`  | Get calculated values from Redis cache   |
| POST   | `/values`          | Submit a new index (max: 40)             |

## ⚡ How It Works

1. User enters a number (index) on the React frontend
2. The index is sent to the Express server via `POST /api/values`
3. Server validates the index (must be ≤ 40), then:
   - Stores the index in **PostgreSQL** for permanent record
   - Sets a placeholder in **Redis** (`"Nothing yet!"`)
   - Publishes the index to Redis channel `"insert"`
4. **Worker** receives the message, calculates `fib(index)` recursively, and stores the result in Redis
5. Frontend fetches and displays:
   - **Seen Indexes**: all previously submitted indices (from PostgreSQL)
   - **Calculated Values**: Fibonacci results (from Redis)

## 📝 Notes

- The Fibonacci calculation uses a **recursive algorithm**, so indices above 40 are rejected to prevent excessive computation time.
- Redis serves dual purposes: **Pub/Sub** messaging between server and worker, and **caching** calculated Fibonacci values.
- PostgreSQL stores a permanent log of all submitted indices.
