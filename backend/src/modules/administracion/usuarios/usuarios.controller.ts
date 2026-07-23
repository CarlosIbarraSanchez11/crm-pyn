import { Request, Response } from "express";
import * as usuariosService from "./usuarios.service";

export const listar = async (req: Request, res: Response) => {
    try {
        const usuarios = await usuariosService.obtenerUsuarios();
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al listar los usuarios" });
    }
};

export const crear = async (req: Request, res: Response) => {
    try {
        const nuevoUsuario = await usuariosService.crearUsuario(req.body);
        res.status(201).json({ 
            message: "Usuario creado exitosamente", 
            usuario: nuevoUsuario 
        });
    } catch (error: any) {
        if (error.message === "CORREO_EXISTE") {
            return res.status(400).json({ message: "El correo ya está registrado en el sistema." });
        }
        console.error(error);
        res.status(500).json({ message: "Error interno al crear el usuario" });
    }
};

export const actualizar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const usuarioActualizado = await usuariosService.actualizarUsuario(Number(id), req.body);
        
        res.json({ 
            message: "Usuario actualizado exitosamente", 
            usuario: usuarioActualizado 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar el usuario" });
    }
};

export const cambiarEstado = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // Recibimos el estado actual del frontend
        
        await usuariosService.cambiarEstadoUsuario(Number(id), estado);
        
        res.json({ 
            message: `Usuario ${estado ? 'inhabilitado' : 'habilitado'} correctamente` 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al cambiar el estado del usuario" });
    }
};