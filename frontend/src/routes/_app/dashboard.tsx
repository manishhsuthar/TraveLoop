import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTrips } from "@/store/trips";
import { useAuth } from "@/store/auth";
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Wallet, MapPinned, Calendar } from "lucide-react";
import { listCities } from "@/api/cityApi";
import { getAnalyticsOverview } from "@/api/analyticsApi";
import { inr } from "@/api/mappers";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Traveloop" }] }),
  component: Dashboard,
});

function Dashboard() {
  const trips = useTrips((s) => s.trips);
  const loadTrips = useTrips((s) => s.loadTrips);
  const loading = useTrips((s) => s.loading);
  const user = useAuth((s) => s.user);
  const [cities, setCities] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);

  useEffect(() => {
    loadTrips();
    getAnalyticsOverview().then(setAnalytics).catch(() => setAnalytics(null));
    listCities().then((items) => setCities(items.slice(0, 4))).catch(() => setCities([]));
  }, [loadTrips]);

  const upcoming = trips.filter((t) => new Date(t.endDate) >= new Date());
  const totalBudget = trips.reduce((a, t) => a + t.budget, 0);
  const stops = trips.reduce((a, t) => a + t.stops.length, 0);
  const totalSpent = Number(analytics?.total_estimated_spending ?? 0);

  const stats = [
    { label: "Trips", value: trips.length, icon: MapPinned },
    { label: "Upcoming", value: upcoming.length, icon: Calendar },
    { label: "Cities", value: stops, icon: MapPinned },
    { label: "Budget", value: inr(totalBudget), icon: Wallet },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 md:px-8">
      <section>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Welcome back</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold md:text-5xl">
          Hello, {user?.name?.split(" ")[0] ?? "traveler"}.
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          You're tracking {inr(totalSpent)} in planned activity spend across {trips.length} Indian trip{trips.length === 1 ? "" : "s"}.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/trips/new"><Plus className="mr-1.5 h-4 w-4" /> New trip</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/budget">View budget</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border bg-card p-5 soft-shadow"
          >
            <s.icon className="h-4 w-4 text-primary" />
            <div className="mt-3 font-serif text-3xl font-semibold">{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-3xl">Recent trips</h2>
          <Link to="/trips" className="text-sm text-muted-foreground hover:text-primary">View all →</Link>
        </div>
        {loading ? (
          <div className="rounded-2xl border p-10 text-center text-muted-foreground">Loading your trips…</div>
        ) : trips.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.slice(0, 3).map((t, i) => <TripCard key={t.id} trip={t} index={i} />)}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 soft-shadow">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-serif text-2xl">AI suggestions</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              "Try Goa for a ₹25,000 beach workation with Old Goa heritage and seafood trails.",
              "Rajasthan works beautifully as a Jaipur, Udaipur, and Jaisalmer heritage circuit.",
              "For mountain travel, keep buffer days in Himachal or Leh Ladakh for road conditions.",
              "Use UPI-friendly budgets and leave room for local food, markets, and guided experiences.",
            ].map((s) => (
              <li key={s} className="rounded-xl border bg-background/60 p-4">{s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-6 soft-shadow">
          <h3 className="font-serif text-2xl">Recommended</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {cities.map((c) => (
              <div key={c.id} className="overflow-hidden rounded-xl">
                <img src={c.image} alt={c.name} loading="lazy" className="aspect-square w-full object-cover" />
                <div className="p-2">
                  <div className="font-serif text-base">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.country}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <h3 className="font-serif text-2xl">No trips yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Start by creating your first journey.</p>
      <Button asChild className="mt-4"><Link to="/trips/new">Create trip</Link></Button>
    </div>
  );
}
