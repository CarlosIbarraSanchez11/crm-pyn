import { Router } from "express";
import multer from "multer";
import { 
  obtenerProyectos, 
  crearProyecto, 
  actualizarEstadoProyecto, 
  obtenerSiguienteCodigo,
  cotizarProyecto
} from "./proyectos.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const cpUpload = upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'archivoPdf', maxCount: 1 }
]);

router.get("/siguiente-codigo", obtenerSiguienteCodigo);

router.get("/", obtenerProyectos);
router.post("/", cpUpload, crearProyecto);
router.put("/:id/estado", actualizarEstadoProyecto); 
router.patch("/:id/cotizar", cotizarProyecto);

export default router;