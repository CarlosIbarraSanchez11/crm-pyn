import { Request, Response } from "express";
import * as service from "./activos.service";

// Registrar equipo manualmente
export const createActivo = async (req: Request, res: Response) => {
    try {
        const { sistema, dispositivo, marca, modelo, serie, lote, ambienteId } = req.body;

        if (!sistema || !dispositivo || !ambienteId) {
            return res.status(400).json({ message: "Los campos Sistema, Dispositivo y Ambiente son obligatorios" });
        }

        const nuevo = await service.crearActivoService({
            sistema,
            dispositivo,
            marca: marca || "S/M",
            modelo: modelo || "S/M",
            serie,
            lote,
            ambienteId: Number(ambienteId)
        });

        res.status(201).json(nuevo);
    } catch (error: any) {
        console.error("Error al crear activo manualmente:", error);
        res.status(500).json({ message: "Error interno al crear el activo", detalle: error.message });
    }
};

// Listar todos los activos registrados
export const getActivos = async (req: Request, res: Response) => {
    try {
        const activos = await service.obtenerActivosService();
        res.json(activos);
    } catch (error: any) {
        console.error("Error al listar los activos:", error);
        res.status(500).json({ message: "Error al listar el inventario" });
    }
};

// Procesar el Excel subido por el cliente
export const importarActivosExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se proporcionó ningún archivo Excel (.xlsx)" });
        }

        const insertados = await service.importarActivosExcelService(req.file.buffer);
        res.json({ message: "Importación masiva completada con éxito", insertados });
    } catch (error: any) {
        console.error("Error en la importación masiva de activos:", error);
        res.status(500).json({ message: "Error al procesar el archivo Excel de activos", detalle: error.message });
    }
};