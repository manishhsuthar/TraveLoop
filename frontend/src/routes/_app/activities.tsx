import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Clock, IndianRupee, X, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listActivities } from "@/api/cityApi";
import { inr } from "@/api/mappers";

export const Route = createFileRoute("/_app/activities")({
  head: () => ({ meta: [{ title: "Activities — Traveloop" }] }),
  component: ActivitiesPage,
});

const activityCategories = ["sightseeing", "food", "adventure", "culture", "nightlife"] as const;

function ActivitiesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [maxCost, setMaxCost] = useState<"All" | "1000" | "2500" | "5000">("All");
  const [selected, setSelected] = useState<any | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listActivities({ search: q, activityType: cat, maxCost: maxCost === "All" ? undefined : maxCost })
      .then(setActivities)
      .finally(() => setLoading(false));
  }, [q, cat, maxCost]);

  const filtered = useMemo(() => activities, [activities]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Things to do</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold md:text-5xl">Indian travel experiences</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Browse real backend activities across Indian destinations with INR pricing.</p>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activities, cities…" className="pl-9 h-11" />
        </div>

        <Tabs value={cat} onValueChange={setCat}>
          <TabsList className="flex flex-wrap gap-1 bg-transparent p-0">
            {(["All", ...activityCategories] as const).map((c) => (
              <TabsTrigger key={c} value={c} className="rounded-full capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{c}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-1">
          {(["All", "1000", "2500", "5000"] as const).map((p) => (
            <Button key={p} size="sm" variant={maxCost === p ? "default" : "outline"} onClick={() => setMaxCost(p)}>{p === "All" ? "Any price" : `Under ${inr(p)}`}</Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border p-10 text-center text-muted-foreground">Loading activities…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-16 text-center text-muted-foreground">No activities match your filters.</div>
      ) : (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((a, i) => (
              <motion.button
                key={a.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.025 }}
                whileHover={{ y: -3 }}
                onClick={() => setSelected(a)}
                className="group block w-full overflow-hidden rounded-2xl border bg-card p-5 text-left soft-shadow"
              >
                <Badge className="capitalize">{a.category}</Badge>
                <h3 className="mt-3 font-serif text-2xl leading-tight">{a.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span><MapPin className="mr-1 inline h-3 w-3" />{a.city}</span>
                  <span><Clock className="mr-1 inline h-3 w-3" />{a.duration}</span>
                  <span className="font-medium text-foreground">{a.costFormatted ?? inr(a.cost)}</span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-xl">
          {selected && (
            <>
              <DialogHeader><DialogTitle className="font-serif text-3xl">{selected.name}</DialogTitle></DialogHeader>
              <p className="text-muted-foreground">{selected.description}</p>
              <div className="grid grid-cols-3 gap-3 rounded-xl border bg-muted/40 p-3 text-center text-sm">
                <div><p className="flex items-center justify-center gap-1 font-serif text-xl"><Star className="h-4 w-4 fill-ochre text-ochre" />India</p><p className="text-xs text-muted-foreground">focus</p></div>
                <div><p className="font-serif text-xl">{selected.duration}</p><p className="text-xs text-muted-foreground">duration</p></div>
                <div><p className="font-serif text-xl">{selected.costFormatted ?? inr(selected.cost)}</p><p className="text-xs text-muted-foreground">cost</p></div>
              </div>
              <Button variant="outline" onClick={() => setSelected(null)}><X className="mr-2 h-4 w-4" /> Close</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
