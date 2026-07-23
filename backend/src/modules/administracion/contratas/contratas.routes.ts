import { Router } from "express";
import { listar, crear, actualizar, cambiarEstado } from "./contratas.controller";

const router = Router();

router.get("/", listar);
router.post("/", crear);
router.put("/:id", actualizar);
router.patch("/:id/estado", cambiarEstado);

export default router;