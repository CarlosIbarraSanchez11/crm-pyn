import { useEffect, useState } from "react";
import api from "../../../../api/axios";
const acciones = [
  "Crear",
  "Editar",
  "Eliminar"
];
export default function GestionPermisos(){

const [usuarios,setUsuarios]=useState([]);
const [usuarioSeleccionado,setUsuarioSeleccionado]=useState(null);
const [permisos,setPermisos]=useState([]);
const [modulos,setModulos] = useState([]);

useEffect(()=>{

cargarUsuarios();
cargarModulos();

},[]);



const cargarUsuarios = async()=>{

try{

const res =
await api.get("/auth/usuarios");


setUsuarios(res.data);


}catch(error){

console.log(error);

}

};
const cargarModulos = async()=>{

try{

const res = await api.get("/auth/permisos");

setModulos(res.data);


}catch(error){

console.log(error);

}

};
return(

<div className="p-6 bg-slate-50 min-h-screen">


<h1 className="text-3xl font-bold text-slate-800">
Gestión de Permisos
</h1>

<p className="text-slate-500 mt-1 mb-8">
Configura los permisos de acceso para cada usuario
</p>



<div className="
grid
md:grid-cols-3
gap-6
">


{/* USUARIOS */}

<div className="
bg-white
rounded-2xl
border
p-5
">


<h2 className="font-bold text-lg mb-4">
Usuarios del Sistema
</h2>


<p className="text-sm text-slate-500 mb-4">
Selecciona un usuario para configurar sus permisos
</p>



{
usuarios.map(usuario=>(

<button
key={usuario.id}
onClick={async()=>{

const res = await api.get(
`/auth/usuarios/${usuario.id}/permisos`
);


const ids = res.data.map(
p=>p.permisoId
);


const permisosModulo={};


res.data.forEach(p=>{

permisosModulo[p.modulo]=true;

});


setUsuarioSeleccionado({

...usuario,

permisos:{

modulos:permisosModulo,

acciones:{},

ids:ids

}

});


}}
>


<h3 className="font-semibold">
{usuario.nombre}
</h3>


<p className="text-sm text-slate-500">
{usuario.correo}
</p>


<span className="
text-xs
text-blue-600
">
{usuario.rol}
</span>


</button>


))
}



</div>




{/* PERMISOS */}


<div className="
md:col-span-2
bg-white
rounded-2xl
border
p-5
">


<h2 className="font-bold text-lg">
Configurar Permisos
</h2>



{
usuarioSeleccionado ?


<div className="mt-5">

<p>
Editando permisos de:
</p>


<h3 className="font-bold text-xl">
{usuarioSeleccionado.nombre}
</h3>
<div className="mt-6">

<h3 className="font-semibold text-lg mb-4">
Módulos Visibles
</h3>

<div className="space-y-3">

{
modulos.map(modulo => (

<div
key={modulo}
className="
flex
justify-between
items-center
bg-white
border
border-slate-200
rounded-2xl
px-5
py-4
shadow-sm
hover:shadow-md
hover:border-[rgb(23_37_76)]
transition-all
duration-300
"
>

<span>{modulo.nombre}</span>
<button
type="button"
onClick={()=>{


const existe =
usuarioSeleccionado.permisos.ids.includes(
modulo.id
);


let nuevosIds;


if(existe){

nuevosIds =
usuarioSeleccionado.permisos.ids.filter(
id=>id !== modulo.id
);


}else{


nuevosIds=[
...usuarioSeleccionado.permisos.ids,
modulo.id
];


}



setUsuarioSeleccionado({

...usuarioSeleccionado,

permisos:{

...usuarioSeleccionado.permisos,

ids:nuevosIds

}

});


}}
className={`
relative
w-12
h-7
rounded-full
transition-all
duration-300
${
usuarioSeleccionado.permisos.ids.includes(modulo.id)
? "bg-[rgb(23_37_76)]"
: "bg-slate-300"
}
`}
>

<span
className={`
absolute
top-1
h-5
w-5
rounded-full
bg-white
shadow-md
transition-all
duration-300
${usuarioSeleccionado.permisos.ids.includes(modulo.id)
? "left-6"
: "left-1"}
`}
/>

</button>

</div>

))
}

</div>

</div>


<div className="mt-8">

<h3 className="font-semibold text-lg mb-4">
Acciones Permitidas
</h3>

<div className="space-y-3">

{
acciones.map(accion => (

<div
key={accion}
className="
flex
justify-between
items-center
bg-white
border
border-slate-200
rounded-2xl
px-5
py-4
shadow-sm
hover:shadow-md
hover:border-[rgb(23_37_76)]
transition-all
duration-300
"
>

<span>{accion}</span>
<button
type="button"
onClick={() =>
setUsuarioSeleccionado({
...usuarioSeleccionado,
permisos:{
...usuarioSeleccionado.permisos,
acciones:{
...usuarioSeleccionado.permisos.acciones,
[accion]:
!usuarioSeleccionado.permisos.acciones[accion]
}
}
})
}
className={`
relative
w-12
h-7
rounded-full
transition-all
duration-300
${
usuarioSeleccionado.permisos.acciones[accion]
? "bg-[rgb(23_37_76)]"
: "bg-slate-300"
}
`}
>

<span
className={`
absolute
top-1
h-5
w-5
rounded-full
bg-white
shadow-md
transition-all
duration-300
${usuarioSeleccionado.permisos.acciones[accion]
? "left-6"
: "left-1"}
`}
/>

</button>
</div>

))
}

</div>

<button

onClick={async()=>{

await api.put(

`/auth/usuarios/${usuarioSeleccionado.id}/permisos`,

{
permisos:
usuarioSeleccionado.permisos.ids

}

);


alert("Permisos guardados");


}}

className="
mt-8
w-full
bg-orange-500
text-white
rounded-xl
py-3
"

>
Guardar Permisos
</button>
</div>

</div>


:

<p className="text-slate-500 mt-5">
Selecciona un usuario para configurar sus permisos
</p>


}


</div>


</div>


</div>


)

}