import { prisma } from "../../../config/prisma";
import { enviarNotificacionContrata, enviarNotificacionJM } from "../../../utils/mailer";

export const registrarIncidencia = async (data: any, usuarioId: number) => {
    // 1. Generar código único
    const codigoTicket = `INC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

    // 2. Guardar en la base de datos
    const nuevaIncidencia = await prisma.incidencia.create({
        data: {
            codigo: codigoTicket,
            descripcion: data.descripcion || null,
            
            // Relaciones de Ubicación
            sedeId: Number(data.sedeId),
            pabellonId: Number(data.pabellonId),
            pisoId: Number(data.pisoId),
            ambienteId: Number(data.ambienteId),
            
            // Datos del equipo
            sistema: data.sistema,
            dispositivo: data.dispositivo,
            marca: data.marca || null,
            modelo: data.modelo || null,
            
            // Si mandan foto
            fotoUrl: data.fotoUrl || null,
            
            // Auditoría
            creadoPorId: usuarioId
        }
    });

    // ==========================================
    // 3. LÓGICA DE NOTIFICACIÓN AUTOMÁTICA
    // ==========================================
    try {
        // Buscar el nombre del ST que creó la incidencia
        const creador = await prisma.user.findUnique({
            where: { id: usuarioId },
            select: { nombre: true }
        });
        const nombreST = creador?.nombre || "Supervisor de Tienda";

        // Buscar al Jefe de Mantenimiento (JM) activo
        const jefeMantenimiento = await prisma.user.findFirst({
            where: { 
                rol: 'JM',
                estado: true // Solo buscar si está activo
            }
        });

        // Si existe un JM con correo, disparamos la notificación
        if (jefeMantenimiento && jefeMantenimiento.correo) {
            // Nota: NO usamos 'await' aquí para que el correo se envíe en segundo plano
            // y no haga esperar a la respuesta del Frontend.
            enviarNotificacionJM(jefeMantenimiento.correo, nuevaIncidencia, nombreST);
        }
    } catch (error) {
        // Solo lo mostramos en consola para que un fallo en el correo 
        // no haga fallar todo el registro de la incidencia.
        console.error("Error intentando notificar al JM:", error);
    }

    return nuevaIncidencia;
};

export const listarIncidenciasPorEstado = async (estado?: string) => {
    const where = estado ? { estado } : {};
    return await prisma.incidencia.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { contrata: true } // <--- ESTO ES VITAL PARA EL FRONTEND
    });
};

// 3. ASIGNAR CONTRATA Y (OPCIONALMENTE) CREAR PROYECTO
export const asignarContrataService = async (incidenciaId: number, contrataId: number, estado: string, presupuestoEstimado?: number) => {
    const incidencia = await prisma.incidencia.findUnique({ where: { id: incidenciaId } });
    const contrata = await prisma.contrata.findUnique({ where: { id: contrataId } });

    if (!incidencia || !contrata) {
        throw new Error("Incidencia o Contrata no encontrada");
    }

    const year = new Date().getFullYear();

    // -- A. Calcular SOL-YYYY-XXX --
    const prefijoSol = `SOL-${year}-`;
    const ultimoSol = await prisma.proyecto.findFirst({
        where: { numeroSolicitante: { startsWith: prefijoSol } },
        orderBy: { id: 'desc' }
    });
    let corrSol = 1;
    if (ultimoSol?.numeroSolicitante) {
        const partes = ultimoSol.numeroSolicitante.split('-');
        if (partes[2]) corrSol = parseInt(partes[2], 10) + 1;
    }
    const numeroSolicitante = `${prefijoSol}${String(corrSol).padStart(3, '0')}`;

    // -- B. Calcular PI-XXXX (Proyecto Interno) --
    const prefijoPi = `PI-`;
    const ultimoPi = await prisma.proyecto.findFirst({
        where: { numeroProyectoInterno: { startsWith: prefijoPi } },
        orderBy: { id: 'desc' }
    });
    let corrPi = 1;
    if (ultimoPi?.numeroProyectoInterno) {
        const partes = ultimoPi.numeroProyectoInterno.split('-');
        if (partes[1]) corrPi = parseInt(partes[1], 10) + 1;
    }
    const numeroProyectoInterno = `${prefijoPi}${String(corrPi).padStart(4, '0')}`;

    // -- C. Calcular Número de Proyecto Cliente --
    const prefijoCli = `CLI-${year}-`;
    const ultimoCli = await prisma.proyecto.findFirst({
        where: { numeroProyectoCliente: { startsWith: prefijoCli } },
        orderBy: { id: 'desc' }
    });
    let corrCli = 1;
    if (ultimoCli?.numeroProyectoCliente) {
        const partes = ultimoCli.numeroProyectoCliente.split('-');
        if (partes[2]) corrCli = parseInt(partes[2], 10) + 1;
    }
    const numeroProyectoCliente = `${prefijoCli}${String(corrCli).padStart(3, '0')}`;

    // 🔥 CREAMOS EL PROYECTO PARA CUALQUIER CONTRATA
    const proyectoGenerado = await prisma.proyecto.create({
        data: {
            numeroSolicitante,
            numeroProyectoInterno,
            numeroProyectoCliente, 
            // Si es interno ponemos un texto, si es externo guardamos la Razón Social del tercero
            cliente: contrata.razonSocial === "P&P S.A.C" ? "Uso Interno - Mantenimiento" : contrata.razonSocial,
            nombreProyecto: `Reparación: ${incidencia.codigo}`, // Nos servirá para vincularlos visualmente
            tipoProyecto: "OPEX",
            ambienteId: incidencia.ambienteId,
            sistema: incidencia.sistema,
            dispositivo: incidencia.dispositivo,
            marca: incidencia.marca,
            modelo: incidencia.modelo,
            foto: incidencia.fotoUrl,
            presupuestoEstimado: presupuestoEstimado || 0,
            montoReferencial: 0.00,
            estado: "oportunidad", // Queda como oportunidad hasta que coticen
            descripcion: incidencia.descripcion
        }
    });

    // Actualizamos la incidencia conectándola a la contrata
    const incidenciaActualizada = await prisma.incidencia.update({
        where: { id: incidenciaId },
        data: { 
            estado,
            contrataId: contrata.id // Aseguramos que se guarde qué contrata la tiene
        } 
    });

    return { incidenciaActualizada, proyectoGenerado };
};

// export const subirCotizacionService = async (incidenciaId: number, precioReferencial: number, pdfUrl: string) => {
//     return await prisma.incidencia.update({
//         where: { id: incidenciaId },
//         data: {
//             // Nota: Asegúrate de que estos nombres coincidan con los de tu schema.prisma
//             montoReferencial: precioReferencial, 
//             archivoCotizacion: pdfUrl, 
//             estado: "COTIZACION_RECIBIDA" 
//         }
//     });
// };

export const subirCotizacionService = async (incidenciaId: number, precioReferencial: number, pdfUrl: string) => {
    // 1. Buscamos la incidencia para obtener su código
    const incidencia = await prisma.incidencia.findUnique({
        where: { id: incidenciaId }
    });

    if (!incidencia) throw new Error("Incidencia no encontrada");

    // 2. Actualizamos el estado de la incidencia para saber que ya cotizaron
    const incidenciaActualizada = await prisma.incidencia.update({
        where: { id: incidenciaId },
        data: { estado: "COTIZACION_RECIBIDA" }
    });

    // 3. Buscamos el proyecto asociado (usando el código de la incidencia) y lo actualizamos
    // Nota: findFirst se usa porque buscamos por nombre
    const proyecto = await prisma.proyecto.findFirst({
        where: { nombreProyecto: `Reparación: ${incidencia.codigo}` }
    });

    if (proyecto) {
        await prisma.proyecto.update({
            where: { id: proyecto.id },
            data: {
                montoReferencial: precioReferencial,
                archivoPdf: pdfUrl,
                // Opcional: Podrías cambiar el estado del proyecto aquí a algo como "evaluacion" 
                // o dejarlo en "oportunidad" según el flujo de tu empresa.
            }
        });
    }

    return incidenciaActualizada;
};

// Obtener detalles de la cotización para mostrar en el modal
export const obtenerDetalleCotizacionService = async (incidenciaId: number) => {
    const incidencia = await prisma.incidencia.findUnique({ 
        where: { id: incidenciaId }, 
        include: { contrata: true } 
    });
    if (!incidencia) throw new Error("Incidencia no encontrada");

    const proyecto = await prisma.proyecto.findFirst({
        where: { nombreProyecto: `Reparación: ${incidencia.codigo}` }
    });

    return { incidencia, proyecto };
};

// Procesar la Aprobación o Rechazo
export const evaluarCotizacionService = async (incidenciaId: number, accion: 'APROBAR' | 'RECHAZAR') => {
    const incidencia = await prisma.incidencia.findUnique({ where: { id: incidenciaId } });
    if (!incidencia) throw new Error("Incidencia no encontrada");

    const proyecto = await prisma.proyecto.findFirst({
        where: { nombreProyecto: `Reparación: ${incidencia.codigo}` }
    });

    if (accion === 'APROBAR') {
        // La incidencia pasa a estar en ejecución
        await prisma.incidencia.update({
            where: { id: incidenciaId },
            data: { estado: 'EN_EJECUCION' } 
        });
        
        if (proyecto) {
            await prisma.proyecto.update({
                where: { id: proyecto.id },
                data: { estado: 'ejecucion' } // ⚠️ Ajusta este estado según el enum de tu schema
            });
        }
    } else if (accion === 'RECHAZAR') {
        // Liberamos la incidencia para que se asigne a otra contrata
        await prisma.incidencia.update({
            where: { id: incidenciaId },
            data: { estado: 'PENDIENTE_JM', contrataId: null }
        });

        if (proyecto) {
            await prisma.proyecto.update({
                where: { id: proyecto.id },
                data: { estado: 'cancelado' } // ⚠️ Ajusta este estado (ej: 'cancelado', 'rechazado')
            });
        }
    }
    return { success: true };
};