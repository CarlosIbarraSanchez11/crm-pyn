import { useState } from "react";
import {
    X,
    ShieldCheck,
    HeartPulse,
    HardHat,
    FileCheck,
    CalendarDays
} from "lucide-react";
import api from "../../../../../api/axios";

const COLORS={
    navy:"rgb(23 37 76)",
    orange:"rgb(243 146 0)"
};


export default function ModalSSOMA({

    trabajador,
    cerrar,
    actualizarTabla

}){

const [form,setForm]=useState({

    emoInicio: trabajador?.emoInicio || "",
    emoFin: trabajador?.emoFin || "",

    alturaInicio: trabajador?.alturaInicio || "",
    alturaFin: trabajador?.alturaFin || "",

    sstInicio: trabajador?.sstInicio || "",
    sstFin: trabajador?.sstFin || "",

    patrimonialInicio: trabajador?.patrimonialInicio || "",
    patrimonialFin: trabajador?.patrimonialFin || ""

});


const cambiar=(campo,valor)=>{

setForm({
    ...form,
    [campo]:valor
});

};


const secciones=[

{
titulo:"Examen Médico Ocupacional (EMO)",
icon:<HeartPulse size={22}/>,
inicio:"emoInicio",
fin:"emoFin"
},

{
titulo:"Trabajo en Altura",
icon:<HardHat size={22}/>,
inicio:"alturaInicio",
fin:"alturaFin"
},

{
titulo:"Seguridad y Salud en el Trabajo (SST)",
icon:<ShieldCheck size={22}/>,
inicio:"sstInicio",
fin:"sstFin"
},

{
titulo:"Seguridad Patrimonial",
icon:<FileCheck size={22}/>,
inicio:"patrimonialInicio",
fin:"patrimonialFin"
}

];
const guardarCambios = async()=>{

try{

await api.put(
`/rrhh/ssoma/${trabajador.empleadoId}`,
form
);

alert("Datos SSOMA actualizados correctamente");
await actualizarTabla();

cerrar();


}catch(error){

console.log(error);

alert("Error actualizando SSOMA");

}


};

return(

<div
className="
fixed
inset-0
z-50
bg-black/60
backdrop-blur-sm
flex
items-center
justify-center
p-4
"
>


<div
className="
bg-white
w-full
max-w-4xl
rounded-3xl
shadow-2xl
overflow-hidden
"
>


{/* HEADER */}

<div
className="
px-6
py-5
flex
items-center
justify-between
text-white
"
style={{
background:
`linear-gradient(135deg,${COLORS.navy},rgb(40,60,120))`
}}
>


<div className="flex items-center gap-4">


<div
className="
h-14
w-14
rounded-2xl
bg-white/20
flex
items-center
justify-center
text-xl
font-bold
"
>

{trabajador?.nombres?.charAt(0)}

</div>


<div>

<h2 className="text-xl font-bold">
Gestión SSOMA
</h2>

<p className="text-sm opacity-80">

{trabajador?.nombres} {trabajador?.apellidos}

</p>

</div>


</div>


<button
onClick={cerrar}
className="
h-10
w-10
rounded-xl
bg-white/10
hover:bg-white/20
flex
items-center
justify-center
transition
"
>

<X/>

</button>


</div>





{/* CONTENIDO */}

<div
className="
p-6
max-h-[70vh]
overflow-y-auto
"
>


<div
className="
grid
grid-cols-1
md:grid-cols-2
gap-5
"
>


{
secciones.map(sec=>(


<div
key={sec.titulo}
className="
border
border-slate-200
rounded-2xl
p-5
hover:shadow-md
transition
"
>


<div
className="
flex
items-center
gap-3
mb-5
"
>


<div
className="
h-10
w-10
rounded-xl
flex
items-center
justify-center
"
style={{
backgroundColor:"rgb(23 37 76 / .08)",
color:COLORS.navy
}}
>

{sec.icon}

</div>


<div>

<h3 className="
font-semibold
text-slate-800
text-sm
">

{sec.titulo}

</h3>

<p className="text-xs text-slate-400">
Vigencia del certificado
</p>

</div>


</div>





<div className="grid grid-cols-2 gap-3">


<div>

<label
className="
text-xs
font-semibold
text-slate-500
"
>
Inicio
</label>


<div className="
relative
mt-1
">

<CalendarDays
size={16}
className="
absolute
left-3
top-3
text-slate-400
"
/>


<input

type="date"

value={form[sec.inicio]}

onChange={
e=>cambiar(
sec.inicio,
e.target.value
)
}

className="
w-full
border
border-slate-200
rounded-xl
py-2.5
pl-10
outline-none
focus:ring-2
focus:ring-orange-200
"
/>

</div>

</div>



<div>

<label
className="
text-xs
font-semibold
text-slate-500
"
>
Fin
</label>


<div className="relative mt-1">

<CalendarDays
size={16}
className="
absolute
left-3
top-3
text-slate-400
"
/>


<input

type="date"

value={form[sec.fin]}

onChange={
e=>cambiar(
sec.fin,
e.target.value
)
}

className="
w-full
border
border-slate-200
rounded-xl
py-2.5
pl-10
outline-none
focus:ring-2
focus:ring-orange-200
"
/>

</div>


</div>


</div>


</div>


))

}


</div>


</div>





{/* FOOTER */}

<div
className="
border-t
px-6
py-4
flex
justify-end
gap-3
bg-slate-50
"
>


<button

onClick={cerrar}

className="
px-5
py-3
rounded-xl
border
border-slate-300
text-slate-600
hover:bg-white
transition
"
>

Cancelar

</button>


<button

onClick={guardarCambios}

className="
px-6
py-3
rounded-xl
text-white
font-semibold
shadow-lg
hover:scale-105
transition
"

style={{
backgroundColor:COLORS.orange
}}

>

Guardar cambios

</button>


</div>



</div>


</div>


);

}