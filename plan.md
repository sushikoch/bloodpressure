# DETAILLIERTER IMPLEMENTIERUNGSPLAN: BLOOD PRESSURE TRACKER

## Overview
Ein persönliche, mobile-freundliche Webanwendung zum Protokollieren von Blutdruckmessungen mit iPhone Safari-Zugriff und CSV-Export.

---

## PHASE 1: PROJEKTINITIALISIERUNG & SETUP (Tag 1)

**Ziel:** Projektstruktur erstellen, Dependencies installieren, Dev-Umgebung konfigurieren

### Schritt 1.1: Backend-Verzeichnisstruktur
```
bloodpressure/
├── server/
│   ├── src/
│   │   ├── index.ts (Haupteinstiegspunkt)
│   │   ├── config/
│   │   │   └── database.ts (PostgreSQL-Verbindung)
│   │   ├── routes/
│   │   │   └── measurements.ts (API-Endpoints)
│   │   ├── controllers/
│   │   │   └── measurementController.ts
│   │   ├── services/
│   │   │   └── measurementService.ts (Business Logic)
│   │   ├── models/
│   │   │   └── Measurement.ts (TypeScript Interfaces)
│   │   └── utils/
│   │       └── csvExporter.ts (CSV-Logik)
│   ├── migrations/
│   │   └── 001_create_measurements_table.sql
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── client/ (React)
│   ├── src/
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── MeasurementForm.tsx
│   │   │   ├── HistoryList.tsx
│   │   │   └── ExportButton.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── styles/
│   │   │   └── App.css
│   │   └── types/
│   │       └── measurement.ts
│   └── package.json
├── docker-compose.yml
├── Dockerfile
├── plan.md
└── .gitignore
```

### Schritt 1.2: Backend Initialisierung
- `npm init -y` im `/server` Verzeichnis
- **Dependencies installieren:**
  ```
  npm install express pg dotenv cors helmet
  npm install --save-dev typescript @types/express @types/node ts-node nodemon
  ```
- `tsconfig.json` erstellen für TypeScript-Konfiguration
- `.env.example` mit Platzhaltern

### Schritt 1.3: Frontend Initialisierung
- `npx create-react-app client --template typescript`
- Viewport-Meta für iPhone konfigurieren
- `.env.example` für API-URL

---

## PHASE 2: DATENBANKSCHEMA & PERSISTENCE (Tag 1-2)

### Schritt 2.1: Migrations-Datei erstellen
```sql
CREATE TABLE IF NOT EXISTS measurements (
  id SERIAL PRIMARY KEY,
  measured_at TIMESTAMPTZ NOT NULL,
  systolic INTEGER NOT NULL CHECK (systolic > 0 AND systolic < 300),
  diastolic INTEGER NOT NULL CHECK (diastolic > 0 AND diastolic < 200),
  pulse INTEGER CHECK (pulse IS NULL OR (pulse > 0 AND pulse < 250)),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_measurements_measured_at ON measurements(measured_at DESC);
CREATE INDEX idx_measurements_created_at ON measurements(created_at DESC);
```

### Schritt 2.2: Datenbankverbindung implementieren
- Pool-Verwaltung mit `pg.Pool`
- Fehlerbehandlung für Verbindungsausfälle
- Initialisierungsfunktion für DB-Setup

### Schritt 2.3: Datenbank-Initialisierungs-Skript
- Liest Migrations-Dateien und führt SQL aus

---

## PHASE 3: BACKEND API IMPLEMENTATION (Tag 2-3)

