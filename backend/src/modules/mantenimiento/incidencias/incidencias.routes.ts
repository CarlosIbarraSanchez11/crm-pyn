import { Router } from "express";
// 🔥 1. Asegúrate de importar 'subirCotizacion' aquí
import { crear, listar, asignarContrataAIncidencia, subirCotizacion, evaluarCotizacion, obtenerCotizacion } from "./incidencias.controller";
import { upload } from "../../../config/multer";

const router = Router();

router.post("/", upload.single('foto'), crear);
router.get("/", listar);
router.patch("/:id/asignar", asignarContrataAIncidencia);
router.patch("/:id/cotizacion", upload.single('pdfCotizacion'), subirCotizacion);
router.get("/:id/cotizacion", obtenerCotizacion);
router.patch("/:id/evaluar", evaluarCotizacion);

export default router;