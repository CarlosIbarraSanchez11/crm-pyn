import { Router } from "express";

import {
login,
listarUsuarios,
} from "./auth.controller";


const router = Router();

router.post("/login", login);

router.get("/usuarios", listarUsuarios);

export default router;