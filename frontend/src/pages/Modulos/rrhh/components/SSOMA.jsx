import {
Search,
Eye,
Edit,
ShieldCheck,
Users,
AlertTriangle,
FileCheck
} from "lucide-react";

import { useState,useEffect } from "react";
import ModalSSOMA from "./Modal/ModalSSOMA";
import api from "../../../../api/axios";

const COLORS={
navy:"rgb(23 37 76)",
orange:"rgb(243 146 0)"
};


export default function SSOMA(){
  const [modal, setModal] = useState(false);
const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
const [trabajadores,setTrabajadores]=useState([]);


const obtenerSSOMA = async()=>{

const res = await api.get("/rrhh/ssoma");


const data = res.data.map(item=>({

id:item.id,
empleadoId:item.empleado.id,
dni:item.empleado.dni,

nombres:item.empleado.nombres,

apellidos:item.empleado.apellidos,

cargo:item.empleado.cargo,

departamento:item.empleado.departamento,

empresa:item.empleado.empresa,

estado:item.empleado.estado,


emoInicio:item.emoInicio?.substring(0,10) || "",
emoFin:item.emoFin?.substring(0,10) || "",

alturaInicio:item.alturaInicio?.substring(0,10) || "",
alturaFin:item.alturaFin?.substring(0,10) || "",

sstInicio:item.sstInicio?.substring(0,10) || "",
sstFin:item.sstFin?.substring(0,10) || "",

patrimonialInicio:item.patrimonialInicio?.substring(0,10) || "",
patrimonialFin:item.patrimonialFin?.substring(0,10) || "",


}));


setTrabajadores(data);


};


useEffect(()=>{

obtenerSSOMA();

},[]);

const [busqueda, setBusqueda] = useState("");
const [cargo, setCargo] = useState("");
const [empresa, setEmpresa] = useState("");
const trabajadoresFiltrados = trabajadores.filter(item => {

  const coincideBusqueda =
    `${item.nombres} ${item.apellidos}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()) ||
    item.dni.includes(busqueda);

  const coincideCargo =
    cargo === "" ||
    item.cargo === cargo;

  const coincideEmpresa =
    empresa === "" ||
    item.empresa === empresa;

  return (
    coincideBusqueda &&
    coincideCargo &&
    coincideEmpresa
  );

});
const trabajadoresActivos = trabajadores.filter(
    t=>t.estado==="Activo"
);


// EMO vence en los próximos 30 días
const emoPorVencer = trabajadores.filter(t=>{

    if(!t.emoFin) return false;


    const hoy = new Date();

    hoy.setHours(0,0,0,0);


    const fechaFin = new Date(t.emoFin);

    fechaFin.setHours(0,0,0,0);


    const diferencia =
    Math.ceil(
        (fechaFin - hoy) / (1000 * 60 * 60 * 24)
    );


    return diferencia >=0 && diferencia <=30;

});

// SST vencidos
const sstVencidos = trabajadores.filter(t=>{

    if(!t.sstFin) return false;


    const hoy = new Date();
    hoy.setHours(0,0,0,0);


    const fechaFin = new Date(t.sstFin);
    fechaFin.setHours(0,0,0,0);


    return fechaFin < hoy;

});


// SST pendientes (no tiene fecha de vencimiento)
const sstPendientes = trabajadores.filter(t=>{

    return !t.sstInicio || !t.sstFin;

});
return(

<div className="p-6 bg-slate-50 min-h-screen">

<div className="mb-8">

<h1
className="text-3xl font-bold"
style={{color:COLORS.navy}}
>
SSOMA
</h1>


<p className="text-slate-500 mt-1">
Seguridad, Salud Ocupacional y Medio Ambiente
</p>

</div>

<div className="
grid
grid-cols-1
md:grid-cols-4
gap-5
mb-8
">
<Card
icon={<Users/>}
titulo="Trabajadores"
valor={trabajadores.length}
/>


<Card
icon={<ShieldCheck/>}
titulo="Activos"
valor={trabajadoresActivos.length}
/>


<Card
icon={<AlertTriangle/>}
titulo="EMO por vencer"
valor={emoPorVencer.length}
/>


<Card
icon={<FileCheck/>}
titulo="SST vencido"
valor={sstVencidos.length}
/>
</div>

<div className="
bg-white
rounded-2xl
border
border-slate-200
shadow-sm
p-5
mb-6
">


<div className="
flex
flex-col
md:flex-row
gap-4
">


<div className="
flex
items-center
border
rounded-xl
px-4
flex-1
bg-slate-50
">

<Search
size={18}
className="text-slate-400"
/>

<input
  value={busqueda}
  onChange={(e)=>setBusqueda(e.target.value)}
  className="
  bg-transparent
  outline-none
  w-full
  p-3
  text-sm
  "
  placeholder="Buscar trabajador por nombre, apellido o DNI..."
/>

</div>

<select
  value={cargo}
  onChange={(e)=>setCargo(e.target.value)}
  className="
  border
  rounded-xl
  px-4
  py-3
  text-sm
  outline-none
  "
>

  <option value="">
    Todos los cargos
  </option>

  {[...new Set(trabajadores.map(t => t.cargo))].map(c => (
    <option
      key={c}
      value={c}
    >
      {c}
    </option>
  ))}

</select>

<select
  value={empresa}
  onChange={(e)=>setEmpresa(e.target.value)}
  className="
  border
  rounded-xl
  px-4
  py-3
  text-sm
  outline-none
  "
>

  <option value="">
    Todas las empresas
  </option>

  {[...new Set(trabajadores.map(t => t.empresa))].map(emp => (
    <option
      key={emp}
      value={emp}
    >
      {emp}
    </option>
  ))}

</select>
</div>


</div>


<div className="
bg-white
rounded-2xl
border
border-slate-200
shadow-sm
overflow-hidden
">

<div className="overflow-x-auto">
<table className="min-w-[1800px] w-full">
<thead>
<tr style={{backgroundColor:COLORS.navy}}>

{
[
"Trabajador",
"DNI",
"Cargo",
"Empresa",
"Estado",
"Inicio EMO",
"Fin EMO",
"Inicio Altura",
"Fin Altura",
"Inicio SST",
"Fin SST",
"Inicio Patrimonial",
"Fin Patrimonial",
"Acciones"
]
.map(t=>(

<th
key={t}
className="
p-4
text-left
text-white
text-sm
"
>

{t}

</th>

))
}

</tr>
</thead>

<tbody>

{
trabajadoresFiltrados.map(item => (

<tr
key={item.id}
className="
border-b
hover:bg-slate-50
transition
"
>


<td className="p-4">


<div className="flex items-center gap-3">


<div
className="
h-10
w-10
rounded-full
flex
items-center
justify-center
text-white
font-bold
"
style={{backgroundColor:COLORS.navy}}
>

{item.nombres.charAt(0)}

</div>

<div>

<p className="font-semibold text-slate-800">
{item.nombres}
</p>


<p className="text-xs text-slate-500">
{item.apellidos}
</p>


</div>


</div>

</td>


<td className="p-4 text-sm">
{item.dni}
</td>

<td className="p-4">

<p className="font-medium text-slate-700">
{item.cargo}
</p>

<p className="text-xs text-slate-400">
{item.departamento}
</p>

</td>

<td className="p-4">
{item.empresa}
</td>

<td className="p-4">

<span
className="
px-3
py-1
rounded-full
text-xs
font-semibold
bg-green-100
text-green-700
"
>

{item.estado}

</span>

</td>

<td className="p-4">{item.emoInicio}</td>
<td className="p-4">{item.emoFin}</td>

<td className="p-4">{item.alturaInicio}</td>
<td className="p-4">{item.alturaFin}</td>

<td className="p-4">{item.sstInicio}</td>
<td className="p-4">{item.sstFin}</td>

<td className="p-4">{item.patrimonialInicio}</td>
<td className="p-4">{item.patrimonialFin}</td>

<td className="p-4 flex gap-3">
<button
    onClick={()=>{
        setTrabajadorSeleccionado(item);
        setModal(true);
    }}
    className="
    h-9
    w-9
    rounded-lg
    bg-orange-50
    text-orange-600
    flex
    items-center
    justify-center
    "
>
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
{
modal &&

<ModalSSOMA
    trabajador={trabajadorSeleccionado}
    cerrar={()=>setModal(false)}
    actualizarTabla={obtenerSSOMA}
/>

}
</div>


)

}





function Card({icon,titulo,valor}){

return(

<div className="
bg-white
rounded-2xl
border
border-slate-200
p-5
shadow-sm
flex
items-center
gap-4
">


<div
className="
h-12
w-12
rounded-xl
flex
items-center
justify-center
bg-slate-100
text-[rgb(23_37_76)]
"
>

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