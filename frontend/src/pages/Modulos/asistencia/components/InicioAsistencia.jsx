import { useEffect, useState } from "react";
import api from "../../../../api/axios";

import {
  Clock3,
  CalendarDays,
  Users,
  ScanFace,
} from "lucide-react";

export default function InicioAsistencia() {

  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(false);


  const cargarDashboard=async()=>{

    try{

      setLoading(true);

      const res =
      await api.get("/asistencia/dashboard");


      setData(res.data.data);


    }catch(error){

      console.error(
        "ERROR DASHBOARD:",
        error
      );

    }finally{

      setLoading(false);

    }

  };


  useEffect(()=>{

    cargarDashboard();

  },[]);



return (

<div className="space-y-8">


<div className="bg-white rounded-3xl shadow p-8">

<h1 className="text-3xl font-black text-gray-800">
Dashboard General de Asistencia
</h1>


<p className="text-gray-500 mt-2">
Control de asistencia mediante reconocimiento facial
</p>


</div>



<div className="grid lg:grid-cols-4 gap-6">



<div className="bg-white rounded-3xl shadow p-6">

<Clock3 
size={40}
className="text-[#244db7]"
/>


<h2 className="text-3xl font-black mt-4">

{loading ? "--" : data?.total ?? 0}

</h2>


<p className="text-gray-500">
Total registros
</p>


</div>



<div className="bg-white rounded-3xl shadow p-6">

<CalendarDays
size={40}
className="text-green-600"
/>


<h2 className="text-3xl font-black mt-4">

{data?.entradas ?? 0}

</h2>


<p className="text-gray-500">
Entradas registradas
</p>


</div>




<div className="bg-white rounded-3xl shadow p-6">

<Users
size={40}
className="text-red-500"
/>


<h2 className="text-3xl font-black mt-4">

{data?.salidas ?? 0}

</h2>


<p className="text-gray-500">
Salidas registradas
</p>


</div>





<div className="bg-white rounded-3xl shadow p-6">

<ScanFace
size={40}
className="text-purple-600"
/>


<h2 className="text-xl font-black mt-4">

Activo

</h2>


<p className="text-gray-500">
Reconocimiento facial
</p>


</div>



</div>



<div className="bg-white rounded-3xl shadow p-8">


<h2 className="text-2xl font-bold mb-6">
Resumen general
</h2>



<div className="grid lg:grid-cols-3 gap-6">



<div className="border-l-4 border-green-500 p-6 shadow rounded-2xl">

<p className="text-gray-500">
Entradas
</p>


<p className="text-3xl font-black text-green-600">

{data?.entradas ?? 0}

</p>

</div>





<div className="border-l-4 border-red-500 p-6 shadow rounded-2xl">

<p className="text-gray-500">
Salidas
</p>


<p className="text-3xl font-black text-red-600">

{data?.salidas ?? 0}

</p>

</div>





<div className="border-l-4 border-blue-500 p-6 shadow rounded-2xl">

<p className="text-gray-500">
Registros totales
</p>


<p className="text-3xl font-black text-blue-600">

{data?.total ?? 0}

</p>

</div>




</div>


</div>



</div>

);


}