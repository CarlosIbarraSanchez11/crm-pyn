import {
  LayoutDashboard, LogOut, Menu, X, MapPin, Users, Building, ShieldCheck
} from "lucide-react";
import logoEmpresa from '../../../../assets/logo-pyn.png';
import { useState } from "react";

export default function SidebarAdministracion({
  menuActivo,
  setMenuActivo,
  cerrarSesion
}) {
  const [openSidebar, setOpenSidebar] = useState(false);
  
  // Leemos el usuario del módulo de administración
  const usuario = JSON.parse(localStorage.getItem("adminUser")) || {};
  
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
      {/* Botón menú móvil */}
      <button
        className="lg:hidden fixed top-5 left-5 z-50 bg-[#17254C] p-3 rounded-xl text-white"
        onClick={() => setOpenSidebar(true)}
      >
        <Menu />
      </button>

      {/* Overlay móvil */}
      {openSidebar && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpenSidebar(false)} />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 h-screen w-72 bg-[#17254C] flex flex-col z-50 transition-transform
          ${openSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Botón cerrar móvil */}
        <button
          className="lg:hidden absolute top-4 right-4 text-white"
          onClick={() => setOpenSidebar(false)}
        >
          <X />
        </button>

        {/* Logo y Encabezado del Módulo */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <img src={logoEmpresa} className="h-14 mx-auto" alt="Logo" />
          <div className="flex items-center justify-center gap-2 mt-3 text-white">
            <ShieldCheck size={18} className="text-[#F39200] flex-shrink-0" />
            <h2 className="font-semibold text-base leading-tight">
              Administración Central
            </h2>
          </div>
        </div>

        {/* Menús de Navegación */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* <MenuButton menu="resumen" icon={LayoutDashboard} label="Resumen" />
          
          <div className="pt-4 pb-1 px-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Maestros del Sistema</p>
          </div> */}

          <MenuButton menu="ubicacion" icon={MapPin} label="Ubicaciones" />
          <MenuButton menu="contratas" icon={Building} label="Contratas" />
          <MenuButton menu="usuarios" icon={Users} label="Usuarios" />
        </div>

        {/* Sección de Perfil y Cierre de Sesión */}
        <div className="border-t border-white/10 p-5 flex-shrink-0 bg-[#17254C]">
          <div className="mb-4">
            <p className="text-white font-semibold">{usuario.nombre || "Administrador"}</p>
            {/* <p className="text-[#F39200] text-xs font-bold uppercase tracking-tighter">Administrador</p> */}
          </div>

          <button
            onClick={cerrarSesion}
            className="w-full bg-white/5 hover:bg-red-500/20 text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-3 transition-colors border border-white/10"
          >
            <LogOut size={20} className="text-red-400" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}