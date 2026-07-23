import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";
import rrhhRoutes from "./modules/rrhh/rrhh.routes";
import ubicacionRoutes from "./modules/mantenimiento/ubicaciones/ubicaciones.routes";
import activosRoutes from "./modules/mantenimiento/activos/activos.routes";
import usuariosRoutes from "./modules/administracion/usuarios/usuarios.routes";
import contratasRoutes from "./modules/administracion/contratas/contratas.routes";
import incidenciasRoutes from "./modules/mantenimiento/incidencias/incidencias.routes";
import proyectosRoutes from "./modules/proyecto/proyectos.routes";


const app = express();
/* ========================= */
/* CORS */
/* ========================= */

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoutes);
app.use("/rrhh", rrhhRoutes);
app.use("/ubicaciones", ubicacionRoutes);
app.use("/activos", activosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/contratas", contratasRoutes);
app.use("/incidencias", incidenciasRoutes);
app.use("/proyectos", proyectosRoutes);

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
  
);export default app;