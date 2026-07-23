import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarMantenimiento from "./components/SidebarMantenimiento";
import InicioMantenimiento from "./components/InicioMantenimiento";
import Ubicacion from './components/Ubicacion';
import Activo from './components/Activo';

export default function DashboardMantenimiento() {
  const navigate = useNavigate();
  const [menuActivo, setMenuActivo] = useState("resumen");
  const usuario = JSON.parse(
    localStorage.getItem("mantenimientoUser") || "null"
  );
  const cerrarSesion = () => {
    localStorage.removeItem("mantenimientoUser");
    navigate("/mantenimiento/login", {
      replace:true
    });
  };

  return (
    <div className="
      h-screen
      flex
      overflow-hidden
      bg-gray-100
    ">
      <SidebarMantenimiento
        menuActivo={menuActivo}
        setMenuActivo={setMenuActivo}
        usuario={usuario}
        cerrarSesion={cerrarSesion}
      />
      <main
      className="
        flex-1
        overflow-y-auto
        overflow-x-hidden
        p-6
      "
      >
        {menuActivo === "resumen" && (
          <InicioMantenimiento usuario={usuario}/>
        )}
        {menuActivo === "ubicacion" && (
          <Ubicacion />
        )}
        {menuActivo === "activos" && (     
          <Activo />
        )}
      </main>
    </div>
  );
}