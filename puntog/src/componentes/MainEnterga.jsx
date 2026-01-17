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
    <section className="relative w-full py-12 md:py-20 px-4 overflow-x-hidden bg-gradient-to-b from-white via-red-50/30 to-white">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 md:w-96 md:h-96 bg-gradient-to-tr from-red-600/5 to-rose-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-red-200/50 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16 px-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-4 md:mb-6">
            <span className="text-red-600 font-semibold text-xs md:text-sm uppercase tracking-wider">
              🎁 Experiencia Premium
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 px-2">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              La mejor experiencia
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent">
              de compra online
            </span>
          </h2>

          <p className="text-gray-600 text-sm md:text-lg max-w-3xl mx-auto leading-relaxed px-2">
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
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2"
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{
                y: -4,
                transition: { type: "spring", stiffness: 300, damping: 25 },
              }}
              className="group relative"
            >
              {/* CARD */}
              <div className="relative h-full bg-white rounded-xl md:rounded-2xl border border-red-100 overflow-hidden shadow-md md:shadow-lg shadow-red-900/5 hover:shadow-xl hover:shadow-red-900/20 transition-all duration-500">
                {/* GRADIENT BORDER */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* DECORATIVE CORNER */}
                <div
                  className={`absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${item.gradient} rounded-bl-2xl md:rounded-bl-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                />

                {/* BADGE */}
                <div className="absolute top-3 left-3 md:top-4 md:left-4">
                  <span className="text-xl md:text-2xl">{item.badge}</span>
                </div>

                {/* CONTENT */}
                <div className="p-4 md:p-6 relative z-10">
                  {/* ICON */}
                  <div
                    className={`mb-3 md:mb-5 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md md:shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform duration-500`}
                  >
                    <div className="text-white text-lg md:text-xl">
                      {item.icon}
                    </div>
                  </div>

                  {/* TITLE */}
                  <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-red-700 transition-colors">
                    {item.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="text-gray-600 mb-3 md:mb-5 text-xs md:text-sm leading-relaxed">
                    {item.text}
                  </p>

                  {/* STATS */}
                  <div className="mb-3 md:mb-5">
                    <div className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-red-50 rounded-full">
                      <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                        {item.stats}
                      </span>
                    </div>
                  </div>

                  {/* FEATURES */}
                  <div className="space-y-1 md:space-y-2">
                    {item.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 md:gap-2"
                      >
                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600" />
                        <span className="text-xs text-gray-500">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* HOVER INDICATOR */}
                  <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 md:w-4 md:h-4 text-white"
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
                  className={`absolute -inset-0.5 bg-gradient-to-br ${item.gradient} rounded-xl md:rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA BOTTOM - FIXED FOR MOBILE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 md:mt-16 text-center px-2"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl md:rounded-2xl p-6 md:p-8 shadow-xl md:shadow-2xl shadow-red-600/30 overflow-hidden">
            <div className="flex flex-col items-center gap-4 md:gap-6">
              <div className="text-center">
                <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2">
                  ¿Listo para una experiencia diferente?
                </h3>
                <p className="text-red-100 text-sm md:text-base">
                  Descubre por qué miles confían en nosotros
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <button className="flex-1 px-4 md:px-8 py-3 bg-white text-red-600 font-semibold rounded-lg md:rounded-xl hover:bg-gray-100 transition shadow-lg text-sm md:text-base">
                  Ver catálogo
                </button>
                <button className="flex-1 px-4 md:px-8 py-3 bg-transparent border-2 border-white/50 text-white font-semibold rounded-lg md:rounded-xl hover:bg-white/10 transition text-sm md:text-base">
                  Contactar asesor
                </button>
              </div>
            </div>
          </div>

          {/* TRUST BADGES - RESPONSIVE */}
          <div className="mt-8 md:mt-12">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8">
              {[
                { text: "🎯 100% Discreto", sub: "Envíos confidenciales" },
                { text: "🚀 Envío Express", sub: "2-4 horas en ciudad" },
                { text: "💎 Productos Premium", sub: "Calidad certificada" },
                { text: "🛡️ Pago Seguro", sub: "Datos encriptados" },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center p-2">
                  <div className="text-xl md:text-2xl mb-1 md:mb-2">
                    {badge.text.split(" ")[0]}
                  </div>
                  <div className="text-center">
                    <span className="text-xs md:text-sm font-medium text-gray-700 block">
                      {badge.text.split(" ").slice(1).join(" ")}
                    </span>
                    <span className="text-xs text-gray-500 block mt-1">
                      {badge.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MainEntrega;
