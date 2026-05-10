import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { logout, setAuthToken } from "./api/client";
import Layout from "./components/Layout";
import Activities from "./pages/Activities";
import Auth from "./pages/Auth";
import Budget from "./pages/Budget";
import Checklist from "./pages/Checklist";
import Cities from "./pages/Cities";
import Dashboard from "./pages/Dashboard";
import Itinerary from "./pages/Itinerary";
import Notes from "./pages/Notes";
import PublicTrip from "./pages/PublicTrip";
import Trips from "./pages/Trips";

export default function App() {
  const [auth, setAuth] = useState({ token: "", username: "" });

  useEffect(() => {
    const token = localStorage.getItem("traveloop_token") || "";
    const username = localStorage.getItem("traveloop_username") || "";
    if (token) {
      setAuthToken(token);
      setAuth({ token, username });
    }
  }, []);

  const handleLogout = () => {
    logout(); // clears localStorage + auth header
    setAuth({ token: "", username: "" });
  };

  return (
    <Routes>
      <Route
        element={<Layout auth={auth} onLogout={handleLogout} />}
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<Auth onAuth={setAuth} />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/cities" element={<Cities />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/public/trips/:tripId" element={<PublicTrip />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
