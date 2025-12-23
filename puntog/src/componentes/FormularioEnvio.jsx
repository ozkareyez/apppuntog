import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function FormularioEnvio({ onClose }) {
  const { cart, clearCart } = useCart();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    departamento: "",
    ciudad: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const enviarPedido = async () => {
    if (!form.nombre || !form.telefono || !form.direccion || !form.ciudad) {
      alert("Completa todos los campos");
      return;
    }

    if (!cart.length) {
      alert("Carrito vacío");
      return;
    }

    setLoading(true);

    /* ===============================
       1️⃣ GUARDAR EN LA BD (TU API)
    =============================== */
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/enviar-formulario`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
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
      if (!res.ok) throw new Error(data.error);
    } catch (err) {
      console.error(err);
      alert("❌ Error guardando el pedido");
      setLoading(false);
      return;
    }

    /* ===============================
       2️⃣ WHATSAPP
    =============================== */
    const total = cart.reduce((s, i) => s + i.precio * i.cantidad, 0);

    const mensaje = `
🖤 *Pedido Punto G*

👤 ${form.nombre}
📞 ${form.telefono}

📍 ${form.direccion}
${form.ciudad}

🛒 Productos:
${cart.map((p) => `• ${p.nombre} x${p.cantidad}`).join("\n")}

💰 Total: $${total.toLocaleString()}
`;

    const phone = "573147041149"; // 👈 TU NÚMERO REAL
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");

    /* ===============================
       3️⃣ LIMPIAR
    =============================== */
    clearCart();
    onClose();
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <input name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
      <input name="direccion" placeholder="Dirección" onChange={handleChange} />
      <input
        name="departamento"
        placeholder="Departamento (ID)"
        onChange={handleChange}
      />
      <input name="ciudad" placeholder="Ciudad (ID)" onChange={handleChange} />

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
