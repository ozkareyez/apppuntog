import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function FormularioEnvio() {
  const { cart, total } = useCart();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    ciudad: "",
  });

  const enviarPedido = () => {
    const mensaje = `
Pedido PuntoG 🖤

Nombre: ${form.nombre}
Teléfono: ${form.telefono}
Dirección: ${form.direccion}
Ciudad: ${form.ciudad}

Productos:
${cart.map((p) => `- ${p.nombre} x${p.cantidad}`).join("\n")}

Total: $${total}
`;

    const url = `https://wa.me/57TU_NUMERO?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
  };

  return (
    <div className="mt-4 space-y-2">
      <input
        placeholder="Nombre completo"
        className="w-full border p-2"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      />

      <input
        placeholder="Teléfono"
        className="w-full border p-2"
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
      />

      <input
        placeholder="Dirección"
        className="w-full border p-2"
        value={form.direccion}
        onChange={(e) => setForm({ ...form, direccion: e.target.value })}
      />

      <input
        placeholder="Ciudad"
        className="w-full border p-2"
        value={form.ciudad}
        onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
      />

      <button
        onClick={enviarPedido}
        className="w-full bg-green-600 text-white py-2 rounded mt-2"
      >
        Enviar pedido por WhatsApp
      </button>
    </div>
  );
}
