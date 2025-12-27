import { useState } from "react";
import { API_URL } from "@/config";

export default function ContactForm() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  const [loading, setLoading] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.email || !form.mensaje) {
      alert("Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.ok) throw new Error();

      alert("Mensaje enviado correctamente ✅");
      setForm({ nombre: "", email: "", mensaje: "" });
    } catch {
      alert("Error enviando mensaje ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={enviar}
      className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow space-y-4"
    >
      <input
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        className="w-full border rounded-lg px-4 py-2"
      />

      <input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full border rounded-lg px-4 py-2"
      />

      <textarea
        placeholder="Mensaje"
        rows="4"
        value={form.mensaje}
        onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
        className="w-full border rounded-lg px-4 py-2"
      />

      <button
        disabled={loading}
        className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition"
      >
        {loading ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}
