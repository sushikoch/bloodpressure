/**
 * Measurement model - represents a blood pressure measurement record
 */

export interface Measurement {
  id: number;
  measured_at: string; // ISO 8601 format
  systolic: number;
  diastolic: number;
  pulse?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMeasurementInput {
  measured_at: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  notes?: string;
}

export interface UpdateMeasurementInput {
  measured_at?: string;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  notes?: string;
}
