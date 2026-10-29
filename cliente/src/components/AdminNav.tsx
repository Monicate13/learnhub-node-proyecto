interface AdminNavProps {
  activeSection: 'overview' | 'catalog' | 'editor' | 'finance'
  onNavigate: (view: string) => void
}

export default function AdminNav({ activeSection, onNavigate }: AdminNavProps) {
  const items = [
    { id: 'overview', label: '⊞ Overview', view: 'admin-overview' },
    { id: 'catalog', label: '▤ Catálogo', view: 'admin-catalog' },
    { id: 'editor', label: '✎ Editor de cursos', view: 'admin-editor' },
    { id: 'finance', label: '💳 Finanzas', view: 'admin-finance' },
  ]

  return (
    <aside className="w-60 bg-white border-r border-slate-200 p-5 flex flex-col justify-between min-h-screen">
      <div>
        <div className="flex items-center gap-2.5 font-extrabold text-sm text-slate-900 mb-2">
          <span className="w-6 h-6 rounded-md bg-violet-600 text-white flex items-center justify-center text-xs">
            ✓
          </span>
          <span>LearnHub</span>
        </div>
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 mb-6">
          ADMINISTRADOR
        </span>

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          PANEL
        </div>
        <div className="space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 cursor-pointer transition ${
                activeSection === item.id
                  ? 'bg-violet-50 text-violet-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2.5 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
            RC
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Roberto Cruz</div>
            <div className="text-[11px] text-slate-500">Administrador</div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('login')}
          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium cursor-pointer"
        >
          ‹ Cerrar sesión
        </button>
      </div>
    </aside>
  )
}