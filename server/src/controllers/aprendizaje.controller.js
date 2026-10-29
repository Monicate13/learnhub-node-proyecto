import { pool } from "../config/db.js";

// Días consecutivos de estudio (hasta hoy o ayer), a partir de fechas 'YYYY-MM-DD' en orden descendente
const calcularRacha = (dias) => {
  if (dias.length === 0) return 0;
  const aMs = (d) => new Date(`${d}T00:00:00Z`).getTime();
  const DIA = 24 * 60 * 60 * 1000;
  const hoy = aMs(new Date().toISOString().slice(0, 10));

  if (hoy - aMs(dias[0]) > DIA) return 0; // última actividad hace más de 1 día

  let racha = 1;
  for (let i = 1; i < dias.length; i++) {
    if (aMs(dias[i - 1]) - aMs(dias[i]) === DIA) racha++;
    else break;
  }
  return racha;
};

// RF-16: Panel "Mi aprendizaje" (cursos inscritos, avance y membresía) desde MySQL
export const obtenerMiAprendizaje = async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario;

    const [inscripciones] = await pool.query(
      `SELECT
         i.id_inscripcion, i.id_curso, i.origen, i.porcentaje_avance,
         c.titulo, c.imagen_url, cat.nombre AS categoria,
         (SELECT l.titulo
            FROM Progreso_Leccion p JOIN Leccion l ON l.id_leccion = p.id_leccion
           WHERE p.id_inscripcion = i.id_inscripcion
           ORDER BY p.fecha_actualizacion DESC LIMIT 1) AS ultima_leccion
       FROM Inscripcion i
       JOIN Curso c ON c.id_curso = i.id_curso
       JOIN Categoria cat ON cat.id_categoria = c.id_categoria
       WHERE i.id_usuario = ?
       ORDER BY i.fecha_inscripcion DESC`,
      [idUsuario]
    );

    const misInscripciones = inscripciones.map((i) => ({
      id_inscripcion: i.id_inscripcion,
      id_curso: i.id_curso,
      titulo: i.titulo,
      categoria: i.categoria,
      imagen_url: i.imagen_url,
      porcentaje_avance: Number(i.porcentaje_avance),
      origen: i.origen,
      ultima_leccion: i.ultima_leccion || "Comenzar lección 1",
    }));

    // Membresía activa y vigente
    const [membresias] = await pool.query(
      `SELECT s.fecha_vencimiento, s.renovacion_automatica, p.nombre, p.precio
         FROM Suscripcion s JOIN Plan_Membresia p ON p.id_plan = s.id_plan
        WHERE s.id_usuario = ? AND s.estado = 'Activa' AND s.fecha_vencimiento > NOW()
        ORDER BY s.fecha_vencimiento DESC LIMIT 1`,
      [idUsuario]
    );

    const membresia = membresias[0]
      ? {
          activo: true,
          plan_nombre: membresias[0].nombre,
          precio: Number(membresias[0].precio),
          proxima_factura: membresias[0].fecha_vencimiento,
          renovacion_automatica: Boolean(membresias[0].renovacion_automatica),
        }
      : null;

    // Métricas reales: horas estudiadas y racha
    const [[horas]] = await pool.query(
      `SELECT COALESCE(SUM(p.segundo_actual), 0) AS segundos
         FROM Progreso_Leccion p JOIN Inscripcion i ON i.id_inscripcion = p.id_inscripcion
        WHERE i.id_usuario = ?`,
      [idUsuario]
    );
    const [diasRows] = await pool.query(
      `SELECT DISTINCT DATE_FORMAT(p.fecha_actualizacion, '%Y-%m-%d') AS dia
         FROM Progreso_Leccion p JOIN Inscripcion i ON i.id_inscripcion = p.id_inscripcion
        WHERE i.id_usuario = ?
        ORDER BY dia DESC`,
      [idUsuario]
    );

    const metricas = {
      cursos_en_progreso: misInscripciones.filter((i) => i.porcentaje_avance < 100).length,
      cursos_completados: misInscripciones.filter((i) => i.porcentaje_avance >= 100).length,
      horas_estudiadas: Math.round((Number(horas.segundos) / 3600) * 10) / 10,
      dias_racha: calcularRacha(diasRows.map((d) => d.dia)),
    };

    res.json({ metricas, cursos_en_progreso: misInscripciones, membresia });
  } catch (error) {
    console.error("Error en obtenerMiAprendizaje:", error);
    res.status(500).json({ error: "Error al cargar tu aprendizaje" });
  }
};

// RF-14 y RF-15: Guardar avance de una lección y recalcular el porcentaje del curso
export const actualizarProgresoLeccion = async (req, res) => {
  const idUsuario = req.usuario.id_usuario;
  const { id_curso, id_leccion, segundo_actual, completada } = req.body;

  if (!id_curso || !id_leccion) {
    return res.status(400).json({ error: "Faltan parámetros id_curso o id_leccion" });
  }

  const conn = await pool.getConnection();
  try {
    const [insc] = await conn.query(
      "SELECT id_inscripcion FROM Inscripcion WHERE id_usuario = ? AND id_curso = ?",
      [idUsuario, parseInt(id_curso)]
    );
    if (insc.length === 0) {
      return res.status(403).json({ error: "No tienes una inscripción activa en este curso" });
    }
    const idInscripcion = insc[0].id_inscripcion;

    // La lección debe pertenecer a ese curso
    const [lec] = await conn.query(
      `SELECT l.id_leccion FROM Leccion l JOIN Modulo m ON m.id_modulo = l.id_modulo
        WHERE l.id_leccion = ? AND m.id_curso = ?`,
      [parseInt(id_leccion), parseInt(id_curso)]
    );
    if (lec.length === 0) {
      return res.status(404).json({ error: "La lección no pertenece a este curso" });
    }

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO Progreso_Leccion (id_inscripcion, id_leccion, segundo_actual, completada)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         segundo_actual = VALUES(segundo_actual),
         completada = completada OR VALUES(completada)`,
      [idInscripcion, parseInt(id_leccion), parseInt(segundo_actual) || 0, completada ? 1 : 0]
    );

    const [[tot]] = await conn.query(
      `SELECT COUNT(*) AS total FROM Leccion l JOIN Modulo m ON m.id_modulo = l.id_modulo WHERE m.id_curso = ?`,
      [parseInt(id_curso)]
    );
    const [[comp]] = await conn.query(
      "SELECT COUNT(*) AS completadas FROM Progreso_Leccion WHERE id_inscripcion = ? AND completada = TRUE",
      [idInscripcion]
    );

    const porcentaje =
      Number(tot.total) > 0
        ? Math.round((Number(comp.completadas) / Number(tot.total)) * 10000) / 100
        : 0;

    await conn.query("UPDATE Inscripcion SET porcentaje_avance = ? WHERE id_inscripcion = ?", [
      porcentaje,
      idInscripcion,
    ]);

    await conn.commit();

    res.json({
      mensaje: "Progreso actualizado correctamente",
      progreso_leccion: {
        id_inscripcion: idInscripcion,
        id_leccion: parseInt(id_leccion),
        segundo_actual: parseInt(segundo_actual) || 0,
        completada: Boolean(completada),
      },
      porcentaje_avance_curso: porcentaje,
    });
  } catch (error) {
    await conn.rollback().catch(() => {});
    console.error("Error en actualizarProgresoLeccion:", error);
    res.status(500).json({ error: "Error al guardar el progreso" });
  } finally {
    conn.release();
  }
};