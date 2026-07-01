# ⏱️ Time App

A full-stack time management application built as a DevOps learning project.

The project demonstrates a complete modern deployment workflow:

- Vue 3 Frontend
- Node.js + Express Backend
- MySQL Database
- Docker
- Kubernetes
- Ingress
- JWT Authentication
- GitHub Actions CI

---

# Project Architecture

```
                    GitHub

                       │

                 GitHub Actions CI

                       │

              Docker Image Build

                       │

                 Kubernetes Cluster

                       │

        ┌──────────────┴──────────────┐

        │                             │

   Frontend (Vue)               Backend (Express)

        │                             │

        └──────────────┬──────────────┘

                       │

                   MySQL Database
```

---

# Technology Stack

## Frontend

- Vue 3
- Vite
- JavaScript

## Backend

- Node.js
- Express
- MySQL
- JWT Authentication
- bcrypt

## DevOps

- Docker
- Docker Compose
- Kubernetes
- Ingress
- ConfigMap
- Secret
- GitHub Actions
- Git

---

# Features

- User Registration
- User Login
- JWT Authentication
- Personal User Space
- Focus Sessions
- Session History
- Statistics
- REST API
- Responsive Frontend

---

# Project Structure

```
time-app/

├── api/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── k8s/
│   ├── base/
│   ├── ingress.yaml
│   ├── api.yaml
│   ├── frontend.yaml
│   └── mysql.yaml
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# Running with Docker

Build containers

```bash
docker compose build
```

Start services

```bash
docker compose up -d
```

Stop services

```bash
docker compose down
```

---

# Running with Kubernetes

Apply manifests

```bash
kubectl apply -f k8s/base
```

Check resources

```bash
kubectl get pods -n time-app
kubectl get svc -n time-app
```

---

# CI Pipeline

Every push to **main** automatically performs:

- Checkout repository
- Install dependencies
- Start temporary MySQL
- Start API
- Health check
- User registration smoke test
- Login smoke test
- JWT validation
- Protected endpoint validation
- Frontend build
- Docker image build

---

# Roadmap

- [x] Docker
- [x] Docker Compose
- [x] Kubernetes
- [x] Ingress
- [x] JWT Authentication
- [x] GitHub Actions CI
- [ ] Docker Registry
- [ ] Continuous Deployment (CD)
- [ ] Helm
- [ ] Prometheus
- [ ] Grafana
- [ ] Loki
- [ ] Unit Tests

---

# Author

**Ivan K.**

System Administrator • DevOps Engineer