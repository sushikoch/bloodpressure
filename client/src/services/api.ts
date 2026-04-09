import { Measurement, CreateMeasurementInput } from '../types/measurement';

const API_URL = import.meta.env.VITE_API_URL || '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
  }
  return response.json();
}

export async function postMeasurement(data: CreateMeasurementInput): Promise<Measurement> {
  const response = await fetch(`${API_URL}/measurements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await handleResponse<{ data: Measurement }>(response);
  return result.data;
}

export async function getMeasurements(): Promise<Measurement[]> {
  const response = await fetch(`${API_URL}/measurements`);
  const result = await handleResponse<{ data: Measurement[] }>(response);
  return result.data;
}

export async function downloadCSV(): Promise<void> {
  const response = await fetch(`${API_URL}/measurements/export/csv`);
  if (!response.ok) throw new Error('Failed to download CSV');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blood-pressure-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
