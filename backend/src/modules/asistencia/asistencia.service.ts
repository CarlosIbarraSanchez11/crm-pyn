import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import fs from "node:fs";
import path from "node:path";

/* =======================
   DISTANCIA FACIAL
======================= */

function distanciaEuclidiana(
  a:number[],
  b:number[]
){

  return Math.sqrt(
    a.reduce(
      (acc,val,i)=>
        acc + Math.pow(val - (b[i] ?? 0),2),
      0
    )
  );

}



/* =======================
   REGISTRAR ASISTENCIA MANUAL
======================= */

export const registrarAsistencia = async(data:any)=>{

 return prisma.asistencia.create({
   data
 });

};

/* =======================
   MARCAR ASISTENCIA BIOMETRÍA
======================= */


export const marcarAsistenciaPorBiometria = async ({
  descriptor,
  latitud,
  longitud
}:any)=>{


try{


const empleados =
await prisma.empleado.findMany();



let mejorEmpleado:any = null;

let menorDistancia = 0.5;



// BUSCAR ROSTRO

for(const empleado of empleados){


 if(!empleado.descriptor)
 continue;



 const guardado =
 empleado.descriptor as number[];



 const distancia =
 distanciaEuclidiana(
  descriptor,
  guardado
 );



 if(distancia < menorDistancia){

   menorDistancia = distancia;

   mejorEmpleado = empleado;

 }

}



if(!mejorEmpleado){

 return {

  ok:false,

  message:"Rostro no reconocido"

 };

}




// VERIFICAR SI YA MARCO HOY


const inicio = new Date();

inicio.setHours(0,0,0,0);


const fin = new Date();

fin.setHours(23,59,59,999);



const ultima =
await prisma.asistencia.findFirst({

where:{
 empleadoId:mejorEmpleado.id,

 fecha:{
  gte:inicio,
  lte:fin
 }

},

orderBy:{
 fecha:"desc"
}


});




let tipo:
"ENTRADA"|"SALIDA" = "ENTRADA";



if(
 ultima &&
 ultima.tipo==="ENTRADA"
){

 tipo="SALIDA";

}


const asistencia =
await prisma.asistencia.create({

data:{


 empleadoId:
 mejorEmpleado.id,


 tipo,


 latitud:
 Number(latitud),


 longitud:
 Number(longitud),


 confianza:
 Number(
  (1-menorDistancia)*100
 )


}


});


return {

  ok: true,

  message:
    `Asistencia registrada ${tipo}`,

  empleado:
    `${mejorEmpleado.nombres} ${mejorEmpleado.apellidos}`,

  confianza:
    asistencia.confianza,

  asistenciaId:
    asistencia.id,

  data: asistencia

};

}catch(error){


console.error(
"ERROR ASISTENCIA:",
error
);



return {

 ok:false,

 message:
 "Error registrando asistencia"

};
}

};



/* =======================
   ASISTENCIAS POR EMPLEADO
======================= */


export const obtenerAsistenciasPorEmpleado =
async(empleadoId:number)=>{


return prisma.asistencia.findMany({

where:{
 empleadoId
},


include:{
 empleado:true
},


orderBy:{
 fecha:"desc"
}


});


};





/* =======================
   TODAS LAS ASISTENCIAS
======================= */


export const obtenerTodasAsistencias =
async()=>{


return prisma.asistencia.findMany({

include:{
 empleado:true
},


orderBy:{
 fecha:"desc"
}


});


};






/* =======================
   DASHBOARD
======================= */


export const obtenerDashboardAsistencia =
async()=>{


const total =
await prisma.asistencia.count();



const entradas =
await prisma.asistencia.count({

where:{
 tipo:"ENTRADA"
}

});



const salidas =
await prisma.asistencia.count({

where:{
 tipo:"SALIDA"
}

});



return {

ok:true,

data:{

total,

entradas,

salidas

}

};


};






/* =======================
   EMPLEADOS BIOMETRÍA
======================= */


export const listarEmpleadosBiometriaService =
()=>{


return prisma.empleado.findMany({

orderBy:{
 nombres:"asc"
}


});


};






/* =======================
   GUARDAR BIOMETRÍA
======================= */


export const guardarBiometriaService =
async(
 empleadoId:number,
 descriptor:any,
 fotoPerfil:string
)=>{


return prisma.empleado.update({

where:{
 id:empleadoId
},


data:{

fotoPerfil,

descriptor

}


});


};






/* =======================
   ACTUALIZAR BIOMETRÍA
======================= */


export const actualizarBiometriaService =
async(
 empleadoId:number,
 descriptor:any,
 fotoPerfil:string
)=>{


const empleado =
await prisma.empleado.findUnique({

where:{
 id:empleadoId
}

});



if(!empleado){

throw new Error(
"Empleado no encontrado"
);

}




if(empleado.fotoPerfil){


const ruta =
path.join(
 process.cwd(),
 empleado.fotoPerfil
);



if(fs.existsSync(ruta)){

fs.unlinkSync(ruta);

}


}




return prisma.empleado.update({

where:{
 id:empleadoId
},


data:{

descriptor,

fotoPerfil

}


});


};






/* =======================
   ELIMINAR BIOMETRÍA
======================= */


export const eliminarBiometriaService =
async(
empleadoId:number
)=>{


const empleado =
await prisma.empleado.findUnique({

where:{
 id:empleadoId
}

});



if(!empleado){

throw new Error(
"Empleado no encontrado"
);

}



if(empleado.fotoPerfil){


const ruta =
path.join(
 process.cwd(),
 empleado.fotoPerfil
);



if(fs.existsSync(ruta)){

fs.unlinkSync(ruta);

}


}




return prisma.empleado.update({

where:{
 id:empleadoId
},


data:{


fotoPerfil:null,


descriptor:
Prisma.JsonNull


}


});


};