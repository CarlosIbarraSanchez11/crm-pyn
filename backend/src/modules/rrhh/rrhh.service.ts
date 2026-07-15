import { prisma } from "../../config/prisma";


export const listarEmpleadosService = async()=>{

    return await prisma.empleado.findMany({

        include:{
            ssoma:true,
            contratos:true
        },

        orderBy:{
            createdAt:"desc"
        }

    });

};

export const crearEmpleadoService = async(data:any)=>{

try {


const empleado = await prisma.empleado.create({

data:{


    nombres:data.nombres,

    apellidos:data.apellidos,

    dni:data.dni,

    fechaNacimiento:
    new Date(data.fechaNacimiento),


    email:data.email,

    telefono:data.telefono,

    direccion:data.direccion,


    cargo:data.cargo,

    departamento:data.departamento,

    empresa:data.empresa,


    fotoPerfil:data.fotoPerfil ?? null,


    descriptor: data.descriptor
    ? data.descriptor.split(",").map(Number)
    : null,


    estado:data.estado


}

});


// CREAR SSOMA VACÍO
await prisma.sSOMA.create({

data:{


empleadoId:empleado.id,


emoInicio:null,
emoFin:null,


alturaInicio:null,
alturaFin:null,


sstInicio:null,
sstFin:null,


patrimonialInicio:null,
patrimonialFin:null


}

});


return empleado;


}catch(error){


console.log("ERROR CREANDO EMPLEADO:");
console.log(error);

throw error;


}

};
export const listarContratosService = async()=>{

return await prisma.contrato.findMany({

include:{
empleado:true
},

orderBy:{
createdAt:"desc"
}

});


};



export const crearContratoService = async(data:any)=>{


return await prisma.contrato.create({

data:{


empleadoId:Number(data.empleadoId),

tipo:data.tipo,


fechaInicio:new Date(data.fechaInicio),


fechaFin:data.fechaFin 
? new Date(data.fechaFin)
:null,


salario:data.salario
? Number(data.salario)
:null,


descripcion:data.descripcion,


estado:data.estado


}

});


};

// ===============================
// CAPACITACIONES
// ===============================


export const listarCapacitacionesService = async()=>{

return await prisma.capacitacion.findMany({

include:{

empleados:{
include:{
empleado:true
}
}

},

orderBy:{
createdAt:"desc"
}

});


};

export const crearCapacitacionService = async(data:any)=>{


const capacitacion = await prisma.capacitacion.create({

data:{


nombre:data.nombre,


fecha:new Date(data.fecha),


hora:data.hora,


duracion:data.duracion
? Number(data.duracion)
:null,


institucion:data.institucion,


estado:data.estado,


descripcion:data.descripcion,


// AQUÍ CAMBIA
evidencia:data.evidencia || null,



empleados:{

create:

data.empleados.map((id:number)=>({

empleado:{
connect:{
id:Number(id)
}
}

}))

}

}
});
return capacitacion;
};

type EventoCalendario = {
    id: string;
    tipo: "CUMPLEAÑOS" | "CAPACITACION" | "CONTRATO";
    titulo: string;
    fecha: Date;
    detalle: string;
};

export const listarCalendarioService = async () => {

    const empleados = await prisma.empleado.findMany();

    const capacitaciones = await prisma.capacitacion.findMany({
        include: {
            empleados: {
                include: {
                    empleado: true
                }
            }
        }
    });

    const contratos = await prisma.contrato.findMany({
        include: {
            empleado: true
        }
    });

    const eventos: EventoCalendario[] = [];

    // Cumpleaños
    empleados.forEach(emp=>{

        eventos.push({

            id:`cumple-${emp.id}`,

            tipo:"CUMPLEAÑOS",

            titulo:`${emp.nombres} ${emp.apellidos}`,

            fecha:emp.fechaNacimiento,

            detalle:"Cumpleaños"

        });

    });

    // Capacitaciones
    capacitaciones.forEach(cap=>{

        eventos.push({

            id:`cap-${cap.id}`,

            tipo:"CAPACITACION",

            titulo:cap.nombre,

            fecha:cap.fecha,

            detalle:`${cap.empleados.length} participantes - ${cap.duracion} horas`

        });

    });

    // Contratos
    contratos.forEach(con=>{

        if(!con.fechaFin) return;

        eventos.push({

            id:`contrato-${con.id}`,

            tipo:"CONTRATO",

            titulo:`${con.empleado.nombres} ${con.empleado.apellidos}`,

            fecha:con.fechaFin,

            detalle:`Contrato vence`

        });

    });

    return eventos;

};
export const listarSSOMAService = async()=>{

return await prisma.sSOMA.findMany({

include:{
empleado:true
}

});

};


export const actualizarSSOMAService = async(
empleadoId:number,
data:any
)=>{


return await prisma.sSOMA.upsert({

where:{
empleadoId
},

update:{

emoInicio:data.emoInicio
? new Date(data.emoInicio)
:null,

emoFin:data.emoFin
? new Date(data.emoFin)
:null,


alturaInicio:data.alturaInicio
? new Date(data.alturaInicio)
:null,

alturaFin:data.alturaFin
? new Date(data.alturaFin)
:null,


sstInicio:data.sstInicio
? new Date(data.sstInicio)
:null,

sstFin:data.sstFin
? new Date(data.sstFin)
:null,


patrimonialInicio:data.patrimonialInicio
? new Date(data.patrimonialInicio)
:null,

patrimonialFin:data.patrimonialFin
? new Date(data.patrimonialFin)
:null

},


create:{

empleadoId,

emoInicio:data.emoInicio
? new Date(data.emoInicio)
:null,

emoFin:data.emoFin
? new Date(data.emoFin)
:null,

alturaInicio:data.alturaInicio
? new Date(data.alturaInicio)
:null,

alturaFin:data.alturaFin
? new Date(data.alturaFin)
:null,

sstInicio:data.sstInicio
? new Date(data.sstInicio)
:null,

sstFin:data.sstFin
? new Date(data.sstFin)
:null,


patrimonialInicio:data.patrimonialInicio
? new Date(data.patrimonialInicio)
:null,

patrimonialFin:data.patrimonialFin
? new Date(data.patrimonialFin)
:null

}

});


};

// obtener configuración
export const obtenerConfiguracionService = async()=>{

    let configuracion = await prisma.configuracion.findUnique({
        where:{
            id:1
        }
    });


    // si no existe crear una vacía
    if(!configuracion){

        configuracion = await prisma.configuracion.create({

            data:{
                id:1,
                empresa:"",
                correo:"",
                telegramToken:"",
                chatId:"",
                diasContrato:30,
                diasCapacitacion:30
            }

        });

    }


    return configuracion;

};




// actualizar configuración
export const actualizarConfiguracionService = async(data:any)=>{


return await prisma.configuracion.upsert({

where:{
    id:1
},

update:{


empresa:data.empresa,

correo:data.correo,

telegramToken:data.telegramToken || null,

chatId:data.chatId || null,


diasContrato:Number(data.diasContrato),

diasCapacitacion:Number(data.diasCapacitacion)


},


create:{


id:1,

empresa:data.empresa,

correo:data.correo,

telegramToken:data.telegramToken || null,

chatId:data.chatId || null,

diasContrato:Number(data.diasContrato),

diasCapacitacion:Number(data.diasCapacitacion)


}


});


};

