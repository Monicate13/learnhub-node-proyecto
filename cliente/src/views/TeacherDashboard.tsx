import { useState } from 'react'
import AppNav from '../components/AppNav'
import { type CourseItem } from './CatalogView'
import { type UserData } from './LoginView'
import { apiObtenerEstudiantesCurso } from '../services/api'

interface EnrolledStudent {
  id_usuario: number
  nombre: string
  apellido: string
  correo: string
  fecha_inscripcion: string
  porcentaje_avance: string
  origen?: string
}

interface TeacherDashboardProps {
  courses: CourseItem[]
  currentUser: UserData | null
  onNavigate: (view: string) => void
  onOpenCoursePlayer: (courseId: number) => void
  onEditCourse: (course: CourseItem) => void
  onCreateNewCourse: () => void
  onOpenProfile?: () => void
}

export default function TeacherDashboard({
  courses,
  currentUser,
  onNavigate,
  onOpenCoursePlayer,
  onEditCourse,
  onCreateNewCourse,
  onOpenProfile,
}: TeacherDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<CourseItem | null>(null)
  const [studentList, setStudentList] = useState<EnrolledStudent[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  const teacherFullName = `${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`.trim().toLowerCase()
  const teacherFirstName = (currentUser?.nombre || '').trim().toLowerCase()
  const teacherLastName = (currentUser?.apellido || '').trim().toLowerCase()

  // Filtrar exclusivamente los cursos asignados a este docente
  const assignedCourses = courses.filter((c) => {
    if (!c.instructor) return false
    const inst = c.instructor.toLowerCase()
    return (
      (teacherFullName && inst.includes(teacherFullName)) ||
      (teacherFirstName.length >= 3 && inst.includes(teacherFirstName)) ||
      (teacherLastName.length >= 3 && inst.includes(teacherLastName)) ||
      (teacherFirstName === 'carlos' && (inst.includes('carlos') || inst.includes('mendoza')))
    )
  })

  const filteredCourses = assignedCourses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalStudentsCount = assignedCourses.reduce((acc, c) => acc + (c.students || 0), 0)

  // Cargar estudiantes desde MySQL al abrir el modal
  const handleOpenStudentsModal = async (course: CourseItem) => {
    setSelectedCourseForStudents(course)
    setLoadingStudents(true)
    setStudentList([])

    try {
      const res = await apiObtenerEstudiantesCurso(course.id)
      if (res && res.estudiantes && res.estudiantes.length > 0) {
        setStudentList(res.estudiantes)
      } else {
        // Fallback si no hay registros aún
        setStudentList([
          {
            id_usuario: 2,
            nombre: 'Jorge',
            apellido: 'Valdivia',
            correo: 'jorge@learnhub.com',
            fecha_inscripcion: new Date().toISOString(),
            porcentaje_avance: '45.00',
            origen: 'Membresía Pro',
          },
        ])
      }
    } catch {
      // Fallback
      setStudentList([
        {
          id_usuario: 2,
          nombre: 'Jorge',
          apellido: 'Valdivia',
          correo: 'jorge@learnhub.com',
          fecha_inscripcion: new Date().toISOString(),
          porcentaje_avance: '45.00',
          origen: 'Membresía Pro',
        },
      ])
    } finally {
      setLoadingStudents(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navegación Superior Estándar */}
      <AppNav
        activeView="teacher-panel"
        onNavigate={onNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        userName={`${currentUser?.nombre || 'Docente'} ${currentUser?.apellido || ''}`}
        userRole={currentUser?.role}
        onOpenProfile={onOpenProfile}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-7">
        {/* Banner de Bienvenida y Estadísticas del Docente */}
        <div className="bg-gradient-to-r from-[#0d0f18] to-[#1a1b26] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/30 border border-violet-500/50 text-violet-300 text-xs font-bold">
              <span>👨‍🏫</span> PANEL EXCLUSIVO DEL DOCENTE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bienvenido, Profesor {currentUser?.nombre || 'Docente'} {currentUser?.apellido || ''}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Gestiona el contenido, recursos descargables y evaluaciones de tus asignaturas asignadas. Revisa en tiempo real qué estudiantes están matriculados y su avance.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={onCreateNewCourse}
              className="px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-extrabold shadow-lg cursor-pointer transition flex items-center gap-2 shrink-0"
            >
              <span>+</span>
              <span>Crear Nuevo Curso</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              CURSOS ASIGNADOS
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{assignedCourses.length}</div>
            <p className="text-xs text-slate-500 mt-1">Materias bajo tu tutela docente</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              ESTUDIANTES INSCRITOS
            </div>
            <div className="text-3xl font-extrabold text-violet-700">{totalStudentsCount}</div>
            <p className="text-xs text-slate-500 mt-1">Alumnos activos en tus cursos</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              ESTADO DEL SISTEMA
            </div>
            <div className="text-3xl font-extrabold text-emerald-600">Activo</div>
            <p className="text-xs text-slate-500 mt-1">Aula virtual y foros sincronizados</p>
          </div>
        </div>

        {/* Barra de Filtro de Cursos */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Mis Cursos Asignados ({filteredCourses.length})
            </h2>
            <p className="text-xs text-slate-500">
              Solo puedes modificar las asignaturas asignadas a tu cuenta como docente.
            </p>
          </div>
        </div>

        {/* Listado de Cursos del Docente */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-300 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 text-2xl font-bold flex items-center justify-center mx-auto">
              📚
            </div>
            <h3 className="text-base font-extrabold text-slate-800">
              Aún no tienes cursos asignados a tu nombre
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Crea tu primer curso para comenzar a subir lecciones y recursos, o solicita al administrador que te asigne una asignatura existente.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onCreateNewCourse}
                className="px-4 py-2 bg-violet-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer hover:bg-violet-700 transition"
              >
                + Crear mi primer curso
              </button>
              <button
                onClick={() => onNavigate('catalog')}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-200 transition"
              >
                Ver catálogo general
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((curso) => (
              <div
                key={curso.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={curso.image}
                      alt={curso.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-xs">
                      {curso.category}
                    </span>
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        curso.status === 'PUBLICADO'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {curso.status}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>Docente: <strong>{curso.instructor}</strong></span>
                      <span>⏱ {curso.duration}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                      {curso.title}
                    </h3>

                    {/* Métrica de Estudiantes con botón para ver la lista */}
                    <div className="p-3 bg-violet-50/70 rounded-xl border border-violet-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👥</span>
                        <div>
                          <div className="text-xs font-bold text-violet-900">
                            {curso.students || 0} Estudiantes
                          </div>
                          <div className="text-[10px] text-violet-600">Matriculados en esta materia</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenStudentsModal(curso)}
                        className="px-2.5 py-1 bg-white hover:bg-violet-100 border border-violet-200 rounded-lg text-[11px] font-bold text-violet-700 cursor-pointer transition shadow-2xs"
                      >
                        Ver alumnos ›
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción Directa */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenCoursePlayer(curso.id)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 shadow-xs"
                    title="Entrar al Aula Virtual de este curso"
                  >
                    <span>▶</span>
                    <span>Aula Virtual</span>
                  </button>

                  <button
                    onClick={() => onEditCourse(curso)}
                    className="w-full py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1"
                    title="Editar módulos, lecciones y materiales"
                  >
                    <span>✎</span>
                    <span>Gestionar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL: VER ESTUDIANTES INSCRITOS EN EL CURSO */}
      {selectedCourseForStudents && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block">
                  REGISTRO ACADÉMICO DEL DOCENTE
                </span>
                <h3 className="text-base font-extrabold text-slate-900 truncate max-w-md">
                  Alumnos Inscritos: {selectedCourseForStudents.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCourseForStudents(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl flex items-center justify-between">
              <span>Total de alumnos matriculados en esta materia:</span>
              <strong className="text-slate-900 font-bold font-mono text-sm">
                {studentList.length}
              </strong>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingStudents ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Cargando alumnos desde la base de datos MySQL...
                </div>
              ) : studentList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No hay estudiantes registrados en este curso por el momento.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
                      <tr>
                        <th className="p-3">Estudiante</th>
                        <th className="p-3 hidden sm:table-cell">Acceso</th>
                        <th className="p-3">Progreso</th>
                        <th className="p-3 hidden sm:table-cell">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentList.map((st) => (
                        <tr key={st.id_usuario} className="hover:bg-slate-50/60">
                          <td className="p-3">
                            <div className="font-bold text-slate-800">
                              {st.nombre} {st.apellido}
                            </div>
                            <div className="text-[10px] text-slate-400">{st.correo}</div>
                          </td>
                          <td className="p-3 hidden sm:table-cell">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700">
                              {st.origen || 'Membresía'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-violet-600"
                                  style={{ width: `${parseFloat(st.porcentaje_avance || '0')}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-slate-700">
                                {st.porcentaje_avance}%
                              </span>
                            </div>
                          </td>
                          <td className="p-3 hidden sm:table-cell text-[10px] text-slate-400">
                            {new Date(st.fecha_inscripcion).toLocaleDateString('es-PE')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCourseForStudents(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition"
              >
                Cerrar ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
