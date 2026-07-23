import { Router } from "express";
import multer from "multer";
import * as controller from "./activos.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Endpoints del módulo de Activos
router.get("/", controller.getActivos);
router.post("/", controller.createActivo);
router.post("/importar", upload.single("excel"), controller.importarActivosExcel);

export default router;