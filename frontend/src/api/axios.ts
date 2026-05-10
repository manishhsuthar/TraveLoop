import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

type RequestOptions = RequestInit & { skipAuth?: boolean; retry?: boolean };

export const tokenStorage = {
  getAccess: () => (typeof window === "undefined" ? null : localStorage.getItem("traveloop_access_token")),
  getRefresh: () => (typeof window === "undefined" ? null : localStorage.getItem("traveloop_refresh_token")),
  setTokens: (access: string, refresh?: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("traveloop_access_token", access);
    if (refresh) localStorage.setItem("traveloop_refresh_token", refresh);
  },
  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("traveloop_access_token");
    localStorage.removeItem("traveloop_refresh_token");
  },
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: tokenStorage.getRefresh() }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json();
        tokenStorage.setTokens(data.access, data.refresh);
        return data.access as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");

  const access = tokenStorage.getAccess();
  if (!options.skipAuth && access) headers.set("Authorization", `Bearer ${access}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401 && !options.skipAuth && options.retry !== false && tokenStorage.getRefresh()) {
    const nextAccess = await refreshAccessToken();
    if (nextAccess) return apiFetch<T>(path, { ...options, retry: false });
    tokenStorage.clear();
    toast.error("Session expired. Please sign in again.");
    if (typeof window !== "undefined") window.location.href = "/login";
  }

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const error = await response.json();
      message = error.detail ?? Object.values(error).flat().join(" ");
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export { API_BASE_URL };
