# 🤖 CLAUDE.md - AI Assistant Guide for Blood Pressure Tracker

This document explains the codebase structure, development workflows, and key conventions for AI assistants working on this project.

---

## 📋 Project Overview

**Blood Pressure Tracker** is a personal, mobile-friendly web application for recording blood pressure measurements with iPhone Safari support and CSV export functionality.

### Key Goals
- 📱 Optimize for iPhone Safari (mobile-first design)
- 📊 Simple measurement recording (systolic, diastolic, pulse, notes)
- 📈 Local network deployment (Synology NAS compatible)
- 🔒 Zero external dependencies for deployment
- ⚡ Real-time data synchronization

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     iPhone Safari                           │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────▼────────────────────────────────┐
│                 Docker Container                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Node.js Express API (TypeScript)                    │   │
│  │  Port: 3000                                          │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  React Frontend (Vite, TypeScript)                   │   │
│  │  Served from /public directory                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  PostgreSQL 15 Database                              │   │
│  │  Port: 5432                                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 19.2.5 | UI Components |
| | TypeScript | 6.0.2 | Type Safety |
| | Vite | 8.0.8 | Build & Dev Server |
| **Backend** | Node.js | 18+ | Runtime |
| | Express | 5.2.1 | HTTP Server |
| | TypeScript | 6.0.2 | Type Safety |
| | pg | 8.20.0 | PostgreSQL Driver |
| **Database** | PostgreSQL | 15+ | Data Storage |
| **DevOps** | Docker | Latest | Containerization |
| | Docker Compose | Latest | Multi-Container Orchestration |

---

## 📁 Project Structure

```
bloodpressure/
├── server/                              # Backend (Node.js + Express)
│   ├── src/
│   │   ├── index.ts                    # Express app entry point
│   │   ├── config/
│   │   │   └── database.ts             # PostgreSQL pool & initialization
│   │   ├── routes/
│   │   │   └── measurements.ts         # REST API routes
│   │   ├── services/
│   │   │   └── measurementService.ts   # Business logic & validation
│   │   ├── models/
│   │   │   └── Measurement.ts          # TypeScript interfaces
│   │   └── utils/
│   │       └── csvExporter.ts          # CSV export utility
│   ├── migrations/
│   │   └── 001_create_measurements_table.sql  # Database schema
│   ├── dist/                           # Compiled JavaScript (build output)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example                    # Environment template
│
├── client/                              # Frontend (React + Vite)
│   ├── src/
│   │   ├── main.tsx                    # React entry point
│   │   ├── App.tsx                     # Root component
│   │   ├── App.css                     # Global styles (mobile-first)
│   │   ├── components/
│   │   │   ├── MeasurementForm.tsx     # Form component
│   │   │   ├── HistoryList.tsx         # History display
│   │   │   └── ExportButton.tsx        # CSV export trigger
│   │   ├── services/
│   │   │   └── api.ts                  # API client (fetch wrapper)
│   │   ├── types/
│   │   │   └── measurement.ts          # TypeScript interfaces
│   │   └── vite-env.d.ts               # Vite type definitions
│   ├── public/                         # Static assets
│   ├── index.html                      # HTML template
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── dist/                           # Build output
│
├── migrations/                          # Database schema files
│   └── 001_create_measurements_table.sql
│
├── docker-compose.yml                  # Multi-container orchestration
├── Dockerfile                          # Container image definition
├── test-validation.js                  # Standalone validation tests
│
├── Documentation/
│   ├── README.md                       # Main documentation (DE + EN)
│   ├── SETUP.md                        # Local development setup
│   ├── DEPLOYMENT.md                   # Production deployment
│   ├── API.md                          # REST API reference
│   ├── API-TESTING.md                  # API testing guide
│   ├── TESTING-GUIDE.md                # Unit/Component testing
│   ├── TROUBLESHOOTING.md              # Common issues
│   ├── CODE-REVIEW.md                  # Code review guidelines
│   └── DOCKER-HUB-PLAN.md              # Docker Hub strategy (future)
│
├── .gitignore                          # Git ignore rules
├── .dockerignore                       # Docker ignore rules
└── CLAUDE.md                           # This file
```

