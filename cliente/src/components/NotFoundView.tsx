// src/components/NotFoundView.tsx
// Punto 15 del Checklist: Página 404 personalizada con CTA de rescate al catálogo

interface NotFoundViewProps {
  onGoHome: () => void;
}

export default function NotFoundView({ onGoHome }: NotFoundViewProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <span className="text-9xl font-black text-slate-800 select-none tracking-tighter">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl animate-bounce">🔍</span>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
        ¡Página no encontrada en LearnHub!
      </h1>
      <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        La ruta a la que intentas acceder no existe o fue movida. No te preocupes, puedes volver al catálogo para continuar con tus lecciones.
      </p>

      <button
        onClick={onGoHome}
        className="px-6 py-3 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer"
      >
        <span>←</span> Volver al Catálogo de Cursos
      </button>
    </div>
  );
}
