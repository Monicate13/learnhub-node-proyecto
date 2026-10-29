import { pool } from "../config/db.js";

const NIVELES = ["Principiante", "Intermedio", "Avanzado"];
const MODELOS = ["Individual", "Membresia", "Ambos"];
const ESTADOS = ["Borrador", "Publicado", "Archivado"];

// Acepta "PUBLICADO", "publicado", "Publicado" → "Publicado"
const normalizarEstado = (v) => {
  if (!v) return null;
  const t = String(v).trim().toLowerCase();
  return ESTADOS.find((e) => e.toLowerCase() === t) || null;
};

// RF-20: Indicadores del panel de administración (datos reales de MySQL)
export const obtenerMetricasDashboard = async (req, res) => {
  try {
    const [[ing]] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN tipo = 'Compra' THEN monto END), 0) AS individual,
         COALESCE(SUM(CASE WHEN tipo IN ('Suscripcion', 'Renovacion') THEN monto END), 0) AS suscripciones
       FROM Transaccion WHERE estado = 'Aprobada'`
    );
    const [[est]] = await pool.query(
      "SELECT COUNT(*) AS total FROM Usuario WHERE id_rol = 1 AND estado = 'Activo'"
    );
    const [[cur]] = await pool.query(
      "SELECT COUNT(*) AS total FROM Curso WHERE estado_publicacion = 'Publicado'"
    );
    const [[fin]] = await pool.query(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(CASE WHEN porcentaje_avance >= 100 THEN 1 ELSE 0 END), 0) AS completadas
         FROM Inscripcion`
    );

    const individual = Number(ing.individual);
    const suscripciones = Number(ing.suscripciones);
    const tasa =
      Number(fin.total) > 0
        ? Math.round((Number(fin.completadas) / Number(fin.total)) * 1000) / 10
        : 0;

    // Actividad reciente: últimas transacciones reales
    const [recientes] = await pool.query(
      `SELECT t.id_transaccion, t.tipo, t.estado, t.monto, t.fecha,
              CONCAT(u.nombre, ' ', u.apellido) AS estudiante,
              c.titulo AS curso
         FROM Transaccion t
         JOIN Usuario u ON u.id_usuario = t.id_usuario
         LEFT JOIN Curso c ON c.id_curso = t.id_curso
        ORDER BY t.fecha DESC LIMIT 5`
    );

    const actividad_reciente = recientes.map((t, i) => {
      const rechazada = t.estado === "Rechazada";
      const concepto = t.curso ? t.curso : "Membresía Pro";
      return {
        id: i + 1,
        mensaje: rechazada
          ? `Pago rechazado de ${t.estudiante} (${concepto})`
          : `${t.estudiante} ${t.tipo === "Compra" ? "compró" : "activó"} ${concepto} ($${Number(t.monto)})`,
        tipo: rechazada ? "ALERTA" : t.tipo === "Compra" ? "COMPRA" : "SUSCRIPCIÓN",
        fecha: t.fecha,
      };
    });

    res.json({
      resumen: {
        ingresos_totales: individual + suscripciones,
        desglose_ingresos: { individual, suscripciones },
        estudiantes_activos: Number(est.total),
        cursos_publicados: Number(cur.total),
        tasa_finalizacion: `${tasa}%`,
      },
      actividad_reciente,
    });
  } catch (error) {
    console.error("Error en obtenerMetricasDashboard:", error);
    res.status(500).json({ error: "Error al calcular las métricas administrativas" });
  }
};

// RF-18 y RF-19: Crear curso (queda en Borrador)
export const crearCurso = async (req, res) => {
  try {
    const { titulo, descripcion, id_categoria, nivel, modelo_cobro, precio, imagen_url } = req.body;

    if (!titulo || !id_categoria || !nivel) {
      return res.status(400).json({ error: "Título, categoría y nivel son obligatorios" });
    }
    if (!NIVELES.includes(nivel)) {
      return res.status(400).json({ error: `Nivel inválido. Usa: ${NIVELES.join(", ")}` });
    }
    const modelo = modelo_cobro || "Ambos";
    if (!MODELOS.includes(modelo)) {
      return res.status(400).json({ error: `Modelo de cobro inválido. Usa: ${MODELOS.join(", ")}` });
    }

    const [result] = await pool.query(
      `INSERT INTO Curso (id_categoria, id_administrador, titulo, descripcion, nivel, imagen_url, modelo_cobro, precio, estado_publicacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Borrador')`,
      [
        parseInt(id_categoria),
        req.usuario.id_usuario,
        titulo.trim(),
        descripcion || "",
        nivel,
        imagen_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
        modelo,
        parseFloat(precio) || 0,
      ]
    );

    res.status(201).json({
      mensaje: "Curso creado exitosamente en modo Borrador",
      curso: { id_curso: result.insertId, titulo: titulo.trim(), estado_publicacion: "Borrador" },
    });
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "La categoría indicada no existe" });
    }
    console.error("Error en crearCurso:", error);
    res.status(500).json({ error: "Error al crear el curso" });
  }
};