### Schritt 3.1: Datenmodelle & Typen
```typescript
interface Measurement {
  id: number;
  measured_at: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### Schritt 3.2: Service-Layer
- `createMeasurement(input)` - Validierung + DB-Insert
- `getAllMeasurements(options)` - Alle Messungen abrufen
- `getMeasurementsByDateRange(from, to)` - Filterung nach Datum

**Validierungsregeln:**
- Systolisch: 50-300 mmHg
- Diastolisch: 30-200 mmHg
- Puls (optional): 20-250 bpm

### Schritt 3.3: API-Routes
| Endpoint | Methode | Logik | Status |
|----------|---------|-------|--------|
| `/api/measurements` | POST | Neue Messung validieren + speichern | 201 Created |
| `/api/measurements` | GET | Alle Messungen abrufen | 200 OK |
| `/api/export/csv` | GET | Alle Messungen als CSV downloaden | 200 + CSV |

**Error-Handling:**
- 400 Bad Request (Validierungsfehler)
- 500 Internal Server Error (DB-Fehler)

### Schritt 3.4: CSV-Export-Utility
- Konvertiert Measurement-Array zu CSV
- Header: `ID,Date,Time,Systolic,Diastolic,Pulse,Notes,CreatedAt`
- Dateiname: `blood-pressure-export-YYYY-MM-DD.csv`

### Schritt 3.5: Express Server Setup
- Express App mit Middleware: `express.json()`, `cors()`, `helmet()`
- Routes registrieren
- Static Files für React Build: `express.static()`
- Error-Handler Middleware

---

## PHASE 4: FRONTEND IMPLEMENTATION (Tag 3-4)

### Schritt 4.1: API-Client Service
- `postMeasurement(data)` - POST zu `/api/measurements`
- `getMeasurements()` - GET `/api/measurements`
- `exportCSV()` - GET `/api/export/csv`
- Error-Handling mit Retry-Logik

### Schritt 4.2: Komponente: MeasurementForm
**Features:**
- Input-Felder (mobile-optimiert)
- Standard-Wert: aktuelle Zeit
- Validierungs-Feedback (inline Errors)
- Success-Toast nach erfolgreichem Submit
- Tap-targets mindestens 44px Höhe

### Schritt 4.3: Komponente: HistoryList
- Listet Messungen neueste zuerst
- Scrollable mit virtualisierung
- Empty State: "Noch keine Messungen"
- Card-basiertes Layout

### Schritt 4.4: Komponente: ExportButton
- Triggert CSV-Download
- Loading-State während Download
- Error-Handling

### Schritt 4.5: App-Komponente & State Management
- React State mit `measurements`, `loading`, `error`
- useEffect für Initial Data Load
- Layout: Form oben, Liste unten

### Schritt 4.6: Styling & Responsive Design
- Mobile-First CSS
- Breakpoints: Mobile, Tablet, Desktop
- Font-Sizing für mobile Readability

---

## PHASE 5: INTEGRATION & TESTING (Tag 4)

### Schritt 5.1: Frontend Build-Prozess
- npm run build für Client

### Schritt 5.2: Manuelle Integration Tests
- React + Backend zusammen testen
- API-Endpoints validieren
- Mobile Safari Viewport

### Schritt 5.3: Error-Cases testen
- Ungültige Eingabewerte
- Fehlende Pflichtfelder
- DB-Verbindung unterbrochen

---

## PHASE 6: DOCKER-DEPLOYMENT (Tag 5)

### Schritt 6.1: Dockerfile für Node.js App
```dockerfile
FROM node:18-alpine
WORKDIR /app
# ... Installation und Build
EXPOSE 3000
CMD ["npm", "start"]
```

### Schritt 6.2: docker-compose.yml
- PostgreSQL Service mit persistentem Volume
- App Service mit Abhängigkeiten
- Health-Checks

### Schritt 6.3: Build & Test mit Docker Compose
```bash
docker-compose build
docker-compose up
```

---

## PHASE 7: SYNOLOGY NAS DEPLOYMENT (Tag 5-6)

### Schritt 7.1: Vorbereitung
- Docker auf NAS aktivieren
- Projekt-Dateien auf NAS kopieren

### Schritt 7.2: Deployment
```bash
docker-compose up -d
```

### Schritt 7.3: Zugang vom iPhone
- NAS lokale IP ermitteln
- Im iPhone Safari: `http://<NAS-IP>:3000`

---

## PHASE 8: VALIDIERUNG & PRODUKTIONSOPTIMIERUNG (Tag 6-7)

### Schritt 8.1: Performance-Optimierungen
**Frontend:**
- React.lazy() für Code-Splitting
- Memoisierung mit `React.memo()`
- CSS-Minification

**Backend:**
- Query-Optimierungen (Indizes)
- Pagination für große Listen
- Caching (optional: Redis)

### Schritt 8.2: Sicherheit
- Input Validation mit `validator.js`
- CORS richtig konfigurieren
- Environment Variables für Secrets
- SQL-Injection-Schutz durch Parameterisierung

### Schritt 8.3: Fehlerbehandlung & Logging
- Logger-Library: `winston` oder `pino`
- Error-Boundaries für React
- Struktur: Timestamp, Level, Message

### Schritt 8.4: Datensicherung
- PostgreSQL Volume regelmäßig backupen
- Tägliche Backups auf NAS
- CSV-Export nutzen

---

## PHASE 9: DOKUMENTATION & INBETRIEBNAHME (Tag 7)

### Schritt 9.1: Dokumentation erstellen
- `/README.md` - Projekt-Übersicht
- `/SETUP.md` - Entwicklungs-Setup
- `/DEPLOYMENT.md` - Synology NAS Deployment
- `/API.md` - API-Dokumentation
- `/TROUBLESHOOTING.md` - Häufige Probleme

### Schritt 9.2: GitHub Actions CI/CD (optional)
- Automated Tests
- Build & Push Docker
- Deployment (optional)

