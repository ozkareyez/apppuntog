import { X, Plus, Minus, Trash } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import EnvioModal from "./EnvioModal";

export default function CartDrawer() {
  const {
    cart,
    showCart,
    setShowCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    subtotal,
    envio,
    totalFinal,
  } = useCart();

  const [mostrarEnvio, setMostrarEnvio] = useState(false);

  if (!showCart) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur z-[90]"
        onClick={() => setShowCart(false)}
      />

      {/* DRAWER */}
      <aside className="fixed top-0 right-0 h-full w-[360px] bg-black text-white z-[100] shadow-2xl border-l border-pink-500/30 flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-pink-400">Tu carrito</h2>

          <button onClick={() => setShowCart(false)}>
            <X className="text-white hover:text-pink-400" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 && (
            <p className="text-gray-400 text-center">Tu carrito está vacío</p>
          )}

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-white/10 pb-3"
            >
              <div>
                <p className="font-medium">{item.nombre}</p>
                <p className="text-sm text-gray-400">
                  ${Number(item.precio).toLocaleString()}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="p-1 border border-white/20 rounded"
                  >
                    <Minus size={14} />
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="p-1 border border-white/20 rounded"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-400 hover:text-red-500"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Envío</span>
              <span>
                {envio === 0 ? "Gratis" : `$${envio.toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${totalFinal.toLocaleString()}</span>
            </div>

            <button
              onClick={() => setMostrarEnvio(true)}
              className="w-full mt-3 bg-pink-600 hover:bg-pink-700 py-2 rounded-lg font-semibold transition"
            >
              Confirmar pedido
            </button>
          </div>
        )}
      </aside>

      {/* MODAL ENVÍO */}
      {mostrarEnvio && <EnvioModal cerrar={() => setMostrarEnvio(false)} />}
    </>
  );
}
