import { apiFetch } from "./axios";

export interface SavedCity {
  id: number;
  city_id: number;
  city_name: string;
  country: string;
  region: string;
  created_at: string;
}

export async function listSavedCitiesApi() {
  return apiFetch<SavedCity[]>("/saved-cities/");
}

export async function saveCityApi(cityId: string) {
  return apiFetch<{ id: number; city_id: number; city_name: string; created: boolean }>("/saved-cities/", {
    method: "POST",
    body: JSON.stringify({ city_id: Number(cityId) }),
  });
}

export async function unsaveCityApi(savedCityIdOrCityId: string) {
  await apiFetch(`/saved-cities/${savedCityIdOrCityId}/`, { method: "DELETE" });
}
