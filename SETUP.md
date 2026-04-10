# Blood Pressure Tracker - Setup Guide

Lokales Development-Setup für Frontend + Backend

## Prerequisites

- **Node.js**: v18 oder höher
- **npm**: v9 oder höher
- **PostgreSQL**: 15 oder höher (lokal oder Docker)
- **Git**: für Repository-Zugriff

Überprüfe deine Versionen:
```bash
node --version
npm --version
psql --version
```

---

## 1. Repository klonen

```bash
git clone https://github.com/sushikoch/bloodpressure.git
cd bloodpressure
```

---

## 2. PostgreSQL starten (Docker empfohlen)

### Option A: Docker (schnell & einfach)

```bash
docker run -d \
  --name bloodpressure-db \
  -e POSTGRES_DB=bloodpressure \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

Überprüfe Verbindung:
```bash
docker ps | grep bloodpressure-db
```

### Option B: Lokale PostgreSQL Installation

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Linux (Ubuntu/Debian)
sudo apt-get install postgresql-15
sudo systemctl start postgresql

# Windows
# Download von https://www.postgresql.org/download/windows/
```

Erstelle die Datenbank:
```bash
psql -U postgres -c "CREATE DATABASE bloodpressure;"
```

---

## 3. Backend starten

```bash
cd server

# Dependencies installieren (nur beim ersten Mal)
npm install

# Environment konfigurieren
cp .env.example .env
# Editiere .env falls nötig (Standard-Werte sind für localhost Development)
cat .env

# Development Server mit Auto-Reload starten
npm run dev
```

**Expected Output:**
```
Initializing database...
✓ Database initialized successfully
✓ Server running on http://localhost:3000
✓ API available at http://localhost:3000/api/measurements
✓ Health check at http://localhost:3000/health
```

### Backend-Befehle

```bash
npm run dev      # Development (mit Reload)
npm run build    # TypeScript kompilieren
npm run start    # Production-Mode
```

---

## 4. Frontend starten

**Terminal 2** (während Backend läuft):

```bash
cd client

# Dependencies installieren (nur beim ersten Mal)
npm install

# Development Server mit Hot-Reload starten
npm run dev
```

**Expected Output:**
```
  VITE v8.0.8  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

Öffne: **`http://localhost:5173`**

### Frontend-Befehle

```bash
npm run dev      # Development Server (Hot Module Reloading)
npm run build    # Production Build
npm run preview  # Preview Production Build
```

---

## 5. API testen

**Terminal 3** (während beide Server laufen):

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{"status":"ok","timestamp":"2026-04-10T22:00:00.000Z"}
```

### Neue Messung erstellen
```bash
curl -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "measured_at": "2026-04-10T21:30:00Z",
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72,
    "notes": "Morning reading"
  }'
```

### Alle Messungen abrufen
```bash
curl http://localhost:3000/api/measurements
```

### CSV exportieren
```bash
curl http://localhost:3000/api/measurements/export/csv -o measurements.csv
cat measurements.csv
```

---

## 6. Full E2E Test

1. **Frontend öffnet sich automatisch** auf `http://localhost:5173`
2. **Fülle das Formular aus:**
   - Date & Time: jetzt
   - Systolic: 120
   - Diastolic: 80
   - Pulse: 72
   - Notes: "Test"
3. **Klicke "Save Measurement"**
4. **Success-Message sollte grün angezeigt werden**
5. **Messung sollte in der History-List erscheinen**
6. **Klicke "Export as CSV"** → CSV-Download
7. **Öffne die CSV-Datei** und überprüfe die Daten

---

## 7. Environment-Variablen

### Server (`.env`)
```env
# Datenbank
DB_HOST=localhost          # oder container name 'postgres'
DB_PORT=5432
DB_NAME=bloodpressure
DB_USER=postgres
DB_PASSWORD=postgres       # NICHT in production verwenden!

# Server
NODE_ENV=development
API_PORT=3000
CORS_ORIGIN=http://localhost:3000
```

