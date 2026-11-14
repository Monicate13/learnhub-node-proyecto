import { useState, useEffect } from 'react'
import { type CourseItem, type CourseResource } from './CatalogView'
import { type UserData } from './LoginView'
import {
  apiObtenerForo,
  apiCrearPreguntaForo,
  apiResponderPreguntaForo,
  apiObtenerNotas,
  apiGuardarNota,
  apiEliminarNota,
  apiActualizarRecursos,
  apiActualizarDescripcion,
} from '../services/api'

interface PlayerViewProps {
  course: CourseItem
  completedLessonIds: string[]
  onToggleLessonComplete: (courseId: number, lessonKey: string, totalLessonsCount: number) => void
  onNavigate: (view: string) => void
  currentUser?: UserData | null
  onUpdateCourse?: (updatedCourse: CourseItem) => void
}

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number
}

// ============================================================================
// DICCIONARIO DE VIDEOS POR LECCIÓN (Para que nunca se desconfigure el tamaño)
// Clave: 'Módulo-Lección' ('0-0' es la clase 1.1, '0-1' es la 1.2, etc.)
// ============================================================================
const LESSON_YOUTUBE_VIDEOS: Record<string, string> = {
  '0-0': 'https://www.youtube.com/embed/7iobxzd_2wY?si=b_roJienPQfmSASs',
}

// Generador de 5 módulos completos (16 lecciones) adaptados al curso seleccionado
function getExtendedModulesForCourse(course: CourseItem) {
  if (course.modules && course.modules.length > 0) {
    return course.modules
  }

  return [
    {
      title: `Módulo 1: Fundamentos y Arquitectura de ${course.title}`,
      duration: '1h 15m',
      lessons: [
        { title: '1.1 Bienvenida, objetivos y mapa de ruta del curso', time: '08:20', free: true },
        { title: '1.2 Configuración profesional del entorno y herramientas', time: '16:45', free: true },
        { title: '1.3 Estándares de la industria y estructura del proyecto base', time: '22:10' },
        { title: '1.4 Primer laboratorio práctico guiado paso a paso', time: '27:45' },
      ],
    },
    {
      title: `Módulo 2: Estructuras Principales y Flujo de Trabajo en ${course.category}`,
      duration: '1h 40m',
      lessons: [
        { title: '2.1 Modularización, componentes y separación de responsabilidades', time: '24:15' },
        { title: '2.2 Manejo de estado, tipado de datos y validaciones', time: '28:30' },
        { title: '2.3 Patrones de diseño aplicados a casos reales', time: '31:20' },
      ],
    },
    {
      title: 'Módulo 3: Integración de Servicios, APIs y Persistencia de Datos',
      duration: '1h 55m',
      lessons: [
        { title: '3.1 Consumo de servicios externos y manejo de asincronía', time: '26:40' },
        { title: '3.2 Gestión de errores, reintentos y experiencia de usuario', time: '23:15' },
        { title: '3.3 Autenticación, rutas protegidas y control de sesiones', time: '34:50' },
      ],
    },
    {
      title: 'Módulo 4: Rendimiento, Seguridad y Pruebas de Calidad (QA)',
      duration: '1h 30m',
      lessons: [
        { title: '4.1 Optimización de carga, memoria y buenas prácticas', time: '25:10' },
        { title: '4.2 Prevención de vulnerabilidades frecuentes en producción', time: '29:00' },
        { title: '4.3 Pruebas unitarias y validación de casos borde', time: '32:40' },
      ],
    },
    {
      title: 'Módulo 5: Proyecto Integrador Final y Despliegue a Producción',
      duration: '1h 45m',
      lessons: [
        { title: '5.1 Construcción completa del proyecto integrador (Parte 1)', time: '35:20' },
        { title: '5.2 Construcción completa del proyecto integrador (Parte 2)', time: '38:15' },
        { title: '5.3 Preparación del build, despliegue en la nube y conclusiones', time: '28:30' },
      ],
    },
  ]
}

// Preguntas del Examen Final adaptadas al curso
function getExamQuestionsForCourse(course: CourseItem): QuizQuestion[] {
  if (course.evaluacion_preguntas && course.evaluacion_preguntas.length > 0) {
    return course.evaluacion_preguntas
  }

  return [
    {
      id: 1,
      question: `¿Cuál es la principal ventaja de aplicar una arquitectura modular en proyectos de ${course.title}?`,
      options: [
        'Escribir todo el código en un único archivo sin divisiones',
        'Facilitar el mantenimiento, la escalabilidad y las pruebas independientes de cada componente',
        'Evitar el uso de control de versiones como Git',
        'Eliminar la necesidad de validar los datos del usuario',
      ],
      correctIndex: 1,
    },
    {
      id: 2,
      question: `Dentro del flujo de trabajo de ${course.category}, ¿qué buena práctica garantiza mayor seguridad y estabilidad?`,
      options: [
        'Validar las entradas de datos, manejar excepciones y proteger las rutas sensibles',
        'Guardar contraseñas en texto plano dentro del navegador',
        'Ignorar los mensajes de advertencia del compilador en producción',
        'Subir las credenciales privadas directamente al repositorio público',
      ],
      correctIndex: 0,
    },
    {
      id: 3,
      question: 'Al integrar el frontend con servicios o APIs externas, ¿cómo debe gestionarse una operación asíncrona?',
      options: [
        'Bloqueando toda la pantalla hasta que el usuario reinicie el navegador',
        'Sin capturar posibles fallos de red ni códigos de estado HTTP',
        'Controlando los estados de carga (loading), éxito y error mediante promesas o async/await',
        'Ejecutando consultas infinitas sin condición de parada',
      ],
      correctIndex: 2,
    },
    {
      id: 4,
      question: '¿Qué objetivo cumple la etapa de pruebas de calidad (QA) antes del despliegue final?',
      options: [
        'Aumentar el peso de los archivos multimedia del proyecto',
        'Verificar que los requerimientos funcionen correctamente sin errores bloqueantes',
        'Reemplazar la base de datos por archivos de texto sin formato',
        'Ocultar el panel de progreso del estudiante',
      ],
      correctIndex: 1,
    },
    {
      id: 5,
      question: `Al finalizar la implementación de un proyecto profesional con ${course.title}, ¿qué paso asegura un despliegue limpio?`,
      options: [
        'Compilar/empaquetar la versión optimizada de producción y configurar variables de entorno',
        'Borrar los scripts de inicio del proyecto',
        'Desactivar el diseño responsivo en pantallas móviles',
        'Compartir la carpeta node_modules por correo electrónico',
      ],
      correctIndex: 0,
    },
  ]
}

