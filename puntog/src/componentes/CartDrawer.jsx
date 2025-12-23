import { X, Plus, Minus, Trash } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import FormularioEnvioModal from "./FormularioEnvioModal";

export default function CartDrawer() {
  const {
    cart,
    showCart,
    setShowCart,
    subtotal,
    envio,
    totalFinal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const [openForm, setOpenForm] = useState(false);

  if (!showCart) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={() => {
          setShowCart(false);
          setOpenForm(false);
        }}
      />

      {/* DRAWER */}
      <aside className="fixed top-0 right-0 w-full max-w-md h-full bg-black text-white z-50 shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-pink-400">
            Carrito de compras
          </h2>
          <button onClick={() => setShowCart(false)}>
            <X />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 && (
            <p className="text-white/60 text-center">Tu carrito está vacío</p>
          )}

          {cart.map((item) => (
            <div key={item.id} className="flex gap-3 bg-white/5 rounded-xl p-3">
              {/* IMAGEN */}
              <img
                src={item.imagen || "/imagenes/no-image.png"}
                alt={item.nombre}
                className="w-16 h-16 object-cover rounded-lg"
              />

              {/* INFO */}
              <div className="flex-1">
                <p className="font-medium text-sm">{item.nombre}</p>
                <p className="text-pink-400 text-sm">
                  ${Number(item.precio || 0).toLocaleString()}
                </p>

                {/* CONTROLES */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="p-1 bg-white/10 rounded"
                  >
                    <Minus size={14} />
                  </button>

                  <span>{item.cantidad}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="p-1 bg-white/10 rounded"
                  >
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

        {/* FOOTER */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${Number(subtotal || 0).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Envío</span>
              <span>
                {envio === 0 ? "Gratis" : `$${envio.toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between font-semibold text-lg text-pink-400">
              <span>Total</span>
              <span>${Number(totalFinal || 0).toLocaleString()}</span>
            </div>

            <button
              onClick={() => setOpenForm(true)}
              className="w-full mt-3 bg-pink-500 hover:bg-pink-600 transition py-3 rounded-xl font-semibold"
            >
              Confirmar pedido
            </button>
          </div>
        )}
      </aside>

      {/* MODAL FORMULARIO */}
      {openForm && <FormularioEnvioModal onClose={() => setOpenForm(false)} />}
    </>
  );
}
