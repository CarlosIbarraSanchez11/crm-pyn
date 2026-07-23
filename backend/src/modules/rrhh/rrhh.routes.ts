import {
Router
} from "express";
import { upload } from "../../config/multer";

import {
listarEmpleados,
crearEmpleado,
listarContratos,
crearContrato,
listarCapacitaciones,
crearCapacitacion,
listarCalendario,
listarSSOMA,
actualizarSSOMA,
obtenerConfiguracion,
actualizarConfiguracion,
subirEvidenciaCapacitacionController
} from "./rrhh.controller";

const router = Router();

router.get(
"/empleados",
listarEmpleados
);


router.post(
"/empleados",
 (req, res, next) => {
    console.log("🔥 PASO POR ROUTE");
    next();
  },
  upload.single("fotoPerfil"),
crearEmpleado
);

router.get("/contratos",listarContratos);
router.post("/contratos",crearContrato);
router.get(
"/capacitaciones",
listarCapacitaciones
);
router.post(
"/capacitaciones",
upload.single("evidencia"),
crearCapacitacion
);
router.get(
  "/calendario",
  listarCalendario
);
router.get(
"/ssoma",
listarSSOMA
);
router.put(
    "/capacitaciones/:id/evidencia",
    upload.single("evidencia"),
    subirEvidenciaCapacitacionController
);

router.put(
"/ssoma/:id",
actualizarSSOMA
);
router.get(
"/configuracion",
obtenerConfiguracion
);


router.put(
"/configuracion",
actualizarConfiguracion
);
export default router;