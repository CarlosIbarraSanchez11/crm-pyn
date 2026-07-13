import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import LoginRRHH from "./pages/Modulos/rrhh/Login";
import DashboardRRHH from "./pages/Modulos/rrhh/Dashboard";
import LoginProyecto from "./pages/Modulos/proyecto/Login";
import DashboardProyecto from "./pages/Modulos/proyecto/Dashboard";

export default function App() {
  return (
    <div className="p-0 bg-gray-100 min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* ✨ REDIRECCIONES AUTOMÁTICAS */}
        <Route path="/rrhh" element={<Navigate to="/rrhh/login" replace />} />
        <Route path="/proyectos" element={<Navigate to="/proyectos/login" replace />} />

        {/* RUTAS DE RRHH */}
        <Route path="/rrhh/login" element={<LoginRRHH />} />
        <Route path="/rrhh/dashboard" element={<DashboardRRHH />} />
        
        {/* RUTAS DE PROYECTOS */}
        <Route path="/proyectos/login" element={<LoginProyecto />} />
        <Route path="/proyectos/dashboard" element={<DashboardProyecto />} />
        
        {/* ✨ RUTA 404 (OPCIONAL: Captura cualquier ruta que no exista) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}