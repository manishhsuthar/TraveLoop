import { useEffect, useState } from "react";
import { createTrip, deleteTrip, fetchTrips } from "../api/client";
import "../App.css";

const emptyForm = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
  budget_limit: 0,
  visibility: "private",
  cover_photo_url: "",
};

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTrips = () => {
    fetchTrips()
      .then((data) => { setTrips(data); setLoading(false); })
      .catch(() => { setTrips([]); setLoading(false); });
  };

  useEffect(() => { loadTrips(); }, []);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await createTrip(form);
      setForm(emptyForm);
      setShowForm(false);
      loadTrips();
      setMessage("Trip created successfully!");
    } catch {
      setMessage("Could not create trip. Please login and verify fields.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this trip?")) return;
    try {
      await deleteTrip(id);
      loadTrips();
    } catch {
      setMessage("Could not delete trip.");
    }
  };

  if (loading) {
    return (
      <div className="loading"><div className="spinner" /> Loading trips...</div>
    );
  }

  return (
    <section>
      <div className="page-header">
        <h1>My Trips</h1>
        <p>Create, manage and share your travel plans.</p>
      </div>

      <div className="create-trip-toggle">
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Cancel" : "+ Create Trip"}
        </button>
      </div>

      {showForm && (
        <form className="form" onSubmit={onSubmit}>
          <h3>New Trip</h3>
          <input name="name" value={form.name} onChange={onChange} placeholder="Trip name" required />
          <input name="description" value={form.description} onChange={onChange} placeholder="Description (optional)" />
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input name="start_date" type="date" value={form.start_date} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input name="end_date" type="date" value={form.end_date} onChange={onChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Budget ($)</label>
              <input name="budget_limit" type="number" min="0" value={form.budget_limit} onChange={onChange} />
            </div>
            <div className="form-group">
              <label>Visibility</label>
              <select name="visibility" value={form.visibility} onChange={onChange}>
                <option value="private">🔒 Private</option>
                <option value="shared">👥 Shared</option>
                <option value="public">🌐 Public</option>
              </select>
            </div>
          </div>
          <input name="cover_photo_url" value={form.cover_photo_url} onChange={onChange} placeholder="Cover photo URL (optional)" />
          <button type="submit">Save Trip</button>
        </form>
      )}

      {message && (
        <p className={`message ${message.includes("success") ? "message-success" : "message-error"}`} style={{ marginBottom: "1rem" }}>
          {message}
        </p>
      )}

      <div className="card-grid">
        {trips.map((trip, i) => (
          <article key={trip.id} className="trip-card" style={{ animationDelay: `${0.05 * i}s` }}>
            <div className="trip-card-header">
              <div>
                <h3>{trip.name}</h3>
                {trip.description && <small>{trip.description}</small>}
              </div>
              <span className={`badge ${trip.visibility === "public" ? "badge-teal" : trip.visibility === "shared" ? "badge-amber" : "badge-purple"}`}>
                {trip.visibility}
              </span>
            </div>
            <div className="trip-card-body">
              <div className="trip-card-meta">
                <span>📅 {trip.start_date} → {trip.end_date}</span>
                <span>📍 {trip.stops?.length || 0} stops</span>
                <span>💰 ${trip.budget_limit}</span>
                {trip.duration_days && <span>⏱️ {trip.duration_days} days</span>}
              </div>
            </div>
            <div className="trip-card-footer">
              {trip.visibility === "public" && (
                <a href={`/public/trips/${trip.id}`} className="btn btn-ghost" style={{ fontSize: "0.78rem" }}>
                  🔗 Public link
                </a>
              )}
              <button className="btn btn-danger" onClick={() => handleDelete(trip.id)} style={{ fontSize: "0.78rem" }}>
                🗑 Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {trips.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧳</div>
          <p>No trips yet. Click "Create Trip" to start planning!</p>
        </div>
      )}
    </section>
  );
}
