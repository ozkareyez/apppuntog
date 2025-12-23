import { useState } from "react";

export default function FormularioEnvio({ onSubmit }) {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-2 mt-3"
    >
      <input
        placeholder="Nombre completo"
        required
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        className="w-full border px-2 py-1"
      />

      <input
        placeholder="Teléfono"
        required
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
        className="w-full border px-2 py-1"
      />

      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full border px-2 py-1"
      />

      <input
        placeholder="Dirección"
        required
        value={form.direccion}
        onChange={(e) => setForm({ ...form, direccion: e.target.value })}
        className="w-full border px-2 py-1"
      />

      <input
        placeholder="Ciudad"
        required
        value={form.ciudad}
        onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
        className="w-full border px-2 py-1"
      />

      <button className="w-full bg-green-600 text-white py-2 rounded">
        Enviar pedido
      </button>
    </form>
  );
}
