import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // 🔗 AQUÍ conectas backend después
      // await fetch("/api/contacto", { method: "POST", body: JSON.stringify(form) });

      console.log("Mensaje enviado:", form);

      setSuccess(true);
      setForm({ nombre: "", email: "", mensaje: "" });
    } catch (err) {
      alert("Error enviando el mensaje");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-xl mx-auto px-4 py-14 text-white">
      <h1 className="text-3xl font-bold text-red-500 text-center mb-2">
        Contáctanos
      </h1>

      <p className="text-center text-gray-400 mb-8">
        ¿Tienes preguntas o necesitas ayuda? Escríbenos y te responderemos.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-gray-300/10 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl"
      >
        <input
          type="text"
          placeholder="Nombre completo"
          className="input w-full"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          className="input w-full"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <textarea
          placeholder="Escribe tu mensaje..."
          rows={4}
          className="input w-full resize-none"
          value={form.mensaje}
          onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="
            w-full py-3 rounded-xl font-semibold
            bg-red-600 hover:bg-red-700
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-all
          "
        >
          {loading ? "Enviando..." : "Enviar mensaje"}
        </button>

        {success && (
          <p className="text-green-400 text-center text-sm font-medium">
            ✔ Mensaje enviado correctamente
          </p>
        )}
      </form>
    </section>
  );
}
