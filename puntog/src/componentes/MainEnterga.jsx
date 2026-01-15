import { motion } from "framer-motion";
import {
  FaShippingFast,
  FaLock,
  FaShieldAlt,
  FaBoxOpen,
  FaGift,
  FaClock,
  FaHeadset,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  AiOutlineSafetyCertificate,
  AiOutlineDollarCircle,
  AiOutlineHeart,
} from "react-icons/ai";
import {
  BsFillBox2HeartFill,
  BsCashCoin,
  BsFillCreditCard2FrontFill,
  BsFillBellFill,
} from "react-icons/bs";
import {
  HiOutlineDeviceMobile,
  HiOutlineTruck,
  HiOutlineCheckCircle,
} from "react-icons/hi";

const MainEntrega = () => {
  const items = [
    {
      icon: <FaShippingFast className="w-12 h-12" />,
      title: "Envío Gratis Nacional",
      text: "Compras superiores a $200.000 COP",
      gradient: "from-red-500 to-red-600",
      badge: "🚚",
      stats: "24-48h",
      features: ["Todo Colombia", "Seguro incluido", "Rastreo en tiempo real"],
    },
    {
      icon: <FaLock className="w-12 h-12" />,
      title: "Privacidad Total",
      text: "Empaques 100% discretos y confidenciales",
      gradient: "from-red-600 to-red-700",
      badge: "🔒",
      stats: "100% seguro",
      features: ["Sin logos", "Empaque neutro", "Datos protegidos"],
    },
    {
      icon: <AiOutlineDollarCircle className="w-12 h-12" />,
      title: "Múltiples Medios de Pago",
      text: "Paga como más te convenga",
      gradient: "from-red-500 to-pink-600",
      badge: "💳",
      stats: "+3 opciones",
      features: ["Contraentrega", "Nequi", "PSE"],
    },
    {
      icon: <FaShieldAlt className="w-12 h-12" />,
      title: "Garantía de Calidad",
      text: "Productos certificados y testados",
      gradient: "from-red-600 to-rose-600",
      badge: "⭐",
      stats: "30 días",
      features: ["Calidad premium", "Devolución fácil", "Soporte 24/7"],
    },
    {
      icon: <FaClock className="w-12 h-12" />,
      title: "Entrega Rápida",
      text: "Pedidos procesados en máximo 2 horas",
      gradient: "from-red-700 to-red-800",
      badge: "⚡",
      stats: "2-4 horas",
      features: [
        "Ciudades principales",
        "Horario extendido",
        "Entrega express",
      ],
    },
    {
      icon: <FaHeadset className="w-12 h-12" />,
      title: "Asesoría Personal",
      text: "Guía experta para tu elección perfecta",
      gradient: "from-pink-600 to-rose-700",
      badge: "💬",
      stats: "24/7",
      features: [
        "WhatsApp directo",
        "Consejos expertos",
        "Respuesta inmediata",
      ],
    },
    {
      icon: <FaBoxOpen className="w-12 h-12" />,
      title: "Política de Devolución",
      text: "30 días para cambios o devoluciones",
      gradient: "from-rose-600 to-red-700",
      badge: "🔄",
      stats: "Sin preguntas",
      features: ["Fácil proceso", "Reembolso rápido", "Sin complicaciones"],
    },
    {
      icon: <HiOutlineCheckCircle className="w-12 h-12" />,
      title: "Satisfacción Garantizada",
      text: "10,000+ clientes felices nos respaldan",
      gradient: "from-red-800 to-red-900",
      badge: "❤️",
      stats: "98% satisfacción",
      features: [
        "Reseñas verificadas",
        "Clientes recurrentes",
        "Recomendaciones",
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <section className="relative w-full py-20 px-4 overflow-hidden bg-gradient-to-b from-white via-red-50/30 to-white">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-red-600/5 to-rose-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-red-200/50 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-50 rounded-full mb-6">
            <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">
              🎁 Experiencia Premium
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              La mejor experiencia
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent">
              de compra online
            </span>
          </h2>

          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Más que productos, entregamos confianza, discreción y una
            experiencia de compra cuidadosamente diseñada para tu comodidad y
            seguridad.
          </p>
        </motion.div>

        {/* GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 300, damping: 25 },
              }}
              className="group relative"
            >
              {/* CARD */}
              <div className="relative h-full bg-white rounded-2xl border border-red-100 overflow-hidden shadow-lg shadow-red-900/5 hover:shadow-2xl hover:shadow-red-900/20 transition-all duration-500">
                {/* GRADIENT BORDER */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* DECORATIVE CORNER */}
                <div
                  className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-bl-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                />

                {/* BADGE */}
                <div className="absolute top-4 left-4">
                  <span className="text-2xl">{item.badge}</span>
                </div>

                {/* CONTENT */}
                <div className="p-6 relative z-10">
                  {/* ICON */}
                  <div
                    className={`mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform duration-500`}
                  >
                    <div className="text-white">{item.icon}</div>
                  </div>

                  {/* TITLE */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-700 transition-colors">
                    {item.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="text-gray-600 mb-5 text-sm leading-relaxed">
                    {item.text}
                  </p>

                  {/* STATS */}
                  <div className="mb-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full">
                      <span className="text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                        {item.stats}
                      </span>
                    </div>
                  </div>

                  {/* FEATURES */}
                  <div className="space-y-2">
                    {item.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600" />
                        <span className="text-xs text-gray-500">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* HOVER INDICATOR */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* GLOW EFFECT */}
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-br ${item.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA BOTTOM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 shadow-2xl shadow-red-600/30">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                ¿Listo para una experiencia diferente?
              </h3>
              <p className="text-red-100">
                Descubre por qué miles confían en nosotros cada mes
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-8 py-3 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition shadow-lg">
                Ver catálogo
              </button>
              <button className="px-8 py-3 bg-transparent border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition">
                Contactar asesor
              </button>
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {[
              { text: "🎯 100% Discreto", sub: "Envíos confidenciales" },
              { text: "🚀 Envío Express", sub: "2-4 horas en ciudad" },
              { text: "💎 Productos Premium", sub: "Calidad certificada" },
              { text: "🛡️ Pago Seguro", sub: "Datos encriptados" },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-2xl mb-2">
                  {badge.text.split(" ")[0]}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {badge.text.split(" ").slice(1).join(" ")}
                </span>
                <span className="text-xs text-gray-500">{badge.sub}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MainEntrega;

// import { FaShippingFast } from "react-icons/fa";
// import { AiOutlineSafetyCertificate } from "react-icons/ai";
// import { BsFillBox2HeartFill, BsCashCoin } from "react-icons/bs";

// const MainEntrega = () => {
//   const items = [
//     {
//       icon: <FaShippingFast size={36} />,
//       title: "Envíos Gratis",
//       text: "Envíos a todo Colombia por compras superiores a $200.000",
//     },
//     {
//       icon: <BsCashCoin size={36} />,
//       title: "Pago Seguro",
//       text: "Pagos contraentrega y transferencias",
//     },
//     {
//       icon: <AiOutlineSafetyCertificate size={36} />,
//       title: "Entrega Certificada",
//       text: "Seguimiento y garantía en cada pedido",
//     },
//     {
//       icon: <BsFillBox2HeartFill size={36} />,
//       title: "Entrega Discreta",
//       text: "Empaques seguros y confidenciales",
//     },
//   ];

//   return (
//     <section className="w-full py-16 px-6 bg-white">
//       <div className="max-w-7xl mx-auto">
//         {/* TÍTULO */}
//         <h2 className="text-center text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
//           ¿Por qué elegir <span className="text-red-600">PuntoG</span>?
//         </h2>

//         <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
//           Compras seguras, envíos discretos y una experiencia pensada para ti.
//         </p>

//         {/* GRID */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//           {items.map((item, i) => (
//             <div
//               key={i}
//               className="
//                 group
//                 relative
//                 bg-white
//                 border
//                 border-gray-200
//                 rounded-2xl
//                 p-6
//                 text-center
//                 shadow-sm
//                 transition-all
//                 duration-300
//                 hover:-translate-y-2
//                 hover:shadow-lg
//                 hover:border-red-500
//               "
//             >
//               {/* ICONO */}
//               <div
//                 className="
//                   mx-auto
//                   mb-4
//                   w-16
//                   h-16
//                   flex
//                   items-center
//                   justify-center
//                   rounded-full
//                   bg-red-50
//                   text-red-600
//                   group-hover:bg-red-600
//                   group-hover:text-white
//                   transition-all
//                   duration-300
//                 "
//               >
//                 {item.icon}
//               </div>

//               {/* TEXTO */}
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 {item.title}
//               </h3>

//               <p className="text-sm text-gray-600 leading-relaxed">
//                 {item.text}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default MainEntrega;
