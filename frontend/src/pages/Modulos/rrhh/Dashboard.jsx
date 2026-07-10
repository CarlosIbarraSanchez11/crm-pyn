import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SidebarRRHH from "./components/SidebarRRHH";

import InicioRRHH from "./components/InicioRRHH";
import Personal from "./components/Personal";
import Contratos from "./components/Contratos";
import Capacitaciones from "./components/Capacitaciones";
import Calendario from "./components/Calendario";
import SSOMA from "./components/SSOMA";
import Configuracion from "./components/Configuracion";
import GestionPermisos from "./components/GestionPermisos";

export default function DashboardRRHH() {

  const navigate = useNavigate();

  const [menuActivo, setMenuActivo] = useState("resumen");


  const usuario = JSON.parse(
    localStorage.getItem("rrhhUser") || "null"
  );


  const cerrarSesion = () => {

    localStorage.removeItem("rrhhUser");

    navigate("/rrhh/login", {
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


      <SidebarRRHH
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
          <InicioRRHH usuario={usuario}/>
        )}


        {menuActivo === "personal" && (
          <Personal usuario={usuario}/>
        )}


        {menuActivo === "contratos" && (
          <Contratos usuario={usuario}/>
        )}


        {menuActivo === "capacitaciones" && (
          <Capacitaciones usuario={usuario}/>
        )}


        {menuActivo === "calendario" && (
          <Calendario usuario={usuario}/>
        )}


        {menuActivo === "ssoma" && (
          <SSOMA usuario={usuario}/>
        )}


        {menuActivo === "configuracion" && (
            <Configuracion
                usuario={usuario}
                setMenuActivo={setMenuActivo}
            />
        )}
        {menuActivo === "gestion-permisos" && (
          <GestionPermisos usuario={usuario}/>
        )}


      </main>


    </div>

  );

}