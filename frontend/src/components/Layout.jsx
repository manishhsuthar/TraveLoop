import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/auth", label: "Login / Signup" },
  { to: "/trips", label: "My Trips" },
  { to: "/itinerary", label: "Itinerary" },
  { to: "/cities", label: "Cities" },
  { to: "/activities", label: "Activities" },
  { to: "/budget", label: "Budget" },
  { to: "/checklist", label: "Checklist" },
  { to: "/notes", label: "Notes" },
];

export default function Layout({ auth, onLogout }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">Traveloop</Link>
        {auth?.username ? (
          <div className="user-box">
            <small>Signed in as</small>
            <strong>{auth.username}</strong>
            <button className="mini-btn" onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <p className="signed-out">Guest mode</p>
        )}
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
