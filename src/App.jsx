import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Editor    from "./pages/Editor";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Dashboard />} />
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/rooms/:id/edit" element={<Editor />}    />
      </Routes>
    </BrowserRouter>
  );
}