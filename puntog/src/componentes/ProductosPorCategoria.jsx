import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { API_URL } from "@/config";
import Header from "./Header";

export default function ProductosPorCategoria() {
  const { id } = useParams();
  const [productos, setProductos] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/productos?categoria=${id}`)
      .then((res) => res.json())
      .then(setProductos)
      .catch(console.error);
  }, [id]);

  const addToCart = (producto) => {
    const existing = cart.find((p) => p.id === producto.id);
    if (existing) {
      setCart(
        cart.map((p) =>
          p.id === producto.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setCart([...cart, { ...producto, quantity: 1 }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#22222280]">
      <Header totalItems={cart.reduce((s, i) => s + i.quantity, 0)} />

      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl text-pink-400 text-center mb-6">Productos</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((p) => (
            <div
              key={p.id}
              className="bg-[#1f1f1f] rounded-2xl overflow-hidden border border-white/10"
            >
              <img
                src={p.imagen}
                alt={p.nombre}
                className="w-full h-48 object-cover"
              />

              <div className="p-4 text-center">
                <h3 className="text-white">{p.nombre}</h3>
                <p className="text-pink-400 text-xl font-bold">${p.precio}</p>

                <button
                  onClick={() => addToCart(p)}
                  className="
                    mt-3 w-full py-2 rounded-xl
                    bg-white text-black font-semibold
                    hover:bg-pink-500 hover:text-white transition
                    flex items-center justify-center gap-2
                  "
                >
                  <ShoppingCart size={18} />
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
