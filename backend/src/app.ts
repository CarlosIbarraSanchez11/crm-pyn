import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./modules/auth/auth.routes";
import rrhhRoutes from "./modules/rrhh/rrhh.routes";


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
app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
  
);export default app;