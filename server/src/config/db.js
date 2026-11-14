import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "defaultdb",
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Soporte para SSL (Aiven.io exige SSL obligatorio)
if (process.env.DB_SSL === "true" || process.env.DB_SSL === "REQUIRED") {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
}

// Configuración del Pool de conexiones para MySQL
export const pool = mysql.createPool(dbConfig);

// Migración automática de esquema y verificación de datos de roles y tablas
export const verificarYMigrarEsquema = async () => {
  try {
    // 1. Verificar y agregar rol Docente (id_rol = 3) en tabla Rol
    const [roles] = await pool.query("SELECT id_rol, nombre_rol FROM Rol WHERE id_rol = 3 OR nombre_rol = 'Docente'");
    if (roles.length === 0) {
      await pool.query("INSERT INTO Rol (id_rol, nombre_rol) VALUES (3, 'Docente') ON DUPLICATE KEY UPDATE nombre_rol = 'Docente'");
      console.log("✅ Migración: Rol 'Docente' (id_rol = 3) asegurado en la tabla 'Rol'");
    }

    // 2. Crear usuario Docente por defecto para pruebas si no existe
    const [docenteExiste] = await pool.query("SELECT id_usuario FROM Usuario WHERE correo = 'docente@learnhub.com'");
    if (docenteExiste.length === 0) {
      const hashDocente = await bcrypt.hash("12345678", 10);
      await pool.query(
        "INSERT INTO Usuario (id_rol, nombre, apellido, correo, contrasena_hash, estado) VALUES (3, 'Carlos', 'Mendoza', 'docente@learnhub.com', ?, 'Activo')",
        [hashDocente]
      );
      console.log("✅ Usuario Docente creado por defecto: docente@learnhub.com (clave: 12345678)");
    }

    // 3. Verificar columnas en tabla Curso
    const [cols] = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Curso'"
    );
    const nombres = cols.map((c) => c.COLUMN_NAME.toLowerCase());

    if (!nombres.includes("instructor")) {
      await pool.query("ALTER TABLE Curso ADD COLUMN instructor VARCHAR(150) NULL DEFAULT 'Roberto Cruz'");
      console.log("✅ Migración: Columna 'instructor' agregada a la tabla 'Curso'");
    }

    if (!nombres.includes("duracion")) {
      await pool.query("ALTER TABLE Curso ADD COLUMN duracion VARCHAR(50) NULL DEFAULT '25h 0m'");
      console.log("✅ Migración: Columna 'duracion' agregada a la tabla 'Curso'");
    }

    if (!nombres.includes("contenido_modulos")) {
      await pool.query("ALTER TABLE Curso ADD COLUMN contenido_modulos JSON NULL");
      console.log("✅ Migración: Columna 'contenido_modulos' agregada a la tabla 'Curso'");
    }

    if (!nombres.includes("recursos")) {
      await pool.query("ALTER TABLE Curso ADD COLUMN recursos JSON NULL");
      console.log("✅ Migración: Columna 'recursos' agregada a la tabla 'Curso'");
    }

    if (!nombres.includes("evaluacion_preguntas")) {
      await pool.query("ALTER TABLE Curso ADD COLUMN evaluacion_preguntas JSON NULL");
      console.log("✅ Migración: Columna 'evaluacion_preguntas' agregada a la tabla 'Curso'");
    }

    try {
      await pool.query("ALTER TABLE Curso MODIFY COLUMN imagen_url MEDIUMTEXT NULL");
    } catch {}

    // 4. Crear tabla Foro_Pregunta si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Foro_Pregunta (
        id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
        id_curso INT NOT NULL,
        id_usuario INT NOT NULL,
        nombre_usuario VARCHAR(150) NOT NULL,
        rol_usuario VARCHAR(50) NOT NULL DEFAULT 'Estudiante',
        leccion VARCHAR(200) NOT NULL,
        pregunta TEXT NOT NULL,
        respuestas JSON NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_foro_curso (id_curso)
      )
    `);

    // 5. Crear tabla Nota_Estudiante si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Nota_Estudiante (
        id_nota INT AUTO_INCREMENT PRIMARY KEY,
        id_curso INT NOT NULL,
        id_usuario INT NOT NULL,
        leccion VARCHAR(200) NOT NULL,
        texto TEXT NOT NULL,
        tiempo VARCHAR(20) DEFAULT '00:00',
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_nota_curso_user (id_curso, id_usuario)
      )
    `);

    console.log("✅ Esquema de base de datos verificado y sincronizado correctamente con MySQL en Aiven Cloud.");
  } catch (error) {
    console.warn("⚠️ Aviso al verificar migración de esquema:", error.message);
  }
};

// Función para probar la conexión
export const probarConexion = async () => {
  try {
    const conexion = await pool.getConnection();
    console.log(`✅ Conexión exitosa a MySQL en Aiven Cloud (${dbConfig.database} en ${dbConfig.host})`);
    conexion.release();
    await verificarYMigrarEsquema();
    return true;
  } catch (error) {
    console.warn("⚠️ No se pudo conectar a MySQL:", error.message);
    console.warn("👉 Verifica las credenciales de Aiven.io y que el estado del servicio esté 'Running'.");
    return false;
  }
};
