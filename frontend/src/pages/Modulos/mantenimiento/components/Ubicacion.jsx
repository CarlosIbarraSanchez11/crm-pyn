import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin, Plus, Upload, Search, Download, FileDown, X,
  ChevronDown, ChevronRight, Building2, Layers, LayoutGrid, Landmark
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../../../api/axios';

const TIPOS_UBICACION = [
  { value: 'ZONAL', label: 'Zonal', icon: Landmark, desc: 'Agrupación regional de sedes' },
  { value: 'SEDE', label: 'Sede', icon: Building2, desc: 'Local o sucursal principal' },
  { value: 'PABELLON', label: 'Pabellón', icon: Layers, desc: 'Área dentro de una sede' },
  { value: 'PISO', label: 'Piso', icon: LayoutGrid, desc: 'Nivel dentro de un pabellón' },
  { value: 'AMBIENTE', label: 'Ambiente', icon: MapPin, desc: 'Aula, laboratorio o espacio puntual' },
];

const normalizar = (str) =>
  (str || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function Ubicacion() {
  // ==========================================
  // ESTADOS PARA LAS 5 TABLAS
  // ==========================================
  const [zonales, setZonales] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [pabellones, setPabellones] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subiendoExcel, setSubiendoExcel] = useState(false);
  const fileInputRef = useRef(null);

  // ==========================================
  // ESTADOS DEL ÁRBOL (búsqueda + expandido)
  // ==========================================
  const [busqueda, setBusqueda] = useState('');
  const [expandedZonales, setExpandedZonales] = useState(new Set());
  const [expandedSedes, setExpandedSedes] = useState(new Set());
  const [expandedPabellones, setExpandedPabellones] = useState(new Set());
  const [expandedPisos, setExpandedPisos] = useState(new Set());

  // ==========================================
  // ESTADOS PARA EL MODAL DE CREACIÓN MANUAL
  // ==========================================
  const [showModal, setShowModal] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState('ZONAL');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [mZonal, setMZonal] = useState('');
  const [mSede, setMSede] = useState('');
  const [mPabellon, setMPabellon] = useState('');
  const [mPiso, setMPiso] = useState('');

  // Cargar todos los datos de las 5 tablas
  const fetchUbicaciones = async () => {
    try {
      setLoading(true);
      const [resZonales, resSedes, resPab, resPisos, resAmb] = await Promise.all([
        api.get('/ubicaciones/zonales'),
        api.get('/ubicaciones/sedes'),
        api.get('/ubicaciones/pabellones'),
        api.get('/ubicaciones/pisos'),
        api.get('/ubicaciones/ambientes')
      ]);
      setZonales(resZonales.data);
      setSedes(resSedes.data);
      setPabellones(resPab.data);
      setPisos(resPisos.data);
      setAmbientes(resAmb.data);
    } catch (error) {
      console.error("Error al cargar ubicaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUbicaciones();
  }, []);

  // ==========================================
  // ÁRBOL JERÁRQUICO (Zonal > Sede > Pabellón > Piso > Ambiente)
  // ==========================================
  const arbolUbicaciones = useMemo(() => {
    return zonales.map(zonal => ({
      ...zonal,
      sedes: sedes
        .filter(s => s.zonalId === zonal.id)
        .map(sede => ({
          ...sede,
          pabellones: pabellones
            .filter(p => p.sedeId === sede.id)
            .map(pab => ({
              ...pab,
              pisos: pisos
                .filter(pi => pi.pabellonId === pab.id)
                .map(piso => ({
                  ...piso,
                  ambientes: ambientes.filter(a => a.pisoId === piso.id)
                }))
            }))
        }))
    }));
  }, [zonales, sedes, pabellones, pisos, ambientes]);

  // 🔍 Árbol filtrado por búsqueda (auto-expande ramas coincidentes)
  const arbolVisible = useMemo(() => {
    const term = normalizar(busqueda.trim());
    if (!term) return arbolUbicaciones;

    const filtrarAmbientes = (lista) => lista.filter(a => normalizar(a.nombre).includes(term));

    return arbolUbicaciones
      .map(zonal => {
        const sedesFiltradas = zonal.sedes
          .map(sede => {
            const pabellonesFiltrados = sede.pabellones
              .map(pab => {
                const pisosFiltrados = pab.pisos
                  .map(piso => {
                    const ambientesFiltrados = filtrarAmbientes(piso.ambientes);
                    const pisoMatch = normalizar(piso.nombre).includes(term);
                    if (pisoMatch || ambientesFiltrados.length > 0) {
                      return { ...piso, ambientes: pisoMatch ? piso.ambientes : ambientesFiltrados };
                    }
                    return null;
                  })
                  .filter(Boolean);
                const pabMatch = normalizar(pab.nombre).includes(term);
                if (pabMatch || pisosFiltrados.length > 0) {
                  return { ...pab, pisos: pabMatch ? pab.pisos : pisosFiltrados };
                }
                return null;
              })
              .filter(Boolean);
            const sedeMatch = normalizar(sede.nombre).includes(term);
            if (sedeMatch || pabellonesFiltrados.length > 0) {
              return { ...sede, pabellones: sedeMatch ? sede.pabellones : pabellonesFiltrados };
            }
            return null;
          })
          .filter(Boolean);
        const zonalMatch = normalizar(zonal.nombre).includes(term);
        if (zonalMatch || sedesFiltradas.length > 0) {
          return { ...zonal, sedes: zonalMatch ? zonal.sedes : sedesFiltradas };
        }
        return null;
      })
      .filter(Boolean);
  }, [arbolUbicaciones, busqueda]);

  const toggleZonal = (id) => {
    setExpandedZonales(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSede = (id) => {
    setExpandedSedes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const togglePabellon = (id) => {
    setExpandedPabellones(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const togglePiso = (id) => {
    setExpandedPisos(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandirTodo = () => {
    setExpandedZonales(new Set(zonales.map(z => z.id)));
    setExpandedSedes(new Set(sedes.map(s => s.id)));
    setExpandedPabellones(new Set(pabellones.map(p => p.id)));
    setExpandedPisos(new Set(pisos.map(p => p.id)));
  };
  const colapsarTodo = () => {
    setExpandedZonales(new Set());
    setExpandedSedes(new Set());
    setExpandedPabellones(new Set());
    setExpandedPisos(new Set());
  };

  // ==========================================
  // LÓGICA DE CASCADA (MODAL FORMULARIO)
  // ==========================================
  const modalSedes = useMemo(() => sedes.filter(s => s.zonalId === Number(mZonal)), [sedes, mZonal]);
  const modalPabellones = useMemo(() => pabellones.filter(p => p.sedeId === Number(mSede)), [pabellones, mSede]);
  const modalPisos = useMemo(() => pisos.filter(p => p.pabellonId === Number(mPabellon)), [pisos, mPabellon]);

  // Cambiar el tipo dentro del modal (resetea la cascada, no hay padre aún)
  const handleNuevoTipo = (tipo) => {
    setNuevoTipo(tipo);
    setMZonal(''); setMSede(''); setMPabellon(''); setMPiso('');
  };

  // Abrir modal con un padre YA preseleccionado (botones "+" del árbol)
  const onCrear = (tipo, contexto = {}) => {
    setNuevoTipo(tipo);
    setNuevoNombre('');
    if (tipo === 'ZONAL') {
      setMZonal(''); setMSede(''); setMPabellon(''); setMPiso('');
    } else if (tipo === 'SEDE') {
      setMZonal(contexto.zonalId ? String(contexto.zonalId) : '');
      setMSede(''); setMPabellon(''); setMPiso('');
    } else if (tipo === 'PABELLON') {
      const sede = sedes.find(s => s.id === contexto.sedeId);
      setMZonal(sede ? String(sede.zonalId) : '');
      setMSede(contexto.sedeId ? String(contexto.sedeId) : '');
      setMPabellon(''); setMPiso('');
    } else if (tipo === 'PISO') {
      const pab = pabellones.find(p => p.id === contexto.pabellonId);
      const sede = pab ? sedes.find(s => s.id === pab.sedeId) : null;
      setMZonal(sede ? String(sede.zonalId) : '');
      setMSede(pab ? String(pab.sedeId) : '');
      setMPabellon(contexto.pabellonId ? String(contexto.pabellonId) : '');
      setMPiso('');
    } else if (tipo === 'AMBIENTE') {
      const piso = pisos.find(p => p.id === contexto.pisoId);
      const pab = piso ? pabellones.find(p => p.id === piso.pabellonId) : null;
      const sede = pab ? sedes.find(s => s.id === pab.sedeId) : null;
      setMZonal(sede ? String(sede.zonalId) : '');
      setMSede(pab ? String(pab.sedeId) : '');
      setMPabellon(piso ? String(piso.pabellonId) : '');
      setMPiso(contexto.pisoId ? String(contexto.pisoId) : '');
    }
    setShowModal(true);
  };

  const abrirModalNuevo = () => onCrear('ZONAL');

  // Vista previa tipo "breadcrumb" dentro del modal
  const rutaPreview = useMemo(() => {
    const partes = [];
    if (nuevoTipo !== 'ZONAL' && mZonal) {
      partes.push(zonales.find(z => z.id === Number(mZonal))?.nombre);
    }
    if ((nuevoTipo === 'PABELLON' || nuevoTipo === 'PISO' || nuevoTipo === 'AMBIENTE') && mSede) {
      partes.push(sedes.find(s => s.id === Number(mSede))?.nombre);
    }
    if ((nuevoTipo === 'PISO' || nuevoTipo === 'AMBIENTE') && mPabellon) {
      partes.push(pabellones.find(p => p.id === Number(mPabellon))?.nombre);
    }
    if (nuevoTipo === 'AMBIENTE' && mPiso) {
      partes.push(pisos.find(p => p.id === Number(mPiso))?.nombre);
    }
    partes.push(nuevoNombre.trim() || '(nombre pendiente)');
    return partes.filter(Boolean);
  }, [nuevoTipo, mZonal, mSede, mPabellon, mPiso, nuevoNombre, zonales, sedes, pabellones, pisos]);

  const guardarUbicacion = async () => {
    if (!nuevoNombre.trim()) return alert("El nombre es obligatorio");

    try {
      let payload = { nombre: nuevoNombre };
      let endpoint = '';

      if (nuevoTipo === 'ZONAL') {
        endpoint = '/ubicaciones/zonales';
      } else if (nuevoTipo === 'SEDE') {
        if (!mZonal) return alert("Seleccione un zonal");
        endpoint = '/ubicaciones/sedes';
        payload.zonalId = Number(mZonal);
      } else if (nuevoTipo === 'PABELLON') {
        if (!mSede) return alert("Seleccione una sede");
        endpoint = '/ubicaciones/pabellones';
        payload.sedeId = Number(mSede);
      } else if (nuevoTipo === 'PISO') {
        if (!mPabellon) return alert("Seleccione un pabellón");
        endpoint = '/ubicaciones/pisos';
        payload.pabellonId = Number(mPabellon);
      } else if (nuevoTipo === 'AMBIENTE') {
        if (!mPiso) return alert("Seleccione un piso");
        endpoint = '/ubicaciones/ambientes';
        payload.pisoId = Number(mPiso);
      }

      await api.post(endpoint, payload);
      alert(`${nuevoTipo} guardado correctamente`);
      setShowModal(false);
      setNuevoNombre('');
      setNuevoTipo('ZONAL');
      setMZonal(''); setMSede(''); setMPabellon(''); setMPiso('');
      fetchUbicaciones();
    } catch (error) {
      console.error(error);
      const mensajeError = error.response?.data?.message || "Error al guardar la ubicación manualmente";
      alert(mensajeError); // Mostrará: "Este ambiente ya existe en este piso"
    }
  };

  // ==========================================
  // LÓGICA DE EXCEL
  // ==========================================
  const descargarPlantilla = () => {
    const data = [
      { Zonal: "Zonal Norte", Sede: "Sede Central", Pabellon: "Pabellón A", Piso: "Piso 1", Ambiente: "Laboratorio 101" },
      { Zonal: "Zonal Norte", Sede: "Sede Central", Pabellon: "Pabellón A", Piso: "Piso 1", Ambiente: "Laboratorio 102" },
      { Zonal: "Zonal Sur", Sede: "Sede Sur", Pabellon: "Taller Principal", Piso: "Planta Baja", Ambiente: "Zona de Soldadura" }
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(workbook, "Plantilla_Ubicaciones.xlsx");
  };

  // 📤 Exporta TODO lo que ya está registrado, en el mismo formato de la plantilla
  const exportarDatos = () => {
    const filas = [];

    zonales.forEach(zonal => {
      const sedesDeZonal = sedes.filter(s => s.zonalId === zonal.id);
      if (sedesDeZonal.length === 0) {
        filas.push({ Zonal: zonal.nombre, Sede: '', Pabellon: '', Piso: '', Ambiente: '' });
        return;
      }
      sedesDeZonal.forEach(sede => {
        const pabsDeSede = pabellones.filter(p => p.sedeId === sede.id);
        if (pabsDeSede.length === 0) {
          filas.push({ Zonal: zonal.nombre, Sede: sede.nombre, Pabellon: '', Piso: '', Ambiente: '' });
          return;
        }
        pabsDeSede.forEach(pab => {
          const pisosDePab = pisos.filter(p => p.pabellonId === pab.id);
          if (pisosDePab.length === 0) {
            filas.push({ Zonal: zonal.nombre, Sede: sede.nombre, Pabellon: pab.nombre, Piso: '', Ambiente: '' });
            return;
          }
          pisosDePab.forEach(piso => {
            const ambDePiso = ambientes.filter(a => a.pisoId === piso.id);
            if (ambDePiso.length === 0) {
              filas.push({ Zonal: zonal.nombre, Sede: sede.nombre, Pabellon: pab.nombre, Piso: piso.nombre, Ambiente: '' });
              return;
            }
            ambDePiso.forEach(amb => {
              filas.push({ Zonal: zonal.nombre, Sede: sede.nombre, Pabellon: pab.nombre, Piso: piso.nombre, Ambiente: amb.nombre });
            });
          });
        });
      });
    });

    if (filas.length === 0) return alert("Aún no hay datos registrados para exportar");

    const worksheet = XLSX.utils.json_to_sheet(filas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ubicaciones");
    XLSX.writeFile(workbook, `Ubicaciones_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const subirExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('excel', file);

    try {
      setSubiendoExcel(true);
      const res = await api.post('/ubicaciones/importar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data?.mensaje || "Datos procesados correctamente");
      fetchUbicaciones();
    } catch (error) {
      console.error(error);
      alert("Error al subir el archivo Excel");
    } finally {
      setSubiendoExcel(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 relative">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#17254C]">Jerarquía de Ubicaciones</h1>
          <p className="text-gray-500 text-sm">Explora, busca y administra los espacios físicos</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={descargarPlantilla} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 text-gray-700">
            <Download size={18} /> Plantilla Excel
          </button>

          <button onClick={exportarDatos} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-100">
            <FileDown size={18} /> Exportar Datos
          </button>

          <input type="file" accept=".xlsx" ref={fileInputRef} onChange={subirExcel} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={subiendoExcel}
            className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 disabled:opacity-60"
          >
            {subiendoExcel ? (
              <>
                <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
                Subiendo...
              </>
            ) : (
              <><Upload size={18} /> Cargar Excel</>
            )}
          </button>

          <button onClick={abrirModalNuevo} className="flex items-center gap-2 bg-[#F39200] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600">
            <Plus size={18} /> Nueva Ubicación
          </button>
        </div>
      </div>

      {/* BUSCADOR + CONTROLES DEL ÁRBOL */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-[#17254C] flex items-center gap-2">
            <Search size={16} /> Buscar Ubicación
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={expandirTodo} className="text-[11px] font-bold text-gray-500 hover:text-[#17254C] px-2 py-1">
              Expandir todo
            </button>
            <span className="text-gray-200">|</span>
            <button onClick={colapsarTodo} className="text-[11px] font-bold text-gray-500 hover:text-[#17254C] px-2 py-1">
              Colapsar todo
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe el nombre de un zonal, sede, pabellón, piso o ambiente..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ÁRBOL DE UBICACIONES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando datos...</div>
        ) : arbolVisible.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            {busqueda
              ? `No se encontró ninguna ubicación con "${busqueda}"`
              : 'Aún no hay ubicaciones registradas. Crea la primera con el botón "Nueva Ubicación".'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {arbolVisible.map(zonal => (
              <NodoZonal
                key={zonal.id}
                zonal={zonal}
                abierto={!!busqueda || expandedZonales.has(zonal.id)}
                onToggle={() => toggleZonal(zonal.id)}
                buscando={!!busqueda}
                expandedSedes={expandedSedes}
                toggleSede={toggleSede}
                expandedPabellones={expandedPabellones}
                togglePabellon={togglePabellon}
                expandedPisos={expandedPisos}
                togglePiso={togglePiso}
                onCrear={onCrear}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE CREACIÓN MANUAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#17254C]">
              <h2 className="text-white font-bold flex items-center gap-2">
                <MapPin size={20} className="text-[#F39200]" /> Nueva Ubicación
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* PASO 1: TIPO */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-3">1. ¿Qué vas a crear?</label>
                <div className="grid grid-cols-2 gap-3">
                  {TIPOS_UBICACION.map(t => {
                    const Icono = t.icon;
                    const activo = nuevoTipo === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => handleNuevoTipo(t.value)}
                        className={`text-left p-3 rounded-xl border-2 transition-all ${activo ? 'border-[#F39200] bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${activo ? 'bg-[#F39200] text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <Icono size={16} />
                        </div>
                        <p className={`text-sm font-bold ${activo ? 'text-[#17254C]' : 'text-gray-600'}`}>{t.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{t.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PASO 2: UBICAR EN LA JERARQUÍA */}
              {nuevoTipo !== 'ZONAL' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase">2. ¿Dónde va?</label>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Zonal</label>
                    <select
                      value={mZonal}
                      onChange={(e) => { setMZonal(e.target.value); setMSede(''); setMPabellon(''); setMPiso(''); }}
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]"
                    >
                      <option value="">-- Elija un Zonal --</option>
                      {zonales.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                    </select>
                  </div>

                  {(nuevoTipo === 'PABELLON' || nuevoTipo === 'PISO' || nuevoTipo === 'AMBIENTE') && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Sede</label>
                      <select
                        value={mSede}
                        onChange={(e) => { setMSede(e.target.value); setMPabellon(''); setMPiso(''); }}
                        disabled={!mZonal}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:border-[#F39200]"
                      >
                        <option value="">{mZonal ? '-- Elija una Sede --' : 'Primero elige un zonal'}</option>
                        {modalSedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                      </select>
                    </div>
                  )}

                  {(nuevoTipo === 'PISO' || nuevoTipo === 'AMBIENTE') && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Pabellón</label>
                      <select
                        value={mPabellon}
                        onChange={(e) => { setMPabellon(e.target.value); setMPiso(''); }}
                        disabled={!mSede}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:border-[#F39200]"
                      >
                        <option value="">{mSede ? '-- Elija un Pabellón --' : 'Primero elige una sede'}</option>
                        {modalPabellones.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                    </div>
                  )}

                  {nuevoTipo === 'AMBIENTE' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Piso</label>
                      <select
                        value={mPiso}
                        onChange={(e) => setMPiso(e.target.value)}
                        disabled={!mPabellon}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:border-[#F39200]"
                      >
                        <option value="">{mPabellon ? '-- Elija un Piso --' : 'Primero elige un pabellón'}</option>
                        {modalPisos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* PASO 3: NOMBRE */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                  {nuevoTipo === 'ZONAL' ? '2' : '3'}. Nombre descriptivo
                </label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder={`Ej: ${nuevoTipo === 'ZONAL' ? 'Zonal Norte' : nuevoTipo === 'SEDE' ? 'Sede Sur' : nuevoTipo === 'PABELLON' ? 'Pabellón A' : nuevoTipo === 'PISO' ? 'Piso 1' : 'Laboratorio 101'}`}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]"
                />
              </div>

              {/* VISTA PREVIA */}
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-1.5 flex-wrap text-[11px] font-semibold">
                <span className="text-gray-400">Vista previa:</span>
                {rutaPreview.map((parte, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="text-gray-300">/</span>}
                    <span className={i === rutaPreview.length - 1 ? 'text-[#F39200]' : 'text-gray-500'}>{parte}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200">
                Cancelar
              </button>
              <button onClick={guardarUbicacion} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#F39200] text-white hover:bg-orange-600 shadow-sm">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTES AUXILIARES DEL ÁRBOL
// ==========================================

const EstadoBadge = ({ activo }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap flex-shrink-0 ${activo ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
    {activo ? 'ACTIVO' : 'INACTIVO'}
  </span>
);

const NodoAmbiente = ({ ambiente }) => (
  <div className="flex items-center justify-between py-2.5 pl-4 pr-4 hover:bg-white rounded-lg transition-colors">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-[#F39200] flex-shrink-0">
        <MapPin size={14} />
      </div>
      <p className="text-sm font-medium text-gray-600 truncate">{ambiente.nombre}</p>
    </div>
    <EstadoBadge activo={ambiente.estado} />
  </div>
);

const NodoPiso = ({ piso, abierto, onToggle, onCrear }) => (
  <div className="border-l-2 border-gray-100">
    <div className="flex items-center justify-between pr-4 hover:bg-white transition-colors rounded-lg">
      <button onClick={onToggle} className="flex-1 flex items-center gap-2.5 py-2.5 pl-5 min-w-0 text-left">
        {abierto ? <ChevronDown size={14} className="text-gray-300 flex-shrink-0" /> : <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />}
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
          <LayoutGrid size={14} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#17254C] truncate">{piso.nombre}</p>
          <p className="text-[10px] text-gray-400">{piso.ambientes.length} ambiente(s)</p>
        </div>
      </button>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onCrear('AMBIENTE', { pisoId: piso.id })}
          className="text-[10px] font-bold text-gray-400 hover:text-[#F39200] hover:bg-orange-50 px-2 py-1 rounded-lg transition-all"
        >
          + Ambiente
        </button>
        <EstadoBadge activo={piso.estado} />
      </div>
    </div>
    {abierto && (
      <div className="pl-6 pb-1">
        {piso.ambientes.length === 0
          ? <p className="text-xs text-gray-300 italic py-2 pl-4">Sin ambientes registrados</p>
          : piso.ambientes.map(a => <NodoAmbiente key={a.id} ambiente={a} />)
        }
      </div>
    )}
  </div>
);

const NodoPabellon = ({ pabellon, abierto, onToggle, buscando, expandedPisos, togglePiso, onCrear }) => (
  <div className="border-l-2 border-gray-100 ml-3">
    <div className="flex items-center justify-between pr-4 hover:bg-white transition-colors rounded-lg">
      <button onClick={onToggle} className="flex-1 flex items-center gap-3 py-3 pl-5 min-w-0 text-left">
        {abierto ? <ChevronDown size={15} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={15} className="text-gray-400 flex-shrink-0" />}
        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
          <Layers size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#17254C] truncate">{pabellon.nombre}</p>
          <p className="text-[10px] text-gray-400">{pabellon.pisos.length} piso(s)</p>
        </div>
      </button>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onCrear('PISO', { pabellonId: pabellon.id })}
          className="text-[10px] font-bold text-gray-400 hover:text-[#F39200] hover:bg-orange-50 px-2 py-1 rounded-lg transition-all"
        >
          + Piso
        </button>
        <EstadoBadge activo={pabellon.estado} />
      </div>
    </div>
    {abierto && (
      <div className="pl-4 pb-1">
        {pabellon.pisos.length === 0
          ? <p className="text-xs text-gray-300 italic py-2 pl-6">Sin pisos registrados</p>
          : pabellon.pisos.map(piso => (
              <NodoPiso
                key={piso.id}
                piso={piso}
                abierto={buscando || expandedPisos.has(piso.id)}
                onToggle={() => togglePiso(piso.id)}
                onCrear={onCrear}
              />
            ))
        }
      </div>
    )}
  </div>
);

const NodoSede = ({ sede, abierto, onToggle, buscando, expandedPabellones, togglePabellon, expandedPisos, togglePiso, onCrear }) => (
  <div className="border-l-2 border-gray-100 ml-3">
    <div className="flex items-center justify-between pr-6 hover:bg-white transition-colors">
      <button onClick={onToggle} className="flex-1 flex items-center gap-3 p-3.5 pl-5 min-w-0 text-left">
        {abierto ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
        <div className="w-9 h-9 rounded-xl bg-[#17254C]/5 flex items-center justify-center text-[#17254C] flex-shrink-0">
          <Building2 size={18} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[#17254C] text-sm truncate">{sede.nombre}</p>
          <p className="text-[11px] text-gray-400">{sede.pabellones.length} pabellón(es)</p>
        </div>
      </button>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onCrear('PABELLON', { sedeId: sede.id })}
          className="text-[10px] font-bold text-gray-400 hover:text-[#F39200] hover:bg-orange-50 px-2 py-1 rounded-lg transition-all"
        >
          + Pabellón
        </button>
        <EstadoBadge activo={sede.estado} />
      </div>
    </div>
    {abierto && (
      <div className="pl-6 pb-2 bg-gray-50/40">
        {sede.pabellones.length === 0 ? (
          <p className="text-xs text-gray-300 italic py-3 pl-6">Sin pabellones registrados</p>
        ) : sede.pabellones.map(pab => (
          <NodoPabellon
            key={pab.id}
            pabellon={pab}
            abierto={buscando || expandedPabellones.has(pab.id)}
            onToggle={() => togglePabellon(pab.id)}
            buscando={buscando}
            expandedPisos={expandedPisos}
            togglePiso={togglePiso}
            onCrear={onCrear}
          />
        ))}
      </div>
    )}
  </div>
);

// 🆕 Nivel raíz: Zonal
const NodoZonal = ({ zonal, abierto, onToggle, buscando, expandedSedes, toggleSede, expandedPabellones, togglePabellon, expandedPisos, togglePiso, onCrear }) => (
  <div>
    <div className="flex items-center justify-between pr-6 hover:bg-gray-50 transition-colors bg-slate-50/60">
      <button onClick={onToggle} className="flex-1 flex items-center gap-3 p-4 min-w-0 text-left">
        {abierto ? <ChevronDown size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
          <Landmark size={18} />
        </div>
        <div className="min-w-0">
          <p className="font-black text-[#17254C] text-sm truncate uppercase tracking-tight">{zonal.nombre}</p>
          <p className="text-[11px] text-gray-400">{zonal.sedes.length} sede(s)</p>
        </div>
      </button>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onCrear('SEDE', { zonalId: zonal.id })}
          className="text-[10px] font-bold text-gray-400 hover:text-[#F39200] hover:bg-orange-50 px-2 py-1 rounded-lg transition-all"
        >
          + Sede
        </button>
        <EstadoBadge activo={zonal.estado} />
      </div>
    </div>
    {abierto && (
      <div className="pb-1">
        {zonal.sedes.length === 0 ? (
          <p className="text-xs text-gray-300 italic py-3 pl-8">Sin sedes registradas</p>
        ) : zonal.sedes.map(sede => (
          <NodoSede
            key={sede.id}
            sede={sede}
            abierto={buscando || expandedSedes.has(sede.id)}
            onToggle={() => toggleSede(sede.id)}
            buscando={buscando}
            expandedPabellones={expandedPabellones}
            togglePabellon={togglePabellon}
            expandedPisos={expandedPisos}
            togglePiso={togglePiso}
            onCrear={onCrear}
          />
        ))}
      </div>
    )}
  </div>
);