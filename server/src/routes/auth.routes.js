import { Router } from "express";
import { registro, login, perfil } from "../controllers/auth.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas
router.post("/registro", registro);
router.post("/login", login);

// Rutas protegidas
router.get("/perfil", verificarToken, perfil);

export default router;
