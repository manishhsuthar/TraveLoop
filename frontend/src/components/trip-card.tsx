import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Globe2, Lock } from "lucide-react";
import type { Trip } from "@/api/types";
import { formatDisplayDate } from "@/lib/date";

export function TripCard({ trip, index = 0 }: { trip: Trip; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        to="/trips/$tripId"
        params={{ tripId: trip.id }}
        className="group block overflow-hidden rounded-2xl border bg-card soft-shadow transition hover:editorial-shadow"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={trip.cover}
            alt={trip.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-xs backdrop-blur">
            {trip.privacy === "public" ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            <span className="capitalize">{trip.privacy}</span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-primary-foreground">
            <h3 className="font-serif text-2xl font-semibold leading-tight text-balance">
              {trip.title}
            </h3>
          </div>
        </div>
        <div className="space-y-2 p-4">
          <p className="line-clamp-2 text-sm text-muted-foreground">{trip.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDisplayDate(trip.startDate)} – {formatDisplayDate(trip.endDate)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {trip.stops.length} stop{trip.stops.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
