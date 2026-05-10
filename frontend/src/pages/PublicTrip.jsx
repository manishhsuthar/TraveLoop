import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicTrip } from "../api/client";

export default function PublicTrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicTrip(tripId)
      .then((data) => {
        setTrip(data);
        setError("");
      })
      .catch(() => {
        setTrip(null);
        setError("Public itinerary not found or not public.");
      });
  }, [tripId]);

  if (error) return <p>{error}</p>;
  if (!trip) return <p>Loading...</p>;

  return (
    <section>
      <h1>{trip.name}</h1>
      <p>{trip.description}</p>
      <p>
        {trip.start_date} to {trip.end_date}
      </p>
      <h3>Stops</h3>
      <div className="list">
        {(trip.stops || []).map((stop) => (
          <article className="list-item" key={stop.id}>
            <h4>{stop.city_detail?.name}, {stop.city_detail?.country}</h4>
            <p>{stop.start_date} to {stop.end_date}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
