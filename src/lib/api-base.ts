// Resolves the base URL for server API calls (currently just /api/chat).
//
// - Web build: same-origin, so the base is "" and calls stay relative.
// - Native build (Capacitor): the WebView serves the static SPA from a local
//   scheme (capacitor://localhost / https://localhost) and there is no server,
//   so calls MUST target the deployed backend. Set VITE_API_BASE_URL at build
//   time to the hosted origin, e.g. https://app.fisiocare.com
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
