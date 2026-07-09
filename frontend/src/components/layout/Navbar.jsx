import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  FileText,
  LogIn
} from "lucide-react";

import logoEmpresa from '../../assets/logo-pyn.png';

const normativas = [
  { title: "Normativa Corporativa Seguridad", url: "#" },
  { title: "Acta entrega normativas", url: "#" },
  { title: "Politica Global Seguridad", url: "#" },
  { title: "Reglamento Control Acceso", url: "#" },
  { title: "Reglamento Gestión Activos", url: "#" },
  { title: "Reglamento Seguridad Fisica", url: "#" },
  { title: "Reglamento Seguridad Personas", url: "#" },
  { title: "Guia obligaciones seguridad", url: "#" }
];

const evacuacion = [
  { title: "LOCAL 01 VF", url: "#" },
  { title: "LOCAL 02 VF", url: "#" },
  { title: "LOCAL 03 VF", url: "#" },
  { title: "LOCAL 04 VF", url: "#" }
];

const extintores = [
  { title: "LOCAL 01", url: "#" },
  { title: "LOCAL 02", url: "#" },
  { title: "LOCAL 03", url: "#" },
  { title: "LOCAL 04", url: "#" }
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState(null);

  const toggleMobileMenu = (menu) => {
    setActiveMobileMenu(activeMobileMenu === menu ? null : menu);
  };

  const renderPdfCard = (title, url = "#") => (
    <a href={url} target="_blank" rel="noreferrer" className="block group h-full">
      <div className="border border-gray-200 rounded-lg p-4 h-full shadow hover:shadow-lg hover:border-[#F39200] transition bg-white flex flex-col items-center justify-center text-center">
        <div className="mb-2 text-gray-400 group-hover:text-[#F39200] transition-colors">
          <FileText size={28} />
        </div>
        <span className="font-medium text-gray-700 group-hover:text-black transition text-xs">
          {title}
        </span>
      </div>
    </a>
  );

  return (
    <>
      {/* NAVBAR DESKTOP: Aquí aplicamos el degradado de naranja oscuro a claro */}
      <nav className="w-full bg-gradient-to-r from-[#FFAB40] to-[#F39200] text-white shadow-md relative z-40 border-b border-white/20">
        <div className="w-full flex justify-between items-center pr-6 md:pr-12">

          {/* LOGO: Con fondo blanco y borde curvo para imitar el diseño de la imagen */}
          <div className="flex items-center bg-white px-6 md:px-12 py-3 rounded-br-[3rem] shadow-lg">
            <a href="/" className="flex items-center gap-3">
              <img
                src={logoEmpresa} /* Asegúrate de cambiar el nombre al logo de P&P */
                alt="Logo P&P"
                className="h-[60px] object-contain"
              />
            </a>
          </div>

          {/* BUTTON MOBILE */}
          <button
            className="md:hidden border border-white/50 p-2 rounded text-white hover:bg-white/20 transition"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* MENU DESKTOP */}
          <div className="hidden md:block">
            <ul className="flex items-center gap-8 lg:gap-10 text-[11px] lg:text-xs font-black tracking-widest uppercase">

              {/* NOSOTROS */}
              <li className="relative group py-4">
                <div className="flex items-center gap-1 cursor-pointer hover:text-black transition-colors">
                  NOSOTROS
                  <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                </div>
                <div className="absolute top-full left-0 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white rounded-lg shadow-xl border-t-4 border-[#F39200] overflow-hidden">
                    <a href="#" className="block px-4 py-3 hover:bg-gray-50">
                      <div className="text-black font-black text-sm mb-1 group-hover:text-[#F39200]">
                        Propósito, misión y visión
                      </div>
                      <div className="text-gray-500 text-[11px] font-normal normal-case">
                        Conoce nuestro compromiso, valores e idearios
                      </div>
                    </a>
                  </div>
                </div>
              </li>

              {/* NORMATIVAS */}
              <li className="relative group py-4">
                <div className="flex items-center gap-1 cursor-pointer hover:text-black transition-colors">
                  NORMATIVAS
                  <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[800px] pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-gray-50 rounded shadow-2xl border-t-4 border-[#F39200] p-8">
                    <h5 className="font-black text-black text-sm mb-4 border-b border-gray-300 pb-2">
                      NORMATIVAS
                    </h5>
                    <div className="grid grid-cols-4 gap-4">
                      {normativas.map((pdf, idx) => (
                        <div key={idx}>{renderPdfCard(pdf.title, pdf.url)}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </li>

              {/* ADMIN BUTTON: Ahora es blanco con texto naranja para resaltar en el fondo oscuro */}
              <li>
                <Link
                  to="/administracion"
                  className="bg-white hover:bg-gray-100 text-[#d96600] transition px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg font-black"
                >
                  <LogIn size={16} />
                  ADMINISTRACIÓN
                </Link>
              </li>

              {/* VIDEO */}
              <li>
                <a
                  href="#"
                  className="bg-black/10 hover:bg-black/20 border border-white/20 transition px-5 py-2.5 rounded-full flex items-center gap-2 text-white"
                >
                  <ArrowRight size={16} className="text-white" />
                  VIDEOS SEGURIDAD
                </a>
              </li>

            </ul>
          </div>
        </div>
      </nav>

      {/* Menu Mobile */}
      <div
        className={`
          fixed inset-0 z-50 md:hidden
          bg-gradient-to-br from-[#0A2540] via-[#051424] to-black
          transform ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
          transition-all duration-500 ease-in-out flex flex-col overflow-hidden
        `}
      >
        <div className="absolute top-[-120px] right-[-120px] w-[260px] h-[260px] bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-120px] left-[-120px] w-[260px] h-[260px] bg-[#F39200]/10 rounded-full blur-3xl"></div>
        <div className="relative flex justify-between items-center px-6 py-5 border-b border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-xl">
              <img src={logoEmpresa} alt="Logo" className="h-[30px] object-contain" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg tracking-wide">P&P</h1>
              <p className="text-[#F39200] text-[10px] uppercase tracking-[2px] font-bold">Ingenieros</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-white bg-white/10 border border-white/10 p-3 rounded-2xl hover:bg-[#F39200] hover:text-white transition-all duration-300 active:scale-95"
          >
            <X size={22} />
          </button>
        </div>

        <div className="relative flex-1 overflow-y-auto px-6 py-6 text-white">
          <div className="flex flex-col gap-4 mt-8">
            <Link
              to="/administracion"
              onClick={() => setIsMenuOpen(false)}
              className="
                bg-[#0A2540] text-white py-4 rounded-2xl 
                flex items-center justify-center gap-3 
                font-black text-sm shadow-2xl 
                hover:bg-blue-950 hover:scale-[1.02] 
                active:scale-95 transition-all duration-300
                border border-white/10
              "
            >
              <LogIn size={18} />
              ADMINISTRACIÓN
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}