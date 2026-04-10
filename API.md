# Blood Pressure Tracker - API Reference

Vollständige API-Dokumentation mit Beispielen

---

## Overview

| Basis URL | Methode | Endpoint | Beschreibung |
|-----------|---------|----------|------------|
| `http://localhost:3000` | GET | `/health` | Health Check |
| `http://localhost:3000` | POST | `/api/measurements` | Neue Messung erstellen |
| `http://localhost:3000` | GET | `/api/measurements` | Alle Messungen abrufen |
| `http://localhost:3000` | GET | `/api/measurements/:id` | Messung abrufen |
| `http://localhost:3000` | GET | `/api/measurements/export/csv` | Alle Messungen als CSV |

---

## Health Check

### Endpoint
```
GET /health
```

### Beschreibung
Überprüft dass der Server erreichbar ist

### cURL Beispiel
```bash
curl http://localhost:3000/health
```

### Response (200 OK)
```json
{
  "status": "ok",
  "timestamp": "2026-04-10T21:30:00.000Z"
}
```

---

## Neue Messung erstellen

### Endpoint
```
POST /api/measurements
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "measured_at": "2026-04-10T21:30:00Z",
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "notes": "Optional notes"
}
```

### Parameter

| Name | Typ | Required | Range | Beschreibung |
|------|-----|----------|-------|------------|
| `measured_at` | String (ISO 8601) | ✓ | - | Zeitstempel der Messung |
| `systolic` | Integer | ✓ | 50-300 | Systolischer Druck (mmHg) |
| `diastolic` | Integer | ✓ | 30-200 | Diastolischer Druck (mmHg) |
| `pulse` | Integer | ✗ | 20-250 | Herzfrequenz (bpm) |
| `notes` | String | ✗ | - | Beliebige Notizen |

### Validierungsregeln

```
- systolic: 50 ≤ systolic ≤ 300 mmHg
- diastolic: 30 ≤ diastolic ≤ 200 mmHg
- pulse (optional): 20 ≤ pulse ≤ 250 bpm
- measured_at: Valid ISO 8601 timestamp
```

### cURL Beispiel - Valid

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

### cURL Beispiel - Minimal (nur erforderliche Felder)

```bash
curl -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "measured_at": "2026-04-10T21:30:00Z",
    "systolic": 120,
    "diastolic": 80
  }'
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "measured_at": "2026-04-10T21:30:00+00:00",
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72,
    "notes": "Morning reading",
    "created_at": "2026-04-10T21:30:00+00:00",
    "updated_at": "2026-04-10T21:30:00+00:00"
  }
}
```

### Error Response (400 Bad Request)

**Fehler: Systolic zu niedrig**
```bash
curl -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "measured_at": "2026-04-10T21:30:00Z",
    "systolic": 40,
    "diastolic": 80
  }'
```

Response:
```json
{
  "success": false,
  "error": "systolic must be between 50 and 300 mmHg"
}
```

**Fehler: Missing required field**
```bash
curl -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "measured_at": "2026-04-10T21:30:00Z",
    "systolic": 120
  }'
```

Response:
```json
{
  "success": false,
  "error": "diastolic is required"
}
```

---

## Alle Messungen abrufen

### Endpoint
```
GET /api/measurements
```

### Query Parameter (optional)

| Name | Typ | Beschreibung | Beispiel |
|------|-----|------------|---------|
| `limit` | Integer | Max. Anzahl Ergebnisse | `?limit=10` |
| `offset` | Integer | Offset für Pagination | `?limit=10&offset=20` |

### cURL Beispiele

**Alle Messungen**
```bash
curl http://localhost:3000/api/measurements
```

**Mit Pagination (10 pro Seite)**
```bash
curl http://localhost:3000/api/measurements?limit=10&offset=0
```

**Nur letzte 5 Messungen**
```bash
curl http://localhost:3000/api/measurements?limit=5
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "measured_at": "2026-04-10T21:30:00+00:00",
      "systolic": 122,
      "diastolic": 82,
      "pulse": 75,
      "notes": "Evening reading",
      "created_at": "2026-04-10T21:35:00+00:00",
      "updated_at": "2026-04-10T21:35:00+00:00"
    },
    {
      "id": 2,
      "measured_at": "2026-04-10T07:15:00+00:00",
      "systolic": 118,
      "diastolic": 78,
      "pulse": 68,
      "notes": null,
      "created_at": "2026-04-10T07:20:00+00:00",
      "updated_at": "2026-04-10T07:20:00+00:00"
    },
    {
      "id": 1,
      "measured_at": "2026-04-09T20:00:00+00:00",
      "systolic": 125,
      "diastolic": 82,
      "pulse": 75,
      "notes": "After exercise",
      "created_at": "2026-04-09T20:05:00+00:00",
      "updated_at": "2026-04-09T20:05:00+00:00"
    }
  ]
}
```

**Sortierung:** Neueste zuerst (descending by `measured_at`)

