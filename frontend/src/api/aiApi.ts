import { apiFetch } from "./axios";

export async function generateItinerary(input: {
  destination: string;
  budget: number;
  number_of_days: number;
  interests: string[];
}) {
  return apiFetch<Record<string, any>>("/ai/generate-itinerary/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
