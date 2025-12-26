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
    if (!item) return "/imagenes/no-image.png";

    if (item.imagen_url && item.imagen_url.startsWith("http")) {
      return item.imagen_url;
    }

    if (item.imagen && item.imagen !== "") {
      return `${import.meta.env.VITE_API_URL}/uploads/${item.imagen}`;
    }

    return "/imagenes/no-image.png";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70">
      {/* OVERLAY */}
      <div className="absolute inset-0" onClick={() => setShowCart(false)} />

      {/* DRAWER */}
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-black text-white p-4 overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Tu carrito</h2>
          <button onClick={() => setShowCart(false)}>
            <X />
          </button>
        </div>

        {/* VACÍO */}
        {cart.length === 0 && (
          <p className="text-center text-white/60 mt-10">
            Tu carrito está vacío
          </p>
        )}

        {/* ITEMS */}
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 mb-4 border-b border-white/10 pb-3"
          >
            <img
              src={getImageSrc(item)}
              alt={item.nombre}
              onError={(e) => {
                e.currentTarget.src = "/imagenes/no-image.png";
              }}
              className="w-16 h-16 min-w-16 object-cover rounded-lg bg-white"
            />

            <div className="flex-1">
              <p className="text-sm">{item.nombre}</p>
              <p className="text-pink-400 font-semibold">
                ${item.precio.toLocaleString()}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => decreaseQuantity(item.id)}>
                  <Minus size={14} />
                </button>

                <span>{item.cantidad}</span>

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
              <span className="text-pink-400">
                ${subtotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                setShowCart(false);
                setShowShippingModal(true);
              }}
              className="w-full mt-4 bg-pink-500 py-3 rounded-xl font-semibold hover:bg-pink-600 transition"
            >
              Confirmar pedido
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
