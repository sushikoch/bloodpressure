import { Measurement } from '../models/Measurement';

/**
 * Escape CSV field value
 */
function escapeCSVField(value: any): string {
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

/**
 * Convert measurements to CSV format
 */
export function measurementsToCSV(measurements: Measurement[]): string {
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

  const rows: string[] = [headers.map(h => escapeCSVField(h)).join(',')];

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

/**
 * Generate CSV filename with current date
 */
export function generateCSVFilename(): string {
  const today = new Date().toISOString().split('T')[0];
  return `blood-pressure-export-${today}.csv`;
}
