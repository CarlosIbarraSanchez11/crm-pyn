import { Search, Plus, Edit, Eye, Users, Trash2,UserCheck, UserX, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../../../api/axios";
import empleadosData from "../../../../data/empleados";
import ModalNuevoEmpleado from "./Modal/ModalNuevoEmpleado";

const COLORS = { navy:"rgb(23 37 76)", orange:"rgb(243 146 0)" };

export default function Personal(){

const [modal,setModal]=useState(false);
const [empleados,setEmpleados]=useState([]);
const [busqueda, setBusqueda] = useState("");
const [cargo, setCargo] = useState("");
const [empresa, setEmpresa] = useState("");
const empleadosFiltrados = empleados.filter(emp => {

  const coincideBusqueda =
    `${emp.nombres} ${emp.apellidos}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()) ||
    emp.dni.includes(busqueda);

  const coincideCargo =
    cargo === "" || emp.cargo === cargo;

  const coincideEmpresa =
    empresa === "" || emp.empresa === empresa;

  return (
    coincideBusqueda &&
    coincideCargo &&
    coincideEmpresa
  );

});
const obtenerEmpleados = async()=>{

 const res = await api.get("/rrhh/empleados");

 setEmpleados(res.data);

};
useEffect(()=>{
  obtenerEmpleados();
  
},[]);
const guardarEmpleado = async(datos)=>{


const formData = new FormData();


Object.keys(datos).forEach(key=>{

    if(key !== "fotoPerfil"){

        formData.append(
            key,
            datos[key]
        );

    }

});


// imagen
if(datos.fotoPerfil){

    formData.append(
        "fotoPerfil",
        datos.fotoPerfil
    );

}


// VERIFICAR
console.log("FORMDATA QUE ENVIO:");

for (let dato of formData.entries()) {
    console.log(dato[0], dato[1]);
}


const res = await api.post(
"/rrhh/empleados",
formData,
{
headers:{
"Content-Type":"multipart/form-data"
}
}
);
console.log(res.data);
// actualizar tabla
obtenerEmpleados();
setModal(false);
};
return(
<div className="p-6 bg-slate-50 min-h-screen">

<div className="flex justify-between items-start mb-8">
<div>
<h1 className="text-3xl font-bold" style={{color:COLORS.navy}}>Personal</h1>
<p className="text-slate-500 mt-1">Gestión completa de empleados, colaboradores y accesos</p>
</div>

<button onClick={()=>setModal(true)} className="flex items-center gap-2 text-white px-5 py-3 rounded-xl shadow-lg hover:scale-105 transition" style={{backgroundColor:COLORS.orange}}>
<Plus size={20}/>Nuevo empleado
</button>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

<Card 
 icon={<Users/>} 
 titulo="Total empleados" 
 valor={empleados.length}
/>

<Card 
 icon={<UserCheck/>} 
 titulo="Activos" 
 valor={
   empleados.filter(
     e=>e.estado==="Activo"
   ).length
 }
/>

<Card 
 icon={<UserX/>} 
 titulo="Inactivos" 
 valor={
   empleados.filter(
     e=>e.estado==="Inactivo"
   ).length
 }
/>

<Card 
 icon={<Building2/>} 
 titulo="Empresas" 
 valor={
   [...new Set(
     empleados.map(e=>e.empresa)
   )].filter(Boolean).length
 }
/>

</div>


<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">

<div className="flex flex-col md:flex-row gap-4">

<div className="flex items-center border rounded-xl px-4 flex-1 bg-slate-50">
<Search size={18} className="text-slate-400"/>
<input
  value={busqueda}
  onChange={(e) => setBusqueda(e.target.value)}
  className="bg-transparent outline-none w-full p-3 text-sm"
  placeholder="Buscar empleado por nombre, apellido o DNI..."
/></div>

<select
  value={cargo}
  onChange={(e) => setCargo(e.target.value)}
  className="border rounded-xl px-4 py-3 text-sm outline-none"
>
  <option value="">Todos los cargos</option>

{[...new Set(empleados.map(e => e.cargo))]
.filter(Boolean)
.map(c => (
      <option key={c} value={c}>
      {c}
    </option>
  ))}
</select>

<select
  value={empresa}
  onChange={(e) => setEmpresa(e.target.value)}
  className="border rounded-xl px-4 py-3 text-sm outline-none"
>
  <option value="">Todas las empresas</option>

{[...new Set(empleados.map(e => e.empresa))]
.filter(Boolean)
.map(emp => (
    <option key={emp} value={emp}>
      {emp}
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

<th className="p-4 text-left text-white text-sm">Empleado</th>
<th className="p-4 text-left text-white text-sm">DNI</th>
<th className="p-4 text-left text-white text-sm">Cargo</th>
<th className="p-4 text-left text-white text-sm">Empresa</th>
<th className="p-4 text-left text-white text-sm">Estado</th>
<th className="p-4 text-center text-white text-sm">Acciones</th>

</tr>
</thead>


<tbody>

{
  empleadosFiltrados.map(emp => (
<tr key={emp.id} className="border-b hover:bg-slate-50 transition">


<td className="p-4">

<div className="flex items-center gap-3">

<div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor:COLORS.navy}}>
{emp.nombres.charAt(0)}
</div>

<div>
<p className="font-semibold text-slate-800">{emp.nombres}</p>
<p className="text-xs text-slate-500">{emp.apellidos}</p>
</div>

</div>

</td>


<td className="p-4 text-sm">{emp.dni}</td>


<td className="p-4">
<p className="font-medium text-slate-700">{emp.cargo}</p>
<p className="text-xs text-slate-400">{emp.departamento}</p>
</td>


<td className="p-4">{emp.empresa}</td>


<td className="p-4">
<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
{emp.estado}
</span>
</td>

<td className="p-4">
  <div className="flex justify-center gap-3">

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
{modal && (
  <ModalNuevoEmpleado
    cerrar={()=>setModal(false)}
    onGuardar={guardarEmpleado}
  />
)}
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
<p className="text-sm text-slate-500">{titulo}</p>
<h3 className="text-2xl font-bold text-slate-800">{valor}</h3>
</div>

</div>
)

}