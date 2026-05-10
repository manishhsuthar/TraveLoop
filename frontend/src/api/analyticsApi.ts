import { apiFetch } from "./axios";

export async function getAnalyticsOverview() {
  return apiFetch<Record<string, any>>("/analytics/overview/");
}

export async function getAdminAnalytics() {
  return apiFetch<Record<string, any>>("/admin-analytics/overview/");
}

export async function patchAdminUser(
  userId: number,
  patch: { is_active?: boolean; is_staff?: boolean },
) {
  return apiFetch<Record<string, any>>(`/admin-analytics/users/${userId}/`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
