import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const INTERVALO = 5000;

const MainCTA = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const slides = [
    {
      title: "Descubre el placer que mereces",
      desc: "Lencería exclusiva y productos sensuales diseñados para elevar cada experiencia con elegancia y discreción.",
      img: "/imagenes/cta-lenceria.jpg",
      primary: { text: "Explorar colección", to: "/catalogo" },
      secondary: { text: "Asesoría privada", to: "/contacto" },
    },
    {
      title: "Entrega discreta en toda Colombia",
      desc: "Empaques 100% confidenciales, envíos rápidos y atención personalizada para comprar con total tranquilidad.",
      img: "/imagenes/cta-envio.jpg",
      primary: { text: "Ver ofertas", to: "/ofertas" },
      secondary: { text: "Hablar con un asesor", to: "/contacto" },
    },
    {
      title: "Calidad premium y atención personalizada",
      desc: "Seleccionamos productos de alta calidad para que vivas experiencias únicas con confianza y seguridad.",
      img: "/imagenes/cta-premium.jpg",
      primary: { text: "Ver novedades", to: "/catalogo" },
      secondary: { text: "Contáctanos", to: "/contacto" },
    },
  ];

  // ⏱️ autoplay con pausa
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
      className="relative w-full py-24 px-6 bg-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* decorativos */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center bg-white border border-red-100 rounded-3xl p-10 md:p-16 shadow-xl">
        {/* TEXTO */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              {slide.title}
            </h1>

            <div className="h-1 w-24 bg-red-600 rounded-full mb-6" />

            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              {slide.desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={slide.primary.to}
                className="
                  px-10 py-4 rounded-full text-lg font-semibold
                  bg-red-600 text-white shadow-lg shadow-red-600/30
                  hover:bg-red-700 hover:scale-105 transition
                "
              >
                {slide.primary.text}
              </Link>

              <Link
                to={slide.secondary.to}
                className="
                  px-10 py-4 rounded-full text-lg font-semibold
                  border border-red-600 text-red-600
                  hover:bg-red-600 hover:text-white transition
                "
              >
                {slide.secondary.text}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* IMAGEN */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.img}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img
              src={slide.img}
              alt="Punto G"
              className="w-full h-[420px] object-cover rounded-2xl shadow-xl"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* INDICADORES */}
      <div className="mt-8 flex justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`
              w-3 h-3 rounded-full transition-all
              ${
                index === i
                  ? "bg-red-600 scale-125"
                  : "bg-gray-300 hover:bg-red-400"
              }
            `}
          />
        ))}
      </div>
    </section>
  );
};

export default MainCTA;

// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";

// const MainCTA = () => {
//   return (
//     <section className="relative w-full py-24 px-6 overflow-hidden bg-white">
//       {/* Fondo decorativo rojo */}
//       <div className="absolute inset-0 pointer-events-none">
//         <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
//         <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
//       </div>

//       {/* Contenedor principal */}
//       <div className="relative max-w-5xl mx-auto text-center bg-white border border-red-100 rounded-3xl p-10 md:p-16 shadow-xl">
//         {/* Título */}
//         <motion.h1
//           className="text-4xl md:text-6xl font-extrabold mb-6 text-gray-900"
//           initial={{ opacity: 0, y: -40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7 }}
//           viewport={{ once: true }}
//         >
//           Descubre el placer que mereces
//         </motion.h1>

//         {/* Línea decorativa */}
//         <div className="mx-auto mb-8 h-1 w-24 rounded-full bg-red-600" />

//         {/* Descripción */}
//         <motion.p
//           className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7, delay: 0.2 }}
//           viewport={{ once: true }}
//         >
//           Lencería exclusiva y productos sensuales diseñados para elevar cada
//           experiencia con elegancia, discreción y calidad premium.
//         </motion.p>

//         {/* Botones */}
//         <motion.div
//           className="flex flex-col sm:flex-row gap-4 justify-center"
//           initial={{ scale: 0.8, opacity: 0 }}
//           whileInView={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//           viewport={{ once: true }}
//         >
//           {/* CTA principal */}
//           <Link
//             to="/catalogo"
//             className="px-10 py-4 rounded-full text-lg font-semibold
//             bg-red-600 text-white shadow-lg shadow-red-600/30
//             hover:bg-red-700 hover:scale-105 transition-all duration-300"
//           >
//             Explorar colección
//           </Link>

//           {/* CTA secundario */}
//           <Link
//             to="/contacto"
//             className="px-10 py-4 rounded-full text-lg font-semibold
//             border border-red-600 text-red-600
//             hover:bg-red-600 hover:text-white transition-all duration-300"
//           >
//             Asesoría privada
//           </Link>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default MainCTA;

// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";

// const MainCTA = () => {
//   return (
//     <section className="relative w-full py-24 px-6 overflow-hidden bg-[#0b0b0f]">
//       {/* Fondo decorativo */}
//       <div className="absolute inset-0">
//         <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl" />
//         <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-700/30 rounded-full blur-3xl" />
//       </div>

//       {/* Contenido */}
//       <div className="relative max-w-5xl mx-auto text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 md:p-16 shadow-2xl">
//         {/* Título */}
//         <motion.h1
//           className="text-4xl md:text-6xl font-extrabold mb-6 bg-linear-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow"
//           initial={{ opacity: 0, y: -40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7 }}
//           viewport={{ once: true }}
//         >
//           Descubre el placer que mereces
//         </motion.h1>

//         {/* Descripción */}
//         <motion.p
//           className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7, delay: 0.2 }}
//           viewport={{ once: true }}
//         >
//           Lencería exclusiva y productos sensuales diseñados para elevar cada
//           experiencia con elegancia, discreción y calidad premium.
//         </motion.p>

//         {/* Botones */}
//         <motion.div
//           className="flex flex-col sm:flex-row gap-4 justify-center"
//           initial={{ scale: 0.8, opacity: 0 }}
//           whileInView={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//           viewport={{ once: true }}
//         >
//           <Link
//             to="/catalogo"
//             className="px-10 py-4 rounded-full text-lg font-semibold
//             bg-gradient-to-r from-pink-500 to-purple-600
//             text-white shadow-lg shadow-pink-500/30
//             hover:scale-110 hover:shadow-pink-500/50 transition-all duration-300"
//           >
//             Explorar colección
//           </Link>

//           <Link
//             to="/contacto"
//             className="px-10 py-4 rounded-full text-lg font-semibold
//             border border-white/30 text-white
//             hover:bg-white hover:text-black transition-all duration-300"
//           >
//             Asesoría privada
//           </Link>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default MainCTA;