---

## 🎯 Development Workflows

### 1. **Local Development Setup**

```bash
# Prerequisites: Node.js v18+, npm v9+, PostgreSQL 15+ or Docker

# 1. Clone repo
git clone https://github.com/sushikoch/bloodpressure.git
cd bloodpressure

# 2. Start PostgreSQL (if using Docker)
docker run -d \
  --name bp-db \
  -e POSTGRES_DB=bloodpressure \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# 3. Start Backend (Terminal 1)
cd server
npm install
cp .env.example .env
npm run dev
# Expected: Server running on http://localhost:3000

# 4. Start Frontend (Terminal 2)
cd client
npm install
npm run dev
# Expected: Frontend on http://localhost:5173 (Vite dev server)

# 5. Access application
# Navigate to http://localhost:5173 or http://localhost:3000
```

### 2. **Git Workflow**

```bash
# Feature branch naming convention
git checkout -b feature/description-TICKET_ID

# Commit message format
git commit -m "Add feature: Brief description"

# Example:
git commit -m "Add CSV export functionality"
git commit -m "Fix validation for systolic range"
git commit -m "Refactor API client error handling"

# Push to feature branch (NOT main/master)
git push origin feature/description

# Create pull request on GitHub
```

### 3. **Building and Deployment**

```bash
# Development
npm run dev        # Both frontend and backend with hot reload

# Production Build
cd server && npm run build    # Compiles TypeScript to dist/
cd ../client && npm run build # Builds React app to dist/

# Docker Deployment
docker compose build
docker compose up -d

# Health check
curl http://localhost:3000/health
```

### 4. **Testing Workflow**

```bash
# Run validation tests
node test-validation.js

# TypeScript type checking
cd server && npm run build
cd ../client && npm run build

# Check specific API endpoint
curl -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "measured_at": "2026-04-16T10:30:00Z",
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72
  }'
```

---

## 💻 Code Conventions

### **TypeScript Standards**

- **Strict Mode**: Enabled (`"strict": true`)
- **Target**: ES2020
- **Module**: CommonJS (backend), ESM (frontend)
- **No Implicit Any**: Enforced (`"noImplicitAny": true`)
- **Null Checks**: Strict (`"strictNullChecks": true`)

### **File Naming**

- **Components**: PascalCase with `.tsx` extension
  - ✅ `MeasurementForm.tsx`
  - ✅ `HistoryList.tsx`
  - ❌ `measurement_form.tsx`

- **Services/Utils**: camelCase with `.ts` extension
  - ✅ `measurementService.ts`
  - ✅ `csvExporter.ts`
  - ❌ `MeasurementService.ts`

- **Types/Interfaces**: PascalCase with `.ts` extension
  - ✅ `Measurement.ts`
  - ✅ `measurement.ts` (interfaces in lowercase file)
  - ❌ `measurement_type.ts`

### **Code Style**

**Frontend (React/TypeScript)**
```tsx
// ✅ Good: Functional component with hooks
import { useState, useEffect } from 'react';

function MeasurementForm() {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // initialization
  }, []);
  
  return <div className="form">...</div>;
}

// ✅ Good: Type your props
interface FormProps {
  onSubmit: (data: Measurement) => Promise<void>;
  loading?: boolean;
}

// ❌ Bad: Non-functional component
class MeasurementForm extends React.Component {}

// ❌ Bad: Untyped props
function Form(props) {}
```

