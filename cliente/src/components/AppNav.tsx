interface AppNavProps {
  activeView: 'catalog' | 'dashboard'
  onNavigate: (view: string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  userName?: string
  onOpenProfile?: () => void
}

export default function AppNav({
  activeView,
  onNavigate,
  searchQuery,
  onSearchChange,
  userName = 'Bruno Cusi',
  onOpenProfile,
}: AppNavProps) {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-7 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div
          onClick={() => onNavigate('catalog')}
          className="flex items-center gap-2.5 font-extrabold text-sm tracking-wide cursor-pointer text-slate-900"
        >
          <span className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
            ✓
          </span>
          <span>LEARNHUB</span>
        </div>

        <nav className="flex items-center gap-1.5">
          <button
            onClick={() => onNavigate('catalog')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeView === 'catalog'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Catálogo
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mi aprendizaje
          </button>
        </nav>
      </div>

      <div className="w-full max-w-sm">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔍 Buscar cursos, tecnologías..."
          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-violet-600"
        />
      </div>

      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenProfile}
          title="Editar mi perfil"
          className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1 rounded-lg transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
            {initials}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
            {userName}
          </span>
        </button>

        <button
          onClick={() => onNavigate('login')}
          className="text-xs font-semibold text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
        >
          Salir
        </button>
      </div>
    </header>
  )
}