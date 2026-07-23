import { Request, Response } from "express";
import {
  enviarCorreoAsistencia
} from "../../utils/mailer";
import multer from "multer";
import { prisma } from "../../config/prisma";
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
  req: Request,
  res: Response
) => {

  try {

    const {
      descriptor,
      latitud,
      longitud
    } = req.body;

    if (!descriptor || !latitud || !longitud) {

      return res.status(400).json({

        ok: false,
        message: "Faltan datos"

      });

    }

    const result =
      await marcarAsistenciaPorBiometria({

        descriptor:
          Array.isArray(descriptor)
            ? descriptor
            : JSON.parse(descriptor),

        latitud,

        longitud

      });

    return res.json(result);

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      ok: false,

      message: "Error asistencia"

    });

  }

};
export const subirFotoAsistencia = async (
  req: Request & { file?: Express.Multer.File },
  res: Response
) => {

  try {

    const { asistenciaId } = req.body;


    if (!req.file) {

      return res.status(400).json({

        ok:false,

        message:"No se envió foto"

      });

    }



    // ===============================
    // ACTUALIZAR FOTO EN ASISTENCIA
    // ===============================

    const asistencia =
    await prisma.asistencia.update({

      where:{
        id:Number(asistenciaId)
      },

      data:{

        foto:req.file.path

      },

      include:{

        empleado:true

      }

    });



    // ===============================
    // BUSCAR USUARIOS RRHH
    // ===============================

    const usuariosRRHH =
    await prisma.user.findMany({

      where:{

        rol:"ADMIN",

        modulo:"RRHH"

      }

    });



    // ===============================
    // ENVIAR CORREO
    // ===============================

    for(const usuario of usuariosRRHH){


      if(!usuario.correo)
        continue;



      await enviarCorreoAsistencia(

  usuario.correo,

  {

    empleado:
    `${asistencia.empleado.nombres} ${asistencia.empleado.apellidos}`,


    tipo:
    asistencia.tipo,


    fecha:
    asistencia.fecha.toLocaleDateString(),


    hora:
    asistencia.fecha.toLocaleTimeString(),


    latitud:
    asistencia.latitud ?? 0,


    longitud:
    asistencia.longitud ?? 0,


    foto:
    asistencia.foto


  }

);
    }
    return res.json({

      ok:true,

      message:
      "Foto guardada y correo enviado",

      data:asistencia

    });



  } catch (error) {


    console.error(error);


    return res.status(500).json({

      ok:false,

      message:"Error al guardar foto"

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