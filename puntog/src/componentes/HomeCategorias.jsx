import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config";

export default function HomeCategorias() {
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/categorias`)
      .then((res) => res.json())
      .then(setCategorias)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#22222280] p-6">
      <h1 className="text-4xl text-center text-pink-400 mb-10 font-semibold">
        Explora nuestras categorías
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            onClick={() => navigate(`/categoria/${cat.id}`)}
            className="
              cursor-pointer
              bg-[#1f1f1f]
              border border-white/10
              rounded-2xl
              p-8
              text-center
              transition
              hover:border-pink-500
              hover:shadow-lg hover:shadow-pink-500/20
            "
          >
            <h2 className="text-white text-xl font-semibold">{cat.nombre}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
