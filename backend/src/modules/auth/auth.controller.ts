import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import {
listarUsuariosService,

} from "./auth.service";


export const login = async (
    req: Request,
    res: Response
) => {

    try{

        const {
            correo,
            password,
            modulo
        } = req.body;

        const user = await prisma.user.findFirst({

            where:{
                correo,
                password
            },
            include: {
                sede: true
            }

        });

        if(!user){

            return res.status(401).json({
                message:"Credenciales incorrectas"
            });

        }

        if(user.modulo.toUpperCase() !== modulo.toUpperCase()){

            return res.status(403).json({
                message:"No tienes acceso a este módulo"
            });

        }

        return res.json({

            id:user.id,
            nombre:user.nombre,
            correo:user.correo,
            rol:user.rol,
            modulo:user.modulo,
            sedeId:user.sedeId,
            sede:user.sede

        });

    }catch(error){

        console.log(error);

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

        res.status(500).json({
            message:"Error listando usuarios"
        });

    }

};