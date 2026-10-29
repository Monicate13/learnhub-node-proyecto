// src/services/api.ts
// Capa de comunicación centralizada con el backend de Node.js (LearnHub API)

import { type CourseItem } from '../views/CatalogView';

export const API_BASE_URL = "http://localhost:4000/api";

// Helper para obtener el token JWT guardado
export const getAuthToken = (): string | null => {
  return localStorage.getItem('learnhub_jwt');
};

// Adaptador: Convierte las propiedades del backend (SQL / Node) al formato que usa el frontend (React)
export const adaptarCurso = (c: any): CourseItem => {
  const nivelValido = ['Principiante', 'Intermedio', 'Avanzado'].includes(c.nivel) 
    ? (c.nivel as 'Principiante' | 'Intermedio' | 'Avanzado')
    : 'Intermedio';

  const statusValido = (c.estado_publicacion?.toUpperCase() === 'BORRADOR')
    ? 'BORRADOR'
    : 'PUBLICADO';

  return {
    id: c.id_curso ?? c.id,
    title: c.titulo ?? c.title,
    category: c.categoria_nombre ?? c.category ?? 'General',
    level: nivelValido,
    instructor: c.instructor ?? 'Instructor LearnHub',
    rating: Number(c.valoracion ?? c.rating ?? 5.0),
    reviews: Number(c.total_estudiantes ?? c.reviews ?? 0),
    students: Number(c.total_estudiantes ?? c.students ?? 0),
    duration: c.duracion ?? '40h 0m',
    lessons: c.total_lecciones ?? c.lessons ?? 20,
    price: Number(c.precio ?? c.price ?? 0),
    status: statusValido,
    image: c.imagen_url ?? c.image ?? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    description: c.descripcion ?? c.description ?? '',
  };
};

// 1. Obtener cursos del catálogo público (GET /api/cursos)
export const apiObtenerCursos = async (): Promise<CourseItem[]> => {
  const res = await fetch(`${API_BASE_URL}/cursos`);
  if (!res.ok) {
    throw new Error('No se pudo conectar con el catálogo del servidor');
  }
  const data = await res.json();
  return (data.cursos || []).map(adaptarCurso);
};

// 2. Iniciar sesión (POST /api/auth/login)
export const apiLogin = async (correo: string, contrasena: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Credenciales inválidas');
  }

  return data; // { token, usuario: { id_usuario, nombre, apellido, correo, rol } }
};

// 3. Registrar nuevo estudiante (POST /api/auth/registro)
export const apiRegistro = async (nombre: string, apellido: string, correo: string, contrasena: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, correo, contrasena })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al registrar la cuenta');
  }

  return data;
};

// 4. Obtener datos de "Mi Aprendizaje" (GET /api/aprendizaje/mi-aprendizaje)
export const apiObtenerMiAprendizaje = async (token?: string) => {
  const jwt = token || getAuthToken();
  const res = await fetch(`${API_BASE_URL}/aprendizaje/mi-aprendizaje`, {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al cargar tu aprendizaje');
  }

  return data;
};

// 5. Registrar avance de una lección (POST /api/aprendizaje/progreso)
export const apiGuardarProgreso = async (
  id_curso: number, 
  id_leccion: number, 
  segundo_actual: number, 
  completada: boolean
) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/aprendizaje/progreso`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify({ id_curso, id_leccion, segundo_actual, completada })
  });

  return res.json();
};

// 6. Comprar curso en Sandbox (POST /api/pagos/comprar)
export const apiComprarCurso = async (id_curso: number, numero_tarjeta: string) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/pagos/comprar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify({ id_curso, numero_tarjeta })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Pago rechazado');
  return data;
};

// 7. Suscribir a membresía (POST /api/pagos/suscribir)
export const apiSuscribirPlan = async (id_plan: number, numero_tarjeta: string) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/pagos/suscribir`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify({ id_plan, numero_tarjeta })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Suscripción no aprobada');
  return data;
};

// 8. Métricas del Dashboard de Administración (GET /api/admin/dashboard)
export const apiObtenerMetricasAdmin = async () => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });

  if (!res.ok) throw new Error('Error al consultar métricas administrativas');
  return res.json();
};

// 9. Historial de transacciones financieras (GET /api/admin/transacciones)
export const apiObtenerTransaccionesAdmin = async () => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/transacciones`, {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });

  if (!res.ok) throw new Error('Error al consultar transacciones');
  return res.json();
};
