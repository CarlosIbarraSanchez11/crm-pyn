import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarProyecto from "./components/SidebarProyecto";
import InicioProyecto from "./components/InicioProyecto";

export default function DashboardProyecto() {
  const navigate = useNavigate();
  const [menuActivo, setMenuActivo] = useState("resumen");
  const usuario = JSON.parse(
    localStorage.getItem("proyectoUser") || "null"
  );
  const cerrarSesion = () => {
    localStorage.removeItem("proyectoUser");
    navigate("/proyectos/login", {
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
      <SidebarProyecto
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
          <InicioProyecto usuario={usuario}/>
        )}
      </main>
    </div>
  );
}