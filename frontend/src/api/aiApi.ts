import { apiFetch } from "./axios";

export interface AIActivitySuggestion {
  time: string;
  name: string;
  category: string;
  estimated_cost_inr: number;
  estimated_cost_formatted: string;
}

export interface AIDaySuggestion {
  day: number;
  city: string;
  title: string;
  currency: string;
  estimated_cost_inr: number;
  estimated_cost_formatted: string;
  activities: AIActivitySuggestion[];
}

export interface AIItineraryResponse {
  destination: string;
  primary_city: string;
  currency: string;
  estimated_budget_inr: number;
  estimated_budget_formatted: string;
  number_of_days: number;
  interests: string[];
  days: AIDaySuggestion[];
  summary: {
    estimated_total_inr: number;
    estimated_total_formatted: string;
    average_per_day_inr: number;
    average_per_day_formatted: string;
    travel_style: string;
  };
  provider: string;
}

export async function generateItinerary(input: {
  destination: string;
  budget: number;
  number_of_days: number;
  interests: string[];
}) {
  return apiFetch<AIItineraryResponse>("/ai/generate-itinerary/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
