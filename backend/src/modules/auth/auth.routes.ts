import { Router } from "express";

import {
login,
listarUsuarios,
obtenerPermisosUsuario,
actualizarPermisosUsuario,
listarPermisos
} from "./auth.controller";


const router = Router();



router.post(
"/login",
login
);



router.get(
"/usuarios",
listarUsuarios
);



router.get(
"/usuarios/:id/permisos",
obtenerPermisosUsuario
);



router.put(
"/usuarios/:id/permisos",
actualizarPermisosUsuario
);

router.get(
"/permisos",
listarPermisos
);

export default router;