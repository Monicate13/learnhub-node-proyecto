export interface MembershipPlan {
  id: string
  name: string
  months: number
  totalPrice: number
  monthlyEquivalent: number
  badge?: string
  expiresLabel: string
  features: string[]
}

interface PlansModalProps {
  isOpen: boolean
  onClose: () => void
  plans: MembershipPlan[]
  onSelectPlan: (plan: MembershipPlan) => void
}

export default function PlansModal({
  isOpen,
  onClose,
  plans,
  onSelectPlan,
}: PlansModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-7 shadow-2xl my-8 border border-slate-100">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 mb-1.5">
              MEMBRESÍA LEARNHUB PRO
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Elige el plan que mejor se adapte a tu formación
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Todos los planes desbloquean acceso ilimitado a todos los cursos del catálogo, código fuente y seguimiento de progreso.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center cursor-pointer transition"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isRecommended = plan.months === 6
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between border-2 transition relative ${
                  isRecommended
                    ? 'border-violet-600 bg-violet-50/40 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-5 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-600 text-white shadow-xs">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="text-sm font-extrabold text-slate-900 mb-1">{plan.name}</div>
                  <div className="text-xs text-slate-500 mb-4">
                    Duración: <strong>{plan.months} {plan.months === 1 ? 'mes' : 'meses'}</strong>
                  </div>

                  <div className="mb-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      ${plan.monthlyEquivalent}
                    </span>
                    <span className="text-xs text-slate-500"> USD / mes</span>
                  </div>
                  <div className="text-[11px] text-violet-700 font-semibold mb-5">
                    {plan.months === 1
                      ? 'Cobro mensual de $29 USD'
                      : `Pago único de $${plan.totalPrice} USD por ${plan.months} meses`}
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                    isRecommended
                      ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Elegir {plan.months} {plan.months === 1 ? 'mes' : 'meses'} (${plan.totalPrice})
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

