import { prisma } from "../../config/prisma";


export const listarUsuariosService = async()=>{


return prisma.user.findMany({

select:{
id:true,
nombre:true,
correo:true,
rol:true
}


});


};
export const obtenerPermisosUsuarioService =
async(userId:number)=>{


const permisos =
await prisma.userPermiso.findMany({

where:{
userId
},

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


});


return permisos.map(p=>({

permisoId:p.permisoId,

nombre:p.permiso.nombre,

modulo:p.permiso.modulo.nombre,

acciones:p.permiso.acciones.map(
a=>a.accion.nombre
)

}));


};
export const actualizarPermisosUsuarioService =
async(
 userId:number,
 data:any
)=>{


const permisos = data.permisos || [];


return await prisma.$transaction(async(tx)=>{


await tx.userPermiso.deleteMany({

where:{
 userId
}

});


for(const permisoId of permisos){


await tx.userPermiso.create({

data:{
 userId,
 permisoId:Number(permisoId)
}

});


}


return {
message:"Permisos actualizados"
};


});


};
