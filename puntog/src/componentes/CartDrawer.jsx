import { X, Minus, Plus, Trash } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import FormularioEnvio from "./FormularioEnvio";

export default function CartDrawer() {
  const {
    cart,
    showCart,
    setShowCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    totalFinal,
  } = useCart();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  if (!showCart) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          setShowCart(false);
          setMostrarFormulario(false);
        }}
      />

      {/* DRAWER */}
      <div className="relative w-[380px] h-full bg-black text-white p-5 overflow-y-auto border-l border-pink-500/30">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">🛒 Tu carrito</h2>
          <button onClick={() => setShowCart(false)}>
            <X />
          </button>
        </div>

        {/* CONTENIDO */}
        {cart.length === 0 && (
          <p className="text-gray-400 text-sm">Carrito vacío</p>
        )}

        {!mostrarFormulario &&
          cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between mb-3 border-b border-white/10 pb-2"
            >
              <div>
                <p className="text-sm font-medium">{item.nombre}</p>
                <p className="text-pink-400 font-semibold">
                  ${Number(item.precio).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => decreaseQuantity(item.id)}>
                  <Minus size={16} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => increaseQuantity(item.id)}>
                  <Plus size={16} />
                </button>
                <button onClick={() => removeFromCart(item.id)}>
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}

        {/* TOTAL */}
        {!mostrarFormulario && cart.length > 0 && (
          <>
            <div className="mt-4 text-lg font-bold">
              Total: ${totalFinal.toLocaleString()}
            </div>

            <button
              className="w-full mt-4 bg-pink-600 hover:bg-pink-700 py-2 rounded-lg font-semibold transition"
              onClick={() => setMostrarFormulario(true)}
            >
              Confirmar pedido
            </button>
          </>
        )}

        {/* FORMULARIO */}
        {mostrarFormulario && (
          <FormularioEnvio cerrar={() => setMostrarFormulario(false)} />
        )}
      </div>
    </div>
  );
}
