import { Router } from "express";
import { listar, crear, actualizar, cambiarEstado } from "./usuarios.controller";

const router = Router();

// Rutas base: /api/usuarios
router.get("/", listar);
router.post("/", crear);
router.put("/:id", actualizar);
router.patch("/:id/estado", cambiarEstado); // Usamos PATCH porque solo modificamos 1 campo

export default router;