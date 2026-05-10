import { apiFetch } from "./axios";
import { mapTrip } from "./mappers";
import type { BackendTrip, Trip, Visibility } from "./types";

export async function listTrips(): Promise<Trip[]> {
  const trips = await apiFetch<BackendTrip[]>("/trips/");
  return trips.map(mapTrip);
}

export async function getTrip(id: string): Promise<Trip> {
  const trip = await apiFetch<BackendTrip>(`/trips/${id}/`);
  return mapTrip(trip);
}

export async function createTripApi(input: {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  privacy: Visibility;
  cover?: string;
}): Promise<Trip> {
  const trip = await apiFetch<BackendTrip>("/trips/", {
    method: "POST",
    body: JSON.stringify({
      name: input.title,
      description: input.description,
      start_date: input.startDate,
      end_date: input.endDate,
      budget_limit: input.budget,
      visibility: input.privacy,
      cover_photo_url: input.cover ?? "",
    }),
  });
  return mapTrip(trip);
}

export async function updateTripApi(id: string, patch: Partial<Trip>): Promise<Trip> {
  const body: Record<string, unknown> = {};
  if (patch.title !== undefined) body.name = patch.title;
  if (patch.description !== undefined) body.description = patch.description;
  if (patch.startDate !== undefined) body.start_date = patch.startDate;
  if (patch.endDate !== undefined) body.end_date = patch.endDate;
  if (patch.budget !== undefined) body.budget_limit = patch.budget;
  if (patch.privacy !== undefined) body.visibility = patch.privacy;
  if (patch.cover !== undefined) body.cover_photo_url = patch.cover;

  const trip = await apiFetch<BackendTrip>(`/trips/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return mapTrip(trip);
}

export async function deleteTripApi(id: string) {
  await apiFetch(`/trips/${id}/`, { method: "DELETE" });
}

export async function addStopApi(tripId: string, stop: { cityId: string; startDate: string; endDate: string; order: number }) {
  await apiFetch("/stops/", {
    method: "POST",
    body: JSON.stringify({
      trip: Number(tripId),
      city: Number(stop.cityId),
      start_date: stop.startDate,
      end_date: stop.endDate,
      order: stop.order,
    }),
  });
  return getTrip(tripId);
}

export async function removeStopApi(tripId: string, stopId: string) {
  await apiFetch(`/stops/${stopId}/`, { method: "DELETE" });
  return getTrip(tripId);
}

export async function addStopActivityApi(tripId: string, stopId: string, activityId: string, dayDate: string) {
  await apiFetch("/stop-activities/", {
    method: "POST",
    body: JSON.stringify({
      trip_stop: Number(stopId),
      activity: Number(activityId),
      day_date: dayDate,
    }),
  });
  return getTrip(tripId);
}

export async function removeStopActivityApi(tripId: string, stopActivityId: string) {
  await apiFetch(`/stop-activities/${stopActivityId}/`, { method: "DELETE" });
  return getTrip(tripId);
}

export async function listPackingItems() {
  return apiFetch("/packing-items/");
}

export async function addPackingApi(tripId: string, item: { label: string; category: string; packed: boolean }) {
  await apiFetch("/packing-items/", {
    method: "POST",
    body: JSON.stringify({
      trip: Number(tripId),
      title: item.label,
      category: item.category.toLowerCase(),
      is_packed: item.packed,
    }),
  });
  return getTrip(tripId);
}

export async function togglePackingApi(tripId: string, id: string, packed: boolean) {
  await apiFetch(`/packing-items/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ is_packed: packed }),
  });
  return getTrip(tripId);
}

export async function removePackingApi(tripId: string, id: string) {
  await apiFetch(`/packing-items/${id}/`, { method: "DELETE" });
  return getTrip(tripId);
}

export async function addNoteApi(tripId: string, note: { title: string; body: string }) {
  await apiFetch("/notes/", {
    method: "POST",
    body: JSON.stringify({ trip: Number(tripId), title: note.title, content: note.body }),
  });
  return getTrip(tripId);
}

export async function removeNoteApi(tripId: string, id: string) {
  await apiFetch(`/notes/${id}/`, { method: "DELETE" });
  return getTrip(tripId);
}

export async function getTripBudget(id: string) {
  return apiFetch<Record<string, any>>(`/trips/${id}/budget/`);
}

export async function getPublicTrip(id: string) {
  const trip = await apiFetch<BackendTrip>(`/public/trips/${id}/`, { skipAuth: true });
  return mapTrip(trip);
}

export async function copyPublicTrip(id: string) {
  const trip = await apiFetch<BackendTrip>(`/public/trips/${id}/copy/`, { method: "POST" });
  return mapTrip(trip);
}
