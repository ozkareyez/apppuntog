import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../componentes/Navbar/header/Header";
import Foter from "../componentes/Foter";

import { API_URL } from "@/config";

export default function ProductosPorCategoria() {
  const { categoria } = useParams();
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/productos?categoria=${categoria}`)
      .then((res) => res.json())
      .then(setProductos);
  }, [categoria]);

  return (
    <div className="min-h-screen bg-[#22222280] flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto p-4">
        <h1 className="text-3xl text-pink-400 text-center mb-6 capitalize">
          {categoria}
        </h1>

        {/* 2 cards en móvil */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {productos.map((p) => (
            <div key={p.id} className="bg-[#1f1f1f] rounded-xl overflow-hidden">
              <img src={p.imagen} className="h-48 w-full object-cover" />
              <div className="p-3 text-center">
                <h3 className="text-white text-sm">{p.nombre}</h3>
                <p className="text-pink-400 font-bold">${p.precio}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
