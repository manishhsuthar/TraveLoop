import { useEffect, useState } from "react";
import { fetchBudget, fetchTrips } from "../api/client";
import "../App.css";

export default function Budget() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips()
      .then((data) => {
        setTrips(data);
        if (data.length > 0) setSelectedTrip(data[0].id);
        setLoading(false);
      })
      .catch(() => { setTrips([]); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!selectedTrip) return;
    setBudget(null);
    fetchBudget(selectedTrip).then(setBudget).catch(() => setBudget(null));
  }, [selectedTrip]);

  const pct = budget && budget.budget_limit > 0
    ? Math.min((budget.estimated_total / budget.budget_limit) * 100, 100)
    : 0;

  const barColor = pct > 90
    ? "var(--accent-coral)"
    : pct > 60
    ? "var(--accent-warm)"
    : "var(--accent)";

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading budget...</div>;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Budget Tracker</h1>
        <p>Monitor your trip spending against your budget limit.</p>
      </div>

      <div className="form-group" style={{ maxWidth: 300, marginBottom: "1.5rem" }}>
        <label>Select Trip</label>
        <select value={selectedTrip || ""} onChange={(e) => setSelectedTrip(Number(e.target.value))}>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>{trip.name}</option>
          ))}
        </select>
      </div>

      {budget && (
        <>
          <div className="budget-overview" style={{ animation: "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div className="budget-header">
              <div>
                <div className="budget-label">Trip Budget</div>
                <div className="budget-amount">${budget.budget_limit}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="budget-label">Estimated Spend</div>
                <div className="budget-amount" style={{ color: barColor }}>
                  ${budget.estimated_total.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="budget-progress">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
              <div className="budget-legend">
                <span>{pct.toFixed(0)}% used</span>
                <span>${(budget.budget_limit - budget.estimated_total).toFixed(2)} remaining</span>
              </div>
            </div>

            {budget.is_over_budget && (
              <div className="budget-warning">
                ⚠️ You are over budget! Consider reducing activities or increasing your limit.
              </div>
            )}
          </div>

          <div className="stats-grid">
            <div className="stat-card card" style={{ animationDelay: "0.05s" }}>
              <div className="stat-icon" style={{ background: "var(--accent-glow)" }}>💰</div>
              <div className="stat-value">${budget.budget_limit}</div>
              <div className="stat-label">Budget Limit</div>
            </div>
            <div className="stat-card card" style={{ animationDelay: "0.1s" }}>
              <div className="stat-icon" style={{ background: "var(--accent-warm-glow)" }}>📊</div>
              <div className="stat-value">${budget.estimated_total.toFixed(2)}</div>
              <div className="stat-label">Total Estimated</div>
            </div>
            <div className="stat-card card" style={{ animationDelay: "0.15s" }}>
              <div className="stat-icon" style={{ background: "var(--accent-secondary-glow)" }}>📅</div>
              <div className="stat-value">${budget.average_per_day.toFixed(2)}</div>
              <div className="stat-label">Average / Day</div>
            </div>
          </div>
        </>
      )}

      {trips.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <p>Create a trip first to track your budget.</p>
        </div>
      )}
    </section>
  );
}
