import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "privacy" | "terms" | "cookies" | "contact";
}

const LEGAL_CONTENT = {
  privacy: {
    title: "Política de Privacidad",
    content: `
      ### 1. Información que Recopilamos
      CeroBit Games no recopila datos personales identificables de forma directa. Utilizamos cookies estándar y tecnologías de análisis para mejorar la experiencia del usuario y recordar tus preferencias de búsqueda de juegos.

      ### 2. Uso de la Información
      La información recopilada se utiliza exclusivamente para:
      - Personalizar la experiencia de búsqueda de videojuegos.
      - Analizar el tráfico del sitio para mejorar nuestro catálogo.
      - Mostrar anuncios relevantes a través de socios publicitarios.

      ### 3. Cookies y Tecnologías de Seguimiento
      Utilizamos cookies para recordar tus preferencias de categoría y para fines analíticos. Puedes desactivar las cookies en la configuración de tu navegador.

      ### 4. Seguridad
      Implementamos medidas de seguridad estándar para proteger la integridad de nuestro sitio y la información de navegación.

      ### 5. Contacto
      Si tienes preguntas sobre esta política, contáctanos en: marcovallemadero17@gmail.com
    `
  },
  contact: {
    title: "Contacto",
    content: `
      ### ¡Hablemos!
      Si tienes alguna duda, sugerencia o propuesta de colaboración, puedes ponerte en contacto con nosotros a través de nuestro correo electrónico oficial.

      ### Correo Electrónico
      **marcovallemadero17@gmail.com**

      ### Horario de Atención
      Nuestro equipo revisa los correos diariamente y tratamos de responder en un plazo de 24 a 48 horas laborables.
    `
  },
  terms: {
    title: "Términos y Condiciones",
    content: `
      ### 1. Aceptación de Términos
      Al acceder a CeroBit Games, aceptas cumplir con estos términos de servicio y todas las leyes y regulaciones aplicables.

      ### 2. Uso de Contenido
      El contenido de este sitio es generado por IA con fines informativos sobre videojuegos. No garantizamos la exactitud absoluta de cada requisito técnico y recomendamos verificar con los sitios oficiales de descarga proporcionados.

      ### 3. Propiedad Intelectual
      CeroBit Games respeta los derechos de autor de los desarrolladores de videojuegos. Cada juego incluye un enlace al sitio oficial de descarga o compra.

      ### 4. Limitación de Responsabilidad
      CeroBit Games no se hace responsable de las decisiones tomadas basadas en la información proporcionada en este sitio, ni de los problemas técnicos que puedan surgir al descargar juegos desde enlaces externos.
    `
  },
  cookies: {
    title: "Política de Cookies",
    content: `
      ### ¿Qué son las cookies?
      Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.

      ### ¿Cómo las usamos?
      - **Preferencias:** Para recordar tus categorías de juegos favoritas.
      - **Análisis:** Para entender cómo los usuarios interactúan con el sitio.
      - **Publicidad:** Para mostrar anuncios que puedan ser de tu interés.

      ### Gestión de Cookies
      Puedes controlar y/o eliminar las cookies como desees. Para más detalles, consulta aboutcookies.org.
    `
  }
};

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  const content = LEGAL_CONTENT[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8"
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0F0F11] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/10"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">{content.title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto prose prose-invert max-w-none">
              <div className="text-slate-400 whitespace-pre-line font-medium leading-relaxed">
                {content.content}
              </div>
            </div>
            <div className="p-8 border-t border-white/5 flex justify-end">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
