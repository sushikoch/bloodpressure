import { Measurement } from '../types/measurement';
import './HistoryList.css';

interface Props {
  measurements: Measurement[];
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryList({ measurements }: Props) {
  return (
    <div className="history-list">
      {measurements.map((m) => (
        <div key={m.id} className="measurement-card">
          <div className="card-header">
            <span className="date">{formatDate(m.measured_at)}</span>
          </div>
          <div className="card-values">
            <div className="value-item">
              <span className="label">Systolic</span>
              <span className="value">{m.systolic} mmHg</span>
            </div>
            <div className="value-item">
              <span className="label">Diastolic</span>
              <span className="value">{m.diastolic} mmHg</span>
            </div>
            {m.pulse && (
              <div className="value-item">
                <span className="label">Pulse</span>
                <span className="value">{m.pulse} bpm</span>
              </div>
            )}
          </div>
          {m.notes && <div className="card-notes">{m.notes}</div>}
        </div>
      ))}
    </div>
  );
}
