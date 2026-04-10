# Blood Pressure Tracker - Troubleshooting Guide

Häufige Probleme und Lösungen

---

## Table of Contents

1. [Backend Problems](#backend-problems)
2. [Frontend Problems](#frontend-problems)
3. [Database Problems](#database-problems)
4. [Network Problems](#network-problems)
5. [Docker Problems](#docker-problems)
6. [Mobile (iPhone) Problems](#mobile-problems)
7. [Performance Issues](#performance-issues)

---

## Backend Problems

### Server starts but immediately crashes

**Symptom:**
```
npm run dev
> server@1.0.0 dev
> nodemon --exec ts-node src/index.ts
Error: EADDRINUSE: address already in use :::3000
```

**Lösung:**
```bash
# Finde Prozess der Port 3000 nutzt
lsof -i :3000

# Beende Prozess
kill -9 <PID>

# Oder benutze anderen Port
API_PORT=3001 npm run dev
```

---

### Database connection failed

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Überprüfungen:**

1. **PostgreSQL läuft?**
```bash
# Wenn Docker:
docker ps | grep postgres

# Oder lokal:
pg_isready -h localhost -p 5432
```

2. **Credentials überprüfen:**
```bash
cat server/.env | grep DB_
```

3. **Host korrekt?**
   - Lokal: `DB_HOST=localhost`
   - Docker: `DB_HOST=postgres` (container name!)

**Lösung:**
```bash
# Docker neu starten
docker compose down
docker compose up -d postgres

# Überprüfe Health-Check
docker compose ps

# Warte 5 Sekunden, dann starten
sleep 5
docker compose up -d app
```

---

### TypeScript compilation errors

**Symptom:**
```
src/index.ts(10,15): error TS2339: Property 'env' does not exist
```

**Lösung:**
```bash
# Installiere fehlende Types
npm install --save-dev @types/node

# Rebuild
npm run build

# Oder lösche dist und neubauen
rm -rf dist/
npm run build
```

---

### "Cannot find module 'express'"

**Symptom:**
```
Cannot find module 'express'
```

**Lösung:**
```bash
# Dependencies installieren
npm install

# Oder komplette Reinstallation
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### API returns 500 Error

**Symptom:**
```
curl http://localhost:3000/api/measurements
{"success":false,"error":"Internal Server Error"}
```

**Überprüfungen:**
```bash
# 1. Schaue Logs
docker compose logs app

# 2. Überprüfe Database
docker compose logs postgres

# 3. Überprüfe DB verbindung
docker compose exec app curl http://localhost:3000/health

# 4. Überprüfe Migrations liefen
docker compose exec postgres psql -U postgres -d bloodpressure -c "SELECT COUNT(*) FROM measurements;"
```

**Lösung:**
```bash
# Starte App neu
docker compose restart app

# Oder komplettes Reset
docker compose down
docker compose up -d
```

---

## Frontend Problems

### React app loads but shows blank page

**Symptom:**
- Page loads but keine UI sichtbar
- Browser Console hat Fehler

**Überprüfungen:**

1. **Browser Console checken (F12)**
   - Schaue auf Errors/Warnings

2. **API verbunden?**
```bash
# Öffne DevTools → Network Tab
# Überprüfe API Calls zu /api/measurements
```

3. **CSS geladen?**
   - DevTools → Elements
   - Überprüfe dass Style-Tags geladen

**Lösung:**
```bash
# Restart Frontend
cd client
npm run dev

# Oder Reload im Browser
Ctrl+Shift+R (Hard Refresh)

# Oder Cache löschen
DevTools → Storage → Clear all
```

---

### Vite dev server nicht erreichbar

**Symptom:**
```
Fehler beim Öffnen von http://localhost:5173
```

**Überprüfungen:**

```bash
# Dev server läuft?
ps aux | grep vite

# Port 5173 in Verwendung?
lsof -i :5173
```

**Lösung:**
```bash
cd client

# Port freigeben
lsof -i :5173 | grep -v PID | awk '{print $2}' | xargs kill -9

# Neu starten
npm run dev

# Oder anderen Port
npm run dev -- --port 5174
```

---

### Form submission doesn't work

**Symptom:**
- Click "Save" aber nichts passiert
- Oder Error "Failed to save measurement"

**Überprüfungen:**

1. **Backend läuft?**
```bash
curl http://localhost:3000/health
```

2. **API erreichbar?**
```bash
curl -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{"measured_at":"2026-04-10T21:30:00Z","systolic":120,"diastolic":80}'
```

3. **CORS Fehler?**
   - DevTools → Console
   - Schaue auf "CORS" Fehler

4. **Validierung fehlgeschlagen?**
   - Überprüfe dass alle Felder gültig sind
   - Systolic 50-300, Diastolic 30-200

**Lösung:**
```bash
# 1. Überprüfe .env CORS_ORIGIN
cat server/.env | grep CORS

# 2. Für lokale Entwicklung:
CORS_ORIGIN=http://localhost:5173 npm run dev

# 3. Reload Browser
Ctrl+Shift+R
```

---

### History list doesn't load

**Symptom:**
- Loading spinner zeigt sich aber verschwindet nicht
- "Loading..." Text bleibt

**Überprüfungen:**

```bash
# Überprüfe API
curl http://localhost:3000/api/measurements

# Überprüfe Netzwerk (DevTools → Network)
# Schaue ob GET /api/measurements erfolgreich ist
```

**Lösung:**
```bash
# API neu starten
docker compose restart app

# Oder Browser Reload
Ctrl+Shift+R

# Oder Cache leeren
DevTools → Storage → Clear all
```

---

## Database Problems

### "relations does not exist" Fehler

**Symptom:**
```
Error: relation "measurements" does not exist
```

**Ursache:** Migrations sind nicht gelaufen

**Lösung:**
```bash
# Überprüfe Migrations Datei existiert
ls -la server/migrations/

# Überprüfe DB
docker compose exec postgres psql -U postgres -d bloodpressure -c "\dt"

# Starte neu (Migrations laufen beim Start)
docker compose down
docker compose up -d
```

---

### Cannot insert data (constraint violation)

**Symptom:**
```
Error: new row for relation "measurements" violates check constraint
```

**Ursache:** Eingabewerte nicht im erlaubten Bereich

**Lösung:**
```bash
# Überprüfe dass Input-Werte gültig sind
# Systolic: 50-300
# Diastolic: 30-200
# Pulse: 20-250 (optional)
```

---

### Database too large

**Symptom:**
```
Disk full error / Database growing too much
```

**Überprüfungen:**
```bash
# Überprüfe DB Größe
docker compose exec postgres psql -U postgres -d bloodpressure \
  -c "SELECT pg_size_pretty(pg_database_size('bloodpressure'));"

# Überprüfe Measurements-Tabelle
docker compose exec postgres psql -U postgres -d bloodpressure \
  -c "SELECT COUNT(*) FROM measurements; SELECT pg_size_pretty(pg_total_relation_size('measurements'));"
```

**Lösung:**
```bash
# Alte Daten löschen (z.B. älter als 1 Jahr)
docker compose exec postgres psql -U postgres -d bloodpressure \
  -c "DELETE FROM measurements WHERE created_at < NOW() - INTERVAL '1 year';"

# Oder CSV exportieren und Daten archivieren
curl http://localhost:3000/api/measurements/export/csv -o archive.csv
```

---

## Network Problems

### Cannot reach server from iPhone

**Symptom:**
- iPhone Safari: "Cannot reach this page"
- URL: http://192.168.x.x:3000

**Überprüfungen:**

1. **NAS IP korrekt?**
```bash
# Auf NAS
hostname -I
```

2. **iPhone im gleichen Netzwerk?**
   - Öffne iPhone Settings → WiFi
   - Überprüfe SSID ist identisch mit Laptop

3. **Port 3000 offen?**
```bash
# Von iPhone: öffne Safari und öffne
http://192.168.x.x:3000/health
```

4. **Firewall blockiert?**
   - Synology: Control Panel → Firewall
   - Überprüfe Port 3000 ist allowed

**Lösung:**
```bash
# 1. Restart NAS Services
docker compose restart

# 2. Überprüfe Port
docker compose ps
# PORTS sollte zeigen: 0.0.0.0:3000->3000/tcp

# 3. Überprüfe vom Laptop
curl http://localhost:3000/health

# 4. Überprüfe Netzwerk
ping 192.168.x.x
```

---

### Intermittent connection drops

**Symptom:**
- Manchmal funktioniert, manchmal nicht
- Bricht ab nach X Requests

**Überprüfungen:**
```bash
# Überprüfe Server Logs
docker compose logs -f app

# Überprüfe Memory
docker stats

# Überprüfe Network
ping 192.168.x.x
```

**Lösung:**
```bash
# Restart Services
docker compose restart

# Oder kompletter Reset
docker compose down
docker compose up -d

# Warte auf Health Check
docker compose ps
```

---

## Docker Problems

### Container won't start

**Symptom:**
```
docker compose up -d
ERROR: for bloodpressure-app  Container b123abc exited with code 1
```

**Überprüfungen:**
```bash
# Schaue Logs
docker compose logs app

# Überprüfe Image
docker images | grep bloodpressure
```

**Lösung:**
```bash
# Rebuild Image
docker compose build --no-cache

# Dann starten
docker compose up -d
```

---

### "port is already allocated"

**Symptom:**
```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

**Lösung:**
```bash
# Option 1: Andere Port in docker-compose.yml
# Ändere "3000:3000" zu "3001:3000"

# Option 2: Port freigeben
docker ps | grep 3000
docker stop <container_id>

# Option 3: Remove Container
docker compose down
docker compose up -d
```

---

### Postgres volume permissions error

**Symptom:**
```
permission denied while trying to connect to Docker daemon
```

**Lösung:**
```bash
# Füge User zur docker group hinzu
sudo usermod -aG docker $USER
newgrp docker

# Restart Docker
sudo systemctl restart docker
```

---

## Mobile Problems

### Page doesn't fit on iPhone screen

**Symptom:**
- Horizontal scrolling erforderlich
- Layout ist kaputt

**Überprüfungen:**

1. **Viewport Meta Tag?**
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

2. **CSS Breakpoints?**
   - Mobile: < 768px
   - Überprüfe dass Layout responsive ist

**Lösung:**
```bash
# Überprüfe index.html hat viewport
grep viewport client/index.html

# Reload iPhone (Cmd+R)

# Oder Force Refresh (Cmd+Shift+R)
```

---

### Keyboard covers input fields

**Symptom:**
- Beim Eingeben deckt Keyboard Input ab

**Ursache:** Design-Problem, kein Server-Problem

**Workaround:**
- Scroll up bevor eingeben
- Benutze landscape mode

---

### Form won't submit on iPhone

**Symptom:**
- Klick "Save" aber nichts passiert
- Oder Submit button bleibt grau

**Überprüfungen:**

1. **JavaScript Fehler?**
   - Safari → Develop → Console (Desktop)
   - oder Safari auf iPhone → Remote Inspector

2. **Alle Felder gefüllt?**
   - Überprüfe alle required fields sind populated

**Lösung:**
```bash
# Hard refresh
# Zwei Finger swipe left/right (Back)
# Öffne URL nochmal

# Oder Clear Safari Cache
iPhone Settings → Safari → Clear History and Website Data
```

---

## Performance Issues

### App is slow

**Symptom:**
- Formular träge
- List scrollt nicht smooth

**Überprüfungen:**
```bash
# Überprüfe RAM/CPU
docker stats

# Überprüfe Messy Performance (too many items)
curl http://localhost:3000/api/measurements | wc -l
```

**Lösung:**
```bash
# 1. Implementiere Pagination
curl http://localhost:3000/api/measurements?limit=10

# 2. Erhöhe Container Resources
# In docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       cpus: '1'
#       memory: 512M

# 3. Archiviere alte Daten
docker compose exec postgres psql -U postgres -d bloodpressure \
  -c "DELETE FROM measurements WHERE created_at < NOW() - INTERVAL '6 months';"
```

---

### High memory usage

**Symptom:**
```
docker stats
bloodpressure-app   250MB / 512MB
```

**Lösung:**
```bash
# Restart Container
docker compose restart app

# Oder erhöhe Memory Limit
# In docker-compose.yml erhöhe RAM
```

---

### Slow CSV export with many rows

**Symptom:**
- CSV export dauert lange (> 10 Sekunden)
- Mit tausenden Messungen

**Lösung:**
```bash
# Implementiere Streaming in Future Release
# Für jetzt: Archiviere alte Daten

docker compose exec postgres psql -U postgres -d bloodpressure \
  -c "DELETE FROM measurements WHERE created_at < NOW() - INTERVAL '1 year';"
```

---

## General Troubleshooting Steps

### 1. Check Logs
```bash
docker compose logs -f
```

### 2. Restart All
```bash
docker compose restart
```

### 3. Full Reset
```bash
docker compose down
docker compose up -d
```

### 4. Check Health
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/measurements
```

### 5. Check Browser Console
- F12 → Console
- F12 → Network
- Look for Errors/Failed requests

### 6. Check Server Logs
```bash
docker compose logs app | tail -50
docker compose logs postgres | tail -50
```

---

## Contact & Further Help

Wenn nichts hilft:

1. Schaue [SETUP.md](./SETUP.md) für Basis-Setup
2. Schaue [DEPLOYMENT.md](./DEPLOYMENT.md) für NAS-Deployment
3. Schaue [API.md](./API.md) für API-Referenz
4. Überprüfe [TESTING-GUIDE.md](./TESTING-GUIDE.md) für Test-Prozess

---

## Common Error Messages Reference

| Error | Lösung |
|-------|--------|
| `EADDRINUSE` | Port bereits in Verwendung - kill Prozess |
| `ECONNREFUSED` | PostgreSQL läuft nicht - docker start |
| `CORS error` | CORS_ORIGIN in .env überprüfen |
| `Cannot find module` | npm install ausführen |
| `relation does not exist` | Migrations nicht gelaufen - restart app |
| `port is already allocated` | docker-compose down, dann up |
| `permission denied` | Sudo verwenden oder docker group |

