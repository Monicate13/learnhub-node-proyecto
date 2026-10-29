import { useState } from 'react'
import AppNav from '../components/AppNav'

export interface CourseItem {
  id: number
  title: string
  category: string
  level: 'Principiante' | 'Intermedio' | 'Avanzado'
  instructor: string
  instructorRole?: string
  rating: number
  reviews: number
  students: number
  duration: string
  lessons: number
  price: number
  status: 'PUBLICADO' | 'BORRADOR'
  image: string
  description?: string
  outcomes?: string[]
  modules?: {
    title: string
    duration: string
    lessons: { title: string; time: string; free?: boolean }[]
  }[]
}

export default function CatalogView({
  courses,
  onNavigate,
  onOpenCoursePlayer,
  onBuyCourse,
  onOpenPlansModal,
  hasMembership = false,
  membershipPlanName = '',
  purchasedCourseIds = [],
  userName = 'Bruno Cusi',
  onOpenProfile,
}: {
  courses: CourseItem[]
  onNavigate: (view: string) => void
  onOpenCoursePlayer: (courseId: number) => void
  onBuyCourse: (course: CourseItem) => void
  onOpenPlansModal: () => void
  hasMembership?: boolean
  membershipPlanName?: string
  purchasedCourseIds?: number[]
  userName?: string
  onOpenProfile?: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'unlocked' | 'to-buy'>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price-asc' | 'price-desc'>('popular')

  const [selectedCourseDetail, setSelectedCourseDetail] = useState<CourseItem | null>(null)
  const [openModuleIdx, setOpenModuleIdx] = useState<number>(0)

  const categories = [
    { name: 'Todos', color: '' },
    { name: 'Frontend', color: 'bg-blue-500' },
    { name: 'Backend', color: 'bg-emerald-500' },
    { name: 'Data Science', color: 'bg-amber-500' },
    { name: 'DevOps', color: 'bg-rose-500' },
    { name: 'IA & ML', color: 'bg-violet-500' },
    { name: 'Mobile', color: 'bg-pink-500' },
  ]

  const levels = ['Principiante', 'Intermedio', 'Avanzado']

  const isCourseUnlocked = (courseId: number) => {
    return hasMembership || purchasedCourseIds.includes(courseId)
  }

  const toggleLevel = (lvl: string) => {
    setSelectedLevels((prev) =>
      prev.includes(lvl) ? prev.filter((item) => item !== lvl) : [...prev, lvl]
    )
  }

  const resetAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('Todos')
    setSelectedLevels([])
    setAvailabilityFilter('all')
    setSortBy('popular')
  }

  const filtered = courses.filter((c) => {
    if (c.status !== 'PUBLICADO') return false
    if (selectedCategory !== 'Todos' && c.category !== selectedCategory) return false
    if (selectedLevels.length > 0 && !selectedLevels.includes(c.level)) return false
    if (availabilityFilter === 'unlocked' && !isCourseUnlocked(c.id)) return false
    if (availabilityFilter === 'to-buy' && isCourseUnlocked(c.id)) return false
    if (
      searchQuery &&
      !c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    return true
  })

  const sortedCourses = [...filtered].sort((a, b) => {
    if (sortBy === 'popular') return b.students - a.students
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    return 0
  })

  if (selectedCourseDetail) {
    const c = selectedCourseDetail
    const ownedIndividually = purchasedCourseIds.includes(c.id)
    const unlocked = hasMembership || ownedIndividually

    const defaultOutcomes = c.outcomes || [
      'Dominar la arquitectura y buenas prácticas utilizadas en entornos reales de producción.',
      'Construir proyectos completos desde cero aplicando estándares modernos de la industria.',
      'Resolver problemas técnicos frecuentes en entrevistas y evaluaciones universitarias.',
      'Integrar herramientas profesionales de control de versiones, pruebas y despliegue.',
    ]

    const defaultModules = c.modules || [
      {
        title: `Módulo 1: Fundamentos de ${c.title}`,
        duration: '45m',
        lessons: [
          { title: '1.1 Bienvenida e introducción práctica al curso', time: '06:20', free: true },
          { title: '1.2 Configuración profesional del entorno de trabajo', time: '14:45', free: true },
          { title: '1.3 Conceptos clave y estándares de la industria', time: '18:30' },
        ],
      },
      {
        title: 'Módulo 2: Implementación y Casos Reales',
        duration: '1h 20m',
        lessons: [
          { title: '2.1 Estructura modular y flujo de datos', time: '22:15' },
          { title: '2.2 Resolución de problemas frecuentes y depuración', time: '26:40' },
          { title: '2.3 Integración y pruebas de funcionamiento', time: '29:10' },
        ],
      },
      {
        title: 'Módulo 3: Optimización y Proyecto Final Aplicado',
        duration: '1h 05m',
        lessons: [
          { title: '3.1 Buenas prácticas de seguridad y rendimiento', time: '24:00' },
          { title: '3.2 Despliegue final y conclusiones del curso', time: '31:50' },
        ],
      },
    ]

    return (
      <div className="min-h-screen bg-slate-50">
        <AppNav
          activeView="catalog"
          onNavigate={onNavigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          userName={userName}
          onOpenProfile={onOpenProfile}
        />

        <div className="bg-[#0b0d14] text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-7 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <button
                onClick={() => setSelectedCourseDetail(null)}
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white mb-5 cursor-pointer transition"
              >
                <span>←</span> Volver al catálogo de cursos
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-violet-600 text-white uppercase">
                  {c.category}
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300">
                  Nivel {c.level}
                </span>
                {unlocked && (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ Acceso desbloqueado en tu cuenta
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-3">
                {c.title}
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed mb-5 max-w-2xl">
                {c.description}
              </p>

              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold text-sm">★ {c.rating}</span>
                  <span className="text-slate-400">({c.reviews.toLocaleString()} reseñas)</span>
                </div>
                <div>👨‍🎓 {c.students.toLocaleString()} estudiantes inscritos</div>
                <div>⏱ {c.duration} de contenido en video</div>
                <div>🌐 Español · Actualizado Oct 2026</div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-800/80">
                <div className="w-10 h-10 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center">
                  {c.instructor
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="text-xs text-slate-400">Creado por el instructor</div>
                  <div className="text-sm font-bold text-white">
                    {c.instructor}{' '}
                    <span className="text-xs font-normal text-violet-400">
                      · {c.instructorRole || 'Senior Software Engineer & Mentor'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-7 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-7">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900 mb-4">
                Lo que aprenderás en este curso
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {defaultOutcomes.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Contenido y temario del curso
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {defaultModules.length} módulos estructurados · {c.lessons} lecciones en total · {c.duration} de duración
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {defaultModules.map((mod, idx) => {
                  const isOpen = openModuleIdx === idx
                  return (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenModuleIdx(isOpen ? -1 : idx)}
                        className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-violet-600 font-bold">
                            {isOpen ? '▼' : '▶'}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{mod.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {mod.lessons.length} clases · {mod.duration}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-100 bg-white">
                          {mod.lessons.map((les, lIdx) => (
                            <div
                              key={lIdx}
                              className="px-4 py-3 flex items-center justify-between text-xs hover:bg-slate-50/70"
                            >
                              <div className="flex items-center gap-2.5 text-slate-700">
                                <span className="text-violet-600">▷</span>
                                <span>{les.title}</span>
                                {les.free && (
                                  <span
                                    onClick={() => onOpenCoursePlayer(c.id)}
                                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 cursor-pointer hover:bg-violet-200"
                                  >
                                    Vista previa gratis
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-400 text-[11px]">{les.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl sticky top-24">
              <div
                onClick={() => onOpenCoursePlayer(c.id)}
                className="h-48 bg-cover bg-center relative flex flex-col items-center justify-center cursor-pointer group"
                style={{
                  backgroundImage: `linear-gradient(rgba(10,12,20,0.45), rgba(10,12,20,0.75)), url('${c.image}')`,
                }}
              >
                <div className="w-14 h-14 rounded-full bg-violet-600 group-hover:scale-105 transition text-white flex items-center justify-center text-lg shadow-lg">
                  ▶
                </div>
                <span className="mt-2.5 px-3 py-1 rounded-full bg-black/65 text-white text-[11px] font-semibold">
                  {unlocked ? 'Ir al reproductor del curso' : 'Ver clase de muestra gratuita'}
                </span>
              </div>

              <div className="p-6">
                {unlocked ? (
                  <div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
                      {ownedIndividually
                        ? '✓ Adquiriste este curso de forma permanente.'
                        : `⚡ Incluido sin costo adicional en tu ${membershipPlanName || 'Membresía Pro'}.`}
                    </div>
                    <button
                      onClick={() => onOpenCoursePlayer(c.id)}
                      className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
                    >
                      Entrar al aula virtual ahora ›
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-500">Compra individual</span>
                        <span className="text-2xl font-extrabold text-slate-900">${c.price} USD</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Pago único · Acceso ilimitado de por vida a las {c.lessons} lecciones de este curso.
                      </p>
                      <button
                        onClick={() => onBuyCourse(c)}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Comprar solo este curso (${c.price})
                      </button>
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase">
                        O AHORRA CON MEMBRESÍA
                      </span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <div className="p-4 rounded-xl bg-violet-50/80 border border-violet-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-violet-900">
                          ⚡ Membresía LearnHub Pro
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-600 text-white">
                          DESDE $19/MES
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3.5">
                        Accede a <strong>este curso y a todos los demás del catálogo</strong> eligiendo un plan de 1, 6 o 12 meses.
                      </p>
                      <button
                        onClick={onOpenPlansModal}
                        className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-sm"
                      >
                        Ver planes por meses (1, 6 y 12 meses) ›
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'Todos' ||
    selectedLevels.length > 0 ||
    availabilityFilter !== 'all'

  return (
    <div>
      <AppNav
        activeView="catalog"
        onNavigate={onNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        userName={userName}
        onOpenProfile={onOpenProfile}
      />

      <div className="max-w-7xl mx-auto p-7">
        {hasMembership ? (
          <div className="mb-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-base font-bold">
                ⚡
              </span>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-violet-100">
                  {membershipPlanName || 'Membresía Pro Activa'}
                </div>
                <p className="text-xs text-white/90">
                  Tienes acceso ilimitado a todos los cursos del catálogo durante la vigencia de tu plan.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-lg transition cursor-pointer shrink-0"
            >
              Ver vigencia y facturación
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-slate-900 text-white rounded-2xl p-5 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-600 text-white mb-1.5">
                PLANES MENSUAL, SEMESTRAL Y ANUAL
              </span>
              <h3 className="text-sm font-bold">
                Compra cursos de forma individual o desbloquea todo el catálogo con Membresía Pro
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Elige entre planes de 1 mes ($29), 6 meses ($139) o 12 meses ($229) con acceso total.
              </p>
            </div>
            <button
              onClick={onOpenPlansModal}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0 shadow-md"
            >
              ⚡ Ver Planes de Membresía
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-7">
          <aside className="md:col-span-3 space-y-6">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Categoría
              </div>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <div
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition ${
                      selectedCategory === cat.name
                        ? 'bg-violet-100 text-violet-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.color && <span className={`w-2 h-2 rounded-full ${cat.color}`} />}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Nivel
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                {levels.map((lvl) => (
                  <label key={lvl} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(lvl)}
                      onChange={() => toggleLevel(lvl)}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span>{lvl}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Disponibilidad en tu cuenta
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                {[
                  { id: 'all', label: 'Todos los cursos' },
                  { id: 'unlocked', label: 'Mis cursos desbloqueados' },
                  { id: 'to-buy', label: 'Disponibles para comprar' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="availability"
                      checked={availabilityFilter === opt.id}
                      onChange={() => setAvailabilityFilter(opt.id as any)}
                      className="text-violet-600 focus:ring-violet-500"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="w-full py-2 text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition cursor-pointer"
              >
                ✕ Limpiar filtros
              </button>
            )}
          </aside>

          <main className="md:col-span-9">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {selectedCategory === 'Todos' ? 'Todos los cursos' : `Cursos de ${selectedCategory}`}
                </h2>
                <p className="text-xs text-slate-500">
                  {sortedCourses.length}{' '}
                  {sortedCourses.length === 1 ? 'curso disponible' : 'cursos disponibles'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-violet-600 cursor-pointer"
                >
                  <option value="popular">Más populares</option>
                  <option value="rating">Mejor valorados</option>
                  <option value="price-asc">Precio individual: menor a mayor</option>
                  <option value="price-desc">Precio individual: mayor a menor</option>
                </select>
              </div>
            </div>

            {sortedCourses.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center my-4">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  No encontramos cursos con esos filtros
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                  Prueba cambiando los filtros seleccionados para ver todo el catálogo de LearnHub.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedCourses.map((c) => {
                  const ownedIndividually = purchasedCourseIds.includes(c.id)
                  const unlocked = hasMembership || ownedIndividually

                  return (
                    <div
                      key={c.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
                    >
                      <div
                        onClick={() => {
                          setSelectedCourseDetail(c)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="h-36 bg-cover bg-center relative cursor-pointer group"
                        style={{ backgroundImage: `url('${c.image}')` }}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-white text-slate-900 text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-md transition">
                            Ver página del curso ›
                          </span>
                        </div>

                        {ownedIndividually ? (
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-600 text-white">
                            ✓ ADQUIRIDO
                          </span>
                        ) : hasMembership ? (
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-violet-600 text-white">
                            ⚡ PRO DESBLOQUEADO
                          </span>
                        ) : (
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-900/85 text-white">
                            ${c.price} o Membresía
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <div className="text-[10px] font-bold text-violet-600 uppercase mb-1">
                          {c.category} · <span className="text-slate-500 font-normal">{c.level}</span>
                        </div>
                        <h3
                          onClick={() => {
                            setSelectedCourseDetail(c)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="text-sm font-bold text-slate-900 hover:text-violet-600 cursor-pointer mb-1 line-clamp-2"
                        >
                          {c.title}
                        </h3>
                        <p className="text-xs text-slate-500 mb-2.5">{c.instructor}</p>
                        <div className="text-xs text-slate-500 mb-4">
                          <span className="text-amber-500 font-bold">★★★★★ {c.rating}</span> (
                          {c.reviews.toLocaleString()})
                          <div className="mt-1">
                            ⏱ {c.duration} · ▷ {c.lessons} lecciones
                          </div>
                        </div>

                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                          {unlocked ? (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedCourseDetail(c)
                                  window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                className="text-xs font-semibold text-slate-600 hover:text-violet-600 cursor-pointer"
                              >
                                Ver temario
                              </button>
                              <button
                                onClick={() => onOpenCoursePlayer(c.id)}
                                className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                              >
                                Acceder ›
                              </button>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-base font-extrabold text-slate-900">
                                  ${c.price}
                                </span>
                                <span className="block text-[10px] text-violet-600 font-semibold">
                                  o $0 con Pro
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedCourseDetail(c)
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                  }}
                                  className="px-2.5 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                                >
                                  Detalles
                                </button>
                                <button
                                  onClick={() => onBuyCourse(c)}
                                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                                >
                                  Comprar
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}