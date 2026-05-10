import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { getAnalyticsOverview } from "@/api/analyticsApi";
import { listActivities, listCities } from "@/api/cityApi";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin — Traveloop" }] }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const u = useAuth.getState().user;
    if (!u || u.role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: Admin,
});

const COLORS = ["oklch(0.62 0.16 38)", "oklch(0.78 0.13 75)", "oklch(0.62 0.06 155)", "oklch(0.55 0.12 240)", "oklch(0.45 0.15 320)"];

function Admin() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [cities, setCities] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    getAnalyticsOverview().then(setAnalytics).catch(() => setAnalytics(null));
    listCities().then(setCities).catch(() => setCities([]));
    listActivities().then(setActivities).catch(() => setActivities([]));
  }, []);

  const cityCounts = (analytics?.most_visited_cities ?? []).map((city: any) => ({ name: city.city__name, trips: city.visits }));
  const catCounts = (analytics?.activity_category_distribution ?? []).map((cat: any) => ({ name: cat.activity__activity_type, value: cat.count }));

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-8">
      <header>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Operations</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold">Admin dashboard</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Trips", value: analytics?.total_trips ?? 0 },
          { label: "Cities", value: cities.length },
          { label: "Activities", value: activities.length },
          { label: "Currency", value: "INR" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 soft-shadow">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-2 font-serif text-3xl font-semibold">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 soft-shadow">
          <h3 className="font-serif text-2xl">Top cities</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={cityCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 75)" />
                <XAxis dataKey="name" stroke="oklch(0.45 0.02 60)" />
                <YAxis stroke="oklch(0.45 0.02 60)" />
                <Tooltip />
                <Bar dataKey="trips" fill="oklch(0.62 0.16 38)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 soft-shadow">
          <h3 className="font-serif text-2xl">Popular activity types</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={catCounts} dataKey="value" outerRadius={100} label>
                  {catCounts.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
