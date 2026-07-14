import {
  Users,
  FileText,
  GraduationCap,
  Cake
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../../../api/axios";


const COLORS = {
  navy:"rgb(23 37 76)",
  orange:"rgb(243 146 0)"
};


export default function InicioRRHH() {
  const [empleados,setEmpleados]=useState([]);
const [contratos,setContratos]=useState([]);
const [capacitaciones,setCapacitaciones]=useState([]);


const cargarDatos = async()=>{

try{


const empleadosRes =
await api.get("/rrhh/empleados");


const contratosRes =
await api.get("/rrhh/contratos");


const capacitacionesRes =
await api.get("/rrhh/capacitaciones");



setEmpleados(empleadosRes.data);

setContratos(contratosRes.data);

setCapacitaciones(capacitacionesRes.data);



}catch(error){

console.log(error);

}


};



useEffect(()=>{

cargarDatos();

},[]);
const resumen = empleados.map(emp=>{


const contrato = contratos.find(
c=>c.empleadoId===emp.id
);


const capacitacionesEmpleado = capacitaciones.filter(
c=>c.empleadoId===emp.id
);


return {

...emp,

inicioContrato:
contrato?.fechaInicio || "-",


finContrato:
contrato?.fechaFin || "-",


cap1:
capacitacionesEmpleado[0]?.fecha || "-",


cap2:
capacitacionesEmpleado[1]?.fecha || "-",


cap3:
capacitacionesEmpleado[2]?.fecha || "-"


};


});
const formatearFecha=(fecha)=>{

if(!fecha || fecha === "-"){
    return "-";
}


const fechaNueva = new Date(fecha);


if(isNaN(fechaNueva.getTime())){
    return "-";
}


return fechaNueva.toLocaleDateString("es-PE",{
    day:"2-digit",
    month:"2-digit",
    year:"numeric"
});

};
return (

<div className="p-6 bg-slate-50 min-h-screen">


<div className="mb-8">

<h1 
className="text-3xl font-bold"
style={{color:COLORS.navy}}
>
Resumen General
</h1>

<p className="text-slate-500 mt-1">
Vista consolidada de empleados, contratos y capacitaciones
</p>

</div>




{/* CARDS */}

<div className="
grid 
grid-cols-1
md:grid-cols-2
lg:grid-cols-4
gap-5
mb-8
">

<Card
icon={<Users/>}
titulo="Total Empleados"
valor={empleados.length}
detalle="Registrados en el sistema"
/>

<Card
icon={<FileText/>}
titulo="Contratos Activos"
valor={
contratos.length
}
detalle="En vigencia actualmente"
/>

<Card
icon={<GraduationCap/>}
titulo="Capacitaciones Próximas"
valor={
capacitaciones.length
}
detalle="Programadas próximamente"
/>

<Card
icon={<Cake/>}
titulo="Cumpleaños del Mes"
valor={
empleados.filter(emp=>{

const fecha =
new Date(emp.fechaNacimiento);


return fecha.getMonth()
===
new Date().getMonth();


}).length
}
detalle="Celebraciones este mes"
/>

</div>





{/* TABLA */}

<div className="
bg-white
rounded-2xl
shadow-sm
border
border-slate-200
overflow-hidden
">


<div className="p-5 border-b">

<h2 className="text-xl font-bold text-slate-800">
Tabla de Resumen
</h2>

<p className="text-sm text-slate-500">
Información general del personal
</p>

</div>




<div className="overflow-x-auto">

<table className="
min-w-[1200px]
w-full
">


<thead>


<tr style={{backgroundColor:COLORS.navy}}>


<th className="p-4 text-left text-white text-sm">
#
</th>


<th className="p-4 text-left text-white text-sm">
DNI
</th>


<th className="p-4 text-left text-white text-sm">
Empleado
</th>


<th className="p-4 text-left text-white text-sm">
Nacimiento
</th>


<th className="p-4 text-left text-white text-sm">
Inicio Contrato
</th>


<th className="p-4 text-left text-white text-sm">
Fin Contrato
</th>


<th className="p-4 text-left text-white text-sm">
Capacitación 1
</th>


<th className="p-4 text-left text-white text-sm">
Capacitación 2
</th>


<th className="p-4 text-left text-white text-sm">
Capacitación 3
</th>


</tr>


</thead>



<tbody>


{
resumen.map((emp,index)=>(


<tr
key={emp.id}
className="
border-b
hover:bg-slate-50
transition
"


>


<td className="p-4 text-sm">
{index+1}
</td>


<td className="p-4 text-sm">
{emp.dni}
</td>



<td className="p-4">

<div className="flex items-center gap-3">


<div 
className="
h-10 w-10
rounded-full
flex items-center justify-center
text-white
font-bold
"
style={{backgroundColor:COLORS.navy}}
>
{emp.nombres.charAt(0)}
</div>


<div>

<p className="font-semibold text-slate-800">
{emp.nombres}
</p>

<p className="text-xs text-slate-500">
{emp.apellidos}
</p>

</div>


</div>

</td>



<td className="p-4 text-sm">
{emp.nacimiento}
</td>


<td className="p-4 text-sm">
{formatearFecha(emp.inicioContrato)}
</td>


<td className="p-4 text-sm">

<span className="
px-3 py-1
rounded-full
text-xs
font-semibold
bg-orange-100
text-orange-700
">

{formatearFecha(emp.finContrato)}

</span>

</td>



<td className="p-4 text-sm">
{formatearFecha(emp.cap1)}</td>


<td className="p-4 text-sm">
{formatearFecha(emp.cap2)}</td>


<td className="p-4 text-sm">
{formatearFecha(emp.cap3)}</td>



</tr>


))
}



</tbody>


</table>


</div>


</div>



</div>

);


}





function Card({icon,titulo,valor,detalle}){


return(

<div className="
bg-white
rounded-2xl
border
border-slate-200
shadow-sm
p-5
flex
items-center
gap-4
">


<div className="
h-12
w-12
rounded-xl
flex
items-center
justify-center
bg-slate-100
text-[rgb(23_37_76)]
">

{icon}

</div>



<div>

<p className="text-sm text-slate-500">
{titulo}
</p>


<h3 className="text-2xl font-bold text-slate-800">
{valor}
</h3>


<p className="text-xs text-slate-400">
{detalle}
</p>


</div>



</div>


)

}