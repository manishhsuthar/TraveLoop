import { apiFetch, tokenStorage } from "./axios";

interface TokenResponse {
  access: string;
  refresh: string;
}

export async function loginApi(username: string, password: string) {
  const tokens = await apiFetch<TokenResponse>("/auth/login/", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ username, password }),
  });
  tokenStorage.setTokens(tokens.access, tokens.refresh);
  return tokens;
}

export async function registerApi(username: string, email: string, password: string) {
  await apiFetch("/auth/register/", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({
      username,
      email,
      password,
      country: "India",
      preferences: "Indian destinations, INR budgets, food, heritage, beaches, mountains",
    }),
  });
  return loginApi(username, password);
}

export function logoutApi() {
  tokenStorage.clear();
}

export const hasSession = () => Boolean(tokenStorage.getAccess() || tokenStorage.getRefresh());
