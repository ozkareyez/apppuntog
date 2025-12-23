import { X, Plus, Minus, Trash } from "lucide-react";
import { useCart } from "@/context/CartContext";
import FormularioEnvio from "./FormularioEnvio";

export default function CartDrawer() {
  const {
    cart,
    showCart,
    setShowCart,
    mostrarFormulario,
    setMostrarFormulario,
    subtotal,
    domicilio,
    totalFinal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!showCart) return null;

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-xl z-[9999] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-bold">Carrito</h2>
        <button
          onClick={() => {
            setShowCart(false);
            setMostrarFormulario(false);
          }}
        >
          <X />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.length === 0 && (
          <p className="text-center text-gray-500">Carrito vacío</p>
        )}

        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b pb-2"
          >
            <div>
              <p className="font-medium">{item.nombre}</p>
              <p className="text-sm text-gray-500">
                ${Number(item.precio || 0).toFixed(0)} x {item.quantity}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => item.quantity > 1 && decreaseQuantity(item.id)}
              >
                <Minus size={16} />
              </button>

              <span>{item.quantity}</span>

              <button onClick={() => increaseQuantity(item.id)}>
                <Plus size={16} />
              </button>

              <button onClick={() => removeFromCart(item.id)}>
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t space-y-2">
        <p>Subtotal: ${Number(subtotal || 0).toFixed(0)}</p>
        <p>Domicilio: ${Number(domicilio || 0).toFixed(0)}</p>

        <p className="font-bold text-lg">
          Total: ${Number(totalFinal || 0).toFixed(0)}
        </p>

        {!mostrarFormulario ? (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full bg-black text-white py-2 rounded mt-3"
          >
            Confirmar pedido
          </button>
        ) : (
          <FormularioEnvio
            onSubmit={(datos) => {
              console.log("Pedido confirmado:", {
                datos,
                cart,
                totalFinal,
              });

              alert("Pedido confirmado correctamente");
              clearCart();
              setMostrarFormulario(false);
              setShowCart(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
