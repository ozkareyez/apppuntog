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
    subtotal,
    domicilio,
    totalFinal,
    clearCart,
  } = useCart();

  if (!showCart) return null;

  const enviarPedido = (datos) => {
    const mensaje = `
🛒 *Nuevo pedido Punto G*

👤 Nombre: ${datos.nombre}
📞 Teléfono: ${datos.telefono}
📧 Email: ${datos.email || "No"}
📍 Dirección: ${datos.direccion}
🏙️ Ciudad: ${datos.ciudad}

🧾 Productos:
${cart
  .map((p) => `- ${p.nombre} x${p.quantity} ($${Number(p.precio).toFixed(0)})`)
  .join("\n")}

💰 Subtotal: $${subtotal}
🚚 Envío: $${domicilio}
🔥 Total: $${totalFinal}
`;

    const urlWhatsapp = `https://wa.me/573147041149?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(urlWhatsapp, "_blank");

    clearCart();
    setMostrarFormulario(false);
    setShowCart(false);
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white z-[9999] shadow-xl flex flex-col">
      <div className="p-4 border-b flex justify-between">
        <h2 className="font-bold">Carrito</h2>
        <button
          onClick={() => {
            setShowCart(false);
            setMostrarFormulario(false);
          }}
        >
          <X />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="text-sm">
            {item.nombre} x {item.quantity}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <p>Total: ${Number(totalFinal || 0).toFixed(0)}</p>

        {!mostrarFormulario ? (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full bg-black text-white py-2 mt-3 rounded"
          >
            Confirmar pedido
          </button>
        ) : (
          <FormularioEnvio onSubmit={enviarPedido} />
        )}
      </div>
    </div>
  );
}
