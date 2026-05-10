import { useEffect, useMemo, useState } from "react";
import { createStop, createStopActivity, fetchActivities, fetchCities, fetchTrips } from "../api/client";

const emptyStopForm = {
  city: "",
  start_date: "",
  end_date: "",
  order: 1,
};

const emptyActivityForm = {
  trip_stop: "",
  activity: "",
  day_date: "",
  start_time: "",
  estimated_cost_override: "",
};

export default function Itinerary() {
  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(0);
  const [stopForm, setStopForm] = useState(emptyStopForm);
  const [activityForm, setActivityForm] = useState(emptyActivityForm);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      const [tripData, cityData, activityData] = await Promise.all([
        fetchTrips(),
        fetchCities(),
        fetchActivities(),
      ]);
      setTrips(tripData);
      setCities(cityData);
      setActivities(activityData);
      if (!selectedTripId && tripData.length > 0) {
        setSelectedTripId(tripData[0].id);
      }
    } catch {
      setMessage("Failed to load itinerary data.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === Number(selectedTripId)),
    [trips, selectedTripId]
  );

  const onStopSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await createStop({
        ...stopForm,
        trip: Number(selectedTripId),
        city: Number(stopForm.city),
        order: Number(stopForm.order),
      });
      setStopForm(emptyStopForm);
      await loadData();
      setMessage("Stop added to itinerary.");
    } catch {
      setMessage("Could not add stop. Ensure you are logged in and fields are valid.");
    }
  };

  const onActivitySubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        ...activityForm,
        trip_stop: Number(activityForm.trip_stop),
        activity: Number(activityForm.activity),
      };
      if (!payload.estimated_cost_override) {
        delete payload.estimated_cost_override;
      }
      if (!payload.start_time) {
        delete payload.start_time;
      }
      await createStopActivity(payload);
      setActivityForm(emptyActivityForm);
      await loadData();
      setMessage("Activity assigned to stop.");
    } catch {
      setMessage("Could not assign activity. Ensure stop/activity/date fields are valid.");
    }
  };

  return (
    <section>
      <h1>Itinerary Builder</h1>

      <label>
        Select Trip
        <select value={selectedTripId} onChange={(e) => setSelectedTripId(Number(e.target.value))}>
          <option value={0}>Choose a trip</option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>{trip.name}</option>
          ))}
        </select>
      </label>

      <form className="form" onSubmit={onStopSubmit}>
        <h3>Add Stop</h3>
        <select
          value={stopForm.city}
          onChange={(e) => setStopForm((prev) => ({ ...prev, city: e.target.value }))}
          required
        >
          <option value="">Select city</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
          ))}
        </select>
        <label>
          Start date
          <input
            type="date"
            value={stopForm.start_date}
            onChange={(e) => setStopForm((prev) => ({ ...prev, start_date: e.target.value }))}
            required
          />
        </label>
        <label>
          End date
          <input
            type="date"
            value={stopForm.end_date}
            onChange={(e) => setStopForm((prev) => ({ ...prev, end_date: e.target.value }))}
            required
          />
        </label>
        <input
          type="number"
          min="1"
          value={stopForm.order}
          onChange={(e) => setStopForm((prev) => ({ ...prev, order: e.target.value }))}
          placeholder="Stop order"
          required
        />
        <button type="submit" disabled={!selectedTripId}>Add Stop</button>
      </form>

      <form className="form" onSubmit={onActivitySubmit}>
        <h3>Assign Activity To Stop</h3>
        <select
          value={activityForm.trip_stop}
          onChange={(e) => setActivityForm((prev) => ({ ...prev, trip_stop: e.target.value }))}
          required
        >
          <option value="">Select stop</option>
          {(selectedTrip?.stops || []).map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.city_detail?.name} ({stop.start_date} to {stop.end_date})
            </option>
          ))}
        </select>
        <select
          value={activityForm.activity}
          onChange={(e) => setActivityForm((prev) => ({ ...prev, activity: e.target.value }))}
          required
        >
          <option value="">Select activity</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.name} - {activity.city_name}
            </option>
          ))}
        </select>
        <label>
          Day date
          <input
            type="date"
            value={activityForm.day_date}
            onChange={(e) => setActivityForm((prev) => ({ ...prev, day_date: e.target.value }))}
            required
          />
        </label>
        <label>
          Start time (optional)
          <input
            type="time"
            value={activityForm.start_time}
            onChange={(e) => setActivityForm((prev) => ({ ...prev, start_time: e.target.value }))}
          />
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={activityForm.estimated_cost_override}
          onChange={(e) => setActivityForm((prev) => ({ ...prev, estimated_cost_override: e.target.value }))}
          placeholder="Cost override (optional)"
        />
        <button type="submit" disabled={!selectedTripId}>Assign Activity</button>
      </form>

      {message && <p>{message}</p>}

      <h3>Current Stops</h3>
      <div className="list">
        {(selectedTrip?.stops || []).map((stop) => (
          <article className="list-item" key={stop.id}>
            <h4>
              {stop.order}. {stop.city_detail?.name}, {stop.city_detail?.country}
            </h4>
            <p>{stop.start_date} to {stop.end_date}</p>
            <p>Activities: {stop.stop_activities?.length || 0}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
