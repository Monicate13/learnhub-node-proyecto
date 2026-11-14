// src/services/api.ts
// Capa de comunicación centralizada con el backend de Node.js (LearnHub API)

import { type CourseItem } from '../views/CatalogView';

export const API_BASE_URL = "https://learnhub-node-backend.vercel.app";

// Helper para obtener el token JWT guardado
export const getAuthToken = (): string | null => {
  return localStorage.getItem('learnhub_jwt');
};

// Adaptador: Convierte las propiedades del backend (SQL / Node) al formato que usa el frontend (React)
export const adaptarCurso = (c: any): CourseItem => {
  const nivelValido = ['Principiante', 'Intermedio', 'Avanzado'].includes(c.nivel) 
    ? (c.nivel as 'Principiante' | 'Intermedio' | 'Avanzado')
    : 'Intermedio';

  const statusValido = (c.estado_publicacion?.toUpperCase() === 'BORRADOR' || c.status?.toUpperCase() === 'BORRADOR')
    ? 'BORRADOR'
    : 'PUBLICADO';

  let modulosList = [];
  if (c.modules && Array.isArray(c.modules) && c.modules.length > 0) {
    modulosList = c.modules;
  } else if (c.contenido_modulos) {
    try {
      modulosList = typeof c.contenido_modulos === 'string' ? JSON.parse(c.contenido_modulos) : c.contenido_modulos;
    } catch {
      modulosList = [];
    }
  } else if (c.temario && Array.isArray(c.temario) && c.temario.length > 0) {
    modulosList = c.temario.map((m: any) => ({
      title: m.titulo || m.title,
      duration: m.duration || '1h 30m',
      lessons: (m.lecciones || m.lessons || []).map((l: any) => ({
        title: l.titulo || l.title,
        time: l.duracion_seg
          ? `${Math.floor(l.duracion_seg / 60)}:${String(l.duracion_seg % 60).padStart(2, '0')}`
          : (l.time || '15:00'),
        free: Boolean(l.free || l.gratis),
        video_url: l.video_url,
      })),
    }));
  }

  const totalLeccionesCalc = modulosList.length > 0
    ? modulosList.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0)
    : (c.total_lecciones ?? c.lessons ?? 1);

  let recursosList = [];
  if (c.recursos && Array.isArray(c.recursos)) {
    recursosList = c.recursos;
  } else if (c.recursos) {
    try {
      recursosList = typeof c.recursos === 'string' ? JSON.parse(c.recursos) : c.recursos;
    } catch {
      recursosList = [];
    }
  }

  let preguntasList = null;
  if (c.evaluacion_preguntas && Array.isArray(c.evaluacion_preguntas)) {
    preguntasList = c.evaluacion_preguntas;
  } else if (c.evaluacion_preguntas) {
    try {
      preguntasList = typeof c.evaluacion_preguntas === 'string' ? JSON.parse(c.evaluacion_preguntas) : c.evaluacion_preguntas;
    } catch {
      preguntasList = null;
    }
  }

  return {
    id: c.id_curso ?? c.id,
    title: c.titulo ?? c.title,
    category: c.categoria_nombre ?? c.category ?? 'General',
    level: nivelValido,
    instructor: c.instructor ?? 'Roberto Cruz',
    rating: Number(c.valoracion ?? c.rating ?? 5.0),
    reviews: Number(c.total_estudiantes ?? c.reviews ?? 0),
    students: Number(c.total_estudiantes ?? c.students ?? 0),
    duration: c.duracion ?? c.duration ?? '25h 0m',
    lessons: totalLeccionesCalc,
    price: Number(c.precio ?? c.price ?? 0),
    status: statusValido,
    image: c.imagen_url ?? c.image ?? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    description: c.descripcion ?? c.description ?? '',
    modules: modulosList,
    recursos: recursosList,
    evaluacion_preguntas: preguntasList,
  };
};

// 1. Obtener cursos del catálogo (GET /api/cursos)
export const apiObtenerCursos = async (incluirBorradores: boolean = false): Promise<CourseItem[]> => {
  const url = incluirBorradores 
    ? `${API_BASE_URL}/cursos?incluir_borradores=true` 
    : `${API_BASE_URL}/cursos`;
  const res = await fetch(url);
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

// 3. Registrar nuevo estudiante o docente (POST /api/auth/registro)
export const apiRegistro = async (nombre: string, apellido: string, correo: string, contrasena: string, rol?: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, correo, contrasena, rol })
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

