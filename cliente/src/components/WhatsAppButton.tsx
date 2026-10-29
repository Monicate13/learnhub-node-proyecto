// src/components/WhatsAppButton.tsx
// Punto 18 del Checklist: Botón de WhatsApp visible y flotante para soporte estudiantil

export default function WhatsAppButton() {
  const phoneNumber = "51999999999"; // Número de soporte institucional / UTP
  const defaultMessage = encodeURIComponent("¡Hola LearnHub! Tengo una consulta sobre los cursos y membresías de programación.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar soporte por WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-4 py-3 rounded-full shadow-lg shadow-emerald-500/30 transition-all duration-300 group hover:shadow-emerald-500/50"
    >
      <svg 
        className="w-6 h-6 fill-current transition-transform group-hover:scale-110" 
        viewBox="0 0 24 24"
      >
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.96.523 1.954.801 2.8.801 3.178 0 5.765-2.587 5.766-5.766 0-3.182-2.587-5.788-5.77-5.788zm6.591 9.429c-.279.789-1.391 1.484-2.227 1.666-.566.124-1.306.223-3.791-.809-3.178-1.319-5.213-4.545-5.372-4.757-.159-.212-1.287-1.713-1.287-3.267 0-1.554.814-2.318 1.104-2.636.29-.318.634-.397.846-.397.212 0 .424.002.61.011.196.009.46-.074.72.551.279.673.953 2.33.1037 2.502.084.172.14.374.027.601-.113.228-.17.37-.339.569-.17.199-.356.444-.509.596-.17.17-.348.356-.15.698.199.342.883 1.455 1.895 2.357 1.302 1.161 2.4 1.521 2.742 1.693.342.172.544.148.745-.085.201-.233.864-1.008 1.096-1.354.232-.346.464-.288.78-.172.316.116 2.008.948 2.353 1.12.345.172.576.257.66.401.085.144.085.836-.194 1.625zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.174L2 22l4.982-1.308A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
      </svg>
      <span className="text-xs font-bold tracking-wide hidden sm:inline">
        ¿Dudas? Chatea con soporte
      </span>
    </a>
  );
}
