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
    setShowShippingModal,
  } = useCart();

  if (!showCart) return null;

  const getImageSrc = (img) => {
    if (!img) return "/imagenes/no-image.png";
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_API_URL}/uploads/${img}`;
  };

  return (
    <AnimatePresence>
      {/* OVERLAY */}
      <motion.div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={() => setShowCart(false)}
      />

      {/* DRAWER */}
      <motion.aside
        className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-black z-50 p-6 overflow-y-auto"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
      >
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h2 className="text-pink-400 font-bold text-xl">Tu carrito</h2>
          <button onClick={() => setShowCart(false)}>
            <X />
          </button>
        </div>

        {cart.length === 0 && (
          <p className="text-white/60 text-center mt-20">
            Tu carrito está vacío
          </p>
        )}

        {/* ITEMS */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white/5 p-3 rounded-xl">
              {/* MINIATURA */}
              <img
                src={getImageSrc(item.imagen)}
                alt={item.nombre}
                className="w-20 h-20 object-cover rounded-lg border border-white/10"
              />

              <div className="flex-1">
                <h3 className="text-white text-sm font-semibold">
                  {item.nombre}
                </h3>

                <p className="text-pink-400 text-sm">
                  ${Number(item.precio).toLocaleString()}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => decreaseQuantity(item.id)}>
                    <Minus size={14} />
                  </button>

                  <span className="text-white">{item.cantidad}</span>

                  <button onClick={() => increaseQuantity(item.id)}>
                    <Plus size={14} />
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-auto text-red-400"
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
          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="flex justify-between text-sm text-white">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm text-white">
              <span>Envío</span>
              <span>{envio === 0 ? "Gratis" : `$${envio}`}</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-pink-400">
              <span>Total</span>
              <span>${totalFinal.toLocaleString()}</span>
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
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}
