import { ShoppingCart, Tag, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { API_URL } from "@/config";

const Ofertas = ({ addToCart }) => {
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Imagen fallback
  const handleImgError = (e) => {
    e.target.src = "/imagenes/no-image.png";
  };

  useEffect(() => {
    fetch(`${API_URL}/api/productos?es_oferta=true`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar ofertas");
        return res.json();
      })
      .then((data) => {
        setOfertas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-center text-white py-10">Cargando ofertas...</p>;
  }

  if (ofertas.length === 0) return null;

  return (
    <section className="w-full py-14 px-4 bg-gradient-to-br from-black via-[#0f0f0f] to-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        {/* Título */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 rounded-full px-6 py-2 mb-4">
            <Tag className="text-pink-400" size={20} />
            <span className="text-pink-400 font-semibold">
              Ofertas Especiales
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Descuentos <span className="text-pink-500">Increíbles</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {ofertas.map((producto) => {
            // 🔒 NORMALIZACIÓN TOTAL (ANTI toFixed ERROR)
            const precioNum = Number(producto?.precio);
            const precioAntesNum = Number(producto?.precio_antes);

            const precio = isNaN(precioNum) ? 0 : precioNum;
            const precioAntes = isNaN(precioAntesNum) ? precio : precioAntesNum;

            const ahorro = Math.max(precioAntes - precio, 0);

            return (
              <div
                key={producto.id}
                className="group bg-[#1f1f1f] border-2 border-pink-500/30 rounded-2xl overflow-hidden
                transition hover:border-pink-400 hover:shadow-xl hover:shadow-pink-500/40 relative"
              >
                {/* Badge descuento */}
                {producto?.descuento && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white font-bold px-4 py-2 rounded-xl shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform">
                      <p className="text-2xl leading-none">
                        {producto.descuento}%
                      </p>
                      <p className="text-xs">OFF</p>
                    </div>
                  </div>
                )}

                {/* Temporizador */}
                <div className="absolute top-3 right-3 z-10 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock size={12} />
                  <span>Termina pronto</span>
                </div>

                {/* Imagen */}
                <div className="relative w-full h-48 sm:h-64 lg:h-72 overflow-hidden">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    onError={handleImgError}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Info */}
                <div className="p-3 sm:p-5 text-center">
                  <h3 className="text-white text-sm sm:text-base font-semibold line-clamp-2 mb-3">
                    {producto.nombre}
                  </h3>

                  {/* Precios */}
                  <div className="space-y-1 mb-4">
                    {precioAntes > precio && (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-gray-400 line-through">
                          ${precioAntes.toFixed(2)}
                        </span>
                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">
                          -${ahorro.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <p className="text-pink-400 text-2xl sm:text-3xl font-bold">
                      ${precio.toFixed(2)}
                    </p>
                  </div>

                  {/* Botón */}
                  <button
                    onClick={() => addToCart?.(producto)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 
                    text-white font-semibold hover:from-pink-600 hover:to-pink-700 
                    transition shadow-lg hover:shadow-pink-500/50 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    ¡Aprovechar Oferta!
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Ofertas;
