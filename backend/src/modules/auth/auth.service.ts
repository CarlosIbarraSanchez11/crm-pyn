import { prisma } from "../../config/prisma";

export const listarUsuariosService = async () => {

    return prisma.user.findMany({

        select:{

            id:true,
            nombre:true,
            correo:true,
            rol:true,
            modulo:true

        }

    });

};