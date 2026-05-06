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
export const INVALID_AUTH_EVENT = "seringym:invalid-auth";

function getToken() {
  return localStorage.getItem("gympro_token");
}

function clearStoredAuth() {
  localStorage.removeItem("gympro_token");
  localStorage.removeItem("gympro_user");
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
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
        if (response.status === 401) {
          clearStoredAuth();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event(INVALID_AUTH_EVENT));
          }
        }
        throw new Error(payload.message ?? "Bir hata oluştu.");
      }

      return payload as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Bir hata oluştu.");
      if (attempt < 2) {
        await wait(1200 * (attempt + 1));
      }
    }
  }

  throw lastError ?? new Error("Bir hata oluştu.");
}
