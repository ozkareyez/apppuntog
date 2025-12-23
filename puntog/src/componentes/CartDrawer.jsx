import { X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import FormularioEnvio from "./FormularioEnvio";

export default function CartDrawer() {
  const {
    cart,
    showCart,
    setShowCart,
    mostrarFormulario,
    setMostrarFormulario,
    totalFinal,
  } = useCart();

  if (!showCart) return null;

  return (
    <>
      {/* FORMULARIO MODAL */}
      {mostrarFormulario && <FormularioEnvio />}

      {/* DRAWER */}
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* FONDO */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => {
            setShowCart(false);
            setMostrarFormulario(false);
          }}
        />

        {/* PANEL */}
        <div className="relative w-80 h-full bg-white shadow-2xl p-4 overflow-y-auto">
          <button
            className="absolute top-3 right-3"
            onClick={() => {
              setShowCart(false);
              setMostrarFormulario(false);
            }}
          >
            <X />
          </button>

          <h2 className="text-xl font-bold mb-4">Carrito</h2>

          {cart.length === 0 && <p>Carrito vacío</p>}

          {cart.map((item) => (
            <div key={item.id} className="flex justify-between my-2">
              <span>{item.nombre}</span>
              <span>
                {item.quantity} x ${item.precio}
              </span>
            </div>
          ))}

          <p className="font-bold mt-4">
            Total: ${totalFinal.toLocaleString()}
          </p>

          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full mt-4 bg-black text-white py-2 rounded hover:bg-gray-900 transition"
            disabled={cart.length === 0}
          >
            Confirmar pedido
          </button>
        </div>
      </div>
    </>
  );
}
