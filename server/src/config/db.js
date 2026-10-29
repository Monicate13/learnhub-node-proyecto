import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

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

// Función para probar la conexión
export const probarConexion = async () => {
  try {
    const conexion = await pool.getConnection();
    console.log(`✅ Conexión exitosa a MySQL en Aiven Cloud (${dbConfig.database} en ${dbConfig.host})`);
    conexion.release();
    return true;
  } catch (error) {
    console.warn("⚠️ No se pudo conectar a MySQL:", error.message);
    console.warn("👉 Verifica las credenciales de Aiven.io y que el estado del servicio esté 'Running'.");
    return false;
  }
};
