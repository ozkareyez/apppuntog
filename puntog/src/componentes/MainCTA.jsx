import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const INTERVALO = 5000;

export default function MainCTA() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

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
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVALO);

    return () => clearInterval(timerRef.current);
  }, [paused]);

  const slide = slides[index];

  return (
    <section
      className="relative w-full min-h-[75vh] flex items-center bg-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* BLUR DECOR */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 w-full">
        <div className="grid md:grid-cols-2 gap-10 items-center bg-white/90 backdrop-blur border border-red-100 rounded-3xl p-6 md:p-16 shadow-2xl">
          {/* TEXTO */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center md:text-left space-y-5"
            >
              {/* BADGE */}
              <span className="inline-block px-4 py-1 rounded-full bg-red-600/10 text-red-600 text-xs font-semibold">
                {slide.badge}
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                {slide.title}
              </h1>

              <p className="text-gray-600 max-w-md mx-auto md:mx-0">
                {slide.desc}
              </p>

              {/* CTAS */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  to={slide.primary.to}
                  className="px-7 py-3 rounded-full text-sm font-semibold bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:shadow-red-700/40 transition"
                >
                  {slide.primary.text}
                </Link>

                <Link
                  to={slide.secondary.to}
                  className="px-7 py-3 rounded-full text-sm font-semibold border border-red-600/40 text-red-600 hover:bg-red-600 hover:text-white transition"
                >
                  {slide.secondary.text}
                </Link>
              </div>

              {/* TRUST */}
              <div className="text-xs text-gray-500 pt-4">
                🔒 Pago seguro · 🚚 Envíos discretos · ❤️ Clientes felices
              </div>
            </motion.div>
          </AnimatePresence>

          {/* IMAGEN */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.img}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative h-[260px] md:h-[460px] rounded-3xl overflow-hidden shadow-2xl">
                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent z-10" />
                <img
                  src={slide.img}
                  alt="Punto G"
                  className="w-full h-full object-cover scale-105"
                  loading="lazy"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* INDICADORES PRO */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              index === i ? "w-8 bg-red-600" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
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
//       secondary: { text: "Asesoría", to: "/?categoria=lenceria" },
//     },
//     {
//       title: "Entrega discreta garantizada",
//       desc: "Empaques confidenciales y envíos rápidos a todo el país.",
//       img: "/imagenes/cta-envio.jpg",
//       primary: { text: "Ofertas", to: "/?filtro=ofertas" },
//       secondary: { text: "Hablar", to: "/contacto" },
//     },
//     {
//       title: "Calidad premium",
//       desc: "Productos seleccionados para experiencias únicas.",
//       img: "/imagenes/cta-premium.jpg",
//       primary: { text: "Novedades", to: "/?filtro=ofertas" },
//       secondary: { text: "Contacto", to: "?filtro=ofertas" },
//     },
//   ];

//   /* autoplay */
//   useEffect(() => {
//     if (paused) return;

//     timerRef.current = setInterval(() => {
//       setIndex((i) => (i + 1) % slides.length);
//     }, INTERVALO);

//     return () => clearInterval(timerRef.current);
//   }, [paused, slides.length]);

//   const slide = slides[index];

//   return (
//     <section
//       className="
//         relative w-full
//         min-h-[70vh] md:min-h-auto
//         flex items-center
//         px-4 md:px-6
//         bg-white overflow-hidden
//       "
//       onMouseEnter={() => setPaused(true)}
//       onMouseLeave={() => setPaused(false)}
//     >
//       {/* DECORATIVOS */}
//       <div className="absolute -top-32 -left-32 w-72 h-72 bg-red-600/15 rounded-full blur-3xl md:block hidden" />

//       <div
//         className="
//           relative max-w-6xl mx-auto
//           grid md:grid-cols-2
//           gap-6 md:gap-12
//           items-center
//           bg-white
//           border border-red-100
//           rounded-2xl
//           p-4 sm:p-6 md:p-14
//           shadow-lg
//         "
//       >
//         {/* TEXTO */}
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={slide.title}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.4 }}
//             className="text-center md:text-left"
//           >
//             <h1 className="text-xl sm:text-2xl md:text-5xl font-bold text-gray-900 mb-2">
//               {slide.title}
//             </h1>

//             <p className="text-gray-600 text-sm sm:text-base mb-4 max-w-md mx-auto md:mx-0">
//               {slide.desc}
//             </p>

//             <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center md:justify-start">
//               <Link
//                 to={slide.primary.to}
//                 className="
//                   px-6 py-3 rounded-full text-sm font-semibold
//                   bg-red-600 text-white
//                   shadow-md shadow-red-600/30
//                   hover:bg-red-700
//                   transition
//                 "
//               >
//                 {slide.primary.text}
//               </Link>

//               <Link
//                 to={slide.secondary.to}
//                 className="
//                   px-6 py-3 rounded-full text-sm font-semibold
//                   border border-red-600/40 text-red-600
//                   hover:bg-red-600 hover:text-white
//                   transition
//                 "
//               >
//                 {slide.secondary.text}
//               </Link>
//             </div>
//           </motion.div>
//         </AnimatePresence>

//         {/* IMAGEN */}
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={slide.img}
//             initial={{ opacity: 0, scale: 0.96 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//             transition={{ duration: 0.4 }}
//             className="relative"
//           >
//             {/* MOBILE COMPACT */}
//             <div className="md:hidden relative h-[220px] rounded-xl overflow-hidden shadow-md">
//               <img
//                 src={slide.img}
//                 alt="Punto G"
//                 className="w-full h-full object-cover"
//                 loading="lazy"
//               />
//             </div>

//             {/* DESKTOP */}
//             <div className="hidden md:block relative h-[420px] rounded-2xl overflow-hidden shadow-xl">
//               <img
//                 src={slide.img}
//                 alt="Punto G"
//                 className="w-full h-full object-cover"
//                 loading="lazy"
//               />
//             </div>
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       {/* INDICADORES */}
//       <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
//         {slides.map((_, i) => (
//           <button
//             key={i}
//             onClick={() => setIndex(i)}
//             className={`w-2 h-2 rounded-full ${
//               index === i ? "bg-red-600" : "bg-gray-300"
//             }`}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }
