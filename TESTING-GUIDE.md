# Blood Pressure Tracker - Testing Guide

## 1. Frontend-Only Testing (No Backend Needed)

### A. Open Mockup in Browser
```bash
# Simply open in any browser
open MOCKUP.html
# or
firefox MOCKUP.html
```

**Test the UI/UX:**
- [ ] Form inputs work and accept values
- [ ] Submit button is clickable
- [ ] Card layout displays correctly
- [ ] Responsive on mobile/desktop
- [ ] Colors and styling match design
- [ ] Touch targets are 44px minimum

---

## 2. TypeScript Compilation Check

```bash
# Check Server TypeScript
cd server
npm run build
# Should succeed with no errors

# Check Client TypeScript  
cd ../client
npm run build
# Should produce build/ directory with optimized code
```

**Expected Output:**
- Server: `/server/dist` folder with compiled JS
- Client: `/client/build` folder with:
  - `index.html`
  - `assets/index-[hash].js` (~197KB gzipped)
  - `assets/index-[hash].css` (~4KB)

---

## 3. API Endpoint Tests (Using Mock Data)

### Prerequisites
Create a test file to simulate API responses:

**`test-api.js`**
```javascript
// Mock API Service for Testing
const mockMeasurements = [
  {
    id: 1,
    measured_at: "2026-04-10T21:30:00Z",
    systolic: 120,
    diastolic: 80,
    pulse: 72,
    notes: "Normal reading after morning coffee",
    created_at: "2026-04-10T21:30:00Z",
    updated_at: "2026-04-10T21:30:00Z"
  },
  {
    id: 2,
    measured_at: "2026-04-10T07:15:00Z",
    systolic: 118,
    diastolic: 78,
    pulse: 68,
    notes: null,
    created_at: "2026-04-10T07:15:00Z",
    updated_at: "2026-04-10T07:15:00Z"
  },
  {
    id: 3,
    measured_at: "2026-04-09T20:00:00Z",
    systolic: 125,
    diastolic: 82,
    pulse: 75,
    notes: "After exercise",
    created_at: "2026-04-09T20:00:00Z",
    updated_at: "2026-04-09T20:00:00Z"
  }
];

// Test: Validate measurement input
function validateMeasurementInput(input) {
  if (!input.measured_at) return 'measured_at is required';
  if (input.systolic === undefined) return 'systolic is required';
  if (input.diastolic === undefined) return 'diastolic is required';

  if (input.systolic < 50 || input.systolic > 300) {
    return 'systolic must be between 50 and 300 mmHg';
  }

  if (input.diastolic < 30 || input.diastolic > 200) {
    return 'diastolic must be between 30 and 200 mmHg';
  }

  if (input.pulse !== undefined && (input.pulse < 20 || input.pulse > 250)) {
    return 'pulse must be between 20 and 250 bpm';
  }

  if (isNaN(Date.parse(input.measured_at))) {
    return 'measured_at must be a valid ISO 8601 timestamp';
  }

  return null;
}

// Test: CSV Export
function measurementsToCSV(measurements) {
  const headers = [
    'ID',
    'Date',
    'Time',
    'Systolic (mmHg)',
    'Diastolic (mmHg)',
    'Pulse (bpm)',
    'Notes',
    'Created At',
  ];

  const rows = [headers.join(',')];

  for (const measurement of measurements) {
    const measuredAt = new Date(measurement.measured_at);
    const date = measuredAt.toISOString().split('T')[0];
    const time = measuredAt.toISOString().split('T')[1].slice(0, 8);

    const row = [
      measurement.id,
      date,
      time,
      measurement.systolic,
      measurement.diastolic,
      measurement.pulse || '',
      measurement.notes ? `"${measurement.notes.replace(/"/g, '""')}"` : '',
      measurement.created_at,
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n') + '\n';
}

// ============ TESTS ============

console.log('=== Testing Validation ===\n');

// Test 1: Valid input
const validInput = {
  measured_at: "2026-04-10T21:30:00Z",
  systolic: 120,
  diastolic: 80,
  pulse: 72,
  notes: "Test"
};
console.log('✓ Valid input:', validateMeasurementInput(validInput) === null ? 'PASS' : 'FAIL');

// Test 2: Missing systolic
const invalidInput1 = {
  measured_at: "2026-04-10T21:30:00Z",
  diastolic: 80
};
console.log('✓ Missing systolic:', validateMeasurementInput(invalidInput1) === 'systolic is required' ? 'PASS' : 'FAIL');

// Test 3: Systolic too low
const invalidInput2 = {
  measured_at: "2026-04-10T21:30:00Z",
  systolic: 40,
  diastolic: 80
};
console.log('✓ Systolic too low:', validateMeasurementInput(invalidInput2).includes('between 50 and 300') ? 'PASS' : 'FAIL');

// Test 4: Invalid date
const invalidInput3 = {
  measured_at: "not-a-date",
  systolic: 120,
  diastolic: 80
};
console.log('✓ Invalid date:', validateMeasurementInput(invalidInput3).includes('ISO 8601') ? 'PASS' : 'FAIL');

// Test 5: Optional pulse validation
const validInput2 = {
  measured_at: "2026-04-10T21:30:00Z",
  systolic: 120,
  diastolic: 80,
  pulse: undefined
};
console.log('✓ Optional pulse:', validateMeasurementInput(validInput2) === null ? 'PASS' : 'FAIL');

