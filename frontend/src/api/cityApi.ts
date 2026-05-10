import { apiFetch } from "./axios";
import { mapActivity, mapCity } from "./mappers";
import type { BackendActivity, BackendCity } from "./types";

export async function listCities(search = "") {
  const query = new URLSearchParams({ country: "India" });
  if (search) query.set("search", search);
  const cities = await apiFetch<BackendCity[]>(`/cities/?${query.toString()}`, { skipAuth: true });
  return cities.map(mapCity);
}

export async function listActivities(
  params: { search?: string; activityType?: string; maxCost?: string; cityId?: string } = {},
) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.activityType && params.activityType !== "All") query.set("activity_type", params.activityType.toLowerCase());
  if (params.maxCost) query.set("max_cost", params.maxCost);
  if (params.cityId) query.set("city", params.cityId);
  const activities = await apiFetch<BackendActivity[]>(`/activities/?${query.toString()}`, { skipAuth: true });
  return activities.map(mapActivity);
}
