import { X, Plus, Minus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { API_URL } from "@/config";

export default function CartDrawer() {
  const {
    cart,
    showCart,
    setShowCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    subtotal,
    setShowShippingModal,
  } = useCart();

  const [departamentos, setDepartamentos] = useState([]);

  /* ================== FETCH SOLO UNA VEZ ================== */
  useEffect(() => {
    if (!showCart) return; // ⬅️ solo cuando se abre el carrito

    fetch(`${API_URL}/departamentos`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDepartamentos(data);
        }
      })
      .catch(console.error);
  }, [showCart]); // ⬅️ DEPENDENCIA CLAVE

  /* ================== GUARDIA ================== */
  if (!showCart) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-end">
      <div className="w-full max-w-md bg-black text-white p-4 overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tu carrito</h2>
          <button onClick={() => setShowCart(false)}>
            <X />
          </button>
        </div>

        {/* CARRITO VACÍO */}
        {cart.length === 0 && (
          <p className="text-center text-gray-400">Tu carrito está vacío</p>
        )}

        {/* ITEMS */}
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 mb-4 border-b border-white/10 pb-3"
          >
            <img
              src={item.imagen}
              alt={item.nombre}
              className="w-16 h-16 object-cover rounded"
            />

            <div className="flex-1">
              <p className="text-sm">{item.nombre}</p>
              <p className="text-pink-400 font-semibold">${item.precio}</p>

              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => decreaseQuantity(item.id)}>
                  <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => increaseQuantity(item.id)}>
                  <Plus size={14} />
                </button>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-auto text-red-500"
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* TOTAL */}
        {cart.length > 0 && (
          <>
            <div className="flex justify-between mt-4 text-lg">
              <span>Total</span>
              <span className="text-pink-400">${subtotal}</span>
            </div>

            <button
              onClick={() => {
                setShowCart(false);
                setShowShippingModal(true);
              }}
              className="w-full mt-4 bg-pink-500 py-3 rounded-xl font-semibold"
            >
              Confirmar pedido
            </button>
          </>
        )}
      </div>
    </div>
  );
}
