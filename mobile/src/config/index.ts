// Central config for env variables and defaults
// Read API base from env. No hard default here — keep it centralized in `.env`.
const apiBaseEnv = (import.meta.env.VITE_API_BASE as string) || '';
if (import.meta.env.DEV && !apiBaseEnv) {
  // eslint-disable-next-line no-console
  console.warn('[config] VITE_API_BASE is not set in .env — API calls may fail');
}
export const API_BASE: string = apiBaseEnv;

// Normalize TILE_URL: prefer the env value. In dev, if the env provides an absolute
// localhost URL we convert it to a relative `/tiles/...` so Vite's proxy handles it
// (avoids CORS and works when served from a different host).
let tileEnv = (import.meta.env.VITE_TILE_URL as string) || 'http://localhost:8080/tiles/{z}/{x}/{y}.png';
if (import.meta.env.DEV) {
  try {
    // If the env value is already a relative path, keep it as-is (don't use URL()).
    if (tileEnv.startsWith('/')) {
      // nothing to do
    } else {
      const u = new URL(tileEnv);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        // Use the path part only and decode percent-encodings (URL() percent-encodes
        // characters like `{`/`}`), so decode to keep placeholders {z}/{x}/{y} intact.
        tileEnv = decodeURIComponent(u.pathname + (u.search || ''));
      }
    }
  } catch (e) {
    // If parsing fails, fallback to tileEnv as-is
  }
}

export const TILE_URL: string = tileEnv;

export default {
  API_BASE,
  TILE_URL,
};
