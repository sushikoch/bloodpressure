export interface Measurement {
  id: number;
  measured_at: string;
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
