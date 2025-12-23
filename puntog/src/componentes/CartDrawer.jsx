import { X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import FormularioEnvio from "./FormularioEnvio";

export default function CartDrawer() {
  const { cart, showCart, setShowCart, total } = useCart();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  if (!showCart) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* FONDO OSCURO */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          setShowCart(false);
          setMostrarFormulario(false);
        }}
      />

      {/* DRAWER */}
      <div className="relative w-80 h-full bg-white shadow-lg p-4 overflow-y-auto">
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

        {!mostrarFormulario &&
          cart.map((item) => (
            <div key={item.id} className="flex justify-between my-2">
              <span>{item.nombre}</span>
              <span>
                {item.cantidad} x ${item.precio}
              </span>
            </div>
          ))}

        <p className="font-bold mt-4">Total: ${total}</p>

        {!mostrarFormulario ? (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full mt-4 bg-black text-white py-2 rounded"
          >
            Confirmar pedido
          </button>
        ) : (
          <FormularioEnvio />
        )}
      </div>
    </div>
  );
}
