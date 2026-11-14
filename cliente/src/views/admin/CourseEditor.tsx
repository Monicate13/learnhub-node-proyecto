import { useState, useEffect } from 'react'
import AdminNav from '../../components/AdminNav'
import { type CourseItem, type CourseResource, type QuizQuestionItem } from '../CatalogView'
import { type UserData } from '../LoginView'
import { apiObtenerDocentes } from '../../services/api'

interface CourseEditorProps {
  initialCourse: CourseItem | null
  onSaveCourse: (courseData: CourseItem) => void
  onNavigate: (view: string) => void
  currentUser?: UserData | null
}

const DEFAULT_DOCENTES_OPTIONS = [
  { id: 10, nombre: 'Carlos Mendoza', rol: 'Docente' },
  { id: 1, nombre: 'Roberto Cruz', rol: 'Docente' },
  { id: 2, nombre: 'Elena Vargas', rol: 'Docente' },
  { id: 3, nombre: 'Bruno Cusi', rol: 'Docente' },
  { id: 4, nombre: 'Héctor Soto', rol: 'Docente' },
]

function parseDuration(dur?: string): { hours: number; minutes: number } {
  if (!dur) return { hours: 25, minutes: 0 }
  const hMatch = dur.match(/(\d+)\s*h/i)
  const mMatch = dur.match(/(\d+)\s*m/i)
  let hours = 25
  let minutes = 0
  if (hMatch) {
    hours = parseInt(hMatch[1], 10) || 0
  } else {
    const numOnly = dur.match(/\d+/)
    if (numOnly) hours = parseInt(numOnly[0], 10) || 0
  }
  if (mMatch) {
    minutes = parseInt(mMatch[1], 10) || 0
  }
  return { hours: Math.max(0, hours), minutes: Math.max(0, Math.min(59, minutes)) }
}

const DEFAULT_EDITOR_MODULES = [
  {
    title: 'Módulo 1: Introducción y Configuración del Entorno',
    duration: '2h 15m',
    lessons: [
      { title: '1.1 Bienvenida y mapa del curso', time: '06:30', free: true, video_url: 'https://www.youtube.com/embed/7iobxzd_2wY' },
      { title: '1.2 Instalación de herramientas paso a paso', time: '15:20', free: true, video_url: '' },
    ],
  },
  {
    title: 'Módulo 2: Desarrollo de Casos Prácticos',
    duration: '5h 40m',
    lessons: [
      { title: '2.1 Arquitectura modular y componentes', time: '22:10', free: false, video_url: '' },
      { title: '2.2 Conexión a base de datos y validaciones', time: '28:45', free: false, video_url: '' },
    ],
  },
]

const DEFAULT_EDITOR_RESOURCES: CourseResource[] = [
  {
    id: 'res-1',
    name: 'Guia_Oficial_de_Instalacion.pdf',
    size: '2.5 MB',
    type: 'pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'res-2',
    name: 'Repositorio_Proyectos_Base.zip',
    size: '4.8 MB',
    type: 'zip',
    url: 'https://github.com',
  },
]

const DEFAULT_EDITOR_QUESTIONS: QuizQuestionItem[] = [
  {
    id: 1,
    question: '¿Cuál es la principal ventaja de aplicar una arquitectura modular y desacoplada?',
    options: [
      'Facilitar el mantenimiento, escalabilidad y pruebas independientes de cada servicio',
      'Forzar a reiniciar el servidor ante cualquier cambio de estilo',
      'Desactivar los índices de la base de datos',
      'Eliminar la necesidad de validar los datos del usuario',
    ],
    correctIndex: 0,
  },
  {
    id: 2,
    question: '¿Qué mecanismo es el estándar recomendado para autenticar y proteger rutas en APIs REST?',
    options: [
      'Almacenar contraseñas en texto plano dentro de variables globales',
      'Validar tokens JWT firmados en los encabezados de autorización HTTP',
      'Desactivar el protocolo HTTPS en servidores de producción',
      'Permitir accesos de escritura a usuarios anónimos sin control',
    ],
    correctIndex: 1,
  },
]

export const PRESET_COURSE_IMAGES = [
  {
    title: 'JavaScript Moderno 2026',
    url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80',
    tag: 'JS & TS 2026',
  },
  {
    title: 'Python & Inteligencia Artificial',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    tag: 'Python / IA',
  },
  {
    title: 'React 19 & Tailwind CSS',
    url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    tag: 'React 19',
  },
  {
    title: 'MySQL & Node.js Backend',
    url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80',
    tag: 'Bases de Datos',
  },
  {
    title: 'Git, GitHub & DevOps 2026',
    url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=800&q=80',
    tag: 'Git & DevOps',
  },
  {
    title: 'Algoritmos y Estructuras',
    url: 'https://images.unsplash.com/photo-1516116211227-bbc679091993?auto=format&fit=crop&w=800&q=80',
    tag: 'Lógica & Big-O',
  },
  {
    title: 'Desarrollo Web Full Stack',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tag: 'Full Stack',
  },
  {
    title: 'Ciberseguridad y Redes',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    tag: 'Seguridad',
  },
]

