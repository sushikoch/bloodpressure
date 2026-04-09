import { useState } from 'react';
import { Measurement, CreateMeasurementInput } from '../types/measurement';
import { postMeasurement } from '../services/api';
import './MeasurementForm.css';

interface Props {
  onMeasurementAdded: (measurement: Measurement) => void;
}

export default function MeasurementForm({ onMeasurementAdded }: Props) {
  const [formData, setFormData] = useState<CreateMeasurementInput>({
    measured_at: new Date().toISOString().slice(0, 16),
    systolic: 120,
    diastolic: 80,
    pulse: undefined,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'pulse' && value === '' ? undefined : value === '' ? '' : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setLoading(true);
      const result = await postMeasurement({
        ...formData,
        systolic: parseInt(formData.systolic.toString()),
        diastolic: parseInt(formData.diastolic.toString()),
        pulse: formData.pulse ? parseInt(formData.pulse.toString()) : undefined,
      });

      onMeasurementAdded(result);
      setSuccess(true);

      // Reset form
      setFormData({
        measured_at: new Date().toISOString().slice(0, 16),
        systolic: 120,
        diastolic: 80,
        pulse: undefined,
        notes: '',
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save measurement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="measurement-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">✓ Measurement saved</div>}

      <div className="form-group">
        <label htmlFor="measured_at">Date & Time</label>
        <input
          type="datetime-local"
          id="measured_at"
          name="measured_at"
          value={formData.measured_at}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="systolic">Systolic (mmHg)</label>
          <input
            type="number"
            id="systolic"
            name="systolic"
            inputMode="numeric"
            min="50"
            max="300"
            value={formData.systolic}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="diastolic">Diastolic (mmHg)</label>
          <input
            type="number"
            id="diastolic"
            name="diastolic"
            inputMode="numeric"
            min="30"
            max="200"
            value={formData.diastolic}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="pulse">Pulse (bpm) - Optional</label>
        <input
          type="number"
          id="pulse"
          name="pulse"
          inputMode="numeric"
          min="20"
          max="250"
          value={formData.pulse || ''}
          onChange={handleChange}
          placeholder="Leave empty if not measured"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes - Optional</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any observations or notes"
          rows={3}
        />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Saving...' : 'Save Measurement'}
      </button>
    </form>
  );
}
