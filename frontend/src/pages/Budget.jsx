import { useEffect, useState } from "react";
import { fetchBudget, fetchTrips } from "../api/client";

export default function Budget() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    fetchTrips()
      .then((data) => {
        setTrips(data);
        if (data.length > 0) {
          setSelectedTrip(data[0].id);
        }
      })
      .catch(() => setTrips([]));
  }, []);

  useEffect(() => {
    if (!selectedTrip) return;
    fetchBudget(selectedTrip).then(setBudget).catch(() => setBudget(null));
  }, [selectedTrip]);

  return (
    <section>
      <h1>Trip Budget</h1>
      <select value={selectedTrip || ""} onChange={(e) => setSelectedTrip(Number(e.target.value))}>
        {trips.map((trip) => (
          <option key={trip.id} value={trip.id}>{trip.name}</option>
        ))}
      </select>
      {budget && (
        <div className="card-grid">
          <article className="card"><h3>Budget Limit</h3><p>${budget.budget_limit}</p></article>
          <article className="card"><h3>Estimated Total</h3><p>${budget.estimated_total}</p></article>
          <article className="card"><h3>Average / Day</h3><p>${budget.average_per_day.toFixed(2)}</p></article>
        </div>
      )}
    </section>
  );
}
