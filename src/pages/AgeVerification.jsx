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
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-[2px]"
      >
        {/* Contenedor principal - MÁS PEQUEÑO Y CENTRADO */}
        <motion.div
          initial={{ scale: 0.9, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm" // Cambiado de max-w-md a max-w-sm (más pequeño)
        >
          {/* Card sin efectos rosados */}
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Encabezado - manteniendo el rojo pero sin que afecte al fondo */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-5 py-4">
              {" "}
              {/* Padding reducido */}
              <div className="flex items-center justify-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-full">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    {" "}
                    {/* Texto más pequeño */}
                    VERIFICACIÓN
                  </h1>
                  <p className="text-white/80 text-xs mt-0.5">
                    {" "}
                    {/* Texto más pequeño */}
                    Contenido adulto
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido - con padding reducido */}
            <div className="p-5">
              {" "}
              {/* Padding reducido de p-6 a p-5 */}
              {/* Icono de advertencia más pequeño */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="flex justify-center mb-4" // Margen reducido
              >
                <div className="relative">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                    {" "}
                    {/* Reducido de w-16 h-16 */}
                    <AlertTriangle className="w-6 h-6 text-red-600" />{" "}
                    {/* Reducido de w-8 h-8 */}
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-white flex items-center justify-center">
                    {" "}
                    {/* Reducido */}
                    <span className="text-[10px] font-bold text-red-600">
                      18+
                    </span>{" "}
                    {/* Texto más pequeño */}
                  </div>
                </div>
              </motion.div>
              {/* Mensaje más compacto */}
              <div className="text-center mb-4">
                {" "}
                {/* Margen reducido */}
                <h2 className="text-base font-semibold text-gray-800 mb-2">
                  {" "}
                  {/* Reducido de text-lg */}
                  Acceso Restringido
                </h2>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {" "}
                  {/* Texto más pequeño */}
                  Este sitio contiene material para{" "}
                  <span className="font-bold text-red-600">
                    mayores de 18 años
                  </span>
                  .
                </p>
                <div className="inline-flex items-center gap-1.5 px-2 py-1.5 bg-red-50 rounded-lg text-xs">
                  {" "}
                  {/* Más pequeño */}
                  <Lock className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-red-700 font-medium">
                    Verificación obligatoria
                  </span>
                </div>
              </div>
              {/* Botones más compactos */}
              <div className="space-y-2">
                {" "}
                {/* Espacio reducido */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm
                    ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Soy mayor de 18 años
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeny}
                  className="w-full py-3 rounded-lg font-bold text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm hover:bg-red-50/50"
                >
                  <XCircle className="w-4 h-4" />
                  Soy menor de edad
                </motion.button>
              </div>
              {/* Aviso legal más pequeño */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 pt-3 border-t border-gray-100" // Márgenes reducidos
              >
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  {" "}
                  {/* Texto más pequeño */}
                  Al confirmar, declaras que tienes la edad legal mínima
                  requerida.
                </p>
              </motion.div>
            </div>
          </div>

          {/* ELEMENTOS DECORATIVOS CORREGIDOS - SIN TONOS ROSADOS */}
          <div className="absolute -z-10 -inset-3">
            {" "}
            {/* Márgenes negativos reducidos */}
            {/* Cambiado a tonos neutros/azules */}
            <div className="absolute top-10 left-10 w-24 h-24 bg-blue-900/5 rounded-full blur-2xl" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-neutral-800/10 rounded-full blur-2xl" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgeVerification;
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Shield,
//   AlertTriangle,
//   CheckCircle,
//   XCircle,
//   Lock,
// } from "lucide-react";

// const AgeVerification = ({ onVerified }) => {
//   const [isVisible, setIsVisible] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const isVerified = sessionStorage.getItem("ageVerified");
//     if (isVerified === "true") {
//       setIsVisible(false);
//       onVerified();
//     }
//   }, [onVerified]);

//   const handleConfirm = () => {
//     setIsLoading(true);
//     // Simula un pequeño delay para la experiencia
//     setTimeout(() => {
//       sessionStorage.setItem("ageVerified", "true");
//       setIsVisible(false);
//       setIsLoading(false);
//       onVerified();
//     }, 300);
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
//         className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm"
//       >
//         {/* Contenedor principal - Compacto y elegante */}
//         <motion.div
//           initial={{ scale: 0.95, y: 20 }}
//           animate={{ scale: 1, y: 0 }}
//           transition={{ type: "spring", damping: 25, stiffness: 300 }}
//           className="relative w-full max-w-md"
//         >
//           {/* Card con efecto de vidrio */}
//           <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
//             {/* Encabezado elegante */}
//             <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
//               <div className="flex items-center justify-center gap-3">
//                 <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
//                   <Shield className="w-6 h-6 text-white" />
//                 </div>
//                 <div className="text-center">
//                   <h1 className="text-xl font-bold text-white tracking-tight">
//                     VERIFICACIÓN DE EDAD
//                   </h1>
//                   <p className="text-white/80 text-sm mt-1">
//                     Contenido exclusivo para adultos
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Contenido */}
//             <div className="p-6">
//               {/* Icono de advertencia */}
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.2, type: "spring" }}
//                 className="flex justify-center mb-5"
//               >
//                 <div className="relative">
//                   <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
//                     <AlertTriangle className="w-8 h-8 text-red-600" />
//                   </div>
//                   <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full border-4 border-white flex items-center justify-center">
//                     <span className="text-xs font-bold text-red-600">18+</span>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Mensaje */}
//               <div className="text-center mb-6">
//                 <h2 className="text-lg font-semibold text-gray-800 mb-3">
//                   Acceso Restringido
//                 </h2>
//                 <p className="text-gray-600 mb-4 leading-relaxed">
//                   Este sitio contiene material para{" "}
//                   <span className="font-bold text-red-600">
//                     mayores de 18 años
//                   </span>
//                   . Confirma que cumples con la edad legal requerida.
//                 </p>

//                 <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg text-sm">
//                   <Lock className="w-4 h-4 text-red-500" />
//                   <span className="text-red-700 font-medium">
//                     Verificación obligatoria
//                   </span>
//                 </div>
//               </div>

//               {/* Botones */}
//               <div className="space-y-3">
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleConfirm}
//                   disabled={isLoading}
//                   className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2
//                     ${
//                       isLoading
//                         ? "bg-gray-400 cursor-not-allowed"
//                         : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl"
//                     }`}
//                 >
//                   {isLoading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       Verificando...
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle className="w-5 h-5" />
//                       Soy mayor de 18 años
//                     </>
//                   )}
//                 </motion.button>

//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleDeny}
//                   className="w-full py-3.5 rounded-xl font-bold text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:text-red-700 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-red-50"
//                 >
//                   <XCircle className="w-5 h-5" />
//                   Soy menor de edad
//                 </motion.button>
//               </div>

//               {/* Aviso legal */}
//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4 }}
//                 className="mt-6 pt-5 border-t border-gray-100"
//               >
//                 <p className="text-xs text-gray-500 text-center leading-relaxed">
//                   Al confirmar, declaras bajo tu responsabilidad que tienes la
//                   edad legal mínima requerida según la legislación vigente. El
//                   acceso a menores está estrictamente prohibido.
//                 </p>
//               </motion.div>
//             </div>
//           </div>

//           {/* Elementos decorativos sutiles */}
//           <div className="absolute -z-10 -inset-4">
//             <div className="absolute top-10 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
//             <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-600/5 rounded-full blur-3xl" />
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default AgeVerification;
