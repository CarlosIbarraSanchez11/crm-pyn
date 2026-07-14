import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import {
listarUsuariosService,
obtenerPermisosUsuarioService,
actualizarPermisosUsuarioService

} from "./auth.service";


export const login = async (
  req: Request,
  res: Response
) => {

  try {

    const {
      correo,
      password,
      modulo
    } = req.body;


    const moduloSolicitado = (modulo || "")
      .trim()
      .toUpperCase();



    const user = await prisma.user.findFirst({

      where:{
        correo,
        password
      },

      include:{
        permisos:{
          include:{
            permiso:{
              include:{
                modulo:true,
                acciones:{
                  include:{
                    accion:true
                  }
                }
              }
            }
          }
        }
      }

    });



    if(!user){

      return res.status(401).json({
        message:"Credenciales incorrectas"
      });

    }



    // módulos permitidos

    const modulosUsuario =
      user.permisos.map(
        up =>
          up.permiso.modulo.nombre.toUpperCase()
      );



    if(!modulosUsuario.includes(moduloSolicitado)){

      return res.status(403).json({
        message:"No tienes acceso a este módulo"
      });

    }



    // permisos del módulo

    const permisosModulo =
      user.permisos
      .filter(
        up =>
          up.permiso.modulo.nombre.toUpperCase()
          === moduloSolicitado
      )
      .map(up=>({

        permiso: up.permiso.nombre,

        acciones:
          up.permiso.acciones.map(
            a=>a.accion.nombre
          )

      }));



    return res.json({

      id:user.id,
      nombre:user.nombre,
      correo:user.correo,
      rol:user.rol,

      modulo:moduloSolicitado,

      permisos: permisosModulo

    });


  } catch(error){

    console.error(error);

    return res.status(500).json({
      message:"Error en login"
    });

  }

};
export const listarUsuarios = async(
req:Request,
res:Response
)=>{


try{


const usuarios =
await listarUsuariosService();


res.json(usuarios);


}catch(error){

console.log(error);

res.status(500).json({
message:"Error listando usuarios"
});


}

};
export const obtenerPermisosUsuario = async(
req:Request,
res:Response
)=>{


try{


const id =
Number(req.params.id);


const permisos =
await obtenerPermisosUsuarioService(id);



res.json(permisos);



}catch(error){

console.log(error);


res.status(500).json({
message:"Error obteniendo permisos"
});


}


};
export const actualizarPermisosUsuario = async(
req:Request,
res:Response
)=>{


try{


const id =
Number(req.params.id);


const data =
await actualizarPermisosUsuarioService(
id,
req.body
);



res.json({
ok:true,
data
});


}catch(error){

console.log(error);


res.status(500).json({
message:"Error actualizando permisos"
});


}


};
export const listarPermisos = async(
req:Request,
res:Response
)=>{

const permisos = await prisma.permiso.findMany({
select:{
id:true,
nombre:true
}
});

res.json(permisos);

};