import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "learnhub_super_secret_key_2026";

// Middleware para verificar que el usuario tenga un token JWT válido
export const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado: Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // { id_usuario, correo, id_rol, rol }
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

// Middleware para restringir rutas exclusivamente a administradores (RF-04)
export const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.id_rol !== 2) {
    return res.status(403).json({ error: "Acceso prohibido: Se requiere rol de Administrador" });
  }
  next();
};

export { JWT_SECRET };
