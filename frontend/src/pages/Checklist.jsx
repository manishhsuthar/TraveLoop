import { useEffect, useMemo, useState } from "react";
import {
  createPackingItem,
  deletePackingItem,
  fetchPackingItems,
  fetchTrips,
  updatePackingItem,
} from "../api/client";
import "../App.css";

const CAT_ICONS = {
  clothing: "👕",
  documents: "📄",
  electronics: "🔌",
  other: "📦",
};

export default function Checklist() {
  const [trips, setTrips] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTrips().catch(() => []), fetchPackingItems().catch(() => [])])
      .then(([t, p]) => {
        setTrips(t);
        setItems(p);
        if (t.length > 0) setSelectedTrip(t[0].id);
        setLoading(false);
      });
  }, []);

  const reload = async () => {
    const p = await fetchPackingItems().catch(() => []);
    setItems(p);
  };

  const filtered = useMemo(
    () => items.filter((i) => i.trip === selectedTrip),
    [items, selectedTrip]
  );

  const grouped = useMemo(() => {
    const groups = {};
    for (const item of filtered) {
      const cat = item.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [filtered]);

  const packedCount = filtered.filter((i) => i.is_packed).length;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedTrip) return;
    await createPackingItem({ trip: selectedTrip, title: title.trim(), category });
    setTitle("");
    await reload();
  };

  const handleToggle = async (item) => {
    await updatePackingItem(item.id, { is_packed: !item.is_packed });
    await reload();
  };

  const handleDelete = async (id) => {
    await deletePackingItem(id);
    await reload();
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading checklist...</div>;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Packing Checklist</h1>
        <p>Keep track of everything you need for your trip.</p>
      </div>

      <div className="checklist-header">
        <div className="form-group" style={{ maxWidth: 300 }}>
          <label>Select Trip</label>
          <select value={selectedTrip || ""} onChange={(e) => setSelectedTrip(Number(e.target.value))}>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        {filtered.length > 0 && (
          <div className="checklist-counter">
            <strong>{packedCount}</strong> / {filtered.length} packed
          </div>
        )}
      </div>

      {selectedTrip && (
        <form className="form" onSubmit={handleAdd} style={{ marginBottom: "1.5rem" }}>
          <h3>➕ Add Item</h3>
          <div className="form-row">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Item name"
              required
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="clothing">👕 Clothing</option>
              <option value="documents">📄 Documents</option>
              <option value="electronics">🔌 Electronics</option>
              <option value="other">📦 Other</option>
            </select>
          </div>
          <button type="submit">Add to List</button>
        </form>
      )}

      {filtered.length > 0 && (
        <div style={{ marginBottom: "0.8rem" }}>
          <div className="progress-track" style={{ height: 6 }}>
            <div
              className="progress-fill"
              style={{
                width: `${(packedCount / filtered.length) * 100}%`,
                background: packedCount === filtered.length ? "var(--accent)" : "var(--accent-warm)",
              }}
            />
          </div>
        </div>
      )}

      <div className="checklist-categories">
        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="category-section">
            <h3>
              <span className="cat-icon">{CAT_ICONS[cat] || "📦"}</span>
              {cat} ({catItems.length})
            </h3>
            <div className="list" style={{ gap: "0.4rem" }}>
              {catItems.map((item, i) => (
                <div
                  key={item.id}
                  className={`check-item${item.is_packed ? " packed" : ""}`}
                  style={{ animationDelay: `${0.03 * i}s` }}
                >
                  <button
                    className={`custom-checkbox${item.is_packed ? " checked" : ""}`}
                    onClick={() => handleToggle(item)}
                    aria-label={item.is_packed ? "Unpack" : "Pack"}
                  >
                    {item.is_packed ? "✓" : ""}
                  </button>
                  <span className="check-label">{item.title}</span>
                  <button className="check-delete" onClick={() => handleDelete(item.id)} aria-label="Delete">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && selectedTrip && (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p>No items yet. Add something to your packing list!</p>
        </div>
      )}

      {trips.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧳</div>
          <p>Create a trip first to use the packing checklist.</p>
        </div>
      )}
    </section>
  );
}
