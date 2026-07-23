import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarAdministracion from "./components/SidebarAdministracion";
import Ubicacion from "./components/Ubicacion"; // Lo moviste aquí
import Usuarios from "./components/Usuarios";
import Contratas from "./components/Contratas";
// Importarás estos cuando los crees:
// import InicioAdministracion from "./components/InicioAdministracion";
// import GestionUsuarios from "./components/GestionUsuarios";
// import GestionContratas from "./components/GestionContratas";

export default function DashboardAdministracion() {
  const navigate = useNavigate();
  const [menuActivo, setMenuActivo] = useState("resumen");

  // Usamos una clave diferente en localStorage para no chocar con Mantenimiento
  const usuario = JSON.parse(localStorage.getItem("administracionUser") || "null");


  const cerrarSesion = () => {
    localStorage.removeItem("administracionUser");
    navigate("/administracion/login", { replace: true });
  };

  // Protección de ruta
  useEffect(() => {
    if (!usuario) {
      navigate("/administracion/login", { replace: true });
    }
  }, [usuario, navigate]);

  if (!usuario) return null;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <SidebarAdministracion
        menuActivo={menuActivo}
        setMenuActivo={setMenuActivo}
        usuario={usuario}
        cerrarSesion={cerrarSesion}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        {/* Renderizado Condicional de Vistas */}
        {menuActivo === "resumen" && (
          <div className="p-6 bg-white rounded-2xl shadow-sm">
            <h1 className="text-2xl font-bold text-[#17254C]">Panel de Control Administrativo</h1>
            <p className="text-gray-500">Bienvenido al centro de gestión centralizada de P&P.</p>
          </div>
        )}

        {menuActivo === "ubicacion" && <Ubicacion />}

        {menuActivo === "contratas" && <Contratas />}

        {menuActivo === "usuarios" && <Usuarios />}
      </main>
    </div>
  );
}