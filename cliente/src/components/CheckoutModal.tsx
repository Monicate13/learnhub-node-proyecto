import { useState, useEffect } from 'react'
import { type SavedCard } from '../views/DashboardView'
import { type MembershipPlan } from './PlansModal'

export interface SandboxCheckout {
  type: 'course' | 'membership'
  courseId?: number
  plan?: MembershipPlan
  title: string
  price: number
}

interface CheckoutModalProps {
  modalData: SandboxCheckout | null
  onClose: () => void
  savedCards: SavedCard[]
  fullName: string
  userEmail?: string
  paying: boolean
  checkoutError: string
  onConfirmPayment: (details: {
    methodUsed: string
    last4: string
    cardToSave: SavedCard | null
  }) => void
}

export default function CheckoutModal({
  modalData,
  onClose,
  savedCards,
  fullName,
  userEmail = 'estudiante@utp.edu.pe',
  paying,
  checkoutError,
  onConfirmPayment,
}: CheckoutModalProps) {
  const [paymentMode, setPaymentMode] = useState<'saved' | 'new' | 'paypal'>('saved')
  const [selectedCardId, setSelectedCardId] = useState<string>('c1')

  const [newCardNumber, setNewCardNumber] = useState('')
  const [newCardHolder, setNewCardHolder] = useState('')
  const [newCardExpiry, setNewCardExpiry] = useState('')
  const [newCardCvv, setNewCardCvv] = useState('')
  const [saveNewCardCheck, setSaveNewCardCheck] = useState(true)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (modalData) {
      setNewCardHolder(fullName.toUpperCase())
      setLocalError('')
      if (savedCards.length > 0) {
        setSelectedCardId(savedCards[0].id)
        setPaymentMode('saved')
      } else {
        setPaymentMode('new')
      }
    }
  }, [modalData, fullName, savedCards])

  if (!modalData) return null

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    let methodUsed = 'Visa •••• 4821'
    let last4ForApi = ''
    let cardToSave: SavedCard | null = null

    if (paymentMode === 'saved') {
      const card = savedCards.find((c) => c.id === selectedCardId) || savedCards[0]
      methodUsed = card ? `${card.brand} •••• ${card.last4}` : 'Visa •••• 4821'
      last4ForApi = card ? card.last4 : '4821'
    } else if (paymentMode === 'new') {
      const digits = newCardNumber.replace(/\D/g, '')
      if (digits.length < 15) {
        setLocalError('Ingresa un número de tarjeta válido de 16 dígitos.')
        return
      }
      if (newCardExpiry.length < 5 || newCardCvv.length < 3) {
        setLocalError('Completa la fecha de vencimiento (MM/AA) y el código CVV.')
        return
      }

      const brand: 'Visa' | 'Mastercard' = digits.startsWith('5') ? 'Mastercard' : 'Visa'
      const last4 = digits.slice(-4)
      methodUsed = `${brand} •••• ${last4}`
      last4ForApi = last4

      if (saveNewCardCheck) {
        cardToSave = {
          id: `card-${Date.now()}`,
          brand,
          last4,
          holder: newCardHolder.trim() || fullName.toUpperCase(),
          expiry: newCardExpiry,
        }
      }
    } else if (paymentMode === 'paypal') {
      methodUsed = 'PayPal Sandbox'
      last4ForApi = 'PAYPAL'
    }

    onConfirmPayment({ methodUsed, last4: last4ForApi, cardToSave })
  }

  const activeError = localError || checkoutError

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-7 shadow-2xl my-8 border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 mb-1">
              {modalData.type === 'membership'
                ? `SUSCRIPCIÓN POR ${modalData.plan?.months} MES(ES)`
                : 'COMPRA DE CURSO INDIVIDUAL'}
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
              Pasarela de Pago Segura (Entorno Sandbox)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center cursor-pointer transition"
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Selector de Métodos de Pago */}
        <div className={`grid ${savedCards.length > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 p-1 bg-slate-100 rounded-xl mb-5`}>
          {savedCards.length > 0 && (
            <button
              type="button"
              onClick={() => setPaymentMode('saved')}
              className={`py-2 text-xs font-semibold rounded-lg cursor-pointer transition ${
                paymentMode === 'saved'
                  ? 'bg-white text-violet-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💳 Tarjetas guardadas ({savedCards.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setPaymentMode('new')
              setNewCardHolder(fullName.toUpperCase())
            }}
            className={`py-2 text-xs font-semibold rounded-lg cursor-pointer transition ${
              paymentMode === 'new'
                ? 'bg-white text-violet-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💳 Tarjeta de débito / crédito
          </button>
          <button
            type="button"
            onClick={() => setPaymentMode('paypal')}
            className={`py-2 text-xs font-semibold rounded-lg cursor-pointer transition ${
              paymentMode === 'paypal'
                ? 'bg-white text-violet-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🅿️ PayPal Sandbox
          </button>
        </div>

        {activeError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{activeError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {paymentMode === 'saved' && (
            <div className="space-y-3 mb-6">
              <div className="text-xs font-semibold text-slate-700">
                Selecciona una tarjeta de tu billetera:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedCards.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCardId(c.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                      selectedCardId === c.id
                        ? 'border-violet-600 bg-violet-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-extrabold text-slate-900">{c.brand}</span>
                      <span className="text-[11px] text-slate-400">Exp. {c.expiry}</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-slate-800 mb-1">
                      •••• •••• •••• {c.last4}
                    </div>
                    <div className="text-[10px] text-slate-500">{c.holder}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {paymentMode === 'new' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6 items-center">
              <div className="md:col-span-5">
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-950 via-violet-950 to-violet-700 text-white shadow-lg flex flex-col justify-between h-44">
                  <div className="flex justify-between items-center">
                    <div className="w-9 h-6 rounded bg-amber-300/80" />
                    <span className="text-xs font-extrabold tracking-widest">
                      {newCardNumber.startsWith('5') ? 'MASTERCARD' : 'VISA'}
                    </span>
                  </div>
                  <div className="text-sm font-mono tracking-widest my-2">
                    {newCardNumber || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between items-end text-[10px]">
                    <div>
                      <div className="text-[8px] text-violet-200 uppercase">Titular</div>
                      <div className="font-bold truncate max-w-[110px]">
                        {newCardHolder || fullName.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] text-violet-200 uppercase">Vence</div>
                      <div className="font-bold">{newCardExpiry || 'MM/AA'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de tarjeta
                  </label>
                  <input
                    type="text"
                    placeholder="4532 8910 2345 6789"
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(formatCardNumber(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-violet-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del titular
                  </label>
                  <input
                    type="text"
                    value={newCardHolder}
                    onChange={(e) => setNewCardHolder(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expiración (MM/AA)
                    </label>
                    <input
                      type="text"
                      placeholder="10/29"
                      value={newCardExpiry}
                      onChange={(e) => setNewCardExpiry(formatExpiry(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      value={newCardCvv}
                      onChange={(e) =>
                        setNewCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveNewCardCheck}
                    onChange={(e) => setSaveNewCardCheck(e.target.checked)}
                  />
                  Guardar esta tarjeta en mi cuenta para futuros pagos
                </label>
              </div>
            </div>
          )}

          {paymentMode === 'paypal' && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center mb-6">
              <div className="text-2xl mb-1">🅿️</div>
              <div className="text-sm font-bold text-slate-900">
                Cuenta de pruebas PayPal Sandbox conectada
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Se procesará la simulación de cargo con el correo <strong>{userEmail}</strong> sin usar dinero real.
              </p>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-slate-500">Concepto a procesar:</div>
              <div className="text-sm font-extrabold text-slate-900">{modalData.title}</div>
              {modalData.plan && (
                <div className="text-[11px] text-emerald-600 font-semibold">
                  Vigencia garantizada hasta el {modalData.plan.expiresLabel}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Total Sandbox</div>
              <div className="text-2xl font-extrabold text-slate-900">
                ${modalData.price} USD
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={paying}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-violet-200 transition"
            >
              {paying ? 'Procesando pago...' : `Confirmar pago de $${modalData.price} USD ›`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

