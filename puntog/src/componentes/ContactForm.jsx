import { useState } from "react";
import { API_URL } from "@/config";

export default function ContactForm() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.email || !form.mensaje) {
      alert("Completa todos los campos");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/contacto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.ok) throw new Error();

      setEnviado(true);
      setForm({ nombre: "", email: "", mensaje: "" });
    } catch (error) {
      alert("Error enviando el mensaje");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Contáctanos</h2>
      <p className="text-gray-500 mb-6">
        Déjanos tu mensaje y te responderemos pronto
      </p>

      {enviado && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm">
          ✅ Mensaje enviado correctamente
        </div>
      )}

      <form onSubmit={enviarFormulario} className="space-y-4">
        <Input
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />

        <Textarea
          label="Mensaje"
          name="mensaje"
          value={form.mensaje}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Enviar mensaje"}
        </button>
      </form>
    </div>
  );
}

/* ================= COMPONENTES UI ================= */

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      rows="4"
      {...props}
      className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
    />
  </div>
);
