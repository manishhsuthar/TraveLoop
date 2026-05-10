import { useEffect, useState } from "react";
import { fetchActivities } from "../api/client";

export default function Activities() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchActivities().then(setActivities).catch(() => setActivities([]));
  }, []);

  return (
    <section>
      <h1>Activity Search</h1>
      <div className="list">
        {activities.map((activity) => (
          <article key={activity.id} className="list-item">
            <h3>{activity.name}</h3>
            <p>{activity.activity_type} in {activity.city_name}</p>
            <p>Estimated: ${activity.estimated_cost} | Duration: {activity.duration_hours}h</p>
          </article>
        ))}
      </div>
    </section>
  );
}
