import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Truck, Shield } from "lucide-react";
import ContactForm from "./ContactForm";

export default function CheckoutModal({ open, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-white to-red-50/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative overflow-hidden border border-red-100"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decoración de fondo */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-50 to-transparent rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-red-50 to-transparent rounded-full" />

          {/* Header del modal */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
                  <p className="text-white/90 text-sm mt-1">
                    Completa tus datos para continuar con la compra
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center group"
              >
                <X
                  className="text-white group-hover:scale-110 transition-transform"
                  size={24}
                />
              </button>
            </div>
          </div>

          {/* Beneficios destacados */}
          <div className="px-8 py-6 bg-gradient-to-r from-red-50 via-white to-red-50 border-b border-red-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Truck className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Envío Nacional</p>
                  <p className="text-sm text-gray-600">A todo el país</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Compra Segura</p>
                  <p className="text-sm text-gray-600">Datos protegidos</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Soporte 24/7</p>
                  <p className="text-sm text-gray-600">
                    WhatsApp: +57 300 123 4567
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal - Formulario */}
          <div className="px-8 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-4">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-red-700">
                    Paso 1 de 2: Información de contacto
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Completa tus datos personales
                </h3>
                <p className="text-gray-600">
                  Los datos marcados con <span className="text-red-600">*</span>{" "}
                  son obligatorios
                </p>
              </div>

              {/* Formulario de contacto */}
              <ContactForm onSuccess={onClose} />

              {/* Notas importantes */}
              <div className="mt-8 pt-6 border-t border-red-100">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs">ℹ</span>
                  </div>
                  <p>
                    Al completar este formulario, aceptas nuestras
                    <a
                      href="/terminos"
                      className="text-red-600 hover:text-red-700 font-medium mx-1"
                    >
                      políticas de privacidad
                    </a>
                    y los
                    <a
                      href="/condiciones"
                      className="text-red-600 hover:text-red-700 font-medium mx-1"
                    >
                      términos y condiciones
                    </a>
                    del servicio.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer del modal */}
          <div className="bg-gradient-to-r from-red-50 to-white px-8 py-6 border-t border-red-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-red-200 flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">?</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    ¿Necesitas ayuda?
                  </p>
                  <a
                    href="tel:+573001234567"
                    className="text-red-600 hover:text-red-700 text-sm font-bold"
                  >
                    Línea de soporte: +57 300 123 4567
                  </a>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
              >
                Cancelar y volver al carrito
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// import { motion, AnimatePresence } from "framer-motion";
// import { X } from "lucide-react";
// import ContactForm from "./ContactForm";

// export default function CheckoutModal({ open, onClose }) {
//   if (!open) return null;

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         <motion.div
//           className="bg-neutral-900 w-full max-w-2xl rounded-2xl p-6 md:p-10 shadow-2xl relative"
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//         >
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-white/70 hover:text-red-600"
//           >
//             <X size={26} />
//           </button>

//           <h2 className="text-2xl font-semibold text-red-600 mb-6">
//             Finalizar pedido
//           </h2>

//           {/* 👇 cerrará el modal cuando el formulario sea exitoso */}
//           <ContactForm onSuccess={onClose} />
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
