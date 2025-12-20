// src/componentes/Categorias.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/categorias`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar categorías");
        return res.json();
      })
      .then((data) => setCategorias(data))
      .catch((err) => {
        console.error("Error:", err);
      });
  }, []);

  const handleCategoriaClick = (slug) => {
    navigate(`/productos?categoria=${slug}`);
  };

  const getImageSrc = (imagen) => {
    if (!imagen) return "/imagenes/no-image.png";
    if (imagen.startsWith("http://"))
      return imagen.replace("http://", "https://");
    if (imagen.startsWith("https://")) return imagen;
    if (imagen.startsWith("imagenes/")) return `/${imagen}`;
    return `/imagenes/${imagen}`;
  };

  return (
    <section className="w-full py-14 px-6 bg-linear-to-br from-black via-[#0f0f0f] to-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Explora por <span className="text-pink-500">Categoría</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Encuentra exactamente lo que buscas
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              onClick={() => handleCategoriaClick(categoria.slug)}
              className="
                group relative bg-white/5 backdrop-blur-lg
                border border-white/10 rounded-2xl p-6 text-center
                shadow-xl transition-all duration-500
                hover:-translate-y-2 hover:shadow-pink-500/30
                hover:border-pink-500/50 cursor-pointer
                overflow-hidden
              "
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/0 group-hover:from-pink-500/10 group-hover:to-transparent transition-all duration-500" />

              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-4 group-hover:text-pink-400 transition-colors">
                  {categoria.nombre}
                </h3>

                <div className="relative overflow-hidden rounded-xl">
                  <img
                    className="w-full h-48 object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
                    src={getImageSrc(categoria.imagen)}
                    alt={categoria.nombre}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver Productos →
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categorias;
