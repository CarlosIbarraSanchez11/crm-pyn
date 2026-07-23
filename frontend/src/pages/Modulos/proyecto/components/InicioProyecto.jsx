import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Briefcase, CheckCircle2, Clock, LayoutGrid, List, Download, Loader2, DollarSign, X, Upload, FileText } from 'lucide-react';
import AgregarProyecto from './modals/AgregarProyecto';

export default function InicioProyecto({ usuario }) {
  const [vistaActiva, setVistaActiva] = useState('kanban');
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Estados para el Modal de Detalle/Cotización
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [datosCotizacion, setDatosCotizacion] = useState({
    gastoEquipos: '', 
    gastoMateriales: '', 
    gastoManoObra: '', 
    gastosAdministrativos: '', 
    costoCliente: '', 
    archivoCotizacion: null // 🔥 Estado para el archivo PDF o Excel
  });

  const COLUMNAS = {
    oportunidad: { id: 'oportunidad', titulo: 'Oportunidad', colorBg: 'bg-gray-100', colorTexto: 'text-gray-700' },
    pendiente: { id: 'pendiente', titulo: 'Pendiente', colorBg: 'bg-blue-50', colorTexto: 'text-blue-700' },
    progreso: { id: 'progreso', titulo: 'En Progreso', colorBg: 'bg-teal-50', colorTexto: 'text-teal-700' },
    revision: { id: 'revision', titulo: 'En Revisión', colorBg: 'bg-amber-50', colorTexto: 'text-amber-700' },
    completado: { id: 'completado', titulo: 'Completados', colorBg: 'bg-emerald-50', colorTexto: 'text-emerald-700' },
  };

  const fetchProyectos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/proyectos`);
      const json = await response.json();
      
      if (json.success) {
        // 🔥 FILTRO EXACTO BASADO EN TU LÓGICA:
        // Mostramos si es interno, O si no tiene numeroProyectoCliente (porque es manual)
        const dataFiltrada = json.data.filter(p => 
          p.cliente === 'P&P S.A.C' || 
          p.cliente === 'Uso Interno - Mantenimiento' || 
          !p.numeroProyectoCliente // 👈 ¡La clave que descubriste! (Filtra los que son NULL)
        );

        const dataMapeada = dataFiltrada.map(p => ({
          ...p, 
          id: p.id,
          codigo: p.numeroSolicitante || p.numeroProyectoInterno, 
          nombre: p.nombreProyecto,
          cliente: p.cliente,
          fecha: new Date(p.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
          estado: p.estado || 'oportunidad',
          foto: p.foto, // 🔥 AGREGAR ESTA LÍNEA
          descripcion: p.descripcion
        }));
        
        setProyectos(dataMapeada);
      }
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProyectos(); }, []);

  // Lógica de cálculo automático para el formulario de cotización
  const totalGastos = 
    Number(datosCotizacion.gastoEquipos || 0) + 
    Number(datosCotizacion.gastoMateriales || 0) + 
    Number(datosCotizacion.gastoManoObra || 0) + 
    Number(datosCotizacion.gastosAdministrativos || 0);
  
  const margenSoles = Number(datosCotizacion.costoCliente || 0) - totalGastos;
  const margenPorcentaje = Number(datosCotizacion.costoCliente) > 0 
    ? ((margenSoles / Number(datosCotizacion.costoCliente)) * 100).toFixed(2) 
    : 0;

  const handleCotizar = async (e) => {
    e.preventDefault();

    // Usamos FormData porque estamos enviando un archivo binario además de textos
    const formData = new FormData();
    formData.append('gastoEquipos', datosCotizacion.gastoEquipos);
    formData.append('gastoMateriales', datosCotizacion.gastoMateriales);
    formData.append('gastoManoObra', datosCotizacion.gastoManoObra);
    formData.append('gastosAdministrativos', datosCotizacion.gastosAdministrativos);
    formData.append('costoCliente', datosCotizacion.costoCliente);
    formData.append('margen', margenPorcentaje);
    
    if (datosCotizacion.archivoCotizacion) {
      formData.append('archivoPdf', datosCotizacion.archivoCotizacion);
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/proyectos/${proyectoSeleccionado.id}/cotizar`, {
        method: 'PATCH',
        body: formData // Nota: No se le pasa 'Content-Type', el navegador lo detecta solo al usar FormData
      });

      if (res.ok) {
        alert("Cotización y archivo guardados. El proyecto ha pasado a PENDIENTE.");
        setProyectoSeleccionado(null);
        setDatosCotizacion({ 
          gastoEquipos: '', 
          gastoMateriales: '', 
          gastoManoObra: '', 
          gastosAdministrativos: '', 
          costoCliente: '', 
          archivoCotizacion: null 
        });
        fetchProyectos();
      } else {
        alert("Error al guardar la cotización.");
      }
    } catch (error) {
      console.error("Error al cotizar:", error);
    }
  };

  const alArrastrarTerminar = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (source.droppableId === 'completado' && destination.droppableId === 'oportunidad') {
      alert("❌ No se puede regresar un proyecto completado a oportunidad.");
      return; 
    }

    setProyectos((prevProyectos) =>
      prevProyectos.map((proy) => {
        if (String(proy.id) === draggableId) {
          return { ...proy, estado: destination.droppableId };
        }
        return proy;
      })
    );

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/proyectos/${draggableId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: destination.droppableId })
      });
    } catch (error) {
      console.error("Error al sincronizar el estado en el servidor:", error);
    }
  };

  if (loading) { 
    return ( 
      <div className="w-full h-96 flex flex-col items-center justify-center"> 
        <Loader2 className="animate-spin text-[#F39200] mb-3" size={40} /> 
        <p className="text-sm font-bold text-gray-500">Cargando proyectos...</p> 
      </div> 
    ); 
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* ENCABEZADO */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#17254C]">¡Hola, {usuario?.nombre || 'Carlos'}! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de Proyectos Internos (P&P S.A.C).</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setModalAbierto(true)} className="bg-[#F39200] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md text-sm">
            + Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* VISTA KANBAN */}
      {vistaActiva === 'kanban' && (
        <DragDropContext onDragEnd={alArrastrarTerminar}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {Object.values(COLUMNAS).map((columna) => (
              <Droppable key={columna.id} droppableId={columna.id}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`p-4 rounded-2xl min-w-[220px] border transition-colors ${snapshot.isDraggingOver ? 'bg-orange-50/50 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#17254C] mb-3 border-b pb-2 flex justify-between">
                      <span>{columna.titulo}</span>
                      <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-md">{proyectos.filter((p) => p.estado === columna.id).length}</span>
                    </h4>
                    <div className="space-y-3 min-h-[150px]">
                      {proyectos.filter((p) => p.estado === columna.id).map((proy, index) => (
                        <Draggable key={proy.id} draggableId={String(proy.id)} index={index}>
                          {(providedDrag, snapshotDrag) => (
                            <div 
                              ref={providedDrag.innerRef} 
                              {...providedDrag.draggableProps} 
                              {...providedDrag.dragHandleProps} 
                              onClick={() => setProyectoSeleccionado(proy)} 
                              className={`bg-white p-4 rounded-xl border shadow-sm transition-all select-none cursor-pointer ${snapshotDrag.isDragging ? 'rotate-2 border-[#F39200] shadow-lg' : 'border-gray-100 hover:border-[#F39200] hover:shadow-md'}`}
                            >
                              <p className="text-xs font-black text-[#F39200]">{proy.codigo}</p>
                              <p className="font-bold text-sm text-[#17254C] mt-1 line-clamp-2">{proy.nombre}</p>
                              <p className="text-xs text-gray-400 mt-1">{proy.cliente}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* MODAL DE DETALLE Y COTIZACIÓN */}
      {proyectoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#17254C] flex items-center gap-2">
                <Briefcase className="text-[#F39200]" />
                Detalle del Proyecto: {proyectoSeleccionado.codigo}
              </h2>
              <button onClick={() => setProyectoSeleccionado(null)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lado Izquierdo: Información general */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Información Técnica</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-sm">
                  <p><span className="font-bold text-[#17254C]">Nombre:</span> {proyectoSeleccionado.nombre}</p>
                  <p><span className="font-bold text-[#17254C]">Cliente:</span> {proyectoSeleccionado.cliente}</p>
                  <p><span className="font-bold text-[#17254C]">Sistema:</span> {proyectoSeleccionado.sistema || 'N/A'}</p>
                  <p><span className="font-bold text-[#17254C]">Dispositivo:</span> {proyectoSeleccionado.dispositivo || 'N/A'}</p>
                  <p><span className="font-bold text-[#17254C]">Descripción:</span> <br/>{proyectoSeleccionado.descripcion || 'Sin descripción'}</p>
                </div>

                {/* 🔥 NUEVO: SECCIÓN DE EVIDENCIA FOTOGRÁFICA */}
                {proyectoSeleccionado.foto && (
                  <div className="mt-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Evidencia del Daño / Incidencia</h3>
                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <img 
                        // Asegúrate de que el puerto coincida con tu backend (igual que en tu lógica del PDF)
                        src={`http://localhost:3000${proyectoSeleccionado.foto}`} 
                        alt="Evidencia técnica" 
                        className="w-full h-auto max-h-60 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => window.open(`http://localhost:3000${proyectoSeleccionado.foto}`, '_blank')}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 text-center italic">Haz clic en la imagen para verla en tamaño completo</p>
                  </div>
                )}
              </div>

              {/* Lado Derecho: Calculadora de Cotización (Solo visible si está en oportunidad) */}
              {proyectoSeleccionado.estado === 'oportunidad' ? (
                <form onSubmit={handleCotizar} className="space-y-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="text-sm font-bold text-[#17254C] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <DollarSign size={18} className="text-[#F39200]"/> Preparar Cotización
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Gasto de Equipos (S/)</label>
                      <input type="number" step="0.01" required value={datosCotizacion.gastoEquipos} onChange={e => setDatosCotizacion({...datosCotizacion, gastoEquipos: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Gasto de Materiales (S/)</label>
                      <input type="number" step="0.01" required value={datosCotizacion.gastoMateriales} onChange={e => setDatosCotizacion({...datosCotizacion, gastoMateriales: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Mano de Obra (S/)</label>
                      <input type="number" step="0.01" required value={datosCotizacion.gastoManoObra} onChange={e => setDatosCotizacion({...datosCotizacion, gastoManoObra: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Gastos Admin. (S/)</label>
                      <input type="number" step="0.01" required value={datosCotizacion.gastosAdministrativos} onChange={e => setDatosCotizacion({...datosCotizacion, gastosAdministrativos: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold text-[#17254C] mb-1">Costo Enviado al Cliente (S/)</label>
                    <input type="number" step="0.01" required value={datosCotizacion.costoCliente} onChange={e => setDatosCotizacion({...datosCotizacion, costoCliente: e.target.value})} className="w-full border-2 border-[#F39200] rounded-lg p-2.5 text-base font-bold text-[#17254C]" />
                  </div>

                  {/* Resumen Automático */}
                  <div className="bg-white p-3 rounded-lg border border-blue-100 flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-semibold">Margen Calculado:</span>
                    <span className={`font-black ${margenSoles > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      S/ {margenSoles.toFixed(2)} ({margenPorcentaje}%)
                    </span>
                  </div>

                  {/* 🔥 NUEVO: Input para adjuntar documento PDF o Excel */}
                  <div>
                    <label className="block text-xs font-bold text-[#17254C] mb-1">Adjuntar Cotización (PDF o Excel)</label>
                    <input 
                      type="file" 
                      accept=".pdf,.xlsx,.xls"
                      onChange={e => setDatosCotizacion({...datosCotizacion, archivoCotizacion: e.target.files[0]})}
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#17254C]/10 file:text-[#17254C] hover:file:bg-[#17254C]/20"
                    />
                  </div>

                  <button type="submit" className="w-full bg-[#17254C] hover:bg-[#1e3061] text-white py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                    <Upload size={16} /> Guardar y Pasar a Pendiente
                  </button>
                </form>
              ) : (
                // Vista de lectura si ya pasó la etapa de oportunidad
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Presupuesto Aprobado</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span>Costo Cliente:</span> <span className="font-bold text-[#17254C]">S/ {proyectoSeleccionado.costoCliente || '0.00'}</span></p>
                    <p className="flex justify-between"><span>Margen:</span> <span className="font-bold text-[#F39200]">{proyectoSeleccionado.margen || '0.00'}%</span></p>
                  </div>

                  {proyectoSeleccionado.archivoPdf && (
                    <div className="pt-2">
                      <a 
                        href={`http://localhost:3000${proyectoSeleccionado.archivoPdf}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 p-2.5 rounded-xl text-xs font-bold transition-colors border border-blue-200"
                      >
                        <FileText size={16} /> Ver Cotización Adjunta
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AgregarProyecto openModal={modalAbierto} setOpenModal={setModalAbierto} recargarProyectos={fetchProyectos} />
    </div>
  );
}