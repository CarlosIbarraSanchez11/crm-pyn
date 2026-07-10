import { Search, Plus, Edit, Eye, Users, UserCheck, UserX, Building2 } from "lucide-react";
import { useState } from "react";
import empleadosData from "../../../../data/empleados";
import ModalNuevoEmpleado from "./Modal/ModalNuevoEmpleado";

const COLORS = { navy:"rgb(23 37 76)", orange:"rgb(243 146 0)" };

export default function Personal(){

const [modal,setModal]=useState(false);

const [empleados]=useState(empleadosData);

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

<Card icon={<Users/>} titulo="Total empleados" valor={empleados.length}/>
<Card icon={<UserCheck/>} titulo="Activos" valor={empleados.filter(e=>e.estado==="Activo").length}/>
<Card icon={<UserX/>} titulo="Inactivos" valor="0"/>
<Card icon={<Building2/>} titulo="Empresas" valor="1"/>

</div>


<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">

<div className="flex flex-col md:flex-row gap-4">

<div className="flex items-center border rounded-xl px-4 flex-1 bg-slate-50">
<Search size={18} className="text-slate-400"/>
<input className="bg-transparent outline-none w-full p-3 text-sm" placeholder="Buscar empleado por nombre, apellido o DNI..."/>
</div>

<select className="border rounded-xl px-4 py-3 text-sm outline-none">
<option>Todos los cargos</option>
<option>Asistente Administrativa</option>
</select>

<select className="border rounded-xl px-4 py-3 text-sm outline-none">
<option>Todas las empresas</option>
<option>F85</option>
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
empleados.map(emp=>(

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


<td className="p-4 flex justify-center gap-3">

<button className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100">
<Eye size={17}/>
</button>

<button className="h-9 w-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100">
<Edit size={17}/>
</button>

</td>


</tr>

))
}

</tbody>

</table>

</div>
</div>

{modal && <ModalNuevoEmpleado cerrar={()=>setModal(false)}/>}

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