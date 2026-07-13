import {
  LayoutDashboard, FolderKanban, LogOut, Menu, X
} from "lucide-react";
import logoEmpresa from '../../../../assets/logo-pyn.png';
import { useState } from "react";

// ✅ CAMBIO: Nombre del componente
export default function SidebarProyecto({
  menuActivo,
  setMenuActivo,
  cerrarSesion
}) {
  const [openSidebar, setOpenSidebar] = useState(false);
  
  // ✅ CAMBIO: Leemos la variable correcta de localStorage
  const usuario = JSON.parse(localStorage.getItem("proyectoUser")) || {};
  
  const MenuButton = ({ menu, icon: Icon, label }) => (
    <button
      onClick={() => {
        setMenuActivo(menu);
        setOpenSidebar(false);
      }}
      className={`
        w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200
        ${menuActivo === menu
            ? "bg-[#F39200] text-white shadow-lg"
            : "text-white hover:bg-white/10"
        }
      `}
    >
      <Icon size={20} />
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-5 left-5 z-50 bg-[#17254C] p-3 rounded-xl text-white"
        onClick={() => setOpenSidebar(true)}
      >
        <Menu />
      </button>

      {openSidebar && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpenSidebar(false)} />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 h-screen w-72 bg-[#17254C] flex flex-col z-50 transition-transform
          ${openSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <button
          className="lg:hidden absolute top-4 right-4 text-white"
          onClick={() => setOpenSidebar(false)}
        >
          <X />
        </button>

        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <img src={logoEmpresa} className="h-14 mx-auto" alt="Logo" />
          {/* ✅ CAMBIO: Título actualizado */}
          <h2 className="text-white text-center mt-3 font-semibold text-lg">
            Sistema Proyectos
          </h2>
        </div>

        {/* ✅ CAMBIO: Menús adaptados a Proyectos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <MenuButton menu="resumen" icon={LayoutDashboard} label="Resumen" />
          <MenuButton menu="proyectos" icon={FolderKanban} label="Proyectos" />
        </div>

        <div className="border-t border-white/10 p-5 flex-shrink-0 bg-[#17254C]">
          <div className="mb-4">
            <p className="text-white font-semibold">{usuario.nombre || "Usuario"}</p>
            <p className="text-gray-300 text-sm">{usuario.rol || "Administrador"}</p>
          </div>

          <button
            onClick={cerrarSesion}
            className="w-full bg-[#F39200] hover:bg-orange-600 text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-3"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}