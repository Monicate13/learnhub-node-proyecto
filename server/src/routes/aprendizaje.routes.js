import { Router } from "express";
import { obtenerMiAprendizaje, actualizarProgresoLeccion } from "../controllers/aprendizaje.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas de aprendizaje requieren inicio de sesión
router.use(verificarToken);

router.get("/mi-aprendizaje", obtenerMiAprendizaje);
router.post("/progreso", actualizarProgresoLeccion);

export default router;
