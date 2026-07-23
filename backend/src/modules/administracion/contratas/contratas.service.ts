import { prisma } from "../../../config/prisma";

export const obtenerContratas = async () => {
    return await prisma.contrata.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
};

export const crearContrata = async (data: any) => {
    // Validar si el RUC ya existe
    const existe = await prisma.contrata.findUnique({
        where: { ruc: data.ruc }
    });

    if (existe) {
        throw new Error("RUC_EXISTE");
    }

    return await prisma.contrata.create({
        data: {
            ruc: data.ruc,
            razonSocial: data.razonSocial,
            contacto: data.contacto || null,
            telefono: data.telefono || null,
            correo: data.correo || null,       
            direccion: data.direccion || null, 
            estado: true
        }
    });
};

export const actualizarContrata = async (id: number, data: any) => {
    // Validar que si cambia el RUC, no choque con otra empresa
    if (data.ruc) {
        const existe = await prisma.contrata.findFirst({
            where: { 
                ruc: data.ruc,
                id: { not: id } // Que no sea la misma empresa que estamos editando
            }
        });
        if (existe) throw new Error("RUC_EXISTE");
    }

    return await prisma.contrata.update({
        where: { id },
        data: {
            ruc: data.ruc,
            razonSocial: data.razonSocial,
            contacto: data.contacto,
            telefono: data.telefono,
            correo: data.correo,       
            direccion: data.direccion  
        }
    });
};

export const cambiarEstadoContrata = async (id: number, estadoActual: boolean) => {
    return await prisma.contrata.update({
        where: { id },
        data: {
            estado: !estadoActual 
        }
    });
};