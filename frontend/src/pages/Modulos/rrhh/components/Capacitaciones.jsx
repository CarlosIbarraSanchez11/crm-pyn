import { Search, Plus, Eye, Edit, Trash2,GraduationCap, Users, CheckCircle, Clock } from "lucide-react";
import { useState,useEffect } from "react";
import api from "../../../../api/axios";
import ModalNuevoCapacitacion from "./Modal/ModalNuevoCapacitacion";
import capacitacionesData from "../../../../data/capacitaciones";
import empleadosData from "../../../../data/empleados";
const COLORS = { navy:"rgb(23 37 76)", orange:"rgb(243 146 0)" };

export default function Capacitaciones(){

const [modal,setModal]=useState(false);
const [busqueda, setBusqueda] = useState("");
const [estado, setEstado] = useState("");
const [modalDocumento,setModalDocumento]=useState(false);
const [documento,setDocumento]=useState("");
const [empleados,setEmpleados]=useState([]);
const [capacitaciones,setCapacitaciones]=useState([]);
const obtenerEmpleados=async()=>{
const res=
await api.get("/rrhh/empleados");
setEmpleados(res.data);

};
const obtenerCapacitaciones=async()=>{
const res=
await api.get("/rrhh/capacitaciones");
setCapacitaciones(res.data);
};
const capacitacionesFiltradas = capacitaciones.filter(cap => {

  const coincideBusqueda =

    cap.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||

    cap.empleados.some(rel =>
      `${rel.empleado.nombres} ${rel.empleado.apellidos}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
      );

  const coincideEstado =
    estado === "" ||
    cap.estado === estado;

  return (
    coincideBusqueda &&
    coincideEstado
  );

});

useEffect(()=>{
obtenerEmpleados();
obtenerCapacitaciones();
},[]);
const guardarCapacitacion = async (formData) => {

    const data = new FormData();

    data.append("nombre", formData.nombre);
    data.append("fecha", formData.fecha);
    data.append("hora", formData.hora);
    data.append("duracion", formData.duracion);
    data.append("institucion", formData.institucion);
    data.append("estado", formData.estado);
    data.append("descripcion", formData.descripcion);

    formData.empleados.forEach(id => {
        data.append("empleados", id);
    });

    if (formData.evidencia) {
        data.append("evidencia", formData.evidencia);
    }

    await api.post(
        "/rrhh/capacitaciones",
        data
    );

    // Volver a cargar la tabla
    await obtenerCapacitaciones();

    // Cerrar modal
    setModal(false);
};
return(
<div className="p-6 bg-slate-50 min-h-screen">


<div className="flex justify-between items-start mb-8">

<div>
<h1 className="text-3xl font-bold" style={{color:COLORS.navy}}>
Capacitaciones
</h1>

<p className="text-slate-500 mt-1">
Gestión de capacitaciones y desarrollo profesional
</p>

</div>


<button
onClick={()=>setModal(true)}
className="flex items-center gap-2 text-white px-5 py-3 rounded-xl shadow-lg hover:scale-105 transition"
style={{backgroundColor:COLORS.orange}}
>
<Plus size={20}/>
Nueva capacitación
</button>


</div>


<div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">


<Card icon={<GraduationCap/>} titulo="Total capacitaciones" valor={capacitaciones.length}/>

<Card
icon={<Users/>}
titulo="Participantes"
valor={
capacitaciones.reduce(
(total,cap)=>total + cap.empleados.length,
0
)
}
/>
<Card icon={<CheckCircle/>} titulo="Completadas" valor={capacitaciones.filter(c=>c.estado==="Completada").length}/>

<Card icon={<Clock/>} titulo="Programadas" valor="0"/>


</div>

<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">


<div className="flex flex-col md:flex-row gap-4">


<div className="flex items-center border rounded-xl px-4 flex-1 bg-slate-50">

<Search size={18} className="text-slate-400"/>
<input
  value={busqueda}
  onChange={(e)=>setBusqueda(e.target.value)}
  className="bg-transparent outline-none w-full p-3 text-sm"
  placeholder="Buscar por capacitación o empleado..."
/>
</div>

<select
  value={estado}
  onChange={(e)=>setEstado(e.target.value)}
  className="border rounded-xl px-4 py-3 text-sm outline-none"
>
  <option value="">Todos los estados</option>

  {[...new Set(capacitaciones.map(c => c.estado))].map(est => (
    <option
      key={est}
      value={est}
    >
      {est}
    </option>
  ))}
</select>

</div>

</div>

<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

<div className="overflow-x-auto">

<table className="min-w-[1200px]
w-full">


<thead>

<tr style={{backgroundColor:COLORS.navy}}>

<th className="p-4 text-left text-white text-sm">
Capacitación
</th>

<th className="p-4 text-left text-white text-sm">
Participantes
</th>

<th className="p-4 text-left text-white text-sm">
Fecha
</th>

<th className="p-4 text-left text-white text-sm">
Duración
</th>

<th className="p-4 text-left text-white text-sm">
Institución
</th>

<th className="p-4 text-left text-white text-sm">
Estado
</th>

<th className="p-4 text-center text-white text-sm">
Acciones
</th>

</tr>

</thead>
<tbody>

{
capacitacionesFiltradas.map(cap => (

<tr
key={cap.id}
className="border-b hover:bg-slate-50 transition"
>


<td className="p-4">

<div className="flex items-center gap-3">

<div
className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
style={{backgroundColor:COLORS.navy}}
>
<GraduationCap size={20}/>
</div>


<div>

<p className="font-semibold text-slate-800">
{cap.nombre}
</p>

<p className="text-xs text-slate-500">
{cap.institucion}
</p>

</div>

</div>

</td>

<td className="p-4">
{
cap.empleados.map(rel=>(
<p
key={rel.empleado.id}
className="text-sm text-slate-700"
>
{rel.empleado.nombres} {rel.empleado.apellidos}
</p>
))
}

</td>
<td className="p-4">
<p className="text-sm font-medium">
{
new Date(cap.fecha).toLocaleDateString("es-PE",{
day:"2-digit",
month:"2-digit",
year:"numeric"
})
}
</p>
<p className="text-xs text-slate-400">
{cap.hora}
</p>

</td>

<td className="p-4">

<span className="text-sm text-slate-700">
{cap.duracion} hrs
</span>

</td>

<td className="p-4 text-sm">

{cap.institucion}

</td>

<td className="p-4">
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">

{cap.estado}

</span>

</td>

<td className="p-4">
  <div className="flex justify-center gap-3">
     <button
            onClick={()=>{
                setDocumento(cap.evidencia);
                setModalDocumento(true);
            }}
            className="
                h-9
                w-9
                rounded-lg
                bg-blue-50
                text-blue-600
                flex
                items-center
                justify-center
                hover:bg-blue-100
            "
        >
            <Eye size={17}/>
        </button>
    <button
      className="
      h-9
      w-9
      rounded-lg
      bg-orange-50
      text-orange-600
      flex
      items-center
      justify-center
      hover:bg-orange-100
      transition
      "
    >
      <Edit size={17}/>
    </button>

    <button
      className="
      h-9
      w-9
      rounded-lg
      bg-red-50
      text-red-600
      flex
      items-center
      justify-center
      hover:bg-red-100
      transition
      "
    >
      <Trash2 size={17}/>
    </button>

  </div>
</td>



</tr>


))

}


</tbody>


</table>

</div>

</div>
{
modal &&
<ModalNuevoCapacitacion
cerrar={()=>setModal(false)}
empleados={empleados}
onGuardar={guardarCapacitacion}
/>

}
{
modalDocumento && (

<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col">

        <div className="flex items-center justify-between border-b px-6 py-4">

            <h2 className="text-lg font-semibold text-slate-800">
                Evidencia de capacitación
            </h2>

            <button
                onClick={()=>{
                    setModalDocumento(false);
                    setDocumento("");
                }}
                className="rounded-lg p-2 hover:bg-slate-100"
            >
                ✕
            </button>

        </div>

        <div className="flex-1 bg-slate-100">

            {
            documento ? (

                documento.toLowerCase().endsWith(".pdf")

                ?

                <iframe
                    src={`http://localhost:3000/${documento}`}
                    title="Documento"
                    className="w-full h-full"
                />

                :

                <img
                    src={`http://localhost:3000/${documento}`}
                    alt="Evidencia"
                    className="w-full h-full object-contain"
                />

            )

            :

            <div className="flex h-full items-center justify-center text-slate-500">
                No existe evidencia.
            </div>

            }

        </div>

    </div>

</div>

)
}
</div>

)

}



function Card({icon,titulo,valor}){

return(

<div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">


<div className="h-12 w-12 rounded-xl flex items-center justify-center bg-slate-100 text-[rgb(23_37_76)]">

{icon}

</div>


<div>

<p className="text-sm text-slate-500">
{titulo}
</p>

<h3 className="text-2xl font-bold text-slate-800">
{valor}
</h3>

</div>


</div>

)

}
