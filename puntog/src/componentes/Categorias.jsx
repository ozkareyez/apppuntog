import { useEffect, useState } from "react";
import { API_URL } from "@/config";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);

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

  return (
    <section className="w-full py-14 px-6 bg-linear-to-br from-black via-[#0f0f0f] to-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        {/* TÍTULO */}
        <h2 className="text-center text-3xl md:text-4xl font-bold text-white mb-10">
          Categorías <span className="text-pink-500">PuntoG</span>
        </h2>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              className="
                group relative bg-white/5 backdrop-blur-lg
                border border-white/10 rounded-2xl p-6 text-center
                shadow-xl transition-all duration-500
                hover:-translate-y-2 hover:shadow-pink-500/30
              "
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {categoria.nombre}
              </h3>

              <button
                className="
                  px-10 py-3 rounded-full text-sm font-semibold
                  bg-linear-to-r from-pink-500 to-purple-600
                  text-white shadow-lg shadow-pink-500/30
                  hover:scale-110 hover:shadow-pink-500/50
                  transition-all duration-300
                "
              >
                Ver más
              </button>

              <span
                className="
                  absolute inset-0 rounded-2xl border
                  border-pink-500/0 group-hover:border-pink-500/40
                  transition-all duration-500
                "
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categorias;
