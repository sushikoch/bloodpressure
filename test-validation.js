#!/usr/bin/env node

/**
 * Test Suite für Blood Pressure Tracker - Validierung & CSV Export
 * Keine externen Dependencies - pure Node.js
 */

// ============ VALIDATION FUNCTION (from server/src/services/measurementService.ts)
function validateMeasurementInput(input) {
  // Check required fields
  if (!input.measured_at) return 'measured_at is required';
  if (input.systolic === undefined) return 'systolic is required';
  if (input.diastolic === undefined) return 'diastolic is required';

  // Validate systolic
  if (input.systolic < 50 || input.systolic > 300) {
    return 'systolic must be between 50 and 300 mmHg';
  }

  // Validate diastolic
  if (input.diastolic < 30 || input.diastolic > 200) {
    return 'diastolic must be between 30 and 200 mmHg';
  }

  // Validate pulse if provided
  if (input.pulse !== undefined && (input.pulse < 20 || input.pulse > 250)) {
    return 'pulse must be between 20 and 250 bpm';
  }

  // Validate measured_at is valid ISO 8601 timestamp
  if (isNaN(Date.parse(input.measured_at))) {
    return 'measured_at must be a valid ISO 8601 timestamp';
  }

  return null;
}

// ============ CSV EXPORT FUNCTION (from server/src/utils/csvExporter.ts)
function escapeCSVField(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the field contains comma, newline, or double quote, wrap in quotes and escape inner quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

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

  const rows = [headers.map(h => escapeCSVField(h)).join(',')];

  for (const measurement of measurements) {
    const measuredAt = new Date(measurement.measured_at);
    const date = measuredAt.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = measuredAt.toISOString().split('T')[1].slice(0, 8); // HH:MM:SS

    const row = [
      escapeCSVField(measurement.id),
      escapeCSVField(date),
      escapeCSVField(time),
      escapeCSVField(measurement.systolic),
      escapeCSVField(measurement.diastolic),
      escapeCSVField(measurement.pulse),
      escapeCSVField(measurement.notes),
      escapeCSVField(measurement.created_at),
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n') + '\n';
}

// ============ TEST RUNNER
let passed = 0;
let failed = 0;

function test(name, condition, actual, expected) {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual:   ${actual}`);
    failed++;
  }
}

// ============ TEST DATA
const mockMeasurements = [
  {
    id: 1,
    measured_at: '2026-04-10T21:30:00Z',
    systolic: 120,
    diastolic: 80,
    pulse: 72,
    notes: 'Normal reading after coffee',
    created_at: '2026-04-10T21:30:00Z',
    updated_at: '2026-04-10T21:30:00Z',
  },
  {
    id: 2,
    measured_at: '2026-04-10T07:15:00Z',
    systolic: 118,
    diastolic: 78,
    pulse: 68,
    notes: null,
    created_at: '2026-04-10T07:15:00Z',
    updated_at: '2026-04-10T07:15:00Z',
  },
  {
    id: 3,
    measured_at: '2026-04-09T20:00:00Z',
    systolic: 125,
    diastolic: 82,
    pulse: 75,
    notes: 'After "exercise", high reading',
    created_at: '2026-04-09T20:00:00Z',
    updated_at: '2026-04-09T20:00:00Z',
  },
];

// ============ VALIDATION TESTS
console.log('\n╔════════════════════════════════════════╗');
console.log('║      VALIDATION TESTS (5 Scenarios)    ║');
console.log('╚════════════════════════════════════════╝\n');

// Test 1: Valid input
const validInput = {
  measured_at: '2026-04-10T21:30:00Z',
  systolic: 120,
  diastolic: 80,
  pulse: 72,
  notes: 'Test',
};
const result1 = validateMeasurementInput(validInput);
test('Valid measurement with all fields', result1 === null, result1, 'null');

// Test 2: Missing systolic
const missingSystemic = {
  measured_at: '2026-04-10T21:30:00Z',
  diastolic: 80,
};
const result2 = validateMeasurementInput(missingSystemic);
test('Missing systolic field', result2 === 'systolic is required', result2, 'systolic is required');

// Test 3: Systolic out of range
const systolicTooLow = {
  measured_at: '2026-04-10T21:30:00Z',
  systolic: 40,
  diastolic: 80,
};
const result3 = validateMeasurementInput(systolicTooLow);
test('Systolic too low (40 < 50)', result3.includes('between 50 and 300'), result3, 'includes "between 50 and 300"');

// Test 4: Diastolic out of range
const diastolicTooHigh = {
  measured_at: '2026-04-10T21:30:00Z',
  systolic: 120,
  diastolic: 250,
};
const result4 = validateMeasurementInput(diastolicTooHigh);
test('Diastolic too high (250 > 200)', result4.includes('between 30 and 200'), result4, 'includes "between 30 and 200"');

// Test 5: Invalid date format
const invalidDate = {
  measured_at: 'not-a-date',
  systolic: 120,
  diastolic: 80,
};
const result5 = validateMeasurementInput(invalidDate);
test('Invalid ISO 8601 timestamp', result5.includes('ISO 8601'), result5, 'includes "ISO 8601"');

// ============ CSV EXPORT TESTS
console.log('\n╔════════════════════════════════════════╗');
console.log('║       CSV EXPORT TESTS (3 Scenarios)   ║');
console.log('╚════════════════════════════════════════╝\n');

const csv = measurementsToCSV(mockMeasurements);
const csvLines = csv.trim().split('\n');

// Test 6: CSV header
test('CSV has header row', csvLines[0].includes('ID,Date,Time'), csvLines[0], 'ID,Date,Time,...');

// Test 7: CSV data integrity
test(
  'CSV contains first measurement data',
  csvLines[1].includes('1,2026-04-10,21:30:00,120,80,72'),
  csvLines[1],
  '1,2026-04-10,21:30:00,120,80,72...'
);

// Test 8: CSV escaping (quoted field with comma and quotes)
test(
  'CSV escapes notes with commas and quotes',
  csvLines[3].includes('"After ""exercise"", high reading"'),
  csvLines[3],
  'Contains properly escaped: "After ""exercise"", high reading"'
);

// ============ CSV STRUCTURE TEST
console.log('\n╔════════════════════════════════════════╗');
console.log('║       CSV OUTPUT VALIDATION            ║');
console.log('╚════════════════════════════════════════╝\n');

console.log('Sample CSV Output:\n');
console.log(csv);

test('CSV has correct number of rows', csvLines.length === 4, csvLines.length, '4 (header + 3 measurements)');
test('Each row has same number of columns',
  csvLines.every(line => line.split(',').length === 8),
  'All rows have 8 columns',
  'Each row should have 8 columns'
);

// ============ EDGE CASES
console.log('\n╔════════════════════════════════════════╗');
console.log('║         EDGE CASE TESTS (2 Scenarios)  ║');
console.log('╚════════════════════════════════════════╝\n');

// Test 9: Minimum valid values
const minValid = {
  measured_at: '2026-04-10T00:00:00Z',
  systolic: 50,
  diastolic: 30,
};
const result9 = validateMeasurementInput(minValid);
test('Minimum valid values (systolic=50, diastolic=30)', result9 === null, result9, 'null');

// Test 10: Maximum valid values
const maxValid = {
  measured_at: '2026-04-10T23:59:59Z',
  systolic: 300,
  diastolic: 200,
  pulse: 250,
};
const result10 = validateMeasurementInput(maxValid);
test('Maximum valid values (systolic=300, diastolic=200, pulse=250)', result10 === null, result10, 'null');

// ============ SUMMARY
console.log('\n╔════════════════════════════════════════╗');
console.log('║            TEST SUMMARY               ║');
console.log('╚════════════════════════════════════════╝\n');

console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total:  ${passed + failed}\n`);

if (failed === 0) {
  console.log('🎉 All tests passed! The validation and CSV export logic is working correctly.\n');
  process.exit(0);
} else {
  console.log(`⚠️  ${failed} test(s) failed. Please review the output above.\n`);
  process.exit(1);
}
