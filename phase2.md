# 🚀 Phase 2: Coolify Deployment Integration

**Status:** Planned (Not Yet Implemented)  
**Target:** Deploy Blood Pressure Tracker to Coolify Self-Hosted Server  
**Date:** April 13, 2026  
**Author:** Claude Code v4.5

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What is Coolify?](#what-is-coolify)
3. [Compatibility Analysis](#compatibility-analysis)
4. [Prerequisites](#prerequisites)
5. [Architecture & Design](#architecture--design)
6. [Implementation Plan](#implementation-plan)
7. [Deployment Steps](#deployment-steps)
8. [Configuration Details](#configuration-details)
9. [Security Considerations](#security-considerations)
10. [Monitoring & Backup](#monitoring--backup)
11. [Troubleshooting](#troubleshooting)
12. [Verification Checklist](#verification-checklist)

---

## Overview

### Goal
Deploy the Blood Pressure Tracker v1.0.0 application to a Coolify self-hosted server as an alternative to Synology NAS deployment.

### Why Coolify?
- **Open Source:** Free, community-driven platform
- **Self-Hosted:** Full control over infrastructure
- **Docker Native:** Seamless integration with existing Docker setup
- **GitOps Ready:** Deploy directly from GitHub repository
- **Auto-Scaling:** Container management and orchestration
- **CI/CD Pipeline:** Built-in deployment automation

### Current State
✅ Project is v1.0.0 production-ready  
✅ Docker + docker-compose.yml configured  
✅ PostgreSQL 15 ready  
✅ Environment variables properly structured  
✅ DEPLOYMENT.md exists for Synology (reference for patterns)

---

## What is Coolify?

### Definition
Coolify is an **open-source, self-hosted platform** similar to Heroku or Vercel, but runs on your own infrastructure.

### Key Features
```
✅ Docker Container Management
✅ PostgreSQL Database Hosting
✅ Git Integration (GitHub, GitLab, Gitea)
✅ Automatic SSL/TLS (LetsEncrypt)
✅ Webhook Deployments
✅ Environment Management
✅ Monitoring & Logs
✅ Backup & Recovery
✅ Multi-Project Support
✅ Free & Open Source (AGPL-3.0)
```

### Architecture
```
┌─────────────────────────────────────┐
│      Coolify Server (Docker)        │
├─────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────┐  │
│  │ PostgreSQL   │  │ App Service │  │
│  │ Container    │  │ (Node.js)   │  │
│  └──────────────┘  └─────────────┘  │
├─────────────────────────────────────┤
│  Coolify Dashboard & API            │
├─────────────────────────────────────┤
│  SSL/TLS, Reverse Proxy, Networking │
└─────────────────────────────────────┘
```

---

## Compatibility Analysis

### ✅ Project Components Compatibility

| Component | Required | Project Status | Coolify Support | Notes |
|-----------|----------|-----------------|-----------------|-------|
| **Node.js Backend** | ✅ | Implemented | ✅ Full | Express.js v4.18+ |
| **React Frontend** | ✅ | Implemented | ✅ Full | Vite build included |
| **PostgreSQL 15** | ✅ | Implemented | ✅ Full | Docker image |
| **Docker** | ✅ | Multi-stage | ✅ Full | Production ready |
| **docker-compose** | ✅ | Configured | ✅ Full | Can be imported |
| **Environment Vars** | ✅ | Structured | ✅ Full | UI management |
| **Health Checks** | ✅ | Implemented | ✅ Full | Service monitoring |
| **Volumes/Storage** | ✅ | Configured | ✅ Full | Persistent storage |
| **Networking** | ✅ | Custom network | ✅ Full | Service discovery |
| **SSL/TLS** | ✅ | Proxy-ready | ✅ Full | Automatic LetsEncrypt |

### Verdict: ✅ **100% COMPATIBLE**

All components are fully supported by Coolify. No code changes required.

---

## Prerequisites

### 1. Server Requirements

**Minimum Specs:**
```
CPU:      2 Cores (1-2 GHz)
RAM:      2-4 GB minimum (4 GB recommended)
Storage:  20 GB available (10 GB for data, 10 GB buffer)
OS:       Linux (Ubuntu 20.04+ recommended)
```

**Recommended Setup:**
```
CPU:      4 Cores
RAM:      8 GB
Storage:  100 GB SSD
OS:       Ubuntu 22.04 LTS or Debian 12
```

### 2. Coolify Installation

**Option A: Direct Installation**
```bash
# SSH into your server
ssh user@your-server.com

# Install Coolify (one command)
curl -fsSL https://get.cooli.fly | bash

# Follow the installation wizard
# Access Coolify at: https://your-server.com:3000 (initial)
```

**Option B: Docker Installation**
```bash
docker run -d \
  -p 80:80 \
  -p 443:443 \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v coolify-db:/app/db \
  coollabsio/coolify:latest
```

### 3. DNS & Networking

**Required:**
- ✅ Domain name or fixed IP address
- ✅ DNS records pointing to server (A/AAAA records)
- ✅ Ports 80, 443, 3000 accessible (firewall rules)
- ✅ No other services on port 3000 (Coolify needs it)

**Recommended:**
```
DNS A Record:
  bloodpressure.example.com → 192.168.1.100

Firewall Rules:
  - Allow: 22/tcp (SSH)
  - Allow: 80/tcp (HTTP redirect)
  - Allow: 443/tcp (HTTPS)
  - Allow: 3000/tcp (Coolify Dashboard)
```

### 4. GitHub Integration

**Required:**
- ✅ GitHub Account with repository access
- ✅ Personal Access Token (PAT) with repo access
- ✅ Repository: `sushikoch/bloodpressure`

**Create PAT:**
```
GitHub Settings → Developer Settings → Personal Access Tokens
Scopes: repo (full), admin:repo_hook
Copy token, store securely
```

### 5. Credentials & Secrets

Prepare these before deployment:
```
✅ PostgreSQL Password (strong, 16+ chars)
✅ GitHub PAT token
✅ Domain name
✅ Email for SSL certificates
✅ API CORS origin (your domain)
```

---

## Architecture & Design

### Deployment Model: Compose Service

**Why:**
- Keeps existing docker-compose.yml
- Single source of truth
- Easy to maintain
- Supports all features

### Architecture Diagram

```
┌──────────────────────────────────────────┐
│         Coolify Dashboard                │
│     (Browser: https://domain.com)        │
└──────────────────────────────────────────┘
                    ↓
         ┌─────────────────────┐
         │  Coolify Engine     │
         │  (Service Manager)  │
         └─────────────────────┘
                    ↓
     ┌──────────────────────────────────┐
     │  Docker Compose Application      │
     ├──────────────────────────────────┤
     │  ┌──────────────┐ ┌────────────┐ │
     │  │  PostgreSQL  │ │   Node.js  │ │
     │  │  Container   │ │   App      │ │
     │  │  (Port 5432) │ │ (Port 3000)│ │
     │  └──────────────┘ └────────────┘ │
     │         ↓                ↓        │
     │   postgres_data    Vite Build    │
     │   (Persistent)       (React)     │
     └──────────────────────────────────┘
                    ↓
     ┌──────────────────────────────────┐
     │    Reverse Proxy + SSL/TLS       │
     │   (HTTPS: https://domain.com)    │
     └──────────────────────────────────┘
```

### Network Model

```
Internet
   ↓ (HTTPS:443)
[Coolify Reverse Proxy]
   ↓
[Docker Network: coolify]
   ├─→ PostgreSQL (internal:5432)
   ├─→ App Service (internal:3000)
   └─→ Other services...
```

---

## Implementation Plan

### Phase 2A: Preparation (1-2 hours)

**Deliverables:**
- [x] phase2.md created
- [ ] docker-compose.yml optimized for Coolify
- [ ] .env.example extended for Coolify
- [ ] .env.production template created
- [ ] README-COOLIFY.md documentation

**Files to create:**
```
├── docker-compose.yml          (UPDATE: add env vars)
├── .env.example               (UPDATE: Coolify vars)
├── .env.production.example    (NEW: production template)
├── README-COOLIFY.md          (NEW: deployment guide)
└── .coolify.yml               (NEW: optional: Coolify config)
```

### Phase 2B: Configuration (1-2 hours)

**Deliverables:**
- [ ] Coolify server installed & running
- [ ] GitHub integration connected
- [ ] Docker credentials configured
- [ ] Secrets management setup

**Manual Steps:**
1. Install Coolify on server
2. Create GitHub PAT token
3. Link GitHub repo to Coolify
4. Configure secrets in Coolify UI

### Phase 2C: Deployment (30-60 min)

**Deliverables:**
- [ ] Application deployed successfully
- [ ] PostgreSQL initialized with schema
- [ ] Health checks passing
- [ ] HTTPS certificate issued
- [ ] Monitoring active

### Phase 2D: Verification (30 min)

**Deliverables:**
- [ ] Application accessible via HTTPS
- [ ] Health check endpoint working
- [ ] Database migrations executed
- [ ] API endpoints responding
- [ ] CSV export functional
- [ ] Mobile UI working on iPhone

---

## Configuration Details

### docker-compose.yml Optimization

**Current State:** ✅ Already production-ready

**Recommended Coolify Additions:**

```yaml
version: '3.9'

services:
  app:
    build: .
    container_name: bloodpressure-app
    restart: unless-stopped
    ports:
      - "${API_PORT:-3000}:3000"
    environment:
      # Database
      - DB_HOST=${DB_HOST:-postgres}
      - DB_PORT=${DB_PORT:-5432}
      - DB_USER=${DB_USER:-postgres}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME:-bloodpressure}
      
      # Application
      - NODE_ENV=${NODE_ENV:-production}
      - API_PORT=${API_PORT:-3000}
      - CORS_ORIGIN=${CORS_ORIGIN}
      
      # Logging
      - LOG_LEVEL=${LOG_LEVEL:-info}
    
    depends_on:
      postgres:
        condition: service_healthy
    
    networks:
      - coolify
    
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
    labels:
      # Coolify metadata
      - "coolify.io/service=bloodpressure-app"
      - "coolify.io/managed=true"

  postgres:
    image: postgres:15-alpine
    container_name: bloodpressure-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${DB_USER:-postgres}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME:-bloodpressure}
      - POSTGRES_INITDB_ARGS=${POSTGRES_INITDB_ARGS:-}
    
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./server/migrations:/docker-entrypoint-initdb.d
    
    networks:
      - coolify
    
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    
    labels:
      - "coolify.io/service=bloodpressure-postgres"

networks:
  coolify:
    driver: bridge
    name: coolify

volumes:
  postgres_data:
    driver: local
    name: bloodpressure-postgres-data
```

### Environment Variables Template

**File: .env.production.example**

```bash
# ============ DATABASE CONFIGURATION ============
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE_MIN_16_CHARS
DB_NAME=bloodpressure

# ============ APPLICATION CONFIGURATION ============
NODE_ENV=production
API_PORT=3000
CORS_ORIGIN=https://bloodpressure.example.com

# ============ LOGGING ============
LOG_LEVEL=info

# ============ OPTIONAL: POSTGRES INITIALIZATION ============
POSTGRES_INITDB_ARGS=-E UTF8

# ============ OPTIONAL: DATABASE BACKUP ============
# Coolify can execute these commands in cron
BACKUP_ENABLED=true
BACKUP_FREQUENCY=daily
BACKUP_RETENTION_DAYS=30
```

### Coolify Project Configuration

**File: .coolify.yml (Optional)**

```yaml
# Coolify Project Manifest
# This file helps Coolify understand your project structure

version: '1'

project:
  name: blood-pressure-tracker
  description: Track blood pressure readings with a modern UI
  version: 1.0.0
  author: sushikoch
  repository: https://github.com/sushikoch/bloodpressure

deployment:
  strategy: compose
  compose_file: docker-compose.yml
  auto_deploy: true
  branch: main

services:
  - name: app
    type: docker
    healthcheck_url: http://localhost:3000/health
    
  - name: postgres
    type: database
    database_type: postgresql

environment:
  required:
    - DB_PASSWORD
    - CORS_ORIGIN
  
  optional:
    - LOG_LEVEL: info
    - API_PORT: '3000'

backup:
  enabled: true
  frequency: daily
  retention: 30days
  target: postgres

monitoring:
  health_check_enabled: true
  logs_enabled: true
```

---

## Deployment Steps

### Step 1: Prepare Repository

```bash
# Checkout branch
git checkout claude/analyze-bloodpressure-repo-beRRc

# Create/update configuration files (see Configuration Details above)
# These files should be added to repo:
# - docker-compose.yml (update with env vars)
# - .env.example (add Coolify vars)
# - .env.production.example (new)
# - README-COOLIFY.md (new)
# - .coolify.yml (optional)

# Commit changes
git add docker-compose.yml .env.example .env.production.example README-COOLIFY.md .coolify.yml
git commit -m "Add Coolify deployment configuration"
git push origin claude/analyze-bloodpressure-repo-beRRc
```

### Step 2: Install Coolify Server

```bash
# SSH to your server
ssh user@your-server.com

# Install Coolify (latest version)
curl -fsSL https://get.cooli.fly | bash

# Follow the interactive setup wizard:
# 1. Confirm installation
# 2. Set admin password
# 3. Configure email (for SSL certs)
# 4. Accept firewall configuration

# Wait for startup (2-5 minutes)
# Access at: https://your-server-ip:3000
```

### Step 3: Initial Coolify Configuration

**In Coolify Dashboard:**

1. **Login**
   ```
   URL: https://your-server-ip:3000
   Username: admin
   Password: (from setup)
   ```

2. **Change Admin Password**
   - Settings → Security → Change Password

3. **Configure Email & Notifications**
   - Settings → Email → SMTP Configuration
   - (For SSL certificate notifications)

4. **Set Base Domain**
   - Settings → Server → Domain
   - Example: `bloodpressure.example.com`

### Step 4: GitHub Integration

**In Coolify Dashboard:**

1. **Sources → GitHub**
   - Click "Connect with GitHub"
   - Authorize Coolify app
   - Or use Personal Access Token:
     - Paste GitHub PAT token
     - Click "Authenticate"

2. **Verify Connection**
   - Should see your repositories listed
   - Select: `sushikoch/bloodpressure`

### Step 5: Create New Project

**In Coolify Dashboard:**

1. **Projects → Create New**
   - Name: `Blood Pressure Tracker`
   - Description: `Health tracking application`

2. **Add Service → Docker Compose**
   - Source: GitHub
   - Repository: `sushikoch/bloodpressure`
   - Branch: `main` (or `claude/analyze-bloodpressure-repo-beRRc`)
   - Compose File Path: `docker-compose.yml`

3. **Set Environment Variables**
   ```
   DB_PASSWORD: (generate strong password)
   CORS_ORIGIN: https://bloodpressure.example.com
   NODE_ENV: production
   API_PORT: 3000
   LOG_LEVEL: info
   ```

4. **Configure Ports**
   ```
   Public Port: 443 (HTTPS)
   Internal Port: 3000 (App)
   Health Check: http://localhost:3000/health
   ```

5. **SSL Configuration**
   - Domain: `bloodpressure.example.com`
   - Certificate: LetsEncrypt (automatic)
   - Auto-renewal: Enabled

### Step 6: Deploy Application

**In Coolify Dashboard:**

1. **Review Configuration**
   - Verify all settings
   - Check environment variables
   - Confirm volume mappings

2. **Deploy**
   - Click "Deploy" button
   - Watch deployment logs
   - Expected duration: 2-5 minutes

3. **Monitor Startup**
   ```
   Logs should show:
   ✅ Docker image built
   ✅ Containers started
   ✅ PostgreSQL initialized
   ✅ Migrations executed
   ✅ App listening on port 3000
   ✅ Health check passing
   ```

### Step 7: Verify Deployment

```bash
# Test health endpoint
curl -k https://bloodpressure.example.com/health

# Expected response:
# {"status":"ok","timestamp":"2026-04-13T..."}

# Test API endpoint
curl -k https://bloodpressure.example.com/api/measurements

# Expected response:
# {"success":true,"data":[]}
```

### Step 8: Access Application

```
Frontend:  https://bloodpressure.example.com
API:       https://bloodpressure.example.com/api/measurements
Health:    https://bloodpressure.example.com/health
```

---

## Security Considerations

### Network Security

**Firewall Configuration:**
```bash
# Allow only necessary ports
ufw default deny incoming
ufw default allow outgoing

# SSH
ufw allow 22/tcp

# HTTP redirect
ufw allow 80/tcp

# HTTPS
ufw allow 443/tcp

# Coolify Dashboard (restrict to admin IPs)
ufw allow from YOUR_ADMIN_IP to any port 3000
```

**Reverse Proxy Headers:**
```
# Coolify automatically sets:
X-Forwarded-For: client IP
X-Forwarded-Proto: https
X-Forwarded-Host: domain
X-Real-IP: client IP
```

### Database Security

**PostgreSQL Best Practices:**
```sql
-- Strong password (already set in .env)
-- Restrict connections to app container only
-- No public internet access
-- Regular backups (automated by Coolify)
-- Encryption at rest (optional: filesystem level)
```

### Application Security

**Helmet.js Security Headers:**
```
✅ Content-Security-Policy
✅ X-Frame-Options: DENY
✅ X-Content-Type-Options: nosniff
✅ Strict-Transport-Security (HSTS)
✅ X-XSS-Protection
```

**CORS Configuration:**
```
Origin: https://bloodpressure.example.com (only)
Methods: GET, POST, OPTIONS
Credentials: Not required
```

### Secrets Management

**Coolify Secrets Best Practices:**

1. **Never commit secrets to git**
   - ✅ .env not in repository
   - ✅ Secrets in Coolify UI only
   - ✅ .env.example for reference only

2. **Strong Passwords**
   ```
   PostgreSQL: 16+ chars, mixed case, symbols
   Example: aB3$xYz@Qw9!mK2&Jh
   ```

3. **Rotate Regularly**
   - Change DB password every 90 days
   - Update in Coolify UI → redeploy

4. **Backup Secrets**
   - Store in password manager (Bitwarden, 1Password)
   - Keep offline copy in secure location

### SSL/TLS Security

**Automatic Configuration (Coolify):**
```
✅ LetsEncrypt certificates (free, auto-renewing)
✅ 90-day expiration, automatic renewal
✅ Force HTTPS redirection
✅ HSTS header enabled
✅ TLS 1.2+ minimum
```

---

## Monitoring & Backup

### Health Monitoring

**Coolify Built-in Monitoring:**

1. **Health Checks**
   - Endpoint: `http://localhost:3000/health`
   - Interval: 30 seconds
   - Timeout: 10 seconds
   - Restart on failure: automatic

2. **Metrics Dashboard**
   - CPU usage
   - Memory usage
   - Network I/O
   - Container status
   - Logs stream

3. **Alerts**
   - Container crashed
   - Health check failed
   - High resource usage
   - Deployment errors

### Backup Strategy

**PostgreSQL Automated Backups:**

**Option 1: Coolify Built-in**
```yaml
backup:
  enabled: true
  frequency: daily
  retention: 30days
  storage: local  # /var/lib/coolify/backups
```

**Option 2: Cron Job (Manual)**
```bash
# Add to server crontab:
0 2 * * * docker exec bloodpressure-postgres \
  pg_dump -U postgres -d bloodpressure \
  | gzip > /backups/bp-$(date +\%Y\%m\%d).sql.gz

# Keep 30 days of backups
0 3 * * * find /backups -name "bp-*.sql.gz" -mtime +30 -delete
```

**Option 3: Remote Backup**
```bash
# S3-compatible storage (AWS, Wasabi, MinIO, etc.)
# Requires: s3cmd or aws-cli

0 2 * * * docker exec bloodpressure-postgres \
  pg_dump -U postgres -d bloodpressure \
  | gzip | aws s3 cp - \
  s3://your-bucket/bloodpressure/$(date +%Y%m%d).sql.gz
```

### Log Management

**Viewing Logs:**
```bash
# Via Coolify Dashboard:
Services → bloodpressure-app → Logs (live stream)

# Via Docker CLI:
docker logs -f bloodpressure-app
docker logs -f bloodpressure-postgres

# Via SSH:
ssh user@server
docker compose logs -f
```

### Performance Monitoring

**Key Metrics:**
```
API Response Time:     < 100ms
Database Query Time:   < 50ms
Memory Usage (App):    100-200MB
Memory Usage (DB):     200-400MB
Disk Usage (DB):       < 5GB
```

---

## Troubleshooting

### Deployment Issues

#### Deployment stuck or hanging

**Symptoms:**
```
Logs show no progress for > 5 minutes
Service status: "deploying"
```

**Solutions:**
```bash
# 1. Check Docker
docker ps
docker logs bloodpressure-app

# 2. Check network
ping your-server.com

# 3. Restart deployment
# In Coolify: Click "Redeploy"

# 4. Manual check
docker compose ps
docker compose logs
```

#### Build fails with "npm ERR!"

**Symptoms:**
```
Docker build fails during npm install
```

**Solutions:**
```bash
# 1. Increase Docker build memory
# In docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2G

# 2. Clear Docker cache
docker builder prune

# 3. Manually rebuild
docker compose build --no-cache

# 4. Check package-lock.json
npm ci instead of npm install
```

#### PostgreSQL won't start

**Symptoms:**
```
postgres_1 | error: directory "/var/lib/postgresql/data" exists but is not empty
```

**Solutions:**
```bash
# 1. Check volume
docker volume ls | grep bloodpressure

# 2. Remove and recreate
docker volume rm bloodpressure-postgres-data
docker compose down
docker compose up -d

# 3. Check permissions
docker exec -u postgres bloodpressure-postgres \
  psql -U postgres -d bloodpressure -c "SELECT 1"
```

### Application Issues

#### API returns 500 error

**Symptoms:**
```
curl https://bloodpressure.example.com/api/measurements
→ {"success":false,"error":"Internal Server Error"}
```

**Solutions:**
```bash
# 1. Check app logs
docker logs bloodpressure-app | tail -50

# 2. Check database connection
docker exec bloodpressure-app \
  curl http://localhost:3000/health

# 3. Check environment variables
docker inspect bloodpressure-app | grep -A 50 Env

# 4. Restart app
docker compose restart app
```

#### CORS error in browser

**Symptoms:**
```
Access to XMLHttpRequest at 'https://api.example.com' 
from origin 'https://example.com' has been blocked by CORS policy
```

**Solutions:**
```bash
# 1. Check CORS_ORIGIN environment variable
# In Coolify UI: Services → environment → CORS_ORIGIN
# Should match your domain exactly

# 2. Update and redeploy
# Change: CORS_ORIGIN=https://bloodpressure.example.com
# Click: "Redeploy"

# 3. Check Helmet.js configuration
grep -n "cors\|CORS" server/src/index.ts
```

#### SSL certificate not issuing

**Symptoms:**
```
https://bloodpressure.example.com: NET::ERR_CERT_AUTHORITY_INVALID
```

**Solutions:**
```bash
# 1. Check DNS
nslookup bloodpressure.example.com
# Should resolve to your server IP

# 2. Check port accessibility
curl http://bloodpressure.example.com/.well-known/acme-challenge/test
# Should reach your server

# 3. Force certificate renewal
# In Coolify: Services → SSL → Force Renewal

# 4. Check logs for LetsEncrypt errors
docker logs coolify-traefik
```

### Network Issues

#### Cannot reach application from iPhone

**Symptoms:**
```
iPhone Safari: "Cannot reach this page"
URL: https://192.168.x.x:3000
```

**Solutions:**
```bash
# 1. Use domain name (not IP)
https://bloodpressure.example.com

# 2. Check firewall
sudo ufw status
# Should show port 443 ALLOW

# 3. Check DNS
# Phone Settings → WiFi → DNS settings
# Use 8.8.8.8 or cloudflare 1.1.1.1

# 4. Test from server
curl -k https://localhost:3000/health
curl -k https://bloodpressure.example.com/health
```

#### High latency or timeout

**Symptoms:**
```
API requests taking > 5 seconds
Intermittent timeouts
```

**Solutions:**
```bash
# 1. Check server resources
docker stats

# 2. Check database performance
docker exec bloodpressure-postgres \
  psql -U postgres -d bloodpressure \
  -c "SELECT * FROM measurements LIMIT 1;"

# 3. Increase timeouts in code
# In server/src/index.ts:
# app.use(express.json({ timeout: 30000 }))

# 4. Monitor network
# In Coolify: Monitoring → Network
```

---

## Verification Checklist

### Pre-Deployment

- [ ] Coolify installed and running
- [ ] GitHub integration connected
- [ ] Domain DNS records set (A record pointing to server)
- [ ] Firewall rules configured (80, 443 open)
- [ ] Environment variables prepared (.env.production.example)
- [ ] docker-compose.yml reviewed and tested locally
- [ ] All files committed to repository
- [ ] Main branch is stable and up-to-date

### Deployment

- [ ] Service created in Coolify
- [ ] Environment variables entered in Coolify UI
- [ ] PostgreSQL service ready
- [ ] App service deployed
- [ ] No build errors in logs
- [ ] Containers running: `docker ps`
- [ ] Deployment took < 5 minutes

### Post-Deployment

- [ ] Health check endpoint responding: `curl https://domain.com/health`
- [ ] API endpoint accessible: `curl https://domain.com/api/measurements`
- [ ] Database migrations executed successfully
- [ ] HTTPS certificate valid (no browser warnings)
- [ ] CORS working (form submission successful)
- [ ] CSV export functional
- [ ] Frontend loads at `https://domain.com`
- [ ] Mobile responsive (iPhone Safari test)
- [ ] Monitoring dashboard shows healthy services
- [ ] Logs are clean (no errors)

### Security Verification

- [ ] HTTPS enforced (HTTP → HTTPS redirect working)
- [ ] HSTS header present
- [ ] CORS origin restricted to domain
- [ ] Database password is strong (16+ chars)
- [ ] No secrets in git repository
- [ ] Firewall properly configured
- [ ] SSH key-based authentication only (no passwords)
- [ ] Backup system enabled and tested

### Performance Verification

- [ ] API response time < 100ms
- [ ] Page loads in < 2 seconds
- [ ] No console errors in browser DevTools
- [ ] Mobile UI renders correctly on iPhone
- [ ] CSV export completes in < 30 seconds
- [ ] Memory usage stable (no leaks)
- [ ] CPU usage < 50% at idle

### Functionality Verification

- [ ] Create new measurement works
- [ ] List measurements displays all records
- [ ] Get single measurement returns correct data
- [ ] Export CSV downloads file
- [ ] Health check endpoint returns {"status":"ok"}
- [ ] Error handling works (invalid input rejected)
- [ ] Validation rules enforced
- [ ] All fields properly formatted in UI
- [ ] Notes with special characters handled correctly

### Documentation

- [ ] README-COOLIFY.md created and uploaded
- [ ] Deployment guide is comprehensive
- [ ] Troubleshooting section complete
- [ ] Environment variables documented
- [ ] Backup procedures documented
- [ ] Monitoring setup documented
- [ ] All team members have access docs

---

## Implementation Timeline

### Estimated Effort: 4-6 hours

```
Preparation:      1-2 hours
Installation:     30-60 min
Configuration:    1-2 hours
Deployment:       30-60 min
Verification:     30 min
Troubleshooting:  30 min (buffer)
```

### Parallelizable Tasks

**Before Deployment:**
- [ ] Prepare configuration files (1h)
- [ ] Install Coolify on server (parallel) (1h)
- [ ] Commit files to repository (parallel) (15 min)

**Deployment:**
- [ ] Configure GitHub integration
- [ ] Set environment variables
- [ ] Deploy service
- [ ] Wait for containers to start (3-5 min)

---

## Next Steps (When Ready)

1. **Phase 2A Implementation:**
   - Optimize docker-compose.yml
   - Create .env.production.example
   - Write README-COOLIFY.md
   - Commit to repository

2. **Phase 2B Implementation:**
   - Install Coolify server
   - Configure GitHub integration
   - Set up environment variables
   - Configure monitoring

3. **Phase 2C Implementation:**
   - Create service in Coolify
   - Deploy application
   - Verify all endpoints
   - Test from browser

4. **Phase 2D Implementation:**
   - Full functionality testing
   - Performance benchmarking
   - Security audit
   - Documentation review

---

## References

- **Coolify Official:** https://coolify.io
- **Docker Compose Docs:** https://docs.docker.com/compose/
- **PostgreSQL Backup:** https://www.postgresql.org/docs/15/backup-dump.html
- **LetsEncrypt:** https://letsencrypt.org
- **Project Repo:** https://github.com/sushikoch/bloodpressure

---

## Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Synology NAS deployment
- [SETUP.md](./SETUP.md) - Local development setup
- [API.md](./API.md) - API reference
- [DOCKER-HUB-PLAN.md](./DOCKER-HUB-PLAN.md) - Docker Hub CI/CD integration
- [CODE-REVIEW.md](./CODE-REVIEW.md) - Security & quality audit

---

**Document Version:** 1.0  
**Last Updated:** April 13, 2026  
**Status:** Ready for Implementation  
**Author:** Claude Code v4.5

---

*"Coolify provides a modern, open-source alternative for deploying containerized applications on your own infrastructure with minimal overhead and maximum control."*
