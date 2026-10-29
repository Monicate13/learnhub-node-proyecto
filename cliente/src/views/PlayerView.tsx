import { useState } from 'react'
import { type CourseItem } from './CatalogView'

interface PlayerViewProps {
  course: CourseItem
  completedLessonIds: string[]
  onToggleLessonComplete: (courseId: number, lessonKey: string, totalLessonsCount: number) => void
  onNavigate: (view: string) => void
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
// Solo pega aquí el enlace src de YouTube y automáticamente ocupará el 100%
// ============================================================================
const LESSON_YOUTUBE_VIDEOS: Record<string, string> = {
  '0-0': 'https://www.youtube.com/embed/7iobxzd_2wY?si=b_roJienPQfmSASs',
  // Si luego quieres poner otro en la clase 1.2, solo descomenta la línea de abajo:
  // '0-1': 'https://www.youtube.com/embed/TU_OTRO_VIDEO',
}

// Generador de 5 módulos completos (16 lecciones) adaptados al curso seleccionado
function getExtendedModulesForCourse(course: CourseItem) {
  if (course.modules && course.modules.length >= 5) {
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
}: PlayerViewProps) {
  const [hideSidebar, setHideSidebar] = useState(false)
  const [activeModuleIdx, setActiveModuleIdx] = useState(0)
  const [activeLessonIdx, setActiveLessonIdx] = useState(0)
  const [openModules, setOpenModules] = useState<number[]>([0, 1, 2, 3, 4])
  const [activeTab, setActiveTab] = useState<'desc' | 'resources' | 'notes' | 'qa'>('desc')
  const [playbackSpeed, setPlaybackSpeed] = useState<'1x' | '1.25x' | '1.5x' | '2x'>('1x')
  const [isPlaying, setIsPlaying] = useState(false)

  // Modo Examen Final
  const [isExamMode, setIsExamMode] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [examSubmitted, setExamSubmitted] = useState(false)

  // Notas y Preguntas
  const [notes, setNotes] = useState<{ id: number; lesson: string; text: string; time: string }[]>([
    {
      id: 1,
      lesson: '1.1 Bienvenida, objetivos y mapa de ruta',
      text: 'Importante: estructurar las capas separando controladores de servicios para mantener limpio el proyecto.',
      time: '04:12',
    },
  ])
  const [newNoteText, setNewNoteText] = useState('')

  const [questions, setQuestions] = useState([
    {
      id: 1,
      user: 'Diogo Valdivia',
      question: '¿Qué versión del entorno recomiendan para seguir los ejercicios prácticos sin conflictos?',
      reply: `Hola Diogo, recomendamos usar la versión LTS actual. En la pestaña de Recursos descargables tienes la guía en PDF con la instalación paso a paso. — ${course.instructor}`,
      date: 'hace 2 días',
    },
  ])
  const [newQuestionText, setNewQuestionText] = useState('')

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

  // Verificar si la lección actual tiene un video de YouTube asignado en el diccionario
  const customYoutubeUrl = LESSON_YOUTUBE_VIDEOS[currentLessonKey]

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

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteText.trim()) return
    setNotes((prev) => [
      {
        id: Date.now(),
        lesson: isExamMode ? 'Evaluación Final' : currentLesson.title,
        text: newNoteText.trim(),
        time: '10:24',
      },
      ...prev,
    ])
    setNewNoteText('')
  }

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestionText.trim()) return
    setQuestions((prev) => [
      {
        id: Date.now(),
        user: 'Tú (Estudiante)',
        question: newQuestionText.trim(),
        reply: `¡Gracias por tu consulta! El instructor ${course.instructor} responderá en breve.`,
        date: 'Justo ahora',
      },
      ...prev,
    ])
    setNewQuestionText('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Barra Superior del Reproductor */}
      <header className="h-14 bg-[#09090d] text-white px-5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5 text-xs truncate">
          <span
            onClick={() => onNavigate('catalog')}
            className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center font-bold cursor-pointer shrink-0"
          >
            ✓
          </span>
          <strong className="cursor-pointer hover:text-violet-400" onClick={() => onNavigate('catalog')}>
            LEARNHUB
          </strong>
          <span className="text-slate-600">›</span>
          <span className="text-violet-400 font-semibold truncate">{course.title}</span>
          <span className="text-slate-600 hidden sm:inline">›</span>
          <span className="text-slate-300 hidden sm:inline truncate">
            {isExamMode ? '🎓 Evaluación Final del Curso' : currentLesson.title}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
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
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-lg border border-slate-700 cursor-pointer transition"
          >
            {hideSidebar ? 'Mostrar temario' : 'Ocultar temario'}
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

            {/* Navegación de Pestañas */}
            <div className="flex gap-6 border-b border-slate-200 mt-4 mb-5 text-xs font-semibold">
              {[
                { id: 'desc', label: 'Descripción' },
                { id: 'resources', label: 'Recursos PDF y Código (3)' },
                { id: 'notes', label: `Mis Notas (${notes.length})` },
                { id: 'qa', label: `Preguntas (${questions.length})` },
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

            {activeTab === 'desc' && (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-w-3xl">
                <p>
                  En esta sección de <strong>{course.title}</strong> trabajamos el tema{' '}
                  <strong>{isExamMode ? 'Evaluación Final de Competencias' : currentLesson.title}</strong>.
                  Recuerda completar todos los módulos y aprobar el examen final con nota mínima de 14/20 para alcanzar el 100% del curso.
                </p>
                <p>
                  {course.description ||
                    'Todos los ejemplos explicados en clase están orientados a resolver dudas puntuales de tus asignaturas universitarias y construir proyectos listos para tu portafolio profesional.'}
                </p>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-2.5 max-w-xl">
                <div className="text-xs font-bold text-slate-800 mb-2">
                  Material PDF y código descargable de este módulo:
                </div>
                {[
                  {
                    name: `Manual_Modulo_${activeModuleIdx + 1}_${course.category.replace(/\s+/g, '_')}.pdf`,
                    size: '2.4 MB',
                  },
                  { name: 'Repositorio_Ejercicios_Resueltos.zip', size: '5.8 MB' },
                  { name: 'Resumen_Preparacion_Examen_Final.pdf', size: '1.3 MB' },
                ].map((res, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">📄</span>
                      <div>
                        <div className="font-bold text-slate-800">{res.name}</div>
                        <div className="text-[10px] text-slate-400">{res.size}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Descargando recurso: ${res.name}`)}
                      className="px-3 py-1.5 bg-violet-50 text-violet-700 font-semibold rounded-lg hover:bg-violet-100 cursor-pointer"
                    >
                      Descargar PDF
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="max-w-2xl space-y-4">
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder={`Escribe un apunte sobre "${currentLesson.title}"...`}
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    + Guardar nota
                  </button>
                </form>

                <div className="space-y-2.5">
                  {notes.map((n) => (
                    <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex justify-between text-[11px] text-violet-600 font-bold mb-1">
                        <span>{n.lesson}</span>
                        <span>⏱ Minuto {n.time}</span>
                      </div>
                      <p className="text-slate-700">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="max-w-2xl space-y-4">
                <form onSubmit={handleAddQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Escribe tu duda puntual sobre esta clase para el instructor..."
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Publicar pregunta
                  </button>
                </form>

                <div className="space-y-3">
                  {questions.map((q) => (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between">
                        <strong className="text-slate-900">{q.user}</strong>
                        <span className="text-[11px] text-slate-400">{q.date}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{q.question}</p>
                      <div className="p-3 rounded-lg bg-violet-50/70 border border-violet-100 text-slate-700">
                        {q.reply}
                      </div>
                    </div>
                  ))}
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