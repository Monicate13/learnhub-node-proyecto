import { Router } from "express";
import { 
  obtenerMetricasDashboard, 
  crearCurso, 
  actualizarCurso, 
  eliminarCurso,
  obtenerTransacciones,
  obtenerUsuariosAdmin,
  actualizarRolUsuario,
  actualizarMembresiaUsuario
} from "../controllers/admin.controller.js";
import { verificarToken, soloAdmin, soloAdminODocente } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas requieren token válido
router.use(verificarToken);

// Cursos: Administradores y Docentes pueden crear, actualizar y gestionar contenidos
router.post("/cursos", soloAdminODocente, crearCurso);
router.put("/cursos/:id", soloAdminODocente, actualizarCurso);
router.delete("/cursos/:id", soloAdminODocente, eliminarCurso);

// Métricas y Finanzas: Exclusivo para Administradores
router.get("/dashboard", soloAdmin, obtenerMetricasDashboard);
router.get("/transacciones", soloAdmin, obtenerTransacciones);

// Gestión de Usuarios y Roles: Exclusivo para Administradores
router.get("/usuarios", soloAdmin, obtenerUsuariosAdmin);
router.put("/usuarios/:id/rol", soloAdmin, actualizarRolUsuario);
router.put("/usuarios/:id/membresia", soloAdmin, actualizarMembresiaUsuario);

export default router;
