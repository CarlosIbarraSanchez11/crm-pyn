import { Request, Response } from "express";
import * as contratasService from "./contratas.service";

export const listar = async (req: Request, res: Response) => {
    try {
        const contratas = await contratasService.obtenerContratas();
        res.json(contratas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al listar las contratas" });
    }
};

export const crear = async (req: Request, res: Response) => {
    try {
        const nuevaContrata = await contratasService.crearContrata(req.body);
        res.status(201).json({ 
            message: "Contrata registrada exitosamente", 
            contrata: nuevaContrata 
        });
    } catch (error: any) {
        if (error.message === "RUC_EXISTE") {
            return res.status(400).json({ message: "Ya existe una empresa registrada con ese RUC." });
        }
        console.error(error);
        res.status(500).json({ message: "Error interno al crear la contrata" });
    }
};

export const actualizar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contrataActualizada = await contratasService.actualizarContrata(Number(id), req.body);
        
        res.json({ 
            message: "Contrata actualizada exitosamente", 
            contrata: contrataActualizada 
        });
    } catch (error: any) {
        if (error.message === "RUC_EXISTE") {
            return res.status(400).json({ message: "El RUC ingresado ya pertenece a otra empresa." });
        }
        console.error(error);
        res.status(500).json({ message: "Error al actualizar la contrata" });
    }
};

export const cambiarEstado = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        await contratasService.cambiarEstadoContrata(Number(id), estado);
        
        res.json({ 
            message: `Contrata ${estado ? 'inhabilitada' : 'habilitada'} correctamente` 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al cambiar el estado de la contrata" });
    }
};