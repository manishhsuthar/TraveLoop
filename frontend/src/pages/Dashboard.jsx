import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCities, fetchTrips } from "../api/client";
import "../App.css";

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchTrips().catch(() => []),
      fetchCities().catch(() => []),
    ]).then(([t, c]) => {
      setTrips(t);
      setCities(c);
      setLoading(false);
    });
  }, []);

  const upcoming = trips.filter(
    (t) => new Date(t.start_date) >= new Date()
  );
  const totalStops = trips.reduce(
    (acc, t) => acc + (t.stops?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <section>
      <div className="dashboard-hero">
        <h1>Welcome to Traveloop ✈️</h1>
        <p>
          Plan and manage personalized multi-city trips — itineraries, budgets,
          packing lists, and shareable public links — all in one place.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem" }}>
          <Link to="/trips" className="btn btn-primary">
            + Create Trip
          </Link>
          <Link to="/cities" className="btn btn-secondary">
            Explore Cities
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card card" style={{ animationDelay: "0.05s" }}>
          <div
            className="stat-icon"
            style={{ background: "var(--accent-glow)" }}
          >
            ✈️
          </div>
          <div className="stat-value">{trips.length}</div>
          <div className="stat-label">Total Trips</div>
        </div>

        <div className="stat-card card" style={{ animationDelay: "0.1s" }}>
          <div
            className="stat-icon"
            style={{ background: "var(--accent-secondary-glow)" }}
          >
            📅
          </div>
          <div className="stat-value">{upcoming.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>

        <div className="stat-card card" style={{ animationDelay: "0.15s" }}>
          <div
            className="stat-icon"
            style={{ background: "var(--accent-warm-glow)" }}
          >
            📍
          </div>
          <div className="stat-value">{totalStops}</div>
          <div className="stat-label">Planned Stops</div>
        </div>

        <div className="stat-card card" style={{ animationDelay: "0.2s" }}>
          <div
            className="stat-icon"
            style={{ background: "var(--accent-blue-glow)" }}
          >
            🏙️
          </div>
          <div className="stat-value">{cities.length}</div>
          <div className="stat-label">Cities Available</div>
        </div>
      </div>

      {trips.length > 0 && (
        <div className="recent-section">
          <h2>Recent Trips</h2>
          <div className="card-grid">
            {trips.slice(0, 4).map((trip, i) => (
              <article
                key={trip.id}
                className="trip-card"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                <div className="trip-card-header">
                  <div>
                    <h3>{trip.name}</h3>
                    <small>{trip.description || "No description"}</small>
                  </div>
                  <span
                    className={`badge ${
                      trip.visibility === "public"
                        ? "badge-teal"
                        : trip.visibility === "shared"
                        ? "badge-amber"
                        : "badge-purple"
                    }`}
                  >
                    {trip.visibility}
                  </span>
                </div>
                <div className="trip-card-body">
                  <div className="trip-card-meta">
                    <span>📅 {trip.start_date} → {trip.end_date}</span>
                    <span>📍 {trip.stops?.length || 0} stops</span>
                    <span>💰 ${trip.budget_limit}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {trips.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧳</div>
          <p>No trips yet. Create your first trip to get started!</p>
        </div>
      )}
    </section>
  );
}
