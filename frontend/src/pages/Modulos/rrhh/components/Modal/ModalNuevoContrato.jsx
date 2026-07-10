import { X, FileText, User, CalendarDays, DollarSign, Check, LoaderCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const COLORS = {
  navy: "rgb(23 37 76)",
  navySoft: "rgb(23 37 76 / 0.06)",
  orange: "rgb(243 146 0)"
};

const TIPOS_CONTRATO = ["Plazo Fijo", "Indeterminado", "Por Proyecto", "Prácticas"];
const ESTADOS = ["Activo", "Finalizado", "Suspendido"];

const FORM_INICIAL = {
  empleadoId: "",
  tipo: "Plazo Fijo",
  estado: "Activo",
  fechaInicio: "",
  fechaFin: "",
  salario: "",
  descripcion: ""
};

const inputBase = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[rgb(23_37_76)] focus:ring-2 focus:ring-slate-200";

function Campo({label, required, error, children}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{required && <span className="ml-1 text-[rgb(243_146_0)]">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 flex items-center gap-1 text-xs text-red-600"><AlertCircle size={12}/>{error}</p>}
    </div>
  );
}

function SectionHeading({icon:Icon,title,subtitle}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{backgroundColor:COLORS.navySoft,color:COLORS.navy}}>
        <Icon size={18}/>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default function ModalNuevoContrato({cerrar,onGuardar}) {

  const [form,setForm] = useState(FORM_INICIAL);
  const [errores,setErrores] = useState({});
  const [guardando,setGuardando] = useState(false);
  const [guardadoOk,setGuardadoOk] = useState(false);

  const empleados = [
    {id:1,nombre:"Zoraida Cunis Huaman",dni:"43986791"},
    {id:2,nombre:"Shiara Kasandra Jade Chinga Diaz",dni:"78017283"}
  ];

  useEffect(()=>{
    const tecla=(e)=>e.key==="Escape" && cerrar?.();
    window.addEventListener("keydown",tecla);
    return()=>window.removeEventListener("keydown",tecla);
  },[cerrar]);

  const cambiar=(campo,valor)=>{
    setForm(prev=>({...prev,[campo]:valor}));
    if(errores[campo]) setErrores(prev=>({...prev,[campo]:null}));
  };

  const validar=()=>{
    const err={};

    if(!form.empleadoId) err.empleadoId="Seleccione un empleado";
    if(!form.fechaInicio) err.fechaInicio="Ingrese fecha de inicio";

    if(form.tipo==="Plazo Fijo" && !form.fechaFin)
      err.fechaFin="Ingrese fecha de fin";

    setErrores(err);
    return Object.keys(err).length===0;
  };

  const guardar=async()=>{
    if(!validar()) return;

    try{
      setGuardando(true);

      await onGuardar?.(form);

      setGuardadoOk(true);

      setTimeout(()=>cerrar?.(),900);

    }catch(error){
      console.log(error);
    }finally{
      setGuardando(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">

      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between px-6 py-4" style={{backgroundColor:COLORS.navy}}>
          <div>
            <h2 className="text-lg font-semibold text-white">Nuevo Contrato</h2>
            <p className="text-xs text-slate-300">Registra la relación laboral del empleado</p>
          </div>

          <button onClick={cerrar} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white">
            <X size={20}/>
          </button>
        </div>


        <div className="overflow-y-auto px-6 py-6">

          <SectionHeading icon={FileText} title="Información del contrato" subtitle="Datos principales del vínculo laboral"/>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <Campo label="Empleado" required error={errores.empleadoId}>
              <select className={inputBase} value={form.empleadoId} onChange={e=>cambiar("empleadoId",e.target.value)}>
                <option value="">Seleccionar empleado</option>
                {empleados.map(emp=>
                  <option key={emp.id} value={emp.id}>{emp.nombre} - {emp.dni}</option>
                )}
              </select>
            </Campo>


            <Campo label="Tipo de Contrato" required>
              <select className={inputBase} value={form.tipo} onChange={e=>cambiar("tipo",e.target.value)}>
                {TIPOS_CONTRATO.map(tipo=><option key={tipo}>{tipo}</option>)}
              </select>
            </Campo>


            <Campo label="Estado">
              <select className={inputBase} value={form.estado} onChange={e=>cambiar("estado",e.target.value)}>
                {ESTADOS.map(e=><option key={e}>{e}</option>)}
              </select>
            </Campo>


            <Campo label="Fecha de Inicio" required error={errores.fechaInicio}>
              <input type="date" className={inputBase} value={form.fechaInicio} onChange={e=>cambiar("fechaInicio",e.target.value)}/>
            </Campo>


            <Campo label="Fecha de Fin" error={errores.fechaFin}>
              <input type="date" className={inputBase} value={form.fechaFin} onChange={e=>cambiar("fechaFin",e.target.value)}/>
            </Campo>


            <Campo label="Salario">
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-3 text-slate-400"/>
                <input type="number" className={`${inputBase} pl-9`} placeholder="0.00" value={form.salario} onChange={e=>cambiar("salario",e.target.value)}/>
              </div>
            </Campo>

          </div>


          <div className="mt-5">
            <Campo label="Descripción">
              <textarea rows="3" className={inputBase} placeholder="Detalle adicional del contrato..." value={form.descripcion} onChange={e=>cambiar("descripcion",e.target.value)}/>
            </Campo>
          </div>

        </div>


        <div className="flex justify-end gap-3 border-t px-6 py-4">

          <button onClick={cerrar} className="rounded-lg border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Cancelar
          </button>

          <button onClick={guardar} disabled={guardando} className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-60" style={{backgroundColor:guardadoOk?"rgb(21 128 61)":COLORS.orange}}>
            {guardando && <LoaderCircle size={16} className="animate-spin"/>}
            {guardadoOk ? <><Check size={16}/>Guardado</> : "Guardar contrato"}
          </button>

        </div>

      </div>

    </div>
  );
}