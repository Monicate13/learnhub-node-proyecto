import { pool } from "../config/db.js";

const formatearDuracion = (segundos) => {
  const s = Number(segundos) || 0;
  if (s <= 0) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
};

// Consulta base: curso + categoría + instructor + métricas calculadas desde MySQL
const SELECT_CURSO = `
  SELECT
    c.id_curso, c.id_categoria, c.titulo, c.descripcion, c.nivel, c.imagen_url,
    c.modelo_cobro, c.precio, c.estado_publicacion,
    COALESCE(cat.nombre, 'General') AS categoria_nombre,
    COALESCE(NULLIF(c.instructor, ''), CONCAT(u.nombre, ' ', u.apellido), 'Roberto Cruz') AS instructor,
    COALESCE(NULLIF(c.duracion, ''), '25h 0m') AS duracion,
    c.contenido_modulos,
    c.recursos,
    c.evaluacion_preguntas,
    COALESCE((SELECT ROUND(AVG(v.puntuacion), 1) FROM Valoracion v WHERE v.id_curso = c.id_curso), 5.0) AS valoracion,
    (SELECT COUNT(*) FROM Inscripcion i WHERE i.id_curso = c.id_curso) AS total_estudiantes,
    (SELECT COUNT(*) FROM Leccion l JOIN Modulo m ON m.id_modulo = l.id_modulo WHERE m.id_curso = c.id_curso) AS total_lecciones,
    (SELECT COALESCE(SUM(l.duracion_seg), 0) FROM Leccion l JOIN Modulo m ON m.id_modulo = l.id_modulo WHERE m.id_curso = c.id_curso) AS duracion_seg
  FROM Curso c
  LEFT JOIN Categoria cat ON cat.id_categoria = c.id_categoria
  LEFT JOIN Usuario u ON u.id_usuario = c.id_administrador
`;

const normalizarCurso = ({ duracion_seg, contenido_modulos, recursos, evaluacion_preguntas, ...c }) => {
  let modulos = [];
  if (contenido_modulos) {
    try {
      modulos = typeof contenido_modulos === 'string' ? JSON.parse(contenido_modulos) : contenido_modulos;
    } catch {
      modulos = [];
    }
  }

  let listaRecursos = [];
  if (recursos) {
    try {
      listaRecursos = typeof recursos === 'string' ? JSON.parse(recursos) : recursos;
    } catch {
      listaRecursos = [];
    }
  }

  let listaPreguntas = null;
  if (evaluacion_preguntas) {
    try {
      listaPreguntas = typeof evaluacion_preguntas === 'string' ? JSON.parse(evaluacion_preguntas) : evaluacion_preguntas;
    } catch {
      listaPreguntas = null;
    }
  }

  const duracionTexto = c.duracion || formatearDuracion(duracion_seg) || '25h 0m';
  const totalLec = Number(c.total_lecciones) > 0 
    ? Number(c.total_lecciones) 
    : (modulos.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 1);

  return {
    ...c,
    precio: Number(c.precio),
    valoracion: Number(c.valoracion),
    total_estudiantes: Number(c.total_estudiantes),
    total_lecciones: totalLec,
    duracion: duracionTexto,
    modules: modulos,
    recursos: listaRecursos,
    evaluacion_preguntas: listaPreguntas,
  };
};

