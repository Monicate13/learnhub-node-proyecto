import { useState } from 'react'
import AdminNav from '../../components/AdminNav'
import { type UserData } from '../LoginView'

interface TransactionsCenterProps {
  transactions: any[]
  registeredUsers: UserData[]
  onRefundTransaction: (id: string) => void
  onRetryTransaction: (id: string) => void
  onNavigate: (view: string) => void
}

export default function TransactionsCenter({
  transactions,
  registeredUsers,
  onRefundTransaction,
  onRetryTransaction,
  onNavigate,
}: TransactionsCenterProps) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'students'>('transactions')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState('Todos')

  // Cálculo dinámico de los 3 KPIs financieros
  const confirmedTotal = transactions
    .filter((t) => t.status === 'COMPLETADO')
    .reduce((acc, t) => acc + Number(String(t.amount).replace(/\D/g, '') || 0), 0)

  const refundedList = transactions.filter((t) => t.status === 'REEMBOLSADO')
  const refundedTotal = refundedList.reduce(
    (acc, t) => acc + Number(String(t.amount).replace(/\D/g, '') || 0),
    0
  )

  const failedCount = transactions.filter((t) => t.status === 'FALLIDO').length

  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== 'Todos' && t.type !== typeFilter) return false
    if (statusFilter !== 'Todos' && t.status !== statusFilter) return false
    if (
      search &&
      !t.id.toLowerCase().includes(search.toLowerCase()) &&
      !t.student.toLowerCase().includes(search.toLowerCase()) &&
      !t.item.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminNav activeSection="finance" onNavigate={onNavigate} />
      <main className="flex-1 p-8">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          ADMINISTRACIÓN
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-5">
          Centro de finanzas y usuarios
        </h1>

        {/* Pestañas: Transacciones vs Estudiantes (Figura 8 del informe) */}
        <div className="flex gap-6 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 text-xs font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'transactions'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Transacciones ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 text-xs font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'students'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Estudiantes registrados ({registeredUsers.length})
          </button>
        </div>

        {activeTab === 'transactions' ? (
          <>
            {/* 3 KPIs Financieros en vivo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Ingresos confirmados</div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    ${confirmedTotal.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Octubre 2026 (Sandbox)</div>
                </div>
                <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  ●
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Reembolsado</div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    -${refundedTotal.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {refundedList.length} reembolso(s)
                  </div>
                </div>
                <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  ●
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Pagos fallidos</div>
                  <div className="text-2xl font-extrabold text-slate-900">{failedCount}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Requieren atención</div>
                </div>
                <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  ●
                </span>
              </div>
            </div>

            {/* Filtros de Transacciones */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
              <div className="md:col-span-6">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Buscar por ID de pago, estudiante o curso..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div className="md:col-span-3">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  <option value="Todos">Todos los tipos</option>
                  <option value="INDIVIDUAL">INDIVIDUAL</option>
                  <option value="SUSCRIPCIÓN">SUSCRIPCIÓN</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="COMPLETADO">COMPLETADO</option>
                  <option value="FALLIDO">FALLIDO</option>
                  <option value="REEMBOLSADO">REEMBOLSADO</option>
                </select>
              </div>
            </div>

            {/* Tabla de Transacciones */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase">
                  <tr>
                    <th className="p-3.5">ID de Pago</th>
                    <th className="p-3.5">Estudiante / Concepto</th>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Método</th>
                    <th className="p-3.5">Monto</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-mono font-bold text-violet-600">{t.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{t.student}</div>
                        <div className="text-[11px] text-slate-400">{t.item}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">{t.date}</td>
                      <td className="p-3.5 text-slate-600">{t.method}</td>
                      <td className="p-3.5 font-extrabold text-slate-900">{t.amount}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700">
                          {t.type}
                        </span>
                      </td>
                      <td className="p-3.5">
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
                      </td>
                      <td className="p-3.5 text-right">
                        {t.status === 'COMPLETADO' && (
                          <button
                            onClick={() => onRefundTransaction(t.id)}
                            className="px-2.5 py-1 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-lg text-[11px] font-semibold cursor-pointer"
                          >
                            ↺ Reembolsar
                          </button>
                        )}
                        {t.status === 'FALLIDO' && (
                          <button
                            onClick={() => onRetryTransaction(t.id)}
                            className="px-2.5 py-1 bg-violet-600 text-white hover:bg-violet-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                          >
                            ↻ Reintentar cobro
                          </button>
                        )}
                        {t.status === 'REEMBOLSADO' && (
                          <span className="text-[11px] text-slate-400">Reembolsado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* PESTAÑA 2: DIRECTORIO DE ESTUDIANTES REGISTRADOS */
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase">
                <tr>
                  <th className="p-3.5">Usuario</th>
                  <th className="p-3.5">Correo Electrónico</th>
                  <th className="p-3.5">Rol</th>
                  <th className="p-3.5">Estado de Membresía</th>
                  <th className="p-3.5">Cursos Individuales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registeredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3.5 font-bold text-slate-900">
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="p-3.5 text-slate-600">{u.correo}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {u.role === 'admin' ? 'Administrador' : 'Estudiante'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {u.hasMembership ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          ⚡ Membresía Pro Activa
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                          Plan Estándar
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {(u.purchasedCourseIds || []).length} comprado(s)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}