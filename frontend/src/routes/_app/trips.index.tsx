import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTrips } from "@/store/trips";
import { TripCard } from "@/components/trip-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/_app/trips/")({
  head: () => ({ meta: [{ title: "My Trips — Traveloop" }] }),
  component: TripsList,
});

function TripsList() {
  const trips = useTrips((s) => s.trips);
  const loadTrips = useTrips((s) => s.loadTrips);
  const loading = useTrips((s) => s.loading);
  const [q, setQ] = useState("");
  useEffect(() => {
    loadTrips();
  }, [loadTrips]);
  const filtered = trips.filter((t) => t.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Library</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">My trips</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search trips" className="pl-9" />
          </div>
          <Button asChild>
            <Link to="/trips/new"><Plus className="mr-1 h-4 w-4" /> New</Link>
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="rounded-2xl border p-10 text-center text-muted-foreground">Loading trips…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="text-muted-foreground">No trips match your search.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => <TripCard key={t.id} trip={t} index={i} />)}
        </div>
      )}
    </div>
  );
}
