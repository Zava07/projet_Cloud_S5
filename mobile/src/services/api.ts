import { API_BASE } from '@/config';

function buildUrl(path: string) {
  const base = API_BASE.replace(/\/$/, '');
  const p = path.replace(/^\//, '');
  return `${base}/${p}`;
}

export async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status} ${res.statusText}: ${text}`);
  }
  // try parse JSON, but tolerate empty responses
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export const apiGet = <T = any>(path: string) => apiFetch<T>(path, { method: 'GET' });
export const apiPost = <T = any>(path: string, body?: any) =>
  apiFetch<T>(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
