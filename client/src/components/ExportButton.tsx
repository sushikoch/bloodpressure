import { useState } from 'react';
import { downloadCSV } from '../services/api';
import './ExportButton.css';

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      await downloadCSV();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-button-wrapper">
      {error && <span className="export-error">{error}</span>}
      <button onClick={handleExport} disabled={loading} className="export-btn">
        {loading ? '⏳ Exporting...' : '📥 Export as CSV'}
      </button>
    </div>
  );
}
