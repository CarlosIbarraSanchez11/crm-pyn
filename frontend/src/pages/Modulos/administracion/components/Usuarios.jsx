import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Edit, Trash2, Shield, MapPin, Building, CheckCircle2, XCircle
} from 'lucide-react';
import api from '../../../../api/axios'; // Importación activada

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [contratas, setContratas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Estados del Modal
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  const estadoInicialForm = {
    id: null,
    nombre: '',
    correo: '',
    password: '',
    rol: '',
    modulo: '',
    sedeId: '',
    contrataId: '',
    estado: true
  };
  const [formData, setFormData] = useState(estadoInicialForm);

  // Conexión real al Backend
  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Cargamos Usuarios y Sedes en paralelo
      const [resUsuarios, resSedes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/ubicaciones/sedes')
      ]);
      
      setUsuarios(resUsuarios.data);
      setSedes(resSedes.data);

      // 2. Cargamos Contratas (Con try/catch separado por si aún no existe la ruta en tu backend)
      try {
        const resContratas = await api.get('/contratas'); 
        setContratas(resContratas.data || []);
      } catch (errorContratas) {
        console.warn("Ruta /contratas aún no disponible en el backend");
        setContratas([]);
      }

    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error de conexión al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrado de búsqueda
  const usuariosFiltrados = usuarios.filter(u => 
    (u.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (u.correo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (u.rol || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirModalNuevo = () => {
    setFormData(estadoInicialForm);
    setModoEdicion(false);
    setShowModal(true);
  };

  const abrirModalEditar = (user) => {
    setFormData({
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      password: '', // Dejar en blanco, solo se envía si se escribe algo nuevo
      rol: user.rol,
      modulo: user.modulo,
      sedeId: user.sedeId || '',
      contrataId: user.contrataId || '',
      estado: user.estado
    });
    setModoEdicion(true);
    setShowModal(true);
  };

  const guardarUsuario = async () => {
    // Validaciones del Frontend
    if (!formData.nombre.trim() || !formData.correo.trim() || !formData.modulo || !formData.rol) {
      return alert("Por favor, completa todos los campos obligatorios marcados con (*)");
    }
    if (formData.rol === 'ST' && !formData.sedeId) {
      return alert("El perfil ST (Supervisor de Tienda) requiere obligatoriamente una Sede.");
    }
    if (formData.rol === 'JC' && !formData.contrataId) {
      return alert("El perfil JC (Jefe de Contrata) requiere obligatoriamente una Empresa/Contrata.");
    }

    try {
      if (modoEdicion) {
        // Petición PUT para actualizar
        await api.put(`/usuarios/${formData.id}`, formData);
        alert("Usuario actualizado correctamente");
      } else {
        // Petición POST para crear
        if (!formData.password) return alert("La contraseña es obligatoria para usuarios nuevos.");
        await api.post('/usuarios', formData);
        alert("Usuario creado correctamente");
      }
      setShowModal(false);
      fetchData(); // Refrescar la tabla
    } catch (error) {
      console.error("Error al guardar:", error);
      const mensaje = error.response?.data?.message || "Error al procesar la solicitud";
      alert(mensaje);
    }
  };

  const cambiarEstadoUsuario = async (id, estadoActual) => {
    if(!window.confirm(`¿Seguro que deseas ${estadoActual ? 'INHABILITAR' : 'HABILITAR'} a este usuario?`)) return;
    
    try {
      // Petición PATCH para cambiar solo el estado booleano
      await api.patch(`/usuarios/${id}/estado`, { estado: estadoActual });
      fetchData(); // Refrescar la tabla inmediatamente
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("Error al intentar cambiar el estado del usuario");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#17254C] flex items-center gap-2">
            <Users size={28} className="text-[#F39200]"/> Gestión de Usuarios
          </h1>
          <p className="text-gray-500 text-sm mt-1">Administra los accesos y perfiles del sistema</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar usuario..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#F39200] outline-none"
            />
          </div>
          <button 
            onClick={abrirModalNuevo}
            className="flex items-center gap-2 bg-[#17254C] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#1a2b5c] transition-colors"
          >
            <Plus size={18} /> Nuevo
          </button>
        </div>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Cargando usuarios desde la base de datos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Rol / Módulo</th>
                  <th className="p-4">Asignación</th>
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#17254C]">{u.nombre}</p>
                      <p className="text-xs text-gray-500">{u.correo}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-gray-700">
                        <Shield size={14} className="text-[#F39200]"/> {u.rol}
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase mt-0.5">{u.modulo}</p>
                    </td>
                    <td className="p-4 text-xs font-semibold text-gray-600">
                      {u.rol === 'ST' && u.sede ? (
                        <span className="flex items-center gap-1 text-blue-600"><MapPin size={14}/> {u.sede.nombre}</span>
                      ) : u.rol === 'JC' && u.contrata ? (
                        <span className="flex items-center gap-1 text-purple-600"><Building size={14}/> {u.contrata.razonSocial}</span>
                      ) : (
                        <span className="text-gray-400 italic">Acceso Global</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                        u.estado ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {u.estado ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => abrirModalEditar(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => cambiarEstadoUsuario(u.id, u.estado)} className={`p-1.5 rounded-lg transition-colors ${u.estado ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`} title={u.estado ? 'Inhabilitar' : 'Habilitar'}>
                          {u.estado ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-400">No se encontraron usuarios</td>
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
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#17254C]">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Users size={20} className="text-[#F39200]" /> 
                {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><XCircle size={24} /></button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Nombre Completo *</label>
                  <input name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" placeholder="Ej: Juan Perez" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Correo Electrónico *</label>
                  <input name="correo" type="email" value={formData.correo} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" placeholder="juan@correo.com" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">
                    Contraseña {modoEdicion && <span className="text-gray-400 font-normal">(Opcional)</span>}
                  </label>
                  <input name="password" type="password" value={formData.password} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]" placeholder={modoEdicion ? 'Solo si desea cambiarla' : '*****'} />
                </div>
                
                {/* CONFIGURACIÓN DE ACCESO */}
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <label className="block text-xs font-bold text-[#17254C] uppercase mb-3"><Shield size={14} className="inline mr-1"/> Configuración de Acceso</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Módulo Base *</label>
                      <select name="modulo" value={formData.modulo} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]">
                        <option value="">-- Seleccionar Módulo --</option>
                        <option value="ADMINISTRACION">Administración</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                        <option value="RRHH">Recursos Humanos</option>
                        <option value="PROYECTOS">Gestión de Proyectos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Rol *</label>
                      <select name="rol" value={formData.rol} onChange={(e) => {
                        setFormData({...formData, rol: e.target.value, sedeId: '', contrataId: ''})
                      }} className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#F39200]">
                        <option value="">-- Seleccionar Rol --</option>
                        <option value="ADMIN">Administrador General</option>
                        <option value="JM">Jefe de Mantenimiento (JM)</option>
                        <option value="JO">Jefe de Operaciones (JO)</option>
                        <option value="ST">Supervisor de Tienda (ST)</option>
                        <option value="JC">Jefe de Contrata (JC)</option>
                        <option value="RRHH">Personal RRHH</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* LÓGICA CONDICIONAL: Solo mostrar Sede si el rol es ST */}
                {formData.rol === 'ST' && (
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2">
                    <label className="block text-[11px] font-bold text-blue-700 uppercase mb-1.5">Asignar Sede (Obligatorio para ST) *</label>
                    <select name="sedeId" value={formData.sedeId} onChange={handleInputChange} className="w-full p-2.5 border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500">
                      <option value="">-- Seleccione a qué sede reportará --</option>
                      {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                  </div>
                )}

                {/* LÓGICA CONDICIONAL: Solo mostrar Contrata si el rol es JC */}
                {formData.rol === 'JC' && (
                  <div className="md:col-span-2 bg-purple-50 p-4 rounded-xl border border-purple-100 mt-2">
                    <label className="block text-[11px] font-bold text-purple-700 uppercase mb-1.5">Asignar Contrata (Obligatorio para JC) *</label>
                    <select name="contrataId" value={formData.contrataId} onChange={handleInputChange} className="w-full p-2.5 border border-purple-200 rounded-lg text-sm outline-none focus:border-purple-500">
                      <option value="">-- Seleccione a qué empresa pertenece --</option>
                      {contratas.map(c => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
                    </select>
                  </div>
                )}

              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200">Cancelar</button>
              <button onClick={guardarUsuario} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#F39200] text-white hover:bg-orange-600 shadow-sm">
                {modoEdicion ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}