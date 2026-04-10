# 🐳 Docker Hub Integration Plan

**Status:** Plan Phase (Nicht implementiert)  
**Priority:** Medium (für Production)  
**Complexity:** Medium  
**Estimated Effort:** 4-6 Stunden

---

## 📊 OVERVIEW

Der Plan erweitert das Deployment um Docker Hub Integration:
- **Jetzt:** Benutzer bauen Images lokal: `docker compose build`
- **Nachher:** Benutzer ziehen pre-built Images: `docker compose up` (kein build nötig)

---

## 🎯 ZIELE

1. ✅ Vereinfachtes Deployment auf Synology NAS (keine Build-Zeit)
2. ✅ CI/CD Pipeline für automatisches Building & Publishing
3. ✅ Versionskontrolle über Docker Tags
4. ✅ Schnellere Deployments (pre-built Images)
5. ✅ Community-Sharing (öffentliche Images möglich)

---

## 📋 WAS IST NOTWENDIG?

### Phase 1: Docker Hub Setup (10 Minuten)

#### 1.1 Docker Hub Account
```
Aufgaben:
- [ ] Konto auf https://hub.docker.com erstellen
- [ ] Username wählen: z.B. "sushikoch" oder "bloodpressure"
- [ ] Email-Verifizierung
- [ ] Personal Access Token generieren (für CI/CD)
- [ ] Token speichern in sicherer Umgebung (Password Manager)
```

#### 1.2 Repository erstellen auf Docker Hub
```
Repository 1: bloodpressure-app
├─ Name: sushikoch/bloodpressure-app
├─ Beschreibung: "Blood Pressure Tracker - Express API"
├─ Visibility: Public (oder Private)
├─ Build Settings: Leer (werden von GitHub Actions gesteuert)
└─ Tags: latest, v1.0.0, v1.0.0-alpine

Repository 2: bloodpressure-db (optional)
├─ Name: sushikoch/bloodpressure-db
├─ Beschreibung: "PostgreSQL Database für Blood Pressure Tracker"
├─ Basiert auf: postgres:15-alpine (nur dokumentieren, nicht bauen)
└─ Tags: 15-alpine
```

---

### Phase 2: GitHub Actions CI/CD (2-3 Stunden)

#### 2.1 GitHub Actions Workflow erstellen

**Datei:** `.github/workflows/docker-build-publish.yml`

```yaml
Workflow: "Build & Publish Docker Images"

Trigger: 
  - Push zu main Branch
  - Git Tag erstellt (z.B. v1.0.0)
  - Manual Trigger (Dispatch)

Jobs:
  1. Build Docker Image
     - Checkout Code
     - Build Multi-Stage Image
     - Run Tests (optional)
     - Tag Images (latest, version)
  
  2. Push zu Docker Hub
     - Login zu Docker Hub (mit Secrets)
     - Push Image mit Tags
     - Logout (Cleanup)
  
  3. Notifications (optional)
     - Slack/Email bei Erfolg
     - Discord Notification
```

#### 2.2 Workflow Details

```
Inputs:
├─ Branch: main
├─ Trigger Events:
│  ├─ push (zu main)
│  ├─ release (erstellt)
│  └─ workflow_dispatch (manual)
│
Environment Variables:
├─ REGISTRY: docker.io
├─ REGISTRY_USERNAME: ${{ secrets.DOCKER_USERNAME }}
├─ REGISTRY_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
├─ IMAGE_NAME: sushikoch/bloodpressure-app
└─ IMAGE_TAG: latest, v1.0.0
```

#### 2.3 GitHub Secrets Configuration

```
Secrets die in GitHub registriert werden müssen:
├─ DOCKER_USERNAME
│  └─ Wert: Dein Docker Hub Username
│
├─ DOCKER_PASSWORD
│  └─ Wert: Dein Personal Access Token (PAT) von Docker Hub
│     (NICHT das Passwort, sondern das Token!)
│
└─ Optional:
   ├─ SLACK_WEBHOOK (für Notifications)
   └─ DOCKER_EMAIL (für Registrierung)
```

---

### Phase 3: Docker Image Tagging Strategy (1 Stunde)

#### 3.1 Tagging Konvention

