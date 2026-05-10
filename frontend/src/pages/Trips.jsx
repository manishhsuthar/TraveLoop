import { useEffect, useState } from "react";
import { fetchTrips } from "../api/client";

export default function Trips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetchTrips().then(setTrips).catch(() => setTrips([]));
  }, []);

  return (
    <section>
      <h1>My Trips</h1>
      <div className="list">
        {trips.map((trip) => (
          <article key={trip.id} className="list-item">
            <h3>{trip.name}</h3>
            <p>
              {trip.start_date} to {trip.end_date}
            </p>
            <p>Budget: ${trip.budget_limit}</p>
          </article>
        ))}
        {trips.length === 0 && <p>No trips available yet. Seed or create one from backend API.</p>}
      </div>
    </section>
  );
}