### Schritt 9.3: Monitoring & Alerts (optional)
- Health-Check Endpoint: `GET /health`
- Prometheus-Metriken
- Logs in `/var/log/bloodpressure/`

---

## ARCHITEKTUR-ENTSCHEIDUNGEN

### 1. **TypeScript vs. JavaScript**
- **Entscheidung:** TypeScript für Backend
- **Begründung:** Type-Safety, bessere IDE-Unterstützung

### 2. **ORM vs. Raw SQL**
- **Entscheidung:** Raw `pg` Library + TypeScript Interfaces
- **Begründung:** Einfaches Projekt, minimale Dependencies

### 3. **State Management (Frontend)**
- **Entscheidung:** React Hooks (useState, useEffect)
- **Begründung:** Kleine App, kein komplexer globaler State

### 4. **Datenbank-Persistenz**
- **Entscheidung:** Docker Named Volume
- **Begründung:** Persistent über Container-Restarts

### 5. **Frontend-Serving**
- **Entscheidung:** React Build als Static Files vom Express Server
- **Begründung:** Einfaches Deployment

---

## TESTING-STRATEGIE

### Unit Tests (Optional)
- **Backend:** Jest
- **Frontend:** Jest + React Testing Library

### Integration Tests
- Postman Collection oder Supertest

### End-to-End Tests
- Cypress oder Playwright

---

## HÄUFIGE FALLSTRICKE & LÖSUNGEN

| Problem | Ursache | Lösung |
|---------|--------|--------|
| CORS-Fehler | Frontend & Backend auf verschiedenen Origins | CORS-Middleware korrekt konfigurieren |
| DB-Verbindung fehlgeschlagen | DB noch nicht bereit beim Start | `depends_on` mit `healthcheck` |
| Responsive Layout bricht | Fehlende Viewport-Meta | `<meta name="viewport" ...>` |
| CSV-Download funktioniert nicht | Wrong Content-Type | `text/csv; charset=utf-8` |
| Timezone-Fehler | DB und App in verschiedenen Timezones | `TIMESTAMPTZ`, UTC in DB |
| Große Listen verlangsamen | Keine Pagination | Pagination implementieren |

---

## ZEITSCHÄTZUNG

| Phase | Aufwand | Abhängigkeiten |
|-------|---------|----------------|
| 1: Projektinitialisierung | 1-2 Stunden | Keine |
| 2: Datenbank | 1-2 Stunden | Phase 1 |
| 3: Backend API | 4-6 Stunden | Phase 2 |
| 4: Frontend | 6-8 Stunden | Phase 3 |
| 5: Integration & Tests | 2-3 Stunden | Phase 4 |
| 6: Docker | 2-3 Stunden | Phase 5 |
| 7: NAS-Deployment | 1-2 Stunden | Phase 6 |
| 8: Optimierung & Sicherheit | 3-4 Stunden | Phase 7 |
| 9: Dokumentation | 2-3 Stunden | Phase 8 |
| **Total** | **22-33 Stunden** | Sequenziell |

---

## CRITICAL FILES FOR IMPLEMENTATION

1. `/server/src/index.ts` - Express Server & Routes
2. `/server/src/config/database.ts` - PostgreSQL Connection Pool
3. `/server/src/services/measurementService.ts` - Business Logic
4. `/client/src/App.tsx` - React Hauptkomponente
5. `/docker-compose.yml` - Docker-Deployment

Diese 5 Dateien sind das Rückgrat der gesamten Anwendung.

---

## MOBILE-FIRST RESPONSIVE DESIGN RICHTLINIEN

### Viewport Konfiguration
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

### Touch-Freundliche Komponenten
- Button/Input Mindesthöhe: 44px
- Mindestabstand zwischen interaktiven Elementen: 8px
- Large Font: `16px` minimum

### Breakpoints
- **Mobile:** `max-width: 767px`
- **Tablet:** `768px - 1023px`
- **Desktop:** `min-width: 1024px`

---

## DEPLOYMENT-CHECKLISTE FÜR SYNOLOGY NAS

- [ ] Docker auf Synology installiert
- [ ] SSH-Zugang konfiguriert
- [ ] `docker-compose.yml` auf NAS kopiert
- [ ] Umgebungsvariablen in `.env` gesetzt
- [ ] PostgreSQL-Passwort geändert
- [ ] Container mit `docker-compose up -d` gestartet
- [ ] Health-Check: `curl http://<NAS-IP>:3000/api/measurements`
- [ ] iPhone Safari: `http://<NAS-IP>:3000` öffnen
- [ ] Test-Messung eingeben
- [ ] CSV-Export testen
- [ ] Daten-Backup einrichten
- [ ] Logs überwachen

---

**Plan erstellt:** April 2026
**Status:** Bereit für Phase 1 Implementation
