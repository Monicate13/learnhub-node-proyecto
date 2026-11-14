import { Router } from "express";
import { 
  obtenerCursos, 
  obtenerCursoDetalle, 
  obtenerCategorias,
  obtenerForoCurso,
  crearPreguntaForo,
  responderPreguntaForo,
  obtenerNotasCurso,
  guardarNotaCurso,
  actualizarNotaCurso,
  eliminarNotaCurso,
  actualizarRecursosCurso,
  actualizarDescripcionCurso,
  obtenerDocentes,
  obtenerEstudiantesCurso,
} from "../controllers/cursos.controller.js";
import { verificarToken, soloAdminODocente } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas del catálogo de cursos
router.get("/docentes", obtenerDocentes);
router.get("/", obtenerCursos);
router.get("/categorias", obtenerCategorias);
router.get("/:id", obtenerCursoDetalle);

// Lista de estudiantes inscritos en el curso (Panel Docente / Admin)
router.get("/:id/estudiantes", verificarToken, soloAdminODocente, obtenerEstudiantesCurso);

// Foro y Preguntas del Aula Virtual
router.get("/:id/foro", obtenerForoCurso);
router.post("/:id/foro", verificarToken, crearPreguntaForo);
router.post("/:id/foro/:idPregunta/responder", verificarToken, responderPreguntaForo);

// Notas Personales en el Aula Virtual
router.get("/:id/notas", verificarToken, obtenerNotasCurso);
router.post("/:id/notas", verificarToken, guardarNotaCurso);
router.put("/:id/notas/:idNota", verificarToken, actualizarNotaCurso);
router.delete("/:id/notas/:idNota", verificarToken, eliminarNotaCurso);

// Edición Directa de Recursos y Descripción por Docente / Admin
router.put("/:id/recursos", verificarToken, soloAdminODocente, actualizarRecursosCurso);
router.put("/:id/descripcion", verificarToken, soloAdminODocente, actualizarDescripcionCurso);

export default router;
