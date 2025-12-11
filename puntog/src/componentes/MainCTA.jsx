import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MainCTA = () => {
  return (
    <section className="w-full h-170 py-50 px-6 bg-linear-to-br from-pink-600 via-pink-500 to-purple-600 text-white  shadow-2xl mt-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Título con animación */}
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Descubre el Placer que Mereces
        </motion.h1>

        {/* Texto */}
        <motion.p
          className="text-lg md:text-xl mb-8 opacity-90"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Lencería irresistible y productos diseñados para elevar tus noches.
        </motion.p>

        {/* Botón */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Link
            to="/catalogo"
            className="bg-white text-pink-600 font-bold text-lg px-10 py-4 rounded-full shadow-xl hover:scale-110 transition-all"
          >
            Explorar Colección
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MainCTA;

// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";

// const MainCTA = () => {
//   return (
//     <section className="relative w-full h-[42rem] overflow-hidden mt-10 rounded-lg shadow-2xl">
//       {/* Video de fondo */}
//       <video
//         className="absolute w-full h-full object-cover"
//         src="/videos/lenceria.mp4" // ruta de tu video
//         autoPlay
//         muted
//         loop
//       />

//       {/* Overlay oscuro para contraste */}
//       <div className="absolute w-full h-full bg-black/50"></div>

//       {/* Contenido */}
//       <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white px-6">
//         <motion.h1
//           className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg"
//           initial={{ opacity: 0, y: -30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true }}
//         >
//           Descubre el Placer que Mereces
//         </motion.h1>

//         <motion.p
//           className="text-lg md:text-xl mb-8 opacity-90"
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.2 }}
//           viewport={{ once: true }}
//         >
//           Lencería irresistible y productos diseñados para elevar tus noches.
//         </motion.p>

//         <motion.div
//           initial={{ scale: 0.7, opacity: 0 }}
//           whileInView={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//           viewport={{ once: true }}
//         >
//           <Link
//             to="/catalogo"
//             className="bg-white text-pink-600 font-bold text-lg px-10 py-4 rounded-full shadow-xl hover:scale-110 transition-all"
//             aria-label="Explorar colección de productos"
//           >
//             Explorar Colección
//           </Link>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default MainCTA;