```
Image Tags für: sushikoch/bloodpressure-app

Semantic Versioning:
├─ latest
│  └─ Immer der neueste Code von main
│
├─ v1.0.0 (Release Tag)
│  └─ Exakte Version
│
├─ v1.0 (Major.Minor)
│  └─ Verweist auf neueste Patch-Version
│
├─ v1 (Major)
│  └─ Verweist auf neueste Minor/Patch
│
├─ stable
│  └─ Letzte stabile Release
│
└─ nightly (optional)
   └─ Täglich von main gebaut
```

#### 3.2 Image Naming Convention

```
Production:
  sushikoch/bloodpressure-app:latest      ← Main Branch
  sushikoch/bloodpressure-app:v1.0.0      ← Release v1.0.0
  sushikoch/bloodpressure-app:v1.0.0-alpine ← Alpine-Variant
  sushikoch/bloodpressure-app:stable      ← Stable Release

Development (optional):
  sushikoch/bloodpressure-app:dev         ← Development Branch
  sushikoch/bloodpressure-app:nightly     ← Nightly Build
```

#### 3.3 Dockerfile Optimierungen für Registry

```
Änderungen im Dockerfile:

Vorher:
  FROM node:18-alpine AS builder
  WORKDIR /app
  COPY ...
  RUN npm ci
  ...

Nachher:
  # Metadata für Docker Hub
  LABEL org.opencontainers.image.title="Blood Pressure Tracker"
  LABEL org.opencontainers.image.description="..."
  LABEL org.opencontainers.image.version="1.0.0"
  LABEL org.opencontainers.image.source="https://github.com/sushikoch/bloodpressure"
  
  FROM node:18-alpine AS builder
  ...
```

---

### Phase 4: docker-compose.yml Anpassungen (30 Minuten)

#### 4.1 Neue docker-compose Varianten

```
Dateien zu erstellen:
├─ docker-compose.yml (original, mit build)
├─ docker-compose.prod.yml (mit Docker Hub Images)
└─ docker-compose.nohub.yml (lokal build)
```

#### 4.2 docker-compose.prod.yml Beispiel

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    # ... (keine Änderung)

  app:
    # ÄNDERUNG: Image statt Build
    image: sushikoch/bloodpressure-app:latest
    # Alternativ:
    # image: sushikoch/bloodpressure-app:v1.0.0
    
    # Fallback lokales Bauen wenn kein Internet
    build:
      context: .
      dockerfile: Dockerfile
    
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: bloodpressure
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD:-changeme123}
      NODE_ENV: production
    
    pull_policy: always  # Immer neuestes Image pullen
    
    depends_on:
      postgres:
        condition: service_healthy
    
    restart: unless-stopped
```

#### 4.3 .env.prod Datei

```
# Für Production Deployment
DB_PASSWORD=SECURE_PASSWORD_HERE
DOCKER_PULL_TIMEOUT=300
REGISTRY_USERNAME=sushikoch
REGISTRY_PASSWORD=xxxx  # Optional für private images
```

---

### Phase 5: GitHub Actions Workflow (3 Stunden)

#### 5.1 Workflow Datei Struktur

```
.github/
└─ workflows/
   ├─ docker-build-push.yml (Main Workflow)
   ├─ docker-scan.yml (Security Scanning)
   └─ docker-release.yml (Version Releases)
```

#### 5.2 docker-build-push.yml Skeleton

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  workflow_dispatch:

env:
  REGISTRY: docker.io
  IMAGE_NAME: sushikoch/bloodpressure-app

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Docker Scout vulnerability scan
        uses: docker/scout-action@v1
        with:
          command: cves
          image: ${{ steps.meta.outputs.tags }}
          exit-code: true
          annotations: true
```

#### 5.3 Security Scanning (optional)

```yaml
docker-scan.yml:
  - Trivy Security Scan
  - Docker Scout CVE Detection
  - SBOM (Software Bill of Materials) Generation
  - Falsche Secrets Detection
```

---

### Phase 6: Documentation & Scripts (1 Stunde)

#### 6.1 Neue Dokumentationsdateien

```
Zu erstellen:
├─ DOCKER-HUB.md (Anleitung für Docker Hub)
├─ CI-CD.md (GitHub Actions Workflow Dokumentation)
├─ RELEASE-PROCESS.md (Wie Releases erstellt werden)
└─ DOCKER-REGISTRY.md (Registry Management)
```

#### 6.2 Deployment Scripts

