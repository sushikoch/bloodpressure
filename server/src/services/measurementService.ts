import { Measurement, CreateMeasurementInput } from '../models/Measurement';
import { query } from '../config/database';

/**
 * Validate measurement input
 */
export function validateMeasurementInput(input: CreateMeasurementInput): string | null {
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

/**
 * Create a new measurement
 */
export async function createMeasurement(
  input: CreateMeasurementInput
): Promise<Measurement> {
  const validationError = validateMeasurementInput(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const sql = `
    INSERT INTO measurements (measured_at, systolic, diastolic, pulse, notes)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, measured_at, systolic, diastolic, pulse, notes, created_at, updated_at
  `;

  const { rows } = await query<Measurement>(sql, [
    input.measured_at,
    input.systolic,
    input.diastolic,
    input.pulse || null,
    input.notes || null,
  ]);

  if (rows.length === 0) {
    throw new Error('Failed to create measurement');
  }

  return rows[0];
}

/**
 * Get all measurements sorted by measured_at descending
 */
export async function getAllMeasurements(
  limit?: number,
  offset?: number
): Promise<Measurement[]> {
  let sql = `
    SELECT id, measured_at, systolic, diastolic, pulse, notes, created_at, updated_at
    FROM measurements
    ORDER BY measured_at DESC
  `;

  const params: any[] = [];

  if (limit) {
    sql += ` LIMIT $${params.length + 1}`;
    params.push(limit);
  }

  if (offset) {
    sql += ` OFFSET $${params.length + 1}`;
    params.push(offset);
  }

  const { rows } = await query<Measurement>(sql, params);
  return rows;
}

/**
 * Get measurements by date range
 */
export async function getMeasurementsByDateRange(
  startDate: string,
  endDate: string
): Promise<Measurement[]> {
  const sql = `
    SELECT id, measured_at, systolic, diastolic, pulse, notes, created_at, updated_at
    FROM measurements
    WHERE measured_at >= $1 AND measured_at <= $2
    ORDER BY measured_at DESC
  `;

  const { rows } = await query<Measurement>(sql, [startDate, endDate]);
  return rows;
}

/**
 * Get a single measurement by ID
 */
export async function getMeasurementById(id: number): Promise<Measurement | null> {
  const sql = `
    SELECT id, measured_at, systolic, diastolic, pulse, notes, created_at, updated_at
    FROM measurements
    WHERE id = $1
  `;

  const { rows } = await query<Measurement>(sql, [id]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get all measurements for CSV export
 */
export async function getAllMeasurementsForExport(): Promise<Measurement[]> {
  const sql = `
    SELECT id, measured_at, systolic, diastolic, pulse, notes, created_at, updated_at
    FROM measurements
    ORDER BY measured_at DESC
  `;

  const { rows } = await query<Measurement>(sql);
  return rows;
}
