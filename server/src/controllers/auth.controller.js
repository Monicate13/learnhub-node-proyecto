import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { JWT_SECRET } from "../middlewares/auth.middleware.js";

const nombreRol = (id_rol) => (id_rol === 2 ? "Administrador" : "Estudiante");

// RF-01: Registro de cuenta (guarda en MySQL / Aiven)
export const registro = async (req, res) => {
  try {
    const { nombre, apellido, correo, contrasena } = req.body;

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

    // id_rol = 1 (Estudiante) por defecto
    const [result] = await pool.query(
      "INSERT INTO Usuario (id_rol, nombre, apellido, correo, contrasena_hash) VALUES (1, ?, ?, ?, ?)",
      [nombre.trim(), apellido.trim(), correoNorm, contrasena_hash]
    );

    const id_usuario = result.insertId;

    const token = jwt.sign(
      { id_usuario, correo: correoNorm, id_rol: 1, rol: "Estudiante" },
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
        id_rol: 1,
        rol: "Estudiante",
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