**Backend (Node.js/TypeScript)**
```typescript
// ✅ Good: Typed function with error handling
export async function createMeasurement(
  input: CreateMeasurementInput
): Promise<Measurement> {
  const validationError = validateMeasurementInput(input);
  if (validationError) {
    throw new Error(validationError);
  }
  // implementation
}

// ✅ Good: Input validation before processing
function validateMeasurementInput(input: CreateMeasurementInput): string | null {
  if (!input.systolic) return 'systolic is required';
  if (input.systolic < 50 || input.systolic > 300) {
    return 'systolic must be between 50 and 300';
  }
  return null;
}

// ❌ Bad: Untyped parameters
function createMeasurement(input) {}

// ❌ Bad: Silent failures
async function createMeasurement(input) {
  try {
    await db.query(sql);
  } catch (e) {
    console.log('error'); // Not informative
  }
}
```

### **API Conventions**

**Request/Response Format**
```typescript
// ✅ Create measurement
POST /api/measurements
Content-Type: application/json

{
  "measured_at": "2026-04-16T10:30:00Z",  // ISO 8601 timestamp
  "systolic": 120,                         // 50-300 mmHg
  "diastolic": 80,                         // 30-200 mmHg
  "pulse": 72,                             // 20-250 bpm (optional)
  "notes": "After morning coffee"          // Optional
}

// ✅ Response success
HTTP/1.1 201 Created
{
  "success": true,
  "data": {
    "id": 123,
    "measured_at": "2026-04-16T10:30:00Z",
    "systolic": 120,
    "diastolic": 80,
    "pulse": 72,
    "notes": "After morning coffee",
    "created_at": "2026-04-16T14:22:45Z",
    "updated_at": "2026-04-16T14:22:45Z"
  }
}

// ✅ Response error
HTTP/1.1 400 Bad Request
{
  "success": false,
  "error": "systolic must be between 50 and 300 mmHg"
}
```

### **Database Conventions**

- **Column Naming**: snake_case
  - ✅ `measured_at`, `systolic`, `diastolic`
  - ❌ `measureAt`, `Systolic`

- **Timestamps**: ISO 8601 UTC format
  - ✅ `2026-04-16T10:30:00Z`
  - ❌ `2026-04-16 10:30:00`, `1713270600000`

- **Parameterized Queries**: Always use to prevent SQL injection
  ```typescript
  // ✅ Good
  const result = await pool.query(
    'SELECT * FROM measurements WHERE id = $1',
    [id]
  );
  
  // ❌ Bad
  const result = await pool.query(
    `SELECT * FROM measurements WHERE id = ${id}`
  );
  ```

### **Environment Variables**

Used in `.env` file (committed as `.env.example`):

```bash
# Backend
API_PORT=3000
CORS_ORIGIN=*

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bloodpressure
DB_USER=postgres
DB_PASSWORD=changeme123

# Frontend (set during build time)
REACT_APP_API_URL=http://localhost:3000
```

**Never commit `.env` with real secrets!**

---

## 📊 Data Models

### **Measurement**

```typescript
interface Measurement {
  id: number;                // Primary key
  measured_at: string;       // ISO 8601 timestamp when recorded
  systolic: number;          // 50-300 mmHg (required)
  diastolic: number;         // 30-200 mmHg (required)
  pulse?: number;            // 20-250 bpm (optional)
  notes?: string;            // Free text notes (optional)
  created_at: string;        // ISO 8601 timestamp
  updated_at: string;        // ISO 8601 timestamp
}

interface CreateMeasurementInput {
  measured_at: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  notes?: string;
}
```

### **Validation Rules**

| Field | Min | Max | Type | Required |
|-------|-----|-----|------|----------|
| **measured_at** | - | - | ISO 8601 | ✅ |
| **systolic** | 50 | 300 | number | ✅ |
| **diastolic** | 30 | 200 | number | ✅ |
| **pulse** | 20 | 250 | number | ❌ |
| **notes** | - | - | string | ❌ |

---

## 🔌 API Endpoints

### **Health Check**
```
GET /health
Response: { "status": "ok", "timestamp": "2026-04-16T14:22:45Z" }
```

