# Blood Pressure Tracker - API Testing Guide

## Prerequisites

- Node.js + npm (Server installed)
- PostgreSQL (running locally or via Docker)
- Server built: `npm run build` in `/server`
- Client built: `npm run build` in `/client`

## Running Locally

### 1. Start PostgreSQL (Docker)

```bash
docker run -d \
  --name bloodpressure-db \
  -e POSTGRES_DB=bloodpressure \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. Start the Server

```bash
cd server
npm run dev  # starts with nodemon
```

Server starts on `http://localhost:3000`

### 3. Test API Endpoints

#### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-04-10T21:30:00.000Z"}
```

#### POST - Create Measurement
```bash
curl -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "measured_at": "2026-04-10T21:30:00Z",
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72,
    "notes": "Normal reading"
  }'
```

Expected response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "measured_at": "2026-04-10T21:30:00+00:00",
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72,
    "notes": "Normal reading",
    "created_at": "2026-04-10T21:30:00+00:00",
    "updated_at": "2026-04-10T21:30:00+00:00"
  }
}
```

#### GET - List All Measurements
```bash
curl http://localhost:3000/api/measurements
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "measured_at": "2026-04-10T21:30:00+00:00",
      "systolic": 120,
      "diastolic": 80,
      "pulse": 72,
      "notes": "Normal reading",
      "created_at": "2026-04-10T21:30:00+00:00",
      "updated_at": "2026-04-10T21:30:00+00:00"
    }
  ]
}
```

#### GET - Export CSV
```bash
curl http://localhost:3000/api/measurements/export/csv -o measurements.csv
cat measurements.csv
```

Expected CSV format:
```
ID,Date,Time,Systolic (mmHg),Diastolic (mmHg),Pulse (bpm),Notes,Created At
1,2026-04-10,21:30:00,120,80,72,Normal reading,2026-04-10T21:30:00+00:00
```

## Frontend Testing

### 1. Development Server (with Vite)

```bash
cd client
npm run dev
```

Opens at `http://localhost:5173` with hot module reloading

### 2. Production Build Test

```bash
# Build client
cd client
npm run build

# Start server (will serve built client)
cd ../server
npm run start
```

Access at `http://localhost:3000`

## Manual Testing Checklist

### Form Input
- [ ] Date/Time field accepts datetime input
- [ ] Systolic/Diastolic fields accept valid values (50-300, 30-200)
- [ ] Pulse field optional but validates when filled
- [ ] Notes field accepts free text
- [ ] Form validates on submit
- [ ] Error messages display for invalid input

### History List
- [ ] Measurements display in reverse chronological order
- [ ] Date/time formatted correctly
- [ ] All fields (systolic, diastolic, pulse, notes) display if present
- [ ] List scrolls on mobile
- [ ] Empty state shows when no measurements

### Export
- [ ] Export button downloads CSV file
- [ ] CSV filename includes date
- [ ] CSV contains all measurements
- [ ] CSV format is correct (headers, escaped values)

### Mobile (iPhone Safari)
- [ ] Viewport fits without horizontal scroll
- [ ] Touch targets minimum 44px
- [ ] Numeric keyboards appear for number inputs
- [ ] No layout breaks on screen rotation
- [ ] Can submit form and see results

## Troubleshooting

### "Cannot connect to database"
- Ensure PostgreSQL is running
- Check `.env` DB credentials
- Verify migrations ran: `psql -U postgres -d bloodpressure -c "SELECT * FROM measurements;"`

### "Client build not found"
- Run `npm run build` in `/client`
- Check that `/server/../client/build` exists

### CORS errors in browser
- Check `CORS_ORIGIN` in `.env`
- For development, use `CORS_ORIGIN=*` or `http://localhost:3000`

### TypeScript build errors
- Delete `dist/` folder: `rm -rf server/dist`
- Rebuild: `npm run build`

## API Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Description of error"
}
```

### Common Status Codes
- `200 OK` - Successful GET
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Database or server error
