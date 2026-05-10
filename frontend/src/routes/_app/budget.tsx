import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTrips } from "@/store/trips";
import { getTripBudget } from "@/api/tripApi";
import { getAnalyticsOverview } from "@/api/analyticsApi";
import { inr } from "@/api/mappers";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/budget")({
  head: () => ({ meta: [{ title: "Budget — Traveloop" }] }),
  component: BudgetPage,
});

const COLORS = ["oklch(0.62 0.16 38)", "oklch(0.78 0.13 75)", "oklch(0.62 0.06 155)", "oklch(0.55 0.12 240)"];

function BudgetPage() {
  const trips = useTrips((s) => s.trips);
  const loadTrips = useTrips((s) => s.loadTrips);
  const [tripId, setTripId] = useState("");
  const [budget, setBudget] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);

  useEffect(() => {
    loadTrips();
    getAnalyticsOverview().then(setAnalytics).catch(() => setAnalytics(null));
  }, [loadTrips]);

  useEffect(() => {
    if (!tripId && trips[0]?.id) setTripId(trips[0].id);
  }, [tripId, trips]);

  useEffect(() => {
    if (!tripId) return;
    getTripBudget(tripId).then(setBudget).catch(() => setBudget(null));
  }, [tripId]);

  const trip = trips.find((t) => t.id === tripId);
  const categoryData = useMemo(
    () => Object.entries(budget?.category_breakdown ?? {}).map(([name, value]) => ({ name, value: Number(value) })),
    [budget]
  );
  const cityData = (analytics?.most_visited_cities ?? []).map((city: any) => ({
    name: city.city__name,
    visits: city.visits,
  }));
  const ratio = Math.min(100, Number(budget?.overbudget_percentage ?? 0) || (budget?.budget_limit ? (budget.estimated_total / budget.budget_limit) * 100 : 0));

  if (trips.length === 0) {
    return <div className="p-8"><p className="text-muted-foreground">Create a trip first.</p></div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Money</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">INR budget dashboard</h1>
        </div>
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={tripId} onChange={(e) => setTripId(e.target.value)}>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Budget", value: budget?.budget_limit_formatted ?? inr(trip?.budget) },
          { label: "Estimated", value: budget?.estimated_total_formatted ?? inr(0) },
          { label: "Per day", value: budget?.average_per_day_formatted ?? inr(0) },
          { label: "Days", value: budget?.total_trip_days ?? trip?.stops.length ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 soft-shadow">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-2 font-serif text-3xl font-semibold">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-card p-5 soft-shadow">
        <div className="flex items-center justify-between text-sm">
          <span>{Math.round(ratio)}% of budget used</span>
          <span className="text-muted-foreground">{budget?.estimated_total_formatted ?? inr(0)} / {budget?.budget_limit_formatted ?? inr(trip?.budget)}</span>
        </div>
        <Progress value={Math.min(100, ratio)} className="mt-2" />
        {budget?.is_over_budget && <p className="mt-2 text-sm text-destructive">This itinerary is over budget by {budget.overbudget_amount_formatted}.</p>}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 soft-shadow">
          <h3 className="font-serif text-2xl">Activity cost by category</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryData} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => inr(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {categoryData.length === 0 && <p className="text-sm text-muted-foreground">Add activities to see category spend.</p>}
        </div>
        <div className="rounded-2xl border bg-card p-6 soft-shadow">
          <h3 className="font-serif text-2xl">Most visited cities</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 75)" />
                <XAxis dataKey="name" stroke="oklch(0.45 0.02 60)" />
                <YAxis allowDecimals={false} stroke="oklch(0.45 0.02 60)" />
                <Tooltip />
                <Bar dataKey="visits" fill="oklch(0.62 0.16 38)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
