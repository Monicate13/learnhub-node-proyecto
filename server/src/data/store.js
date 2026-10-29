// Base de datos en memoria para LearnHub basada en el modelo físico de 15 tablas (Anexo A)
// Permite que la API funcione inmediatamente y sea fácil de conectar a PostgreSQL / SQL Server luego.

export const db = {
  roles: [
    { id_rol: 1, nombre_rol: "Estudiante" },
    { id_rol: 2, nombre_rol: "Administrador" }
  ],

  usuarios: [
    {
      id_usuario: 1,
      id_rol: 2,
      nombre: "Roberto",
      apellido: "Cruz",
      correo: "admin@learnhub.com",
      // Contraseña hasheada (clave de prueba: 'admin123')
      contrasena_hash: "$2a$10$wK1Gv/1bS8P74Xw8f4jB9eOq52k34M810Z66s3tY7s03q38Qo972e",
      fecha_registro: "2026-08-10T10:00:00Z",
      estado: "Activo"
    },
    {
      id_usuario: 2,
      id_rol: 1,
      nombre: "Jorge",
      apellido: "López",
      correo: "jorge@learnhub.com",
      contrasena_hash: "$2a$10$wK1Gv/1bS8P74Xw8f4jB9eOq52k34M810Z66s3tY7s03q38Qo972e",
      fecha_registro: "2026-08-15T12:30:00Z",
      estado: "Activo"
    },
    {
      id_usuario: 3,
      id_rol: 1,
      nombre: "Ana",
      apellido: "García",
      correo: "ana@learnhub.com",
      contrasena_hash: "$2a$10$wK1Gv/1bS8P74Xw8f4jB9eOq52k34M810Z66s3tY7s03q38Qo972e",
      fecha_registro: "2026-08-20T14:15:00Z",
      estado: "Activo"
    }
  ],

  categorias: [
    { id_categoria: 1, nombre: "Data Science" },
    { id_categoria: 2, nombre: "Frontend" },
    { id_categoria: 3, nombre: "Backend" },
    { id_categoria: 4, nombre: "DevOps" },
    { id_categoria: 5, nombre: "IA & ML" },
    { id_categoria: 6, nombre: "Mobile" }
  ],

  cursos: [
    {
      id_curso: 1,
      id_categoria: 1,
      id_administrador: 1,
      titulo: "Python para Ciencia de Datos",
      descripcion: "Aprende Python aplicado a ciencia de datos con NumPy, Pandas, Matplotlib y Scikit-learn. Desde fundamentos hasta proyectos reales.",
      instructor: "Valentina Torres",
      nivel: "Intermedio",
      modelo_cobro: "Membresia",
      precio: 0,
      valoracion: 4.9,
      total_estudiantes: 1842,
      estado_publicacion: "Publicado",
      imagen_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
    },
    {
      id_curso: 2,
      id_categoria: 2,
      id_administrador: 1,
      titulo: "React + TypeScript: Aplicaciones Modernas",
      descripcion: "Construye aplicaciones frontend de nivel producción con React 19, TypeScript, Tailwind CSS y buenas prácticas de arquitectura.",
      instructor: "Carlos Ruiz",
      nivel: "Avanzado",
      modelo_cobro: "Individual",
      precio: 89.00,
      valoracion: 4.8,
      total_estudiantes: 2103,
      estado_publicacion: "Publicado",
      imagen_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80"
    },
    {
      id_curso: 3,
      id_categoria: 3,
      id_administrador: 1,
      titulo: "JavaScript Full Stack con Node.js",
      descripcion: "Desarrollo completo con Node.js, Express, autenticación JWT, WebSockets y bases de datos relacionales y NoSQL.",
      instructor: "Valentina Torres",
      nivel: "Intermedio",
      modelo_cobro: "Ambos",
      precio: 119.00,
      valoracion: 4.9,
      total_estudiantes: 3241,
      estado_publicacion: "Publicado",
      imagen_url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&auto=format&fit=crop&q=80"
    },
    {
      id_curso: 4,
      id_categoria: 4,
      id_administrador: 1,
      titulo: "DevOps con Docker y Kubernetes",
      descripcion: "Domina la contenerización, orquestación de clústeres, pipelines CI/CD y despliegue en entornos de nube.",
      instructor: "Diego Fernández",
      nivel: "Intermedio",
      modelo_cobro: "Membresia",
      precio: 0,
      valoracion: 4.7,
      total_estudiantes: 987,
      estado_publicacion: "Publicado",
      imagen_url: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&auto=format&fit=crop&q=80"
    }
  ],

  modulos: [
    { id_modulo: 1, id_curso: 1, titulo: "1. Introducción a Python", orden: 1 },
    { id_modulo: 2, id_curso: 1, titulo: "2. Fundamentos y Estructuras", orden: 2 },
    { id_modulo: 3, id_curso: 1, titulo: "3. Bibliotecas de Análisis de Datos", orden: 3 },
    { id_modulo: 4, id_curso: 2, titulo: "1. Arquitectura con TypeScript", orden: 1 },
    { id_modulo: 5, id_curso: 3, titulo: "1. Fundamentos de Node y Express", orden: 1 }
  ],

  lecciones: [
    {
      id_leccion: 1,
      id_modulo: 1,
      titulo: "Bienvenida al curso",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      duracion_seg: 204,
      orden: 1
    },
    {
      id_leccion: 2,
      id_modulo: 1,
      titulo: "Configuración del entorno",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      duracion_seg: 765,
      orden: 2
    },
    {
      id_leccion: 3,
      id_modulo: 2,
      titulo: "Variables y tipos de datos",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      duracion_seg: 1112,
      orden: 1
    },
    {
      id_leccion: 4,
      id_modulo: 2,
      titulo: "Estructuras de control",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      duracion_seg: 1334,
      orden: 2
    },
    {
      id_leccion: 5,
      id_modulo: 2,
      titulo: "Funciones y módulos",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      duracion_seg: 1687,
      orden: 3
    }
  ],

  planes_membresia: [
    {
      id_plan: 1,
      nombre: "Membresía Pro Mensual",
      descripcion: "Acceso ilimitado al catálogo completo, actualizaciones y soporte.",
      precio: 29.00,
      periodicidad: "Mensual",
      estado: "Activo"
    },
    {
      id_plan: 2,
      nombre: "Membresía Pro Anual (-20%)",
      descripcion: "Acceso ilimitado por un año completo con descuento especial.",
      precio: 278.00,
      periodicidad: "Anual",
      estado: "Activo"
    }
  ],

  suscripciones: [
    {
      id_suscripcion: 1,
      id_usuario: 2, // Jorge López
      id_plan: 1,
      fecha_inicio: "2026-09-01T00:00:00Z",
      fecha_vencimiento: "2026-11-01T00:00:00Z",
      renovacion_automatica: true,
      estado: "Activa"
    }
  ],

  transacciones: [
    {
      id_transaccion: "PAY-8821",
      id_usuario: 2,
      id_curso: 2,
      id_suscripcion: null,
      tipo: "Compra",
      metodo_pago: "Visa •••• 4521",
      monto: 89.00,
      estado: "Aprobada",
      referencia_pasarela: "SBX-998821",
      ultimos_digitos: "4521",
      transaccion_original_id: null,
      fecha: "2026-09-30T10:14:00Z"
    },
    {
      id_transaccion: "SUB-3341",
      id_usuario: 3,
      id_curso: null,
      id_suscripcion: 1,
      tipo: "Suscripcion",
      metodo_pago: "Mastercard •••• 7823",
      monto: 29.00,
      estado: "Aprobada",
      referencia_pasarela: "SBX-773341",
      ultimos_digitos: "7823",
      transaccion_original_id: null,
      fecha: "2026-09-29T14:20:00Z"
    },
    {
      id_transaccion: "PAY-8818",
      id_usuario: 2,
      id_curso: 1,
      id_suscripcion: null,
      tipo: "Reembolso",
      metodo_pago: "Mastercard •••• 3456",
      monto: 49.00,
      estado: "Reembolsada",
      referencia_pasarela: "SBX-REF-8818",
      ultimos_digitos: "3456",
      transaccion_original_id: "PAY-8800", // Corregido el defecto de auditoría
      fecha: "2026-09-27T16:00:00Z"
    }
  ],

  inscripciones: [
    {
      id_inscripcion: 1,
      id_usuario: 2, // Jorge
      id_curso: 1,   // Python Data Science
      id_transaccion: null,
      origen: "Membresia",
      fecha_inscripcion: "2026-09-02T10:00:00Z",
      porcentaje_avance: 23.08
    },
    {
      id_inscripcion: 2,
      id_usuario: 2, // Jorge
      id_curso: 2,   // React
      id_transaccion: "PAY-8821",
      origen: "Compra",
      fecha_inscripcion: "2026-09-30T10:15:00Z",
      porcentaje_avance: 61.54
    }
  ],

  progreso_lecciones: [
    {
      id_progreso: 1,
      id_inscripcion: 1,
      id_leccion: 1,
      segundo_actual: 204,
      completada: true,
      fecha_actualizacion: "2026-09-05T11:00:00Z"
    },
    {
      id_progreso: 2,
      id_inscripcion: 1,
      id_leccion: 2,
      segundo_actual: 765,
      completada: true,
      fecha_actualizacion: "2026-09-08T15:20:00Z"
    },
    {
      id_progreso: 3,
      id_inscripcion: 1,
      id_leccion: 3,
      segundo_actual: 632,
      completada: false,
      fecha_actualizacion: "2026-09-12T19:40:00Z"
    }
  ]
};
