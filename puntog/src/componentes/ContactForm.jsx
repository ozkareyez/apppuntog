import { useState } from "react";
import API_URL from "../config";
import { motion } from "framer-motion";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/contacto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("✨ Mensaje enviado correctamente");
        setFormData({ nombre: "", email: "", mensaje: "" });
      } else {
        alert("❌ Error al enviar el mensaje");
      }
    } catch (error) {
      console.error(error);
      alert("❌ No se pudo enviar el mensaje");
    }
  };

  return (
    <section className="w-full py-20 px-4 bg-gradient-to-br from-black via-[#0f0f0f] to-[#1a1a1a]">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-xl mx-auto bg-black/80 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        {/* Título */}
        <h2 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Contáctanos
        </h2>

        <p className="text-center text-gray-400 mb-8">
          Estamos listos para atenderte con total discreción ✨
        </p>

        {/* Nombre */}
        <div className="mb-5">
          <label className="block text-sm text-gray-400 mb-1">
            Nombre completo
          </label>
          <input
            type="text"
            placeholder="Tu nombre"
            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
          />
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-sm text-gray-400 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            placeholder="correo@email.com"
            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        {/* Mensaje */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-1">Mensaje</label>
          <textarea
            rows="4"
            placeholder="Escribe tu mensaje..."
            className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition resize-none"
            value={formData.mensaje}
            onChange={(e) =>
              setFormData({ ...formData, mensaje: e.target.value })
            }
            required
          />
        </div>

        {/* Botón */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full py-3 rounded-full font-bold text-lg text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg hover:shadow-pink-500/40 transition-all"
        >
          Enviar Mensaje 💌
        </motion.button>
      </motion.form>
    </section>
  );
};

export default ContactForm;
