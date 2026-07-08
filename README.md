# ⏱️ Time App

A production-style full-stack web application built as a personal DevOps learning project.

The project demonstrates a complete modern deployment workflow including containerization, Kubernetes orchestration, CI/CD, HTTPS, automated backups and infrastructure automation.

The entire infrastructure is deployed and maintained on a self-managed VPS.

---

# Live Demo

🌐 https://app.atlas-infra.ru

---

# Architecture

```text
                   Developer

                       │

                 Git Push / Pull Request

                       │

                GitHub Repository

                       │

                GitHub Actions CI

                       │

                 Docker Build

                       │

                  Docker Hub

                       │

                AtlasInfra VPS

                       │

                k3s Kubernetes

                       │

              NGINX Ingress Controller

                       │

                 HTTPS (Let's Encrypt)

                       │

          ┌────────────┴────────────┐

          │                         │

      Frontend                 Backend API

       Vue 3                  Node.js / Express

          │                         │

          └────────────┬────────────┘

                       │

                    MySQL
```

---

# Tech Stack

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
- Kubernetes (k3s)
- NGINX Ingress
- ConfigMap
- Secret
- GitHub Actions
- Docker Hub
- Let's Encrypt
- cert-manager
- UFW
- Fail2Ban

---

# Infrastructure

Production environment:

- Ubuntu Server 24.04 LTS
- Docker Engine
- k3s Kubernetes Cluster
- NGINX Ingress Controller
- cert-manager
- Let's Encrypt HTTPS
- GitHub Actions CI/CD
- Docker Hub Registry
- Automated MySQL Backups
- UFW Firewall
- Fail2Ban Protection

---

# Features

- User Registration
- User Login
- JWT Authentication
- Personal User Dashboard
- Focus Sessions
- Session History
- Statistics
- REST API
- Responsive UI

---

# CI/CD Pipeline

Every push to **main** automatically performs:

- Checkout repository
- Install dependencies
- Build frontend
- Start temporary MySQL
- Start backend
- Health check
- Registration smoke test
- Login smoke test
- JWT validation
- Protected endpoint validation
- Build Docker images
- Push images to Docker Hub
- Deploy to Kubernetes

---

# Security

- HTTPS (Let's Encrypt)
- JWT Authentication
- Password hashing (bcrypt)
- Kubernetes Secrets
- SSH Key Authentication
- UFW Firewall
- Fail2Ban
- Environment Variables

---

# Automated Backups

The project includes automatic MySQL backups.

- Daily backup at 03:00
- Old backup automatically removed
- Compressed backup archive (.sql.gz)

---

# Project Structure

```text
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
│   └── base/
│       ├── namespace.yaml
│       ├── api.yaml
│       ├── frontend.yaml
│       ├── mysql.yaml
│       ├── ingress.yaml
│       ├── configmap.yaml
│       └── secret.yaml
│
├── ansible/
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

# Local Development

Clone repository

```bash
git clone https://github.com/uplink0/time-app.git
```

Build containers

```bash
docker compose build
```

Run application

```bash
docker compose up -d
```

Stop application

```bash
docker compose down
```

---

# Kubernetes Deployment

Apply manifests

```bash
kubectl apply -f k8s/base
```

Check resources

```bash
kubectl get pods -n time-app

kubectl get svc -n time-app

kubectl get ingress -n time-app
```

---

# Roadmap

## Completed

- [x] Docker
- [x] Docker Compose
- [x] Kubernetes (k3s)
- [x] NGINX Ingress
- [x] HTTPS
- [x] Let's Encrypt
- [x] cert-manager
- [x] JWT Authentication
- [x] GitHub Actions CI
- [x] Docker Hub
- [x] Continuous Deployment
- [x] Automated Backups
- [x] UFW
- [x] Fail2Ban

## In Progress

- [ ] Ansible Infrastructure Automation
- [ ] Helm
- [ ] Prometheus
- [ ] Grafana
- [ ] Loki
- [ ] ArgoCD
- [ ] Terraform
- [ ] Monitoring Dashboard

---

# About

This repository is my personal DevOps laboratory.

The goal is to build and maintain a production-like infrastructure using modern DevOps tools and best practices while continuously improving automation, observability and security.

---

# Author

**Ivan K.**

Junior DevOps Engineer

GitHub:
https://github.com/uplink0