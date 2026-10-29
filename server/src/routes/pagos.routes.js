import { Router } from "express";
import { obtenerPlanes, comprarCurso, suscribirPlan, cancelarMembresia } from "../controllers/pagos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Ver planes de membresía es público
router.get("/planes", obtenerPlanes);

// Las operaciones de compra y suscripción requieren usuario autenticado
router.post("/comprar", verificarToken, comprarCurso);
router.post("/suscribir", verificarToken, suscribirPlan);
router.put("/cancelar-membresia", verificarToken, cancelarMembresia);

export default router;
