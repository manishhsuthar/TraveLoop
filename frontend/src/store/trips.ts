import { create } from "zustand";
import type { JournalEntry, PackingItem, Trip, TripStop, Visibility } from "@/api/types";
import {
  addNoteApi,
  addPackingApi,
  addStopActivityApi,
  addStopApi,
  createTripApi,
  deleteTripApi,
  getTrip,
  listTrips,
  removeNoteApi,
  removePackingApi,
  removeStopActivityApi,
  removeStopApi,
  togglePackingApi,
  updateTripApi,
} from "@/api/tripApi";

interface TripsState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  loadTrips: () => Promise<void>;
  loadTrip: (id: string) => Promise<Trip | undefined>;
  getTrip: (id: string) => Trip | undefined;
  createTrip: (t: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    cover?: string;
    privacy: Visibility;
    budget: number;
    destination: string;
    preferences: string;
  }) => Promise<string>;
  updateTrip: (id: string, patch: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  addStop: (tripId: string, stop: Omit<TripStop, "id" | "stopActivities">) => Promise<void>;
  removeStop: (tripId: string, stopId: string) => Promise<void>;
  reorderStops: (tripId: string, ids: string[]) => void;
  toggleActivity: (tripId: string, stopId: string, activityId: string) => Promise<void>;
  addPacking: (tripId: string, p: Omit<PackingItem, "id">) => Promise<void>;
  togglePacking: (tripId: string, id: string) => Promise<void>;
  removePacking: (tripId: string, id: string) => Promise<void>;
  addJournal: (tripId: string, j: Omit<JournalEntry, "id">) => Promise<void>;
  removeJournal: (tripId: string, id: string) => Promise<void>;
}

const upsertTrip = (trips: Trip[], trip: Trip) => [trip, ...trips.filter((item) => item.id !== trip.id)];

export const useTrips = create<TripsState>()((set, get) => ({
  trips: [],
  loading: false,
  error: null,
  loadTrips: async () => {
    set({ loading: true, error: null });
    try {
      set({ trips: await listTrips(), loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load trips", loading: false });
    }
  },
  loadTrip: async (id) => {
    try {
      const trip = await getTrip(id);
      set((state) => ({ trips: upsertTrip(state.trips, trip) }));
      return trip;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load trip" });
      return undefined;
    }
  },
  getTrip: (id) => get().trips.find((trip) => trip.id === id),
  createTrip: async (input) => {
    const trip = await createTripApi(input);
    set((state) => ({ trips: upsertTrip(state.trips, trip) }));
    return trip.id;
  },
  updateTrip: async (id, patch) => {
    const trip = await updateTripApi(id, patch);
    set((state) => ({ trips: upsertTrip(state.trips, trip) }));
  },
  deleteTrip: async (id) => {
    await deleteTripApi(id);
    set((state) => ({ trips: state.trips.filter((trip) => trip.id !== id) }));
  },
  addStop: async (tripId, stop) => {
    const trip = await addStopApi(tripId, {
      cityId: stop.cityId,
      startDate: stop.startDate,
      endDate: stop.endDate,
      order: get().getTrip(tripId)?.stops.length ?? 0,
    });
    set((state) => ({ trips: upsertTrip(state.trips, trip) }));
  },
  removeStop: async (tripId, stopId) => {
    const trip = await removeStopApi(tripId, stopId);
    set((state) => ({ trips: upsertTrip(state.trips, trip) }));
  },
  reorderStops: (tripId, ids) =>
    set((state) => ({
      trips: state.trips.map((trip) => {
        if (trip.id !== tripId) return trip;
        const byId = new Map(trip.stops.map((stop) => [stop.id, stop]));
        return { ...trip, stops: ids.map((id) => byId.get(id)).filter(Boolean) as TripStop[] };
      }),
    })),
  toggleActivity: async (tripId, stopId, activityId) => {
    const trip = get().getTrip(tripId);
    const stop = trip?.stops.find((item) => item.id === stopId);
    const existing = stop?.stopActivities.find((item) => String(item.activity) === activityId);
    const nextTrip = existing
      ? await removeStopActivityApi(tripId, String(existing.id))
      : await addStopActivityApi(tripId, stopId, activityId, stop?.startDate ?? trip?.startDate ?? new Date().toISOString().slice(0, 10));
    set((state) => ({ trips: upsertTrip(state.trips, nextTrip) }));
  },
  addPacking: async (tripId, item) => {
    const trip = await addPackingApi(tripId, item);
    set((state) => ({ trips: upsertTrip(state.trips, trip) }));
  },
  togglePacking: async (tripId, id) => {
    const item = get().getTrip(tripId)?.packing.find((packing) => packing.id === id);
    const trip = await togglePackingApi(tripId, id, !item?.packed);
    set((state) => ({ trips: upsertTrip(state.trips, trip) }));
  },
  removePacking: async (tripId, id) => {
    const trip = await removePackingApi(tripId, id);
    set((state) => ({ trips: upsertTrip(state.trips, trip) }));
  },
  addJournal: async (tripId, note) => {
    const trip = await addNoteApi(tripId, note);
    set((state) => ({ trips: upsertTrip(state.trips, trip) }));
  },
  removeJournal: async (tripId, id) => {
    const trip = await removeNoteApi(tripId, id);
    set((state) => ({ trips: upsertTrip(state.trips, trip) }));
  },
}));
