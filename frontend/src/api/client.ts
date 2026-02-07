/**
 * API client for KC Admin frontend.
 * Base URL is set via VITE_API_URL (e.g. your ngrok URL: https://xxxx.ngrok-free.app).
 * On 401: tries refresh token once, then retries request; on refresh failure redirects to /login.
 */

import { getAccessToken, getRefreshToken, setTokens, clearSession } from "../utils/auth";

const getBaseURL = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, ""); // strip trailing slash
  // Fallback for local dev when env not set
  return "http://localhost:3000";
};

export const API_BASE_URL = getBaseURL();

const baseURL = API_BASE_URL;
const ADMIN_AUTH_REFRESH_PATH = "/api/v1/admin/auth/refresh";

function getHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // Skip ngrok's browser warning page so API calls get JSON, not HTML
    "ngrok-skip-browser-warning": "true",
    ...extra,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

const HTML_START = /^\s*</;
function parseJsonOrThrow<T>(text: string, path: string, status: number): T {
  const trimmed = text.trim();
  if (HTML_START.test(trimmed)) {
    throw new Error(
      `Server returned HTML instead of JSON (status ${status}). ` +
        `Check that VITE_API_URL points to your API gateway and that the gateway + student/trainer services are running. ` +
        `URL: ${baseURL}${path}`
    );
  }
  if (!trimmed) return undefined as T;
  try {
    return JSON.parse(trimmed) as T;
  } catch (e) {
    throw new Error(trimmed.length > 80 ? trimmed.slice(0, 80) + "…" : trimmed || "Invalid JSON");
  }
}

/** In-flight refresh promise so concurrent 401s share one refresh. */
let refreshPromise: Promise<boolean> | null = null;

/** Try refresh token; store new tokens on success. Returns true if new tokens stored. */
async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearSession();
    window.location.href = "/login";
    return false;
  }
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${baseURL}${ADMIN_AUTH_REFRESH_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ refreshToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success && data?.data?.tokens) {
        setTokens(data.data.tokens);
        return true;
      }
    } finally {
      refreshPromise = null;
    }
    clearSession();
    window.location.href = "/login";
    return false;
  })();
  return refreshPromise;
}

type RequestInitWithBody = RequestInit & { body?: string };
async function fetchWithAuth(
  path: string,
  init: RequestInitWithBody,
  isRetry = false
): Promise<Response> {
  const url = `${baseURL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: getHeaders(init.headers),
  });
  if (res.status === 401 && !isRetry && path !== ADMIN_AUTH_REFRESH_PATH) {
    const ok = await tryRefresh();
    if (ok) return fetchWithAuth(path, init, true);
  }
  return res;
}

/** Error with HTTP status for callers that need to distinguish e.g. 409. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function throwOnNotOk(res: Response, text: string): never {
  const message = text || `Request failed (${res.status})`;
  throw new ApiError(message, res.status);
}

/**
 * Simple fetch-based client that uses VITE_API_URL.
 * Sends Authorization: Bearer <token>; on 401 tries refresh once and retries.
 */
export const api = {
  async get<T = unknown>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetchWithAuth(path, { ...options, method: "GET" });
    const text = await res.text().catch(() => res.statusText);
    if (!res.ok) throwOnNotOk(res, text);
    return parseJsonOrThrow<T>(text, path, res.status);
  },

  async post<T = unknown>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const res = await fetchWithAuth(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text().catch(() => res.statusText);
    if (!res.ok) throwOnNotOk(res, text);
    return parseJsonOrThrow<T>(text, path, res.status);
  },

  async patch<T = unknown>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const res = await fetchWithAuth(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text().catch(() => res.statusText);
    if (!res.ok) throwOnNotOk(res, text);
    return parseJsonOrThrow<T>(text, path, res.status);
  },

  async put<T = unknown>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const res = await fetchWithAuth(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text().catch(() => res.statusText);
    if (!res.ok) throwOnNotOk(res, text);
    return parseJsonOrThrow<T>(text, path, res.status);
  },

  async delete<T = unknown>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetchWithAuth(path, { ...options, method: "DELETE" });
    const text = await res.text().catch(() => res.statusText);
    if (!res.ok) throwOnNotOk(res, text);
    return parseJsonOrThrow<T>(text, path, res.status);
  },
};

/** Base path for admin API (gateway forwards /api/v1/admin to admin-service). */
export const ADMIN_API = "/api/v1/admin";

/** Backend success response shape. */
type ApiResponse<T> = { success: boolean; message?: string; data?: T };

function unwrap<T>(res: ApiResponse<T>): T {
  if (res && res.success === false) throw new Error(res.message || "Request failed");
  return res?.data as T;
}

/** GET and return response.data; throws on success: false or non-2xx. */
export async function getData<T>(path: string): Promise<T> {
  const res = await api.get<ApiResponse<T>>(path);
  return unwrap(res);
}

/** POST and return response.data; throws on success: false or non-2xx. */
export async function postData<T>(path: string, body?: unknown): Promise<T> {
  const res = await api.post<ApiResponse<T>>(path, body);
  return unwrap(res);
}

/** PUT and return response.data. */
export async function putData<T>(path: string, body?: unknown): Promise<T> {
  const res = await api.put<ApiResponse<T>>(path, body);
  return unwrap(res);
}

/** PATCH and return response.data. */
export async function patchData<T>(path: string, body?: unknown): Promise<T> {
  const res = await api.patch<ApiResponse<T>>(path, body);
  return unwrap(res);
}

/** DELETE and return response.data. */
export async function deleteData<T>(path: string): Promise<T> {
  const res = await api.delete<ApiResponse<T>>(path);
  return unwrap(res);
}
