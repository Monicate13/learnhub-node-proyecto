import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { JWT_SECRET } from "../middlewares/auth.middleware.js";

const nombreRol = (id_rol) => {
  if (id_rol === 2) return "Administrador";
  if (id_rol === 3) return "Docente";
  return "Estudiante";
};

// RF-01: Registro de cuenta (guarda en MySQL / Aiven)
export const registro = async (req, res) => {
  try {
    const { nombre, apellido, correo, contrasena, rol } = req.body;

    if (!nombre || !apellido || !correo || !contrasena) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const correoNorm = correo.trim().toLowerCase();

    const [existe] = await pool.query(
      "SELECT id_usuario FROM Usuario WHERE correo = ?",
      [correoNorm]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: "El correo electrónico ya está registrado" });
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    // Permitir rol Docente si se solicita explícitamente, de lo contrario Estudiante
    let rolId = 1;
    if (rol === "Docente" || rol === "docente" || rol === "teacher" || rol === 3) {
      rolId = 3;
    }

    const [result] = await pool.query(
      "INSERT INTO Usuario (id_rol, nombre, apellido, correo, contrasena_hash) VALUES (?, ?, ?, ?, ?)",
      [rolId, nombre.trim(), apellido.trim(), correoNorm, contrasena_hash]
    );

    const id_usuario = result.insertId;
    const rolNombre = nombreRol(rolId);

    const token = jwt.sign(
      { id_usuario, correo: correoNorm, id_rol: rolId, rol: rolNombre },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      mensaje: "Usuario registrado con éxito",
      token,
      usuario: {
        id_usuario,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correoNorm,
        id_rol: rolId,
        rol: rolNombre,
      },
    });
  } catch (error) {
    // Dos peticiones simultáneas con el mismo correo (doble clic): la segunda cae aquí
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "El correo electrónico ya está registrado" });
    }
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error interno al registrar usuario" });
  }
};

// RF-02: Inicio de sesión (lee de MySQL / Aiven)
export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: "Debe ingresar correo y contraseña" });
    }

    const [rows] = await pool.query(
      "SELECT id_usuario, id_rol, nombre, apellido, correo, contrasena_hash, estado FROM Usuario WHERE correo = ?",
      [correo.trim().toLowerCase()]
    );

    const usuario = rows[0];
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (usuario.estado !== "Activo") {
      return res.status(403).json({ error: "La cuenta se encuentra inactiva o bloqueada" });
    }

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!esValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const rol = nombreRol(usuario.id_rol);

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, correo: usuario.correo, id_rol: usuario.id_rol, rol },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        id_rol: usuario.id_rol,
        rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error al procesar el inicio de sesión" });
  }
};

// Datos del usuario logueado
export const perfil = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_usuario, id_rol, nombre, apellido, correo, fecha_registro FROM Usuario WHERE id_usuario = ?",
      [req.usuario.id_usuario]
    );
    const u = rows[0];
    if (!u) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ ...u, rol: nombreRol(u.id_rol) });
  } catch (error) {
    console.error("Error en perfil:", error);
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

// Actualizar datos personales (nombre y apellido) en MySQL
export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!nombre || !apellido) {
      return res.status(400).json({ error: "Nombre y apellido son obligatorios" });
    }

    const nombreLimpio = nombre.trim();
    const apellidoLimpio = apellido.trim();

    if (nombreLimpio.length < 2 || apellidoLimpio.length < 2) {
      return res.status(400).json({ error: "Nombre y apellido deben tener al menos 2 caracteres" });
    }

    await pool.query(
      "UPDATE Usuario SET nombre = ?, apellido = ? WHERE id_usuario = ?",
      [nombreLimpio, apellidoLimpio, id_usuario]
    );

    const [rows] = await pool.query(
      "SELECT id_usuario, id_rol, nombre, apellido, correo, fecha_registro FROM Usuario WHERE id_usuario = ?",
      [id_usuario]
    );
    const u = rows[0];

    res.json({
      mensaje: "Perfil actualizado exitosamente",
      usuario: {
        id_usuario: u.id_usuario,
        nombre: u.nombre,
        apellido: u.apellido,
        correo: u.correo,
        id_rol: u.id_rol,
        rol: nombreRol(u.id_rol),
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error interno al actualizar el perfil" });
  }
};

// Cambio seguro de contraseña con validación previa de BCrypt
export const cambiarPassword = async (req, res) => {
  try {
    const { contrasena_actual, contrasena_nueva } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!contrasena_actual || !contrasena_nueva) {
      return res.status(400).json({ error: "Debe ingresar la contraseña actual y la nueva contraseña" });
    }

    if (contrasena_nueva.length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const [rows] = await pool.query(
      "SELECT contrasena_hash FROM Usuario WHERE id_usuario = ?",
      [id_usuario]
    );
    const u = rows[0];
    if (!u) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const coincide = await bcrypt.compare(contrasena_actual, u.contrasena_hash);
    if (!coincide) {
      return res.status(400).json({ error: "La contraseña actual es incorrecta" });
    }

    const nuevoHash = await bcrypt.hash(contrasena_nueva, 10);
    await pool.query(
      "UPDATE Usuario SET contrasena_hash = ? WHERE id_usuario = ?",
      [nuevoHash, id_usuario]
    );

    res.json({ mensaje: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ error: "Error interno al actualizar la contraseña" });
  }
};
