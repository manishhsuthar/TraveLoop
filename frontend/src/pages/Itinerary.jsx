import { useEffect, useMemo, useState } from "react";
import { createStop, createStopActivity, fetchActivities, fetchCities, fetchTrips } from "../api/client";
import "../App.css";

const emptyStopForm = { city: "", start_date: "", end_date: "", order: 1 };
const emptyActivityForm = { trip_stop: "", activity: "", day_date: "", start_time: "", estimated_cost_override: "" };

const TYPE_COLORS = {
  sightseeing: "badge-blue",
  food: "badge-amber",
  adventure: "badge-red",
  culture: "badge-purple",
  nightlife: "badge-teal",
};

export default function Itinerary() {
  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(0);
  const [stopForm, setStopForm] = useState(emptyStopForm);
  const [activityForm, setActivityForm] = useState(emptyActivityForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [tripData, cityData, activityData] = await Promise.all([
        fetchTrips(), fetchCities(), fetchActivities(),
      ]);
      setTrips(tripData);
      setCities(cityData);
      setActivities(activityData);
      if (!selectedTripId && tripData.length > 0) setSelectedTripId(tripData[0].id);
    } catch {
      setMessage("Failed to load itinerary data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === Number(selectedTripId)),
    [trips, selectedTripId]
  );

  const onStopSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await createStop({ ...stopForm, trip: Number(selectedTripId), city: Number(stopForm.city), order: Number(stopForm.order) });
      setStopForm(emptyStopForm);
      await loadData();
      setMessage("Stop added to itinerary!");
    } catch {
      setMessage("Could not add stop. Ensure you are logged in and fields are valid.");
    }
  };

  const onActivitySubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = { ...activityForm, trip_stop: Number(activityForm.trip_stop), activity: Number(activityForm.activity) };
      if (!payload.estimated_cost_override) delete payload.estimated_cost_override;
      if (!payload.start_time) delete payload.start_time;
      await createStopActivity(payload);
      setActivityForm(emptyActivityForm);
      await loadData();
      setMessage("Activity assigned to stop!");
    } catch {
      setMessage("Could not assign activity.");
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading itinerary...</div>;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Itinerary Builder</h1>
        <p>Add stops and assign activities to your trips.</p>
      </div>

      <div className="itin-controls">
        <div className="form-group">
          <label>Select Trip</label>
          <select value={selectedTripId} onChange={(e) => setSelectedTripId(Number(e.target.value))}>
            <option value={0}>Choose a trip</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>{trip.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <form className="form" onSubmit={onStopSubmit} style={{ maxWidth: "100%" }}>
          <h3>➕ Add Stop</h3>
          <select value={stopForm.city} onChange={(e) => setStopForm((p) => ({ ...p, city: e.target.value }))} required>
            <option value="">Select city</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
            ))}
          </select>
          <div className="form-row">
            <div className="form-group">
              <label>Start</label>
              <input type="date" value={stopForm.start_date} onChange={(e) => setStopForm((p) => ({ ...p, start_date: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>End</label>
              <input type="date" value={stopForm.end_date} onChange={(e) => setStopForm((p) => ({ ...p, end_date: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label>Order</label>
            <input type="number" min="1" value={stopForm.order} onChange={(e) => setStopForm((p) => ({ ...p, order: e.target.value }))} required />
          </div>
          <button type="submit" disabled={!selectedTripId}>Add Stop</button>
        </form>

        <form className="form" onSubmit={onActivitySubmit} style={{ maxWidth: "100%" }}>
          <h3>🎯 Assign Activity</h3>
          <select value={activityForm.trip_stop} onChange={(e) => setActivityForm((p) => ({ ...p, trip_stop: e.target.value }))} required>
            <option value="">Select stop</option>
            {(selectedTrip?.stops || []).map((stop) => (
              <option key={stop.id} value={stop.id}>
                {stop.city_detail?.name} ({stop.start_date} → {stop.end_date})
              </option>
            ))}
          </select>
          <select value={activityForm.activity} onChange={(e) => setActivityForm((p) => ({ ...p, activity: e.target.value }))} required>
            <option value="">Select activity</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>{a.name} — {a.city_name}</option>
            ))}
          </select>
          <div className="form-group">
            <label>Day Date</label>
            <input type="date" value={activityForm.day_date} onChange={(e) => setActivityForm((p) => ({ ...p, day_date: e.target.value }))} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Time (optional)</label>
              <input type="time" value={activityForm.start_time} onChange={(e) => setActivityForm((p) => ({ ...p, start_time: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Cost Override</label>
              <input type="number" min="0" step="0.01" value={activityForm.estimated_cost_override} onChange={(e) => setActivityForm((p) => ({ ...p, estimated_cost_override: e.target.value }))} placeholder="Optional" />
            </div>
          </div>
          <button type="submit" disabled={!selectedTripId}>Assign Activity</button>
        </form>
      </div>

      {message && (
        <p className={`message ${message.includes("!") ? "message-success" : "message-error"}`} style={{ marginBottom: "1rem" }}>
          {message}
        </p>
      )}

      <h2 style={{ marginBottom: "1rem" }}>📍 Trip Timeline</h2>
      {(selectedTrip?.stops || []).length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <p>No stops yet. Select a trip and add your first stop!</p>
        </div>
      ) : (
        <div className="timeline">
          {(selectedTrip?.stops || []).map((stop, i) => (
            <div className="timeline-item" key={stop.id} style={{ animationDelay: `${0.08 * i}s` }}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <h4>
                  {stop.order}. {stop.city_detail?.name}, {stop.city_detail?.country}
                </h4>
                <small>📅 {stop.start_date} → {stop.end_date} · {stop.duration_days || "—"} days</small>
                {stop.stop_activities?.length > 0 && (
                  <div className="activity-chips">
                    {stop.stop_activities.map((sa) => (
                      <span key={sa.id} className={`badge ${TYPE_COLORS[sa.activity_detail?.activity_type] || "badge-teal"}`}>
                        {sa.activity_detail?.name}
                      </span>
                    ))}
                  </div>
                )}
                {(!stop.stop_activities || stop.stop_activities.length === 0) && (
                  <small style={{ display: "block", marginTop: "0.4rem", opacity: 0.5 }}>No activities assigned</small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
