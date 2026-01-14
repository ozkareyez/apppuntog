import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Shield,
  Truck,
  Heart,
  Lock,
  Star,
} from "lucide-react";

const INTERVALO = 5000;

export default function MainCTA() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const slides = [
    {
      title: "Placer y elegancia para ti",
      desc: "Lencería y productos sensuales con entrega discreta en toda Colombia.",
      img: "/imagenes/cta-lenceria.jpg",
      primary: { text: "Ver catálogo", to: "/?categoria=lenceria" },
      secondary: { text: "Asesoría personalizada", to: "/contacto" },
      badge: "🔥 Más vendidos",
    },
    {
      title: "Entrega discreta garantizada",
      desc: "Empaques confidenciales y envíos rápidos a todo el país.",
      img: "/imagenes/cta-envio.jpg",
      primary: { text: "Ver ofertas", to: "/?filtro=ofertas" },
      secondary: { text: "Hablar ahora", to: "/contacto" },
      badge: "🚚 Envíos nacionales",
    },
    {
      title: "Calidad premium",
      desc: "Productos seleccionados para experiencias únicas.",
      img: "/imagenes/cta-premium.jpg",
      primary: { text: "Novedades", to: "/?filtro=nuevos" },
      secondary: { text: "Contáctanos", to: "/contacto" },
      badge: "💎 Selección premium",
    },
  ];

  /* AUTOPLAY */
  useEffect(() => {
    if (paused) return;

    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVALO);

    return () => clearInterval(timerRef.current);
  }, [paused]);

  const slide = slides[index];

  const nextSlide = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % slides.length);
    resetTimer();
  };

  const prevSlide = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + slides.length) % slides.length);
    resetTimer();
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVALO);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[85vh] flex items-center bg-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* PATRÓN SUTIL DE FONDO */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(220,38,38,0.03)_25%,rgba(220,38,38,0.03)_50%,transparent_50%,transparent_75%,rgba(220,38,38,0.03)_75%)] bg-[length:10px_10px]" />
      </div>

      {/* BURBUJAS ROJAS ANIMADAS */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-20 left-10 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-red-50 to-red-100 blur-3xl opacity-40"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-red-50 to-red-100 blur-3xl opacity-40"
      />

      {/* ELEMENTOS DECORATIVOS */}
      <div className="absolute top-10 left-5 md:left-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-2 border-red-200 rounded-full"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 w-full py-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* CONTENIDO */}
          <div className="relative z-20">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.title}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="space-y-6 md:space-y-8"
              >
                {/* BADGE */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-200 shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-sm font-semibold text-red-700">
                    {slide.badge}
                  </span>
                </motion.div>

                {/* TÍTULO Y DESCRIPCIÓN */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                    <span className="text-gray-900">
                      {slide.title.split(" ").slice(0, -1).join(" ")}
                    </span>
                    <br />
                    <span className="text-red-600">
                      {slide.title.split(" ").slice(-1)}
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
                    {slide.desc}
                  </p>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <motion.div
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.div variants={itemVariants}>
                    <Link
                      to={slide.primary.to}
                      className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden rounded-xl transition-all duration-300 hover:shadow-2xl"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 transition-all duration-300 group-hover:scale-105" />
                      <div className="relative z-10 flex items-center gap-2 text-white font-semibold">
                        {slide.primary.text}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Link
                      to={slide.secondary.to}
                      className="group inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-red-200 hover:border-red-600 bg-white transition-all duration-300 hover:shadow-lg"
                    >
                      <span className="font-semibold text-red-700 group-hover:text-red-800 relative z-10">
                        {slide.secondary.text}
                      </span>
                    </Link>
                  </motion.div>
                </motion.div>

                {/* GARANTÍAS */}
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200"
                >
                  <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg">
                    <Lock className="w-6 h-6 text-red-600 mb-2" />
                    <span className="text-xs font-medium text-gray-700">
                      Pago seguro
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg">
                    <Truck className="w-6 h-6 text-red-600 mb-2" />
                    <span className="text-xs font-medium text-gray-700">
                      Envío discreto
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg">
                    <Star className="w-6 h-6 text-red-600 mb-2" />
                    <span className="text-xs font-medium text-gray-700">
                      Calidad premium
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* IMAGEN */}
          <div className="relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.img}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="relative"
              >
                {/* CONTENEDOR DE IMAGEN */}
                <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-red-100">
                  {/* MARCO ROJO SUTIL */}
                  <div className="absolute inset-0 border-4 border-red-50 opacity-30 rounded-2xl" />

                  {/* IMAGEN */}
                  <motion.img
                    src={slide.img}
                    alt="Punto G"
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 8 }}
                  />

                  {/* OVERLAY GRADIENTE */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent" />

                  {/* ETIQUETA FLOTANTE */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl max-w-xs border border-red-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Productos Premium
                        </p>
                        <p className="text-xs text-gray-600">
                          Calidad certificada
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* CONTROLES DE NAVEGACIÓN */}
                <div className="absolute -bottom-6 right-6 flex gap-2">
                  <button
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full bg-white border border-red-200 shadow-lg flex items-center justify-center hover:bg-red-50 hover:scale-105 active:scale-95 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-red-600" />
                  </button>

                  <button
                    onClick={() => setPaused(!paused)}
                    className="w-10 h-10 rounded-full bg-white border border-red-200 shadow-lg flex items-center justify-center hover:bg-red-50 hover:scale-105 active:scale-95 transition-all"
                  >
                    {paused ? (
                      <Play className="w-4 h-4 text-red-600" />
                    ) : (
                      <Pause className="w-4 h-4 text-red-600" />
                    )}
                  </button>

                  <button
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full bg-white border border-red-200 shadow-lg flex items-center justify-center hover:bg-red-50 hover:scale-105 active:scale-95 transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* INDICADORES DE PROGRESO */}
        <div className="mt-12 flex flex-col items-center">
          <div className="flex gap-2 mb-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                  resetTimer();
                }}
                className="relative group"
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === i
                      ? "bg-red-600 scale-125"
                      : "bg-red-200 group-hover:bg-red-300"
                  }`}
                />
                <div className="absolute -inset-2 rounded-full bg-red-100/0 group-hover:bg-red-100/50 transition-colors" />
              </button>
            ))}
          </div>

          {/* BARRA DE PROGRESO */}
          <div className="w-full max-w-md h-1 bg-red-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-red-600"
              initial={{ width: "0%" }}
              animate={{ width: paused ? "100%" : "0%" }}
              transition={{
                duration: INTERVALO / 1000,
                ease: "linear",
                repeat: paused ? 0 : Infinity,
              }}
              key={index}
            />
          </div>
        </div>
      </div>

      {/* INDICADOR DE SCROLL */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <div className="flex flex-col items-center">
          <div className="text-xs text-red-600 font-medium mb-1">Scroll</div>
          <div className="w-5 h-8 rounded-full border border-red-200 flex justify-center">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 rounded-full bg-red-400 mt-2"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// import { motion, AnimatePresence } from "framer-motion";
// import { Link } from "react-router-dom";
// import { useEffect, useRef, useState } from "react";

// const INTERVALO = 5000;

// export default function MainCTA() {
//   const [index, setIndex] = useState(0);
//   const [paused, setPaused] = useState(false);
//   const timerRef = useRef(null);

//   const slides = [
//     {
//       title: "Placer y elegancia para ti",
//       desc: "Lencería y productos sensuales con entrega discreta en toda Colombia.",
//       img: "/imagenes/cta-lenceria.jpg",
//       primary: { text: "Ver catálogo", to: "/?categoria=lenceria" },
//       secondary: { text: "Asesoría personalizada", to: "/contacto" },
//       badge: "🔥 Más vendidos",
//     },
//     {
//       title: "Entrega discreta garantizada",
//       desc: "Empaques confidenciales y envíos rápidos a todo el país.",
//       img: "/imagenes/cta-envio.jpg",
//       primary: { text: "Ver ofertas", to: "/?filtro=ofertas" },
//       secondary: { text: "Hablar ahora", to: "/contacto" },
//       badge: "🚚 Envíos nacionales",
//     },
//     {
//       title: "Calidad premium",
//       desc: "Productos seleccionados para experiencias únicas.",
//       img: "/imagenes/cta-premium.jpg",
//       primary: { text: "Novedades", to: "/?filtro=nuevos" },
//       secondary: { text: "Contáctanos", to: "/contacto" },
//       badge: "💎 Selección premium",
//     },
//   ];

//   /* AUTOPLAY */
//   useEffect(() => {
//     if (paused) return;

//     timerRef.current = setInterval(() => {
//       setIndex((i) => (i + 1) % slides.length);
//     }, INTERVALO);

//     return () => clearInterval(timerRef.current);
//   }, [paused]);

//   const slide = slides[index];

//   return (
//     <section
//       className="relative w-full min-h-[75vh] flex items-center bg-white overflow-hidden"
//       onMouseEnter={() => setPaused(true)}
//       onMouseLeave={() => setPaused(false)}
//     >
//       {/* BLUR DECOR */}
//       <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
//       <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />

//       <div className="relative max-w-7xl mx-auto px-4 w-full">
//         <div className="grid md:grid-cols-2 gap-10 items-center bg-white/90 backdrop-blur border border-red-100 rounded-3xl p-6 md:p-16 shadow-2xl">
//           {/* TEXTO */}
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={slide.title}
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.5 }}
//               className="text-center md:text-left space-y-5"
//             >
//               {/* BADGE */}
//               <span className="inline-block px-4 py-1 rounded-full bg-red-600/10 text-red-600 text-xs font-semibold">
//                 {slide.badge}
//               </span>

//               <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
//                 {slide.title}
//               </h1>

//               <p className="text-gray-600 max-w-md mx-auto md:mx-0">
//                 {slide.desc}
//               </p>

//               {/* CTAS */}
//               <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
//                 <Link
//                   to={slide.primary.to}
//                   className="px-7 py-3 rounded-full text-sm font-semibold bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:shadow-red-700/40 transition"
//                 >
//                   {slide.primary.text}
//                 </Link>

//                 <Link
//                   to={slide.secondary.to}
//                   className="px-7 py-3 rounded-full text-sm font-semibold border border-red-600/40 text-red-600 hover:bg-red-600 hover:text-white transition"
//                 >
//                   {slide.secondary.text}
//                 </Link>
//               </div>

//               {/* TRUST */}
//               <div className="text-xs text-gray-500 pt-4">
//                 🔒 Pago seguro · 🚚 Envíos discretos · ❤️ Clientes felices
//               </div>
//             </motion.div>
//           </AnimatePresence>

//           {/* IMAGEN */}
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={slide.img}
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               transition={{ duration: 0.6 }}
//               className="relative"
//             >
//               <div className="relative h-[260px] md:h-[460px] rounded-3xl overflow-hidden shadow-2xl">
//                 {/* OVERLAY */}
//                 <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent z-10" />
//                 <img
//                   src={slide.img}
//                   alt="Punto G"
//                   className="w-full h-full object-cover scale-105"
//                   loading="lazy"
//                 />
//               </div>
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </div>

//       {/* INDICADORES PRO */}
//       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
//         {slides.map((_, i) => (
//           <button
//             key={i}
//             onClick={() => setIndex(i)}
//             className={`h-2 rounded-full transition-all ${
//               index === i ? "w-8 bg-red-600" : "w-2 bg-gray-300"
//             }`}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }
