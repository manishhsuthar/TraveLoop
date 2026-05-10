import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Activities from "./pages/Activities";
import Budget from "./pages/Budget";
import Checklist from "./pages/Checklist";
import Cities from "./pages/Cities";
import Dashboard from "./pages/Dashboard";
import Itinerary from "./pages/Itinerary";
import Notes from "./pages/Notes";
import Trips from "./pages/Trips";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/itinerary" element={<Itinerary />} />
        <Route path="/cities" element={<Cities />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
