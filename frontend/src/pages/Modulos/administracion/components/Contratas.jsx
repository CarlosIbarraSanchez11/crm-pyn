import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, Edit, CheckCircle2, XCircle, Phone, User as UserIcon 
} from 'lucide-react';
import api from '../../../../api/axios'; // Asegúrate de que la ruta sea correcta

export default function Contratas() {
  const [contratas, setContratas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Estados del Modal
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  const estadoInicialForm = {
    id: null,
    ruc: '',
    razonSocial: '',
    contacto: '',
    telefono: '',
    estado: true
  };
  const [formData, setFormData] = useState(estadoInicialForm);

  // Conexión al Backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/contratas');
      setContratas(data);
    } catch (error) {
      console.error("Error al cargar contratas:", error);
      alert("Error de conexión al cargar las empresas contratistas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrado de búsqueda
  const contratasFiltradas = contratas.filter(c => 
    (c.razonSocial || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.ruc || '').includes(busqueda) ||
    (c.contacto || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirModalNuevo = () => {
    setFormData(estadoInicialForm);
    setModoEdicion(false);
    setShowModal(true);
  };

  const abrirModalEditar = (contrata) => {
    setFormData({
      id: contrata.id,
      ruc: contrata.ruc,
      razonSocial: contrata.razonSocial,
      contacto: contrata.contacto || '',
      telefono: contrata.telefono || '',
      // ESTAS DOS LÍNEAS ERAN LAS QUE FALTABAN:
      correo: contrata.correo || '',      
      direccion: contrata.direccion || '',
      estado: contrata.estado
    });
    setModoEdicion(true);
    setShowModal(true);
  };

  const guardarContrata = async () => {
    // Validaciones
    if (!formData.ruc.trim() || !formData.razonSocial.trim()) {
      return alert("El RUC y la Razón Social son campos obligatorios.");
    }

    try {
      if (modoEdicion) {
        await api.put(`/contratas/${formData.id}`, formData);
        alert("Empresa actualizada correctamente");
      } else {
        await api.post('/contratas', formData);
        alert("Empresa registrada correctamente");
      }
      setShowModal(false);
      fetchData(); // Refrescar la tabla
    } catch (error) {
      console.error("Error al guardar:", error);
      const mensaje = error.response?.data?.message || "Error al procesar la solicitud";
      alert(mensaje);
    }
  };

  const cambiarEstadoContrata = async (id, estadoActual) => {
    if(!window.confirm(`¿Seguro que deseas ${estadoActual ? 'INHABILITAR' : 'HABILITAR'} a esta empresa?`)) return;
    
    try {
      await api.patch(`/contratas/${id}/estado`, { estado: estadoActual });
      fetchData(); 
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("Error al intentar cambiar el estado de la empresa.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#17254C] flex items-center gap-2">
            <Building2 size={28} className="text-[#F39200]"/> Gestión de Contratas
          </h1>
          <p className="text-gray-500 text-sm mt-1">Administra las empresas proveedoras y contratistas</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por RUC o Razón Social..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#F39200] outline-none transition-colors"
            />
          </div>
          <button 
            onClick={abrirModalNuevo}
            className="flex items-center gap-2 bg-[#17254C] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#1a2b5c] transition-colors"
          >
            <Plus size={18} /> Nueva
          </button>
        </div>
      </div>

      {/* TABLA DE CONTRATAS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Cargando datos de las empresas...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4">Empresa (Razón Social)</th>
                  <th className="p-4">RUC</th>
                  <th className="p-4">Información de Contacto</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contratasFiltradas.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#17254C]">{c.razonSocial}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs">
                        {c.ruc}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {c.contacto ? (
                          <span className="flex items-center gap-1.5 text-gray-600 text-xs">
                            <UserIcon size={14} className="text-gray-400"/> {c.contacto}
                          </span>
                        ) : <span className="text-gray-400 text-xs italic">Sin contacto registrado</span>}
                        
                        {c.telefono && (
                          <span className="flex items-center gap-1.5 text-blue-600 font-medium text-xs">
                            <Phone size={14}/> {c.telefono}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                        c.estado ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {c.estado ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => abrirModalEditar(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => cambiarEstadoContrata(c.id, c.estado)} className={`p-1.5 rounded-lg transition-colors ${c.estado ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title={c.estado ? 'Inhabilitar' : 'Habilitar'}>
                          {c.estado ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {contratasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-400">No se encontraron empresas contratistas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#17254C]">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Building2 size={20} className="text-[#F39200]" /> 
                {modoEdicion ? 'Editar Empresa' : 'Nueva Empresa'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">RUC *</label>
                  <input 
                    name="ruc" 
                    value={formData.ruc} 
                    onChange={handleInputChange} 
                    maxLength={11}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200] font-mono" 
                    placeholder="Ej: 20123456789" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Razón Social *</label>
                  <input 
                    name="razonSocial" 
                    value={formData.razonSocial} 
                    onChange={handleInputChange} 
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" 
                    placeholder="Ej: Servicios Eléctricos Generales S.A.C." 
                  />
                </div>
                
                <div className="border-t pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-[#17254C] uppercase mb-1">Información de Contacto</label>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Nombre del Contacto</label>
                    <input 
                      name="contacto" 
                      value={formData.contacto} 
                      onChange={handleInputChange} 
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" 
                      placeholder="Ej: Arturo Méndez" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Teléfono / Celular</label>
                    <input 
                      name="telefono" 
                      value={formData.telefono} 
                      onChange={handleInputChange} 
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" 
                      placeholder="Ej: 987654321" 
                    />
                  </div>
                  {/* NUEVOS CAMPOS */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Correo Electrónico</label>
                    <input 
                      name="correo" 
                      type="email"
                      value={formData.correo || ''} 
                      onChange={handleInputChange} 
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" 
                      placeholder="Ej: contacto@empresa.com" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Dirección</label>
                    <input 
                      name="direccion" 
                      value={formData.direccion || ''} 
                      onChange={handleInputChange} 
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" 
                      placeholder="Ej: Av. Principal 123, Lima" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
              <button onClick={guardarContrata} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#F39200] text-white hover:bg-orange-600 shadow-sm transition-colors">
                {modoEdicion ? 'Actualizar Empresa' : 'Registrar Empresa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}