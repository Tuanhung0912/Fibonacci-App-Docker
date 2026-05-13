# Fibonacci Calculator - Multi-Container Docker Application

A multi-container web application that calculates Fibonacci values using a React frontend, Express.js API server, and a background worker — orchestrated with Docker Compose and automated CI/CD via GitHub Actions.

## 📋 Overview

Users enter an index through the web interface, and the application calculates the corresponding Fibonacci value. The system uses a microservices architecture with the following flow:

1. **Client** sends the index to the **Server** via Nginx reverse proxy
2. **Server** stores the index in **PostgreSQL** and publishes it to **Redis**
3. **Worker** listens for new indices via Redis Pub/Sub, calculates the Fibonacci value, and stores the result back in **Redis**
4. **Client** fetches and displays both the submitted indices and calculated values

## 🏗️ Architecture

```
                        ┌──────────────┐
                        │    Nginx     │
                        │ (Reverse     │
                        │  Proxy)      │
                        └──────┬───────┘
                     ┌─────────┴─────────┐
                     │ /                 │ /api
              ┌──────▼──────┐     ┌──────▼──────┐     ┌──────────────┐
              │   Client    │     │   Server    │────▶│  PostgreSQL  │
              │  (React 19) │     │ (Express 5) │     │ (All Indices)│
              └─────────────┘     └──────┬──────┘     └──────────────┘
                                         │
                                  Publish │ Subscribe
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
├── .github/
│   └── workflows/
│       └── deploy.yaml       # CI/CD: test, build & push Docker images
├── client/                   # React frontend application
│   ├── nginx/
│   │   └── default.conf      # Nginx config for production (port 3000)
│   ├── src/
│   │   ├── App.js            # Main app with React Router
│   │   ├── Fib.js            # Fibonacci input/display (Hooks)
│   │   ├── OtherPage.js      # Secondary page
│   │   ├── App.test.js       # Unit tests
│   │   └── index.js          # Entry point (React 19 createRoot)
│   ├── Dockerfile            # Production: multi-stage build → Nginx
│   ├── Dockerfile.dev        # Development: hot-reload
│   └── package.json
├── server/                   # Express.js API server
│   ├── index.js              # API routes & DB/Redis connections
│   ├── keys.js               # Environment variables config
│   ├── Dockerfile            # Production
│   ├── Dockerfile.dev        # Development
│   └── package.json
├── worker/                   # Background Fibonacci calculator
│   ├── index.js              # Redis subscriber & Fibonacci logic
│   ├── keys.js               # Environment variables config
│   ├── Dockerfile            # Production
│   ├── Dockerfile.dev        # Development
│   └── package.json
├── nginx/                    # Reverse proxy (routing)
│   ├── default.conf          # Routes: / → client, /api → server
│   ├── Dockerfile            # Production
│   └── Dockerfile.dev        # Development
├── docker-compose.yaml       # Development orchestration
├── .env                      # Environment variables (git-ignored)
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

| Component    | Technology                 | Version |
| ------------ | -------------------------- | ------- |
| Frontend     | React                      | 19.2.6  |
| Routing      | React Router DOM           | 7.15.0  |
| HTTP Client  | Axios                      | 1.16.0  |
| Backend      | Express.js                 | 5.2.1   |
| Database     | PostgreSQL (node-postgres) | 8.20.0  |
| Cache/PubSub | Redis (node-redis)         | 5.12.1  |
| Proxy        | Nginx                      | latest  |
| Runtime      | Node.js                    | 24 LTS  |
| Dev Tool     | Nodemon                    | 3.1.14  |
| Container    | Docker + Docker Compose    | 3.8     |
| CI/CD        | GitHub Actions             | —       |

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/) installed

### 1. Clone the repository

```bash
git clone https://github.com/Tuanhung0912/Fibonacci-App-Docker.git
cd Fibonacci-App-Docker
```

### 2. Run with Docker Compose

```bash
docker-compose up --build
```

### 3. Access the application

Open **http://localhost:3050** in your browser.

## 🔧 Environment Variables

### Server

| Variable     | Description              |
| ------------ | ------------------------ |
| `REDIS_HOST` | Redis server hostname    |
| `REDIS_PORT` | Redis server port        |
| `PGUSER`     | PostgreSQL username      |
| `PGHOST`     | PostgreSQL hostname      |
| `PGDATABASE` | PostgreSQL database name |
| `PGPASSWORD` | PostgreSQL password      |
| `PGPORT`     | PostgreSQL port          |

### Worker

| Variable     | Description           |
| ------------ | --------------------- |
| `REDIS_HOST` | Redis server hostname |
| `REDIS_PORT` | Redis server port     |

## 📡 API Endpoints

All API endpoints are accessed through the Nginx proxy at `/api/*`:

| Method | Endpoint          | Description                               |
| ------ | ----------------- | ----------------------------------------- |
| GET    | `/`               | Health check — returns `"Hi"`             |
| GET    | `/values/all`     | Get all submitted indices from PostgreSQL |
| GET    | `/values/current` | Get calculated values from Redis cache    |
| POST   | `/values`         | Submit a new index (max: 40)              |

> The client accesses these via `/api/values/all`, `/api/values/current`, etc. Nginx strips the `/api` prefix before forwarding to the server.

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and delivery.

### Workflow (`.github/workflows/deploy.yaml`)

On every push to `main`:

1. **Checkout** — Clone the source code
2. **Docker Login** — Authenticate with Docker Hub using repository secrets
3. **Test** — Build the client dev image and run unit tests
4. **Build** — Build production Docker images for all 4 services
5. **Push** — Push all images to Docker Hub
6. **Package** — Generate a deployment zip (excluding `.git`)

### Required GitHub Secrets

| Secret            | Description                         |
| ----------------- | ----------------------------------- |
| `DOCKER_USERNAME` | Docker Hub username                 |
| `DOCKER_PASSWORD` | Docker Hub password or Access Token |

> 📌 Configure these in: **GitHub Repo → Settings → Secrets and variables → Actions → Secrets** (not Variables)

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

## 🐳 Docker Configuration

### Development (Dockerfile.dev)

- Uses `node:24-alpine` base image
- Hot-reload via volume mounts in `docker-compose.yaml`
- Nginx proxy on port **3050** → routes to client (3000) and API (5000)

### Production (Dockerfile)

- **Client**: Multi-stage build → builds React app → serves via Nginx on port 3000
- **Server/Worker**: `node:24-alpine` → `npm run start`
- **Nginx**: Routes traffic between client and API

## 📝 Notes

- The Fibonacci calculation uses a **recursive algorithm**, so indices above 40 are rejected to prevent excessive computation time.
- Redis serves dual purposes: **Pub/Sub** messaging between server and worker, and **caching** calculated Fibonacci values.
- PostgreSQL stores a permanent log of all submitted indices.
- The client uses **React Hooks** (useState, useEffect) with functional components.
- All environment variables are loaded from a `.env` file that is **git-ignored** to protect sensitive data.

## 📄 License

This project is for educational purposes.
