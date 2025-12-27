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
    <section className="py-16 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100">
        {/* HEADER */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Contáctanos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Déjanos tu mensaje y te responderemos lo antes posible
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={enviar} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje
            </label>
            <textarea
              rows="4"
              placeholder="Escribe tu mensaje aquí..."
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      </div>
    </section>
  );
}
