import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTrips } from "@/store/trips";
import { listActivities, listCities } from "@/api/cityApi";
import { inr } from "@/api/mappers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { GripVertical, Trash2, Plus, Globe2, Lock, Share2, Sparkles, Pencil, MapPin, Clock, BookOpen, CalendarDays, List as ListIcon, GanttChart } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatDisplayDate, isDateWithinRange } from "@/lib/date";

export const Route = createFileRoute("/_app/trips/$tripId")({
  head: () => ({ meta: [{ title: "Itinerary — Traveloop" }] }),
  component: TripDetail,
});

const categories = ["sightseeing", "food", "adventure", "culture", "nightlife"] as const;
type ActivityCategory = typeof categories[number];

function TripDetail() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const trip = useTrips((s) => s.getTrip(tripId));
  const loadTrip = useTrips((s) => s.loadTrip);
  const update = useTrips((s) => s.updateTrip);
  const del = useTrips((s) => s.deleteTrip);
  const addStop = useTrips((s) => s.addStop);
  const removeStop = useTrips((s) => s.removeStop);
  const reorder = useTrips((s) => s.reorderStops);
  const toggleAct = useTrips((s) => s.toggleActivity);
  const addJournal = useTrips((s) => s.addJournal);
  const removeJournal = useTrips((s) => s.removeJournal);

  const [editing, setEditing] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [cityId, setCityId] = useState("");
  const [stopStart, setStopStart] = useState("");
  const [stopEnd, setStopEnd] = useState("");
  const [actCat, setActCat] = useState<ActivityCategory | "All">("All");
  const [actSearch, setActSearch] = useState("");
  const [journalTitle, setJournalTitle] = useState("");
  const [journalBody, setJournalBody] = useState("");
  const [view, setView] = useState<"timeline" | "calendar" | "list">("timeline");
  const [selectedStopId, setSelectedStopId] = useState("");

  useEffect(() => {
    loadTrip(tripId);
    listCities().then((items) => {
      setCities(items);
      setCityId((current) => current || items[0]?.id || "");
    });
  }, [loadTrip, tripId]);

  useEffect(() => {
    if (!trip) return;
    if (stopStart && !isDateWithinRange(stopStart, trip.startDate, trip.endDate)) setStopStart("");
    if (stopEnd && !isDateWithinRange(stopEnd, trip.startDate, trip.endDate)) setStopEnd("");
  }, [trip, stopStart, stopEnd]);

  useEffect(() => {
    if (!trip || trip.stops.length === 0) {
      setSelectedStopId("");
      setActivities([]);
      return;
    }
    setSelectedStopId((current) =>
      trip.stops.some((stop) => stop.id === current) ? current : trip.stops[0].id,
    );
  }, [trip]);

  useEffect(() => {
    const stop = trip?.stops.find((s) => s.id === selectedStopId);
    if (!stop) {
      setActivities([]);
      return;
    }

    let active = true;
    setActivitiesLoading(true);
    listActivities({ cityId: stop.cityId })
      .then((items) => {
        if (!active) return;
        setActivities(items);
      })
      .finally(() => {
        if (!active) return;
        setActivitiesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [trip, selectedStopId]);

  const selectedStop = trip?.stops.find((s) => s.id === selectedStopId);

  useEffect(() => {
    if (!selectedStop || !trip) return;
    const selectedCityId = Number(selectedStop.cityId);
    selectedStop.stopActivities.forEach((planned) => {
      const activityCityId = planned.activity_detail?.city;
      if (!activityCityId || Number(activityCityId) === selectedCityId) return;
      toggleAct(trip.id, selectedStop.id, String(planned.activity)).catch(() => {
        // Ignore cleanup failures; backend validation still protects consistency.
      });
    });
  }, [selectedStop, toggleAct, trip]);

  if (!trip) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-serif text-3xl">Trip not found</h1>
        <Button asChild variant="link" className="mt-3"><Link to="/trips">Back to trips</Link></Button>
      </div>
    );
  }

  const onDragEnd = (r: DropResult) => {
    if (!r.destination) return;
    const ids = Array.from(trip.stops.map((s) => s.id));
    const [moved] = ids.splice(r.source.index, 1);
    ids.splice(r.destination.index, 0, moved);
    reorder(trip.id, ids);
  };

  const handleAddStop = async () => {
    if (!stopStart || !stopEnd) return toast.error("Pick start and end dates.");
    if (!cityId) return toast.error("Pick a city.");
    if (stopEnd < stopStart) return toast.error("Stop end date cannot be before start date.");
    if (!isDateWithinRange(stopStart, trip.startDate, trip.endDate) || !isDateWithinRange(stopEnd, trip.startDate, trip.endDate)) {
      return toast.error(`Stop dates must be within ${formatDisplayDate(trip.startDate)} and ${formatDisplayDate(trip.endDate)}.`);
    }
    const c = cities.find((x) => x.id === cityId)!;
    try {
      await addStop(trip.id, {
        cityId: c.id,
        cityName: c.name,
        country: c.country,
        startDate: stopStart,
        endDate: stopEnd,
        activityIds: [],
      });
      setStopOpen(false);
      setStopStart(""); setStopEnd("");
      toast.success(`Added ${c.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add stop");
    }
  };
  const filteredActs = activities.filter(
    (a) =>
      (actCat === "All" || a.category === actCat) &&
      (actSearch === "" || a.name.toLowerCase().includes(actSearch.toLowerCase()))
  );

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/share/${trip.shareSlug}` : "";

  return (
    <div className="space-y-8 pb-16">
      {/* Cover */}
      <header className="relative h-72 overflow-hidden md:h-96">
        <img src={trip.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-7xl px-6 text-primary-foreground">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]">
            {trip.privacy === "public" ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {trip.privacy}
          </div>
          <h1 className="mt-2 font-serif text-4xl font-semibold md:text-6xl">{trip.title}</h1>
          <p className="mt-1 text-sm opacity-85">
            {formatDisplayDate(trip.startDate)} — {formatDisplayDate(trip.endDate)}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-8">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setEditing((v) => !v)}>
            <Pencil className="mr-1.5 h-4 w-4" /> {editing ? "Done" : "Edit details"}
          </Button>
          <Button asChild variant="outline">
            <Link to="/share/$slug" params={{ slug: trip.shareSlug }}><Share2 className="mr-1.5 h-4 w-4" /> Public page</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(shareUrl);
              toast.success("Share link copied");
            }}
          >
            Copy link
          </Button>
          <Button variant="outline" onClick={() => window.print()}>Export PDF</Button>
          <div className="ml-auto" />
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Delete this trip?")) {
                del(trip.id);
                navigate({ to: "/trips" });
              }
            }}
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        </div>

        {editing && (
          <div className="grid gap-4 rounded-2xl border bg-card p-6 soft-shadow md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={trip.title} onChange={(e) => update(trip.id, { title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <Input type="number" value={trip.budget} onChange={(e) => update(trip.id, { budget: Number(e.target.value) })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={trip.description} onChange={(e) => update(trip.id, { description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Privacy</Label>
              <select
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={trip.privacy}
                onChange={(e) => update(trip.id, { privacy: e.target.value as "private" | "public" })}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>
        )}

        <Tabs defaultValue="itinerary">
          <TabsList>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="ai">AI suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl">Stops</h2>
                <div className="ml-2 flex rounded-lg border bg-card p-0.5">
                  {([
                    { v: "timeline", icon: GanttChart, label: "Timeline" },
                    { v: "calendar", icon: CalendarDays, label: "Calendar" },
                    { v: "list", icon: ListIcon, label: "List" },
                  ] as const).map((o) => (
                    <button
                      key={o.v}
                      onClick={() => setView(o.v)}
                      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition ${
                        view === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <o.icon className="h-3.5 w-3.5" /> {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <Dialog open={stopOpen} onOpenChange={setStopOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-1 h-4 w-4" /> Add stop</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add a city</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <Label>City</Label>
                    <select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={cityId} onChange={(e) => setCityId(e.target.value)}>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}, {c.country}</option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Start</Label><Input type="date" min={trip.startDate} max={trip.endDate} value={stopStart} onChange={(e) => setStopStart(e.target.value)} /></div>
                      <div><Label>End</Label><Input type="date" min={trip.startDate} max={trip.endDate} value={stopEnd} onChange={(e) => setStopEnd(e.target.value)} /></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Allowed range: {formatDisplayDate(trip.startDate)} - {formatDisplayDate(trip.endDate)}
                    </p>
                    <Button className="w-full" onClick={handleAddStop}>Add</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {trip.stops.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                No stops yet. Add a city to start your itinerary.
              </div>
            ) : view === "timeline" ? (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="stops">
                  {(p) => (
                    <ol ref={p.innerRef} {...p.droppableProps} className="space-y-3">
                      {trip.stops.map((stop, idx) => (
                        <Draggable key={stop.id} draggableId={stop.id} index={idx}>
                          {(d) => (
                            <motion.li
                              layout
                              ref={d.innerRef}
                              {...d.draggableProps}
                              className="rounded-2xl border bg-card p-5 soft-shadow"
                            >
                              <div className="flex items-start gap-3">
                                <span {...d.dragHandleProps} className="mt-1 cursor-grab text-muted-foreground">
                                  <GripVertical className="h-5 w-5" />
                                </span>
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">Day {idx + 1}</Badge>
                                    <h3 className="font-serif text-2xl">{stop.cityName}</h3>
                                    <span className="text-xs text-muted-foreground">{stop.country}</span>
                                  </div>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {formatDisplayDate(stop.startDate)} – {formatDisplayDate(stop.endDate)}
                                  </p>
                                  {stop.activityIds.length > 0 && (
                                    <ul className="mt-3 space-y-1.5 text-sm">
                                      {stop.stopActivities.map((planned) => {
                                        const a = planned.activity_detail ? {
                                          name: planned.activity_detail.name,
                                          duration: `${planned.activity_detail.duration_hours}h`,
                                        } : activities.find((x) => x.id === String(planned.activity));
                                        if (!a) return null;
                                        return (
                                          <li key={planned.id} className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" /> {a.name}
                                            <span className="ml-auto"><Clock className="mr-1 inline h-3 w-3" />{a.duration}</span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeStop(trip.id, stop.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </motion.li>
                          )}
                        </Draggable>
                      ))}
                      {p.placeholder}
                    </ol>
                  )}
                </Droppable>
              </DragDropContext>
            ) : view === "list" ? (
              <div className="overflow-hidden rounded-2xl border bg-card soft-shadow">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Activities</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {trip.stops.map((stop, idx) => (
                      <tr key={stop.id} className="border-t">
                        <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                        <td className="px-4 py-3"><span className="font-serif text-lg">{stop.cityName}</span><span className="ml-2 text-xs text-muted-foreground">{stop.country}</span></td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDisplayDate(stop.startDate)} – {formatDisplayDate(stop.endDate)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{stop.activityIds.length}</td>
                        <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" onClick={() => removeStop(trip.id, stop.id)}><Trash2 className="h-4 w-4" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {trip.stops.map((stop, idx) => {
                  const days = Math.max(1, Math.round((new Date(stop.endDate).getTime() - new Date(stop.startDate).getTime()) / 86400000) + 1);
                  return (
                    <motion.div
                      key={stop.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="overflow-hidden rounded-2xl border bg-card soft-shadow"
                    >
                      <div className="bg-primary/10 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-primary">Day {idx + 1} • {days}d</p>
                        <h4 className="mt-1 font-serif text-2xl">{stop.cityName}</h4>
                        <p className="text-xs text-muted-foreground">{formatDisplayDate(stop.startDate)}</p>
                      </div>
                      <div className="grid grid-cols-7 gap-1 p-3 text-center text-[10px]">
                        {Array.from({ length: days }).map((_, i) => (
                          <div key={i} className="rounded bg-muted/60 px-1 py-2">
                            <p className="font-medium">{format(new Date(new Date(stop.startDate).getTime() + i * 86400000), "EEE")}</p>
                            <p className="text-muted-foreground">{format(new Date(new Date(stop.startDate).getTime() + i * 86400000), "d")}</p>
                          </div>
                        ))}
                      </div>
                      <div className="border-t p-3 text-xs">
                        <p className="text-muted-foreground">{stop.activityIds.length} activities planned</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            {trip.stops.length > 0 && (
              <div className="max-w-sm space-y-2">
                <Label>Stop city</Label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={selectedStopId}
                  onChange={(e) => setSelectedStopId(e.target.value)}
                >
                  {trip.stops.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {stop.cityName}, {stop.country}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Input
                value={actSearch}
                onChange={(e) => setActSearch(e.target.value)}
                placeholder="Search activities"
                className="max-w-xs"
              />
              <div className="flex flex-wrap gap-1">
                {(["All", ...categories] as const).map((c) => (
                  <Button
                    key={c}
                    size="sm"
                    variant={actCat === c ? "default" : "outline"}
                    onClick={() => setActCat(c)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>
            {trip.stops.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                Add a stop first to attach activities.
              </div>
            ) : activitiesLoading ? (
              <div className="rounded-2xl border p-10 text-center text-muted-foreground">
                Loading activities for {selectedStop?.cityName ?? "selected city"}...
              </div>
            ) : filteredActs.length === 0 ? (
              <div className="rounded-2xl border p-10 text-center text-muted-foreground">
                No activities found for {selectedStop?.cityName ?? "this city"}.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredActs.map((a) => (
                  <div key={a.id} className="rounded-2xl border bg-card p-4 soft-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline">{a.category}</Badge>
                        <h4 className="mt-2 font-serif text-xl">{a.name}</h4>
                        <p className="text-xs text-muted-foreground">{a.city} • {a.duration} • {a.costFormatted ?? inr(a.cost)}</p>
                      </div>
                    </div>
                    {selectedStop && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant={selectedStop.activityIds.includes(a.id) ? "default" : "outline"}
                          onClick={() =>
                            toggleAct(trip.id, selectedStop.id, a.id).catch((error) =>
                              toast.error(error instanceof Error ? error.message : "Could not update activity"),
                            )
                          }
                        >
                          {selectedStop.activityIds.includes(a.id) ? "✓ " : "+ "}
                          {selectedStop.cityName}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="journal" className="space-y-4">
            <div className="rounded-2xl border bg-card p-5 soft-shadow">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="font-serif text-2xl">New entry</h3>
              </div>
              <div className="mt-3 space-y-2">
                <Input value={journalTitle} onChange={(e) => setJournalTitle(e.target.value)} placeholder="Title" />
                <Textarea value={journalBody} onChange={(e) => setJournalBody(e.target.value)} rows={4} placeholder="What happened today?" />
                <Button
                  onClick={() => {
                    if (!journalTitle) return toast.error("Add a title");
                    addJournal(trip.id, { date: new Date().toISOString().slice(0, 10), title: journalTitle, body: journalBody });
                    setJournalTitle(""); setJournalBody("");
                    toast.success("Entry saved");
                  }}
                >
                  Save entry
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {trip.journal.map((j) => (
                <article key={j.id} className="rounded-2xl border bg-card p-5 soft-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{formatDisplayDate(j.date)}</p>
                      <h4 className="mt-1 font-serif text-2xl">{j.title}</h4>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{j.body}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeJournal(trip.id, j.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </article>
              ))}
              {trip.journal.length === 0 && (
                <p className="text-sm text-muted-foreground">No entries yet — your story starts here.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="rounded-2xl border bg-card p-6 soft-shadow">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-serif text-2xl">Smart ideas for {trip.title}</h3>
              </div>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="rounded-xl border bg-background/60 p-4">Keep a ₹1,500-₹2,500 buffer per travel day for local transport, snacks, and entry tickets.</li>
                <li className="rounded-xl border bg-background/60 p-4">Group activities by area to avoid traffic-heavy cross-city travel.</li>
                <li className="rounded-xl border bg-background/60 p-4">For hill stations and Ladakh, keep a weather buffer day in the route.</li>
                <li className="rounded-xl border bg-background/60 p-4">Use food walks and heritage walks to make Indian city days feel rich without overspending.</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
