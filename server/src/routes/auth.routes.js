import { Router } from "express";
import { 
  registro, 
  login, 
  perfil, 
  actualizarPerfil, 
  cambiarPassword 
} from "../controllers/auth.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas
router.post("/registro", registro);
router.post("/login", login);

// Rutas protegidas (requieren sesión activa)
router.get("/perfil", verificarToken, perfil);
router.put("/perfil", verificarToken, actualizarPerfil);
router.put("/cambiar-password", verificarToken, cambiarPassword);

export default router;
