import {
  X,
  GraduationCap,
  Users,
  CalendarDays,
  Clock,
  Building2,
   UploadCloud,
  FileText,
  Paperclip,
  Check,
  LoaderCircle,
  AlertCircle
} from "lucide-react";

import { useEffect, useState } from "react";


const COLORS = {
  navy:"rgb(23 37 76)",
  navySoft:"rgb(23 37 76 / 0.06)",
  orange:"rgb(243 146 0)"
};


const ESTADOS=[
"Programada",
"En curso",
"Finalizada",
"Cancelada"
];


const FORM_INICIAL={
empleados:[],
nombre:"",
fecha:"",
hora:"",
duracion:"",
institucion:"",
estado:"Programada",
descripcion:"",
};

function Campo({label,required,children}){

return(
<div>

<label className="block mb-1.5 text-sm font-medium text-slate-700">
{label}
{required && <span className="ml-1 text-[rgb(243_146_0)]">*</span>}
</label>

{children}

</div>
)

}



const inputBase=
"w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[rgb(23_37_76)] focus:ring-2 focus:ring-slate-200";



export default function ModalNuevaCapacitacion({
cerrar,
onGuardar,
empleados
}){

const [form,setForm]=useState(FORM_INICIAL);
const [busqueda,setBusqueda]=useState("");
const [guardando,setGuardando]=useState(false);

useEffect(()=>{

const tecla=(e)=>{
if(e.key==="Escape") cerrar?.();
};

window.addEventListener("keydown",tecla);

return()=>window.removeEventListener("keydown",tecla);

},[cerrar]);



const cambiar=(campo,valor)=>{

setForm(prev=>({
...prev,
[campo]:valor
}));

};

const seleccionarEmpleado = (id) => {
  id = Number(id);

  setForm((prev) => {
    const nuevos = prev.empleados.includes(id)
      ? prev.empleados.filter((e) => e !== id)
      : [...prev.empleados, id];

    console.log(nuevos);

    return {
      ...prev,
      empleados: nuevos,
    };
  });
};
const seleccionarTodos=()=>{

if(!empleados) return;

setForm(prev=>({

...prev,

empleados:
prev.empleados.length === empleados.length
?
[]
:
empleados.map(e=>e.id)

}));

};
const guardar = async () => {

    if (form.empleados.length === 0) {
        alert("Seleccione al menos un empleado");
        return;
    }

    if (!form.nombre.trim()) {
        alert("Ingrese el nombre");
        return;
    }

    try {

        setGuardando(true);

        const formData = new FormData();

        formData.append("nombre", form.nombre);
        formData.append("fecha", form.fecha);
        formData.append("hora", form.hora);
        formData.append("duracion", form.duracion);
        formData.append("institucion", form.institucion);
        formData.append("estado", form.estado);
        formData.append("descripcion", form.descripcion);

        form.empleados.forEach((id) => {
            formData.append("empleados", id);
        });

        await onGuardar(formData);

        cerrar();

    } catch (error) {

        console.log(error);

    } finally {

        setGuardando(false);

    }

};
const empleadosFiltrados = empleados.filter(e=>
`${e.nombres} ${e.apellidos} ${e.dni}`
.toLowerCase()
.includes(busqueda.toLowerCase())
);

return(

<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">


<div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">


{/* HEADER */}

<div
className="flex items-center justify-between px-6 py-4"
style={{backgroundColor:COLORS.navy}}
>

<div>

<h2 className="text-lg font-semibold text-white">
Nueva Capacitación
</h2>

<p className="text-xs text-slate-300">
Programa formación para colaboradores
</p>

</div>


<button
onClick={cerrar}
className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
>
<X size={20}/>
</button>


</div>





<div className="overflow-y-auto px-6 py-6">



{/* PARTICIPANTES */}

<div className="mb-6">


<div className="mb-4 flex items-center gap-3">

<div
className="flex h-9 w-9 items-center justify-center rounded-lg"
style={{
backgroundColor:COLORS.navySoft,
color:COLORS.navy
}}
>
<Users size={18}/>
</div>


<div>

<h3 className="text-sm font-semibold text-slate-800">
Empleados ({form.empleados.length} seleccionados)
</h3>

<p className="text-xs text-slate-500">
Seleccione los participantes de la capacitación
</p>

</div>

</div>



<div className="flex gap-3 mb-4">

<button
onClick={seleccionarTodos}
className="rounded-lg px-4 py-2 text-sm text-white"
style={{backgroundColor:COLORS.navy}}
>

Seleccionar todos

</button>

<button
onClick={()=>setForm(prev=>({...prev,empleados:[]}))}
className="rounded-lg border px-4 py-2 text-sm"
>
Limpiar
</button>

</div>

<div className="mb-3 flex items-center rounded-xl border bg-slate-50 px-4">

<input
className="w-full bg-transparent p-3 text-sm outline-none"
placeholder="Buscar empleado por nombre o DNI..."
value={busqueda}
onChange={e=>setBusqueda(e.target.value)}
/>

</div>




<div className="grid max-h-64 gap-2 overflow-y-auto">


{
empleadosFiltrados.map(emp=>(
<div
    key={emp.id}
    className="flex items-center gap-3 rounded-xl border p-3 hover:bg-slate-50"
>
    <input
        type="checkbox"
        checked={form.empleados.includes(emp.id)}
        onChange={() => seleccionarEmpleado(emp.id)}
    />

    <div
        className="flex-1 cursor-pointer"
        onClick={() => seleccionarEmpleado(emp.id)}
    >
        <p className="text-sm font-medium text-slate-800">
            {emp.nombres} {emp.apellidos}
        </p>

        <p className="text-xs text-slate-500">
            {emp.dni}
        </p>
    </div>
</div>

))
}


</div>


</div>





{/* DATOS CAPACITACION */}

<div className="border-t pt-6">


<div className="mb-5 flex items-center gap-3">

<div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{backgroundColor:COLORS.navySoft,color:COLORS.navy}}>
<GraduationCap size={18}/>
</div>

<div>
<h3 className="text-sm font-semibold text-slate-800">
Información de capacitación
</h3>

<p className="text-xs text-slate-500">
Datos del evento formativo
</p>

</div>

</div>




<div className="grid grid-cols-1 gap-4 md:grid-cols-2">


<Campo label="Nombre de la Capacitación" required>

<input
className={inputBase}
placeholder="Ej: Seguridad Industrial, Excel Avanzado..."
value={form.nombre}
onChange={e=>cambiar("nombre",e.target.value)}
/>

</Campo>



<Campo label="Fecha de Capacitación" required>

<input
type="date"
className={inputBase}
value={form.fecha}
onChange={e=>cambiar("fecha",e.target.value)}
/>

</Campo>



<Campo label="Hora de Capacitación" required>

<input
type="time"
className={inputBase}
value={form.hora}
onChange={e=>cambiar("hora",e.target.value)}
/>

</Campo>



<Campo label="Duración (horas)">

<input
type="number"
className={inputBase}
placeholder="0"
value={form.duracion}
onChange={e=>cambiar("duracion",e.target.value)}
/>

</Campo>



<Campo label="Institución">

<input
className={inputBase}
placeholder="Nombre de la institución"
value={form.institucion}
onChange={e=>cambiar("institucion",e.target.value)}
/>

</Campo>



<Campo label="Estado">

<select
className={inputBase}
value={form.estado}
onChange={e=>cambiar("estado",e.target.value)}
>

{
ESTADOS.map(e=>
<option key={e}>{e}</option>
)
}

</select>


</Campo>


</div>



<div className="mt-4">

<Campo label="Descripción">

<textarea
rows="3"
className={inputBase}
placeholder="Detalles de la capacitación..."
value={form.descripcion}
onChange={e=>cambiar("descripcion",e.target.value)}
/>

</Campo>


</div>


</div>


</div>

<div className="flex justify-end gap-3 border-t px-6 py-4">
<button
onClick={cerrar}
className="rounded-lg border px-4 py-2 text-sm"
>
Cancelar
</button>


<button
onClick={guardar}
disabled={guardando}
className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm text-white"
style={{backgroundColor:COLORS.orange}}
>

{
guardando &&
<LoaderCircle size={16} className="animate-spin"/>
}

{
guardando
?"Guardando..."
:"Guardar capacitación"
}

</button>
</div>

</div>
</div>

)

}