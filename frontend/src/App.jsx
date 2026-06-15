import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider }  from "./contexts/AuthProvider";
import ProtectedRoute    from "./components/ui/ProtectedRoute";

import Login        from "./pages/Login";
import Dashboard    from "./pages/Dashboard";
import Rooms        from "./pages/Rooms";
import Editor       from "./pages/Editor";
import Events       from "./pages/Events";
import CalendarPage from "./pages/Calendar";
import Reservations from "./pages/Reservations";
import Clients      from "./pages/Clients";
import Financial    from "./pages/Financial";
import Reports      from "./pages/Reports";
import Waitlist     from "./pages/Waitlist";
import Checkin      from "./pages/Checkin";
import Settings     from "./pages/Settings";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/rooms" element={
            <ProtectedRoute><Rooms /></ProtectedRoute>
          } />
          <Route path="/rooms/:id/edit" element={
            <ProtectedRoute roles={["ADMIN"]}><Editor /></ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute><Events /></ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute><CalendarPage /></ProtectedRoute>
          } />
          <Route path="/reservations" element={
            <ProtectedRoute><Reservations /></ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute roles={["ADMIN","OPERATOR"]}><Clients /></ProtectedRoute>
          } />
          <Route path="/financial" element={
            <ProtectedRoute roles={["ADMIN"]}><Financial /></ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute roles={["ADMIN","OPERATOR"]}><Reports /></ProtectedRoute>
          } />
          <Route path="/waitlist" element={
            <ProtectedRoute><Waitlist /></ProtectedRoute>
          } />
          <Route path="/checkin" element={
            <ProtectedRoute roles={["ADMIN","OPERATOR"]}><Checkin /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}