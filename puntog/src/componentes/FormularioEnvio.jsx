import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function FormularioEnvio({ onClose }) {
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    departamento: "",
    ciudad: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const enviarPedido = async () => {
    if (!form.nombre || !form.telefono || !form.direccion || !form.ciudad) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    setLoading(true);

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/enviar-formulario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, cart }),
      });
    } catch {
      alert("Error enviando pedido");
      setLoading(false);
      return;
    }

    const total = cart.reduce((s, i) => s + i.precio * i.cantidad, 0);

    const mensaje = `
🖤 Pedido Punto G
👤 ${form.nombre}
📞 ${form.telefono}
📍 ${form.direccion}, ${form.ciudad}

${cart.map((p) => `• ${p.nombre} x${p.cantidad}`).join("\n")}

💰 Total: $${total.toLocaleString()}
`;

    window.open(
      `https://wa.me/573147041149?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );

    clearCart();
    onClose();
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {Object.keys(form).map((k) => (
        <input
          key={k}
          name={k}
          placeholder={k}
          onChange={handleChange}
          className="w-full p-2 rounded bg-white/10 text-white"
        />
      ))}

      <button
        onClick={enviarPedido}
        disabled={loading}
        className="w-full bg-green-600 py-3 rounded-xl text-white"
      >
        {loading ? "Enviando..." : "Confirmar pedido"}
      </button>
    </div>
  );
}
