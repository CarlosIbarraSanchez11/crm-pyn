// src/pages/modulos/asistencia/components/SidebarAsistencia.jsx

import {
  Home,
  Camera,
  ScanFace,
  FileText,
  LogOut,
  X,
} from "lucide-react";
import { useState } from "react";

const COLORS = {
  navy: "rgb(23 37 76)",
  orange: "rgb(243 146 0)",
};

export default function SidebarAsistencia({
  menuActivo,
  setMenuActivo,
  cerrarSesion,
}) {
  const [openSidebar, setOpenSidebar] = useState(false);

  const usuarioStorage = localStorage.getItem("asistenciaUser");

  const usuario = usuarioStorage
    ? JSON.parse(usuarioStorage)
    : null;

  const rol = usuario?.user?.rol || usuario?.rol || "";

  const roles = rol.split(",").map((r) => r.trim());

  const abrir = (menu) => {
    setMenuActivo(menu);
    setOpenSidebar(false);
  };

  const MenuButton = ({ menu, icon: Icon, label }) => (
    <button
      onClick={() => abrir(menu)}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold transition-all duration-300
      ${
        menuActivo === menu
          ? "text-white shadow-lg"
          : "text-gray-300 hover:text-white hover:bg-white/10"
      }`}
      style={{
        backgroundColor:
          menuActivo === menu ? COLORS.orange : "transparent",
      }}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setOpenSidebar(true)}
        className="lg:hidden fixed top-5 left-5 z-50 w-14 h-14 rounded-full text-white"
        style={{ backgroundColor: COLORS.navy }}
      >
        ☰
      </button>

      {/* Fondo */}
      {openSidebar && (
        <div
          onClick={() => setOpenSidebar(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-[280px] min-h-screen flex flex-col text-white z-50 transition-transform duration-300
        ${
          openSidebar
            ? "translate-x-0"
            : "-translate-x-full"
        }
        lg:translate-x-0 lg:static`}
        style={{
          backgroundColor: COLORS.navy,
        }}
      >
        <button
          onClick={() => setOpenSidebar(false)}
          className="lg:hidden absolute top-5 right-5"
        >
          <X />
        </button>

        {/* Encabezado */}
        <div className="p-8 border-b border-white/10">
          <h1
            className="text-3xl font-black"
            style={{ color: COLORS.orange }}
          >
            ASISTENCIA
          </h1>

          <p className="text-sm text-gray-300 mt-2">
            Reconocimiento Facial
          </p>
        </div>

        {/* Menú */}
        <div className="flex-1 p-5 space-y-3">

          {roles.includes("EMPLEADO") && (
            <MenuButton
              menu="marcar"
              icon={Camera}
              label="MARCAR ASISTENCIA"
            />
          )}

          {roles.includes("ADMIN") && (
            <>
              <MenuButton
                menu="inicio"
                icon={Home}
                label="INICIO"
              />

              <MenuButton
                menu="marcar"
                icon={Camera}
                label="MARCAR ASISTENCIA"
              />

              <MenuButton
                menu="biometria"
                icon={ScanFace}
                label="GESTIÓN BIOMÉTRICA"
              />

              <MenuButton
                menu="reportes"
                icon={FileText}
                label="REPORTES"
              />
            </>
          )}
        </div>

        {/* Cerrar sesión */}
        <div className="p-5 border-t border-white/10">
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-bold"
            style={{
              backgroundColor: COLORS.orange,
            }}
          >
            <LogOut size={20} />
            CERRAR SESIÓN
          </button>
        </div>
      </aside>
    </>
  );
}