### Client (`.env`)
```env
REACT_APP_API_URL=http://localhost:3000/api
# oder für Vite:
VITE_API_URL=http://localhost:3000/api
```

---

## 8. Database Debugging

### Verbinde dich direkt mit PostgreSQL

```bash
# Mit docker exec (wenn Docker läuft)
docker exec -it bloodpressure-db psql -U postgres -d bloodpressure

# Oder lokal (wenn PostgreSQL lokal installiert)
psql -U postgres -d bloodpressure
```

### Nützliche SQL Commands

```sql
-- Alle Messungen anzeigen
SELECT * FROM measurements;

-- Messungen zählen
SELECT COUNT(*) FROM measurements;

-- Messungen nach Datum sortiert
SELECT * FROM measurements ORDER BY measured_at DESC;

-- Letzten Index checken
SELECT MAX(id) FROM measurements;

-- Alles löschen (für Reset)
DELETE FROM measurements;

-- Schema überprüfen
\d measurements
```

---

## 9. Troubleshooting

### Backend startet nicht
```bash
# Port 3000 bereits in Verwendung
lsof -i :3000
kill -9 <PID>

# Oder anderen Port verwenden
API_PORT=3001 npm run dev
```

### Datenbankverbindung fehlgeschlagen
```bash
# Überprüfe PostgreSQL läuft
docker ps | grep postgres
# oder
pg_isready -h localhost -p 5432

# Überprüfe .env Credentials
cat server/.env
```

### Frontend verbindet sich nicht mit Backend
```bash
# Überprüfe Backend läuft
curl http://localhost:3000/health

# Überprüfe CORS in .env
cat server/.env | grep CORS

# Browser-Console checken (F12)
# Sollte keine CORS-Fehler geben
```

### TypeScript Fehler
```bash
cd server
rm -rf dist/
npm run build

cd ../client
rm -rf build/
npm run build
```

---

## 10. Entwicklungs-Workflow

### Typischer Workflow

```bash
# Terminal 1: PostgreSQL (Docker)
docker run -d --name bp-db \
  -e POSTGRES_DB=bloodpressure \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Terminal 2: Backend
cd server && npm run dev

# Terminal 3: Frontend
cd client && npm run dev

# Terminal 4: cURL/Postman für API-Tests
curl http://localhost:3000/api/measurements
```

### VSCode Empfehlungen

Installiere Extensions:
- **Prettier** - Code Formatter
- **ESLint** - JavaScript Linting
- **REST Client** - API Testing direkt in VSCode
- **Thunder Client** - Postman Alternative

### Git-Workflow

```bash
# Neuen Feature Branch erstellen
git checkout -b feature/new-feature

# Changes committen
git add .
git commit -m "Add new feature"

# Push zum Branch
git push origin feature/new-feature

# Pull Request erstellen (GitHub)
```

---

## 11. Performance Tipps

### Frontend
```bash
# Build-Größe überprüfen
npm run build
# Check output in client/build/

# Chrome DevTools:
# - Network Tab: Überprüfe Bundle-Size
# - Lighthouse: Performance-Analyse
```

### Backend
```bash
# Node.js Profiling
node --prof server/dist/index.js

# Memory-Usage überwachen
npm run dev
# Dann in Node CLI: .memory()
```

---

## 12. Nächste Schritte

Wenn alles läuft:

1. **Öffne `http://localhost:5173`** im Browser
2. **Erstelle ein paar Test-Messungen**
3. **Teste Form-Validierung** (ungültige Werte)
4. **Teste CSV-Export**
5. **Überprüfe Responsive Design** (F12 → Device Mode)
6. **Checke Logs** bei Fehlern

Danach: Weiter zu [DEPLOYMENT.md](./DEPLOYMENT.md) für Synology NAS Setup!

---

## Support

Bei Problemen:
1. Überprüfe [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Schaue Browser-Console (F12)
3. Überprüfe Server-Logs im Terminal
4. Überprüfe `.env` Variablen
5. Versuche alles neu zu starten
