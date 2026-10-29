import AdminNav from '../../components/AdminNav'
import { type CourseItem } from '../CatalogView'

interface AdminOverviewProps {
  courses: CourseItem[]
  transactions: any[]
  totalStudentsCount: number
  onNavigate: (view: string) => void
  onCreateNewCourse: () => void
}

export default function AdminOverview({
  courses,
  transactions,
  totalStudentsCount,
  onNavigate,
  onCreateNewCourse,
}: AdminOverviewProps) {
  const publishedCount = courses.filter((c) => c.status === 'PUBLICADO').length
  const draftCount = courses.filter((c) => c.status === 'BORRADOR').length

  // Sumar transacciones completadas de la sesión al base histórico
  const sessionRevenue = transactions
    .filter((t) => t.status === 'COMPLETADO')
    .reduce((acc, t) => acc + Number(String(t.amount).replace(/\D/g, '') || 0), 0)

  const totalRevenue = 24278 + sessionRevenue

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav activeSection="overview" onNavigate={onNavigate} />
      <main className="flex-1 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PANEL DE ADMINISTRACIÓN LEARNHUB
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Overview · Octubre 2026</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
              ● EN VIVO (SANDBOX)
            </span>
            <button
              onClick={onCreateNewCourse}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
            >
              + Crear nuevo curso
            </button>
          </div>
        </div>

        {/* KPIs Dinámicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
              <span>Ingresos totales</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                +18.4%
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              Individual: $8,340 · Suscripciones: ${(totalRevenue - 8340).toLocaleString()}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
              <span>Estudiantes activos</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                +{totalStudentsCount} cuentas
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {(2845 + totalStudentsCount).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              Registrados en plataforma
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
              <span>Cursos en catálogo</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
                {draftCount} borrador(es)
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{publishedCount}</div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              Publicados y visibles al alumno
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
              <span>Tasa de finalización</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                +2.1pp
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">67%</div>
            <div className="text-[11px] text-slate-400 mt-1.5">Promedio de avance global</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Actividad Reciente */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Actividad en tiempo real</h3>
                <p className="text-xs text-slate-400">Últimas transacciones y eventos del sistema</p>
              </div>
              <button
                onClick={() => onNavigate('admin-finance')}
                className="text-xs font-semibold text-violet-600 hover:underline cursor-pointer"
              >
                Ver todo el registro ›
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                        t.status === 'COMPLETADO'
                          ? 'bg-emerald-100 text-emerald-700'
                          : t.status === 'FALLIDO'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {t.status === 'COMPLETADO' ? '✓' : t.status === 'FALLIDO' ? '!' : '↺'}
                    </span>
                    <div>
                      <div className="text-slate-900">
                        <strong>{t.student}</strong> — {t.item}{' '}
                        <span className="font-bold text-slate-700">({t.amount})</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.id} · {t.method}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'COMPLETADO'
                          ? 'bg-emerald-100 text-emerald-700'
                          : t.status === 'FALLIDO'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {t.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{t.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accesos Directos y Desglose */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Accesos directos</h3>
              <button
                onClick={onCreateNewCourse}
                className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl flex items-center justify-between cursor-pointer transition"
              >
                <span>Crear nuevo curso</span>
                <span>›</span>
              </button>
              <button
                onClick={() => onNavigate('admin-catalog')}
                className="w-full py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-between cursor-pointer transition"
              >
                <span>Gestionar catálogo ({courses.length})</span>
                <span>›</span>
              </button>
              <button
                onClick={() => onNavigate('admin-finance')}
                className="w-full py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-between cursor-pointer transition"
              >
                <span>Centro de finanzas y alumnos</span>
                <span>›</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Desglose de ingresos</h3>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex mb-3">
                <div className="bg-violet-600 h-full" style={{ width: '66%' }} />
                <div className="bg-indigo-300 h-full" style={{ width: '34%' }} />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">● Suscripciones Pro (66.4%)</span>
                  <strong>${(totalRevenue - 8340).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">● Ventas individuales (33.6%)</span>
                  <strong>$8,340</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}