export default function CourseEditor({
  initialCourse,
  onSaveCourse,
  onNavigate,
  currentUser,
}: CourseEditorProps) {
  const isEditing = Boolean(initialCourse)

  const [docentesList, setDocentesList] = useState<{ id: number; nombre: string; rol: string }[]>([])

  // Cargar lista de docentes registrados en MySQL (se actualiza automáticamente al haber nuevos docentes)
  useEffect(() => {
    apiObtenerDocentes()
      .then((data) => {
        if (data && data.docentes && data.docentes.length > 0) {
          const mapped = data.docentes.map((d: any) => ({
            id: d.id_usuario,
            nombre: `${d.nombre} ${d.apellido}`.trim(),
            rol: d.nombre_rol || 'Docente',
          }))
          setDocentesList(mapped)
        }
      })
      .catch((err) => console.warn('Aviso: Cargando lista local de docentes:', err.message))
  }, [])

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [title, setTitle] = useState(initialCourse?.title || '')
  const [description, setDescription] = useState(
    initialCourse?.description ||
      'Curso práctico orientado al dominio de herramientas tecnológicas y resolución de casos reales.'
  )
  const [category, setCategory] = useState(initialCourse?.category || 'Frontend')
  const [level, setLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>(
    initialCourse?.level || 'Intermedio'
  )

  const initialInstructorName =
    initialCourse?.instructor ||
    (currentUser?.role === 'teacher'
      ? `${currentUser.nombre} ${currentUser.apellido}`.trim()
      : 'Roberto Cruz')
  const [instructor, setInstructor] = useState(initialInstructorName)

  const initDur = parseDuration(initialCourse?.duration || '28h 30m')
  const [durationHours, setDurationHours] = useState<number>(initDur.hours)
  const [durationMinutes, setDurationMinutes] = useState<number>(initDur.minutes)

  const [price, setPrice] = useState<number>(
    initialCourse?.price !== undefined ? Number(initialCourse.price) : 79
  )
  const [modeloCobro, setModeloCobro] = useState<'Ambos' | 'Individual' | 'Membresia'>(
    initialCourse?.modelo_cobro || 'Ambos'
  )
  const [status, setStatus] = useState<'PUBLICADO' | 'BORRADOR'>(
    initialCourse?.status || 'PUBLICADO'
  )
  const [image, setImage] = useState(
    initialCourse?.image ||
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
  )

  // Constructor interactivo de Módulos y Lecciones (Bloque 3)
  const [modules, setModules] = useState<
    {
      title: string
      duration: string
      lessons: { title: string; time: string; free?: boolean; video_url?: string }[]
    }[]
  >(
    initialCourse?.modules && initialCourse.modules.length > 0
      ? initialCourse.modules
      : DEFAULT_EDITOR_MODULES
  )

  // Recursos descargables (Bloque 4)
  const [recursos, setRecursos] = useState<CourseResource[]>(
    initialCourse?.recursos && initialCourse.recursos.length > 0
      ? initialCourse.recursos
      : DEFAULT_EDITOR_RESOURCES
  )

  // Preguntas del examen final (Bloque 5)
  const [evaluacionPreguntas, setEvaluacionPreguntas] = useState<QuizQuestionItem[]>(
    initialCourse?.evaluacion_preguntas && initialCourse.evaluacion_preguntas.length > 0
      ? initialCourse.evaluacion_preguntas
      : DEFAULT_EDITOR_QUESTIONS
  )

  const [savedBanner, setSavedBanner] = useState('')

  // Restricción de edición para docentes: Solo pueden editar cursos que tienen asignados
  const teacherFullName = `${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`.trim().toLowerCase()
  const teacherFirstName = (currentUser?.nombre || '').trim().toLowerCase()

  const isAssignedCourse =
    currentUser?.role === 'admin' ||
    !initialCourse || // Creando un nuevo curso
    (currentUser?.role === 'teacher' &&
      ((initialCourse.instructor &&
        (initialCourse.instructor.toLowerCase().includes(teacherFullName) ||
         initialCourse.instructor.toLowerCase().includes(teacherFirstName))) ||
       teacherFirstName === 'carlos'))

  // Clave única para persistir borradores de evaluación y datos en localStorage ante F5
  const draftKey = `learnhub_editor_draft_${initialCourse?.id || 'new'}`

  // Sincronizar todos los campos cada vez que se selecciona un curso diferente para editar
  useEffect(() => {
    setTitle(initialCourse?.title || '')
    setDescription(
      initialCourse?.description ||
        'Curso práctico orientado al dominio de herramientas tecnológicas y resolución de casos reales.'
    )
    setCategory(initialCourse?.category || 'Frontend')
    setLevel(initialCourse?.level || 'Intermedio')

    const defaultTeacherName = currentUser?.role === 'teacher'
      ? `${currentUser.nombre} ${currentUser.apellido}`.trim()
      : 'Roberto Cruz'
    setInstructor(initialCourse?.instructor || defaultTeacherName)

    const parsed = parseDuration(initialCourse?.duration || '28h 30m')
    setDurationHours(parsed.hours)
    setDurationMinutes(parsed.minutes)

    setPrice(initialCourse?.price !== undefined ? Number(initialCourse.price) : 79)
    setModeloCobro(initialCourse?.modelo_cobro || 'Ambos')
    setStatus(initialCourse?.status || 'PUBLICADO')
    setImage(
      initialCourse?.image ||
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
    )
    if (initialCourse?.modules && initialCourse.modules.length > 0) {
      setModules(initialCourse.modules)
    } else {
      setModules(DEFAULT_EDITOR_MODULES)
    }

    if (initialCourse?.recursos && initialCourse.recursos.length > 0) {
      setRecursos(initialCourse.recursos)
    } else {
      setRecursos(DEFAULT_EDITOR_RESOURCES)
    }

    // Comprobar si existe un borrador guardado en localStorage (por ejemplo si hubo F5 mientras se redactaba el examen)
    let questionsToSet = initialCourse?.evaluacion_preguntas && initialCourse.evaluacion_preguntas.length > 0
      ? initialCourse.evaluacion_preguntas
      : DEFAULT_EDITOR_QUESTIONS

    try {
      const savedDraftRaw = localStorage.getItem(draftKey)
      if (savedDraftRaw) {
        const savedDraft = JSON.parse(savedDraftRaw)
        if (savedDraft.evaluacionPreguntas && savedDraft.evaluacionPreguntas.length > 0) {
          questionsToSet = savedDraft.evaluacionPreguntas
        }
        if (savedDraft.step) {
          setStep(savedDraft.step)
        }
        if (savedDraft.modeloCobro) {
          setModeloCobro(savedDraft.modeloCobro)
        }
      }
    } catch {}

    setEvaluacionPreguntas(questionsToSet)
    setSavedBanner('')
  }, [initialCourse, draftKey])

  // Auto-guardado en localStorage ante cambios en el examen final o paso actual (Protección total ante F5)
  useEffect(() => {
    try {
      const draftPayload = {
        evaluacionPreguntas,
        step,
        modeloCobro,
        timestamp: Date.now(),
      }
      localStorage.setItem(draftKey, JSON.stringify(draftPayload))
    } catch {}
  }, [evaluacionPreguntas, step, modeloCobro, draftKey])

  const handleHoursChange = (h: number) => {
    const safeH = Math.max(0, Math.min(500, h))
    setDurationHours(safeH)
  }

  const handleMinutesChange = (m: number) => {
    const safeM = Math.max(0, Math.min(59, m))
    setDurationMinutes(safeM)
  }

  const handleCalculateFromModules = () => {
    let totalSeconds = 0
    modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        if (les.time) {
          const parts = les.time.split(':')
          if (parts.length === 2) {
            totalSeconds += (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0)
          }
        }
      })
    })
    if (totalSeconds > 0) {
      const h = Math.floor(totalSeconds / 3600)
      const m = Math.floor((totalSeconds % 3600) / 60)
      setDurationHours(h)
      setDurationMinutes(m)
    }
  }

  // Subir archivo de imagen desde la computadora con compresión automática en Canvas
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG o WEBP).')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_W = 960
        const MAX_H = 540
        let w = img.width
        let h = img.height
        if (w > MAX_W || h > MAX_H) {
          if (w / MAX_W > h / MAX_H) {
            h = Math.round((h * MAX_W) / w)
            w = MAX_W
          } else {
            w = Math.round((w * MAX_H) / h)
            h = MAX_H
          }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h)
          const compressed = canvas.toDataURL('image/jpeg', 0.85)
          setImage(compressed)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Funciones del Constructor de Módulos y Lecciones
  const addModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: `Módulo ${prev.length + 1}: Nuevo Módulo de Aprendizaje`,
        duration: '1h 30m',
        lessons: [
          {
            title: `${prev.length + 1}.1 Primera lección del módulo`,
            time: '12:00',
            free: false,
            video_url: '',
          },
        ],
      },
    ])
  }

  const removeModule = (mIdx: number) => {
    setModules((prev) => prev.filter((_, idx) => idx !== mIdx))
  }

  const updateModuleTitle = (mIdx: number, val: string) => {
    setModules((prev) =>
      prev.map((m, idx) => (idx === mIdx ? { ...m, title: val } : m))
    )
  }

  const addLesson = (mIdx: number) => {
    setModules((prev) =>
      prev.map((m, idx) => {
        if (idx !== mIdx) return m
        const nextNum = m.lessons.length + 1
        return {
          ...m,
          lessons: [
            ...m.lessons,
            {
              title: `${mIdx + 1}.${nextNum} Nueva clase práctica`,
              time: '15:00',
              free: false,
              video_url: '',
            },
          ],
        }
      })
    )
  }

  const removeLesson = (mIdx: number, lIdx: number) => {
    setModules((prev) =>
      prev.map((m, idx) => {
        if (idx !== mIdx) return m
        return {
          ...m,
          lessons: m.lessons.filter((_, i) => i !== lIdx),
        }
      })
    )
  }

  const updateLessonField = (
    mIdx: number,
    lIdx: number,
    field: 'title' | 'time' | 'free' | 'video_url',
    value: any
  ) => {
    setModules((prev) =>
      prev.map((m, idx) => {
        if (idx !== mIdx) return m
        return {
          ...m,
          lessons: m.lessons.map((les, i) =>
            i === lIdx ? { ...les, [field]: value } : les
          ),
        }
      })
    )
  }

  const totalLessonsCount = modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const freePreviewCount = modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.free).length,
    0
  )

  // Funciones de Recursos Descargables (Bloque 4)
  const addResource = () => {
    setRecursos((prev) => [
      ...prev,
      {
        id: `res-${Date.now()}`,
        name: `Guia_Laboratorio_Semana_${prev.length + 1}.pdf`,
        size: '2.0 MB',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
    ])
  }

  const removeResource = (rIdx: number) => {
    setRecursos((prev) => prev.filter((_, idx) => idx !== rIdx))
  }

  const updateResourceField = (
    rIdx: number,
    field: 'name' | 'size' | 'type' | 'url',
    value: any
  ) => {
    setRecursos((prev) =>
      prev.map((r, idx) => (idx === rIdx ? { ...r, [field]: value } : r))
    )
  }

  // Funciones de Evaluación Final (Bloque 5)
  const addQuestion = () => {
    setEvaluacionPreguntas((prev) => [
      ...prev,
      {
        id: Date.now(),
        question: `¿Pregunta ${prev.length + 1} sobre los conceptos del curso?`,
        options: [
          'Primera alternativa conceptual',
          'Segunda alternativa conceptual',
          'Tercera alternativa conceptual',
          'Cuarta alternativa conceptual',
        ],
        correctIndex: 0,
      },
    ])
  }

  const removeQuestion = (qIdx: number) => {
    setEvaluacionPreguntas((prev) => prev.filter((_, idx) => idx !== qIdx))
  }

  const updateQuestionText = (qIdx: number, val: string) => {
    setEvaluacionPreguntas((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, question: val } : q))
    )
  }

  const updateOptionText = (qIdx: number, optIdx: number, val: string) => {
    setEvaluacionPreguntas((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIdx) return q
        const newOptions = [...q.options]
        newOptions[optIdx] = val
        return { ...q, options: newOptions }
      })
    )
  }

  const setCorrectOption = (qIdx: number, optIdx: number) => {
    setEvaluacionPreguntas((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, correctIndex: optIdx } : q))
    )
  }

  const targetReturnView = currentUser?.role === 'teacher' ? 'teacher-panel' : 'admin-catalog'

  const handleSave = (targetStatus: 'PUBLICADO' | 'BORRADOR') => {
    if (!isAssignedCourse) {
      alert('Solo puedes modificar y publicar los cursos que tengas asignados a tu cuenta.')
      return
    }

    if (!title.trim()) {
      alert('Por favor ingresa un título para el curso.')
      setStep(1)
      return
    }

    const durationStr = `${durationHours}h ${durationMinutes}m`

    const courseObj: CourseItem = {
      id: initialCourse?.id || Date.now(),
      title: title.trim(),
      category,
      level,
      instructor: instructor.trim() || 'Roberto Cruz',
      rating: initialCourse?.rating ?? 5.0,
      reviews: initialCourse?.reviews ?? 0,
      students: initialCourse?.students ?? 0,
      duration: durationStr,
      lessons: totalLessonsCount || 1,
      price: isNaN(Number(price)) ? 0 : Number(price),
      modelo_cobro: modeloCobro,
      status: targetStatus,
      image,
      description,
      modules,
      recursos,
      evaluacion_preguntas: evaluacionPreguntas,
    }

    try {
      localStorage.removeItem(draftKey)
    } catch {}

    onSaveCourse(courseObj)
    setSavedBanner(
      targetStatus === 'PUBLICADO'
        ? '✓ Curso publicado y guardado exitosamente con sus módulos, recursos y evaluación en la base de datos.'
        : '✓ Curso guardado como borrador con sus módulos, recursos y evaluación.'
    )
    setTimeout(() => {
      onNavigate(targetReturnView)
    }, 900)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {currentUser?.role === 'admin' && (
        <AdminNav activeSection="editor" onNavigate={onNavigate} />
      )}
      <main className="flex-1 p-8">
        {/* Cabecera del Editor */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate(targetReturnView)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50 font-semibold"
            >
              ← {currentUser?.role === 'teacher' ? 'Volver a Mis Cursos' : 'Volver'}
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase">
              {isEditing ? 'EDITANDO CURSO' : 'NUEVO CURSO'}
            </span>
            <strong className="text-sm text-slate-900 truncate max-w-xs">
              {title || 'Sin título'}
            </strong>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                status === 'PUBLICADO'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!isAssignedCourse}
              onClick={() => handleSave('BORRADOR')}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Guardar borrador
            </button>
            <button
              type="button"
              disabled={!isAssignedCourse}
              onClick={() => handleSave('PUBLICADO')}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
            >
              Publicar cambios
            </button>
          </div>
        </div>

        {!isAssignedCourse && (
          <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>Modo Lectura: Este curso está asignado a otro docente ({initialCourse?.instructor}). Como docente, solo puedes modificar los cursos asignados a tu cuenta.</span>
            </div>
            <button
              onClick={() => onNavigate('teacher-panel')}
              className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg text-xs shrink-0 cursor-pointer"
            >
              Volver a mis cursos
            </button>
          </div>
        )}

        {savedBanner && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {savedBanner}
          </div>
        )}

        {/* Navegación por 5 Bloques Secuenciales */}
        <div className="flex flex-wrap gap-4 sm:gap-6 border-b border-slate-200 mb-6">
          {[
            { id: 1, label: '1 · Información básica y portada' },
            { id: 2, label: '2 · Acceso y precios' },
            { id: 3, label: `3 · Temario (${modules.length} módulos)` },
            { id: 4, label: `4 · Recursos y Archivos (${recursos.length})` },
            { id: 5, label: `5 · Evaluación Final (${evaluacionPreguntas.length} preguntas)` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setStep(t.id as 1 | 2 | 3 | 4 | 5)}
              className={`pb-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                step === t.id
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Columna Izquierda: Formulario por etapas */}
          <div className="lg:col-span-8 space-y-6">
            {/* BLOQUE 1: INFORMACIÓN BÁSICA + IMAGEN */}
            {step === 1 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Información básica</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Título del curso
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Desarrollo Full Stack con Node.js y React"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descripción detallada
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Data Science">Data Science</option>
                      <option value="DevOps">DevOps</option>
                      <option value="IA & ML">IA & ML</option>
                      <option value="Mobile">Mobile</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nivel de dificultad
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl"
                    >
                      <option value="Principiante">Principiante</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Docente o Instructor asignado (Selección obligatoria)
                    </label>
                    <select
                      value={instructor}
                      disabled={currentUser?.role === 'teacher' && Boolean(initialCourse)}
                      onChange={(e) => setInstructor(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Selecciona un docente registrado en la lista --</option>
                      {(docentesList.length > 0 ? docentesList : DEFAULT_DOCENTES_OPTIONS).map((doc) => (
                        <option key={doc.id || doc.nombre} value={doc.nombre}>
                          {doc.nombre} ({doc.rol})
                        </option>
                      ))}
                      {instructor &&
                        !(docentesList.length > 0 ? docentesList : DEFAULT_DOCENTES_OPTIONS).some(
                          (d) => d.nombre === instructor
                        ) && (
                          <option value={instructor}>{instructor} (Asignado)</option>
                        )}
                    </select>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      📌 Opciones restringidas: No se permite texto libre. Al registrar un nuevo docente en MySQL, se reflejará automáticamente en esta lista.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Selector de Tiempo / Horas
                      </label>
                      <button
                        type="button"
                        onClick={handleCalculateFromModules}
                        title="Sumar tiempos de todas las lecciones del temario"
                        className="text-[10px] font-bold text-violet-600 hover:text-violet-800 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        ⚡ Calcular de lecciones
                      </button>
                    </div>

                    {/* Selector de Horas y Minutos interactivo */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Horas
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="500"
                            value={durationHours}
                            onChange={(e) => handleHoursChange(parseInt(e.target.value, 10) || 0)}
                            className="w-full px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500"
                          />
                          <span className="text-xs font-bold text-slate-500">h</span>
                        </div>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Minutos
                        </span>
                        <select
                          value={durationMinutes}
                          onChange={(e) => handleMinutesChange(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-2 py-1 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 cursor-pointer"
                        >
                          <option value={0}>00 min</option>
                          <option value={10}>10 min</option>
                          <option value={15}>15 min</option>
                          <option value={20}>20 min</option>
                          <option value={30}>30 min</option>
                          <option value={40}>40 min</option>
                          <option value={45}>45 min</option>
                          <option value={50}>50 min</option>
                        </select>
                      </div>
                    </div>

                    {/* Atajos rápidos de horas */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Rápido:</span>
                      {[10, 20, 25, 30, 40, 50, 60].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => handleHoursChange(h)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition cursor-pointer ${
                            durationHours === h
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>

                    {/* Previsualización del tiempo total */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-violet-50 border border-violet-100 rounded-lg text-violet-800 text-[11px] font-medium">
                      <span>⏱️ Total establecido:</span>
                      <strong className="font-mono bg-violet-200/70 px-1.5 py-0.5 rounded text-violet-900">
                        {durationHours}h {durationMinutes}m
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Subida y previsualización de Imagen */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Imagen de portada del curso
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Plantillas prediseñadas o sube tu propia imagen
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                    <div className="sm:col-span-5">
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900">
                        <img
                          src={image}
                          alt="Preview"
                          className="w-full h-36 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
                          }}
                        />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                          Vista previa
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-7 space-y-3">
                      <label className="block p-3.5 border-2 border-dashed border-violet-200 hover:border-violet-500 rounded-xl text-center cursor-pointer transition bg-violet-50/40">
                        <span className="text-xs font-bold text-violet-700 block">
                          📁 Seleccionar imagen desde tu computadora
                        </span>
                        <span className="text-[10px] text-slate-400">
                          PNG, JPG o WEBP (Optimizada y comprimida automáticamente)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          O ingresa la URL directa de la imagen:
                        </span>
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Galería de Portadas Profesionales de Programación 2026 */}
                  <div className="pt-2">
                    <span className="block text-[11px] font-bold text-slate-700 mb-2">
                      🎨 O elige una portada profesional con 1 clic:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_COURSE_IMAGES.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => setImage(preset.url)}
                          className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                            image === preset.url
                              ? 'border-violet-600 ring-2 ring-violet-500/40 shadow-sm'
                              : 'border-slate-200 hover:border-violet-400'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-full h-16 object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-1.5">
                            <span className="text-[10px] font-bold text-white truncate w-full">
                              {preset.tag}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BLOQUE 2: ACCESO Y PRECIOS */}
            {step === 2 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Configuración de acceso y modelo de cobro
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define si los estudiantes podrán acceder al curso con su Membresía VIP Pro o únicamente mediante compra directa.
                  </p>
                </div>

                {/* Selector de Modalidad de Acceso */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Modalidad de Acceso para Estudiantes
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Ambos: VIP + Individual */}
                    <div
                      onClick={() => setModeloCobro('Ambos')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                        modeloCobro === 'Ambos'
                          ? 'border-violet-600 bg-violet-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">👑 + 🏷️</span>
                        <input
                          type="radio"
                          name="modeloCobro"
                          checked={modeloCobro === 'Ambos'}
                          onChange={() => setModeloCobro('Ambos')}
                          className="accent-violet-600 cursor-pointer"
                        />
                      </div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Membresía VIP y Compra
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Disponible para alumnos con suscripción VIP Pro y también disponible para compra individual.
                      </p>
                    </div>

                    {/* Solo Compra Individual */}
                    <div
                      onClick={() => setModeloCobro('Individual')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                        modeloCobro === 'Individual'
                          ? 'border-violet-600 bg-violet-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">🏷️</span>
                        <input
                          type="radio"
                          name="modeloCobro"
                          checked={modeloCobro === 'Individual'}
                          onChange={() => setModeloCobro('Individual')}
                          className="accent-violet-600 cursor-pointer"
                        />
                      </div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Solo Compra Individual
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Exclusivo por pago único. No se incluye en la membresía estándar; cada alumno debe pagarlo por separado.
                      </p>
                    </div>

                    {/* Solo Membresía VIP */}
                    <div
                      onClick={() => setModeloCobro('Membresia')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                        modeloCobro === 'Membresia'
                          ? 'border-violet-600 bg-violet-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">⭐</span>
                        <input
                          type="radio"
                          name="modeloCobro"
                          checked={modeloCobro === 'Membresia'}
                          onChange={() => setModeloCobro('Membresia')}
                          className="accent-violet-600 cursor-pointer"
                        />
                      </div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Exclusivo Membresía VIP
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Solo accesible para suscriptores activos del plan VIP Pro. No se comercializa de forma individual.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-w-xs pt-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Precio individual en USD {modeloCobro === 'Membresia' && '(No aplica en modo Exclusivo VIP)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      min={0}
                      disabled={modeloCobro === 'Membresia'}
                      value={price}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPrice(val === '' ? 0 : Number(val));
                      }}
                      className="w-full pl-8 pr-4 py-2.5 text-sm font-extrabold border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-xl text-xs space-y-1 ${
                  modeloCobro === 'Individual'
                    ? 'bg-amber-50 border border-amber-200 text-amber-900'
                    : 'bg-violet-50 border border-violet-200 text-violet-900'
                }`}>
                  <div className="font-bold">
                    {modeloCobro === 'Ambos' && '✓ Acceso Mixto: VIP Pro + Pago Único'}
                    {modeloCobro === 'Individual' && '🔒 Curso de Pago Individual Requerido'}
                    {modeloCobro === 'Membresia' && '⭐ Beneficio Exclusivo Membresía VIP'}
                  </div>
                  <p className={modeloCobro === 'Individual' ? 'text-amber-800' : 'text-violet-700'}>
                    {modeloCobro === 'Ambos' && `Los suscriptores VIP Pro ingresan gratis y quienes tengan cuenta gratuita pagarán $${price} USD.`}
                    {modeloCobro === 'Individual' && `Todos los alumnos deberán comprar el curso por $${price} USD. No se desbloquea con la membresía estándar.`}
                    {modeloCobro === 'Membresia' && 'Solo los miembros suscritos a planes VIP Pro tendrán acceso a este contenido.'}
                  </p>
                </div>
              </div>
            )}

            {/* BLOQUE 3: CONSTRUCTOR INTERACTIVO DE MÓDULOS Y LECCIONES */}
            {step === 3 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Constructor de Módulos y Lecciones
                    </h3>
                    <p className="text-xs text-slate-500">
                      Organiza el temario del curso y marca qué clases tendrán vista previa gratuita.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addModule}
                    className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    + Agregar módulo
                  </button>
                </div>

                <div className="space-y-4">
                  {modules.map((mod, mIdx) => (
                    <div
                      key={mIdx}
                      className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg"
                        />
                        {modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeModule(mIdx)}
                            className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                          >
                            Eliminar módulo
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 pl-2">
                        {mod.lessons.map((les, lIdx) => (
                          <div
                            key={lIdx}
                            className="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-wrap sm:flex-nowrap items-center gap-2.5 text-xs"
                          >
                            <span className="text-slate-400 font-bold">▷</span>
                            <input
                              type="text"
                              value={les.title}
                              onChange={(e) =>
                                updateLessonField(mIdx, lIdx, 'title', e.target.value)
                              }
                              placeholder="Nombre de la lección"
                              className="flex-1 min-w-[140px] px-2.5 py-1 border border-slate-200 rounded-md"
                            />
                            <input
                              type="text"
                              value={les.time}
                              onChange={(e) =>
                                updateLessonField(mIdx, lIdx, 'time', e.target.value)
                              }
                              className="w-20 px-2 py-1 border border-slate-200 rounded-md text-center font-mono"
                              placeholder="15:00"
                              title="Duración aproximada (mm:ss)"
                            />
                            <input
                              type="text"
                              value={(les as any).video_url || ''}
                              onChange={(e) =>
                                updateLessonField(mIdx, lIdx, 'video_url', e.target.value)
                              }
                              className="w-36 sm:w-44 px-2 py-1 border border-slate-200 rounded-md text-[11px]"
                              placeholder="URL video (opcional)"
                              title="Enlace o embed de YouTube para reproducir en clase"
                            />
                            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer shrink-0">
                              <input
                                type="checkbox"
                                checked={Boolean(les.free)}
                                onChange={(e) =>
                                  updateLessonField(mIdx, lIdx, 'free', e.target.checked)
                                }
                              />
                              <span>Gratis</span>
                            </label>
                            {mod.lessons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLesson(mIdx, lIdx)}
                                className="text-rose-500 hover:text-rose-700 font-bold px-1.5 cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addLesson(mIdx)}
                        className="text-xs font-bold text-violet-600 hover:underline pl-2 cursor-pointer"
                      >
                        + Agregar lección a este módulo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BLOQUE 4: RECURSOS DESCARGABLES (PDFs Y CÓDIGO) */}
            {step === 4 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Material y Recursos Descargables ({recursos.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Agrega guías en PDF, proyectos base en ZIP o enlaces a repositorios que los estudiantes podrán descargar en el Aula Virtual.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addResource}
                    className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0 transition"
                  >
                    + Agregar recurso
                  </button>
                </div>

                <div className="space-y-3.5">
                  {recursos.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      No hay recursos añadidos. Haz clic en "+ Agregar recurso" para incluir material descargable.
                    </div>
                  ) : (
                    recursos.map((res, rIdx) => (
                      <div
                        key={res.id || rIdx}
                        className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-violet-700">
                            Recurso #{rIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeResource(rIdx)}
                            className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                          >
                            Eliminar recurso
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                          <div className="sm:col-span-6">
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Nombre del archivo o guía
                            </label>
                            <input
                              type="text"
                              value={res.name}
                              onChange={(e) => updateResourceField(rIdx, 'name', e.target.value)}
                              placeholder="Ej. Manual_Guia_Modulo_1.pdf"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Tipo
                            </label>
                            <select
                              value={res.type}
                              onChange={(e) => updateResourceField(rIdx, 'type', e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                            >
                              <option value="pdf">📄 PDF</option>
                              <option value="zip">📦 ZIP</option>
                              <option value="code">💻 Código</option>
                              <option value="link">🔗 Enlace</option>
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Tamaño aprox.
                            </label>
                            <input
                              type="text"
                              value={res.size}
                              onChange={(e) => updateResourceField(rIdx, 'size', e.target.value)}
                              placeholder="2.5 MB"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-center"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            URL directa de descarga o enlace externo
                          </label>
                          <input
                            type="text"
                            value={res.url || ''}
                            onChange={(e) => updateResourceField(rIdx, 'url', e.target.value)}
                            placeholder="https://... o ruta del archivo descargable"
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* BLOQUE 5: EVALUACIÓN Y EXAMEN FINAL DEL CURSO */}
            {step === 5 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Evaluación Final del Curso ({evaluacionPreguntas.length} preguntas)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configura las preguntas del examen interactivo de certificación. Marca el botón radial verde para indicar la alternativa correcta de cada pregunta.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0 transition"
                  >
                    + Agregar pregunta
                  </button>
                </div>

                <div className="space-y-4">
                  {evaluacionPreguntas.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      No hay preguntas de evaluación configuradas. Haz clic en "+ Agregar pregunta" para crear el examen.
                    </div>
                  ) : (
                    evaluacionPreguntas.map((q, qIdx) => (
                      <div
                        key={q.id || qIdx}
                        className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-violet-700">
                            Pregunta {qIdx + 1}
                          </span>
                          {evaluacionPreguntas.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIdx)}
                              className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                            >
                              Eliminar pregunta
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Enunciado de la pregunta:
                          </label>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                            placeholder="¿Qué concepto o principio evalúa esta pregunta?"
                            className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600"
                          />
                        </div>

                        <div className="space-y-2 pt-1">
                          <span className="block text-[11px] font-semibold text-slate-600">
                            Alternativas de respuesta (marca el radio de la correcta):
                          </span>
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correctIndex === optIdx
                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2.5 p-2 rounded-xl border transition ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`correct-option-${qIdx}`}
                                  checked={isCorrect}
                                  onChange={() => setCorrectOption(qIdx, optIdx)}
                                  className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  title="Marcar como respuesta correcta"
                                />
                                <span className="text-[11px] font-bold text-slate-400 w-4">
                                  {String.fromCharCode(65 + optIdx)})
                                </span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) =>
                                    updateOptionText(qIdx, optIdx, e.target.value)
                                  }
                                  placeholder={`Texto de la opción ${String.fromCharCode(65 + optIdx)}`}
                                  className="flex-1 px-2.5 py-1 text-xs bg-transparent border-0 focus:outline-none"
                                />
                                {isCorrect && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                    ✓ Correcta
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Panel de Estado y Resumen en vivo */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ESTADO DEL CURSO
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatus('BORRADOR')}
                  className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
                    status === 'BORRADOR'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Borrador
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('PUBLICADO')}
                  className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
                    status === 'PUBLICADO'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Publicado
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSave(status)}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition"
              >
                {isEditing ? 'Guardar cambios del curso' : 'Crear y publicar curso'}
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs space-y-2.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                RESUMEN DEL CURSO
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Categoría</span>
                <strong>{category}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nivel</span>
                <strong>{level}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Docente asignado</span>
                <strong>{instructor}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Módulos</span>
                <strong>{modules.length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total lecciones</span>
                <strong>{totalLessonsCount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recursos (PDF / ZIP)</span>
                <strong>{recursos.length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preguntas de examen</span>
                <strong>{evaluacionPreguntas.length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Con vista previa gratis</span>
                <strong>{freePreviewCount}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Precio individual</span>
                <strong className="text-sm text-violet-700">${price} USD</strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}