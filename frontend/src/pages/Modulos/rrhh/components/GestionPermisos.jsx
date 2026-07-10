import { useState } from "react";
import { usuarios } from "../../../../data/usuarios";
const modulos = [
  "Personal",
  "Contratos",
  "Calendario",
  "Configuracion",
  "Capacitaciones"
];
const acciones = [
  "Crear",
  "Editar",
  "Eliminar"
];
export default function GestionPermisos(){

const [usuarioSeleccionado,setUsuarioSeleccionado]=useState(null);

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
onClick={() =>
  setUsuarioSeleccionado(
    JSON.parse(JSON.stringify(usuario))
  )
}className="
w-full
text-left
border
rounded-xl
p-4
mb-3
hover:bg-slate-50
"
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

<span>{modulo}</span>
<button
type="button"
onClick={() =>
setUsuarioSeleccionado({
...usuarioSeleccionado,
permisos:{
...usuarioSeleccionado.permisos,
modulos:{
...usuarioSeleccionado.permisos.modulos,
[modulo]:
!usuarioSeleccionado.permisos.modulos[modulo]
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
usuarioSeleccionado.permisos.modulos[modulo]
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
${usuarioSeleccionado.permisos.modulos[modulo]
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
className="
mt-8
w-full
bg-orange-500
hover:bg-orange-600
text-white
font-semibold
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