import { useEffect, useMemo, useState } from "react";
import { fetchCities } from "../api/client";
import "../App.css";

const COUNTRY_FLAGS = {
  France: "🇫🇷", Japan: "🇯🇵", USA: "🇺🇸", India: "🇮🇳", Italy: "🇮🇹",
  Germany: "🇩🇪", UK: "🇬🇧", Spain: "🇪🇸", Australia: "🇦🇺", Brazil: "🇧🇷",
  Canada: "🇨🇦", Mexico: "🇲🇽", Thailand: "🇹🇭", Turkey: "🇹🇷", Greece: "🇬🇷",
  Egypt: "🇪🇬", China: "🇨🇳", "South Korea": "🇰🇷", Netherlands: "🇳🇱", Portugal: "🇵🇹",
};

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities()
      .then((data) => { setCities(data); setLoading(false); })
      .catch(() => { setCities([]); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return cities.filter((c) =>
      `${c.name} ${c.country} ${c.region}`.toLowerCase().includes(q)
    );
  }, [cities, query]);

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading cities...</div>;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Cities</h1>
        <p>Browse destinations and explore cost indexes.</p>
      </div>

      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          className="search"
          placeholder="Search by city, country, or region..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="list">
        {filtered.map((city, i) => (
          <article key={city.id} className="list-item" style={{ animationDelay: `${0.04 * i}s` }}>
            <div className="city-card">
              <div className="city-flag">{COUNTRY_FLAGS[city.country] || "🌍"}</div>
              <div className="city-details">
                <h3>{city.name}, {city.country}</h3>
                <p style={{ fontSize: "0.82rem", margin: 0 }}>{city.region || "—"}</p>
                <div className="city-stats">
                  <div className="city-stat">
                    💵 Cost: {city.cost_index}
                    <div className="cost-bar">
                      <div className="cost-bar-fill" style={{ width: `${Math.min(city.cost_index, 100)}%` }} />
                    </div>
                  </div>
                  <div className="city-stat">
                    ⭐ Popularity: {city.popularity_score}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏙️</div>
          <p>{query ? "No cities match your search." : "No cities available."}</p>
        </div>
      )}
    </section>
  );
}
