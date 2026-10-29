import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 1. Cargar las variables de entorno desde el archivo .env
dotenv.config();

// 2. Inicializar la aplicación de Express
const app = express();
const PORT = process.env.PORT || 4000;

// 3. Middlewares esenciales
// cors: permite que clientes (como React en localhost:5173) puedan hacer peticiones a este backend
app.use(cors());

// express.json: permite a Express entender datos en formato JSON enviados en el body de peticiones POST/PUT
app.use(express.json());

// 4. Rutas básicas de prueba
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    message: "¡Servidor Backend en Node.js y Express funcionando correctamente!",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/mensaje", (req, res) => {
  res.json({
    titulo: "Bienvenido a tu Fullstack App",
    descripcion: "Este dato proviene desde tu servidor Node.js y será consumido por tu cliente React."
  });
});

// 5. Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en: http://localhost:${PORT}`);
  console.log(`Prueba el endpoint en: http://localhost:${PORT}/api/status`);
});
