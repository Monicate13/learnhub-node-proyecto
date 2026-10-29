// src/components/CookieBanner.tsx
// Punto 03 del Checklist: Aviso de cookies y política de privacidad (Ley N.° 29733 de Protección de Datos)

import { useState, useEffect } from 'react';

interface CookieBannerProps {
  onOpenLegal: () => void;
}

export default function CookieBanner({ onOpenLegal }: CookieBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('learnhub_cookie_consent');
    if (!consent) {
      // Mostrar banner con un pequeño retraso elegante
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('learnhub_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('learnhub_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside 
      aria-label="Aviso de cookies y privacidad"
      className="fixed bottom-5 left-5 right-5 md:left-auto md:right-5 md:max-w-md bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/60 p-5 rounded-2xl shadow-2xl z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" role="img" aria-label="Cookie">🍪</span>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-white mb-1 tracking-wide">
            Privacidad y Cookies en LearnHub
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Utilizamos cookies técnicas y analíticas para garantizar la seguridad de tus sesiones y mejorar tu progreso de aprendizaje conforme a la <strong>Ley N.° 29733</strong> de Protección de Datos Personales del Perú.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAccept}
              className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-violet-600/30 cursor-pointer"
            >
              Aceptar todas
            </button>
            <button
              onClick={handleDecline}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Solo esenciales
            </button>
            <button
              onClick={onOpenLegal}
              className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2 ml-auto cursor-pointer"
            >
              Ver aviso legal
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
