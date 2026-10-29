import { useState } from 'react'
import AdminNav from '../../components/AdminNav'
import { type CourseItem } from '../CatalogView'

interface CatalogManagementProps {
  courses: CourseItem[]
  onNavigate: (view: string) => void
  onCreateNewCourse: () => void
  onEditCourse: (course: CourseItem) => void
  onToggleCourseStatus: (id: number) => void
  onDuplicateCourse: (course: CourseItem) => void
  onDeleteCourse: (id: number) => void
}

export default function CatalogManagement({
  courses,
  onNavigate,
  onCreateNewCourse,
  onEditCourse,
  onToggleCourseStatus,
  onDuplicateCourse,
  onDeleteCourse,
}: CatalogManagementProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [levelFilter, setLevelFilter] = useState('Todos')
  const [courseToDelete, setCourseToDelete] = useState<CourseItem | null>(null)

  const categories = ['Todas', 'Frontend', 'Backend', 'Data Science', 'DevOps', 'IA & ML', 'Mobile']

  const filtered = courses.filter((c) => {
    if (statusFilter !== 'Todos' && c.status !== statusFilter) return false
    if (categoryFilter !== 'Todas' && c.category !== categoryFilter) return false
    if (levelFilter !== 'Todos' && c.level !== levelFilter) return false
    if (
      search &&
      !c.title.toLowerCase().includes(search.toLowerCase()) &&
      !c.instructor.toLowerCase().includes(search.toLowerCase()) &&
      !c.category.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav activeSection="catalog" onNavigate={onNavigate} />
      <main className="flex-1 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ADMINISTRACIÓN
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Gestión del catálogo ({filtered.length} de {courses.length})
            </h1>
          </div>
          <button
            onClick={onCreateNewCourse}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
          >
            + Crear nuevo curso
          </button>
        </div>

        {/* Barra de Búsqueda + 3 Filtros en Cascada */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
          <div className="md:col-span-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Buscar por título, instructor o categoría..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600"
            />
          </div>
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl cursor-pointer"
            >
              <option value="Todos">Todos los estados</option>
              <option value="PUBLICADO">PUBLICADO</option>
              <option value="BORRADOR">BORRADOR</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Todas' ? 'Todas las categorías' : cat}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl cursor-pointer"
            >
              <option value="Todos">Todos los niveles</option>
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>
        </div>

        {/* Tabla de Cursos */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase">
              <tr>
                <th className="p-3.5">Curso</th>
                <th className="p-3.5">Categoría / Nivel</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5">Estudiantes</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Precio Individual</th>
                <th className="p-3.5 text-right">Acciones de Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.image}
                        alt={c.title}
                        className="w-12 h-8 rounded-md object-cover shrink-0 border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{c.title}</div>
                        <div className="text-[11px] text-slate-400">
                          Por {c.instructor} · {c.lessons} lecciones ({c.duration})
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-700">{c.category}</span>
                    <div className="text-[11px] text-slate-400">{c.level}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'PUBLICADO'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">
                    {c.students.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    {c.rating > 0 ? (
                      <span className="text-amber-500 font-bold">{c.rating} ★</span>
                    ) : (
                      <span className="text-slate-400">Sin reseñas</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <div className="font-extrabold text-slate-900">${c.price} USD</div>
                    <div className="text-[10px] text-violet-600 font-semibold">+ Membresía Pro</div>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onEditCourse(c)}
                      className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer"
                    >
                      ✎ Editar
                    </button>
                    <button
                      onClick={() => onToggleCourseStatus(c.id)}
                      className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Cambiar entre Publicado y Borrador"
                    >
                      {c.status === 'PUBLICADO' ? 'Ocultar' : 'Publicar'}
                    </button>
                    <button
                      onClick={() => onDuplicateCourse(c)}
                      className="px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Duplicar curso"
                    >
                      Duplicar
                    </button>
                    <button
                      onClick={() => setCourseToDelete(c)}
                      className="px-2.5 py-1 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 font-semibold cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de Confirmación de Eliminación con Conteo de Estudiantes Afectados */}
        {courseToDelete && (
          <div className="fixed inset-0 bg-slate-900/55 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-base mb-3">
                !
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1.5">
                ¿Eliminar curso del catálogo?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Estás por eliminar definitivamente <strong>{courseToDelete.title}</strong>. Esta acción afectará a{' '}
                <strong className="text-rose-600">
                  {courseToDelete.students.toLocaleString()} estudiantes inscritos
                </strong>
                .
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCourseToDelete(null)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onDeleteCourse(courseToDelete.id)
                    setCourseToDelete(null)
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Sí, eliminar curso
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}