import { X, Plus, Minus, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

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

  // 🔒 SI NO ESTÁ ABIERTO → NO RENDERIZA NADA
  if (!showCart) return null;

  return (
    <AnimatePresence>
      {/* OVERLAY */}
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowCart(false)}
      />

      {/* DRAWER */}
      <motion.aside
        className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-black z-50 shadow-2xl p-6 overflow-y-auto"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 90 }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-pink-400">Tu carrito</h2>
          <button
            onClick={() => setShowCart(false)}
            className="text-white hover:text-pink-400"
          >
            <X size={26} />
          </button>
        </div>

        {/* CARRITO VACÍO */}
        {cart.length === 0 && (
          <p className="text-white/60 text-center mt-20">
            Tu carrito está vacío
          </p>
        )}

        {/* ITEMS */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white/5 p-3 rounded-xl">
              {/* IMAGEN */}
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-20 h-20 object-cover rounded-lg"
              />

              {/* INFO */}
              <div className="flex-1">
                <h3 className="text-white text-sm font-semibold">
                  {item.nombre}
                </h3>

                <p className="text-pink-400 text-sm">
                  ${Number(item.precio).toLocaleString()}
                </p>

                {/* CONTROLES */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="p-1 bg-white/10 rounded"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="text-white text-sm">{item.cantidad}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="p-1 bg-white/10 rounded"
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-auto text-red-400 hover:text-red-500"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TOTALES */}
        {cart.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-4 space-y-2 text-white">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${Number(subtotal).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Envío</span>
              <span>
                {envio === 0 ? "Gratis" : `$${envio.toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between font-bold text-pink-400 text-lg">
              <span>Total</span>
              <span>${Number(totalFinal).toLocaleString()}</span>
            </div>

            <button className="w-full mt-4 bg-pink-500 hover:bg-pink-600 transition py-3 rounded-xl font-semibold">
              Confirmar pedido
            </button>
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}
