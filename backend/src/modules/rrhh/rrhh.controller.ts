import { Request, Response } from "express";

import {
    listarEmpleadosService,
    crearEmpleadoService,
    listarContratosService,
crearContratoService,
listarCapacitacionesService,
crearCapacitacionService,
listarCalendarioService,
listarSSOMAService,
actualizarSSOMAService,
obtenerConfiguracionService,
actualizarConfiguracionService
} from "./rrhh.service";
export const listarEmpleados =
async(
req: Request,
res: Response
)=>{

try{

const data = await listarEmpleadosService();

res.json(data);

}catch(error){

console.log(error);

res.status(500).json({
message:"Error al listar empleados"
});

}

};

export const crearEmpleado =
async(
req: Request,
res: Response
)=>{

try{

console.log("BODY:");
console.log(req.body);


const archivo = (req as any).file;

console.log("FILE:");
console.log(archivo);



const empleado = await crearEmpleadoService({

    ...req.body,

    fotoPerfil:
    archivo
    ? `uploads/rrhh/registro/${archivo.filename}`
    : null

});


res.json({
    ok:true,
    empleado
});


}catch(error){

console.log(error);

res.status(500).json({
    message:"Error creando empleado"
});

}

};
export const listarContratos = async(
req: Request,
res: Response
)=>{

try{

const contratos =
await listarContratosService();

res.json(contratos);

}catch(error){

console.log(error);

res.status(500).json({
message:"Error al listar contratos"
});

}

};



export const crearContrato = async(
req: Request,
res: Response
)=>{

try{

const contrato =
await crearContratoService(req.body);

res.json(contrato);

}catch(error){

console.log(error);

res.status(500).json({
message:"Error creando contrato"
});

}

};

export const listarCapacitaciones = async(
req:Request,
res:Response
)=>{
try{
const data =
await listarCapacitacionesService();
res.json(data);
}catch(error){
console.log(error);
res.status(500).json({
message:"Error listando capacitaciones"
});

}
};

export const crearCapacitacion = async(
req:Request,
res:Response
)=>{

try{


console.log("BODY CAPACITACION:");
console.log(req.body);

const archivo = (req as any).file;

console.log("BODY:", req.body);
console.log("FILE:", archivo);

const data = await crearCapacitacionService({

    ...req.body,

    empleados: Array.isArray(req.body.empleados)
        ? req.body.empleados
        : [req.body.empleados],

    evidencia: archivo
        ? `uploads/rrhh/capacitaciones/${archivo.filename}`
        : null

});

res.json({
ok:true,
data
});
}catch(error){
console.log(error);
res.status(500).json({
message:"Error creando capacitación"
});

}
};
export const listarCalendario = async (
  req: Request,
  res: Response
) => {

  try {

    const data =
      await listarCalendarioService();

    res.json(data);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error al listar calendario"
    });

  }

};
export const listarSSOMA = async(
req:Request,
res:Response
)=>{

try{

const data = await listarSSOMAService();

res.json(data);

}catch(error){

console.log(error);

res.status(500).json({
message:"Error listando SSOMA"
});

}

};



export const actualizarSSOMA = async(
req:Request,
res:Response
)=>{


try{


const empleadoId = Number(req.params.id);


const data =
await actualizarSSOMAService(
empleadoId,
req.body
);


res.json(data);



}catch(error){

console.log(error);

res.status(500).json({
message:"Error actualizando SSOMA"
});

}


};
export const obtenerConfiguracion = async(
req:Request,
res:Response
)=>{

try{


const data =
await obtenerConfiguracionService();


res.json(data);


}catch(error){

console.log(error);

res.status(500).json({
message:"Error obteniendo configuración"
});


}

};




export const actualizarConfiguracion = async(
req:Request,
res:Response
)=>{


try{


const data =
await actualizarConfiguracionService(
req.body
);


res.json({

ok:true,
data

});


}catch(error){

console.log(error);

res.status(500).json({
message:"Error actualizando configuración"
});


}


};