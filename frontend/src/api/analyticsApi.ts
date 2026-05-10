import { apiFetch } from "./axios";

export async function getAnalyticsOverview() {
  return apiFetch<Record<string, any>>("/analytics/overview/");
}
