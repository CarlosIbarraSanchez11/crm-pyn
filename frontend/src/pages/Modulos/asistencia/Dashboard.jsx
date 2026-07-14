// src/pages/modulos/asistencia/DashboardAsistencia.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SidebarAsistencia from "./components/SidebarAsistencia";
import InicioAsistencia from "./components/InicioAsistencia";
import RegistroAsistencia from "./components/RegistroAsistencia";
import UsuariosBiometria from "./components/UsuariosBiometria";
import ReportesAsistencia from "./components/ReportesAsistencia";


export default function DashboardAsistencia() {
  const navigate = useNavigate();

  const [menuActivo, setMenuActivo] = useState("inicio");

  const usuario = JSON.parse(
    localStorage.getItem("asistenciaUser") || "null"
  );

  const cerrarSesion = () => {
    localStorage.removeItem("asistenciaToken");
    localStorage.removeItem("asistenciaUser");

    navigate("/asistencia/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-[#f5f7fb]">
      {/* SIDEBAR */}
      <SidebarAsistencia
        menuActivo={menuActivo}
        setMenuActivo={setMenuActivo}
        cerrarSesion={cerrarSesion}
        usuario={usuario}
      />

      {/* CONTENIDO */}
      <main className="flex-1 overflow-auto p-8">
        {menuActivo === "inicio" && (
          <InicioAsistencia usuario={usuario} />
        )}

        {menuActivo === "asistencia" && (
          <RegistroAsistencia usuario={usuario} />
        )}

        {menuActivo === "biometria" && (
          <UsuariosBiometria usuario={usuario} />
        )}

        {menuActivo === "reportes" && (
          <ReportesAsistencia usuario={usuario} />
        )}

      </main>
    </div>
  );
}