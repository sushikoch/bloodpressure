# Blood Pressure Tracker - Deployment Guide für Synology NAS

Schritt-für-Schritt Anleitung für Production-Deployment auf Synology NAS

## Prerequisites

- **Synology NAS** mit DSM 7.0+
- **Docker Package** installiert
- **SSH-Zugang** zum NAS (aktiviert in Control Panel)
- **Lokales Netzwerk** zugänglich
- **Dieser Repository** auf dem NAS oder lokal zum Uploaden

---

## 1. SSH zum NAS verbinden

```bash
# Finde NAS IP-Adresse
# Control Panel → Info Center → IP-Adresse notieren

ssh admin@192.168.x.x
# oder mit anderen Credentials
ssh your-username@192.168.x.x
```

---

## 2. Projektverzeichnis vorbereiten

```bash
# Auf dem NAS
cd /volume1/docker/
mkdir -p bloodpressure
cd bloodpressure

# Option A: Mit git (wenn Git auf NAS installiert)
git clone https://github.com/sushikoch/bloodpressure.git .

# Option B: Mit SCP vom lokalen Machine
# Auf lokalem Rechner:
scp -r /path/to/bloodpressure admin@192.168.x.x:/volume1/docker/bloodpressure/
```

---

## 3. Environment vorbereiten

```bash
# Auf dem NAS
cd /volume1/docker/bloodpressure

# Kopiere .env Vorlage
cp server/.env.example server/.env

# Editiere .env für Production
vi server/.env
# oder nano statt vi
```

**Produktions-Environment (.env):**
```env
# Datenbank
DB_HOST=postgres           # Container name (wichtig!)
DB_PORT=5432
DB_NAME=bloodpressure
DB_USER=postgres
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE  # ÄNDERN!

# Server
NODE_ENV=production
API_PORT=3000
CORS_ORIGIN=http://192.168.x.x:3000   # NAS IP anpassen!
```

---

## 4. docker-compose.yml überprüfen

Stelle sicher, dass `docker-compose.yml` korrekt ist:

```bash
cat docker-compose.yml
```

**Wichtige Einstellungen überprüfen:**
- ✓ `postgres` Service mit Health-Check
- ✓ `app` Service mit `depends_on`
- ✓ Volumes für Datenpersistenz
- ✓ Port 3000 exposed
- ✓ Environment-Variablen gesetzt

---

## 5. Docker Images bauen

```bash
# Im bloodpressure Verzeichnis
docker compose build

# Überprüfe erfolgreicher Build
docker images | grep bloodpressure
```

**Expected Output:**
```
REPOSITORY                    TAG       IMAGE ID
bloodpressure-app            latest    abc123xyz...
postgres                      15-alpine def456uvw...
```

---

## 6. Container starten

```bash
# Starte beide Services
docker compose up -d

# Überprüfe Status
docker compose ps
```

**Expected Output:**
```
NAME                STATUS              PORTS
bloodpressure-db    Up 2 seconds        5432/tcp
bloodpressure-app   Up 1 second         0.0.0.0:3000->3000/tcp
```

---

## 7. Health Check

```bash
# Überprüfe dass Server antwortet
curl http://localhost:3000/health

# Response sollte sein:
# {"status":"ok","timestamp":"2026-04-10T..."}
```

---

## 8. Zugang vom iPhone

### Finde NAS IP-Adresse

```bash
# Im NAS Terminal
hostname -I
# oder schaue in Control Panel → Info Center
```

### Öffne im iPhone Safari

1. Öffne **Safari** auf iPhone
2. Gib folgende URL ein: `http://192.168.x.x:3000`
   - Ersetze `192.168.x.x` mit deiner NAS IP!
3. Bookmark speichern für schnellen Zugriff

**Sollte anzeigen:**
- 🩺 Blood Pressure Tracker Header
- Input-Formular
- History-Liste (leer beim ersten Mal)

---

## 9. Test-Daten erstellen

```bash
# Erstelle Test-Messung (vom lokalen Rechner)
curl -X POST http://192.168.x.x:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "measured_at": "2026-04-10T21:30:00Z",
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72,
    "notes": "Test from NAS"
  }'

# Überprüfe dass Daten gespeichert wurden
curl http://192.168.x.x:3000/api/measurements
```

---

## 10. Logs anschauen

```bash
# Live Logs von beiden Services
docker compose logs -f

# Nur App-Logs
docker compose logs -f app

# Nur Database-Logs
docker compose logs -f postgres

# Beende mit Ctrl+C
```

---

## 11. Updates & Restarts

### Container neu starten
```bash
docker compose restart app
```

### Alle Container neu starten
```bash
docker compose restart
```

### Komplettes Shutdown
```bash
docker compose down
```

### Code-Änderungen deployen

```bash
# 1. Hole neueste Version
cd /volume1/docker/bloodpressure
git pull origin main

# 2. Baue neu (falls Code-Änderungen)
docker compose build

# 3. Starte neu
docker compose up -d

# 4. Überprüfe Logs
docker compose logs -f app
```

