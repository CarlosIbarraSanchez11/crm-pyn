import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Package, Plus, Upload, Search, Download, FileDown, X,
  MapPin, Cpu, Settings, Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../../../api/axios'; 

const normalizar = (str) =>
  (str || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function Activo() {
  const [activos, setActivos] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [pabellones, setPabellones] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [subiendoExcel, setSubiendoExcel] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const fileInputRef = useRef(null);

  // ==========================================
  // ESTADOS DE LOS FILTROS DE TABLA (NUEVO)
  // ==========================================
  const [fSede, setFSede] = useState('');
  const [fPabellon, setFPabellon] = useState('');
  const [fPiso, setFPiso] = useState('');
  const [fAmbiente, setFAmbiente] = useState('');

  // ==========================================
  // ESTADOS DEL MODAL MANUAL
  // ==========================================
  const [showModal, setShowModal] = useState(false);
  const [mSede, setMSede] = useState('');
  const [mPabellon, setMPabellon] = useState('');
  const [mPiso, setMPiso] = useState('');
  const [formData, setFormData] = useState({
    sistema: '', dispositivo: '', marca: '', modelo: '', serie: '', lote: '', ambienteId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resActivos, resSedes, resPab, resPisos, resAmb] = await Promise.all([
        api.get('/activos'),
        api.get('/ubicaciones/sedes'),
        api.get('/ubicaciones/pabellones'),
        api.get('/ubicaciones/pisos'),
        api.get('/ubicaciones/ambientes')
      ]);
      setActivos(resActivos.data);
      setSedes(resSedes.data);
      setPabellones(resPab.data);
      setPisos(resPisos.data);
      setAmbientes(resAmb.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ==========================================
  // OPCIONES DE FILTROS EN CASCADA (TABLA)
  // ==========================================
  const opcionesFPabellones = useMemo(() => pabellones.filter(p => p.sedeId === Number(fSede)), [pabellones, fSede]);
  const opcionesFPisos = useMemo(() => pisos.filter(p => p.pabellonId === Number(fPabellon)), [pisos, fPabellon]);
  const opcionesFAmbientes = useMemo(() => ambientes.filter(a => a.pisoId === Number(fPiso)), [ambientes, fPiso]);

  // ==========================================
  // BÚSQUEDA Y FILTRADO COMBINADO
  // ==========================================
  const activosFiltrados = useMemo(() => {
    let filtrados = activos;

    // 1. Aplicar filtros de ubicación (Cascada)
    if (fAmbiente) {
      filtrados = filtrados.filter(act => act.ambienteId === Number(fAmbiente));
    } else if (fPiso) {
      filtrados = filtrados.filter(act => act.ambiente?.pisoId === Number(fPiso));
    } else if (fPabellon) {
      filtrados = filtrados.filter(act => act.ambiente?.piso?.pabellonId === Number(fPabellon));
    } else if (fSede) {
      filtrados = filtrados.filter(act => act.ambiente?.piso?.pabellon?.sedeId === Number(fSede));
    }

    // 2. Aplicar filtro de búsqueda de texto
    const term = normalizar(busqueda.trim());
    if (term) {
      filtrados = filtrados.filter(act => 
        normalizar(act.codInventario).includes(term) ||
        normalizar(act.sistema).includes(term) ||
        normalizar(act.dispositivo).includes(term) ||
        normalizar(act.marca).includes(term) ||
        normalizar(act.ambiente?.nombre).includes(term)
      );
    }

    return filtrados;
  }, [activos, busqueda, fSede, fPabellon, fPiso, fAmbiente]);

  // ==========================================
  // OPCIONES DE CASCADA (MODAL)
  // ==========================================
  const modalPabellones = useMemo(() => pabellones.filter(p => p.sedeId === Number(mSede)), [pabellones, mSede]);
  const modalPisos = useMemo(() => pisos.filter(p => p.pabellonId === Number(mPabellon)), [pisos, mPabellon]);
  const modalAmbientes = useMemo(() => ambientes.filter(a => a.pisoId === Number(mPiso)), [ambientes, mPiso]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const abrirModalNuevo = () => {
    setFormData({ sistema: '', dispositivo: '', marca: '', modelo: '', serie: '', lote: '', ambienteId: '' });
    setMSede(''); setMPabellon(''); setMPiso('');
    setShowModal(true);
  };

  const guardarActivo = async () => {
    if (!formData.sistema.trim() || !formData.dispositivo.trim() || !formData.ambienteId) {
      return alert("El Sistema, Dispositivo y el Ambiente destino son obligatorios");
    }
    try {
      await api.post('/activos', { ...formData, ambienteId: Number(formData.ambienteId) });
      alert("Equipo registrado correctamente");
      setShowModal(false);
      fetchData();
    } catch (error) {
      const mensajeError = error.response?.data?.message || "Error al guardar el equipo";
      alert(mensajeError);
    }
  };

  // ... (Exportaciones y Subida Excel se mantienen igual)
  const descargarPlantilla = () => {
    const data = [{ Sistema: "Eléctrico", Dispositivo: "Tablero General", Marca: "Schneider", Modelo: "QO", Serie: "SN-12345", Lote: "L-2026", Sede: "Sede Central", Pabellon: "Pabellón A", Piso: "Piso 1", Ambiente: "Laboratorio 101" }];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla_Activos");
    XLSX.writeFile(workbook, "Plantilla_Activos.xlsx");
  };

  const exportarDatos = () => {
    if (activosFiltrados.length === 0) return alert("No hay equipos en la vista actual para exportar");
    const filas = activosFiltrados.map(act => ({
      Codigo: act.codInventario, Sistema: act.sistema, Dispositivo: act.dispositivo,
      Marca: act.marca, Modelo: act.modelo, Serie: act.serie || '', Lote: act.lote || '',
      Estado: act.estado, Sede: act.ambiente?.piso?.pabellon?.sede?.nombre || '',
      Pabellon: act.ambiente?.piso?.pabellon?.nombre || '', Piso: act.ambiente?.piso?.nombre || '',
      Ambiente: act.ambiente?.nombre || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(filas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
    XLSX.writeFile(workbook, `Inventario_Activos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const subirExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('excel', file);
    try {
      setSubiendoExcel(true);
      const res = await api.post('/activos/importar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert(res.data?.message || `Éxito: ${res.data?.insertados} equipos insertados.`);
      fetchData();
    } catch (error) { alert("Error al procesar el archivo Excel"); } 
    finally { setSubiendoExcel(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#17254C]">Inventario de Activos</h1>
          <p className="text-gray-500 text-sm">Gestiona los equipos, sistemas y su ubicación física</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={descargarPlantilla} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 text-gray-700">
            <Download size={18} /> Plantilla Excel
          </button>
          <button onClick={exportarDatos} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-100">
            <FileDown size={18} /> Exportar
          </button>
          <input type="file" accept=".xlsx" ref={fileInputRef} onChange={subirExcel} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={subiendoExcel} className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 disabled:opacity-60">
            {subiendoExcel ? <><div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" /> Subiendo...</> : <><Upload size={18} /> Cargar Excel</>}
          </button>
          <button onClick={abrirModalNuevo} className="flex items-center gap-2 bg-[#F39200] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600">
            <Plus size={18} /> Nuevo Equipo
          </button>
        </div>
      </div>

      {/* NUEVO: SECCIÓN DE FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
        <h3 className="text-sm font-bold text-[#17254C] flex items-center gap-2">
          <Filter size={16} /> Filtros de Ubicación
        </h3>
        
        {/* Filtros en Cascada para la Tabla */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Sede</label>
            <select value={fSede} onChange={(e) => { setFSede(e.target.value); setFPabellon(''); setFPiso(''); setFAmbiente(''); }} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]">
              <option value="">Todas las Sedes</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Pabellón</label>
            <select value={fPabellon} onChange={(e) => { setFPabellon(e.target.value); setFPiso(''); setFAmbiente(''); }} disabled={!fSede} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:border-[#F39200]">
              <option value="">{fSede ? 'Todos los Pabellones' : '-'}</option>
              {opcionesFPabellones.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Piso</label>
            <select value={fPiso} onChange={(e) => { setFPiso(e.target.value); setFAmbiente(''); }} disabled={!fPabellon} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:border-[#F39200]">
              <option value="">{fPabellon ? 'Todos los Pisos' : '-'}</option>
              {opcionesFPisos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Ambiente</label>
            <select value={fAmbiente} onChange={(e) => setFAmbiente(e.target.value)} disabled={!fPiso} className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:border-[#F39200]">
              <option value="">{fPiso ? 'Todos los Ambientes' : '-'}</option>
              {opcionesFAmbientes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* Buscador de Texto General */}
        <div className="relative pt-2 border-t border-gray-50">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 mt-1 text-gray-300" />
          <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Búsqueda libre por código, sistema, equipo, marca..." className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:bg-white focus:border-[#F39200] transition-colors" />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-gray-300 hover:text-gray-500">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando inventario...</div>
        ) : activosFiltrados.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No se encontraron equipos con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-[#17254C] font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4 whitespace-nowrap">Código</th>
                  <th className="p-4">Equipo / Sistema</th>
                  <th className="p-4">Marca / Modelo</th>
                  <th className="p-4">Ubicación Física</th>
                  <th className="p-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activosFiltrados.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-black text-[#F39200] whitespace-nowrap">{act.codInventario}</td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 text-gray-400"><Cpu size={14}/></div>
                        <div>
                          <p className="font-bold text-[#17254C] leading-snug">{act.dispositivo}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{act.sistema}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 text-gray-400"><Settings size={14}/></div>
                        <div>
                          <p className="font-semibold text-gray-700 leading-snug">{act.marca}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">Mod: {act.modelo} {act.serie ? `| S/N: ${act.serie}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#17254C] mb-1">
                        <MapPin size={12} className="text-[#F39200]"/> {act.ambiente?.nombre}
                      </div>
                      <p className="text-[10px] text-gray-400 ml-4">
                        {act.ambiente?.piso?.pabellon?.sede?.nombre} / Pab. {act.ambiente?.piso?.pabellon?.nombre} / Piso {act.ambiente?.piso?.nombre}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-600 border border-green-200">{act.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#17254C]">
              <h2 className="text-white font-bold flex items-center gap-2"><Package size={20} className="text-[#F39200]" /> Registrar Nuevo Equipo</h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 border-b pb-2">1. Detalles del Equipo</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Sistema *</label>
                    <input name="sistema" value={formData.sistema} onChange={handleInputChange} placeholder="Ej: Sistema Eléctrico" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Dispositivo *</label>
                    <input name="dispositivo" value={formData.dispositivo} onChange={handleInputChange} placeholder="Ej: Tablero General" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Marca</label>
                    <input name="marca" value={formData.marca} onChange={handleInputChange} placeholder="Opcional" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Modelo</label>
                    <input name="modelo" value={formData.modelo} onChange={handleInputChange} placeholder="Opcional" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Número de Serie</label>
                    <input name="serie" value={formData.serie} onChange={handleInputChange} placeholder="Opcional" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Lote (Opcional)</label>
                    <input name="lote" value={formData.lote} onChange={handleInputChange} placeholder="Opcional" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 border-b pb-2">2. Asignación Física</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Sede</label>
                    <select value={mSede} onChange={(e) => { setMSede(e.target.value); setMPabellon(''); setMPiso(''); setFormData({...formData, ambienteId: ''}); }} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]">
                      <option value="">-- Elija Sede --</option>
                      {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Pabellón</label>
                    <select value={mPabellon} onChange={(e) => { setMPabellon(e.target.value); setMPiso(''); setFormData({...formData, ambienteId: ''}); }} disabled={!mSede} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:border-[#F39200]">
                      <option value="">{mSede ? '-- Elija Pabellón --' : 'Primero elige sede'}</option>
                      {modalPabellones.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Piso</label>
                    <select value={mPiso} onChange={(e) => { setMPiso(e.target.value); setFormData({...formData, ambienteId: ''}); }} disabled={!mPabellon} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:border-[#F39200]">
                      <option value="">{mPabellon ? '-- Elija Piso --' : 'Primero elige pabellón'}</option>
                      {modalPisos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Ambiente Destino *</label>
                    <select name="ambienteId" value={formData.ambienteId} onChange={handleInputChange} disabled={!mPiso} className="w-full p-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none disabled:bg-gray-50 disabled:text-gray-300 focus:border-[#F39200]">
                      <option value="">{mPiso ? '-- Elija Ambiente --' : 'Primero elige piso'}</option>
                      {modalAmbientes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200">Cancelar</button>
              <button onClick={guardarActivo} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#F39200] text-white hover:bg-orange-600 shadow-sm">Guardar Equipo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}