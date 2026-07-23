import { prisma } from "../../../config/prisma";

export const obtenerUsuarios = async () => {
    // Incluimos las relaciones para que el frontend pueda mostrar el nombre de la Sede o Contrata
    return await prisma.user.findMany({
        include: {
            sede: true,
            contrata: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

export const crearUsuario = async (data: any) => {
    // Validar si el correo ya existe
    const existe = await prisma.user.findUnique({
        where: { correo: data.correo }
    });

    if (existe) {
        throw new Error("CORREO_EXISTE");
    }

    return await prisma.user.create({
        data: {
            nombre: data.nombre,
            correo: data.correo,
            password: data.password, // En producción se recomienda usar bcrypt.hashSync(data.password, 10)
            rol: data.rol,
            modulo: data.modulo,
            estado: true,
            sedeId: data.sedeId ? Number(data.sedeId) : null,
            contrataId: data.contrataId ? Number(data.contrataId) : null,
        }
    });
};

export const actualizarUsuario = async (id: number, data: any) => {
    // Preparamos los datos a actualizar
    const updateData: any = {
        nombre: data.nombre,
        correo: data.correo,
        rol: data.rol,
        modulo: data.modulo,
        sedeId: data.sedeId ? Number(data.sedeId) : null,
        contrataId: data.contrataId ? Number(data.contrataId) : null,
    };

    // Si el frontend envía una contraseña y no está vacía, la actualizamos
    // Si viene vacía, no la tocamos (así funciona la edición opcional de clave)
    if (data.password && data.password.trim() !== '') {
        updateData.password = data.password;
    }

    return await prisma.user.update({
        where: { id },
        data: updateData
    });
};

export const cambiarEstadoUsuario = async (id: number, estadoActual: boolean) => {
    // Si el estado actual es true, lo pasamos a false, y viceversa
    return await prisma.user.update({
        where: { id },
        data: {
            estado: !estadoActual 
        }
    });
};