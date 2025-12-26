import { X, Plus, Minus, Trash } from "lucide-react";
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
    setShowShippingModal,
  } = useCart();

  if (!showCart) return null;

  const getImageSrc = (item) => {
    if (item.imagen?.startsWith("http")) return item.imagen;
    if (item.imagen)
      return `${import.meta.env.VITE_API_URL}/uploads/${item.imagen}`;
    if (item.imagen_url) return item.imagen_url;
    return "/imagenes/no-image.png";
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setShowCart(false)}
      />

      {/* DRAWER */}
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0f0f0f] text-white shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold tracking-wide">🛒 Tu carrito</h2>
          <button
            onClick={() => setShowCart(false)}
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 && (
            <p className="text-center text-white/50 mt-20">
              Tu carrito está vacío
            </p>
          )}

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-white/5 rounded-xl p-3 border border-white/10"
            >
              <img
                src={getImageSrc(item)}
                alt={item.nombre}
                className="w-20 h-20 object-cover rounded-lg"
              />

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium leading-tight">
                    {item.nombre}
                  </p>
                  <p className="text-pink-400 font-semibold mt-1">
                    ${item.precio.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center bg-black/40 rounded-lg">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="px-2 py-1 hover:text-pink-400 transition"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="px-2 text-sm">{item.cantidad}</span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="px-2 py-1 hover:text-pink-400 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-auto text-red-500 hover:text-red-400 transition"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/70">Subtotal</span>
              <span className="text-lg font-bold text-pink-400">
                ${subtotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                setShowCart(false);
                setShowShippingModal(true);
              }}
              className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-600 py-3 rounded-xl font-semibold text-white hover:opacity-90 transition shadow-lg"
            >
              Finalizar compra
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
