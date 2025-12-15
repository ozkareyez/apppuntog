import { FaShippingFast } from "react-icons/fa";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { BsFillBox2HeartFill, BsCashCoin } from "react-icons/bs";

const MainEntrega = () => {
  const items = [
    {
      icon: <FaShippingFast size={40} />,
      text: "Envíos gratis a todo Colombia por compras mayores a $200.000",
    },
    {
      icon: <BsCashCoin size={36} />,
      text: "Pagos contraentrega y transferencias seguras",
    },
    {
      icon: <AiOutlineSafetyCertificate size={36} />,
      text: "Entrega certificada y seguimiento del pedido",
    },
    {
      icon: <BsFillBox2HeartFill size={36} />,
      text: "Discreción total en la entrega de tus paquetes",
    },
  ];

  return (
    <section className="w-full py-14 px-6 bg-gradient-to-br from-black via-[#1a001f] to-[#2b002e]">
      <div className="max-w-7xl mx-auto">
        {/* Título */}
        <h2 className="text-center text-3xl md:text-4xl font-bold text-pink-400 mb-10">
          Beneficios PuntoG
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <div
              key={index}
              className="group relative rounded-2xl p-6 
              bg-white/5 backdrop-blur-md 
              border border-white/10 
              shadow-lg shadow-black/40
              hover:border-pink-400/60 
              hover:shadow-pink-500/20
              transition-all duration-300"
            >
              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl bg-pink-500/10 opacity-0 group-hover:opacity-100 blur-xl transition"></div>

              {/* Contenido */}
              <div className="relative z-10 flex flex-col items-center text-center gap-4">
                <div className="text-pink-400 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>

                <p className="text-sm text-gray-200 leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MainEntrega;
