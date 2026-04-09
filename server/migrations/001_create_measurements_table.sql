-- Create measurements table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_measurements_measured_at ON measurements(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_measurements_created_at ON measurements(created_at DESC);

-- Create comment for documentation
COMMENT ON TABLE measurements IS 'Blood pressure measurements with systolic, diastolic, and pulse readings';
COMMENT ON COLUMN measurements.measured_at IS 'The date and time when the measurement was taken';
COMMENT ON COLUMN measurements.systolic IS 'Systolic pressure in mmHg (upper number)';
COMMENT ON COLUMN measurements.diastolic IS 'Diastolic pressure in mmHg (lower number)';
COMMENT ON COLUMN measurements.pulse IS 'Heart rate in beats per minute (optional)';
COMMENT ON COLUMN measurements.notes IS 'Optional free-text notes about the measurement';
