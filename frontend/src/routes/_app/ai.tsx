import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, IndianRupee, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { generateItinerary, type AIItineraryResponse } from "@/api/aiApi";
import { useTrips } from "@/store/trips";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai")({
  head: () => ({ meta: [{ title: "AI Planner — Traveloop" }] }),
  component: AIPlanner,
});

function AIPlanner() {
  const trips = useTrips((s) => s.trips);
  const loadTrips = useTrips((s) => s.loadTrips);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("25000");
  const [days, setDays] = useState("5");
  const [interests, setInterests] = useState("");
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<AIItineraryResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  useEffect(() => {
    if (!selectedTripId && trips[0]?.id) setSelectedTripId(trips[0].id);
  }, [selectedTripId, trips]);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === selectedTripId),
    [trips, selectedTripId],
  );

  useEffect(() => {
    if (!selectedTrip) return;
    const cityNames = selectedTrip.stops.map((stop) => stop.cityName);
    const uniqueCities = Array.from(new Set(cityNames));
    const fallbackDestination = selectedTrip.destination || uniqueCities.join(", ") || selectedTrip.title;
    const tripDays = Math.max(
      1,
      Math.round(
        (new Date(selectedTrip.endDate).getTime() - new Date(selectedTrip.startDate).getTime()) / 86400000,
      ) + 1,
    );

    setDestination(fallbackDestination);
    setBudget(String(selectedTrip.budget || 25000));
    setDays(String(tripDays));
    setInterests(selectedTrip.preferences || "culture, food");
  }, [selectedTrip]);

  const runGeneration = async () => {
    if (!destination.trim()) return toast.error("Please select a destination.");
    if ((Number(budget) || 0) <= 0) return toast.error("Budget must be more than 0.");
    if ((Number(days) || 0) <= 0) return toast.error("Duration must be at least 1 day.");
    setLoading(true);
    setError("");
    try {
      const result = await generateItinerary({
        destination,
        budget: Number(budget),
        number_of_days: Number(days),
        interests: interests.split(",").map((item) => item.trim()).filter(Boolean),
      });
      setItinerary(result);
      toast.success("AI itinerary generated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not generate itinerary";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await runGeneration();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-8">
      <header>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">AI itinerary</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold md:text-5xl">Plan an India trip in seconds</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Powered by the backend AI service scaffold with INR-first budgets and Indian travel context.</p>
      </header>

      <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-card p-6 soft-shadow md:grid-cols-4">
        <div className="md:col-span-4">
          <Label>Trip context</Label>
          <select
            className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
          >
            {trips.length === 0 ? (
              <option value="">No trips found</option>
            ) : (
              trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title}
                </option>
              ))
            )}
          </select>
        </div>
        <div><Label>Destination</Label><Input value={destination} onChange={(e) => setDestination(e.target.value)} /></div>
        <div><Label>Budget (INR)</Label><Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
        <div><Label>Days</Label><Input type="number" value={days} onChange={(e) => setDays(e.target.value)} /></div>
        <div><Label>Interests</Label><Input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="nightlife, beach, food" /></div>
        <div className="md:col-span-4 flex flex-wrap items-center gap-2">
          <Button disabled={loading}>
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Generating…" : "Generate itinerary"}
          </Button>
          <Button type="button" variant="outline" disabled={loading} onClick={runGeneration}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </form>

      {loading && (
        <section className="rounded-2xl border bg-card p-6 soft-shadow">
          <p className="text-sm text-muted-foreground">Building city-aware suggestions based on your selected stops, budget, duration, and interests...</p>
        </section>
      )}

      {error && (
        <section className="rounded-2xl border border-destructive/40 bg-card p-6 soft-shadow">
          <p className="text-sm text-destructive">{error}</p>
        </section>
      )}

      {itinerary && (
        <section className="space-y-5">
          <div className="rounded-2xl border bg-card p-6 soft-shadow">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{itinerary.currency}</Badge>
              <h2 className="font-serif text-3xl">{itinerary.destination}</h2>
              <span className="text-muted-foreground">{itinerary.estimated_budget_formatted}</span>
              <span className="text-muted-foreground">{itinerary.summary?.travel_style}</span>
            </div>
          </div>
          <ol className="space-y-4 border-l pl-6">
            {itinerary.days?.map((day) => (
              <li key={day.day} className="relative rounded-2xl border bg-card p-5 soft-shadow">
                <span className="absolute -left-[33px] top-5 grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{day.day}</span>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Day {day.day} • {day.city}</p>
                <h3 className="font-serif text-2xl">{day.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground"><IndianRupee className="mr-1 inline h-3 w-3" />{day.estimated_cost_formatted}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {day.activities?.map((activity) => (
                    <div key={`${day.day}-${activity.time}`} className="rounded-xl border bg-background/60 p-4">
                      <Badge variant="outline">{activity.time}</Badge>
                      <p className="mt-2 font-medium">{activity.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground"><MapPin className="mr-1 inline h-3 w-3" />{activity.category} • {activity.estimated_cost_formatted}</p>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
