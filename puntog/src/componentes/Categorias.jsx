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
    <section className="w-full py-14 px-6 bg-gradient-to-br from-black via-[#0f0f0f] to-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-white mb-10">
          Categorías <span className="text-pink-500">PuntoG</span>
        </h2>

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

              <img
                className="w-full h-48 object-cover rounded-xl"
                src={categoria.imagen}
                alt={categoria.nombre}
                onError={(e) => {
                  e.target.src = "/imagen/placeholder.png"; // imagen de respaldo
                  console.error(`Error cargando: ${categoria.imagen}`);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categorias;
