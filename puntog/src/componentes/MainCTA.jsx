import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MainCTA = () => {
  return (
    <section className="relative w-full py-24 px-6 overflow-hidden bg-[#0b0b0f]">
      {/* Fondo decorativo */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-700/30 rounded-full blur-3xl" />
      </div>

      {/* Contenido */}
      <div className="relative max-w-5xl mx-auto text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 md:p-16 shadow-2xl">
        {/* Título */}
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold mb-6 bg-linear-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow"
          initial={{ opacity: 0, y: -40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Descubre el placer que mereces
        </motion.h1>

        {/* Descripción */}
        <motion.p
          className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Lencería exclusiva y productos sensuales diseñados para elevar cada
          experiencia con elegancia, discreción y calidad premium.
        </motion.p>

        {/* Botones */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link
            to="/catalogo"
            className="px-10 py-4 rounded-full text-lg font-semibold 
            bg-gradient-to-r from-pink-500 to-purple-600 
            text-white shadow-lg shadow-pink-500/30
            hover:scale-110 hover:shadow-pink-500/50 transition-all duration-300"
          >
            Explorar colección
          </Link>

          <Link
            to="/contacto"
            className="px-10 py-4 rounded-full text-lg font-semibold 
            border border-white/30 text-white
            hover:bg-white hover:text-black transition-all duration-300"
          >
            Asesoría privada
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MainCTA;
