import { Request, Response } from "express";
import { prisma } from "../../../config/prisma";
import {
    importarExcelRelacionalService,
    obtenerZonalesService,
    obtenerSedesService,
    obtenerPabellonesService,
    obtenerPisosService,
    obtenerAmbientesService
} from "./ubicaciones.service";

const normalizarNombre = (str: string) => str.trim().replace(/\s+/g, ' ').toUpperCase();

export const importarExcelUbicaciones = async (req: Request, res: Response) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Sube un archivo Excel válido (.xlsx)" });

        const procesados = await importarExcelRelacionalService(req.file.buffer);
        res.json({ message: "Importación exitosa", lineasProcesadas: procesados });
    } catch (error: any) {
        console.error("Error importando Excel:", error);
        res.status(500).json({ message: "Error procesando el Excel", detalle: error.message });
    }
};

// 🆕 ZONAL (nuevo nivel raíz de la jerarquía)
export const createZonal = async (req: Request, res: Response) => {
    try {
        const nombreZonal = normalizarNombre(req.body.nombre);

        const existe = await prisma.zonal.findUnique({ where: { nombre: nombreZonal } });
        if (existe) {
            return res.status(400).json({ message: "Este zonal ya está registrado" });
        }

        const nuevo = await prisma.zonal.create({ data: { nombre: nombreZonal } });
        res.json(nuevo);
    } catch (e: any) {
        res.status(500).json({ error: "Error creando zonal", det: e.message });
    }
};

export const createSede = async (req: Request, res: Response) => {
    try {
        const nombreSede = normalizarNombre(req.body.nombre);
        const zonalId = Number(req.body.zonalId);

        if (!zonalId) {
            return res.status(400).json({ message: "Debe seleccionar un zonal" });
        }

        // 1. Validar duplicado dentro del mismo Zonal (ya NO es global)
        const existe = await prisma.sede.findUnique({
            where: { nombre_zonalId: { nombre: nombreSede, zonalId } }
        });
        if (existe) {
            return res.status(400).json({ message: "Esta sede ya está registrada en este zonal" });
        }

        const nueva = await prisma.sede.create({ data: { nombre: nombreSede, zonalId } });
        res.json(nueva);
    } catch (e: any) { 
        res.status(500).json({ error: "Error creando sede", det: e.message }); 
    }
};

export const createPabellon = async (req: Request, res: Response) => {
    try {
        const nombrePab = normalizarNombre(req.body.nombre);
        const sedeId = Number(req.body.sedeId);

        const existe = await prisma.pabellon.findUnique({
            where: { nombre_sedeId: { nombre: nombrePab, sedeId } }
        });
        if (existe) {
            return res.status(400).json({ message: "Este pabellón ya existe en esta sede" });
        }

        const nuevo = await prisma.pabellon.create({ data: { nombre: nombrePab, sedeId } });
        res.json(nuevo);
    } catch (e: any) { 
        res.status(500).json({ error: "Error creando pabellón", det: e.message }); 
    }
};

export const createPiso = async (req: Request, res: Response) => {
    try {
        const nombrePiso = normalizarNombre(req.body.nombre);
        const pabellonId = Number(req.body.pabellonId);

        const existe = await prisma.piso.findUnique({
            where: { nombre_pabellonId: { nombre: nombrePiso, pabellonId } }
        });
        if (existe) {
            return res.status(400).json({ message: "Este piso ya existe en este pabellón" });
        }

        const nuevo = await prisma.piso.create({ data: { nombre: nombrePiso, pabellonId } });
        res.json(nuevo);
    } catch (e: any) { 
        res.status(500).json({ error: "Error creando piso", det: e.message }); 
    }
};

export const createAmbiente = async (req: Request, res: Response) => {
    try {
        const nombreAmbiente = normalizarNombre(req.body.nombre);
        const pisoId = Number(req.body.pisoId);

        const existe = await prisma.ambiente.findUnique({
            where: { nombre_pisoId: { nombre: nombreAmbiente, pisoId } }
        });
        if (existe) {
            return res.status(400).json({ message: "Este ambiente ya existe en este piso" });
        }

        const nuevo = await prisma.ambiente.create({ data: { nombre: nombreAmbiente, pisoId } });
        res.json(nuevo);
    } catch (e: any) { 
        res.status(500).json({ error: "Error creando ambiente", det: e.message }); 
    }
};

export const getZonales    = async (req: Request, res: Response) => res.json(await obtenerZonalesService());
export const getSedes      = async (req: Request, res: Response) => res.json(await obtenerSedesService());
export const getPabellones = async (req: Request, res: Response) => res.json(await obtenerPabellonesService());
export const getPisos      = async (req: Request, res: Response) => res.json(await obtenerPisosService());
export const getAmbientes  = async (req: Request, res: Response) => res.json(await obtenerAmbientesService());