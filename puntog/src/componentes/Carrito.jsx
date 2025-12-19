import { X, Plus, Minus, Trash } from "lucide-react";
import { useCart } from "@/context/CartContext";

const Carrito = () => {
  const {
    cart,
    showCart,
    setShowCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    total,
    setMostrarFormulario,
  } = useCart();

  if (!showCart) return null;

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={() => setShowCart(false)}
      />

      {/* Panel carrito */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">🛒 Tu Carrito</h2>
          <button onClick={() => setShowCart(false)}>
            <X />
          </button>
        </div>

        {/* Productos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 && (
            <p className="text-center text-gray-500">El carrito está vacío</p>
          )}

          {cart.map((p) => (
            <div
              key={p.id}
              className="flex gap-3 items-center border rounded-lg p-2"
            >
              <img
                src={`/imagenes/${p.imagen}`}
                alt={p.nombre}
                className="w-16 h-16 object-cover rounded"
              />

              <div className="flex-1">
                <p className="font-semibold">{p.nombre}</p>
                <p className="text-sm text-gray-500">
                  ${Number(p.precio).toFixed(2)}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => decreaseQuantity(p.id)}>
                    <Minus size={16} />
                  </button>
                  <span>{p.quantity}</span>
                  <button onClick={() => increaseQuantity(p.id)}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button onClick={() => removeFromCart(p.id)}>
                <Trash size={18} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between font-bold mb-4">
              <span>Total:</span>
              <span className="text-pink-500">${total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => {
                setShowCart(false);
                setMostrarFormulario(true);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold"
            >
              Confirmar Entrega 🚚
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Carrito;
