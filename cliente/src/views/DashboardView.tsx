import { useState } from 'react'
import AppNav from '../components/AppNav'
import { type CourseItem } from './CatalogView'

export interface SavedCard {
  id: string
  brand: 'Visa' | 'Mastercard'
  last4: string
  holder: string
  expiry: string
}

export default function DashboardView({
  courses = [],
  courseProgress = {},
  onNavigate,
  onOpenCoursePlayer,
  onOpenPlansModal,
  onCancelMembership,
  hasMembership = false,
  membershipPlanName = 'Membresía Pro',
  membershipMonths = 1,
  membershipExpiresAt = '24 nov 2026',
  purchasedCourseIds = [],
  savedCards = [],
  onAddCard,
  onDeleteCard,
  userName = 'Bruno Cusi',
  onOpenProfile,
}: {
  courses?: CourseItem[]
  courseProgress?: Record<number, string[]>
  onNavigate: (view: string) => void
  onOpenCoursePlayer: (courseId: number) => void
  onOpenPlansModal: () => void
  onCancelMembership: () => void
  hasMembership?: boolean
  membershipPlanName?: string
  membershipMonths?: number
  membershipExpiresAt?: string
  purchasedCourseIds?: number[]
  savedCards?: SavedCard[]
  onAddCard?: (card: SavedCard) => void
  onDeleteCard?: (id: string) => void
  userName?: string
  onOpenProfile?: () => void
}) {
  const [search, setSearch] = useState('')
  const [showAddCardModal, setShowAddCardModal] = useState(false)

  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState(userName.toUpperCase())
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // Cursos a los que el estudiante tiene acceso real
  const myUnlockedCourses = hasMembership
    ? courses.filter((c) => c.status === 'PUBLICADO')
    : courses.filter((c) => purchasedCourseIds.includes(c.id))

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanDigits = cardNumber.replace(/\D/g, '')
    if (cleanDigits.length < 15 || !onAddCard) return

    const brand: 'Visa' | 'Mastercard' = cleanDigits.startsWith('5') ? 'Mastercard' : 'Visa'
    onAddCard({
      id: `card-${Date.now()}`,
      brand,
      last4: cleanDigits.slice(-4),
      holder: cardHolder.trim() || userName.toUpperCase(),
      expiry: cardExpiry || '12/28',
    })

    setCardNumber('')
    setCardExpiry('')
    setCardCvv('')
    setShowAddCardModal(false)
  }

  return (
    <div>
      <AppNav
        activeView="dashboard"
        onNavigate={onNavigate}
        searchQuery={search}
        onSearchChange={setSearch}
        userName={userName}
        onOpenProfile={onOpenProfile}
      />

      <div className="max-w-6xl mx-auto p-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              PANEL DE ESTUDIANTE
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Hola, {userName} 👋</h1>
            <p className="text-xs text-slate-500">
              Administra tus cursos adquiridos, mide tu avance y gestiona tu suscripción.
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            + Explorar cursos
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Cursos desbloqueados</span>
              <span>📖</span>
            </div>
            <div className="text-2xl font-extrabold">{myUnlockedCourses.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {hasMembership ? membershipPlanName : 'Compras individuales'}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Lecciones completadas</span>
              <span>✅</span>
            </div>
            <div className="text-2xl font-extrabold">
              {Object.values(courseProgress).reduce((acc, arr) => acc + arr.length, 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Avance registrado en vivo</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Horas aprendidas</span>
              <span>⏱</span>
            </div>
            <div className="text-2xl font-extrabold">142h</div>
            <div className="text-[11px] text-slate-400 mt-1">+12h esta semana</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Racha actual</span>
              <span>🔥</span>
            </div>
            <div className="text-2xl font-extrabold">12 días</div>
            <div className="text-[11px] text-slate-400 mt-1">Récord personal 🔥</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-3.5">
              <h3 className="text-sm font-bold text-slate-900">
                Mis cursos disponibles para estudiar ({myUnlockedCourses.length})
              </h3>

              {myUnlockedCourses.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                  <div className="text-2xl mb-2">🎓</div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Aún no tienes cursos activos en tu cuenta
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    Adquiere un curso de forma individual en el catálogo o activa un plan de Membresía Pro para empezar a reproducir las clases.
                  </p>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="px-4 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Ir al catálogo de cursos ›
                  </button>
                </div>
              ) : (
                myUnlockedCourses.map((c) => {
                  const doneCount = (courseProgress[c.id] || []).length
                  const totalDemoLessons = 8
                  const pct = Math.min(100, Math.round((doneCount / totalDemoLessons) * 100))

                  return (
                    <div
                      key={c.id}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-4"
                    >
                      <div
                        className="w-28 h-20 rounded-lg bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url('${c.image}')` }}
                      />
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-violet-600 uppercase">
                          {c.category} · {c.level}
                        </div>
                        <div className="text-sm font-bold text-slate-900">{c.title}</div>
                        <div className="text-xs text-slate-500 mb-2">
                          Instructor: {c.instructor}
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full bg-violet-600 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {doneCount} de {totalDemoLessons} lecciones completadas · {pct}%
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenCoursePlayer(c.id)}
                        className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg cursor-pointer shrink-0"
                      >
                        {pct > 0 ? 'Continuar ›' : 'Empezar ›'}
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Billetera / Tarjetas Guardadas */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Métodos de pago guardados (Sandbox)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Administra tus tarjetas para compras rápidas y renovaciones periódicas.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCardModal(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  + Agregar tarjeta
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {savedCards.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-between h-32 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-white/15">
                        {c.brand}
                      </span>
                      {savedCards.length > 1 && onDeleteCard && (
                        <button
                          onClick={() => onDeleteCard(c.id)}
                          className="text-[11px] text-rose-300 hover:text-rose-200 cursor-pointer"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <div className="text-sm font-mono tracking-widest my-1">
                      •••• •••• •••• {c.last4}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <span className="truncate max-w-[140px]">{c.holder}</span>
                      <span>Vence {c.expiry}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Estado de Membresía por Meses */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 text-white rounded-2xl p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  SUSCRIPCIÓN LEARNHUB
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    hasMembership ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {hasMembership ? 'ACTIVA' : 'SIN MEMBRESÍA'}
                </span>
              </div>

              {hasMembership ? (
                <>
                  <h3 className="text-lg font-extrabold mb-1">{membershipPlanName}</h3>
                  <p className="text-xs text-violet-300 font-medium mb-4">
                    Duración contratada: {membershipMonths}{' '}
                    {membershipMonths === 1 ? 'mes' : 'meses'} de acceso total
                  </p>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-slate-300 space-y-2 mb-5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Inicio de ciclo:</span>
                      <strong>24 oct 2026</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Próxima renovación:</span>
                      <strong className="text-emerald-400">{membershipExpiresAt}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tarjeta vinculada:</span>
                      <strong>
                        {savedCards[0] ? `${savedCards[0].brand} •••• ${savedCards[0].last4}` : 'Visa •••• 4821'}
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={onOpenPlansModal}
                      className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition"
                    >
                      Cambiar duración de plan (1, 6 o 12 meses)
                    </button>
                    <button
                      onClick={onCancelMembership}
                      className="w-full py-2 border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold rounded-xl cursor-pointer transition"
                    >
                      Cancelar renovación automática
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold mb-2">Plan Estándar (Por curso)</h3>
                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                    Actualmente tienes {purchasedCourseIds.length} curso(s) comprado(s) de forma individual. Elige un plan de 1, 6 o 12 meses para desbloquear todo el catálogo.
                  </p>
                  <button
                    onClick={onOpenPlansModal}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg"
                  >
                    ⚡ Elegir Plan de Membresía (1, 6 o 12 meses)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddCardModal && (
        <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Agregar nueva tarjeta (Sandbox)
              </h3>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mb-5 p-5 rounded-2xl bg-gradient-to-tr from-slate-950 via-violet-950 to-violet-700 text-white shadow-lg flex flex-col justify-between h-44">
              <div className="flex justify-between items-center">
                <div className="w-10 h-7 rounded bg-amber-300/80 border border-amber-200/50" />
                <span className="text-xs font-extrabold tracking-widest uppercase">
                  {cardNumber.startsWith('5') ? 'MASTERCARD' : 'VISA'}
                </span>
              </div>
              <div className="text-lg font-mono tracking-widest my-2">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between items-end text-xs">
                <div>
                  <div className="text-[9px] text-violet-200 uppercase">Titular</div>
                  <div className="font-bold tracking-wide">{cardHolder || 'NOMBRE APELLIDO'}</div>
                </div>
                <div>
                  <div className="text-[9px] text-violet-200 uppercase">Expira</div>
                  <div className="font-bold">{cardExpiry || 'MM/AA'}</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de tarjeta (16 dígitos)
                </label>
                <input
                  type="text"
                  required
                  placeholder="4532 8910 2345 6789"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre en la tarjeta
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vencimiento (MM/AA)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08/29"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Guardar tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}