// RF-05: Catálogo con búsqueda, filtros y ordenamiento (MySQL)
export const obtenerCursos = async (req, res) => {
  try {
    const { busqueda, categoria, nivel, modelo_cobro, ordenar, incluir_borradores } = req.query;

    const where = [];
    const params = [];

    if (incluir_borradores !== "true") {
      where.push("c.estado_publicacion = 'Publicado'");
    }

    if (busqueda) {
      const q = `%${busqueda}%`;
      where.push("(c.titulo LIKE ? OR c.descripcion LIKE ? OR CONCAT(u.nombre, ' ', u.apellido) LIKE ? OR c.instructor LIKE ?)");
      params.push(q, q, q, q);
    }
    if (categoria && categoria !== "Todos") {
      where.push("LOWER(cat.nombre) = LOWER(?)");
      params.push(categoria);
    }
    if (nivel) {
      where.push("LOWER(c.nivel) = LOWER(?)");
      params.push(nivel);
    }
    if (modelo_cobro) {
      where.push("(c.modelo_cobro = ? OR c.modelo_cobro = 'Ambos')");
      params.push(modelo_cobro);
    }

    let orden = "total_estudiantes DESC";
    if (ordenar === "valoracion") orden = "valoracion DESC";
    else if (ordenar === "precio_menor") orden = "c.precio ASC";
    else if (ordenar === "precio_mayor") orden = "c.precio DESC";

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `${SELECT_CURSO} ${whereSql} ORDER BY ${orden}`,
      params
    );

    const cursos = rows.map(normalizarCurso);
    res.json({ total: cursos.length, cursos });
  } catch (error) {
    console.error("Error en obtenerCursos:", error);
    res.status(500).json({ error: "Error al obtener el catálogo de cursos" });
  }
};

// RF-06: Detalle del curso con módulos y lecciones
export const obtenerCursoDetalle = async (req, res) => {
  try {
    const idCurso = parseInt(req.params.id);
    if (Number.isNaN(idCurso)) {
      return res.status(400).json({ error: "Id de curso inválido" });
    }

    const [cursos] = await pool.query(`${SELECT_CURSO} WHERE c.id_curso = ?`, [idCurso]);
    if (cursos.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    const [modulos] = await pool.query(
      "SELECT id_modulo, id_curso, titulo, orden FROM Modulo WHERE id_curso = ? ORDER BY orden",
      [idCurso]
    );
    const [lecciones] = await pool.query(
      `SELECT l.id_leccion, l.id_modulo, l.titulo, l.video_url, l.duracion_seg, l.orden
         FROM Leccion l JOIN Modulo m ON m.id_modulo = l.id_modulo
        WHERE m.id_curso = ? ORDER BY l.orden`,
      [idCurso]
    );

    const temario = modulos.map((m) => ({
      ...m,
      lecciones: lecciones.filter((l) => l.id_modulo === m.id_modulo),
    }));

    const cursoNorm = normalizarCurso(cursos[0]);
    if ((!cursoNorm.modules || cursoNorm.modules.length === 0) && temario.length > 0) {
      cursoNorm.modules = temario.map((m) => ({
        title: m.titulo,
        duration: "1h 30m",
        lessons: m.lecciones.map((l) => ({
          title: l.titulo,
          time: l.duracion_seg ? `${Math.floor(l.duracion_seg / 60)}:${String(l.duracion_seg % 60).padStart(2, '0')}` : "15:00",
          free: false,
        })),
      }));
    }

    res.json({ ...cursoNorm, temario });
  } catch (error) {
    console.error("Error en obtenerCursoDetalle:", error);
    res.status(500).json({ error: "Error al obtener el detalle del curso" });
  }
};

// Categorías para los filtros del catálogo
export const obtenerCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id_categoria, nombre FROM Categoria ORDER BY nombre");
    res.json(rows);
  } catch (error) {
    console.error("Error en obtenerCategorias:", error);
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
};

// =========================================================================
// FORO / PREGUNTAS Y RESPUESTAS DEL AULA VIRTUAL (Persistencia en MySQL)
// =========================================================================
export const obtenerForoCurso = async (req, res) => {
  try {
    const idCurso = parseInt(req.params.id);
    const [rows] = await pool.query(
      `SELECT id_pregunta, id_curso, id_usuario, nombre_usuario, rol_usuario, leccion, pregunta, respuestas, fecha
         FROM Foro_Pregunta
        WHERE id_curso = ?
        ORDER BY fecha DESC`,
      [idCurso]
    );

    const foro = rows.map((p) => {
      let rList = [];
      if (p.respuestas) {
        try {
          rList = typeof p.respuestas === 'string' ? JSON.parse(p.respuestas) : p.respuestas;
        } catch {
          rList = [];
        }
      }
      return {
        id: p.id_pregunta,
        user: p.nombre_usuario,
        role: p.rol_usuario,
        lesson: p.leccion,
        question: p.pregunta,
        date: p.fecha,
        replies: rList,
      };
    });

    res.json({ total: foro.length, preguntas: foro });
  } catch (error) {
    console.error("Error en obtenerForoCurso:", error);
    res.status(500).json({ error: "Error al consultar las preguntas del foro" });
  }
};

