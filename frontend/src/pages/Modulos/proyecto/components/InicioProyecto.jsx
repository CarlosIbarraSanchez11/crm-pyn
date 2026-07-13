// src/pages/Modulos/proyecto/components/InicioProyecto.jsx

import React from 'react';
import { Briefcase, CheckCircle2, Users, Clock } from 'lucide-react';

export default function InicioProyecto({ usuario }) {
  // Datos de ejemplo para que veas cómo queda el diseño
  const estadisticas = [
    { id: 1, titulo: "Proyectos Activos", valor: "12", icono: Briefcase, color: "text-blue-500", bg: "bg-blue-100" },
    { id: 2, titulo: "Tareas Completadas", valor: "48", icono: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-100" },
    { id: 3, titulo: "Miembros del Equipo", valor: "24", icono: Users, color: "text-purple-500", bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ENCABEZADO */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#17254C]">
            ¡Hola, {usuario?.nombre || 'Gestor'}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Aquí tienes el resumen de tus proyectos al día de hoy.
          </p>
        </div>
        <button className="bg-[#F39200] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg text-sm">
          + Nuevo Proyecto
        </button>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {estadisticas.map((stat) => {
          const Icono = stat.icono;
          return (
            <div key={stat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-gray-200 transition-colors">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icono size={28} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{stat.titulo}</p>
                <p className="text-3xl font-black text-[#17254C]">{stat.valor}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECCIÓN DE ACTIVIDAD RECIENTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tareas Pendientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#17254C] mb-4 flex items-center gap-2">
            <Clock size={20} className="text-[#F39200]" />
            Tareas Pendientes (Prioridad Alta)
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center hover:bg-blue-50 transition-colors cursor-pointer">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Actualización de Servidores</p>
                  <p className="text-xs text-gray-500 mt-1">Proyecto: Infraestructura Cloud</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold uppercase">
                  Hoy
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Proyectos Recientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#17254C] mb-4 flex items-center gap-2">
            <Briefcase size={20} className="text-[#F39200]" />
            Proyectos Recientes
          </h3>
          <div className="space-y-3">
            {[1, 2].map((item) => (
              <div key={item} className="p-4 border border-gray-100 rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-sm text-[#17254C]">Implementación CRM ERP</p>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded">En curso</span>
                </div>
                {/* Barra de progreso visual */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#17254C] h-full w-[65%] rounded-full"></div>
                </div>
                <p className="text-xs text-gray-400 text-right font-semibold">65% Completado</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}