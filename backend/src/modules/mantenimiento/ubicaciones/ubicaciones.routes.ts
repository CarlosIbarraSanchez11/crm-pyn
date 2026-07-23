import { Router } from "express";
import multer from "multer";
import {
    importarExcelUbicaciones,
    getZonales,
    getSedes,
    getPabellones,
    getPisos,
    getAmbientes,
    createZonal,
    createSede,
    createPabellon,
    createPiso,
    createAmbiente
} from "./ubicaciones.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Ruta mágica para procesar el Excel plano
router.post("/importar", upload.single('excel'), importarExcelUbicaciones);

// Rutas para poblar las 5 pestañas del frontend
router.get("/zonales", getZonales);
router.get("/sedes", getSedes);
router.get("/pabellones", getPabellones);
router.get("/pisos", getPisos);
router.get("/ambientes", getAmbientes);
router.post("/zonales", createZonal);
router.post("/sedes", createSede);
router.post("/pabellones", createPabellon);
router.post("/pisos", createPiso);
router.post("/ambientes", createAmbiente);

export default router;