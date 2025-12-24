import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function ContactForm() {
  const { subtotal = 0, envio = 0, totalFinal = 0 } = useCart();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Mensaje enviado:", form);
    alert("Mensaje enviado correctamente 🖤");

    setForm({
      nombre: "",
      email: "",
      mensaje: "",
    });
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold text-pink-400 mb-6 text-center">
        Contáctanos
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white/5 p-6 rounded-xl"
      >
        <input
          type="text"
          placeholder="Nombre"
          className="w-full p-3 rounded bg-black border border-white/10"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full p-3 rounded bg-black border border-white/10"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <textarea
          placeholder="Mensaje"
          rows={4}
          className="w-full p-3 rounded bg-black border border-white/10"
          value={form.mensaje}
          onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
          required
        />

        <button
          type="submit"
          className="w-full bg-pink-500 hover:bg-pink-600 transition py-3 rounded font-semibold"
        >
          Enviar mensaje
        </button>
      </form>
    </div>
  );
}
