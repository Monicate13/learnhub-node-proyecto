import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Importar rutas modulares
import authRoutes from "./src/routes/auth.routes.js";
import cursosRoutes from "./src/routes/cursos.routes.js";
import aprendizajeRoutes from "./src/routes/aprendizaje.routes.js";
import pagosRoutes from "./src/routes/pagos.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import { pool } from "./src/config/db.js";

// 1. Cargar variables de entorno
dotenv.config();

// 2. Inicializar Express
const app = express();
const PORT = process.env.PORT || 4000;

// 3. Middlewares globales
app.use(cors());
app.use(express.json());

// 4. Montar rutas de la API de LearnHub
app.use("/api/auth", authRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/aprendizaje", aprendizajeRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/admin", adminRoutes);

// Endpoint de estado general de la API
app.get("/api/status", (req, res) => {
  res.json({
    proyecto: "LearnHub API REST (Backend Node.js + Express)",
    estado: "En línea",
    version: "2.0.0",
    entorno: "Sandbox / Desarrollo",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth (registro, login, perfil)",
      cursos: "/api/cursos (catálogo, filtros, detalle)",
      aprendizaje: "/api/aprendizaje (mi-aprendizaje, progreso)",
      pagos: "/api/pagos (planes, comprar, suscribir)",
      admin: "/api/admin (dashboard, cursos, transacciones)",
      test_db: "/api/test-db (prueba en vivo de conexión con MySQL)"
    }
  });
});

// Endpoint para probar la conexión en vivo a MySQL
app.get("/api/test-db", async (req, res) => {
  try {
    const [cursos] = await pool.query("SELECT id_curso, titulo, nivel, precio FROM Curso");
    const [usuarios] = await pool.query("SELECT id_usuario, nombre, correo, estado FROM Usuario");
    res.json({
      estado_conexion: "CONECTADO CON ÉXITO A MYSQL ",
      base_de_datos: "learnhub",
      total_cursos_en_bd: cursos.length,
      cursos_recuperados: cursos,
      total_usuarios_en_bd: usuarios.length,
      usuarios_recuperados: usuarios
    });
  } catch (error) {
    res.status(500).json({
      estado_conexion: "ERROR AL CONECTAR A MYSQL ❌",
      mensaje: error.message,
      sugerencia: "Verifica que el servicio MySQL esté corriendo y la contraseña en server/.env sea la correcta"
    });
  }
});

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada en la API de LearnHub" });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err.stack);
  res.status(500).json({ error: "Ocurrió un error inesperado en el servidor" });
});

// 5. Iniciar servidor
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` LearnHub API Backend ejecutándose en: http://localhost:${PORT}`);
  console.log(` Consulta de estado: http://localhost:${PORT}/api/status`);
  console.log(` Catálogo de cursos: http://localhost:${PORT}/api/cursos`);
  console.log(`================================================================`);
});

export default app;
