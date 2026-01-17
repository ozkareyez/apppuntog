import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
} from "lucide-react";

const AgeVerification = ({ onVerified }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isVerified = sessionStorage.getItem("ageVerified");
    if (isVerified === "true") {
      setIsVisible(false);
      onVerified();
    }
  }, [onVerified]);

  const handleConfirm = () => {
    setIsLoading(true);
    // Simula un pequeño delay para la experiencia
    setTimeout(() => {
      sessionStorage.setItem("ageVerified", "true");
      setIsVisible(false);
      setIsLoading(false);
      onVerified();
    }, 300);
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
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm"
      >
        {/* Contenedor principal - Compacto y elegante */}
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md"
        >
          {/* Card con efecto de vidrio */}
          <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            {/* Encabezado elegante */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    VERIFICACIÓN DE EDAD
                  </h1>
                  <p className="text-white/80 text-sm mt-1">
                    Contenido exclusivo para adultos
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {/* Icono de advertencia */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="flex justify-center mb-5"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full border-4 border-white flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">18+</span>
                  </div>
                </div>
              </motion.div>

              {/* Mensaje */}
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Acceso Restringido
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Este sitio contiene material para{" "}
                  <span className="font-bold text-red-600">
                    mayores de 18 años
                  </span>
                  . Confirma que cumples con la edad legal requerida.
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg text-sm">
                  <Lock className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 font-medium">
                    Verificación obligatoria
                  </span>
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2
                    ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Soy mayor de 18 años
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeny}
                  className="w-full py-3.5 rounded-xl font-bold text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:text-red-700 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-red-50"
                >
                  <XCircle className="w-5 h-5" />
                  Soy menor de edad
                </motion.button>
              </div>

              {/* Aviso legal */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 pt-5 border-t border-gray-100"
              >
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Al confirmar, declaras bajo tu responsabilidad que tienes la
                  edad legal mínima requerida según la legislación vigente. El
                  acceso a menores está estrictamente prohibido.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Elementos decorativos sutiles */}
          <div className="absolute -z-10 -inset-4">
            <div className="absolute top-10 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-600/5 rounded-full blur-3xl" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgeVerification;
