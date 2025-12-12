import React from "react";
import { X } from "lucide-react";

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 bg-gradient-to-br from-[#2d1b4e] to-[#1a0f2e] rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#fc52af] to-[#ff95dd] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Términos y Condiciones
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-6 text-white/90">
            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                1. Aceptación de los Términos
              </h3>
              <p className="leading-relaxed">
                Al acceder y usar Andromeda, usted acepta estar sujeto a estos
                Términos y Condiciones. Si no está de acuerdo con alguna parte
                de estos términos, no debe usar nuestro servicio.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                2. Uso del Servicio
              </h3>
              <p className="leading-relaxed mb-2">
                Andromeda es una plataforma de gestión de tickets y soporte.
                Usted se compromete a:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Proporcionar información precisa y actualizada</li>
                <li>Mantener la confidencialidad de su cuenta</li>
                <li>No usar el servicio para fines ilegales o no autorizados</li>
                <li>Respetar los derechos de otros usuarios</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                3. Privacidad y Protección de Datos
              </h3>
              <p className="leading-relaxed">
                Nos comprometemos a proteger su información personal. Los datos
                recopilados serán utilizados únicamente para mejorar nuestro
                servicio y no serán compartidos con terceros sin su
                consentimiento explícito, excepto cuando sea requerido por ley.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                4. Propiedad Intelectual
              </h3>
              <p className="leading-relaxed">
                Todo el contenido presente en Andromeda, incluyendo pero no
                limitado a textos, gráficos, logos, iconos y software, es
                propiedad de Andromeda o sus licenciantes y está protegido por
                las leyes de propiedad intelectual.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                5. Limitación de Responsabilidad
              </h3>
              <p className="leading-relaxed">
                Andromeda no será responsable por daños indirectos,
                incidentales, especiales o consecuentes que resulten del uso o
                la imposibilidad de usar el servicio, incluso si hemos sido
                advertidos de la posibilidad de tales daños.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                6. Modificaciones del Servicio
              </h3>
              <p className="leading-relaxed">
                Nos reservamos el derecho de modificar o discontinuar,
                temporal o permanentemente, el servicio (o cualquier parte del
                mismo) con o sin previo aviso en cualquier momento.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                7. Terminación
              </h3>
              <p className="leading-relaxed">
                Podemos terminar o suspender su cuenta inmediatamente, sin
                previo aviso ni responsabilidad, por cualquier motivo,
                incluyendo sin limitación si usted incumple los Términos y
                Condiciones.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                8. Ley Aplicable
              </h3>
              <p className="leading-relaxed">
                Estos Términos se regirán e interpretarán de acuerdo con las
                leyes vigentes, sin tener en cuenta sus disposiciones sobre
                conflictos de leyes.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-3">
                9. Contacto
              </h3>
              <p className="leading-relaxed">
                Si tiene alguna pregunta sobre estos Términos y Condiciones,
                puede contactarnos a través de nuestro sistema de soporte.
              </p>
            </section>

            <section className="pt-4 border-t border-white/20">
              <p className="text-sm text-white/70 italic">
                Última actualización: 8 de diciembre de 2025
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#2d1b4e] to-[#1a0f2e] p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#fc52af] to-[#ff95dd] hover:from-[#ff6ebf] hover:to-[#ffa5ed] text-white font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            Entendido
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #fc52af, #ff95dd);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ff6ebf, #ffa5ed);
        }
      `}</style>
    </div>
  );
};

export default TermsModal;