### **Create Measurement**
```
POST /api/measurements
Body: CreateMeasurementInput
Response: { "success": true, "data": Measurement }
```

### **Get All Measurements**
```
GET /api/measurements
Response: { "success": true, "data": Measurement[] }
```

### **Export CSV**
```
GET /api/measurements/export/csv
Response: CSV file download
```

See [API.md](./API.md) for detailed documentation.

---

## 🧪 Testing Strategy

### **Unit Tests**
- Located in: `test-validation.js` (standalone Node.js, no external deps)
- Run: `node test-validation.js`
- Coverage: Input validation, CSV export formatting

### **Integration Tests**
- Use `API-TESTING.md` for manual testing guide
- Test flows: Create → Retrieve → Export

### **Type Checking**
- Run: `npm run build` (validates TypeScript)
- Enabled: `strict`, `noImplicitAny`, `strictNullChecks`

### **E2E Testing**
- Manual testing in browser (iPhone Safari focus)
- Mobile responsiveness: Test on actual iPhone or simulator

---

## 🚀 Common Tasks for AI Assistants

### **Adding a New Feature**

1. **Create feature branch**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Implement on backend**
   - Add endpoint in `server/src/routes/measurements.ts`
   - Add service logic in `server/src/services/measurementService.ts`
   - Add types in `server/src/models/Measurement.ts`
   - Update database if needed in `migrations/`

3. **Implement on frontend**
   - Add/modify component in `client/src/components/`
   - Add API call in `client/src/services/api.ts`
   - Update types in `client/src/types/measurement.ts`
   - Style in `client/src/App.css`

4. **Test**
   - Type check: `npm run build` (both server & client)
   - Run tests: `node test-validation.js`
   - Manual test in browser

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Add feature: description"
   git push origin feature/feature-name
   ```

### **Fixing a Bug**

1. **Identify the problem**
   - Check error logs: `docker compose logs -f`
   - Test API: `curl http://localhost:3000/health`
   - Browser console for frontend errors

2. **Locate the code**
   - Backend bugs: `server/src/`
   - Frontend bugs: `client/src/`
   - Database issues: Check migrations

3. **Fix and test**
   - Make minimal changes
   - Run: `npm run build`
   - Test: `node test-validation.js`
   - Manual test in browser

4. **Commit with clear message**
   ```bash
   git commit -m "Fix: description of bug and solution"
   ```

### **Updating Dependencies**

1. **Check current version**
   ```bash
   cd server && npm list <package>
   ```

2. **Update safely**
   ```bash
   npm update <package>  # Minor/patch updates
   npm install <package>@latest  # Major updates (test thoroughly)
   ```

3. **Test after update**
   ```bash
   npm run build
   npm run dev
   # Manual test in browser
   ```

4. **Commit**
   ```bash
   git commit -m "Update dependencies: <package> to v<version>"
   ```

---

## 🐛 Debugging Guide

### **Backend Issues**

```bash
# Check server logs
docker compose logs -f server

# Check database connection
curl http://localhost:3000/health

# Check specific endpoint
curl -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{"measured_at": "2026-04-16T10:30:00Z", "systolic": 120, "diastolic": 80}'

# View database content
docker compose exec db psql -U postgres -d bloodpressure -c "SELECT * FROM measurements;"
```

### **Frontend Issues**

```bash
# Check browser console for errors
# Open DevTools: Right-click → Inspect

# Check network requests: Network tab
# Check console: Console tab

# Check local state: React DevTools extension

# Clear cache and rebuild
rm -rf client/node_modules client/dist
npm install
npm run dev
```

### **Database Issues**

```bash
# Check if PostgreSQL is running
docker compose ps db

# Check database logs
docker compose logs db

# Connect directly to database
docker compose exec db psql -U postgres -d bloodpressure

# View table schema
\dt measurements
\d measurements

# Query sample data
SELECT COUNT(*) FROM measurements;
SELECT * FROM measurements LIMIT 5;
```

