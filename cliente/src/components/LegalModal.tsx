// src/components/LegalModal.tsx
// Puntos 01 y 02 del Checklist: Aviso Legal y Política de Privacidad (Cumplimiento Ley N.° 29733 de Perú)

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LegalModal({ isOpen, onClose }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Aviso Legal y Política de Privacidad
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Plataforma LearnHub — Curso Integrador I: Sistemas Software (UTP, Lima - Perú)
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-xl"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed">
          <section>
            <h3 className="text-base font-bold text-violet-400 mb-2">1. Identificación y Aviso Legal</h3>
            <p>
              LearnHub es una plataforma de educación tecnológica desarrollada por estudiantes de la carrera de Ingeniería de Sistemas de la Universidad Tecnológica del Perú (Campus San Juan de Lurigancho). El servicio opera en modalidad de prototipo académico con pasarela de pagos en entorno <strong>Sandbox (pruebas sin transacciones financieras reales)</strong>.
            </p>
          </section>

          <section>
            <h3 className="text-base font-bold text-violet-400 mb-2">2. Protección de Datos Personales (Ley N.° 29733)</h3>
            <p>
              Conforme a la <strong>Ley de Protección de Datos Personales de la República del Perú (Ley N.° 29733)</strong> y su Reglamento, los datos recopilados (nombre, correo electrónico y progreso académico) tienen como única finalidad gestionar el acceso a los cursos y emitir constancias de avance.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-400">
              <li>Las contraseñas se almacenan mediante funciones criptográficas unidireccionales (hash con BCrypt).</li>
              <li><strong>No se almacenan datos completos de tarjetas de crédito o débito</strong> (cumplimiento PCI-DSS). Solo se conservan referencias de pasarela y los últimos 4 dígitos.</li>
              <li>El usuario tiene derecho a solicitar la baja o rectificación de su cuenta en cualquier momento.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-bold text-violet-400 mb-2">3. Términos de Membresías y Cancelación</h3>
            <p>
              Las membresías periódicas brindan acceso ilimitado al catálogo completo mientras se mantengan activas. La cancelación de la renovación automática puede solicitarse en cualquier momento desde el panel <em>Mi Aprendizaje</em>, manteniendo el acceso hasta el fin del periodo pagado.
            </p>
          </section>

          <section>
            <h3 className="text-base font-bold text-violet-400 mb-2">4. Propiedad Intelectual</h3>
            <p>
              Los contenidos audiovisuales, códigos fuente y marcas visuales ("devflow" / "LearnHub") pertenecen a sus respectivos autores y docentes del curso para fines pedagógicos e investigación académica.
            </p>
          </section>
        </div>

        {/* Pie de modal */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-violet-600/30 cursor-pointer"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
