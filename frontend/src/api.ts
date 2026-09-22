import type { QualityResponse, GerminationResponse } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function analyzeSeedQuality(endpoint: string, file: File): Promise<QualityResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server returned error ${response.status}`);
  }

  return await response.json();
}

export async function analyzeSeedGermination(endpoint: string, file: File): Promise<GerminationResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server returned error ${response.status}`);
  }

  return await response.json();
}