### **Docker Issues**

```bash
# Check container status
docker compose ps

# Check logs
docker compose logs -f

# Restart containers
docker compose restart

# Full rebuild
docker compose down
docker compose build --no-cache
docker compose up -d

# Clean everything
docker compose down -v  # -v removes volumes
```

---

## 📈 Performance Considerations

- **Frontend**: Build size ~200 KB gzipped (React 19 + Vite)
- **Backend**: API response time < 100ms (PostgreSQL with indexes)
- **Database**: Queries indexed for fast retrieval
- **Mobile**: Optimized for iPhone 5 - 15 Pro Max smooth operation

### **Optimization Tips**

1. **Database**: Always use indexes for frequently queried columns
2. **API**: Minimize response payload size
3. **Frontend**: Lazy load components when possible
4. **Caching**: Consider caching static assets in browser

---

## 🔒 Security Guidelines

### **Input Validation**
- ✅ Always validate on backend (never trust client input)
- ✅ Use typed interfaces to enforce structure
- ✅ Range check numeric values

```typescript
// ✅ Good
if (systolic < 50 || systolic > 300) {
  throw new Error('systolic must be between 50 and 300');
}

// ❌ Bad
// Silently accept invalid data
```

### **SQL Injection Prevention**
- ✅ Use parameterized queries (`$1`, `$2`, etc.)
- ❌ Never use string interpolation in SQL

```typescript
// ✅ Good
await pool.query('SELECT * FROM measurements WHERE id = $1', [id]);

// ❌ Bad
await pool.query(`SELECT * FROM measurements WHERE id = ${id}`);
```

### **Environment Secrets**
- ✅ Use `.env` files (not committed)
- ✅ Reference `.env.example` template
- ❌ Never hardcode credentials

### **CORS**
- Configured in `server/src/index.ts`
- Default: `origin: '*'` for development
- Production: Restrict to known domains

### **HTTPS**
- Ready for HTTPS with reverse proxy (nginx on Synology)
- Self-signed certificate possible for local network

---

## 📚 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| [README.md](./README.md) | Project overview (DE + EN) | Everyone |
| [SETUP.md](./SETUP.md) | Local development setup | Developers |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide | DevOps/Admins |
| [API.md](./API.md) | REST API reference | Developers/QA |
| [API-TESTING.md](./API-TESTING.md) | API testing procedures | QA/Testers |
| [TESTING-GUIDE.md](./TESTING-GUIDE.md) | Unit/Component testing | Developers |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues & solutions | Everyone |
| [CODE-REVIEW.md](./CODE-REVIEW.md) | Code review guidelines | Developers |
| [DOCKER-HUB-PLAN.md](./DOCKER-HUB-PLAN.md) | Docker Hub integration (future) | DevOps |

---

## 🎯 Important Patterns

### **Error Handling**

```typescript
// ✅ Proper error handling
try {
  const result = await query(sql, params);
  return result.rows;
} catch (error) {
  console.error('Database query failed:', error);
  throw new Error('Failed to retrieve measurements');
}

// ❌ Silent failures
try {
  await query(sql, params);
} catch (e) {
  // Do nothing
}
```

### **Async/Await Pattern**

```typescript
// ✅ Proper async
export async function getMeasurements(): Promise<Measurement[]> {
  try {
    const result = await query<Measurement>(
      'SELECT * FROM measurements ORDER BY measured_at DESC'
    );
    return result.rows;
  } catch (error) {
    throw new Error('Failed to fetch measurements');
  }
}

// ❌ Callback hell
function getMeasurements(callback) {
  pool.query(sql, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, result.rows);
    }
  });
}
```

### **Component Lifecycle**

```tsx
// ✅ Functional component with hooks
function HistoryList({ measurements }: { measurements: Measurement[] }) {
  const [filtered, setFiltered] = useState(measurements);
  
  useEffect(() => {
    // Filter logic
    setFiltered(measurements);
  }, [measurements]);
  
  return <div>{/* render */}</div>;
}

// ❌ Class component (outdated pattern)
class HistoryList extends React.Component {}
```

