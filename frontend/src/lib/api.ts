function resolveApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined" && window.location.hostname.endsWith("vercel.app")) {
    return "https://seringym-backend.onrender.com/api";
  }

  return "http://localhost:4000/api";
}

export const API_URL = resolveApiUrl();

function getToken() {
  return localStorage.getItem("gympro_token");
}

export function getAuthHeaders(additional: HeadersInit = {}) {
  const headers = new Headers(additional);
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}) {
  const headers = getAuthHeaders(options.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const rawText = await response.text();
  let payload: { message?: string } = {};

  try {
    payload = rawText ? JSON.parse(rawText) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.message ?? "Bir hata oluştu.");
  }

  return payload as T;
}
