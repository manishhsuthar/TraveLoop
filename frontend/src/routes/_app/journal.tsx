import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTrips } from "@/store/trips";
import { formatDisplayDate } from "@/lib/date";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/journal")({
  head: () => ({ meta: [{ title: "Journal — Traveloop" }] }),
  component: JournalPage,
});

function JournalPage() {
  const trips = useTrips((s) => s.trips);
  const loadTrips = useTrips((s) => s.loadTrips);
  const addJournal = useTrips((s) => s.addJournal);
  const removeJournal = useTrips((s) => s.removeJournal);
  const [tripId, setTripId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => { loadTrips(); }, [loadTrips]);
  useEffect(() => {
    if (!tripId && trips[0]?.id) setTripId(trips[0].id);
  }, [tripId, trips]);

  const trip = trips.find((item) => item.id === tripId);

  if (!trip) {
    return <div className="p-8 text-muted-foreground">Create a trip first.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Notes</span>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Trip journal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Notes are saved through the Django backend.</p>
        </div>
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={tripId} onChange={(e) => setTripId(e.target.value)}>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </header>

      <section className="rounded-2xl border bg-card p-5 soft-shadow">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="font-serif text-2xl">New note</h2>
        </div>
        <div className="mt-4 space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Train booking reminder" />
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Write your note…" />
          <Button
            onClick={async () => {
              if (!title.trim()) return toast.error("Add a title");
              await addJournal(trip.id, { date: new Date().toISOString().slice(0, 10), title, body });
              setTitle("");
              setBody("");
              toast.success("Note saved");
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> Save note
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        {trip.journal.map((note) => (
          <article key={note.id} className="rounded-2xl border bg-card p-5 soft-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{formatDisplayDate(note.date)}</p>
                <h3 className="mt-1 font-serif text-2xl">{note.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{note.body}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeJournal(trip.id, note.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </article>
        ))}
        {trip.journal.length === 0 && (
          <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No notes yet.</div>
        )}
      </section>
    </div>
  );
}
