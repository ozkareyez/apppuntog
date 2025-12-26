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
    if (
      !form.nombre ||
      !form.telefono ||
      !form.direccion ||
      !form.departamento ||
      !form.ciudad
    ) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    setLoading(true);

    try {
      // 🔥 ENVIAR FORMATO CORRECTO AL BACKEND
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/enviar-formulario`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: form.nombre,
            email: form.email,
            telefono: form.telefono,
            direccion: form.direccion,
            departamento: form.departamento, // ID
            ciudad: form.ciudad, // ID
            carrito: cart.map((p) => ({
              id: p.id,
              nombre: p.nombre,
              precio: p.precio,
              quantity: p.cantidad,
            })),
          }),
        }
      );

      const data = await res.json();
      if (!data.ok) throw new Error();
    } catch (err) {
      alert("Error enviando pedido");
      setLoading(false);
      return;
    }

    // ✅ WHATSAPP
    const total = cart.reduce((s, i) => s + i.precio * i.cantidad, 0);

    const mensaje = `
🖤 Pedido Punto G 🖤
👤 ${form.nombre}
📞 ${form.telefono}
📍 ${form.direccion}

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
      <input
        name="nombre"
        placeholder="Nombre"
        onChange={handleChange}
        className="input"
      />
      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="input"
      />
      <input
        name="telefono"
        placeholder="Teléfono"
        onChange={handleChange}
        className="input"
      />
      <input
        name="direccion"
        placeholder="Dirección"
        onChange={handleChange}
        className="input"
      />
      <input
        name="departamento"
        placeholder="Departamento ID"
        onChange={handleChange}
        className="input"
      />
      <input
        name="ciudad"
        placeholder="Ciudad ID"
        onChange={handleChange}
        className="input"
      />

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
