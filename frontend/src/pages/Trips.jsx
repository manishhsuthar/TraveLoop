import { useEffect, useState } from "react";
import { createTrip, fetchTrips } from "../api/client";

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

  const loadTrips = () => {
    fetchTrips().then(setTrips).catch(() => setTrips([]));
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await createTrip(form);
      setForm(emptyForm);
      loadTrips();
      setMessage("Trip created successfully.");
    } catch {
      setMessage("Could not create trip. Please login and verify fields.");
    }
  };

  return (
    <section>
      <h1>My Trips</h1>
      <form className="form" onSubmit={onSubmit}>
        <h3>Create Trip</h3>
        <input name="name" value={form.name} onChange={onChange} placeholder="Trip name" required />
        <input name="description" value={form.description} onChange={onChange} placeholder="Description" />
        <label>
          Start date
          <input name="start_date" type="date" value={form.start_date} onChange={onChange} required />
        </label>
        <label>
          End date
          <input name="end_date" type="date" value={form.end_date} onChange={onChange} required />
        </label>
        <input
          name="budget_limit"
          type="number"
          min="0"
          value={form.budget_limit}
          onChange={onChange}
          placeholder="Budget limit"
        />
        <input name="cover_photo_url" value={form.cover_photo_url} onChange={onChange} placeholder="Cover photo URL" />
        <select name="visibility" value={form.visibility} onChange={onChange}>
          <option value="private">Private</option>
          <option value="shared">Shared</option>
          <option value="public">Public</option>
        </select>
        <button type="submit">Save Trip</button>
      </form>
      {message && <p>{message}</p>}

      <div className="list">
        {trips.map((trip) => (
          <article key={trip.id} className="list-item">
            <h3>{trip.name}</h3>
            <p>
              {trip.start_date} to {trip.end_date}
            </p>
            <p>Budget: ${trip.budget_limit}</p>
            <p>
              Public URL: <code>/public/trips/{trip.id}</code>
            </p>
          </article>
        ))}
        {trips.length === 0 && <p>No trips available yet.</p>}
      </div>
    </section>
  );
}
