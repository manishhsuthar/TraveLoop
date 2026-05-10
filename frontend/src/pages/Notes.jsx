import { useEffect, useMemo, useState } from "react";
import { createNote, deleteNote, fetchNotes, fetchTrips } from "../api/client";
import "../App.css";

export default function Notes() {
  const [trips, setTrips] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchTrips().catch(() => []), fetchNotes().catch(() => [])])
      .then(([t, n]) => {
        setTrips(t);
        setNotes(n);
        if (t.length > 0) setSelectedTrip(t[0].id);
        setLoading(false);
      });
  }, []);

  const reload = async () => {
    const n = await fetchNotes().catch(() => []);
    setNotes(n);
  };

  const filtered = useMemo(
    () => notes.filter((n) => n.trip === selectedTrip),
    [notes, selectedTrip]
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedTrip) return;
    await createNote({ trip: selectedTrip, title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
    setShowForm(false);
    await reload();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this note?")) return;
    await deleteNote(id);
    await reload();
  };

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading notes...</div>;
  }

  return (
    <section>
      <div className="page-header">
        <h1>Trip Notes</h1>
        <p>Write reminders, journal entries, and travel tips.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end", marginBottom: "1.5rem" }}>
        <div className="form-group" style={{ maxWidth: 300 }}>
          <label>Select Trip</label>
          <select value={selectedTrip || ""} onChange={(e) => setSelectedTrip(Number(e.target.value))}>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "📝 New Note"}
        </button>
      </div>

      {showForm && (
        <form className="form" onSubmit={handleAdd} style={{ marginBottom: "1.5rem" }}>
          <h3>✍️ New Note</h3>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            required
          />
          <button type="submit">Save Note</button>
        </form>
      )}

      {filtered.length > 0 ? (
        <div className="notes-grid">
          {filtered.map((note, i) => (
            <article key={note.id} className="note-card" style={{ animationDelay: `${0.05 * i}s` }}>
              <h3>{note.title}</h3>
              <div className="note-content">{note.content}</div>
              <div className="note-card-footer">
                <small>
                  {note.created_at
                    ? new Date(note.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </small>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: "0.72rem", padding: "0.3rem 0.6rem" }}
                  onClick={() => handleDelete(note.id)}
                >
                  🗑
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>{selectedTrip ? "No notes for this trip yet." : "Select a trip to view notes."}</p>
        </div>
      )}
    </section>
  );
}
