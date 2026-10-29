import { useState } from 'react'
import AdminNav from '../../components/AdminNav'
import { type CourseItem } from '../CatalogView'

interface CourseEditorProps {
  initialCourse: CourseItem | null
  onSaveCourse: (courseData: CourseItem) => void
  onNavigate: (view: string) => void
}

export default function CourseEditor({
  initialCourse,
  onSaveCourse,
  onNavigate,
}: CourseEditorProps) {
  const isEditing = Boolean(initialCourse)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [title, setTitle] = useState(initialCourse?.title || '')
  const [description, setDescription] = useState(
    initialCourse?.description ||
      'Curso práctico orientado al dominio de herramientas tecnológicas y resolución de casos reales.'
  )
  const [category, setCategory] = useState(initialCourse?.category || 'Frontend')
  const [level, setLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>(
    initialCourse?.level || 'Intermedio'
  )
  const [instructor, setInstructor] = useState(initialCourse?.instructor || 'Roberto Cruz')
  const [duration, setDuration] = useState(initialCourse?.duration || '28h 30m')
  const [price, setPrice] = useState<number>(initialCourse?.price || 79)
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
      lessons: { title: string; time: string; free?: boolean }[]
    }[]
  >(
    initialCourse?.modules || [
      {
        title: 'Módulo 1: Introducción y Configuración del Entorno',
        duration: '2h 15m',
        lessons: [
          { title: '1.1 Bienvenida y mapa del curso', time: '06:30', free: true },
          { title: '1.2 Instalación de herramientas paso a paso', time: '15:20', free: true },
        ],
      },
      {
        title: 'Módulo 2: Desarrollo de Casos Prácticos',
        duration: '5h 40m',
        lessons: [
          { title: '2.1 Arquitectura modular y componentes', time: '22:10', free: false },
          { title: '2.2 Conexión a base de datos y validaciones', time: '28:45', free: false },
        ],
      },
    ]
  )

  const [savedBanner, setSavedBanner] = useState('')

  // Subir archivo de imagen desde la computadora
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result)
      }
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
    field: 'title' | 'time' | 'free',
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

  const handleSave = (targetStatus: 'PUBLICADO' | 'BORRADOR') => {
    if (!title.trim()) {
      alert('Por favor ingresa un título para el curso.')
      setStep(1)
      return
    }

    const courseObj: CourseItem = {
      id: initialCourse?.id || Date.now(),
      title: title.trim(),
      category,
      level,
      instructor: instructor.trim() || 'Roberto Cruz',
      rating: initialCourse?.rating ?? 4.9,
      reviews: initialCourse?.reviews ?? 1,
      students: initialCourse?.students ?? 0,
      duration: duration.trim() || '25h 0m',
      lessons: totalLessonsCount || 1,
      price: Number(price) || 49,
      status: targetStatus,
      image,
      description,
      modules,
    }

    onSaveCourse(courseObj)
    setSavedBanner(
      targetStatus === 'PUBLICADO'
        ? '✓ Curso publicado y actualizado en el catálogo de LearnHub.'
        : '✓ Curso guardado como borrador.'
    )
    setTimeout(() => {
      onNavigate('admin-catalog')
    }, 900)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav activeSection="editor" onNavigate={onNavigate} />
      <main className="flex-1 p-8">
        {/* Cabecera del Editor */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('admin-catalog')}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer hover:bg-slate-50"
            >
              ← Volver
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
              onClick={() => handleSave('BORRADOR')}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Guardar borrador
            </button>
            <button
              type="button"
              onClick={() => handleSave('PUBLICADO')}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
            >
              Publicar cambios
            </button>
          </div>
        </div>

        {savedBanner && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            {savedBanner}
          </div>
        )}

        {/* Navegación por 3 Bloques Secuenciales */}
        <div className="flex gap-6 border-b border-slate-200 mb-6">
          {[
            { id: 1, label: '1 · Información básica y portada' },
            { id: 2, label: '2 · Acceso y precios' },
            { id: 3, label: `3 · Contenido del curso (${modules.length} módulos)` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setStep(t.id as 1 | 2 | 3)}
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
                      Instructor asignado
                    </label>
                    <input
                      type="text"
                      value={instructor}
                      onChange={(e) => setInstructor(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Duración total estimada
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Ej. 38h 15m"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Subida y previsualización de Imagen */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Imagen representativa del curso
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-5">
                      <img
                        src={image}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-xl border border-slate-200"
                      />
                    </div>
                    <div className="sm:col-span-7 space-y-2.5">
                      <label className="block p-4 border-2 border-dashed border-slate-200 hover:border-violet-500 rounded-xl text-center cursor-pointer transition">
                        <span className="text-xs font-bold text-violet-600 block">
                          📁 Subir archivo desde tu computadora
                        </span>
                        <span className="text-[11px] text-slate-400">
                          PNG, JPG o WEBP (Recomendado 1280×720)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="O pega la URL directa de una imagen..."
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BLOQUE 2: ACCESO Y PRECIOS */}
            {step === 2 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Configuración de acceso y precio individual
                </h3>
                <p className="text-xs text-slate-500">
                  En LearnHub todos los cursos publicados forman parte del catálogo de la{' '}
                  <strong>Membresía Pro</strong> (planes de 1, 6 y 12 meses) y además pueden ser adquiridos por separado mediante un pago único.
                </p>

                <div className="max-w-xs">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Precio de compra individual (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">
                      $
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 text-sm font-extrabold border border-slate-200 rounded-xl focus:outline-none focus:border-violet-600"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-900 space-y-1">
                  <div className="font-bold">✓ Incluido automáticamente en Membresía Pro</div>
                  <p className="text-violet-700">
                    Los alumnos con suscripción activa podrán reproducir este curso sin costo adicional. Quienes tengan cuenta estándar verán el botón para comprarlo por ${price} USD.
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
                              className="flex-1 px-2.5 py-1 border border-slate-200 rounded-md"
                            />
                            <input
                              type="text"
                              value={les.time}
                              onChange={(e) =>
                                updateLessonField(mIdx, lIdx, 'time', e.target.value)
                              }
                              className="w-20 px-2 py-1 border border-slate-200 rounded-md text-center font-mono"
                              placeholder="15:00"
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
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
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
                <span className="text-slate-500">Módulos</span>
                <strong>{modules.length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total lecciones</span>
                <strong>{totalLessonsCount}</strong>
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