// Adaptador: Convierte las transacciones del backend (MySQL) al formato visual de finanzas
export const adaptarTransaccion = (t: any) => {
  const formatearFecha = (f: any) => {
    if (!f) return 'Hoy';
    try {
      const d = new Date(f);
      if (isNaN(d.getTime())) return String(f);
      return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(f);
    }
  };

  const tipoNormalizado = (t.tipo === 'Suscripcion' || t.tipo === 'SUSCRIPCIÓN' || t.type === 'SUSCRIPCIÓN')
    ? 'SUSCRIPCIÓN'
    : 'INDIVIDUAL';

  const estadoNormalizado = (t.estado === 'Aprobada' || t.status === 'COMPLETADO' || t.status === 'Aprobada')
    ? 'COMPLETADO'
    : (t.estado === 'Reembolsada' || t.status === 'REEMBOLSADO')
    ? 'REEMBOLSADO'
    : 'FALLIDO';

  const montoNum = Number(t.monto ?? String(t.amount || '0').replace(/\D/g, '')) || 0;

  return {
    id: t.id_transaccion ? `PAY-${t.id_transaccion}` : (t.id || `PAY-${Math.floor(1000 + Math.random() * 9000)}`),
    student: t.estudiante || t.student || 'Estudiante LearnHub',
    item: t.concepto || t.item || 'Curso LearnHub',
    date: formatearFecha(t.fecha || t.date),
    method: t.metodo_pago ? `${t.metodo_pago} •••• ${t.ultimos_digitos || '0000'}` : (t.method || 'Visa •••• 4521'),
    amount: `$${montoNum}`,
    type: tipoNormalizado,
    status: estadoNormalizado,
  };
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
  const data = await res.json();
  const lista = (data.transacciones || []).map(adaptarTransaccion);
  return {
    ...data,
    transacciones: lista,
  };
};

// 10. Actualizar datos personales del perfil (PUT /api/auth/perfil)
export const apiActualizarPerfil = async (nombre: string, apellido: string) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/auth/perfil`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ nombre, apellido }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al actualizar el perfil');
  }
  return data;
};

// 11. Cambiar contraseña segura con validación de BCrypt (PUT /api/auth/cambiar-password)
export const apiCambiarPassword = async (contrasena_actual: string, contrasena_nueva: string) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/auth/cambiar-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ contrasena_actual, contrasena_nueva }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al cambiar la contraseña');
  }
  return data;
};

// 12. Crear curso en MySQL (POST /api/admin/cursos)
export const apiCrearCurso = async (cursoData: any) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/cursos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify(cursoData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al crear el curso en la base de datos');
  }
  return data;
};

// 13. Actualizar curso en MySQL (PUT /api/admin/cursos/:id)
export const apiActualizarCurso = async (id: number, cursoData: any) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/cursos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify(cursoData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al actualizar el curso en la base de datos');
  }
  return data;
};

// 14. Eliminar curso en MySQL (DELETE /api/admin/cursos/:id)
export const apiEliminarCurso = async (id: number) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/cursos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al eliminar el curso en la base de datos');
  }
  return data;
};

// 15. Consultar Foro de Preguntas del Aula Virtual (GET /api/cursos/:id/foro)
export const apiObtenerForo = async (idCurso: number) => {
  const res = await fetch(`${API_BASE_URL}/cursos/${idCurso}/foro`);
  if (!res.ok) throw new Error('Error al obtener preguntas del foro');
  return res.json();
};

// 16. Publicar nueva pregunta en el Foro (POST /api/cursos/:id/foro)
export const apiCrearPreguntaForo = async (idCurso: number, leccion: string, pregunta: string) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/cursos/${idCurso}/foro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ leccion, pregunta }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al publicar la pregunta');
  return data;
};

// 17. Responder a una pregunta del Foro (POST /api/cursos/:id/foro/:idPregunta/responder)
export const apiResponderPreguntaForo = async (idCurso: number, idPregunta: number, texto: string) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/cursos/${idCurso}/foro/${idPregunta}/responder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ texto }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al enviar la respuesta');
  return data;
};

// 18. Obtener Notas personales del curso (GET /api/cursos/:id/notas)
export const apiObtenerNotas = async (idCurso: number) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/cursos/${idCurso}/notas`, {
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener las notas');
  return res.json();
};

// 19. Guardar nueva Nota personal (POST /api/cursos/:id/notas)
export const apiGuardarNota = async (idCurso: number, leccion: string, texto: string, tiempo: string = '00:00') => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/cursos/${idCurso}/notas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ leccion, texto, tiempo }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al guardar la nota');
  return data;
};

// 20. Eliminar Nota personal (DELETE /api/cursos/:id/notas/:idNota)
export const apiEliminarNota = async (idCurso: number, idNota: number) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/cursos/${idCurso}/notas/${idNota}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al eliminar la nota');
  return data;
};

// 21. Actualizar Recursos del Curso por Docente/Admin (PUT /api/cursos/:id/recursos)
export const apiActualizarRecursos = async (idCurso: number, recursos: any[]) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/cursos/${idCurso}/recursos`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ recursos }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al guardar recursos');
  return data;
};

// 22. Actualizar Descripción del Curso por Docente/Admin (PUT /api/cursos/:id/descripcion)
export const apiActualizarDescripcion = async (idCurso: number, descripcion: string) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/cursos/${idCurso}/descripcion`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({ descripcion }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al actualizar la descripción');
  return data;
};

// 23. Obtener lista de docentes registrados en MySQL (GET /api/cursos/docentes)
export const apiObtenerDocentes = async () => {
  const res = await fetch(`${API_BASE_URL}/cursos/docentes`);
  if (!res.ok) throw new Error('Error al obtener lista de docentes');
  return res.json();
};

// 24. Obtener estudiantes inscritos en un curso (GET /api/cursos/:id/estudiantes)
export const apiObtenerEstudiantesCurso = async (idCurso: number) => {
  const jwt = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/cursos/${idCurso}/estudiantes`, {
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener lista de estudiantes');
  return res.json();
};



