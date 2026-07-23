import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import LoginRRHH from "./pages/Modulos/rrhh/Login";
import DashboardRRHH from "./pages/Modulos/rrhh/Dashboard";
import LoginProyecto from "./pages/Modulos/proyecto/Login";
import DashboardProyecto from "./pages/Modulos/proyecto/Dashboard";
import LoginMantenimiento from "./pages/Modulos/mantenimiento/Login";
import DashboardMantenimiento from "./pages/Modulos/mantenimiento/Dashboard";
import LoginAdministracion from "./pages/Modulos/administracion/Login";
import DashboardAdministracion from "./pages/Modulos/administracion/Dashboard";

export default function App() {
  return (
    <div className="p-0 bg-gray-100 min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />

        {/* RUTAS DE RRHH */}
        <Route path="/rrhh/login" element={<LoginRRHH />} />
        <Route path="/rrhh/dashboard" element={<DashboardRRHH />} />
        
        {/* RUTAS DE PROYECTOS */}
        <Route path="/proyectos/login" element={<LoginProyecto />} />
        <Route path="/proyectos/dashboard" element={<DashboardProyecto />} />

        {/* RUTAS DE MANTENIMIENTO */}
        <Route path="/mantenimiento/login" element={<LoginMantenimiento />} />
        <Route path="/mantenimiento/dashboard" element={<DashboardMantenimiento />} />

        {/* RUTAS DE ADMINISTRACIÓN */}
        <Route path="/administracion/login" element={<LoginAdministracion />} />
        <Route path="/administracion/dashboard" element={<DashboardAdministracion />} />
        
        {/* ✨ RUTA 404 (OPCIONAL: Captura cualquier ruta que no exista) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}