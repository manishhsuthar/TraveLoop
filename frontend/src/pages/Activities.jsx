import { useEffect, useState } from "react";
import { fetchActivities } from "../api/client";
import "../App.css";

const TYPE_CONFIG = {
  sightseeing: { badge: "badge-blue", icon: "🏛️" },
  food:        { badge: "badge-amber", icon: "🍽️" },
  adventure:   { badge: "badge-red", icon: "🧗" },
  culture:     { badge: "badge-purple", icon: "🎭" },
  nightlife:   { badge: "badge-teal", icon: "🌙" },
};

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities()
      .then((data) => { setActivities(data); setLoading(false); })
      .catch(() => { setActivities([]); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading activities...</div>;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Activities</h1>
        <p>Discover activities you can add to your trip stops.</p>
      </div>

      <div className="list">
        {activities.map((activity, i) => {
          const cfg = TYPE_CONFIG[activity.activity_type] || { badge: "badge-teal", icon: "🎯" };
          return (
            <article key={activity.id} className="list-item" style={{ animationDelay: `${0.04 * i}s` }}>
              <div className="activity-card">
                <div className="activity-info">
                  <h3>{activity.name}</h3>
                  <p>
                    {activity.city_name || "—"}{" "}
                    {activity.description && `· ${activity.description}`}
                  </p>
                </div>
                <div className="activity-tags">
                  <span className={`badge ${cfg.badge}`}>
                    {cfg.icon} {activity.activity_type}
                  </span>
                  <span className="badge badge-teal">💰 ${activity.estimated_cost}</span>
                  <span className="badge badge-purple">⏱ {activity.duration_hours}h</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <p>No activities available yet.</p>
        </div>
      )}
    </section>
  );
}
