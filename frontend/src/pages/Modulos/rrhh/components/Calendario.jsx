import {
  Cake,
  GraduationCap,
  FileText,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import empleadosData from "../../../../data/empleados";
import capacitacionesData from "../../../../data/capacitaciones";
import contratosData from "../../../../data/contratos";
import { useState } from "react";


const COLORS = {
  navy:"rgb(23 37 76)",
  orange:"rgb(243 146 0)"
};
export default function Calendario(){
    const [fechaActual,setFechaActual] = useState(new Date());
   const mes = fechaActual.getMonth();
const año = fechaActual.getFullYear();
const nombreMes = fechaActual.toLocaleString(
"es-ES",
{
month:"long"
}
);

const diasMes = new Date(
año,
mes + 1,
0
).getDate();
console.log({
    mes,
    año,
    nombreMes,
    diasMes
});
const [eventos]=useState(()=>{
const cumpleaños = empleadosData.map(emp=>({

id:`cumple-${emp.id}`,

tipo:"CUMPLEAÑOS",

titulo:
`${emp.nombres} ${emp.apellidos}`,

fecha:
emp.nacimiento,

detalle:"Cumpleaños"

}));

const capacitaciones = capacitacionesData.map(cap=>({

id:`cap-${cap.id}`,

tipo:"CAPACITACION",

titulo:cap.nombre,

fecha:cap.fecha,

detalle:
`${cap.empleados.length} participantes - ${cap.duracion}h`


}));

const contratos = contratosData.map(con=>{


const empleado = empleadosData.find(
e=>e.id===con.empleadoId
);


return {


id:`contrato-${con.id}`,

tipo:"CONTRATO",
titulo:
empleado
?
`${empleado.nombres} ${empleado.apellidos}`
:
"Empleado desconocido",

fecha:con.fechaFin,

detalle:
`Contrato vence ${con.fechaFin}`

};
});

return [

...cumpleaños,
...capacitaciones,
...contratos

];

});
const iconoEvento=(tipo)=>{

if(tipo==="CUMPLEAÑOS")
return <Cake size={22}/>;


if(tipo==="CAPACITACION")
return <GraduationCap size={22}/>;


return <FileText size={22}/>;

};
const obtenerFechaEvento = (fecha) => {

    const [dia, mes, año] = fecha.split("/");

    return {
        dia: Number(dia),
        mes: Number(mes) - 1,
        año: Number(año)
    };

};
console.log(eventos);
return(

<div className="p-6 bg-slate-50 min-h-screen">



{/* CABECERA */}

<div className="mb-8">

<h1 
className="text-3xl font-bold"
style={{color:COLORS.navy}}
>
Calendario
</h1>

<p className="text-slate-500 mt-1">
Cumpleaños, capacitaciones y contratos del equipo
</p>

</div>




{/* RESUMEN */}

<div className="
grid 
grid-cols-1
md:grid-cols-4
gap-5
mb-8
">
<Card
icon={<CalendarDays/>}
titulo="Total Eventos"
valor={eventos.length}
/>
<Card
icon={<Cake/>}
titulo="Cumpleaños"
valor={
eventos.filter(
e=>e.tipo==="CUMPLEAÑOS"
).length
}
/>
<Card
icon={<GraduationCap/>}
titulo="Capacitaciones"
valor={
eventos.filter(
e=>e.tipo==="CAPACITACION"
).length
}
/>
<Card
icon={<FileText/>}
titulo="Contratos"
valor={
eventos.filter(
e=>e.tipo==="CONTRATO"
).length
}
/>

</div>

{/* CALENDARIO */}

<div className="
bg-white
rounded-2xl
border
border-slate-200
shadow-sm
p-6
mb-6
">


<div className="flex items-center justify-between mb-5">


<div>

<h2 className="text-xl font-bold text-slate-800 capitalize">
{nombreMes} {año}
</h2>

<div className="flex items-center gap-2">

    <button
        onClick={() =>
            setFechaActual(fechaAnterior => {
                return new Date(
                    fechaAnterior.getFullYear(),
                    fechaAnterior.getMonth() - 1,
                    1
                );
            })
        }
        className="
            h-10
            w-10
            rounded-xl
            border
            border-slate-200
            bg-white
            flex
            items-center
            justify-center
            text-slate-600
            transition
            hover:bg-slate-100
            hover:text-[rgb(23_37_76)]
            hover:border-slate-300
        "
    >
        <ChevronLeft size={18}/>
    </button>

    <button
        onClick={() =>
            setFechaActual(fechaAnterior => {
                return new Date(
                    fechaAnterior.getFullYear(),
                    fechaAnterior.getMonth() + 1,
                    1
                );
            })
        }
        className="
            h-10
            w-10
            rounded-xl
            border
            border-slate-200
            bg-white
            flex
            items-center
            justify-center
            text-slate-600
            transition
            hover:bg-slate-100
            hover:text-[rgb(23_37_76)]
            hover:border-slate-300
        "
    >
        <ChevronRight size={18}/>
    </button>

</div>
<p className="text-sm text-slate-500">
Vista mensual de eventos
</p>

</div>


</div>




<div className="
grid
grid-cols-7
gap-2
">


{
["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]
.map(dia=>(

<div
key={dia}
className="
text-center
text-sm
font-semibold
text-slate-500
py-2
"
>
{dia}
</div>

))
}



{
Array.from({length:diasMes},(_,i)=>(

<div
key={i}
className="
h-20
border
border-slate-200
rounded-xl
p-2
hover:bg-slate-50
transition
"
>
<p className="text-sm font-semibold text-slate-700">
{i+1}
</p>

{
eventos.map(e=>{

const fechaEvento = obtenerFechaEvento(e.fecha);
const coincideFecha =
    fechaEvento.dia === i + 1 &&
    fechaEvento.mes === mes &&
    (
        e.tipo === "CUMPLEAÑOS"
            ? true
            : fechaEvento.año === año
    );

if (coincideFecha) {

return(

<div
key={e.id}
className="
mt-1
text-xs
rounded-lg
px-2
py-1
bg-blue-100
text-blue-700
truncate
"
>

{
e.tipo==="CUMPLEAÑOS" && "🎂"
}

{
e.tipo==="CAPACITACION" && "🎓"
}

{
e.tipo==="CONTRATO" && "📄"
}

{e.titulo}

</div>

)

}


return null;

})
}

</div>

))
}



</div>


</div>








{/* EVENTOS */}

<div className="
bg-white
rounded-2xl
border
border-slate-200
shadow-sm
overflow-hidden
">


<div className="p-5 border-b border-slate-200">


<h2 className="text-xl font-bold text-slate-800">
Próximos Eventos
</h2>


<p className="text-sm text-slate-500">
Lista completa de actividades programadas
</p>


</div>




<div className="p-5 space-y-4">


{
eventos.map(evento=>(


<div
key={evento.id}
className="
flex
gap-4
items-center
border
border-slate-200
rounded-xl
p-4
hover:bg-slate-50
transition
"
>


<div
className="
h-12
w-12
rounded-xl
flex
items-center
justify-center
"
style={{
backgroundColor:"rgb(23 37 76 / 0.08)",
color:COLORS.navy
}}
>

{iconoEvento(evento.tipo)}

</div>




<div className="flex-1">


<h3 className="
font-semibold
text-slate-800
">

{evento.titulo}

</h3>


<div className="
flex
gap-3
text-sm
text-slate-500
mt-1
">

<span>
{evento.fecha}
</span>


<span>
•
</span>


<span>
{evento.detalle}
</span>


</div>


</div>




<span
className="
px-3
py-1
rounded-full
text-xs
font-semibold
"
style={{
backgroundColor:
evento.tipo==="CUMPLEAÑOS"
?"rgb(252 231 243)"
:
evento.tipo==="CAPACITACION"
?"rgb(219 234 254)"
:
"rgb(254 215 170)"
}}
>

{evento.tipo}

</span>


</div>


))
}



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
"
style={{
backgroundColor:"rgb(23 37 76 / 0.08)",
color:"rgb(23 37 76)"
}}
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