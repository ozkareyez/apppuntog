import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AgeVerification = ({ onVerified }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Verificar si ya fue verificado anteriormente en esta sesión
    const isVerified = sessionStorage.getItem("ageVerified");
    if (isVerified === "true") {
      setIsVisible(false);
      onVerified();
    }
  }, [onVerified]);

  const handleConfirm = () => {
    sessionStorage.setItem("ageVerified", "true");
    setIsVisible(false);
    onVerified();
  };

  const handleDeny = () => {
    window.location.href = "https://www.google.com";
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 text-center"
        >
          {/* Icono de advertencia */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6"
          >
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </motion.div>

          {/* Título */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Verificación de Edad
          </h2>

          {/* Mensaje */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Para acceder a este sitio web debes confirmar que eres{" "}
            <span className="font-semibold text-red-600">mayor de 18 años</span>
            .
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Soy mayor de 18
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeny}
              className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              Soy menor de 18
            </motion.button>
          </div>

          {/* Nota legal */}
          <p className="text-xs text-gray-400 mt-6">
            Al continuar, confirmas que tienes la edad legal requerida
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgeVerification;
