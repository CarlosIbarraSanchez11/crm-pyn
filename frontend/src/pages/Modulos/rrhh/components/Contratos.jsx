import { Search, Plus, Edit, Eye,Trash2, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { useState,useEffect } from "react";
import ModalNuevoContrato from "./Modal/ModalNuevoContrato";
import api from "../../../../api/axios";
const COLORS = {
  navy:"rgb(23 37 76)",
  orange:"rgb(243 146 0)"
};

export default function Contratos(){

const [modal,setModal]=useState(false);
const [empleados,setEmpleados] = useState([]);
const [contratos,setContratos] = useState([]);
const [busqueda, setBusqueda] = useState("");
const [tipoContrato, setTipoContrato] = useState("");
const [estado, setEstado] = useState("");
const obtenerEmpleados = async()=>{

 try{

   const res = await api.get("/rrhh/empleados");

   setEmpleados(res.data);

 }catch(error){

   console.log(error);

 }

};
const obtenerContratos = async()=>{

 try{

   const res = await api.get("/rrhh/contratos");

   setContratos(res.data);

 }catch(error){

   console.log(error);

 }

};
const guardarContrato = async(datos)=>{

try{

 const res = await api.post(
   "/rrhh/contratos",
   datos
 );

 console.log(res.data);


 // actualizar tabla
 obtenerContratos();


 // cerrar modal
 setModal(false);


}catch(error){

 console.log(error);

}


};
useEffect(()=>{

 obtenerContratos();
 obtenerEmpleados();

},[]);

const contratosFiltrados = contratos.filter(contrato => {

  const coincideBusqueda =
    `${contrato.empleado?.nombres || ""} ${contrato.empleado?.apellidos || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()) ||
    contrato.empleado?.dni?.includes(busqueda);

  const coincideTipo =
    tipoContrato === "" ||
    contrato.tipo === tipoContrato;

  const coincideEstado =
    estado === "" ||
    contrato.estado === estado;

  return (
    coincideBusqueda &&
    coincideTipo &&
    coincideEstado
  );

});
const formatearFecha = (fecha)=>{

if(!fecha) return "-";

return new Date(fecha)
.toISOString()
.split("T")[0];

};
return(

<div className="p-6 bg-slate-50 min-h-screen">

<div className="flex justify-between items-start mb-8">

<div>
<h1 className="text-3xl font-bold" style={{color:COLORS.navy}}>
Contratos
</h1>

<p className="text-slate-500 mt-1">
Gestión completa de contratos laborales y vínculos de empleados
</p>

</div>


<button
onClick={()=>setModal(true)}
className="flex items-center gap-2 text-white px-5 py-3 rounded-xl shadow-lg hover:scale-105 transition"
style={{backgroundColor:COLORS.orange}}
>
<Plus size={20}/>
Nuevo contrato
</button>

</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">


<Card
icon={<FileText/>}
titulo="Total contratos"
valor={contratosFiltrados.length}
/>


<Card
icon={<CheckCircle/>}
titulo="Activos"
valor={
  contratosFiltrados.filter(
    c=>c.estado==="Activo"
  ).length
}
/>


<Card
icon={<Clock/>}
titulo="Por vencer"
valor={
  contratosFiltrados.filter(c=>{

    if(!c.fechaFin) return false;

    const hoy = new Date();
    const fechaFin = new Date(c.fechaFin);

    const diferencia =
    (fechaFin - hoy) /
    (1000 * 60 * 60 * 24);


    return diferencia <= 30 && diferencia >=0;

  }).length
}
/>


<Card
icon={<XCircle/>}
titulo="Finalizados"
valor={
  contratosFiltrados.filter(
    c=>c.estado==="Finalizado"
  ).length
}

/>
</div>

<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">


<div className="flex flex-col md:flex-row gap-4">


<div className="flex items-center border rounded-xl px-4 flex-1 bg-slate-50">

<Search size={18} className="text-slate-400"/>
<input
  value={busqueda}
  onChange={(e)=>setBusqueda(e.target.value)}
  className="bg-transparent outline-none w-full p-3 text-sm"
  placeholder="Buscar contrato por empleado o DNI..."
/>

</div>
<select
  value={tipoContrato}
  onChange={(e)=>setTipoContrato(e.target.value)}
  className="border rounded-xl px-4 py-3 text-sm outline-none"
>
  <option value="">Todos los contratos</option>

  {[...new Set(contratos.map(c=>c.tipo))].map(tipo=>(
    <option
      key={tipo}
      value={tipo}
    >
      {tipo}
    </option>
  ))}
</select>

<select
  value={estado}
  onChange={(e)=>setEstado(e.target.value)}
  className="border rounded-xl px-4 py-3 text-sm outline-none"
>
  <option value="">Todos los estados</option>

  {[...new Set(contratos.map(c=>c.estado))].map(est=>(
    <option
      key={est}
      value={est}
    >
      {est}
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


<th className="p-4 text-left text-white text-sm">
Empleado
</th>


<th className="p-4 text-left text-white text-sm">
DNI
</th>


<th className="p-4 text-left text-white text-sm">
Contrato
</th>


<th className="p-4 text-left text-white text-sm">
Inicio
</th>


<th className="p-4 text-left text-white text-sm">
Fin
</th>


<th className="p-4 text-left text-white text-sm">
Salario
</th>


<th className="p-4 text-left text-white text-sm">
Estado
</th>


<th className="p-4 text-center text-white text-sm">
Acciones
</th>


</tr>

</thead>



<tbody>


{
contratosFiltrados.map(contrato => (

<tr
key={contrato.id}
className="border-b hover:bg-slate-50 transition"
>



<td className="p-4">

<div className="flex items-center gap-3">


<div
className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
style={{backgroundColor:COLORS.navy}}
>

{
contrato.empleado.nombres.charAt(0)
}

</div>


<div>

<p className="font-semibold text-slate-800">
{contrato.empleado.nombres}
{contrato.empleado.apellidos}</p>

<p className="text-xs text-slate-500">
Contrato laboral
</p>


</div>


</div>

</td>

<td className="p-4 text-sm">
{contrato.empleado.dni}</td>

<td className="p-4">

<p className="font-medium text-slate-700">
{contrato.tipo}
</p>

<p className="text-xs text-slate-400">
Vínculo laboral
</p>

</td>

<td className="p-4 text-sm">
{formatearFecha(contrato.fechaInicio)}
</td>

<td className="p-4 text-sm">
{formatearFecha(contrato.fechaFin)}
</td>

<td className="p-4 text-sm">
  S/ {Number(contrato.salario).toFixed(2)}
</td>

<td className="p-4">

<span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
{contrato.estado}
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
{
modal &&
<ModalNuevoContrato

cerrar={()=>setModal(false)}

empleados={empleados}

onGuardar={guardarContrato}

/>
}

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