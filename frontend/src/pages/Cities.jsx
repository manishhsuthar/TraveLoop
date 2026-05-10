import { useEffect, useMemo, useState } from "react";
import { fetchCities } from "../api/client";

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchCities().then(setCities).catch(() => setCities([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return cities.filter((c) => `${c.name} ${c.country} ${c.region}`.toLowerCase().includes(q));
  }, [cities, query]);

  return (
    <section>
      <h1>City Search</h1>
      <input
        className="search"
        placeholder="Search by city, country, or region"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="list">
        {filtered.map((city) => (
          <article key={city.id} className="list-item">
            <h3>{city.name}, {city.country}</h3>
            <p>Region: {city.region || "-"}</p>
            <p>Cost Index: {city.cost_index} | Popularity: {city.popularity_score}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
