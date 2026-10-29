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
    cat.nombre AS categoria_nombre,
    CONCAT(u.nombre, ' ', u.apellido) AS instructor,
    COALESCE((SELECT ROUND(AVG(v.puntuacion), 1) FROM Valoracion v WHERE v.id_curso = c.id_curso), 5.0) AS valoracion,
    (SELECT COUNT(*) FROM Inscripcion i WHERE i.id_curso = c.id_curso) AS total_estudiantes,
    (SELECT COUNT(*) FROM Leccion l JOIN Modulo m ON m.id_modulo = l.id_modulo WHERE m.id_curso = c.id_curso) AS total_lecciones,
    (SELECT COALESCE(SUM(l.duracion_seg), 0) FROM Leccion l JOIN Modulo m ON m.id_modulo = l.id_modulo WHERE m.id_curso = c.id_curso) AS duracion_seg
  FROM Curso c
  JOIN Categoria cat ON cat.id_categoria = c.id_categoria
  JOIN Usuario u ON u.id_usuario = c.id_administrador
`;

const normalizarCurso = ({ duracion_seg, ...c }) => ({
  ...c,
  precio: Number(c.precio),
  valoracion: Number(c.valoracion),
  total_estudiantes: Number(c.total_estudiantes),
  total_lecciones: Number(c.total_lecciones),
  duracion: formatearDuracion(duracion_seg),
});

// RF-05: Catálogo con búsqueda, filtros y ordenamiento (MySQL)
export const obtenerCursos = async (req, res) => {
  try {
    const { busqueda, categoria, nivel, modelo_cobro, ordenar } = req.query;

    const where = ["c.estado_publicacion = 'Publicado'"];
    const params = [];

    if (busqueda) {
      const q = `%${busqueda}%`;
      where.push("(c.titulo LIKE ? OR c.descripcion LIKE ? OR CONCAT(u.nombre, ' ', u.apellido) LIKE ?)");
      params.push(q, q, q);
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

    const [rows] = await pool.query(
      `${SELECT_CURSO} WHERE ${where.join(" AND ")} ORDER BY ${orden}`,
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

    res.json({ ...normalizarCurso(cursos[0]), temario });
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