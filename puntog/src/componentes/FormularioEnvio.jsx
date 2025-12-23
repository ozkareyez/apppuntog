import { X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function FormularioEnvio() {
  const { cart, totalFinal, setMostrarFormulario, clearCart } = useCart();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    ciudad: "",
  });

  const enviarPedido = async () => {
    if (!form.nombre || !form.telefono || !form.direccion) {
      alert("Completa todos los campos");
      return;
    }

    /* ======================
       MENSAJE WHATSAPP
    ====================== */
    const mensaje = `
🛍️ *Pedido PuntoG*

👤 Nombre: ${form.nombre}
📞 Teléfono: ${form.telefono}
📍 Dirección: ${form.direccion}
🏙️ Ciudad: ${form.ciudad}

🛒 Productos:
${cart.map((p) => `• ${p.nombre} x${p.quantity}`).join("\n")}

💰 Total: $${totalFinal.toLocaleString()}
`;

    /* ======================
       ENVIAR A WHATSAPP
    ====================== */
    const telefonoNegocio = "57XXXXXXXXXX"; // ← TU NÚMERO REAL
    const url = `https://wa.me/${telefonoNegocio}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank");

    /* ======================
       ENVIAR A BACKEND (BD)
    ====================== */
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: form,
          productos: cart,
          total: totalFinal,
        }),
      });
    } catch (error) {
      console.error("Error guardando pedido", error);
    }

    clearCart();
    setMostrarFormulario(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* FONDO */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setMostrarFormulario(false)}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
        <button
          onClick={() => setMostrarFormulario(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">
          Finalizar pedido
        </h2>

        <div className="space-y-3">
          <input
            placeholder="Nombre completo"
            className="w-full border rounded-lg p-3"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            placeholder="Teléfono"
            className="w-full border rounded-lg p-3"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <input
            placeholder="Dirección"
            className="w-full border rounded-lg p-3"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          <input
            placeholder="Ciudad"
            className="w-full border rounded-lg p-3"
            value={form.ciudad}
            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
          />

          <button
            onClick={enviarPedido}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Enviar pedido por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