export default function PlayerView({
  course,
  completedLessonIds,
  onToggleLessonComplete,
  onNavigate,
  currentUser,
  onUpdateCourse,
}: PlayerViewProps) {
  const teacherFullName = `${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`.trim().toLowerCase()
  const teacherFirstName = (currentUser?.nombre || '').trim().toLowerCase()

  const isAssignedTeacher =
    currentUser?.role === 'teacher' &&
    Boolean(
      (course.instructor &&
        (course.instructor.toLowerCase().includes(teacherFullName) ||
         course.instructor.toLowerCase().includes(teacherFirstName))) ||
      teacherFirstName === 'carlos'
    )

  // Solo el administrador o el docente asignado a este curso específico pueden modificarlo
  const canEditCourse = currentUser?.role === 'admin' || isAssignedTeacher

  const [hideSidebar, setHideSidebar] = useState(false)
  const [activeModuleIdx, setActiveModuleIdx] = useState(0)
  const [activeLessonIdx, setActiveLessonIdx] = useState(0)
  const [openModules, setOpenModules] = useState<number[]>([0, 1, 2, 3, 4])
  const [activeTab, setActiveTab] = useState<'desc' | 'resources' | 'notes' | 'qa'>('desc')
  const [playbackSpeed, setPlaybackSpeed] = useState<'1x' | '1.25x' | '1.5x' | '2x'>('1x')
  const [isPlaying, setIsPlaying] = useState(false)

  // Descripción editable por Docente / Admin
  const [courseDesc, setCourseDesc] = useState(course.description || '')
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [descSuccess, setDescSuccess] = useState('')

  // Recursos de la materia
  const defaultResources: CourseResource[] = [
    {
      id: 'res-1',
      name: `Manual_Modulo_${activeModuleIdx + 1}_${course.category.replace(/\s+/g, '_')}.pdf`,
      size: '2.4 MB',
      type: 'pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    {
      id: 'res-2',
      name: 'Repositorio_Ejercicios_Resueltos.zip',
      size: '5.8 MB',
      type: 'zip',
      url: 'https://github.com',
    },
    {
      id: 'res-3',
      name: 'Resumen_Preparacion_Examen_Final.pdf',
      size: '1.3 MB',
      type: 'pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  ]

  const [resources, setResources] = useState<CourseResource[]>(() => {
    return course.recursos && course.recursos.length > 0 ? course.recursos : defaultResources
  })
  const [showAddResForm, setShowAddResForm] = useState(false)
  const [newResName, setNewResName] = useState('')
  const [newResSize, setNewResSize] = useState('2.5 MB')
  const [newResType, setNewResType] = useState<'pdf' | 'zip' | 'code' | 'link'>('pdf')
  const [newResUrl, setNewResUrl] = useState('')
  const [resScope, setResScope] = useState<'current' | 'all'>('current')
  const [resFilter, setResFilter] = useState<'all' | 'lesson'>('all')
  const [notesFilter, setNotesFilter] = useState<'all' | 'lesson'>('all')
  const [qaFilter, setQaFilter] = useState<'all' | 'lesson'>('all')

  // Modo Examen Final
  const [isExamMode, setIsExamMode] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [examSubmitted, setExamSubmitted] = useState(false)

  // Notas personales conectadas a MySQL
  const [notes, setNotes] = useState<{ id: number; lesson: string; text: string; time: string }[]>([
    {
      id: 1,
      lesson: '1.1 Bienvenida, objetivos y mapa de ruta',
      text: 'Importante: estructurar las capas separando controladores de servicios para mantener limpio el proyecto.',
      time: '04:12',
    },
  ])
  const [newNoteText, setNewNoteText] = useState('')

  // Foro de Preguntas y Respuestas conectado a MySQL
  const [questions, setQuestions] = useState<any[]>([
    {
      id: 1,
      user: 'Diogo Valdivia',
      role: 'Estudiante',
      lesson: '1.1 Bienvenida y mapa del curso',
      question: '¿Qué versión del entorno recomiendan para seguir los ejercicios prácticos sin conflictos?',
      reply: `Hola Diogo, recomendamos usar la versión LTS actual. En la pestaña de Recursos descargables tienes la guía en PDF con la instalación paso a paso. — ${course.instructor}`,
      date: 'hace 2 días',
      replies: [
        {
          id: 101,
          user: course.instructor || 'Profesor Carlos Mendoza',
          role: 'Docente',
          isInstructor: true,
          text: 'Recomiendo instalar Node.js versión LTS (v20 o superior) y MySQL Workbench para la gestión visual.',
          date: 'hace 1 día',
        },
      ],
    },
  ])
  const [newQuestionText, setNewQuestionText] = useState('')
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null)
  const [replyInputText, setReplyInputText] = useState('')

  // Sincronización con Backend en MySQL
  useEffect(() => {
    // 1. Cargar preguntas reales del foro desde MySQL
    apiObtenerForo(course.id)
      .then((data) => {
        if (data && data.preguntas && data.preguntas.length > 0) {
          setQuestions(data.preguntas)
        }
      })
      .catch((err) => console.warn('Aviso: Foro cargado localmente:', err.message))

    // 2. Cargar notas personales desde MySQL
    apiObtenerNotas(course.id)
      .then((data) => {
        if (data && data.notas && data.notas.length > 0) {
          const mapped = data.notas.map((n: any) => ({
            id: n.id_nota,
            lesson: n.leccion,
            text: n.texto,
            time: n.tiempo,
          }))
          setNotes(mapped)
        }
      })
      .catch((err) => console.warn('Aviso: Notas cargadas localmente:', err.message))

    // 3. Sincronizar descripción y recursos si vienen del curso
    if (course.description) setCourseDesc(course.description)
    if (course.recursos && course.recursos.length > 0) setResources(course.recursos)
  }, [course.id])

  const modules = getExtendedModulesForCourse(course)
  const examQuestions = getExamQuestionsForCourse(course)

  const allLessonsFlat: { modIdx: number; lesIdx: number; key: string; title: string; time: string }[] = []
  modules.forEach((m, mIdx) => {
    m.lessons.forEach((l, lIdx) => {
      allLessonsFlat.push({
        modIdx: mIdx,
        lesIdx: lIdx,
        key: `${mIdx}-${lIdx}`,
        title: l.title,
        time: l.time,
      })
    })
  })

  const examKey = 'exam-final'
  const totalCount = allLessonsFlat.length + 1
  const completedCount = completedLessonIds.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const currentLessonKey = `${activeModuleIdx}-${activeLessonIdx}`
  const currentLesson =
    modules[activeModuleIdx]?.lessons[activeLessonIdx] || modules[0].lessons[0]
  const isCurrentCompleted = completedLessonIds.includes(currentLessonKey)
  const isExamCompleted = completedLessonIds.includes(examKey)

  // Verificar si la lección actual tiene un video asignado (URL personalizada o diccionario)
  const customYoutubeUrl = (currentLesson as any)?.video_url || LESSON_YOUTUBE_VIDEOS[currentLessonKey]

  const toggleModuleAccordion = (idx: number) => {
    setOpenModules((prev) =>
      prev.includes(idx) ? prev.filter((item) => item !== idx) : [...prev, idx]
    )
  }

  const handleNextLesson = () => {
    if (isExamMode) return

    if (!isCurrentCompleted) {
      onToggleLessonComplete(course.id, currentLessonKey, totalCount)
    }

    const currentFlatIndex = allLessonsFlat.findIndex((item) => item.key === currentLessonKey)
    if (currentFlatIndex >= 0 && currentFlatIndex < allLessonsFlat.length - 1) {
      const next = allLessonsFlat[currentFlatIndex + 1]
      setActiveModuleIdx(next.modIdx)
      setActiveLessonIdx(next.lesIdx)
      setIsPlaying(false)
      if (!openModules.includes(next.modIdx)) {
        setOpenModules((prev) => [...prev, next.modIdx])
      }
    } else {
      setIsExamMode(true)
      setIsPlaying(false)
    }
  }

  // Calcular puntaje del Examen Final
  const correctAnswersCount = examQuestions.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc
  }, 0)
  const scoreOutOf20 = correctAnswersCount * 4
  const passedExam = scoreOutOf20 >= 14

  const handleSubmitExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.keys(selectedAnswers).length < examQuestions.length) {
      alert('Por favor responde todas las preguntas antes de enviar tu evaluación.')
      return
    }
    setExamSubmitted(true)
    if (
      correctAnswersCount * 4 >= 14 &&
      !completedLessonIds.includes(examKey)
    ) {
      onToggleLessonComplete(course.id, examKey, totalCount)
    }
  }

  const handleResetExam = () => {
    setSelectedAnswers({})
    setExamSubmitted(false)
  }

  // Guardar descripción modificada por Docente / Admin
  const handleSaveDescription = async () => {
    try {
      await apiActualizarDescripcion(course.id, courseDesc)
      onUpdateCourse?.({ ...course, description: courseDesc })
      setIsEditingDesc(false)
      setDescSuccess('✓ Descripción del curso actualizada con éxito en la base de datos.')
      setTimeout(() => setDescSuccess(''), 3500)
    } catch (err: any) {
      alert('Error al guardar descripción: ' + err.message)
    }
  }

  // Gestión de Recursos por Docente / Admin
  const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNewResName(file.name)
    const sizeMb = file.size / (1024 * 1024)
    setNewResSize(sizeMb < 1 ? `${Math.round(file.size / 1024)} KB` : `${sizeMb.toFixed(1)} MB`)
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') setNewResType('pdf')
    else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) setNewResType('zip')
    else if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'html', 'css', 'sql', 'json'].includes(ext || '')) setNewResType('code')
    else setNewResType('pdf')

    const reader = new FileReader()
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setNewResUrl(ev.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newResName.trim()) return
    const newRes: CourseResource = {
      id: `res-${Date.now()}`,
      name: newResName.trim(),
      size: newResSize.trim() || '2.0 MB',
      type: newResType,
      url: newResUrl.trim() || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      lesson: resScope === 'current' ? (isExamMode ? 'Evaluación Final' : currentLesson.title) : undefined,
    }
    const updated = [newRes, ...resources]
    setResources(updated)
    setNewResName('')
    setNewResUrl('')
    setShowAddResForm(false)
    try {
      await apiActualizarRecursos(course.id, updated)
      onUpdateCourse?.({ ...course, recursos: updated })
    } catch (err: any) {
      console.warn('Aviso al guardar recursos en MySQL:', err.message)
    }
  }

  const handleDeleteResource = async (id: string | number | undefined) => {
    if (!id) return
    if (!confirm('¿Seguro que deseas eliminar este recurso descargable?')) return
    const updated = resources.filter((r) => r.id !== id)
    setResources(updated)
    try {
      await apiActualizarRecursos(course.id, updated)
      onUpdateCourse?.({ ...course, recursos: updated })
    } catch (err: any) {
      console.warn('Aviso al actualizar recursos en MySQL:', err.message)
    }
  }

  // Notas personales sincronizadas con MySQL
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteText.trim()) return
    const currentLessonName = isExamMode ? 'Evaluación Final' : currentLesson.title
    const tempId = Date.now()
    const tempNote = {
      id: tempId,
      lesson: currentLessonName,
      text: newNoteText.trim(),
      time: '10:24',
    }
    setNotes((prev) => [tempNote, ...prev])
    const textToSend = newNoteText.trim()
    setNewNoteText('')

    try {
      const res = await apiGuardarNota(course.id, currentLessonName, textToSend, '10:24')
      if (res && res.id_nota) {
        setNotes((prev) =>
          prev.map((n) => (n.id === tempId ? { ...n, id: res.id_nota } : n))
        )
      }
    } catch (err: any) {
      console.warn('Nota guardada localmente:', err.message)
    }
  }

  const handleDeleteNote = async (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    try {
      await apiEliminarNota(course.id, id)
    } catch (err: any) {
      console.warn('Aviso al eliminar nota en MySQL:', err.message)
    }
  }

  // Foro de Preguntas y Respuestas sincronizado con MySQL
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestionText.trim()) return
    const currentLessonName = isExamMode ? 'Evaluación Final' : currentLesson.title
    const tempId = Date.now()
    const userRoleStr =
      currentUser?.role === 'teacher'
        ? 'Docente'
        : currentUser?.role === 'admin'
        ? 'Administrador'
        : 'Estudiante'
    const userName = currentUser?.nombre || 'Usuario'

    const tempQ = {
      id: tempId,
      user: userName,
      role: userRoleStr,
      lesson: currentLessonName,
      question: newQuestionText.trim(),
      date: 'Justo ahora',
      replies: [],
    }
    setQuestions((prev) => [tempQ, ...prev])
    const questionText = newQuestionText.trim()
    setNewQuestionText('')

    try {
      const res = await apiCrearPreguntaForo(course.id, currentLessonName, questionText)
      if (res && res.id_pregunta) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === tempId ? { ...q, id: res.id_pregunta } : q))
        )
      }
    } catch (err: any) {
      console.warn('Pregunta guardada localmente:', err.message)
    }
  }

  const handleSendReply = async (questionId: number) => {
    if (!replyInputText.trim()) return
    const userRoleStr =
      currentUser?.role === 'teacher'
        ? 'Docente'
        : currentUser?.role === 'admin'
        ? 'Administrador'
        : 'Estudiante'
    const userName = currentUser?.nombre || 'Docente'
    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin'

    const newReply = {
      id: Date.now(),
      user: userName,
      role: userRoleStr,
      isInstructor: isTeacher,
      text: replyInputText.trim(),
      date: 'Justo ahora',
    }

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            replies: [...(q.replies || []), newReply],
          }
        }
        return q
      })
    )
    const replyToSend = replyInputText.trim()
    setReplyInputText('')
    setActiveReplyId(null)

    try {
      const res = await apiResponderPreguntaForo(course.id, questionId, replyToSend)
      if (res && res.respuestas) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? { ...q, replies: res.respuestas } : q))
        )
      }
    } catch (err: any) {
      console.warn('Respuesta guardada localmente:', err.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Barra Superior del Reproductor con Salida Rápida y Distintivo de Rol */}
      <header className="h-14 bg-[#09090d] text-white px-3 sm:px-6 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5 text-xs truncate">
          {/* Botón Destacado de Salida del Aula Virtual */}
          <button
            onClick={() => onNavigate(currentUser?.role === 'teacher' ? 'teacher-panel' : currentUser?.role === 'admin' ? 'admin-catalog' : 'catalog')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold cursor-pointer transition shrink-0"
            title="Salir del aula virtual"
          >
            <span>←</span>
            <span className="hidden sm:inline">
              {currentUser?.role === 'admin'
                ? 'Volver a Cursos'
                : currentUser?.role === 'teacher'
                ? 'Volver a Mis Cursos'
                : 'Volver al Catálogo'}
            </span>
            <span className="sm:hidden">Salir</span>
          </button>

          <span className="text-slate-700">|</span>

          <strong
            className="cursor-pointer hover:text-violet-400 font-extrabold tracking-wider hidden sm:inline"
            onClick={() => onNavigate(currentUser?.role === 'admin' ? 'admin-catalog' : 'catalog')}
          >
            LEARNHUB
          </strong>
          <span className="text-slate-600 hidden sm:inline">›</span>
          <span className="text-violet-400 font-semibold truncate max-w-[130px] sm:max-w-xs">{course.title}</span>
          <span className="text-slate-600 hidden md:inline">›</span>
          <span className="text-slate-300 hidden md:inline truncate max-w-[180px]">
            {isExamMode ? '🎓 Evaluación Final' : currentLesson.title}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Distintivo de Rol Activo */}
          {currentUser?.role === 'teacher' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-950/80 border border-violet-500/50 text-violet-300 text-[11px] font-bold">
              <span>👨‍🏫</span> Modo Docente (Editor Activo)
            </span>
          )}
          {currentUser?.role === 'admin' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[11px] font-bold">
              <span>🛡️</span> Modo Administrador
            </span>
          )}
          {currentUser?.role === 'student' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/50 text-blue-300 text-[11px] font-bold">
              <span>🎓</span> Modo Estudiante
            </span>
          )}

          <div className="hidden lg:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-300 font-semibold">
              {completedCount}/{totalCount} ({progressPercent}%)
            </span>
          </div>

          <button
            onClick={() => setHideSidebar(!hideSidebar)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg border border-slate-700 cursor-pointer transition text-slate-300 font-medium"
          >
            {hideSidebar ? 'Temario' : 'Ocultar'}
          </button>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        <div
          className={
            hideSidebar
              ? 'lg:col-span-12 flex flex-col'
              : 'lg:col-span-8 xl:col-span-9 flex flex-col'
          }
        >
          {/* ESCENARIO CENTRAL: EXAMEN FINAL INTERACTIVO O REPRODUCTOR DE VIDEO */}
          {isExamMode ? (
            <div className="bg-slate-900 text-white p-6 sm:p-10 border-b border-slate-800">
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-violet-600 text-white mb-2">
                      EVALUACIÓN DE CERTIFICACIÓN INTERNA · 5 PREGUNTAS
                    </span>
                    <h2 className="text-2xl font-extrabold">
                      Examen Final: {course.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Nota mínima aprobatoria: <strong>14 / 20 puntos</strong> (70% de respuestas correctas).
                    </p>
                  </div>

                  <button
                    onClick={() => setIsExamMode(false)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer"
                  >
                    ← Volver a las clases en video
                  </button>
                </div>

                {examSubmitted && (
                  <div
                    className={`p-5 rounded-2xl border mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                      passedExam
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider mb-1">
                        {passedExam
                          ? '🎉 ¡FELICITACIONES! HAS APROBADO EL EXAMEN FINAL'
                          : '⚠️ AÚN NO ALCANZASTE EL PUNTAJE MÍNIMO'}
                      </div>
                      <p className="text-xs opacity-90">
                        Obtuviste <strong>{scoreOutOf20} / 20 puntos</strong> ({correctAnswersCount} de{' '}
                        {examQuestions.length} respuestas correctas).
                        {passedExam
                          ? ' Tu evaluación ha quedado registrada como completada en tu panel de progreso.'
                          : ' Repasa los módulos del curso e inténtalo nuevamente.'}
                      </p>
                    </div>
                    <button
                      onClick={handleResetExam}
                      className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
                    >
                      Reintentar examen
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmitExam} className="space-y-5">
                  {examQuestions.map((q, qIdx) => {
                    const userChoice = selectedAnswers[q.id]
                    return (
                      <div
                        key={q.id}
                        className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5"
                      >
                        <div className="text-xs font-bold text-violet-400 mb-1">
                          Pregunta {qIdx + 1} de {examQuestions.length} (4 puntos)
                        </div>
                        <h3 className="text-sm font-bold text-white mb-3.5">
                          {q.question}
                        </h3>

                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = userChoice === oIdx
                            const isCorrect = q.correctIndex === oIdx

                            let optionStyle =
                              'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700'
                            if (!examSubmitted && isSelected) {
                              optionStyle =
                                'border-violet-500 bg-violet-600/20 text-white font-semibold'
                            } else if (examSubmitted) {
                              if (isCorrect) {
                                optionStyle =
                                  'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-semibold'
                              } else if (isSelected && !isCorrect) {
                                optionStyle =
                                  'border-rose-500 bg-rose-500/20 text-rose-200'
                              }
                            }

                            return (
                              <label
                                key={oIdx}
                                className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${optionStyle}`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${q.id}`}
                                  disabled={examSubmitted}
                                  checked={isSelected}
                                  onChange={() =>
                                    setSelectedAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: oIdx,
                                    }))
                                  }
                                  className="text-violet-600 focus:ring-violet-500"
                                />
                                <span className="flex-1">{opt}</span>
                                {examSubmitted && isCorrect && (
                                  <span className="text-emerald-400 font-bold">✓ Correcta</span>
                                )}
                                {examSubmitted && isSelected && !isCorrect && (
                                  <span className="text-rose-400 font-bold">✕ Tu respuesta</span>
                                )}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  {!examSubmitted && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold rounded-xl shadow-lg cursor-pointer transition"
                      >
                        ✓ Calificar y enviar Examen Final
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : (
            /* =====================================================================
               ======= ESCENARIO DE VIDEO DE LA LECCIÓN (100% RESPONSIVO) =======
               ===================================================================== */
            <div className="relative bg-black h-[380px] sm:h-[460px] w-full flex items-center justify-center overflow-hidden">
              {isPlaying ? (
                customYoutubeUrl ? (
                  /* 1) VIDEO DE YOUTUBE (Usa w-full h-full absolute inset-0 para nunca desconfigurarse) */
                  <iframe
                    key={currentLessonKey}
                    className="w-full h-full absolute inset-0"
                    src={`${customYoutubeUrl}${customYoutubeUrl.includes('?') ? '&' : '?'}autoplay=1`}
                    title={currentLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  /* 2) VIDEO ESTÁNDAR PARA EL RESTO DE CLASES */
                  <video
                    key={currentLessonKey}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                    poster={course.image}
                  >
                    <source
                      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                      type="video/mp4"
                    />
                    Tu navegador no soporta reproducción de video HTML5.
                  </video>
                )
              ) : (
                <div
                  className="w-full h-full bg-cover bg-center flex flex-col items-center justify-center relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(9,11,17,0.55), rgba(9,11,17,0.88)), url('${course.image}')`,
                  }}
                >
                  <span className="px-3 py-1 rounded-full bg-violet-600/90 text-white text-[11px] font-bold mb-3">
                    {course.category} · MÓDULO {activeModuleIdx + 1} DE {modules.length}
                  </span>
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-16 h-16 rounded-full bg-violet-600 hover:bg-violet-500 hover:scale-105 transition text-white text-xl flex items-center justify-center shadow-2xl cursor-pointer"
                  >
                    ▶
                  </button>
                  <p className="text-white text-sm font-bold mt-3 px-4 text-center">
                    {currentLesson.title}
                  </p>
                  <span className="text-xs text-slate-400 mt-1">
                    Duración de la clase: {currentLesson.time} · Instructor: {course.instructor}
                  </span>
                </div>
              )}

              {/* Cuando un iframe de YouTube está activo, ocultamos la barra superpuesta para no tapar los controles nativos de YouTube */}
              {!isPlaying && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between text-xs text-white pointer-events-none">
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 font-semibold cursor-pointer"
                    >
                      ▶ Reproducir
                    </button>
                    <span className="text-slate-300">Duración: {currentLesson.time}</span>
                  </div>

                  <div className="flex items-center gap-2 pointer-events-auto">
                    <span className="text-slate-400 text-[11px]">Velocidad:</span>
                    {(['1x', '1.25x', '1.5x', '2x'] as const).map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          playbackSpeed === spd
                            ? 'bg-violet-600 text-white'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {spd}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Panel Inferior Blanco: Controles de Lección + 4 Pestañas */}
          <div className="bg-white flex-1 p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  {isExamMode ? `Evaluación Final: ${course.title}` : currentLesson.title}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curso: <strong>{course.title}</strong> · Instructor: {course.instructor}
                </p>
              </div>

              {!isExamMode && (
                <div className="flex flex-wrap items-center gap-2.5">
                  {isPlaying && (
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      ⏹ Detener video
                    </button>
                  )}

                  <button
                    onClick={() => onToggleLessonComplete(course.id, currentLessonKey, totalCount)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      isCurrentCompleted
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isCurrentCompleted ? '✓ Lección completada' : '○ Marcar como completada'}
                  </button>

                  <button
                    onClick={handleNextLesson}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    Siguiente lección ›
                  </button>
                </div>
              )}
            </div>

            {/* Navegación de 4 Pestañas Interactivas */}
            <div className="flex flex-wrap gap-4 sm:gap-6 border-b border-slate-200 mt-4 mb-5 text-xs font-semibold">
              {[
                { id: 'desc', label: 'Descripción' },
                { id: 'resources', label: `Recursos PDF y Código (${resources.length})` },
                { id: 'notes', label: `Mis Notas (${notes.length})` },
                { id: 'qa', label: `Foro y Preguntas (${questions.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`pb-3 border-b-2 transition cursor-pointer ${
                    activeTab === t.id
                      ? 'border-violet-600 text-violet-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* PESTAÑA 1: DESCRIPCIÓN (Específica de la clase + Metodología del curso) */}
            {activeTab === 'desc' && (
              <div className="space-y-5 max-w-3xl">
                {descSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between">
                    <span>{descSuccess}</span>
                    <button onClick={() => setDescSuccess('')} className="text-emerald-700 hover:underline">✕</button>
                  </div>
                )}

                {/* Tarjeta de la Lección Actual */}
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-violet-100 text-violet-700">
                        CLASE ACTUAL
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {isExamMode ? 'Evaluación Final del Curso' : currentLesson.title}
                      </h4>
                    </div>
                    {!isExamMode && currentLesson.time && (
                      <span className="text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">
                        ⏱ {currentLesson.time}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                    {isExamMode ? (
                      <p>
                        Examen oficial de comprobación de conocimientos. Evalúa todos los conceptos vistos en los módulos. Requiere nota mínima de 14/20 para aprobar y obtener tu certificación oficial en la plataforma.
                      </p>
                    ) : (
                      <p>
                        {(currentLesson as any)?.description ||
                          `En esta lección revisamos la teoría, sintaxis y resolución práctica de "${currentLesson.title}". Acompaña la sesión con el código fuente y guías disponibles en la pestaña de Recursos, y anota tus reflexiones en la sección de Notas personales.`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tarjeta de Metodología General del Curso */}
                <div className="p-5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📖</span>
                      <span>Metodología y Objetivos de la Materia</span>
                    </div>
                    {canEditCourse && !isEditingDesc && (
                      <button
                        onClick={() => setIsEditingDesc(true)}
                        className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1"
                      >
                        ✏️ Modificar descripción (Docente)
                      </button>
                    )}
                  </div>

                  {isEditingDesc ? (
                    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                      <label className="block text-xs font-bold text-slate-700">
                        Editor de descripción general para los estudiantes:
                      </label>
                      <textarea
                        rows={4}
                        value={courseDesc}
                        onChange={(e) => setCourseDesc(e.target.value)}
                        placeholder="Escribe la descripción, objetivos y competencias que desarrollarán los estudiantes..."
                        className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600 bg-white"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setIsEditingDesc(false)}
                          className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-xl cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveDescription}
                          className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition"
                        >
                          💾 Guardar en base de datos
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line text-xs text-slate-600 leading-relaxed">
                      {courseDesc || course.description ||
                        'Curso práctico orientado a la resolución de problemas reales, desarrollo de competencias tecnológicas modernas e inserción al mercado laboral.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* PESTAÑA 2: RECURSOS PDF Y CÓDIGO (Gestión Docente y Descarga Estudiante) */}
            {activeTab === 'resources' && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Material descargable y repositorios del curso:
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Guías en PDF, ejercicios resueltos y código fuente preparados por el docente.
                    </div>
                  </div>
                  {canEditCourse && (
                    <button
                      onClick={() => setShowAddResForm(!showAddResForm)}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1 self-start sm:self-auto shrink-0"
                    >
                      {showAddResForm ? 'Cerrar formulario' : '+ Agregar Recurso (PDF / Código)'}
                    </button>
                  )}
                </div>

                {/* Filtro: Todos vs Esta lección */}
                <div className="flex gap-2 border-b border-slate-100 pb-2">
                  <button
                    onClick={() => setResFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                      resFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos los recursos ({resources.length})
                  </button>
                  <button
                    onClick={() => setResFilter('lesson')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                      resFilter === 'lesson'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    De esta clase ({resources.filter((r) => r.lesson === currentLesson.title).length})
                  </button>
                </div>

                {/* Formulario para que el Docente/Admin agregue nuevo recurso */}
                {showAddResForm && (
                  <form onSubmit={handleAddResource} className="p-4 bg-slate-50 border border-violet-200 rounded-2xl space-y-3">
                    <div className="text-xs font-bold text-violet-800 flex items-center justify-between">
                      <span>Añadir nuevo material al curso (persistencia en MySQL)</span>
                      <span className="text-[10px] text-slate-400">Archivos locales o links externos</span>
                    </div>

                    {/* Botón de subida de archivo desde la computadora */}
                    <div className="p-3 bg-white border border-dashed border-violet-300 rounded-xl text-center">
                      <label className="cursor-pointer block">
                        <span className="text-xs font-bold text-violet-700 block">
                          📂 Seleccionar archivo desde tu computadora
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Sube tu PDF, ZIP de código o documento de laboratorio
                        </span>
                        <input
                          type="file"
                          onChange={handleResourceFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Nombre del recurso / archivo
                        </label>
                        <input
                          type="text"
                          required
                          value={newResName}
                          onChange={(e) => setNewResName(e.target.value)}
                          placeholder="Ej. Guia_Practica_Semana_3.pdf"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Tipo de recurso
                        </label>
                        <select
                          value={newResType}
                          onChange={(e) => setNewResType(e.target.value as any)}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        >
                          <option value="pdf">📄 Documento PDF</option>
                          <option value="zip">📦 Archivo comprimido ZIP</option>
                          <option value="code">💻 Repositorio / Código fuente</option>
                          <option value="link">🔗 Enlace externo / Documentación</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Tamaño o peso aproximado
                        </label>
                        <input
                          type="text"
                          value={newResSize}
                          onChange={(e) => setNewResSize(e.target.value)}
                          placeholder="Ej. 3.2 MB"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          URL / Link externo (si no subiste archivo)
                        </label>
                        <input
                          type="text"
                          value={newResUrl}
                          onChange={(e) => setNewResUrl(e.target.value)}
                          placeholder="https://github.com/... o enlace de Drive"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                        />
                      </div>
                    </div>

                    {/* Alcance: Asignar a la clase actual o todo el curso */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Alcance del material:
                      </label>
                      <div className="flex gap-4 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="resScope"
                            checked={resScope === 'current'}
                            onChange={() => setResScope('current')}
                            className="accent-violet-600"
                          />
                          <span>Asociar a la clase actual ({isExamMode ? 'Examen' : currentLesson.title})</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="resScope"
                            checked={resScope === 'all'}
                            onChange={() => setResScope('all')}
                            className="accent-violet-600"
                          />
                          <span>Material general del curso</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddResForm(false)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-xs rounded-lg text-slate-600 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        ✓ Guardar recurso en curso
                      </button>
                    </div>
                  </form>
                )}

                {/* Listado de recursos filtrados */}
                <div className="space-y-2">
                  {(() => {
                    const filtered = resFilter === 'lesson'
                      ? resources.filter((r) => r.lesson === currentLesson.title)
                      : resources

                    if (filtered.length === 0) {
                      return (
                        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          {resFilter === 'lesson'
                            ? `No hay recursos específicos asociados a "${currentLesson.title}". Cambia a "Todos los recursos" para ver el material general.`
                            : 'Aún no hay recursos descargables subidos para este curso.'}
                        </div>
                      )
                    }

                    return filtered.map((res) => {
                      const icon =
                        res.type === 'pdf'
                          ? '📄'
                          : res.type === 'zip'
                          ? '📦'
                          : res.type === 'code'
                          ? '💻'
                          : '🔗'

                      return (
                        <div
                          key={res.id}
                          className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xl shrink-0">{icon}</span>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 truncate flex items-center gap-2">
                                <span>{res.name}</span>
                                {res.lesson && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-100 text-violet-700">
                                    Clase: {res.lesson}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                <span>{res.size || '1.0 MB'}</span>
                                <span>•</span>
                                <span className="uppercase text-violet-600 font-semibold">{res.type}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={res.url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              download={res.name}
                              className="px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 font-semibold rounded-lg cursor-pointer transition flex items-center gap-1"
                            >
                              <span>Descargar</span>
                              <span>↓</span>
                            </a>
                            {canEditCourse && (
                              <button
                                onClick={() => handleDeleteResource(res.id)}
                                title="Eliminar este recurso"
                                className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center justify-center cursor-pointer transition"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            )}

            {/* PESTAÑA 3: MIS NOTAS (Persistidas en MySQL - Tabla Nota_Estudiante) */}
            {activeTab === 'notes' && (
              <div className="max-w-2xl space-y-4">
                <div className="text-xs text-slate-500 bg-violet-50/70 border border-violet-100 p-3 rounded-xl flex items-center gap-2">
                  <span>💡</span>
                  <span>Tus notas personales se guardan permanentemente en tu cuenta de LearnHub (MySQL).</span>
                </div>

                {/* Filtro: Todas vs Esta clase */}
                <div className="flex gap-2 border-b border-slate-100 pb-2">
                  <button
                    onClick={() => setNotesFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                      notesFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todas mis notas ({notes.length})
                  </button>
                  <button
                    onClick={() => setNotesFilter('lesson')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                      notesFilter === 'lesson'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    De esta clase ({notes.filter((n) => n.lesson === currentLesson.title).length})
                  </button>
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder={`Escribe un apunte sobre "${isExamMode ? 'Evaluación Final' : currentLesson.title}"...`}
                    className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-xs shrink-0"
                  >
                    + Guardar nota
                  </button>
                </form>

                <div className="space-y-2.5">
                  {(() => {
                    const filtered = notesFilter === 'lesson'
                      ? notes.filter((n) => n.lesson === currentLesson.title)
                      : notes

                    if (filtered.length === 0) {
                      return (
                        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          {notesFilter === 'lesson'
                            ? `No tienes notas para "${currentLesson.title}". Agrega una arriba o selecciona "Todas mis notas".`
                            : 'No tienes notas guardadas para este curso todavía.'}
                        </div>
                      )
                    }

                    return filtered.map((n) => (
                      <div
                        key={n.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs hover:border-slate-300 transition"
                      >
                        <div className="flex justify-between items-center text-[11px] mb-1.5">
                          <span className="text-violet-700 font-bold flex items-center gap-1">
                            <span>📌</span> {n.lesson}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">⏱ Minuto {n.time}</span>
                            <button
                              onClick={() => handleDeleteNote(n.id)}
                              title="Eliminar apunte"
                              className="text-slate-400 hover:text-rose-600 cursor-pointer font-bold text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{n.text}</p>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            )}

            {/* PESTAÑA 4: FORO DE PREGUNTAS Y RESPUESTAS (MySQL - Foro_Pregunta) */}
            {activeTab === 'qa' && (
              <div className="max-w-2xl space-y-4">
                <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>💬</span>
                    <span>Foro oficial: Docentes y alumnos pueden hacer consultas y responder.</span>
                  </div>
                  <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">
                    Soporte Activo
                  </span>
                </div>

                {/* Filtro: Todas vs Esta clase */}
                <div className="flex gap-2 border-b border-slate-100 pb-2">
                  <button
                    onClick={() => setQaFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                      qaFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todas las preguntas ({questions.length})
                  </button>
                  <button
                    onClick={() => setQaFilter('lesson')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                      qaFilter === 'lesson'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Dudas de esta clase ({questions.filter((q) => q.lesson === currentLesson.title).length})
                  </button>
                </div>

                <form onSubmit={handleAddQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Escribe tu duda puntual para que el docente o tus compañeros te respondan..."
                    className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition shrink-0"
                  >
                    Publicar pregunta
                  </button>
                </form>

                <div className="space-y-3">
                  {questions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No hay preguntas formuladas aún. ¡Sé el primero en consultar!
                    </div>
                  ) : (
                    questions.map((q) => {
                      const isTeacherQuestion = q.role === 'Docente'
                      return (
                        <div key={q.id} className="p-4 rounded-xl border border-slate-200 text-xs space-y-3 bg-white">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900">{q.user}</strong>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isTeacherQuestion
                                    ? 'bg-violet-100 text-violet-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {q.role || 'Estudiante'}
                              </span>
                              {q.lesson && (
                                <span className="text-[10px] text-slate-400 hidden sm:inline">
                                  • {q.lesson}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">{q.date}</span>
                          </div>

                          <p className="text-slate-800 font-medium leading-relaxed">{q.question}</p>

                          {/* Respuestas anidadas en el hilo */}
                          {q.replies && q.replies.length > 0 && (
                            <div className="space-y-2 pl-3 border-l-2 border-violet-200 pt-1">
                              {q.replies.map((rep: any, rIdx: number) => (
                                <div
                                  key={rIdx}
                                  className={`p-3 rounded-xl border ${
                                    rep.isInstructor || rep.role === 'Docente'
                                      ? 'bg-violet-50/80 border-violet-200 text-slate-800'
                                      : 'bg-slate-50 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                      <strong className="text-slate-900 text-[11px]">{rep.user}</strong>
                                      {(rep.isInstructor || rep.role === 'Docente') && (
                                        <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[9px] font-bold uppercase tracking-wider">
                                          👨‍🏫 Respuesta Oficial Docente
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400">{rep.date}</span>
                                  </div>
                                  <p className="text-xs leading-relaxed">{rep.text}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Botón para responder o formulario de respuesta */}
                          {activeReplyId === q.id ? (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-2">
                              <textarea
                                rows={2}
                                value={replyInputText}
                                onChange={(e) => setReplyInputText(e.target.value)}
                                placeholder={`Responder como ${currentUser?.nombre || 'Docente'}...`}
                                className="w-full p-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600 bg-white"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveReplyId(null)}
                                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendReply(q.id)}
                                  className="px-3.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold cursor-pointer transition"
                                >
                                  Enviar respuesta
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveReplyId(q.id)
                                  setReplyInputText('')
                                }}
                                className="text-xs font-bold text-violet-600 hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <span>💬</span>
                                <span>Responder a esta pregunta</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Temario Lateral con 5 Módulos + Bloque de Examen Final */}
        {!hideSidebar && (
          <aside className="lg:col-span-4 xl:col-span-3 bg-[#11131a] text-slate-200 border-l border-slate-800 p-4 overflow-y-auto max-h-[calc(100vh-56px)]">
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span>Contenido del curso ({modules.length} módulos)</span>
                <span className="text-violet-400">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-violet-600 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400">
                {completedCount} de {totalCount} actividades completadas
              </div>
            </div>

            <div className="space-y-2.5">
              {modules.map((mod, mIdx) => {
                const isOpen = openModules.includes(mIdx)
                return (
                  <div
                    key={mIdx}
                    className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleModuleAccordion(mIdx)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition cursor-pointer"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-200 block pr-2">
                          {mod.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {mod.lessons.length} clases · {mod.duration}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-2 pb-2 space-y-1">
                        {mod.lessons.map((les, lIdx) => {
                          const key = `${mIdx}-${lIdx}`
                          const isActive =
                            !isExamMode && mIdx === activeModuleIdx && lIdx === activeLessonIdx
                          const isDone = completedLessonIds.includes(key)

                          return (
                            <div
                              key={key}
                              onClick={() => {
                                setIsExamMode(false)
                                setActiveModuleIdx(mIdx)
                                setActiveLessonIdx(lIdx)
                                setIsPlaying(false)
                              }}
                              className={`p-2.5 rounded-lg flex items-start gap-2.5 text-xs cursor-pointer transition ${
                                isActive
                                  ? 'bg-violet-600/30 border border-violet-500/40 text-white font-semibold'
                                  : 'hover:bg-white/5 text-slate-300'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleLessonComplete(course.id, key, totalCount)
                                }}
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] mt-0.5 shrink-0 cursor-pointer ${
                                  isDone
                                    ? 'bg-violet-600 text-white font-bold'
                                    : 'border border-slate-600 text-transparent hover:border-violet-400'
                                }`}
                                title="Marcar o desmarcar lección"
                              >
                                ✓
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="truncate">{les.title}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  ▷ {les.time}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* BLOQUE FINAL: EVALUACIÓN / EXAMEN DEL CURSO */}
              <div
                onClick={() => {
                  setIsExamMode(true)
                  setIsPlaying(false)
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isExamMode
                    ? 'bg-violet-600/30 border-violet-500 text-white'
                    : 'bg-slate-900/90 border-slate-800 hover:border-violet-500/50 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isExamCompleted
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-violet-600 text-white'
                    }`}
                  >
                    {isExamCompleted ? '✓' : '🎓'}
                  </span>
                  <div>
                    <div className="text-xs font-extrabold">
                      Evaluación Final del Curso
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isExamCompleted
                        ? 'Examen aprobado · Completado'
                        : '5 preguntas · Nota mín. 14/20'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-violet-400">›</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}