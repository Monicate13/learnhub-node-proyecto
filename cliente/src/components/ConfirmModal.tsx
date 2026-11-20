import { useEffect } from 'react'

export interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  itemTitle?: string
  badgeText?: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  itemTitle,
  badgeText,
  confirmText = 'Eliminar definitivamente',
  cancelText = 'Cancelar',
  isDangerous = true,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onClose()
        }}
      />
      <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between mb-2">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
              isDangerous
                ? 'bg-rose-50 border border-rose-100 text-rose-600'
                : 'bg-violet-50 border border-violet-100 text-violet-600'
            }`}
          >
            {isDangerous ? '🗑️' : '⚠️'}
          </div>
          {badgeText && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
              {badgeText}
            </span>
          )}
        </div>

        <h3 className="text-base font-extrabold text-slate-900 leading-snug">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{message}</p>

        {itemTitle && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Elemento seleccionado
            </div>
            <div className="text-xs font-semibold text-slate-800 truncate" title={itemTitle}>
              {itemTitle}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50 ${
              isDangerous
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-violet-600 hover:bg-violet-700 text-white'
            }`}
          >
            {isLoading && (
              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            <span>{isLoading ? 'Eliminando...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
