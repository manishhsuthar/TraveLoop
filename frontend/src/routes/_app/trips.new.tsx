import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTrips } from "@/store/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/trips/new")({
  head: () => ({ meta: [{ title: "New trip — Traveloop" }] }),
  component: NewTrip,
});

const covers = [
  { id: "goa", img: "https://source.unsplash.com/1200x800/?goa,beach,india" },
  { id: "jaipur", img: "https://source.unsplash.com/1200x800/?jaipur,fort,india" },
  { id: "ladakh", img: "https://source.unsplash.com/1200x800/?ladakh,india" },
  { id: "kerala", img: "https://source.unsplash.com/1200x800/?kerala,backwaters,india" },
];

function NewTrip() {
  const navigate = useNavigate();
  const create = useTrips((s) => s.createTrip);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [budget, setBudget] = useState("25000");
  const [privacy, setPrivacy] = useState<"private" | "public">("private");
  const [cover, setCover] = useState(covers[0].img);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return toast.error("Title and dates are required.");
    try {
      const id = await create({
        title,
        description,
        startDate,
        endDate,
        cover,
        privacy,
        budget: Number(budget) || 0,
      });
      toast.success("Trip created");
      navigate({ to: "/trips/$tripId", params: { tripId: id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create trip");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8">
      <header>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Compose</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold">A new journey</h1>
      </header>
      <form onSubmit={submit} className="space-y-6 rounded-2xl border bg-card p-6 soft-shadow">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goa Beach Workation" />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What are you dreaming about?" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Start</Label>
            <Input type="date" value={startDate} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>End</Label>
            <Input type="date" value={endDate} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="space-y-2">
              <Label>Budget (INR)</Label>
            <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Cover</Label>
          <div className="grid grid-cols-4 gap-2">
            {covers.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCover(c.img)}
                className={`overflow-hidden rounded-lg border-2 transition ${
                  cover === c.img ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={c.img} alt="" className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Privacy</Label>
          <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as "private" | "public")} className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="private" /> Private
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="public" /> Public (shareable link)
            </label>
          </RadioGroup>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/trips" })}>Cancel</Button>
          <Button type="submit">Create trip</Button>
        </div>
      </form>
    </div>
  );
}
