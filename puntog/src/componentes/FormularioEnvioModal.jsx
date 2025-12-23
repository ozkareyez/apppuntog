import { X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function FormularioEnvioModal() {
  const { cart, totalFinal, setMostrarFormulario, clearCart, setShowCart } =
    useCart();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    ciudad: "",
  });

  const enviarPedido = () => {
    const mensaje = `
🖤 Pedido PuntoG 🖤

Nombre: ${form.nombre}
Teléfono: ${form.telefono}
Dirección: ${form.direccion}
Ciudad: ${form.ciudad}

Productos:
${cart.map((p) => `- ${p.nombre} x${p.quantity}`).join("\n")}

Total: $${totalFinal}
`;

    const url = `https://wa.me/57TU_NUMERO?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");

    clearCart();
    setMostrarFormulario(false);
    setShowCart(false);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* FONDO */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={() => setMostrarFormulario(false)}
      />

      {/* MODAL */}
      <div className="relative bg-[#0f0f0f] text-white w-full max-w-md rounded-xl shadow-2xl p-6">
        <button
          className="absolute top-4 right-4"
          onClick={() => setMostrarFormulario(false)}
        >
          <X />
        </button>

        <h3 className="text-xl font-semibold mb-4 text-center">
          Finalizar pedido
        </h3>

        <div className="space-y-3">
          <input
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <input
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2"
            placeholder="Dirección"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          <input
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2"
            placeholder="Ciudad"
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
          />

          <button
            onClick={enviarPedido}
            className="w-full mt-4 py-2 rounded bg-green-600 hover:bg-green-700 transition"
          >
            Enviar pedido por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
