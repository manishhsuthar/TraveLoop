import { useEffect, useState } from "react";
import { fetchTrips } from "../api/client";

export default function Dashboard() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetchTrips().then(setTrips).catch(() => setTrips([]));
  }, []);

  return (
    <section>
      <h1>Welcome to Traveloop</h1>
      <p>Plan and manage personalized multi-city trips in one place.</p>
      <div className="card-grid">
        <article className="card">
          <h3>Upcoming Trips</h3>
          <p>{trips.length}</p>
        </article>
        <article className="card">
          <h3>Quick Action</h3>
          <p>Create your next trip from the My Trips page.</p>
        </article>
      </div>
    </section>
  );
}