---

## 🚦 Pre-Commit Checklist

Before pushing changes:

- [ ] Code compiles: `npm run build` (both directories)
- [ ] TypeScript strict mode: No errors
- [ ] Tests pass: `node test-validation.js`
- [ ] No console errors in browser
- [ ] Manual test: Form submission works
- [ ] Git message is descriptive
- [ ] No `.env` file with secrets in commit
- [ ] Branched from `main`, not committing to `main`

---

## 🤝 Contributing Guidelines

### **Branch Naming**
- Feature: `feature/description`
- Fix: `fix/description`
- Chore: `chore/description`
- Example: `feature/add-date-filter-BModZ`

### **Commit Messages**
```
Type: Brief description (under 50 chars)

Optional detailed explanation if needed.
- Bullet points for multiple changes
- Reference issue numbers: #123

Good types:
- Add: New feature
- Fix: Bug fix
- Update: Enhancement to existing feature
- Refactor: Code structure change
- Docs: Documentation only
- Test: Test additions/updates
```

### **Code Review Focus**
- Type safety: Are types correct?
- Validation: Is input validated?
- Error handling: Are errors caught and logged?
- Performance: Any obvious inefficiencies?
- Security: Any injection vulnerabilities?
- Mobile: Responsive and touch-friendly?

---

## 📞 Support & Troubleshooting

### **Common Issues**

| Issue | Solution |
|-------|----------|
| `npm install` fails | Delete `node_modules` and `package-lock.json`, retry |
| Port 3000 in use | `lsof -i :3000` then `kill -9 <PID>` |
| Database connection error | Check `.env` variables match actual DB |
| Frontend won't load | Check backend is running: `curl localhost:3000/health` |
| TypeScript errors | Run `npm run build` to see all errors, fix them |
| Hot reload not working | Restart dev server: `npm run dev` |
| Tests fail randomly | Check database state, may need clean migration |

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

---

## 🔄 Release Process

1. **Ensure all tests pass**
   ```bash
   npm run build
   node test-validation.js
   ```

2. **Create release branch**
   ```bash
   git checkout -b release/v1.x.x
   ```

3. **Update version in package.json** (both server & client)
   ```json
   "version": "1.x.x"
   ```

4. **Merge to main and tag**
   ```bash
   git merge --no-ff release/v1.x.x
   git tag -a v1.x.x -m "Release v1.x.x"
   git push origin main --tags
   ```

5. **Deploy to production**
   ```bash
   docker compose build
   docker compose up -d
   ```

---

## 📝 Last Updated

- **Date**: 2026-04-16
- **Version**: 1.0.0
- **Status**: ✅ Production Ready
- **Maintainer**: AI Assistant / Developer Team

---

## 🤖 Notes for AI Assistants

### **When Making Changes**

1. **Read existing code first** - Understand patterns before modifying
2. **Preserve conventions** - Follow established naming, style, structure
3. **Add comments sparingly** - Code should be self-documenting
4. **Test before committing** - Always run `npm run build` and tests
5. **Keep commits focused** - One feature/fix per commit
6. **Update documentation** - If behavior changes, update docs

### **What NOT to Do**

- ❌ Don't commit `.env` files with secrets
- ❌ Don't modify database schema without migration
- ❌ Don't add dependencies without justification
- ❌ Don't ignore TypeScript errors
- ❌ Don't hardcode values (use env vars)
- ❌ Don't make destructive git operations without confirmation
- ❌ Don't commit to `main`/`master` directly

### **Recommended Workflow**

1. Create feature branch from latest main
2. Make focused changes
3. Test thoroughly
4. Write clear commit message
5. Push to feature branch
6. Create pull request (if requested)
7. Request review (if needed)
8. Merge after approval

---

**Happy coding! 🚀**
