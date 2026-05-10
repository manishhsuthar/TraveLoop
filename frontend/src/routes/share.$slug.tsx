import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Compass, MapPin, Clock, MessageCircle, Link as LinkIcon, Copy, Users, Calendar, IndianRupee } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDisplayDate } from "@/lib/date";
import { toast } from "sonner";
import { copyPublicTrip, getPublicTrip } from "@/api/tripApi";
import type { Trip } from "@/api/types";
import { hasSession } from "@/api/authApi";

export const Route = createFileRoute("/share/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Traveloop` },
      { name: "description", content: "A shared Indian travel itinerary on Traveloop." },
    ],
  }),
  component: SharedTrip,
});

function SharedTrip() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicTrip(slug).then(setTrip).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading shared itinerary…</div>;

  if (!trip) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
        <div>
          <h1 className="font-serif text-5xl">Itinerary not found</h1>
          <p className="mt-2 text-muted-foreground">This public trip may have been removed or made private.</p>
          <Button asChild className="mt-5"><Link to="/">Go home</Link></Button>
        </div>
      </div>
    );
  }

  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="absolute left-0 right-0 top-0 z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            <span className="font-serif text-xl">Traveloop</span>
          </Link>
          <Button asChild className="bg-primary-foreground text-ink hover:bg-primary-foreground/90">
            <Link to="/signup">Plan your own</Link>
          </Button>
        </nav>
      </header>

      <section className="relative h-[70vh] min-h-[480px]">
        <img src={trip.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
        <div className="absolute bottom-12 left-0 right-0 mx-auto max-w-5xl px-6 text-primary-foreground">
          <span className="text-xs uppercase tracking-[0.3em] opacity-80">Shared Indian itinerary</span>
          <h1 className="mt-3 font-serif text-5xl font-semibold leading-tight md:text-7xl">{trip.title}</h1>
          <p className="mt-3 max-w-2xl text-lg opacity-90">{trip.description}</p>
          <p className="mt-2 text-sm opacity-80">
            {formatDisplayDate(trip.startDate)} — {formatDisplayDate(trip.endDate)}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10 flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5 soft-shadow">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">{trip.title.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Curated by</p>
            <p className="font-serif text-xl">A Traveloop traveler</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><span><strong>{trip.stops.length}</strong> stops</span></div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><span><strong>{Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1}</strong> days</span></div>
            <div className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-primary" /><span><strong>{trip.budgetFormatted}</strong> budget</span></div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /><span><strong>{trip.stops.reduce((n, s) => n + s.stopActivities.length, 0)}</strong> activities</span></div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard?.writeText(url); toast.success("Link copied"); }}>
            <LinkIcon className="mr-1 h-4 w-4" /> Copy link
          </Button>
          <a href={`https://wa.me/?text=${encodeURIComponent(trip.title + " " + url)}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm"><MessageCircle className="mr-1 h-4 w-4" /> WhatsApp</Button>
          </a>
          <Button
            size="sm"
            className="ml-auto"
            onClick={async () => {
              if (!hasSession()) return navigate({ to: "/login" });
              const copied = await copyPublicTrip(trip.id);
              toast.success("Trip copied to your account");
              navigate({ to: "/trips/$tripId", params: { tripId: copied.id } });
            }}
          >
            <Copy className="mr-1 h-4 w-4" /> Copy itinerary
          </Button>
        </div>

        <h2 className="font-serif text-3xl">The itinerary</h2>
        <ol className="mt-6 space-y-6 border-l pl-6">
          {trip.stops.map((stop, i) => (
            <li key={stop.id} className="relative">
              <span className="absolute -left-[33px] top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {formatDisplayDate(stop.startDate)} – {formatDisplayDate(stop.endDate)}
              </p>
              <h3 className="font-serif text-2xl">{stop.cityName}, {stop.country}</h3>
              {stop.stopActivities.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm">
                  {stop.stopActivities.map((planned) => (
                    <li key={planned.id} className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {planned.activity_detail?.name}
                      <span className="ml-auto"><Clock className="mr-1 inline h-3 w-3" />{planned.activity_detail?.duration_hours}h</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