```bash
Scripts zu erstellen:

deploy-latest.sh
├─ docker pull sushikoch/bloodpressure-app:latest
├─ docker compose -f docker-compose.prod.yml up -d
└─ Healthcheck

deploy-version.sh
├─ Parameter: VERSION (z.B. v1.0.0)
├─ docker pull sushikoch/bloodpressure-app:${VERSION}
├─ docker compose -f docker-compose.prod.yml up -d
└─ Verifikation

build-local.sh
├─ docker build -t bloodpressure-app:dev .
├─ docker compose up
└─ Local Development
```

#### 6.3 .dockerignore Optimierung

```
Zu erweitern:
├─ .git/
├─ .github/
├─ node_modules/ (besser: npm ci verwenden)
├─ *.md (README.md, etc)
├─ tests/ (nur produzieren, nicht distribuieren)
├─ .env (Secrets)
├─ dist/ (wird gebaut)
└─ coverage/ (Test Reports)
```

---

### Phase 7: Security & Best Practices (1-2 Stunden)

#### 7.1 Image Security

```
Sicherheitsmaßnahmen:

✅ Base Image:
   ├─ Verwende Alpine für kleinere Images
   ├─ Regelmäßig Patch-Updates
   └─ Scan auf Vulnerabilities

✅ Build-Zeit Security:
   ├─ Keine Secrets im Dockerfile
   ├─ Multi-Stage Build (Production Code nur)
   ├─ Minimale Layer
   └─ Read-Only Filesystem wo möglich

✅ Runtime Security:
   ├─ Non-root User
   ├─ Health Checks
   ├─ Resource Limits
   └─ Logging
```

#### 7.2 Registry Security

```
Docker Hub Security:

✅ Account:
   ├─ 2FA Aktivieren
   ├─ Strong Password
   ├─ Personal Access Token (nicht Passwort)
   └─ Token mit Limited Scope

✅ Images:
   ├─ Scan enabled
   ├─ Vulnerability Notifications
   ├─ SBOM (Software Bill of Materials)
   └─ Signieren (optional, mit Notary)

✅ Access:
   ├─ Private Images wenn nötig
   ├─ Repository Settings
   └─ Build Automation (nicht manuell)
```

#### 7.3 CI/CD Security

```
GitHub Actions Security:

✅ Secrets Management:
   ├─ Nur PAT (Personal Access Token)
   ├─ Token mit minimalen Permissions
   ├─ Rotate regelmäßig
   └─ Niemals in Code hardcoded

✅ Workflow Security:
   ├─ Review externe Actions
   ├─ Pin Actions zu Versions
   ├─ Audit Logs
   └─ Branch Protection Rules
```

---

## 📊 IMPLEMENTATION ROADMAP

```
Phase 1: Docker Hub Setup
├─ Duration: 15 min
├─ Effort: 🟢 Easy
└─ Blocking: No

Phase 2: GitHub Actions
├─ Duration: 2-3 hours
├─ Effort: 🟡 Medium
├─ Blocking: Phase 1
└─ Dependencies: Docker Hub Account

Phase 3: Image Tagging
├─ Duration: 1 hour
├─ Effort: 🟡 Medium
└─ Blocking: Phase 2

Phase 4: Compose Anpassungen
├─ Duration: 30 min
├─ Effort: 🟢 Easy
└─ Blocking: Phase 3

Phase 5: Workflow Implementation
├─ Duration: 3 hours
├─ Effort: 🟡 Medium
└─ Blocking: Phase 2

Phase 6: Documentation
├─ Duration: 1-2 hours
├─ Effort: 🟢 Easy
└─ Blocking: Phase 5

Phase 7: Testing & Validation
├─ Duration: 1-2 hours
├─ Effort: 🟡 Medium
└─ Blocking: All

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 8-11 hours
Estimate: ~1-2 Tage Work
```

---

## 🎯 BENEFITS vs COSTS

### ✅ Benefits

```
Für Entwickler:
- Schnelleres Deployment (kein Build nötig)
- Einfaches Versionieren (Tags)
- Automatisiertes Building & Publishing
- CI/CD Best Practices

Für Benutzer (Synology):
- docker compose up statt docker compose build
- Schnellere Installation (~10 min vs ~30 min)
- Keine Build-Abhängigkeiten nötig
- Einfaches Rollback (ältere Tags)

Für Community:
- Öffentliche Docker Images
- Leichte Reproduzierbarkeit
- Best Practices Demonstration
```

### ⚠️ Costs

