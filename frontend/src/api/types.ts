export type Visibility = "private" | "public" | "shared";

export interface BackendCity {
  id: number;
  name: string;
  country: string;
  region: string;
  cost_index: string | number;
  popularity_score: number;
}

export interface BackendActivity {
  id: number;
  city: number;
  city_name?: string;
  name: string;
  description: string;
  activity_type: string;
  estimated_cost: string | number;
  estimated_cost_formatted?: string;
  duration_hours: string | number;
  currency?: string;
}

export interface BackendStopActivity {
  id: number;
  trip_stop: number;
  activity: number;
  activity_detail?: BackendActivity;
  day_date: string;
  start_time?: string | null;
  estimated_cost_override?: string | number | null;
  final_estimated_cost?: number;
  final_estimated_cost_formatted?: string;
}

export interface BackendTripStop {
  id: number;
  trip: number;
  city: number;
  city_detail?: BackendCity;
  start_date: string;
  end_date: string;
  order: number;
  duration_days?: number;
  stop_activities?: BackendStopActivity[];
}

export interface BackendPackingItem {
  id: number;
  trip: number;
  title: string;
  category: string;
  is_packed: boolean;
}

export interface BackendTripNote {
  id: number;
  trip: number;
  trip_stop?: number | null;
  title: string;
  content: string;
  created_at: string;
}

export interface BackendTrip {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  budget_limit: string | number;
  budget_limit_formatted?: string;
  visibility: Visibility;
  cover_photo_url?: string;
  duration_days?: number;
  trip_status?: string;
  currency?: string;
  stops?: BackendTripStop[];
  packing_items?: BackendPackingItem[];
  notes?: BackendTripNote[];
}

export interface TripStop {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  startDate: string;
  endDate: string;
  activityIds: string[];
  stopActivities: BackendStopActivity[];
}

export interface PackingItem {
  id: string;
  label: string;
  category: string;
  packed: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  body: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  cover: string;
  privacy: Visibility;
  shareSlug: string;
  stops: TripStop[];
  packing: PackingItem[];
  journal: JournalEntry[];
  budget: number;
  budgetFormatted?: string;
  currency: "INR";
  tripStatus?: string;
}
