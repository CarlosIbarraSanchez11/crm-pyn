import { Router } from "express";
import { upload } from "../../config/multer";

import {
  marcarAsistencia,
  getAllAsistencias,
  dashboardAsistencia,
  listarEmpleadosBiometriaController,
  guardarBiometriaController,
  actualizarBiometriaController,
  eliminarBiometriaController,
  getAsistenciasEmpleado
} from "./asistencia.controller";

const router = Router();


/* ==========================
   BIOMETRÍA
========================== */

router.get(
  "/biometria",
  listarEmpleadosBiometriaController
);

router.post(
  "/empleados/biometria",
  upload.single("foto"),
  guardarBiometriaController
);


router.put(
  "/empleados/:id/biometria",
  upload.single("foto"),
  actualizarBiometriaController
);
router.delete(
  "/empleados/:id/biometria",
  eliminarBiometriaController
);
/* ==========================
   ASISTENCIA
========================== */

router.post(
  "/marcar",
  upload.single("foto"),
  marcarAsistencia
);

router.get(
  "/dashboard",
  dashboardAsistencia
);

router.get(
  "/empleados/:empleadoId",
  getAsistenciasEmpleado
);

router.get(
  "/",
  getAllAsistencias
);

export default router;