export const crearPreguntaForo = async (req, res) => {
  try {
    const idCurso = parseInt(req.params.id);
    const { leccion, pregunta } = req.body;

    if (!pregunta || !pregunta.trim()) {
      return res.status(400).json({ error: "El texto de la pregunta es obligatorio" });
    }

    const nombreUsuario = req.usuario.nombre ? `${req.usuario.nombre} ${req.usuario.apellido || ''}`.trim() : (req.usuario.correo || "Usuario");
    const rolUsuario = req.usuario.rol || (req.usuario.id_rol === 3 ? "Docente" : req.usuario.id_rol === 2 ? "Administrador" : "Estudiante");

    const [result] = await pool.query(
      `INSERT INTO Foro_Pregunta (id_curso, id_usuario, nombre_usuario, rol_usuario, leccion, pregunta, respuestas)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        idCurso,
        req.usuario.id_usuario,
        nombreUsuario,
        rolUsuario,
        leccion || "General",
        pregunta.trim(),
        JSON.stringify([]),
      ]
    );

    const nuevaPregunta = {
      id: result.insertId,
      user: nombreUsuario,
      role: rolUsuario,
      lesson: leccion || "General",
      question: pregunta.trim(),
      date: new Date().toISOString(),
      replies: [],
    };

    res.status(201).json({ mensaje: "Pregunta publicada en el foro", pregunta: nuevaPregunta });
  } catch (error) {
    console.error("Error en crearPreguntaForo:", error);
    res.status(500).json({ error: "Error al publicar la pregunta" });
  }
};

export const responderPreguntaForo = async (req, res) => {
  try {
    const idPregunta = parseInt(req.params.idPregunta);
    const { texto } = req.body;

    if (!texto || !texto.trim()) {
      return res.status(400).json({ error: "La respuesta no puede estar vacía" });
    }

    const [rows] = await pool.query(
      "SELECT id_pregunta, respuestas FROM Foro_Pregunta WHERE id_pregunta = ?",
      [idPregunta]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    let respuestas = [];
    if (rows[0].respuestas) {
      try {
        respuestas = typeof rows[0].respuestas === 'string' ? JSON.parse(rows[0].respuestas) : rows[0].respuestas;
      } catch {
        respuestas = [];
      }
    }

    const nombreUsuario = req.usuario.nombre ? `${req.usuario.nombre} ${req.usuario.apellido || ''}`.trim() : (req.usuario.correo || "Usuario");
    const rolUsuario = req.usuario.rol || (req.usuario.id_rol === 3 ? "Docente" : req.usuario.id_rol === 2 ? "Administrador" : "Estudiante");

    const nuevaRespuesta = {
      id: Date.now(),
      id_usuario: req.usuario.id_usuario,
      user: nombreUsuario,
      role: rolUsuario,
      text: texto.trim(),
      date: new Date().toISOString(),
      isInstructor: rolUsuario === "Docente" || rolUsuario === "Administrador",
    };

    respuestas.push(nuevaRespuesta);

    await pool.query(
      "UPDATE Foro_Pregunta SET respuestas = ? WHERE id_pregunta = ?",
      [JSON.stringify(respuestas), idPregunta]
    );

    res.json({ mensaje: "Respuesta agregada con éxito", respuesta: nuevaRespuesta, respuestas });
  } catch (error) {
    console.error("Error en responderPreguntaForo:", error);
    res.status(500).json({ error: "Error al registrar la respuesta" });
  }
};

export const eliminarPreguntaForo = async (req, res) => {
  try {
    const idPregunta = parseInt(req.params.idPregunta);
    const [rows] = await pool.query(
      "SELECT id_pregunta, id_usuario FROM Foro_Pregunta WHERE id_pregunta = ?",
      [idPregunta]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    const pregunta = rows[0];
    const esAdmin = req.usuario.id_rol === 2 || req.usuario.rol === "Administrador";
    const esAutor = Number(req.usuario.id_usuario) === Number(pregunta.id_usuario);

    if (!esAdmin && !esAutor) {
      return res.status(403).json({ error: "No tienes permisos para eliminar esta pregunta" });
    }

    await pool.query("DELETE FROM Foro_Pregunta WHERE id_pregunta = ?", [idPregunta]);
    res.json({ mensaje: "Pregunta eliminada correctamente del foro", id_pregunta: idPregunta });
  } catch (error) {
    console.error("Error en eliminarPreguntaForo:", error);
    res.status(500).json({ error: "Error al eliminar la pregunta del foro" });
  }
};

export const eliminarRespuestaForo = async (req, res) => {
  try {
    const idPregunta = parseInt(req.params.idPregunta);
    const idRespuesta = parseInt(req.params.idRespuesta);

    const [rows] = await pool.query(
      "SELECT id_pregunta, respuestas FROM Foro_Pregunta WHERE id_pregunta = ?",
      [idPregunta]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }

    let respuestas = [];
    if (rows[0].respuestas) {
      try {
        respuestas = typeof rows[0].respuestas === 'string' ? JSON.parse(rows[0].respuestas) : rows[0].respuestas;
      } catch {
        respuestas = [];
      }
    }

    const idx = respuestas.findIndex((r) => Number(r.id) === idRespuesta);
    if (idx === -1) {
      return res.status(404).json({ error: "Respuesta no encontrada" });
    }

    const rep = respuestas[idx];
    const esAdmin = req.usuario.id_rol === 2 || req.usuario.rol === "Administrador";
    const esAutor = Number(req.usuario.id_usuario) === Number(rep.id_usuario);

    if (!esAdmin && !esAutor) {
      return res.status(403).json({ error: "No tienes permisos para eliminar esta respuesta" });
    }

    respuestas.splice(idx, 1);

    await pool.query(
      "UPDATE Foro_Pregunta SET respuestas = ? WHERE id_pregunta = ?",
      [JSON.stringify(respuestas), idPregunta]
    );

    res.json({ mensaje: "Respuesta eliminada correctamente", respuestas });
  } catch (error) {
    console.error("Error en eliminarRespuestaForo:", error);
    res.status(500).json({ error: "Error al eliminar la respuesta" });
  }
};

// =========================================================================
// NOTAS PERSONALES DEL AULA VIRTUAL (Persistencia en MySQL)
// =========================================================================
export const obtenerNotasCurso = async (req, res) => {
  try {
    const idCurso = parseInt(req.params.id);
    const [rows] = await pool.query(
      `SELECT id_nota, id_curso, id_usuario, leccion, texto, tiempo, fecha
         FROM Nota_Estudiante
        WHERE id_curso = ? AND id_usuario = ?
        ORDER BY fecha DESC`,
      [idCurso, req.usuario.id_usuario]
    );

    res.json({ total: rows.length, notas: rows });
  } catch (error) {
    console.error("Error en obtenerNotasCurso:", error);
    res.status(500).json({ error: "Error al consultar las notas" });
  }
};

export const guardarNotaCurso = async (req, res) => {
  try {
    const idCurso = parseInt(req.params.id);
    const { leccion, texto, tiempo } = req.body;

    if (!texto || !texto.trim()) {
      return res.status(400).json({ error: "El contenido de la nota es obligatorio" });
    }

    const [result] = await pool.query(
      `INSERT INTO Nota_Estudiante (id_curso, id_usuario, leccion, texto, tiempo)
       VALUES (?, ?, ?, ?, ?)`,
      [idCurso, req.usuario.id_usuario, leccion || "General", texto.trim(), tiempo || "00:00"]
    );

    res.status(201).json({
      mensaje: "Nota guardada con éxito",
      nota: {
        id_nota: result.insertId,
        id_curso: idCurso,
        id_usuario: req.usuario.id_usuario,
        leccion: leccion || "General",
        texto: texto.trim(),
        tiempo: tiempo || "00:00",
        fecha: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error en guardarNotaCurso:", error);
    res.status(500).json({ error: "Error al guardar la nota" });
  }
};

export const actualizarNotaCurso = async (req, res) => {
  try {
    const idNota = parseInt(req.params.idNota);
    const { texto } = req.body;

    if (!texto || !texto.trim()) {
      return res.status(400).json({ error: "El contenido no puede estar vacío" });
    }

    const [result] = await pool.query(
      "UPDATE Nota_Estudiante SET texto = ? WHERE id_nota = ? AND id_usuario = ?",
      [texto.trim(), idNota, req.usuario.id_usuario]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nota no encontrada o no pertenece al usuario" });
    }

    res.json({ mensaje: "Nota actualizada con éxito" });
  } catch (error) {
    console.error("Error en actualizarNotaCurso:", error);
    res.status(500).json({ error: "Error al actualizar la nota" });
  }
};

export const eliminarNotaCurso = async (req, res) => {
  try {
    const idNota = parseInt(req.params.idNota);
    const [result] = await pool.query(
      "DELETE FROM Nota_Estudiante WHERE id_nota = ? AND id_usuario = ?",
      [idNota, req.usuario.id_usuario]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nota no encontrada" });
    }

    res.json({ mensaje: "Nota eliminada con éxito" });
  } catch (error) {
    console.error("Error en eliminarNotaCurso:", error);
    res.status(500).json({ error: "Error al eliminar la nota" });
  }
};

// =========================================================================
// RECURSOS Y DESCRIPCIÓN DIRECTA POR EL DOCENTE (Persistencia en MySQL)
// =========================================================================
export const actualizarRecursosCurso = async (req, res) => {
  try {
    const idCurso = parseInt(req.params.id);
    const { recursos } = req.body;

    const recursosJson = typeof recursos === 'string' ? recursos : JSON.stringify(recursos || []);
    await pool.query("UPDATE Curso SET recursos = ? WHERE id_curso = ?", [recursosJson, idCurso]);

    res.json({ mensaje: "Recursos del curso actualizados con éxito", recursos });
  } catch (error) {
    console.error("Error en actualizarRecursosCurso:", error);
    res.status(500).json({ error: "Error al actualizar recursos" });
  }
};

export const actualizarDescripcionCurso = async (req, res) => {
  try {
    const idCurso = parseInt(req.params.id);
    const { descripcion } = req.body;

    await pool.query("UPDATE Curso SET descripcion = ? WHERE id_curso = ?", [descripcion || "", idCurso]);
    res.json({ mensaje: "Descripción del curso actualizada con éxito", descripcion });
  } catch (error) {
    console.error("Error en actualizarDescripcionCurso:", error);
    res.status(500).json({ error: "Error al actualizar descripción" });
  }
};

// =========================================================================
// OBTENER DOCENTES (Para selector de instructor en creación de cursos)
// =========================================================================
export const obtenerDocentes = async (req, res) => {
  try {
    const [docentes] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, r.nombre_rol
       FROM Usuario u
       JOIN Rol r ON r.id_rol = u.id_rol
       WHERE u.id_rol = 3 OR u.id_rol = 2
       ORDER BY u.id_rol DESC, u.nombre ASC`
    );
    res.json({ docentes });
  } catch (error) {
    console.error("Error en obtenerDocentes:", error);
    res.status(500).json({ error: "Error al obtener lista de docentes" });
  }
};

// =========================================================================
// OBTENER ESTUDIANTES INSCRITOS EN EL CURSO (Para panel docente)
// =========================================================================
export const obtenerEstudiantesCurso = async (req, res) => {
  try {
    const idCurso = parseInt(req.params.id);
    const [estudiantes] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, i.fecha_inscripcion,
              COALESCE(i.porcentaje_avance, '0.00') AS porcentaje_avance, i.origen
       FROM Inscripcion i
       JOIN Usuario u ON u.id_usuario = i.id_usuario
       WHERE i.id_curso = ?
       ORDER BY i.fecha_inscripcion DESC`,
      [idCurso]
    );
    res.json({ id_curso: idCurso, total: estudiantes.length, estudiantes });
  } catch (error) {
    console.error("Error en obtenerEstudiantesCurso:", error);
    res.status(500).json({ error: "Error al obtener estudiantes del curso" });
  }
};