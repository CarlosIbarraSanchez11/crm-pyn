import { Request, Response } from "express";
import * as incidenciasService from "./incidencias.service";
import { asignarContrataService, subirCotizacionService, obtenerDetalleCotizacionService, evaluarCotizacionService} from "./incidencias.service";

export const crear = async (req: Request, res: Response) => {
    try {
        const { sedeId, pabellonId, pisoId, ambienteId, sistema, dispositivo } = req.body;

        // Validaciones de campos obligatorios para el ST
        if (!sedeId || !pabellonId || !pisoId || !ambienteId || !sistema || !dispositivo) {
            return res.status(400).json({ 
                message: "Faltan datos obligatorios. Verifique ubicación, sistema y dispositivo." 
            });
        }

        // 🔥 AQUÍ ESTÁ EL CAMBIO: (req as any).file
        const fotoUrl = (req as any).file ? `/uploads/mantenimiento/incidencias/${(req as any).file.filename}` : null;
        
        // Unir los datos del body con la url de la foto
        const datosConFoto = {
            ...req.body,
            fotoUrl
        };

        // Asumimos que tienes el ID del usuario (ST) en req.user por tu middleware de autenticación
        const usuarioId = (req as any).user?.id || 1;

        // Mandamos el objeto 'datosConFoto' al servicio en vez de solo 'req.body'
        const nuevaIncidencia = await incidenciasService.registrarIncidencia(datosConFoto, usuarioId);

        res.status(201).json({
            message: "Incidencia reportada correctamente y JM notificado",
            incidencia: nuevaIncidencia
        });
    } catch (error: any) {
        console.error("Error al reportar incidencia:", error);
        res.status(500).json({ 
            message: "Error interno al crear la incidencia", 
            detalle: error.message 
        });
    }
};

export const listar = async (req: Request, res: Response) => {
    try {
        // Puede recibir ?estado=PENDIENTE_JM por query params
        const estado = req.query.estado as string; 
        const incidencias = await incidenciasService.listarIncidenciasPorEstado(estado);
        
        res.json(incidencias);
    } catch (error: any) {
        console.error("Error al listar incidencias:", error);
        res.status(500).json({ message: "Error interno al obtener las incidencias" });
    }
};

export const asignarContrataAIncidencia = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { contrataId, estado, presupuestoEstimado } = req.body;

        if (!contrataId || !estado) {
            res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
            return;
        }

        // 🔥 AQUÍ ESTÁ EL CAMBIO: Debes pasar el Number(presupuestoEstimado) al final
        const resultado = await asignarContrataService(
            Number(id), 
            Number(contrataId), 
            estado, 
            Number(presupuestoEstimado)
        );

        res.status(200).json({ 
            success: true, 
            message: resultado.proyectoGenerado ? "Asignado y Proyecto Creado" : "Derivado exitosamente",
            data: resultado
        });
    } catch (error: any) {
        console.error("Error en asignación:", error.message);
        if (error.message === "Incidencia o Contrata no encontrada") {
            res.status(404).json({ success: false, error: error.message });
        } else {
            res.status(500).json({ success: false, error: "Error interno del servidor" });
        }
    }
};

export const subirCotizacion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { precioReferencial } = req.body;

        // Extraemos la ruta del PDF guardado por Multer, usando (req as any) para evitar errores de TypeScript
        const pdfUrl = (req as any).file 
            ? `/uploads/mantenimiento/cotizaciones/${(req as any).file.filename}` 
            : null;

        // Validamos que vengan ambos datos obligatorios
        if (!precioReferencial || !pdfUrl) {
            res.status(400).json({ 
                success: false, 
                message: "Faltan el precio referencial o el archivo PDF" 
            });
            return;
        }

        // Llamamos al servicio para actualizar en la BD
        const incidenciaActualizada = await subirCotizacionService(
            Number(id), 
            Number(precioReferencial), 
            pdfUrl
        );

        res.status(200).json({
            success: true,
            message: "Cotización subida exitosamente",
            data: incidenciaActualizada
        });
    } catch (error: any) {
        console.error("Error al subir cotización:", error);
        res.status(500).json({ 
            success: false, 
            error: "Error interno del servidor", 
            detalle: error.message 
        });
    }
};

export const obtenerCotizacion = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await obtenerDetalleCotizacionService(Number(req.params.id));
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const evaluarCotizacion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { accion } = req.body;
        await evaluarCotizacionService(Number(req.params.id), accion);
        res.json({ success: true, message: `Cotización ${accion === 'APROBAR' ? 'aprobada' : 'rechazada'} correctamente.` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};