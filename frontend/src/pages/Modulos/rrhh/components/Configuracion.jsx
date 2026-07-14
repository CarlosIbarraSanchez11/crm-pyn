import {
Shield,
Building2,
Send,
Bell,
Save,
Settings,
Users,
Cake,
FileText,
GraduationCap
} from "lucide-react";
import { useState,useEffect } from "react";
import api from "../../../../api/axios";

const COLORS={
navy:"rgb(23 37 76)",
orange:"rgb(243 146 0)"
};

export default function Configuracion({
    usuario,
    setMenuActivo
}) {    
const [form,setForm]=useState({

empresa:"",
correo:"",
telegramToken:"",
chatId:"",
diasContrato:"",
diasCapacitacion:""

});
const cambiar=(e)=>{

setForm({
...form,
[e.target.name]:e.target.value
});

};
useEffect(()=>{

obtenerConfiguracion();

},[]);



const obtenerConfiguracion = async()=>{

try{


const res = await api.get(
"/rrhh/configuracion"
);


setForm(res.data);


}catch(error){

console.log(error);

}


};
const guardarConfiguracion = async()=>{

try{


await api.put(
"/rrhh/configuracion",
form
);


alert("Configuración guardada correctamente");


}catch(error){

console.log(error);

alert("Error guardando configuración");


}


};

return(

<div className="p-6 bg-slate-50 min-h-screen">



{/* TITULO */}

<div className="mb-8">

<h1
className="text-3xl font-bold"
style={{color:COLORS.navy}}
>
Configuración
</h1>


<p className="text-slate-500 mt-1">
Administra las configuraciones generales del sistema
</p>

</div>


{/* PERMISOS */}

<Section
icon={<Shield/>}
titulo="Gestión de Permisos"
descripcion="Configura módulos y accesos de los usuarios"
>
<button
    onClick={() => setMenuActivo("gestion-permisos")}
    className="
        px-5
        py-3
        rounded-xl
        text-white
        flex
        items-center
        gap-2
        shadow
    "
    style={{ backgroundColor: COLORS.orange }}
>
    <Users size={18}/>
    Administrar Permisos
</button>

</Section>


{/* EMPRESA */}

<Section
icon={<Building2/>}
titulo="Información de la Empresa"
descripcion="Datos principales de la organización"
>


<div className="
grid
md:grid-cols-2
gap-5
">


<Input
label="Nombre de la Empresa"
name="empresa"
value={form.empresa}
cambiar={cambiar}
/>


<Input
label="Correo Electrónico"
name="correo"
value={form.correo}
cambiar={cambiar}
/>


</div>


</Section>

{/* TELEGRAM */}

<Section
icon={<Send/>}
titulo="Notificaciones Telegram"
descripcion="Configura el bot para recibir alertas automáticas"
>


<div className="grid md:grid-cols-2 gap-5">


<Input
label="Token del Bot Telegram"
name="telegramToken"
type="password"
value={form.telegramToken}
cambiar={cambiar}
/>


<Input
label="Chat ID Telegram"
name="chatId"
value={form.chatId}
cambiar={cambiar}
/>


</div>


</Section>

{/* ALERTAS */}

<Section
icon={<Bell/>}
titulo="Configuración de Alertas"
descripcion="Define cuándo enviar recordatorios"
>


<div className="
grid
md:grid-cols-2
gap-5
">

<Input
label="Días anticipación contratos"
name="diasContrato"
type="number"
value={form.diasContrato}
cambiar={cambiar}
/>

<Input
label="Días anticipación capacitaciones"
name="diasCapacitacion"
type="number"
value={form.diasCapacitacion}
cambiar={cambiar}
/>



</div>


</Section>


<button

onClick={guardarConfiguracion}

className="
mb-6
flex
items-center
gap-2
px-6
py-3
rounded-xl
text-white
shadow-lg
hover:scale-105
transition
"

style={{
backgroundColor:COLORS.orange
}}

>

<Save size={18}/>

Guardar Configuración

</button>

{/* NOTIFICACIONES */}

<Section
icon={<Settings/>}
titulo="Notificaciones Manuales"
descripcion="Envía avisos manualmente a los colaboradores"
>


<div className="
grid
md:grid-cols-3
gap-5
">


<BotonNotificacion
icon={<Cake/>}
texto="Enviar Cumpleaños"
/>


<BotonNotificacion
icon={<FileText/>}
texto="Enviar Contratos"
/>


<BotonNotificacion
icon={<GraduationCap/>}
texto="Enviar Capacitaciones"
/>


</div>


</Section>





</div>

)

}

function Section({icon,titulo,descripcion,children}){


return(

<div className="
bg-white
rounded-2xl
border
border-slate-200
shadow-sm
p-6
mb-6
">


<div className="
flex
items-center
gap-3
mb-5
">


<div
className="
h-11
w-11
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

<h2 className="font-bold text-lg text-slate-800">
{titulo}
</h2>

<p className="text-sm text-slate-500">
{descripcion}
</p>


</div>


</div>


{children}


</div>

)

}


function Input({
label,
name,
value,
cambiar,
type="text"
}){


return(

<div>


<label className="
text-sm
font-medium
text-slate-700
">

{label}

</label>


<input

type={type}

name={name}

value={value}

onChange={cambiar}

className="
mt-1
w-full
rounded-xl
border
border-slate-300
px-4
py-3
text-sm
outline-none
focus:ring-2
focus:ring-slate-200
"

/>


</div>

)

}


function BotonNotificacion({icon,texto}){


return(

<button

className="
border
border-slate-200
rounded-xl
p-5
flex
flex-col
items-center
gap-3
hover:bg-slate-50
transition
"

>


<div className="
h-12
w-12
rounded-xl
bg-slate-100
flex
items-center
justify-center
text-[rgb(23_37_76)]
">

{icon}

</div>


<p className="
font-medium
text-slate-700
">

{texto}

</p>


</button>


)

}