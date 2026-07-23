import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertTriangle, CheckCircle, Upload, FileText, Eye } from 'lucide-react';
export default function InicioMantenimiento({ usuario }) {
  // DEBUG: qué está llegando como prop en cada render
  // console.log('[InicioMantenimiento] usuario prop:', usuario);

  const [incidencias, setIncidencias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para modales
  const [mostrarModal, setMostrarModal] = useState(false); // Modal ST (Crear)
  const [incidenciaAValidar, setIncidenciaAValidar] = useState(null); // Modal JM (Validar)
  const [contrataSeleccionada, setContrataSeleccionada] = useState('');

  const [incidenciaACotizar, setIncidenciaACotizar] = useState(null); // Para el modal de cotización externa
  const [datosCotizacion, setDatosCotizacion] = useState({ precioReferencial: '', pdfCotizacion: null });

  const [datosRevision, setDatosRevision] = useState(null);
  const [presupuestoEstimado, setPresupuestoEstimado] = useState('');

  // Listas para los selects en cascada y contratas
  const [listas, setListas] = useState({
    sedes: [], pabellones: [], pisos: [], ambientes: [], activos: [], contratas: []
  });

  // Estado único del formulario ST (incluye foto y selección de activo)
  const [formData, setFormData] = useState({
    sedeId: '', pabellonId: '', pisoId: '', ambienteId: '', activoId: '',
    sistema: '', dispositivo: '', marca: '', modelo: '', descripcion: '', foto: null
  });

  // Cargar incidencias y catálogos al iniciar
  useEffect(() => {
    cargarIncidencias();
    cargarCatalogos();
  }, []);

  // Autocompletar la sede del usuario en cuanto el dato esté disponible.
  useEffect(() => {
    console.log('[InicioMantenimiento] efecto sedeId disparado. usuario?.sedeId =', usuario?.sedeId);
    if (usuario?.sedeId) {
      console.log('[InicioMantenimiento] seteando formData.sedeId a', String(usuario.sedeId));
      setFormData(prev => ({ ...prev, sedeId: String(usuario.sedeId) }));
    } else {
      console.log('[InicioMantenimiento] usuario.sedeId no disponible todavía, no se autocompleta');
    }
  }, [usuario?.sedeId]);

  const cargarIncidencias = async () => {
    try {
      const res = await fetch('http://localhost:3000/incidencias');
      if (res.ok) {
        const data = await res.json();
        setIncidencias(data);
      }
    } catch (error) {
      console.error("Error al cargar incidencias:", error);
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [resSedes, resPabellones, resPisos, resAmbientes, resActivos, resContratas] = await Promise.all([
        fetch('http://localhost:3000/ubicaciones/sedes'),
        fetch('http://localhost:3000/ubicaciones/pabellones'),
        fetch('http://localhost:3000/ubicaciones/pisos'),
        fetch('http://localhost:3000/ubicaciones/ambientes'),
        fetch('http://localhost:3000/activos'),
        fetch('http://localhost:3000/contratas') // API de Contratas
      ]);

      const catalogos = {
        sedes: await resSedes.json(),
        pabellones: await resPabellones.json(),
        pisos: await resPisos.json(),
        ambientes: await resAmbientes.json(),
        activos: await resActivos.json(),
        contratas: await resContratas.json() // Guardamos las contratas
      };
      
      console.log('[InicioMantenimiento] catálogos cargados. contratas:', catalogos.contratas);
      setListas(catalogos);
    } catch (error) {
      console.error("Error cargando catálogos:", error);
    }
  };

  // handleChange con reseteo en cascada y autocompletado por activo para el ST
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'foto') {
      setFormData({ ...formData, foto: files[0] });
      return;
    }

    let nuevosDatos = { ...formData, [name]: value };

    if (name === 'sedeId') {
      nuevosDatos = { ...nuevosDatos, pabellonId: '', pisoId: '', ambienteId: '', activoId: '', sistema: '', dispositivo: '', marca: '', modelo: '' };
    } else if (name === 'pabellonId') {
      nuevosDatos = { ...nuevosDatos, pisoId: '', ambienteId: '', activoId: '', sistema: '', dispositivo: '', marca: '', modelo: '' };
    } else if (name === 'pisoId') {
      nuevosDatos = { ...nuevosDatos, ambienteId: '', activoId: '', sistema: '', dispositivo: '', marca: '', modelo: '' };
    } else if (name === 'ambienteId') {
      nuevosDatos = { ...nuevosDatos, activoId: '', sistema: '', dispositivo: '', marca: '', modelo: '' };
    } else if (name === 'activoId') {
      const activoSeleccionado = listas.activos.find(a => a.id === Number(value));
      if (activoSeleccionado) {
        nuevosDatos.sistema = activoSeleccionado.sistema;
        nuevosDatos.dispositivo = activoSeleccionado.dispositivo;
        nuevosDatos.marca = activoSeleccionado.marca || '';
        nuevosDatos.modelo = activoSeleccionado.modelo || '';
      }
    }

    setFormData(nuevosDatos);
  };

  // Submit para el Supervisor de Tienda (Crear Incidencia)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('sedeId', formData.sedeId);
    data.append('pabellonId', formData.pabellonId);
    data.append('pisoId', formData.pisoId);
    data.append('ambienteId', formData.ambienteId);
    data.append('activoId', formData.activoId);
    data.append('sistema', formData.sistema);
    data.append('dispositivo', formData.dispositivo);
    data.append('marca', formData.marca);
    data.append('modelo', formData.modelo);
    data.append('descripcion', formData.descripcion);
    if (formData.foto) {
      data.append('foto', formData.foto);
    }

    try {
      const res = await fetch('http://localhost:3000/incidencias', { 
        method: 'POST',
        body: data
      });

      if (res.ok) {
        setMostrarModal(false);
        cargarIncidencias(); 
        setFormData({
          sedeId: usuario?.sedeId ? String(usuario.sedeId) : '', 
          pabellonId: '', pisoId: '', ambienteId: '', activoId: '',
          sistema: '', dispositivo: '', marca: '', modelo: '', descripcion: '', foto: null
        });
        alert('Avería reportada con éxito y JM notificado.');
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // Submit para el Jefe de Mantenimiento (Validar y Asignar Contrata)
  const handleAsignarContrata = async (e) => {
    e.preventDefault();
    if (!contrataSeleccionada) return alert("Por favor seleccione una contrata.");

    try {
      const res = await fetch(`http://localhost:3000/incidencias/${incidenciaAValidar.id}/asignar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contrataId: contrataSeleccionada,
          estado: 'ASIGNADO_CONTRATA',
          // 🔥 AQUÍ AGREGAMOS EL PRESUPUESTO ESTIMADO DENTRO DE LA FUNCIÓN CORRECTA
          presupuestoEstimado: presupuestoEstimado ? Number(presupuestoEstimado) : 0 
        })
      });

      const data = await res.json();

      if (res.ok) {
        setIncidenciaAValidar(null);
        setContrataSeleccionada('');
        setPresupuestoEstimado(''); // 🔥 Limpiamos también el input del presupuesto
        cargarIncidencias(); 
        
        alert(data.message || 'Operación realizada exitosamente.'); 
      } else {
        alert(`Error: ${data.error || data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error("Error al asignar contrata:", error);
    }
  };

  const handleSubirCotizacion = async (e) => {
    e.preventDefault();
    
    if (!datosCotizacion.pdfCotizacion || !datosCotizacion.precioReferencial) {
      return alert("Debe ingresar un precio referencial y adjuntar el PDF.");
    }

    const formData = new FormData();
    formData.append('precioReferencial', datosCotizacion.precioReferencial);
    formData.append('pdfCotizacion', datosCotizacion.pdfCotizacion);
    // Opcionalmente, puedes mandar un cambio de estado, ej: 'COTIZACION_RECIBIDA'

    try {
      const res = await fetch(`http://localhost:3000/incidencias/${incidenciaACotizar.id}/cotizacion`, {
        method: 'PATCH',
        body: formData // No enviamos JSON porque hay un archivo
      });

      const data = await res.json();

      if (res.ok) {
        alert("Cotización subida correctamente.");
        setIncidenciaACotizar(null);
        setDatosCotizacion({ precioReferencial: '', pdfCotizacion: null });
        cargarIncidencias();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error al subir cotización:", error);
    }
  };

  const abrirModalRevision = async (incidenciaId) => {
      try {
          const res = await fetch(`http://localhost:3000/incidencias/${incidenciaId}/cotizacion`);
          const data = await res.json();
          setDatosRevision(data);
      } catch (error) {
          console.error("Error al obtener detalles:", error);
      }
  };

  const handleEvaluar = async (accion) => {
      if (!window.confirm(`¿Estás seguro de ${accion.toLowerCase()} esta cotización?`)) return;

      try {
          const res = await fetch(`http://localhost:3000/incidencias/${datosRevision.incidencia.id}/evaluar`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accion })
          });
          
          if (res.ok) {
              alert(`Cotización ${accion === 'APROBAR' ? 'aprobada' : 'rechazada'}.`);
              setDatosRevision(null);
              cargarIncidencias();
          }
      } catch (error) {
          console.error("Error al evaluar:", error);
      }
  };
  
  // Filtrado dinámico
  const incidenciasFiltradas = incidencias.filter(inc =>
    inc.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    inc.sistema?.toLowerCase().includes(busqueda.toLowerCase()) ||
    inc.dispositivo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">

      {/* HEADER CON BUSCADOR Y BOTÓN */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#17254C]">Mantenimiento</h1>
          <p className="text-gray-500 text-sm">Registro y control de averías de tienda.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar ticket o sistema..."
              className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#F39200] outline-none text-sm"
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button
            onClick={() => setMostrarModal(true)}
            className="bg-[#17254C] hover:bg-[#1e3061] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            Reportar Avería
          </button>
        </div>
      </div>

      {/* VISTA TABLA DE INCIDENCIAS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[#17254C] text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Ticket</th>
              <th className="p-4">Sistema / Dispositivo</th>
              <th className="p-4">Fecha</th>
              <th className="p-4 text-center">Estado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {incidenciasFiltradas.length > 0 ? (
              incidenciasFiltradas.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50 text-sm">
                  <td className="p-4">
                    <p className="font-bold text-[#17254C]">{inc.codigo}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-700">{inc.sistema}</p>
                    <p className="text-xs text-gray-400">{inc.dispositivo}</p>
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(inc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      inc.estado === 'PENDIENTE_JM' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      inc.estado === 'ASIGNADO_CONTRATA' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {inc.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {inc.estado === 'PENDIENTE_JM' && (
                      <button 
                        onClick={() => setIncidenciaAValidar(inc)}
                        className="bg-[#F39200] hover:bg-[#d88200] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 mx-auto"
                      >
                        <CheckCircle size={14} />
                        Validar
                      </button>
                    )}

                    {inc.estado === 'ASIGNADO_CONTRATA' && (
                      /* Asumimos que el backend te devuelve los datos de la contrata dentro de "inc.contrata" */
                      inc.contrata?.razonSocial === 'P&P S.A.C' ? (
                        <span 
                          title="Gestionado como Proyecto Interno" 
                          className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-not-allowed border border-gray-200 w-max mx-auto"
                        >
                          <CheckCircle size={14} /> 
                          Contrata Interna
                        </span>
                      ) : (
                        <button 
                          onClick={() => setIncidenciaACotizar(inc)}
                          className="bg-[#17254C] hover:bg-[#1e3061] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 mx-auto shadow-sm"
                        >
                          <Upload size={14} /> 
                          Subir Cotización
                        </button>
                      )
                    )}
                    {inc.estado === 'COTIZACION_RECIBIDA' && (
                      <button 
                        onClick={() => abrirModalRevision(inc.id)}
                        className="bg-[#17254C] hover:bg-[#1e3061] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 mx-auto shadow-sm"
                      >
                        <Eye size={14} /> 
                        Revisar Cotización
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                  No se encontraron averías registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: CREAR INCIDENCIA (VISTA ST) */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#17254C] flex items-center gap-2">
                <AlertTriangle className="text-[#F39200]" />
                Registrar Nueva Avería
              </h2>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* SECCIÓN 1: UBICACIÓN */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Ubicación</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sede</label>
                    <select
                      name="sedeId"
                      required
                      value={formData.sedeId}
                      onChange={handleChange}
                      disabled={!!usuario?.sedeId}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F39200] disabled:bg-gray-100 disabled:font-bold disabled:text-[#17254C] disabled:cursor-not-allowed"
                    >
                      <option value="">Seleccione Sede...</option>
                      {listas.sedes.length > 0 ? (
                        listas.sedes.map(sede => (
                          <option key={sede.id} value={sede.id}>{sede.nombre}</option>
                        ))
                      ) : (
                        <option value="">Cargando sedes...</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Pabellón</label>
                    <select name="pabellonId" required value={formData.pabellonId} onChange={handleChange} disabled={!formData.sedeId} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F39200] disabled:bg-gray-50">
                      <option value="">Seleccione Pabellón...</option>
                      {listas.pabellones.filter(pab => pab.sedeId === Number(formData.sedeId)).map(pab => (
                        <option key={pab.id} value={pab.id}>{pab.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Piso</label>
                    <select name="pisoId" required value={formData.pisoId} onChange={handleChange} disabled={!formData.pabellonId} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F39200] disabled:bg-gray-50">
                      <option value="">Seleccione Piso...</option>
                      {listas.pisos.filter(piso => piso.pabellonId === Number(formData.pabellonId)).map(piso => (
                        <option key={piso.id} value={piso.id}>{piso.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Ambiente</label>
                    <select name="ambienteId" required value={formData.ambienteId} onChange={handleChange} disabled={!formData.pisoId} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F39200] disabled:bg-gray-50">
                      <option value="">Seleccione Ambiente...</option>
                      {listas.ambientes.filter(amb => amb.pisoId === Number(formData.pisoId)).map(amb => (
                        <option key={amb.id} value={amb.id}>{amb.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: DETALLES TÉCNICOS */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Equipo / Detalle</h3>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-[#17254C] mb-1">
                    Seleccionar Activo (Opcional - Autocompleta los datos)
                  </label>
                  <select name="activoId" value={formData.activoId} onChange={handleChange} disabled={!formData.ambienteId} className="w-full border border-[#17254C]/20 bg-[#17254C]/5 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F39200] disabled:opacity-50">
                    <option value="">No aplica / Seleccionar Activo del Ambiente...</option>
                    {listas.activos.filter(act => act.ambienteId === Number(formData.ambienteId)).map(act => (
                      <option key={act.id} value={act.id}>
                        {act.codInventario} - {act.dispositivo} ({act.sistema})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sistema</label>
                    <input type="text" name="sistema" required value={formData.sistema} onChange={handleChange} placeholder="Ej. Eléctrico" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F39200]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Dispositivo</label>
                    <input type="text" name="dispositivo" required value={formData.dispositivo} onChange={handleChange} placeholder="Ej. Foco" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F39200]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Marca</label>
                    <input type="text" name="marca" value={formData.marca} onChange={handleChange} placeholder="Ej. Philips" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F39200]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Modelo</label>
                    <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} placeholder="Ej. LED-100" className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F39200]" />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: EVIDENCIA */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Descripción de la avería</label>
                  <textarea name="descripcion" rows="2" value={formData.descripcion} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#F39200]"></textarea>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Adjuntar Foto de la Avería</label>
                  <input type="file" name="foto" accept="image/*" onChange={handleChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#17254C]/10 file:text-[#17254C] hover:file:bg-[#17254C]/20" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setMostrarModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#F39200] hover:bg-[#d88200] rounded-lg">
                  Reportar a JM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VALIDACIÓN Y ASIGNACIÓN (VISTA JM) */}
      {incidenciaAValidar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#17254C] flex items-center gap-2">
                <CheckCircle className="text-[#17254C]" />
                Validar y Asignar Contrata
              </h2>
              <button onClick={() => setIncidenciaAValidar(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleAsignarContrata} className="p-6 space-y-6">
              
              {/* Resumen para el JM (Dos columnas: Datos y Foto) */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Columna 1: Información de la Avería */}
                <div className="space-y-3">
                  <p><b className="text-[#17254C]">Ticket:</b> <br/><span className="text-gray-600">{incidenciaAValidar.codigo}</span></p>
                  
                  <p>
                    <b className="text-[#17254C]">Ubicación:</b> <br/>
                    <span className="text-gray-600">
                      {listas.sedes.find(s => s.id === Number(incidenciaAValidar.sedeId))?.nombre || 'Sede N/A'} - 
                      {listas.ambientes.find(a => a.id === Number(incidenciaAValidar.ambienteId))?.nombre || 'Ambiente N/A'}
                    </span>
                  </p>

                  <p>
                    <b className="text-[#17254C]">Equipo:</b> <br/>
                    <span className="text-gray-600">{incidenciaAValidar.sistema} - {incidenciaAValidar.dispositivo}</span>
                  </p>

                  <p>
                    <b className="text-[#17254C]">Lote / Cod. Inventario:</b> <br/>
                    <span className="text-gray-600">
                      {incidenciaAValidar.activoId 
                        ? (listas.activos.find(a => a.id === Number(incidenciaAValidar.activoId))?.codInventario || 'Sin código registrado') 
                        : 'N/A (Sin activo asignado)'}
                    </span>
                  </p>

                  <p>
                    <b className="text-[#17254C]">Descripción:</b> <br/>
                    <span className="text-gray-600">{incidenciaAValidar.descripcion || 'Sin descripción adicional'}</span>
                  </p>
                </div>

                {/* Columna 2: Evidencia Fotográfica */}
                <div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg p-2 justify-center min-h-[200px]">
                  <span className="text-xs font-bold text-[#17254C] mb-2 uppercase tracking-wider">Evidencia Fotográfica</span>
                  {incidenciaAValidar.fotoUrl ? (
                    <a href={`http://localhost:3000${incidenciaAValidar.fotoUrl}`} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={`http://localhost:3000${incidenciaAValidar.fotoUrl}`} 
                        alt="Evidencia avería" 
                        className="max-h-48 object-contain rounded-md hover:opacity-90 transition-opacity cursor-pointer border border-gray-100"
                      />
                    </a>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-400 text-xs text-center w-full bg-gray-50 rounded-md border border-dashed border-gray-200">
                      Sin foto adjunta
                    </div>
                  )}
                </div>

              </div>

              {/* Presupuesto Estimado del JM */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#17254C] mb-2 uppercase tracking-wider">
                  Presupuesto Estimado (S/)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Ej. 500.00 (Opcional)"
                  value={presupuestoEstimado}
                  onChange={(e) => setPresupuestoEstimado(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#F39200]"
                />
              </div>

              {/* Selección de Contrata */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#17254C] mb-2 uppercase tracking-wider">
                  Derivar a Contrata
                </label>
                <select 
                  required 
                  value={contrataSeleccionada} 
                  onChange={(e) => setContrataSeleccionada(e.target.value)} 
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#F39200]"
                >
                  <option value="">Seleccione la contrata encargada...</option>
                  {listas.contratas.map(c => (
                    // 🔥 CORRECCIÓN: Quitamos el "|| c.nombre"
                    <option key={c.id} value={c.id}>{c.razonSocial}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIncidenciaAValidar(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#17254C] hover:bg-[#1e3061] rounded-lg">
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SUBIR COTIZACIÓN (VISTA PARA TERCEROS) */}
      {incidenciaACotizar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#17254C] flex items-center gap-2">
                <FileText className="text-[#F39200]" />
                Adjuntar Cotización
              </h2>
              <button onClick={() => setIncidenciaACotizar(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubirCotizacion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Precio Referencial (S/)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={datosCotizacion.precioReferencial}
                  onChange={(e) => setDatosCotizacion({...datosCotizacion, precioReferencial: e.target.value})}
                  placeholder="Ej. 1500.00" 
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#F39200]" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Archivo de Cotización (PDF)</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  required
                  onChange={(e) => setDatosCotizacion({...datosCotizacion, pdfCotizacion: e.target.files[0]})}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#17254C]/10 file:text-[#17254C] hover:file:bg-[#17254C]/20" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIncidenciaACotizar(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-[#17254C] hover:bg-[#1e3061] rounded-lg flex items-center gap-2">
                  <Upload size={16} />
                  Guardar Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REVISAR COTIZACIÓN (VISTA JM) */}
      {datosRevision && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#17254C] flex items-center gap-2">
                <Eye className="text-[#F39200]" />
                Revisión de Cotización - {datosRevision.incidencia.codigo}
              </h2>
              <button onClick={() => setDatosRevision(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda: Datos de la Incidencia y Foto */}
              <div className="space-y-4 border-r border-gray-100 pr-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detalle de Avería</h3>
                  <p className="text-sm text-[#17254C]"><b>Sistema:</b> {datosRevision.incidencia.sistema}</p>
                  <p className="text-sm text-[#17254C]"><b>Dispositivo:</b> {datosRevision.incidencia.dispositivo}</p>
                  <p className="text-sm text-[#17254C] mt-2"><b>Descripción:</b> <br/>{datosRevision.incidencia.descripcion || 'Sin descripción'}</p>
                </div>
                
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Evidencia</h3>
                  {datosRevision.incidencia.fotoUrl ? (
                    <img 
                      src={`http://localhost:3000${datosRevision.incidencia.fotoUrl}`} 
                      alt="Evidencia" 
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="h-40 bg-gray-50 flex items-center justify-center text-xs text-gray-400 rounded-lg border border-dashed border-gray-200">Sin foto adjunta</div>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Datos de la Contrata y Propuesta */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Propuesta de Tercero</h3>
                  <div className="bg-[#17254C]/5 p-4 rounded-xl border border-[#17254C]/10">
                    <p className="text-sm text-gray-600 mb-1">Empresa asignada:</p>
                    <p className="text-base font-bold text-[#17254C] mb-4">{datosRevision.incidencia.contrata?.razonSocial || 'Desconocida'}</p>
                    
                    <p className="text-sm text-gray-600 mb-1">Presupuesto Propuesto:</p>
                    <p className="text-2xl font-black text-[#F39200]">S/ {Number(datosRevision.proyecto?.montoReferencial || 0).toFixed(2)}</p>
                  </div>
                </div>

                {datosRevision.proyecto?.archivoPdf && (
                  <div>
                    <a 
                      href={`http://localhost:3000${datosRevision.proyecto.archivoPdf}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 p-3 rounded-xl text-sm font-bold transition-colors border border-blue-200"
                    >
                      📄 Descargar Cotización (PDF)
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button 
                onClick={() => handleEvaluar('RECHAZAR')} 
                className="px-6 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
              >
                Rechazar y Reasignar
              </button>
              <button 
                onClick={() => handleEvaluar('APROBAR')} 
                className="px-6 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Aprobar Presupuesto
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}