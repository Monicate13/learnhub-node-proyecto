import { Router } from "express";
import { obtenerCursos, obtenerCursoDetalle, obtenerCategorias } from "../controllers/cursos.controller.js";

const router = Router();

// Rutas públicas del catálogo de cursos
router.get("/", obtenerCursos);
router.get("/categorias", obtenerCategorias);
router.get("/:id", obtenerCursoDetalle);

export default router;
