import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  {
    section: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: "📊" },
      { to: "/trips", label: "My Trips", icon: "✈️" },
    ],
  },
  {
    section: "Plan",
    items: [
      { to: "/itinerary", label: "Itinerary", icon: "🗺️" },
      { to: "/cities", label: "Cities", icon: "🏙️" },
      { to: "/activities", label: "Activities", icon: "🎯" },
    ],
  },
  {
    section: "Manage",
    items: [
      { to: "/budget", label: "Budget", icon: "💰" },
      { to: "/checklist", label: "Checklist", icon: "✅" },
      { to: "/notes", label: "Notes", icon: "📝" },
    ],
  },
];

export default function Layout({ auth, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <button
        className="hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      <div
        className={`mobile-overlay${sidebarOpen ? " open" : ""}`}
        onClick={closeSidebar}
      />

      <div className="app-shell">
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <Link to="/" className="brand" onClick={closeSidebar}>
            <span className="brand-icon">✈</span>
            Traveloop
          </Link>

          {auth?.username ? (
            <div className="user-box">
              <div className="user-avatar">
                {auth.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <small>Signed in as</small>
                <strong>{auth.username}</strong>
              </div>
              <button className="mini-btn" onClick={onLogout}>
                Exit
              </button>
            </div>
          ) : (
            <div className="signed-out">
              <span style={{ marginRight: "0.4rem" }}>👤</span> Guest Mode —{" "}
              <Link to="/auth" onClick={closeSidebar} style={{ fontWeight: 600 }}>
                Sign in
              </Link>
            </div>
          )}

          <nav>
            {navItems.map((group) => (
              <div key={group.section}>
                <div className="nav-section-label">{group.section}</div>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                    onClick={closeSidebar}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            Traveloop © {new Date().getFullYear()}
          </div>
        </aside>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </>
  );
}
