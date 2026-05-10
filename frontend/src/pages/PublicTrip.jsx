import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicTrip } from "../api/client";
import "../App.css";

export default function PublicTrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicTrip(tripId)
      .then((data) => { setTrip(data); setError(""); })
      .catch(() => { setTrip(null); setError("Public itinerary not found or not public."); });
  }, [tripId]);

  if (error) {
    return (
      <div className="empty-state" style={{ marginTop: "4rem" }}>
        <div className="empty-icon">🔒</div>
        <p>{error}</p>
      </div>
    );
  }

  if (!trip) {
    return <div className="loading"><div className="spinner" /> Loading public trip...</div>;
  }

  return (
    <section>
      <div className="public-hero">
        <div className="public-badge">🌐 Public Trip</div>
        <h1>{trip.name}</h1>
        {trip.description && <p style={{ marginBottom: "0.6rem" }}>{trip.description}</p>}
        <div className="trip-dates">
          📅 {trip.start_date} → {trip.end_date}
          {trip.duration_days && <span style={{ marginLeft: "0.5rem" }}>· {trip.duration_days} days</span>}
        </div>
      </div>

      <h2 style={{ marginBottom: "1rem" }}>📍 Stops</h2>

      {(trip.stops || []).length > 0 ? (
        <div className="timeline">
          {trip.stops.map((stop, i) => (
            <div className="timeline-item" key={stop.id} style={{ animationDelay: `${0.08 * i}s` }}>
              <div className="timeline-dot" style={{ background: "var(--accent-secondary)" }} />
              <div className="timeline-content">
                <h4>{stop.city_detail?.name}, {stop.city_detail?.country}</h4>
                <small>📅 {stop.start_date} → {stop.end_date}</small>
                {stop.stop_activities?.length > 0 && (
                  <div className="activity-chips" style={{ marginTop: "0.5rem" }}>
                    {stop.stop_activities.map((sa) => (
                      <span key={sa.id} className="badge badge-teal">
                        {sa.activity_detail?.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <p>No stops in this trip yet.</p>
        </div>
      )}

      {(trip.notes || []).length > 0 && (
        <>
          <h2 style={{ margin: "1.5rem 0 1rem" }}>📝 Notes</h2>
          <div className="notes-grid">
            {trip.notes.map((note) => (
              <article key={note.id} className="note-card">
                <h3>{note.title}</h3>
                <div className="note-content">{note.content}</div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
