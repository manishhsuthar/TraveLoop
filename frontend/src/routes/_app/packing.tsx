import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTrips } from "@/store/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/packing")({
  head: () => ({ meta: [{ title: "Packing — Traveloop" }] }),
  component: PackingPage,
});

const TEMPLATES: Record<string, string[]> = {
  clothing: ["Cotton shirts", "Walking shoes", "Light jacket", "Rain cover"],
  documents: ["Aadhaar / ID proof", "Hotel bookings", "Train or flight tickets"],
  electronics: ["Power bank", "Phone charger", "Earphones"],
  other: ["UPI-enabled payment app", "Reusable water bottle", "Sunscreen SPF 50"],
};

function PackingPage() {
  const trips = useTrips((s) => s.trips);
  const loadTrips = useTrips((s) => s.loadTrips);
  const add = useTrips((s) => s.addPacking);
  const toggle = useTrips((s) => s.togglePacking);
  const remove = useTrips((s) => s.removePacking);
  const [tripId, setTripId] = useState(trips[0]?.id ?? "");
  const [item, setItem] = useState("");
  const [cat, setCat] = useState("other");
  const trip = trips.find((t) => t.id === tripId);

  useEffect(() => { loadTrips(); }, [loadTrips]);
  useEffect(() => {
    if (!tripId && trips[0]?.id) setTripId(trips[0].id);
  }, [tripId, trips]);

  if (!trip) return <div className="p-8 text-muted-foreground">Create a trip first.</div>;

  const grouped = trip.packing.reduce<Record<string, typeof trip.packing>>((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});

  const packed = trip.packing.filter((p) => p.packed).length;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Checklist</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Packing</h1>
          <p className="mt-1 text-sm text-muted-foreground">{packed} / {trip.packing.length} packed</p>
        </div>
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={tripId} onChange={(e) => setTripId(e.target.value)}>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </header>

      <section className="rounded-2xl border bg-card p-5 soft-shadow">
        <div className="grid gap-3 md:grid-cols-3">
          <div><Label>Item</Label><Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Sunscreen SPF 50" /></div>
          <div><Label>Category</Label><Input value={cat} onChange={(e) => setCat(e.target.value)} /></div>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={() => {
                if (!item) return toast.error("Add an item name");
                add(trip.id, { label: item, category: cat || "other", packed: false });
                setItem("");
                toast.success("Added");
              }}
            >Add</Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Templates:</span>
          {Object.keys(TEMPLATES).map((k) => (
            <Button key={k} size="sm" variant="outline"
              onClick={() => {
                TEMPLATES[k].forEach((label) => add(trip.id, { label, category: k, packed: false }));
                toast.success(`Added ${k} template`);
              }}>
              {k}
            </Button>
          ))}
        </div>
      </section>

      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat} className="rounded-2xl border bg-card p-5 soft-shadow">
          <h3 className="font-serif text-2xl">{cat}</h3>
          <ul className="mt-3 divide-y">
            {items.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <Checkbox checked={p.packed} onCheckedChange={() => toggle(trip.id, p.id)} />
                <span className={p.packed ? "line-through text-muted-foreground" : ""}>{p.label}</span>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={() => remove(trip.id, p.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {trip.packing.length === 0 && (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Nothing packed yet — add items above.</div>
      )}
    </div>
  );
}
