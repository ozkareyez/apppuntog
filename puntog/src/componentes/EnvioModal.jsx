import { X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

const departamentos = {
  Valle: ["Cali", "Palmira", "Jamundí"],
  Antioquia: ["Medellín", "Envigado"],
  Cundinamarca: ["Bogotá", "Soacha"],
};

export default function EnvioModal({ cerrar }) {
  const { cart, subtotal, envio, totalFinal, setCiudad, clearCart } = useCart();

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
    departamento: "",
    ciudad: "",
  });

  const enviarPedido = () => {
    const mensaje = `
🖤 Pedido Punto G

Nombre: ${form.nombre}
Teléfono: ${form.telefono}
Dirección: ${form.direccion}
Departamento: ${form.departamento}
Ciudad: ${form.ciudad}

Productos:
${cart.map((p) => `• ${p.nombre} x${p.quantity}`).join("\n")}

Subtotal: $${subtotal.toLocaleString()}
Envío: $${envio.toLocaleString()}
TOTAL: $${totalFinal.toLocaleString()}
`;

    window.open(
      `https://wa.me/573147041149?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );

    clearCart();
    cerrar();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur"
        onClick={cerrar}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md bg-black text-white p-6 rounded-xl border border-pink-500/40">
        <button onClick={cerrar} className="absolute top-3 right-3">
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 text-pink-400">Datos de envío</h2>

        <div className="space-y-3">
          <input
            placeholder="Nombre completo"
            className="input"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <input
            placeholder="Teléfono"
            className="input"
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          />

          <input
            placeholder="Dirección"
            className="input"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />

          {/* DEPARTAMENTO */}
          <select
            className="input"
            value={form.departamento}
            onChange={(e) => {
              setForm({
                ...form,
                departamento: e.target.value,
                ciudad: "",
              });
            }}
          >
            <option value="">Departamento</option>
            {Object.keys(departamentos).map((dep) => (
              <option key={dep}>{dep}</option>
            ))}
          </select>

          {/* CIUDAD */}
          <select
            className="input"
            value={form.ciudad}
            disabled={!form.departamento}
            onChange={(e) => {
              setForm({ ...form, ciudad: e.target.value });
              setCiudad(e.target.value);
            }}
          >
            <option value="">Ciudad</option>
            {departamentos[form.departamento]?.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* RESUMEN */}
        <div className="mt-4 text-sm text-gray-300">
          <p>Subtotal: ${subtotal.toLocaleString()}</p>
          <p>Envío: ${envio.toLocaleString()}</p>
          <p className="text-lg font-bold text-white">
            Total: ${totalFinal.toLocaleString()}
          </p>
        </div>

        <button
          onClick={enviarPedido}
          className="w-full mt-4 bg-pink-600 hover:bg-pink-700 py-2 rounded-lg font-semibold"
        >
          Enviar pedido por WhatsApp
        </button>
      </div>
    </div>
  );
}