// Actualizar datos o publicar un curso
export const actualizarCurso = async (req, res) => {
  try {
    const idCurso = parseInt(req.params.id);
    const { titulo, descripcion, nivel, modelo_cobro, precio, estado_publicacion, imagen_url, id_categoria } = req.body;

    const sets = [];
    const params = [];

    if (titulo !== undefined) { sets.push("titulo = ?"); params.push(titulo); }
    if (descripcion !== undefined) { sets.push("descripcion = ?"); params.push(descripcion); }
    if (nivel !== undefined) {
      if (!NIVELES.includes(nivel)) return res.status(400).json({ error: "Nivel inválido" });
      sets.push("nivel = ?"); params.push(nivel);
    }
    if (modelo_cobro !== undefined) {
      if (!MODELOS.includes(modelo_cobro)) return res.status(400).json({ error: "Modelo de cobro inválido" });
      sets.push("modelo_cobro = ?"); params.push(modelo_cobro);
    }
    if (precio !== undefined) { sets.push("precio = ?"); params.push(parseFloat(precio) || 0); }
    if (estado_publicacion !== undefined) {
      const estado = normalizarEstado(estado_publicacion);
      if (!estado) return res.status(400).json({ error: "Estado de publicación inválido" });
      sets.push("estado_publicacion = ?"); params.push(estado);
    }
    if (imagen_url !== undefined) { sets.push("imagen_url = ?"); params.push(imagen_url); }
    if (id_categoria !== undefined) { sets.push("id_categoria = ?"); params.push(parseInt(id_categoria)); }

    if (sets.length === 0) {
      return res.status(400).json({ error: "No se enviaron campos para actualizar" });
    }

    const [result] = await pool.query(
      `UPDATE Curso SET ${sets.join(", ")} WHERE id_curso = ?`,
      [...params, idCurso]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    const [rows] = await pool.query(
      "SELECT id_curso, titulo, descripcion, nivel, modelo_cobro, precio, estado_publicacion, imagen_url FROM Curso WHERE id_curso = ?",
      [idCurso]
    );
    res.json({ mensaje: "Curso actualizado con éxito", curso: { ...rows[0], precio: Number(rows[0].precio) } });
  } catch (error) {
    console.error("Error en actualizarCurso:", error);
    res.status(500).json({ error: "Error al actualizar el curso" });
  }
};

// RF-21: Centro de finanzas y transacciones con filtros
export const obtenerTransacciones = async (req, res) => {
  try {
    const { tipo, estado } = req.query;

    const where = [];
    const params = [];
    if (tipo) { where.push("LOWER(t.tipo) = LOWER(?)"); params.push(tipo); }
    if (estado) { where.push("LOWER(t.estado) = LOWER(?)"); params.push(estado); }

    const [rows] = await pool.query(
      `SELECT t.id_transaccion, t.id_usuario, t.id_curso, t.id_suscripcion, t.tipo, t.metodo_pago,
              t.monto, t.estado, t.referencia_pasarela, t.ultimos_digitos, t.transaccion_original_id, t.fecha,
              CONCAT(u.nombre, ' ', u.apellido) AS estudiante,
              COALESCE(c.titulo, 'Membresía Pro') AS concepto
         FROM Transaccion t
         JOIN Usuario u ON u.id_usuario = t.id_usuario
         LEFT JOIN Curso c ON c.id_curso = t.id_curso
         ${where.length ? "WHERE " + where.join(" AND ") : ""}
        ORDER BY t.fecha DESC`,
      params
    );

    const [[tot]] = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN estado = 'Aprobada' THEN monto END), 0) AS confirmado,
         COALESCE(SUM(CASE WHEN estado = 'Reembolsada' THEN monto END), 0) AS reembolsado,
         COALESCE(SUM(CASE WHEN estado = 'Rechazada' THEN 1 ELSE 0 END), 0) AS fallidos
       FROM Transaccion`
    );

    res.json({
      resumen_financiero: {
        ingresos_confirmados: Number(tot.confirmado),
        reembolsado: Number(tot.reembolsado),
        pagos_fallidos: Number(tot.fallidos),
      },
      transacciones: rows.map((t) => ({ ...t, monto: Number(t.monto) })),
    });
  } catch (error) {
    console.error("Error en obtenerTransacciones:", error);
    res.status(500).json({ error: "Error al consultar las transacciones" });
  }
};