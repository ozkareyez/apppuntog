import { useState } from "react";
import API_URL from "../config";

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("📨 Respuesta del servidor:", data);

      if (res.ok) {
        alert("Mensaje enviado correctamente ✔");
        setFormData({ nombre: "", email: "", mensaje: "" });
      } else {
        alert("Error al enviar mensaje ❌");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      alert("No se pudo enviar el mensaje ❌");
    }
  };

  return (
    <div className="bg-[#22222280] mt-10 py-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-pink-600">
          Contáctanos
        </h2>

        <input
          type="text"
          placeholder="Nombre"
          className="w-full border p-3 rounded mb-3"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        />

        <input
          type="email"
          placeholder="Correo"
          className="w-full border p-3 rounded mb-3"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <textarea
          placeholder="Mensaje"
          rows="4"
          className="w-full border p-3 rounded mb-3"
          value={formData.mensaje}
          onChange={(e) =>
            setFormData({ ...formData, mensaje: e.target.value })
          }
        />

        <button
          type="submit"
          className="w-full bg-pink-600 hover:bg-pink-700 text-white p-3 rounded font-bold"
        >
          Enviar Mensaje
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