---

## 12. Backups

### Database-Backup erstellen

```bash
# Auf dem NAS
mkdir -p /volume1/docker/backups

# Backup erstellen
docker compose exec postgres pg_dump \
  -U postgres \
  -d bloodpressure > /volume1/docker/backups/backup-$(date +%Y%m%d-%H%M%S).sql

# Überprüfe Backup
ls -lh /volume1/docker/backups/
```

### Automated Daily Backup (optional)

Erstelle `/volume1/docker/bloodpressure/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/volume1/docker/backups"
mkdir -p $BACKUP_DIR
FILENAME="$BACKUP_DIR/bp-backup-$(date +\%Y\%m\%d-\%H\%M\%S).sql"

cd /volume1/docker/bloodpressure
docker compose exec -T postgres pg_dump \
  -U postgres \
  -d bloodpressure > $FILENAME

echo "Backup created: $FILENAME"

# Alte Backups löschen (älter als 7 Tage)
find $BACKUP_DIR -name "bp-backup-*.sql" -mtime +7 -delete
```

Mache das Script ausführbar:
```bash
chmod +x backup.sh
```

Cron-Job erstellen (in Control Panel → Task Scheduler):
```bash
# Täglich um 2 Uhr nachts
0 2 * * * /volume1/docker/bloodpressure/backup.sh
```

---

## 13. Datapersistenz überprüfen

```bash
# Überprüfe Docker Volume
docker volume ls | grep bloodpressure

# Überprüfe Volume-Größe
docker volume inspect bloodpressure_postgres_data

# Überprüfe dass Daten persistent sind:
# 1. Erstelle Messung
# 2. Stoppe Container: docker compose down
# 3. Starte Container: docker compose up -d
# 4. Überprüfe dass Messung noch da ist: curl http://localhost:3000/api/measurements
```

---

## 14. Ports & Firewall

### Port freigeben (falls nötig)

Synology Control Panel:
1. **Network** → **Port Settings**
2. **Create** neuen Rule:
   - **Service**: Custom
   - **Port**: 3000
   - **Type**: TCP
   - **Internal Port**: 3000

### Firewall (falls aktiviert)

1. **Control Panel** → **Security** → **Firewall**
2. **Edit Rules**
3. Stelle sicher Port 3000 ist allowed

---

## 15. Monitoring

### CPU/Memory-Usage anschauen
```bash
docker stats
```

### Container Logs überwachen
```bash
# Lösche alte Logs (fallback)
docker compose logs --tail 100 app

# Real-time Monitoring
watch -n 5 'docker compose ps'
```

### Health-Check Status
```bash
docker compose ps
# Status sollte "Up" sein für beide Container
```

---

## 16. Troubleshooting

### Container starten nicht

```bash
# Schaue Logs
docker compose logs

# Überprüfe Port 3000 nicht in Verwendung
netstat -tuln | grep 3000

# Starte neu
docker compose down
docker compose up -d
```

### Datenbank-Fehler

```bash
# Überprüfe DB läuft
docker compose exec postgres pg_isready

# Überprüfe .env Credentials
cat server/.env | grep DB_

# Schaue DB-Logs
docker compose logs postgres
```

### Vom iPhone nicht erreichbar

```bash
# Überprüfe NAS IP
hostname -I

# Überprüfe dass iPhone im gleichen Netzwerk ist
# (Nicht über VPN verbunden)

# Ping vom iPhone aus:
# - Öffne Terminal-App
# - ping 192.168.x.x
```

### Performance-Probleme

```bash
# Überprüfe System-Resources
docker stats

# Überprüfe DB-Query Performance
docker compose exec postgres \
  psql -U postgres -d bloodpressure \
  -c "SELECT COUNT(*) FROM measurements;"
```

---

## 17. Security (Optional)

### HTTPS aktivieren

Empfohlen für Production. Nutze Reverse-Proxy (z.B. nginx) mit Self-Signed Cert:

```bash
# Self-Signed Certificate generieren
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

Dann nginx container hinzufügen mit SSL-Proxy.

### Password für PostgreSQL

```bash
# Ändere Password
docker compose exec postgres \
  psql -U postgres \
  -c "ALTER USER postgres WITH PASSWORD 'new_secure_password';"

# Aktualisiere .env
vi server/.env
# DB_PASSWORD=new_secure_password

# Restart
docker compose restart app
```

---

## 18. Nächste Schritte

- ✅ Datenbank arbeitet
- ✅ API antwortet
- ✅ Frontend erreichbar vom iPhone
- ✅ CSV-Export funktioniert
- ✅ Daten persistent

Jetzt:
1. **Nutze die App täglich** zum Sammeln von Daten
2. **Exportiere CSV monatlich** für Backup
3. **Überprüfe Logs wöchentlich** auf Fehler
4. **Mache regelmäßig Backups**

---

## Support

Bei Problemen:
- Überprüfe [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Schaue Logs: `docker compose logs -f`
- Überprüfe Netzwerk-Verbindung
- Stelle sicher Port 3000 ist open
