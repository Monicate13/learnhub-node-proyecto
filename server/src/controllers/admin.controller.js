import { pool, verificarYMigrarEsquema } from "../config/db.js";

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

// RF-18 y RF-19: Crear curso (guarda directamente en MySQL)
export const crearCurso = async (req, res) => {
  try {
    const { 
      titulo, 
      descripcion, 
      id_categoria, 
      categoria, 
      nivel, 
      modelo_cobro, 
      precio, 
      imagen_url,
      instructor,
      duracion,
      modules,
      contenido_modulos,
      recursos,
      evaluacion_preguntas,
      status,
      estado_publicacion 
    } = req.body;

    if (!titulo || (!id_categoria && !categoria) || !nivel) {
      return res.status(400).json({ error: "Título, categoría y nivel son obligatorios" });
    }
    if (!NIVELES.includes(nivel)) {
      return res.status(400).json({ error: `Nivel inválido. Usa: ${NIVELES.join(", ")}` });
    }
    const modelo = modelo_cobro || "Ambos";
    if (!MODELOS.includes(modelo)) {
      return res.status(400).json({ error: `Modelo de cobro inválido. Usa: ${MODELOS.join(", ")}` });
    }

    // Asegurar que las columnas instructor, duracion y contenido_modulos existan en la BD
    await verificarYMigrarEsquema();

    // Resolver ID de categoría por nombre si viene como texto
    let catId = id_categoria ? parseInt(id_categoria) : null;
    if (!catId && categoria) {
      const [cats] = await pool.query(
        "SELECT id_categoria FROM Categoria WHERE LOWER(nombre) = LOWER(?) LIMIT 1",
        [categoria.trim()]
      );
      if (cats.length > 0) catId = cats[0].id_categoria;
    }
    if (!catId) catId = 1; // Default a la primera categoría disponible en BD

    const estadoFinal = normalizarEstado(estado_publicacion || status) || "Publicado";
    const nombreDocente = instructor ? instructor.trim() : "Roberto Cruz";
    const duracionFinal = duracion ? String(duracion).trim() : "25h 0m";

    const modulosObj = modules !== undefined ? modules : (contenido_modulos || []);
    const modulosJson = (typeof modulosObj === "string") ? modulosObj : JSON.stringify(modulosObj);
    const recursosJson = recursos ? (typeof recursos === "string" ? recursos : JSON.stringify(recursos)) : JSON.stringify([]);
    const preguntasJson = evaluacion_preguntas ? (typeof evaluacion_preguntas === "string" ? evaluacion_preguntas : JSON.stringify(evaluacion_preguntas)) : null;

    const [result] = await pool.query(
      `INSERT INTO Curso (id_categoria, id_administrador, titulo, descripcion, nivel, imagen_url, modelo_cobro, precio, estado_publicacion, instructor, duracion, contenido_modulos, recursos, evaluacion_preguntas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        catId,
        req.usuario.id_usuario,
        titulo.trim(),
        descripcion || "",
        nivel,
        imagen_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
        modelo,
        parseFloat(precio) || 0,
        estadoFinal,
        nombreDocente,
        duracionFinal,
        modulosJson,
        recursosJson,
        preguntasJson,
      ]
    );

    const nuevoIdCurso = result.insertId;

    // Sincronizar tablas relacionales Modulo y Leccion en MySQL
    const listaModulos = Array.isArray(modulosObj)
      ? modulosObj
      : (typeof modulosObj === "string" ? JSON.parse(modulosObj) : []);

    if (Array.isArray(listaModulos) && listaModulos.length > 0) {
      try {
        for (let i = 0; i < listaModulos.length; i++) {
          const m = listaModulos[i];
          const [mRes] = await pool.query(
            "INSERT INTO Modulo (id_curso, titulo, orden) VALUES (?, ?, ?)",
            [nuevoIdCurso, m.title || `Módulo ${i + 1}`, i + 1]
          );
          const modId = mRes.insertId;
          const lecciones = Array.isArray(m.lessons) ? m.lessons : [];
          for (let j = 0; j < lecciones.length; j++) {
            const l = lecciones[j];
            let durSeg = 900;
            if (l.time) {
              const parts = String(l.time).split(":");
              if (parts.length === 2) {
                durSeg = (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
              }
            }
            await pool.query(
              "INSERT INTO Leccion (id_modulo, titulo, video_url, duracion_seg, orden) VALUES (?, ?, ?, ?, ?)",
              [
                modId,
                l.title || `Clase ${j + 1}`,
                l.video_url || "https://www.youtube.com/embed/7iobxzd_2wY",
                durSeg,
                j + 1,
              ]
            );
          }
        }
      } catch (errRel) {
        console.warn("⚠️ Advertencia al insertar módulos relacionales:", errRel.message);
      }
    }

    res.status(201).json({
      mensaje: `Curso creado exitosamente en estado ${estadoFinal}`,
      curso: { 
        id_curso: nuevoIdCurso, 
        titulo: titulo.trim(), 
        estado_publicacion: estadoFinal,
        instructor: nombreDocente,
        duracion: duracionFinal,
        modules: listaModulos,
      },
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
    const { 
      titulo, 
      descripcion, 
      nivel, 
      modelo_cobro, 
      precio, 
      estado_publicacion, 
      status, 
      imagen_url, 
      id_categoria, 
      categoria,
      instructor,
      duracion,
      modules,
      contenido_modulos,
      recursos,
      evaluacion_preguntas
    } = req.body;

    await verificarYMigrarEsquema();

    const sets = [];
    const params = [];

    if (titulo !== undefined) { sets.push("titulo = ?"); params.push(titulo.trim()); }
    if (descripcion !== undefined) { sets.push("descripcion = ?"); params.push(descripcion); }
    if (nivel !== undefined) {
      if (!NIVELES.includes(nivel)) return res.status(400).json({ error: "Nivel inválido" });
      sets.push("nivel = ?"); params.push(nivel);
    }
    if (modelo_cobro !== undefined) {
      if (!MODELOS.includes(modelo_cobro)) return res.status(400).json({ error: "Modelo de cobro inválido" });
      sets.push("modelo_cobro = ?"); params.push(modelo_cobro);
    }
    if (precio !== undefined) {
      const p = parseFloat(precio);
      sets.push("precio = ?");
      params.push(isNaN(p) ? 0 : p);
    }

    const estadoRaw = estado_publicacion || status;
    if (estadoRaw !== undefined) {
      const estado = normalizarEstado(estadoRaw);
      if (!estado) return res.status(400).json({ error: "Estado de publicación inválido" });
      sets.push("estado_publicacion = ?"); params.push(estado);
    }

    if (imagen_url !== undefined) { sets.push("imagen_url = ?"); params.push(imagen_url); }
    if (instructor !== undefined) { sets.push("instructor = ?"); params.push(instructor.trim()); }
    if (duracion !== undefined) { sets.push("duracion = ?"); params.push(String(duracion).trim()); }

    const modulosPayload = modules !== undefined ? modules : contenido_modulos;
    if (modulosPayload !== undefined) {
      const modJson = typeof modulosPayload === "string" ? modulosPayload : JSON.stringify(modulosPayload);
      sets.push("contenido_modulos = ?");
      params.push(modJson);
    }

    if (recursos !== undefined) {
      const recJson = typeof recursos === "string" ? recursos : JSON.stringify(recursos);
      sets.push("recursos = ?");
      params.push(recJson);
    }

    if (evaluacion_preguntas !== undefined) {
      const pregJson = typeof evaluacion_preguntas === "string" ? evaluacion_preguntas : JSON.stringify(evaluacion_preguntas);
      sets.push("evaluacion_preguntas = ?");
      params.push(pregJson);
    }

    let catId = id_categoria ? parseInt(id_categoria) : null;
    if (!catId && categoria) {
      const [cats] = await pool.query(
        "SELECT id_categoria FROM Categoria WHERE LOWER(nombre) = LOWER(?) LIMIT 1",
        [categoria.trim()]
      );
      if (cats.length > 0) catId = cats[0].id_categoria;
    }
    if (catId) { sets.push("id_categoria = ?"); params.push(catId); }

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

    // Si se enviaron módulos, sincronizar las tablas relacionales Modulo y Leccion
    if (modulosPayload !== undefined) {
      const listaModulos = Array.isArray(modulosPayload)
        ? modulosPayload
        : (typeof modulosPayload === "string" ? JSON.parse(modulosPayload) : []);

      if (Array.isArray(listaModulos)) {
        try {
          await pool.query(
            "DELETE l FROM Leccion l JOIN Modulo m ON m.id_modulo = l.id_modulo WHERE m.id_curso = ?",
            [idCurso]
          );
          await pool.query("DELETE FROM Modulo WHERE id_curso = ?", [idCurso]);

          for (let i = 0; i < listaModulos.length; i++) {
            const m = listaModulos[i];
            const [mRes] = await pool.query(
              "INSERT INTO Modulo (id_curso, titulo, orden) VALUES (?, ?, ?)",
              [idCurso, m.title || `Módulo ${i + 1}`, i + 1]
            );
            const modId = mRes.insertId;
            const lecciones = Array.isArray(m.lessons) ? m.lessons : [];
            for (let j = 0; j < lecciones.length; j++) {
              const l = lecciones[j];
              let durSeg = 900;
              if (l.time) {
                const parts = String(l.time).split(":");
                if (parts.length === 2) {
                  durSeg = (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
                }
              }
              await pool.query(
                "INSERT INTO Leccion (id_modulo, titulo, video_url, duracion_seg, orden) VALUES (?, ?, ?, ?, ?)",
                [
                  modId,
                  l.title || `Clase ${j + 1}`,
                  l.video_url || "https://www.youtube.com/embed/7iobxzd_2wY",
                  durSeg,
                  j + 1,
                ]
              );
            }
          }
        } catch (relErr) {
          console.warn("⚠️ Advertencia al actualizar módulos relacionales:", relErr.message);
        }
      }
    }

    const [rows] = await pool.query(
      "SELECT id_curso, titulo, descripcion, nivel, modelo_cobro, precio, estado_publicacion, imagen_url, instructor, duracion, contenido_modulos, recursos, evaluacion_preguntas FROM Curso WHERE id_curso = ?",
      [idCurso]
    );

    let parsedModules = [];
    if (rows[0]?.contenido_modulos) {
      try {
        parsedModules = typeof rows[0].contenido_modulos === "string"
          ? JSON.parse(rows[0].contenido_modulos)
          : rows[0].contenido_modulos;
      } catch {
        parsedModules = [];
      }
    }

    let parsedRecursos = [];
    if (rows[0]?.recursos) {
      try {
        parsedRecursos = typeof rows[0].recursos === "string"
          ? JSON.parse(rows[0].recursos)
          : rows[0].recursos;
      } catch {
        parsedRecursos = [];
      }
    }

    let parsedPreguntas = null;
    if (rows[0]?.evaluacion_preguntas) {
      try {
        parsedPreguntas = typeof rows[0].evaluacion_preguntas === "string"
          ? JSON.parse(rows[0].evaluacion_preguntas)
          : rows[0].evaluacion_preguntas;
      } catch {
        parsedPreguntas = null;
      }
    }

    res.json({
      mensaje: "Curso actualizado con éxito",
      curso: { 
        ...rows[0], 
        precio: Number(rows[0].precio),
        modules: parsedModules,
        recursos: parsedRecursos,
        evaluacion_preguntas: parsedPreguntas,
      },
    });
  } catch (error) {
    console.error("Error en actualizarCurso:", error);
    res.status(500).json({ error: "Error al actualizar el curso" });
  }
};

// Eliminar o archivar curso
export const eliminarCurso = async (req, res) => {
  try {
    const idCurso = parseInt(req.params.id);
    const [result] = await pool.query("DELETE FROM Curso WHERE id_curso = ?", [idCurso]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.json({ mensaje: "Curso eliminado con éxito" });
  } catch (error) {
    // Si tiene claves foráneas (inscripciones, transacciones), lo archivamos de forma segura
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      await pool.query("UPDATE Curso SET estado_publicacion = 'Archivado' WHERE id_curso = ?", [parseInt(req.params.id)]);
      return res.json({ mensaje: "El curso tiene registros asociados y ha sido archivado" });
    }
    console.error("Error en eliminarCurso:", error);
    res.status(500).json({ error: "Error al eliminar el curso" });
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

// =========================================================================
// GESTIÓN DE USUARIOS Y ROLES (Buscar usuario por correo, rol y membresía)
// =========================================================================
export const obtenerUsuariosAdmin = async (req, res) => {
  try {
    const { busqueda } = req.query;
    let query = `
      SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.correo,
        u.estado,
        u.id_rol,
        r.nombre_rol AS rol,
        COALESCE(
          (SELECT s.estado FROM Suscripcion s 
           WHERE s.id_usuario = u.id_usuario AND s.estado = 'Activa' AND s.fecha_vencimiento > NOW() 
           ORDER BY s.fecha_vencimiento DESC LIMIT 1),
          'Inactiva'
        ) AS estado_suscripcion,
        (SELECT s.fecha_vencimiento FROM Suscripcion s 
         WHERE s.id_usuario = u.id_usuario AND s.estado = 'Activa' AND s.fecha_vencimiento > NOW() 
         ORDER BY s.fecha_vencimiento DESC LIMIT 1) AS fecha_vencimiento
      FROM Usuario u
      JOIN Rol r ON r.id_rol = u.id_rol
    `;
    const params = [];
    if (busqueda && busqueda.trim()) {
      query += ` WHERE LOWER(u.correo) LIKE LOWER(?) OR LOWER(u.nombre) LIKE LOWER(?) OR LOWER(u.apellido) LIKE LOWER(?)`;
      const term = `%${busqueda.trim()}%`;
      params.push(term, term, term);
    }
    query += ` ORDER BY u.id_usuario DESC`;

    const [usuarios] = await pool.query(query, params);

    res.json({
      total: usuarios.length,
      usuarios: usuarios.map((u) => ({
        id_usuario: u.id_usuario,
        nombre: u.nombre,
        apellido: u.apellido,
        correo: u.correo,
        estado: u.estado,
        id_rol: u.id_rol,
        rol: u.rol,
        tieneMembresia: u.estado_suscripcion === "Activa",
        fecha_vencimiento: u.fecha_vencimiento,
      })),
    });
  } catch (error) {
    console.error("Error en obtenerUsuariosAdmin:", error);
    res.status(500).json({ error: "Error al obtener los usuarios de la base de datos" });
  }
};

export const actualizarRolUsuario = async (req, res) => {
  try {
    const idUsuario = parseInt(req.params.id);
    const { id_rol } = req.body;
    const rolNum = parseInt(id_rol);

    if (![1, 2, 3].includes(rolNum)) {
      return res.status(400).json({ error: "Rol inválido. Debe ser 1 (Estudiante), 2 (Administrador) o 3 (Docente)" });
    }

    const [result] = await pool.query(
      "UPDATE Usuario SET id_rol = ? WHERE id_usuario = ?",
      [rolNum, idUsuario]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const [roles] = await pool.query("SELECT nombre_rol FROM Rol WHERE id_rol = ?", [rolNum]);
    const nombreRol = roles.length > 0 ? roles[0].nombre_rol : (rolNum === 3 ? "Docente" : rolNum === 2 ? "Administrador" : "Estudiante");

    res.json({
      mensaje: `Rol de usuario actualizado a ${nombreRol} con éxito`,
      id_usuario: idUsuario,
      id_rol: rolNum,
      rol: nombreRol,
    });
  } catch (error) {
    console.error("Error en actualizarRolUsuario:", error);
    res.status(500).json({ error: "Error al actualizar el rol en la base de datos" });
  }
};

export const actualizarMembresiaUsuario = async (req, res) => {
  try {
    const idUsuario = parseInt(req.params.id);
    const { activa } = req.body;

    const [usuario] = await pool.query("SELECT id_usuario, correo FROM Usuario WHERE id_usuario = ?", [idUsuario]);
    if (usuario.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (activa) {
      // Otorgar 6 meses de membresía VIP Pro en MySQL
      const [planes] = await pool.query("SELECT id_plan FROM Plan_Membresia ORDER BY id_plan ASC LIMIT 1");
      const idPlan = planes.length > 0 ? planes[0].id_plan : 1;

      const vence = new Date();
      vence.setMonth(vence.getMonth() + 6);

      // Desactivar suscripciones previas si las hay
      await pool.query("UPDATE Suscripcion SET estado = 'Inactiva' WHERE id_usuario = ?", [idUsuario]);

      const [insertSusc] = await pool.query(
        `INSERT INTO Suscripcion (id_usuario, id_plan, fecha_vencimiento, renovacion_automatica, estado)
         VALUES (?, ?, ?, TRUE, 'Activa')`,
        [idUsuario, idPlan, vence]
      );

      // Registrar una transacción de membresía otorgada por el admin
      await pool.query(
        `INSERT INTO Transaccion (id_transaccion, id_usuario, id_suscripcion, tipo, metodo_pago, monto, estado, referencia_pasarela, ultimos_digitos)
         VALUES (?, ?, ?, 'Suscripcion', 'Concedida por Admin', 0.00, 'Aprobada', ?, 'ADMIN')`,
        [Date.now(), idUsuario, insertSusc.insertId, `ADM-VIP-${Date.now()}`]
      );

      res.json({
        mensaje: "Membresía VIP otorgada con éxito por 6 meses",
        id_usuario: idUsuario,
        tieneMembresia: true,
        fecha_vencimiento: vence.toISOString(),
      });
    } else {
      // Revocar membresía VIP
      await pool.query(
        "UPDATE Suscripcion SET estado = 'Cancelada', renovacion_automatica = FALSE WHERE id_usuario = ?",
        [idUsuario]
      );

      res.json({
        mensaje: "Membresía VIP revocada con éxito",
        id_usuario: idUsuario,
        tieneMembresia: false,
      });
    }
  } catch (error) {
    console.error("Error en actualizarMembresiaUsuario:", error);
    res.status(500).json({ error: "Error al modificar la membresía en la base de datos" });
  }
};