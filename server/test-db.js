import { pool, probarConexion } from "./src/config/db.js";

async function verificarConexionMySQL() {
  console.log("==================================================");
  console.log("🔍 Verificando conexión entre Node.js y MySQL...");
  console.log("==================================================");

  const conecto = await probarConexion();

  if (!conecto) {
    console.error("\n❌ No se pudo conectar a MySQL.");
    console.error("👉 Asegúrate de que:");
    console.error("   1. MySQL esté iniciado (servicio MySQL corriendo).");
    console.error("   2. La contraseña en server/.env sea la correcta.");
    console.error("   3. Ejecutaste el script LearnHub_BD_MySQL.sql en Workbench.");
    process.exit(1);
  }

  try {
    // 1. Consultar cursos directamente desde MySQL
    const [cursos] = await pool.query(
      "SELECT id_curso, titulo, nivel, modelo_cobro, precio FROM Curso"
    );

    console.log("\n📦 Cursos recuperados en tiempo real desde MySQL:");
    console.table(cursos);

    // 2. Consultar usuarios
    const [usuarios] = await pool.query(
      "SELECT id_usuario, nombre, apellido, correo, estado FROM Usuario"
    );

    console.log("\n👥 Usuarios registrados en MySQL:");
    console.table(usuarios);

    console.log("\n🎉 ¡ÉXITO! Tu backend en VS Code y tu base de datos MySQL están 100% comunicados.");
    process.exit(0);
  } catch (error) {
    console.error("Error al consultar tablas:", error.message);
    process.exit(1);
  }
}

verificarConexionMySQL();
