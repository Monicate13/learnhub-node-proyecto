import { pool } from "../config/db.js";

// RF-10: Planes de membresía activos (desde MySQL)
export const obtenerPlanes = async (req, res) => {
  try {
    const [planes] = await pool.query(
      "SELECT id_plan, nombre, descripcion, precio, periodicidad, estado FROM Plan_Membresia WHERE estado = 'Activo'"
    );
    res.json(planes);
  } catch (error) {
    console.error("Error en obtenerPlanes:", error);
    res.status(500).json({ error: "Error al consultar los planes" });
  }
};

// RF-07, RF-08, RF-09: Compra individual de un curso (Sandbox) guardada en MySQL
export const comprarCurso = async (req, res) => {
  const idUsuario = req.usuario.id_usuario;
  const { id_curso, numero_tarjeta, metodo_pago = "Tarjeta (Sandbox)" } = req.body;

  if (!id_curso) {
    return res.status(400).json({ error: "Debe especificar el id_curso a comprar" });
  }

  const conn = await pool.getConnection();
  try {
    const [cursos] = await conn.query(
      "SELECT id_curso, precio FROM Curso WHERE id_curso = ?",
      [parseInt(id_curso)]
    );
    const curso = cursos[0];
    if (!curso) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    const [yaInscrito] = await conn.query(
      "SELECT id_inscripcion FROM Inscripcion WHERE id_usuario = ? AND id_curso = ?",
      [idUsuario, curso.id_curso]
    );
    if (yaInscrito.length > 0) {
      return res.status(400).json({ error: "Ya estás inscrito en este curso" });
    }

    // Sandbox: tarjetas que terminan en '0000' se rechazan a propósito
    const ultimos_digitos = numero_tarjeta ? String(numero_tarjeta).slice(-4) : "4521";
    const esAprobada = ultimos_digitos !== "0000";
    const estado = esAprobada ? "Aprobada" : "Rechazada";

    const id_transaccion = `PAY-${Date.now().toString().slice(-9)}`;
    const referencia = `SBX-${Date.now()}`;
    const metodo = `${metodo_pago} •••• ${ultimos_digitos}`.slice(0, 50);

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO Transaccion
        (id_transaccion, id_usuario, id_curso, id_suscripcion, tipo, metodo_pago, monto, estado, referencia_pasarela, ultimos_digitos)
       VALUES (?, ?, ?, NULL, 'Compra', ?, ?, ?, ?, ?)`,
      [id_transaccion, idUsuario, curso.id_curso, metodo, curso.precio, estado, referencia, ultimos_digitos]
    );

    if (!esAprobada) {
      await conn.commit(); // se guarda la transacción rechazada para auditoría
      return res.status(402).json({
        error: "El pago fue rechazado por la pasarela de pagos (Sandbox)",
        transaccion: { id_transaccion, estado, monto: curso.precio },
      });
    }

    const [insc] = await conn.query(
      `INSERT INTO Inscripcion (id_usuario, id_curso, id_transaccion, origen)
       VALUES (?, ?, ?, 'Compra')`,
      [idUsuario, curso.id_curso, id_transaccion]
    );

    await conn.commit();

    res.status(201).json({
      mensaje: "¡Compra realizada con éxito! Acceso concedido al curso.",
      transaccion: { id_transaccion, estado, monto: curso.precio, ultimos_digitos },
      inscripcion: { id_inscripcion: insc.insertId, id_curso: curso.id_curso, origen: "Compra" },
    });
  } catch (error) {
    await conn.rollback().catch(() => {});
    console.error("Error en comprarCurso:", error);
    res.status(500).json({ error: "Error al procesar la compra" });
  } finally {
    conn.release();
  }
};

// RF-10 y RF-11: Suscripción a un plan de membresía guardada en MySQL
export const suscribirPlan = async (req, res) => {
  const idUsuario = req.usuario.id_usuario;
  const { id_plan, numero_tarjeta } = req.body;

  const conn = await pool.getConnection();
  try {
    const [planes] = await conn.query(
      "SELECT id_plan, precio, periodicidad FROM Plan_Membresia WHERE id_plan = ? AND estado = 'Activo'",
      [parseInt(id_plan)]
    );
    const plan = planes[0];
    if (!plan) {
      return res.status(404).json({ error: "Plan de membresía no válido" });
    }

    const ultimos_digitos = numero_tarjeta ? String(numero_tarjeta).slice(-4) : "7823";

    const vence = new Date();
    if (plan.periodicidad === "Anual") vence.setFullYear(vence.getFullYear() + 1);
    else if (plan.periodicidad === "Semestral") vence.setMonth(vence.getMonth() + 6);
    else if (plan.periodicidad === "Trimestral") vence.setMonth(vence.getMonth() + 3);
    else vence.setMonth(vence.getMonth() + 1);

    const id_transaccion = `SUB-${Date.now().toString().slice(-9)}`;

    await conn.beginTransaction();

    const [susc] = await conn.query(
      `INSERT INTO Suscripcion (id_usuario, id_plan, fecha_vencimiento, renovacion_automatica, estado)
       VALUES (?, ?, ?, TRUE, 'Activa')`,
      [idUsuario, plan.id_plan, vence]
    );

    await conn.query(
      `INSERT INTO Transaccion
        (id_transaccion, id_usuario, id_curso, id_suscripcion, tipo, metodo_pago, monto, estado, referencia_pasarela, ultimos_digitos)
       VALUES (?, ?, NULL, ?, 'Suscripcion', ?, ?, 'Aprobada', ?, ?)`,
      [id_transaccion, idUsuario, susc.insertId, `Tarjeta •••• ${ultimos_digitos}`, plan.precio, `SBX-SUB-${Date.now()}`, ultimos_digitos]
    );

    await conn.commit();

    res.status(201).json({
      mensaje: "¡Membresía activada! Ya tienes acceso ilimitado a todos los cursos con membresía.",
      suscripcion: {
        id_suscripcion: susc.insertId,
        id_plan: plan.id_plan,
        fecha_vencimiento: vence.toISOString(),
        renovacion_automatica: true,
        estado: "Activa",
      },
      transaccion: { id_transaccion, estado: "Aprobada", monto: plan.precio },
    });
  } catch (error) {
    await conn.rollback().catch(() => {});
    console.error("Error en suscribirPlan:", error);
    res.status(500).json({ error: "Error al procesar la suscripción" });
  } finally {
    conn.release();
  }
};

// RF-12: Cancelar renovación automática (mantiene acceso hasta el vencimiento)
export const cancelarMembresia = async (req, res) => {
  try {
    const idUsuario = req.usuario.id_usuario;

    const [rows] = await pool.query(
      "SELECT id_suscripcion, fecha_vencimiento FROM Suscripcion WHERE id_usuario = ? AND estado = 'Activa' ORDER BY fecha_inicio DESC LIMIT 1",
      [idUsuario]
    );
    const susc = rows[0];
    if (!susc) {
      return res.status(404).json({ error: "No tienes una membresía activa actualmente" });
    }

    await pool.query(
      "UPDATE Suscripcion SET renovacion_automatica = FALSE WHERE id_suscripcion = ?",
      [susc.id_suscripcion]
    );

    res.json({
      mensaje: "La renovación automática ha sido cancelada. Mantendrás acceso hasta la fecha de vencimiento.",
      fecha_vencimiento: susc.fecha_vencimiento,
      renovacion_automatica: false,
    });
  } catch (error) {
    console.error("Error en cancelarMembresia:", error);
    res.status(500).json({ error: "Error al cancelar la membresía" });
  }
};