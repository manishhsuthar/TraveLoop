import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/trips", label: "My Trips" },
  { to: "/itinerary", label: "Itinerary" },
  { to: "/cities", label: "Cities" },
  { to: "/activities", label: "Activities" },
  { to: "/budget", label: "Budget" },
  { to: "/checklist", label: "Checklist" },
  { to: "/notes", label: "Notes" },
];

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">Traveloop</Link>
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
