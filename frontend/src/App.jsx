import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginRRHH from "./pages/Modulos/rrhh/Login";
import DashboardRRHH from "./pages/Modulos/rrhh/Dashboard";

export default function App() {
  return (
    <div className="p-0 bg-gray-100 min-h-screen">
      
      {/* Tus rutas originales */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rrhh/login" element={<LoginRRHH />} />
        <Route path="/rrhh/dashboard" element={<DashboardRRHH />} />
      </Routes>
    </div>
  );
}