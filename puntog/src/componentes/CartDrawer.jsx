// src/componentes/CartDrawer.jsx
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";

const CartDrawer = ({
  showCart,
  setShowCart,
  cart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  total,
  setMostrarFormulario,
}) => {
  const handleImgError = (e) => {
    e.target.src = "/imagen/placeholder.png";
  };

  if (!showCart) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-100"
        onClick={() => setShowCart(false)}
      />
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white z-50 shadow-xl">
        <div className="flex justify-between p-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart /> Carrito ({cart.length})
          </h2>
          <button onClick={() => setShowCart(false)}>
            <X />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-160px)]">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((p) => (
              <div key={p.id} className="flex gap-3 bg-gray-100 p-3 rounded-lg">
                <img
                  src={`/imagen/${p.imagen}`}
                  onError={handleImgError}
                  alt={p.nombre}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{p.nombre}</p>
                  <p className="text-pink-500 font-bold">${p.precio}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-2 items-center bg-white px-2 py-1 rounded">
                    <button
                      onClick={() => decreaseQuantity(p.id)}
                      className="hover:text-pink-500"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-semibold">{p.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(p.id)}
                      className="hover:text-pink-500"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(p.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex justify-between mb-3">
              <span className="font-bold">Subtotal:</span>
              <span className="font-bold text-lg">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                setShowCart(false);
                setMostrarFormulario(true);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
            >
              Confirmar Entrega
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
