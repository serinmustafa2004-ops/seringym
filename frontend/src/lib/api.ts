export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

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

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? "Bir hata oluştu.");
  }

  return payload as T;
}
