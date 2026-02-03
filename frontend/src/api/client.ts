/**
 * API client for KC Admin frontend.
 * Base URL is set via VITE_API_URL (e.g. your ngrok URL: https://xxxx.ngrok-free.app).
 */

import { getAccessToken } from "../utils/auth";

const getBaseURL = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, ""); // strip trailing slash
  // Fallback for local dev when env not set
  return "http://localhost:3000";
};

export const API_BASE_URL = getBaseURL();

const baseURL = API_BASE_URL;

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

/**
 * Simple fetch-based client that uses VITE_API_URL.
 * Sends Authorization: Bearer <token> when user is logged in.
 */
export const api = {
  async get<T = unknown>(path: string, options?: RequestInit): Promise<T> {
    const url = `${baseURL}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      ...options,
      method: "GET",
      headers: getHeaders(options?.headers),
    });
    const text = await res.text().catch(() => res.statusText);
    if (!res.ok) throw new Error(text || `Request failed (${res.status})`);
    return parseJsonOrThrow<T>(text, path, res.status);
  },

  async post<T = unknown>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const url = `${baseURL}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      ...options,
      method: "POST",
      headers: getHeaders(options?.headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text().catch(() => res.statusText);
    if (!res.ok) throw new Error(text || `Request failed (${res.status})`);
    return parseJsonOrThrow<T>(text, path, res.status);
  },

  async patch<T = unknown>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const url = `${baseURL}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      ...options,
      method: "PATCH",
      headers: getHeaders(options?.headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text().catch(() => res.statusText);
    if (!res.ok) throw new Error(text || `Request failed (${res.status})`);
    return parseJsonOrThrow<T>(text, path, res.status);
  },

  async put<T = unknown>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    const url = `${baseURL}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      ...options,
      method: "PUT",
      headers: getHeaders(options?.headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text().catch(() => res.statusText);
    if (!res.ok) throw new Error(text || `Request failed (${res.status})`);
    return parseJsonOrThrow<T>(text, path, res.status);
  },

  async delete<T = unknown>(path: string, options?: RequestInit): Promise<T> {
    const url = `${baseURL}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      ...options,
      method: "DELETE",
      headers: getHeaders(options?.headers),
    });
    const text = await res.text().catch(() => res.statusText);
    if (!res.ok) throw new Error(text || `Request failed (${res.status})`);
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
