import type { BackendActivity, BackendCity, BackendTrip, Trip } from "./types";

export const inr = (value: number | string | null | undefined) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export function mapTrip(trip: BackendTrip): Trip {
  return {
    id: String(trip.id),
    title: trip.name,
    description: trip.description,
    startDate: trip.start_date,
    endDate: trip.end_date,
    cover: trip.cover_photo_url || indianCoverForTrip(trip.name),
    privacy: trip.visibility,
    shareSlug: String(trip.id),
    budget: Number(trip.budget_limit ?? 0),
    budgetFormatted: trip.budget_limit_formatted ?? inr(trip.budget_limit),
    currency: "INR",
    tripStatus: trip.trip_status,
    destination: trip.destination ?? "",
    preferences: trip.preferences ?? "",
    stops: (trip.stops ?? []).map((stop) => ({
      id: String(stop.id),
      cityId: String(stop.city),
      cityName: stop.city_detail?.name ?? "Indian destination",
      country: stop.city_detail?.country ?? "India",
      startDate: stop.start_date,
      endDate: stop.end_date,
      activityIds: (stop.stop_activities ?? []).map((item) => String(item.activity)),
      stopActivities: stop.stop_activities ?? [],
    })),
    packing: (trip.packing_items ?? []).map((item) => ({
      id: String(item.id),
      label: item.title,
      category: item.category,
      packed: item.is_packed,
    })),
    journal: (trip.notes ?? []).map((note) => ({
      id: String(note.id),
      date: note.created_at?.slice(0, 10) ?? trip.start_date,
      title: note.title,
      body: note.content,
    })),
  };
}

export function mapCity(city: BackendCity) {
  return {
    id: String(city.id),
    name: city.name,
    country: city.country,
    region: city.region,
    costIndex: Number(city.cost_index ?? 0),
    popularity: city.popularity_score,
    image: indianCoverForTrip(city.name),
  };
}

export function mapActivity(activity: BackendActivity) {
  return {
    id: String(activity.id),
    name: activity.name,
    category: activity.activity_type,
    cost: Number(activity.estimated_cost ?? 0),
    costFormatted: activity.estimated_cost_formatted ?? inr(activity.estimated_cost),
    duration: `${Number(activity.duration_hours ?? 0)}h`,
    city: activity.city_name ?? "India",
    description: activity.description,
  };
}

export function indianCoverForTrip(name: string) {
  const encoded = encodeURIComponent(`${name || "India travel"} tourism India`);
  return `https://source.unsplash.com/1200x800/?${encoded}`;
}
