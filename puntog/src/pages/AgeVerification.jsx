import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AgeVerification = ({ onVerified }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
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
        className="fixed inset-0 z-50 overflow-hidden"
      >
        {/* Fondo con gradiente profesional */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

        {/* Patrón sutil de fondo */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, #dc2626 2px, transparent 0)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Línea decorativa superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

        <div className="relative h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", damping: 20 }}
            className="relative w-full max-w-xl"
          >
            {/* Efecto de borde brillante */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-3xl blur-sm opacity-50" />

            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
              {/* Cabecera con gradiente rojo */}
              <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 py-8 px-6 text-center">
                <motion.div
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-4 border-2 border-white/20"
                >
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </motion.div>

                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  VERIFICACIÓN DE EDAD
                </h1>
                <div className="w-32 h-1 bg-white/50 mx-auto rounded-full" />
              </div>

              {/* Contenido principal */}
              <div className="p-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Acceso Restringido
                  </h2>

                  <div className="space-y-4 text-gray-600">
                    <p className="text-lg leading-relaxed">
                      Este sitio contiene contenido exclusivo para{" "}
                      <span className="font-bold text-red-600">
                        mayores de 18 años
                      </span>
                      .
                    </p>

                    <div className="inline-flex items-center justify-center px-4 py-2 bg-red-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-red-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">
                        Se requiere confirmación de edad para continuar
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Botones */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    className="flex-1 group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      CONFIRMAR MAYORÍA DE EDAD
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "#f8fafc",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeny}
                    className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-5 px-8 rounded-xl hover:border-red-200 hover:text-red-700 transition-all duration-300"
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      SOY MENOR DE EDAD
                    </span>
                  </motion.button>
                </motion.div>

                {/* Información legal */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-8 pt-6 border-t border-gray-100"
                >
                  <div className="flex items-start justify-center text-gray-500 text-sm">
                    <svg
                      className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-center max-w-md">
                      Al confirmar tu edad, aceptas que tienes la edad legal
                      mínima requerida según la legislación aplicable. El acceso
                      a menores de edad está estrictamente prohibido.
                    </p>
                  </div>

                  {/* Sello de verificación */}
                  <div className="mt-6 flex justify-center">
                    <div className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-100 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                        <span className="text-red-600 font-bold">18+</span>
                      </div>
                      <span className="text-xs font-semibold text-red-700">
                        VERIFICACIÓN REQUERIDA POR LEY
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Elementos decorativos */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-10" />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgeVerification;

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// const AgeVerification = ({ onVerified }) => {
//   const [isVisible, setIsVisible] = useState(true);

//   useEffect(() => {
//     // Verificar si ya fue verificado anteriormente en esta sesión
//     const isVerified = sessionStorage.getItem("ageVerified");
//     if (isVerified === "true") {
//       setIsVisible(false);
//       onVerified();
//     }
//   }, [onVerified]);

//   const handleConfirm = () => {
//     sessionStorage.setItem("ageVerified", "true");
//     setIsVisible(false);
//     onVerified();
//   };

//   const handleDeny = () => {
//     window.location.href = "https://www.google.com";
//   };

//   if (!isVisible) return null;

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
//       >
//         <motion.div
//           initial={{ scale: 0.8, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//           className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 text-center"
//         >
//           {/* Icono de advertencia */}
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
//             className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6"
//           >
//             <svg
//               className="w-10 h-10 text-red-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//               />
//             </svg>
//           </motion.div>

//           {/* Título */}
//           <h2 className="text-3xl font-bold text-gray-900 mb-3">
//             Verificación de Edad
//           </h2>

//           {/* Mensaje */}
//           <p className="text-gray-600 mb-8 leading-relaxed">
//             Para acceder a este sitio web debes confirmar que eres{" "}
//             <span className="font-semibold text-red-600">mayor de 18 años</span>
//             .
//           </p>

//           {/* Botones */}
//           <div className="flex flex-col sm:flex-row gap-3">
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={handleConfirm}
//               className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
//             >
//               Soy mayor de 18
//             </motion.button>

//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={handleDeny}
//               className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
//             >
//               Soy menor de 18
//             </motion.button>
//           </div>

//           {/* Nota legal */}
//           <p className="text-xs text-gray-400 mt-6">
//             Al continuar, confirmas que tienes la edad legal requerida
//           </p>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default AgeVerification;
