import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Rooms     from "./pages/Rooms";
import Editor    from "./pages/Editor";
import Events from "./pages/Events";
import Reservations from "./pages/Reservations";
import CalendarPage from "./pages/Calendar";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Dashboard />} />
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/rooms"          element={<Rooms />}     />
        <Route path="/events"         element={<Events />} />
        <Route path="/rooms/:id/edit" element={<Editor />}    />
        <Route path="/reservations"   element={<Reservations />} />
        <Route path="/calendar"       element={<CalendarPage />} />
      </Routes>
    </BrowserRouter>
  );
}