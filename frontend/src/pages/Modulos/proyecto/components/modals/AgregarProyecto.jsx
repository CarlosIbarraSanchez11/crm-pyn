import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AgregarProyecto({ openModal, setOpenModal, recargarProyectos }) {
  const [loading, setLoading] = useState(false);

  // Estados para los códigos autogenerados
  const [codigoSolicitud, setCodigoSolicitud] = useState('Cargando...');
  const [codigoInterno, setCodigoInterno] = useState('Cargando...');

  // Estados para los desplegables
  const [zonales, setZonales] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [pabellones, setPabellones] = useState([]);
  const [pisos, setPisos] = useState([]);
  const [ambientes, setAmbientes] = useState([]);

  const [zonalId, setZonalId] = useState('');
  const [sedeId, setSedeId] = useState('');
  const [pabellonId, setPabellonId] = useState('');
  const [pisoId, setPisoId] = useState('');

  const [formData, setFormData] = useState({
    cliente: '',
    nombreProyecto: '',
    tipoProyecto: 'OPEX',
    ambienteId: '',
    sistema: '',
    dispositivo: '',
    marca: '',
    modelo: '',
    // montoReferencial: '',
    descripcion: ''
  });

  const [foto, setFoto] = useState(null);
  const [archivoPdf, setArchivoPdf] = useState(null);

  // Cargar AMBOS códigos autogenerados
  useEffect(() => {
    if (openModal) {
      fetch(`${import.meta.env.VITE_API_URL}/proyectos/siguiente-codigo`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCodigoSolicitud(data.codigoSolicitud);
            setCodigoInterno(data.codigoInterno);
          }
        })
        .catch(err => {
          console.error("Error al cargar códigos", err);
          setCodigoSolicitud('Error');
          setCodigoInterno('Error');
        });
    } else {
      setCodigoSolicitud('Cargando...');
      setCodigoInterno('Cargando...');
    }
  }, [openModal]);

  // Cargar cascada de ubicación (Resumido para espacio, igual que antes)
  useEffect(() => {
    if (openModal) fetch(`${import.meta.env.VITE_API_URL}/ubicaciones/zonales`).then(res => res.json()).then(setZonales);
  }, [openModal]);
  useEffect(() => {
    if (zonalId) fetch(`${import.meta.env.VITE_API_URL}/ubicaciones/sedes?zonalId=${zonalId}`).then(res => res.json()).then(setSedes);
    else { setSedes([]); setSedeId(''); }
  }, [zonalId]);
  useEffect(() => {
    if (sedeId) fetch(`${import.meta.env.VITE_API_URL}/ubicaciones/pabellones?sedeId=${sedeId}`).then(res => res.json()).then(setPabellones);
    else { setPabellones([]); setPabellonId(''); }
  }, [sedeId]);
  useEffect(() => {
    if (pabellonId) fetch(`${import.meta.env.VITE_API_URL}/ubicaciones/pisos?pabellonId=${pabellonId}`).then(res => res.json()).then(setPisos);
    else { setPisos([]); setPisoId(''); }
  }, [pabellonId]);
  useEffect(() => {
    if (pisoId) fetch(`${import.meta.env.VITE_API_URL}/ubicaciones/ambientes?pisoId=${pisoId}`).then(res => res.json()).then(setAmbientes);
    else { setAmbientes([]); setFormData(prev => ({ ...prev, ambienteId: '' })); }
  }, [pisoId]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
    if (foto) dataToSend.append('foto', foto);
    if (archivoPdf) dataToSend.append('archivoPdf', archivoPdf);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/proyectos`, { method: 'POST', body: dataToSend });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      Swal.fire({
        icon: 'success',
        title: '¡Registrado!',
        text: `Proyecto creado (SOL: ${result.data.numeroSolicitante} | PI: ${result.data.numeroProyectoInterno})`,
        confirmButtonColor: '#17254C'
      });

      recargarProyectos();
      setOpenModal(false);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#17254C' });
    } finally {
      setLoading(false);
    }
  };

  if (!openModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#F39200] mb-1">Módulo de Oportunidades</p>
            <h2 className="text-xl font-black text-[#17254C] uppercase tracking-tight">Nuevo Proyecto</h2>
          </div>
          <button onClick={() => setOpenModal(false)} className="p-2 text-gray-400 hover:text-black rounded-full transition-colors"><X size={22} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="form-proyecto" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. INFORMACIÓN GENERAL */}
            <div>
              <h3 className="text-xs font-black text-[#17254C] uppercase tracking-wider mb-3 border-b pb-1">1. Datos Generales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 🔥 CÓDIGO DE SOLICITUD */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">N° de Solicitud</label>
                  <input type="text" value={codigoSolicitud} readOnly className="w-full bg-gray-200 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 outline-none cursor-not-allowed shadow-inner tracking-widest" />
                </div>

                {/* 🔥 NUEVO: CÓDIGO DE PROYECTO INTERNO (PI-XXXX) */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#F39200] mb-1">N° Proyecto Interno</label>
                  <input type="text" value={codigoInterno} readOnly className="w-full bg-gray-200 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-black text-[#17254C] outline-none cursor-not-allowed shadow-inner tracking-widest" />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Cliente</label>
                  <input type="text" name="cliente" value={formData.cliente} onChange={handleChange} required placeholder="Ej: Minerosur SAC" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#F39200]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Nombre del Proyecto</label>
                  <input type="text" name="nombreProyecto" value={formData.nombreProyecto} onChange={handleChange} required placeholder="Ej: Planta Procesadora Norte" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#F39200]" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Tipo de Proyecto</label>
                  <select name="tipoProyecto" value={formData.tipoProyecto} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#F39200] cursor-pointer">
                    <option value="OPEX">OPEX</option>
                    <option value="CAPEX">CAPEX</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. UBICACIÓN (Resto del formulario sigue igual...) */}
            <div>
              <h3 className="text-xs font-black text-[#17254C] uppercase tracking-wider mb-3 border-b pb-1">2. Ubicación Geográfica y Técnica</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Zonal</label>
                  <select value={zonalId} onChange={(e) => setZonalId(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none cursor-pointer">
                    <option value="">Seleccionar Zonal...</option>
                    {zonales.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Local / Sede</label>
                  <select value={sedeId} onChange={(e) => setSedeId(e.target.value)} required disabled={!zonalId} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none cursor-pointer disabled:opacity-50">
                    <option value="">Seleccionar Sede...</option>
                    {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Edificio / Pabellón</label>
                  <select value={pabellonId} onChange={(e) => setPabellonId(e.target.value)} required disabled={!sedeId} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none cursor-pointer disabled:opacity-50">
                    <option value="">Seleccionar Pabellón...</option>
                    {pabellones.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Piso</label>
                  <select value={pisoId} onChange={(e) => setPisoId(e.target.value)} required disabled={!pabellonId} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none cursor-pointer disabled:opacity-50">
                    <option value="">Seleccionar Piso...</option>
                    {pisos.map(pi => <option key={pi.id} value={pi.id}>{pi.nombre}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Ambiente Específico</label>
                  <select name="ambienteId" value={formData.ambienteId} onChange={handleChange} required disabled={!pisoId} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none cursor-pointer disabled:opacity-50">
                    <option value="">Seleccionar Ambiente...</option>
                    {ambientes.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. DETALLES TÉCNICOS */}
            <div>
              <h3 className="text-xs font-black text-[#17254C] uppercase tracking-wider mb-3 border-b pb-1">3. Componentes y Presupuesto</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" name="sistema" value={formData.sistema} onChange={handleChange} placeholder="Sistema" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold" />
                <input type="text" name="dispositivo" value={formData.dispositivo} onChange={handleChange} placeholder="Dispositivo" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold" />
                <input type="text" name="marca" value={formData.marca} onChange={handleChange} placeholder="Marca" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold" />
                <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} placeholder="Modelo" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Monto Referencial (S/)</label>
                  <input type="number" step="0.01" name="montoReferencial" value={formData.montoReferencial} onChange={handleChange} required placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none" />
                </div> */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Documento PDF Adjunto</label>
                  <input type="file" accept="application/pdf" onChange={(e) => setArchivoPdf(e.target.files[0])} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#17254C] file:text-white hover:file:bg-black cursor-pointer" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Descripción del proyecto</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="2" placeholder="Detalle adicional..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none resize-none"></textarea>
              </div>
            </div>

          </form>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex justify-end gap-3 shrink-0">
          <button type="button" onClick={() => setOpenModal(false)} className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-gray-500 hover:bg-gray-200 transition-colors">Cancelar</button>
          <button type="submit" form="form-proyecto" disabled={loading} className="px-6 py-2.5 rounded-xl font-black bg-[#17254C] hover:bg-black text-[#F39200] text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Crear Proyecto
          </button>
        </div>
      </div>
    </div>
  );
}