---

## Messung abrufen (nach ID)

### Endpoint
```
GET /api/measurements/:id
```

### Parameter

| Name | Typ | Required | Beschreibung |
|------|-----|----------|------------|
| `id` | Integer | ✓ | Measurement ID |

### cURL Beispiel

```bash
curl http://localhost:3000/api/measurements/1
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "measured_at": "2026-04-09T20:00:00+00:00",
    "systolic": 125,
    "diastolic": 82,
    "pulse": 75,
    "notes": "After exercise",
    "created_at": "2026-04-09T20:05:00+00:00",
    "updated_at": "2026-04-09T20:05:00+00:00"
  }
}
```

### Error Response (404 Not Found)

```bash
curl http://localhost:3000/api/measurements/999
```

Response:
```json
{
  "success": false,
  "error": "Measurement not found"
}
```

---

## CSV Export

### Endpoint
```
GET /api/measurements/export/csv
```

### Beschreibung
Exportiert alle Messungen als CSV-Datei

### cURL Beispiel

```bash
curl http://localhost:3000/api/measurements/export/csv -o measurements.csv
```

### Response (200 OK)

**Header:**
```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="blood-pressure-export-2026-04-10.csv"
```

**Body (CSV Format):**
```csv
ID,Date,Time,Systolic (mmHg),Diastolic (mmHg),Pulse (bpm),Notes,Created At
1,2026-04-09,20:00:00,125,82,75,"After ""exercise"", high reading",2026-04-09T20:05:00+00:00
2,2026-04-10,07:15:00,118,78,68,,2026-04-10T07:20:00+00:00
3,2026-04-10,21:30:00,122,82,75,"Morning reading",2026-04-10T21:35:00+00:00
```

### Spezifikationen

- **Separator:** Komma (`,`)
- **Zeilenende:** LF (`\n`)
- **Encoding:** UTF-8
- **Datum-Format:** YYYY-MM-DD
- **Zeit-Format:** HH:MM:SS
- **Quoted Fields:** Kommas/Zeilenumbrüche/Quotes werden korrekt escaped
- **Filename:** `blood-pressure-export-YYYY-MM-DD.csv`

### CSV öffnen in Excel

1. **Excel öffnen**
2. **File** → **Open**
3. **CSV-Datei auswählen**
4. **CSV Import Dialog:**
   - Delimiter: **Comma**
   - Encoding: **UTF-8**
   - Klick **Load**

---

## Error Handling

### Standard Error Format

```json
{
  "success": false,
  "error": "Description of error"
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | OK | GET successful |
| `201` | Created | POST successful |
| `400` | Bad Request | Validation error |
| `404` | Not Found | Resource doesn't exist |
| `500` | Server Error | Database error |

### Häufige Fehler

**400 - Missing required field**
```json
{"success": false, "error": "systolic is required"}
```

**400 - Out of range**
```json
{"success": false, "error": "systolic must be between 50 and 300 mmHg"}
```

**400 - Invalid date**
```json
{"success": false, "error": "measured_at must be a valid ISO 8601 timestamp"}
```

**404 - Not found**
```json
{"success": false, "error": "Measurement not found"}
```

**500 - Server error**
```json
{"success": false, "error": "Internal Server Error"}
```

---

## Testing mit Postman/Insomnia

### Import cURL Collections

```bash
# Speichere folgende Sammlung in Postman/Insomnia
```

**Health Check**
```
GET http://localhost:3000/health
```

**Create Measurement**
```
POST http://localhost:3000/api/measurements
Content-Type: application/json

{
  "measured_at": "{{date_iso8601}}",
  "systolic": 120,
  "diastolic": 80,
  "pulse": 72,
  "notes": "Test"
}
```

**Get All Measurements**
```
GET http://localhost:3000/api/measurements
```

**Get Measurement by ID**
```
GET http://localhost:3000/api/measurements/1
```

**Export CSV**
```
GET http://localhost:3000/api/measurements/export/csv
```

---

## Rate Limiting

Aktuell: **Keine Rate-Limits**

Bei zukünftigen Updates können Rate-Limits hinzugefügt werden:
- 100 requests/minute per IP
- 1000 requests/hour per IP

---

## Versioning

Aktuelle API Version: **v1** (implizit)

Zukünftige Versionen könnten sein:
- `/api/v1/measurements`
- `/api/v2/measurements`

---

## Rate Limiting & Quotas

Aktuell: Keine Limits

---

## Support & Debugging

### Logs anschauen
```bash
docker compose logs app
```

### Debug-Mode
```bash
NODE_ENV=development npm run dev
```

### API-Testing
```bash
# Rest Client VSCode Extension
# Erstelle .rest file mit Endpoints
```

---

## SDKs & Clients

Bestehende Clients:
- **Browser** (Vite React App)
- **cURL / Postman**

Zukünftige Clients könnten sein:
- **Python Client Library**
- **Node.js Client Library**
- **JavaScript SDK**
