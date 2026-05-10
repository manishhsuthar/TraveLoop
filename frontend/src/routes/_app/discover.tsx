import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, TrendingUp, IndianRupee, Plus, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { listCities } from "@/api/cityApi";
import { inr } from "@/api/mappers";
import { useTrips } from "@/store/trips";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/discover")({
  head: () => ({ meta: [{ title: "Discover cities — Traveloop" }] }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("All");
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const trips = useTrips((s) => s.trips);
  const loadTrips = useTrips((s) => s.loadTrips);
  const addStop = useTrips((s) => s.addStop);

  useEffect(() => { loadTrips(); }, [loadTrips]);
  useEffect(() => {
    setLoading(true);
    listCities(q).then(setCities).finally(() => setLoading(false));
  }, [q]);

  const regions = useMemo(() => ["All", ...Array.from(new Set(cities.map((c) => c.region).filter(Boolean)))], [cities]);
  const filtered = region === "All" ? cities : cities.filter((c) => c.region === region);

  const handleAddToTrip = async (city: any, tripId: string) => {
    const start = new Date(); start.setDate(start.getDate() + 30);
    const end = new Date(start); end.setDate(end.getDate() + 3);
    await addStop(tripId, {
      cityId: city.id,
      cityName: city.name,
      country: city.country,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      activityIds: [],
    });
    toast.success(`Added ${city.name} to your trip`);
    setSelected(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Explore India</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold md:text-5xl">Discover your next Indian city</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Search real backend destinations and add them directly to your itinerary.</p>
      </header>

      <div className="glass sticky top-2 z-10 rounded-2xl p-3 soft-shadow">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Goa, Jaipur, Ladakh…" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1">
            {regions.map((r) => (
              <Button key={r} size="sm" variant={region === r ? "default" : "outline"} onClick={() => setRegion(r)}>{r}</Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-16 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-serif text-2xl">No cities match those filters</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((c, i) => (
              <motion.button
                layout
                key={c.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -4 }}
                onClick={() => setSelected(c)}
                className="group relative overflow-hidden rounded-2xl border bg-card text-left soft-shadow"
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute left-3 top-3 flex gap-1">
                    <Badge className="bg-white/90 text-ink hover:bg-white"><TrendingUp className="mr-1 h-3 w-3" /> {c.popularity}</Badge>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 text-primary-foreground">
                    <h3 className="font-serif text-2xl leading-tight">{c.name}</h3>
                    <p className="text-xs opacity-90"><MapPin className="mr-1 inline h-3 w-3" />{c.country}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">{c.region}</p>
                  <p className="mt-3 text-xs text-muted-foreground"><IndianRupee className="mr-1 inline h-3 w-3" />~{inr(c.costIndex)}/day planning index</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          {selected && (
            <>
              <div className="relative h-64">
                <img src={selected.image} alt={selected.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <button onClick={() => setSelected(null)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white"><X className="h-4 w-4" /></button>
                <div className="absolute bottom-4 left-5 text-primary-foreground">
                  <p className="text-xs uppercase tracking-[0.2em] opacity-80">{selected.region}</p>
                  <h2 className="font-serif text-4xl">{selected.name}</h2>
                  <p className="text-sm opacity-90">{selected.country}</p>
                </div>
              </div>
              <div className="space-y-4 p-6">
                <DialogHeader><DialogTitle className="sr-only">{selected.name}</DialogTitle></DialogHeader>
                <p className="text-muted-foreground">India-focused destination data served from the Traveloop backend.</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Add to a trip</p>
                  {trips.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Create a trip first to add destinations.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {trips.map((t) => (
                        <Button key={t.id} size="sm" variant="outline" onClick={() => handleAddToTrip(selected, t.id)}>
                          <Plus className="mr-1 h-3 w-3" /> {t.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
