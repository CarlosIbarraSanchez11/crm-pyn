import { Request, Response } from "express";
import multer from "multer";
import {  
  obtenerTodasAsistencias,
  marcarAsistenciaPorBiometria,
  obtenerDashboardAsistencia,
  listarEmpleadosBiometriaService,
  actualizarBiometriaService,
  guardarBiometriaService,
  eliminarBiometriaService,
  obtenerAsistenciasPorEmpleado
 } from "./asistencia.service";

/* ==========================
   MARCAR ASISTENCIA FACIAL
========================== */

export const marcarAsistencia = async (
req: Request & {
 file?: Express.Multer.File
},
res: Response
)=>{

try{


const {
descriptor,
latitud,
longitud
}=req.body;



if(!descriptor || !latitud || !longitud){

return res.status(400).json({

ok:false,
message:"Faltan datos"

});

}



const foto = req.file
? req.file.path
: null;



const result =
await marcarAsistenciaPorBiometria({

descriptor:
JSON.parse(descriptor),

latitud,

longitud,

foto

});



return res.json(result);



}catch(error){

console.error(error);


return res.status(500).json({

ok:false,

message:"Error asistencia"

});


}

};

/* ==========================
   LISTAR ASISTENCIAS EMPLEADO
========================== */

export const getAsistenciasEmpleado = async(
req:Request,
res:Response
)=>{

try{


const {empleadoId}=req.params;


const data =
await obtenerAsistenciasPorEmpleado(
 Number(empleadoId)
);



return res.json({

 ok:true,

 data

});



}catch(error:any){


return res.status(500).json({

 ok:false,

 message:error.message

});


}

};





/* ==========================
   TODAS LAS ASISTENCIAS
========================== */

export const getAllAsistencias = async(
req:Request,
res:Response
)=>{

try{


const data =
await obtenerTodasAsistencias();



return res.json({

 ok:true,

 data

});


}catch(error:any){


return res.status(500).json({

 ok:false,

 message:error.message

});


}

};





/* ==========================
 DASHBOARD
========================== */

export const dashboardAsistencia = async(
req:Request,
res:Response
)=>{

try{


const data =
await obtenerDashboardAsistencia();


return res.json(data);



}catch(error:any){


return res.status(500).json({

ok:false,

message:error.message

});


}

};
export const listarEmpleadosBiometriaController=async(

req:Request,
res:Response

)=>{

const empleados=

await listarEmpleadosBiometriaService();

res.json(empleados);

};
export const guardarBiometriaController=async(

req:Request,
res:Response

)=>{

const{

empleadoId,
descriptor

}=req.body;

const empleado=

await guardarBiometriaService(

Number(empleadoId),

JSON.parse(descriptor),

((req as Request & { file?: Express.Multer.File }).file as any).path

);

res.json(empleado);

};
export const actualizarBiometriaController=async(

req:Request,
res:Response

)=>{

const empleado=

await actualizarBiometriaService(

Number(req.params.id),

JSON.parse(req.body.descriptor),

(req.file as any).path

);

res.json(empleado);

};
export const eliminarBiometriaController=async(

req:Request,
res:Response

)=>{

await eliminarBiometriaService(

Number(req.params.id)

);

res.json({

mensaje:"Biometría eliminada"

});

};