console.log('\n=== Testing CSV Export ===\n');
const csv = measurementsToCSV(mockMeasurements);
console.log(csv);
console.log('✓ CSV generated:', csv.includes('120,80') ? 'PASS' : 'FAIL');
console.log('✓ CSV escaped notes:', csv.includes('"Normal reading') ? 'PASS' : 'FAIL');

console.log('\n=== All Tests Complete ===');
```

### Run Tests
```bash
node test-api.js
```

**Expected Output:**
```
=== Testing Validation ===

✓ Valid input: PASS
✓ Missing systolic: PASS
✓ Systolic too low: PASS
✓ Invalid date: PASS
✓ Optional pulse: PASS

=== Testing CSV Export ===

ID,Date,Time,Systolic (mmHg),Diastolic (mmHg),Pulse (bpm),Notes,Created At
1,2026-04-10,21:30:00,120,80,72,"Normal reading after morning coffee",2026-04-10T21:30:00Z
2,2026-04-10,07:15:00,118,78,68,,2026-04-10T07:15:00Z
3,2026-04-09,20:00:00,125,82,75,"After exercise",2026-04-09T20:00:00Z

✓ CSV generated: PASS
✓ CSV escaped notes: PASS

=== All Tests Complete ===
```

---

## 4. Component Tests (Manual)

### MeasurementForm Component
**Test Cases:**
- [ ] Form accepts datetime-local input
- [ ] Systolic/Diastolic inputs only accept numbers 50-300 / 30-200
- [ ] Pulse field is optional
- [ ] Notes field accepts multi-line text
- [ ] Submit button shows loading state
- [ ] Form clears after successful submit
- [ ] Error message appears on validation error
- [ ] Success message appears and disappears after 3 seconds

### HistoryList Component
**Test Cases:**
- [ ] Measurements display in reverse chronological order (newest first)
- [ ] Date/time formatted as: "Apr 10, 2026 9:30 PM"
- [ ] All measurements fields display correctly
- [ ] Notes field has blue left border
- [ ] Cards are scrollable when list is tall
- [ ] Empty state shows when no measurements

### ExportButton Component
**Test Cases:**
- [ ] Button text changes to "⏳ Exporting..." during download
- [ ] CSV file downloads with correct filename
- [ ] Error message shows if export fails
- [ ] Button is disabled during export

---

## 5. Mobile Testing (iPhone Safari Simulation)

### Using Chrome DevTools
1. Open Chrome → Press F12
2. Click device icon (top-left of DevTools)
3. Select "iPhone 14 Pro" or similar
4. Test in portrait and landscape

**Checklist:**
- [ ] No horizontal scrolling required
- [ ] Touch targets at least 44px tall
- [ ] Inputs are large enough to read
- [ ] Buttons are clickable without zooming
- [ ] Form inputs trigger correct keyboards:
  - Date/time → Calendar picker
  - Numbers → Numeric keyboard
  - Text → Text keyboard
- [ ] Layout stacks vertically on mobile (Form above History)
- [ ] Header stays accessible on scroll
- [ ] Colors contrast meets accessibility standards (WCAG AA)

---

## 6. Responsive Design Tests

### Desktop (> 1024px)
- [ ] Form and History display side-by-side (2 columns)
- [ ] Max width is 1000px centered
- [ ] Card widths are equal

### Tablet (768px - 1024px)
- [ ] Single column layout
- [ ] Proper padding/margins
- [ ] Touch friendly spacing

### Mobile (< 768px)
- [ ] Single column
- [ ] No horizontal scroll
- [ ] Form row (Systolic/Diastolic) stacks vertically
- [ ] Buttons full width

---

## 7. Local Dev Server Test (When PostgreSQL Available)

```bash
# Terminal 1: Start PostgreSQL
docker run -d \
  --name bp-db \
  -e POSTGRES_DB=bloodpressure \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Terminal 2: Start Backend
cd server
npm run dev

# Terminal 3: Start Frontend (Vite dev server)
cd client
npm run dev
```

**Open:** `http://localhost:5173` (Vite dev server)

**Full E2E Flow Test:**
1. Fill out form with valid data
2. Click "Save Measurement"
3. See success message
4. New measurement appears in history list
5. List scrolls if needed
6. Click "Export as CSV"
7. CSV file downloads
8. Open CSV and verify data

---

## Troubleshooting

### Form not submitting
- Check browser console for errors
- Ensure all required fields are filled
- Validate input is within accepted ranges

### History list not loading
- Check Network tab in DevTools
- Verify API is running on localhost:3000
- Check CORS settings in server

### Styling looks broken
- Verify MOCKUP.html opens correctly
- Clear browser cache (Ctrl+Shift+Delete)
- Check that CSS files built correctly

### Export not downloading
- Check browser's default download location
- Verify filename contains today's date
- Check that CSV content is valid

---

## Summary

**Test Hierarchy:**
1. ✅ Static HTML Mockup (MOCKUP.html)
2. ✅ TypeScript Compilation
3. ✅ Logic Tests (Validation, CSV)
4. ✅ Component Tests (Manual)
5. ✅ Responsive Design Tests
6. ✅ Full E2E Tests (with Backend)

All levels should pass before deployment.
