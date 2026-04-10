import { useState, useEffect } from 'react';
import { Measurement } from './types/measurement';
import MeasurementForm from './components/MeasurementForm';
import HistoryList from './components/HistoryList';
import ExportButton from './components/ExportButton';
import { getMeasurements } from './services/api';
import './App.css';

function App() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeasurements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMeasurements();
      setMeasurements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load measurements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeasurements();
  }, []);

  const handleMeasurementAdded = (newMeasurement: Measurement) => {
    setMeasurements([newMeasurement, ...measurements]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🩺 Blood Pressure Tracker</h1>
        <ExportButton />
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="app-main">
        <section className="form-section">
          <h2>New Measurement</h2>
          <MeasurementForm onMeasurementAdded={handleMeasurementAdded} />
        </section>

        <section className="history-section">
          <h2>Measurement History</h2>
          {loading ? (
            <p className="loading">Loading...</p>
          ) : measurements.length === 0 ? (
            <p className="empty-state">No measurements recorded yet</p>
          ) : (
            <HistoryList measurements={measurements} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