```
Setup-Aufwand: 8-11 Stunden
- GitHub Actions Setup
- Docker Hub Configuration
- Workflow Development
- Testing & Validation

Laufende Kosten:
- GitHub Actions Minutes (free tier: 2000 min/month)
- Docker Hub Storage (free tier: unlimited public)
- Maintenance (updates, security patches)

Komplexität:
- CI/CD Pipeline
- Secrets Management
- Version Strategy
```

---

## 🔄 DEPLOYMENT FLOW (Nachher)

```
Developer Perspective:

1. Code ändern & testen lokal
   └─ npm run dev

2. Commit & Push zu main
   └─ git push origin main

3. GitHub Actions triggert automatisch:
   ├─ Build Docker Image
   ├─ Run Tests (optional)
   ├─ Push zu Docker Hub
   └─ Notification

4. Benutzer auf Synology:
   └─ docker compose -f docker-compose.prod.yml up -d
   (kein lokales Build nötig!)

5. Für spezifische Version:
   ├─ Edit docker-compose.prod.yml
   ├─ Change: sushikoch/bloodpressure-app:latest
   ├─ To: sushikoch/bloodpressure-app:v1.0.0
   └─ docker compose -f docker-compose.prod.yml up -d
```

---

## 📋 CHECKLIST: WAS MUSS IMPLEMENTIERT WERDEN?

```
GitHub Setup:
[ ] Create .github/workflows/ directory
[ ] Create docker-build-push.yml workflow
[ ] Create docker-scan.yml (optional)
[ ] Add DOCKER_USERNAME secret
[ ] Add DOCKER_PASSWORD secret (PAT token)
[ ] Enable branch protection rules

Docker Hub:
[ ] Create Docker Hub Account
[ ] Create Repository: sushikoch/bloodpressure-app
[ ] Enable Vulnerability Scanning
[ ] Configure Web Hooks (optional)
[ ] Create Personal Access Token

Code Changes:
[ ] Update Dockerfile (add LABELS)
[ ] Create docker-compose.prod.yml
[ ] Create .dockerignore (optimize)
[ ] Create DOCKER-HUB.md documentation
[ ] Create CI-CD.md documentation
[ ] Create deployment scripts

Testing:
[ ] Trigger workflow manually
[ ] Verify image builds correctly
[ ] Verify image pushes to Docker Hub
[ ] Test docker compose.prod.yml
[ ] Test on different environments

Documentation:
[ ] Update README.md (with Docker Hub info)
[ ] Create RELEASE-PROCESS.md
[ ] Create troubleshooting guide
[ ] Add examples to DEPLOYMENT.md
```

---

## 🚀 FUTURE ENHANCEMENTS

```
Phase 2 (Later):
- [ ] Kubernetes Deployment (Helm Charts)
- [ ] Docker Hub Automated Builds
- [ ] Image Signing & Verification
- [ ] Private Registry (Self-Hosted)
- [ ] Multi-Architecture Images (ARM for Synology)
- [ ] Nightly Builds & Testing
- [ ] Scheduled Security Scanning
- [ ] SBOM Generation & Compliance
```

---

## 🔗 RELATED RESOURCES

```
Documentation:
├─ Docker Best Practices: https://docs.docker.com/develop/dev-best-practices/
├─ GitHub Actions: https://docs.github.com/en/actions
├─ Docker Hub: https://docs.docker.com/docker-hub/
├─ Semantic Versioning: https://semver.org/
└─ OCI Image Spec: https://github.com/opencontainers/image-spec

Tools:
├─ Docker Scout (Security)
├─ Trivy (Scanning)
├─ Dive (Image Analysis)
└─ Syft (SBOM)
```

---

## 📝 NOTES

- **Timing:** Implementierung kann nach v1.0.0 Release erfolgen
- **Priority:** Medium - Verbessert DX, nicht kritisch für MVP
- **Dependencies:** GitHub Account (kostenlos), Docker Hub Account (kostenlos)
- **Risk:** Minimal - nur CI/CD, kein Codeänderungen

---

## ✅ SUMMARY

Dieser Plan ermöglicht:
1. ✅ Automatisiertes Building & Publishing von Docker Images
2. ✅ Simplified Deployment (kein lokales Build mehr)
3. ✅ Version Management via Docker Tags
4. ✅ CI/CD Best Practices
5. ✅ Community Sharing (öffentliche Images)

**Status:** Ready for Implementation (wenn gewünscht)
