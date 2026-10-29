import { Router } from "express";
import { 
  obtenerMetricasDashboard, 
  crearCurso, 
  actualizarCurso, 
  obtenerTransacciones 
} from "../controllers/admin.controller.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas de administración están protegidas por token y rol de Administrador (RF-04)
router.use(verificarToken, soloAdmin);

router.get("/dashboard", obtenerMetricasDashboard);
router.post("/cursos", crearCurso);
router.put("/cursos/:id", actualizarCurso);
router.get("/transacciones", obtenerTransacciones);

export default router;
