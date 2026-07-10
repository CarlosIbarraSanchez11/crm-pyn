import {
Search,
Eye,
Edit,
ShieldCheck,
Users,
AlertTriangle,
FileCheck
} from "lucide-react";

import { useState } from "react";
import empleadosData from "../../../../data/empleados";
import ssomaData from "../../../../data/ssoma";
const COLORS={
navy:"rgb(23 37 76)",
orange:"rgb(243 146 0)"
};


export default function SSOMA(){
const [trabajadores] = useState(()=>{


return ssomaData.map(item=>{


const empleado = empleadosData.find(
e=>e.id===item.empleadoId
);


return {


id:item.id,

dni:empleado.dni,

apellidos:empleado.apellidos,

nombres:empleado.nombres,

cargo:empleado.cargo,

departamento:empleado.departamento,

empresa:empleado.empresa,

estado:empleado.estado,


emoInicio:item.emoInicio,
emoFin:item.emoFin,

alturaInicio:item.alturaInicio,
alturaFin:item.alturaFin,

sstInicio:item.sstInicio,
sstFin:item.sstFin,

patrimonialInicio:item.patrimonialInicio,
patrimonialFin:item.patrimonialFin


};


});


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
valor={trabajadores.filter(t=>t.estado==="Activo").length}
/>


<Card
icon={<AlertTriangle/>}
titulo="EMO por vencer"
valor="0"
/>


<Card
icon={<FileCheck/>}
titulo="Carnet SST"
valor="0"
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

className="
bg-transparent
outline-none
w-full
p-3
text-sm
"

placeholder="
Buscar trabajador por nombre, apellido o DNI...
"

/>

</div>




<select className="
border
rounded-xl
px-4
py-3
text-sm
outline-none
">

<option>
Todos los cargos
</option>

</select>



<select className="
border
rounded-xl
px-4
py-3
text-sm
outline-none
">

<option>
Todas las empresas
</option>

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
trabajadores.map(item=>(


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
className="
h-9
w-9
rounded-lg
bg-blue-50
text-blue-600
flex
items-center
justify-center
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