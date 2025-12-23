import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function FormularioEnvio({ cerrar }) {
  const { cart, totalFinal, clearCart } = useCart();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    ciudad: "",
  });

  const enviarPedido = () => {
    const mensaje = `
🖤 Pedido Punto G

Nombre: ${form.nombre}
Teléfono: ${form.telefono}
Dirección: ${form.direccion}
Ciudad: ${form.ciudad}

Productos:
${cart.map((p) => `• ${p.nombre} x${p.quantity}`).join("\n")}

Total: $${totalFinal.toLocaleString()}
`;

    const url = `https://wa.me/573147041149?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank");
    clearCart();
    cerrar();
  };

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-pink-400 font-semibold mb-2">Datos de entrega</h3>

      {["nombre", "telefono", "direccion", "ciudad"].map((campo) => (
        <input
          key={campo}
          placeholder={campo.toUpperCase()}
          className="w-full bg-black border border-white/20 p-2 rounded text-white"
          value={form[campo]}
          onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
        />
      ))}

      <button
        onClick={enviarPedido}
        className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-semibold mt-3"
      >
        Enviar pedido por WhatsApp
      </button>

      <button onClick={cerrar} className="w-full text-sm text-gray-400 mt-2">
        ← Volver al carrito
      </button>
    </div>
  );
}
